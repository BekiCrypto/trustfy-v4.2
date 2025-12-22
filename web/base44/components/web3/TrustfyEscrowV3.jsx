// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TrustfyEscrowV3
 * @dev P2P escrow with symmetric dispute bonds, per-asset bond pools, and pooled fees
 */
contract TrustfyEscrowV3 is ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    enum EscrowStatus {
        NONE,
        CREATED,
        FUNDED,
        IN_PROGRESS,
        DISPUTED,
        COMPLETED,
        REFUNDED,
        CANCELLED
    }

    enum DisputeRuling {
        NONE,
        BUYER_WINS,
        SELLER_WINS
    }

    struct Escrow {
        address seller;
        address buyer;
        address token;        // ERC20 token address, ignored for native
        uint256 amount;       // trade amount
        uint256 createdAt;
        uint256 expiresAt;
        uint256 makerFeeBps;
        uint256 takerFeeBps;
        EscrowStatus status;
        bool isNative;

        uint256 bondAmount;        // per side
        bool sellerBondLocked;
        bool buyerBondLocked;
    }

    struct Dispute {
        address initiator;
        uint256 createdAt;
        DisputeRuling ruling;
        address arbitrator;
        string reason;
    }

    // tradeId => escrow and dispute
    mapping(string => Escrow) public escrows;
    mapping(string => Dispute) public disputes;

    // user => token => bond credit balance
    mapping(address => mapping(address => uint256)) public bondCredits;

    // token => accumulated trading fees for platform
    mapping(address => uint256) public platformFeePool;

    // token => accumulated bond revenue for platform (loser bonds)
    mapping(address => uint256) public platformBondRevenue;

    // token => bond withdrawal threshold for users
    mapping(address => uint256) public bondWithdrawalThreshold;

    address public platformWallet;
    uint16 public bondBps;   // bond as basis points of trade amount
    uint256 public minBond;  // minimum bond size per trade

    event EscrowCreated(
        string indexed tradeId,
        address indexed seller,
        address indexed buyer,
        address token,
        uint256 amount,
        bool isNative
    );

    event EscrowFunded(
        string indexed tradeId,
        uint256 tradeAmount,
        uint256 feeAmount,
        uint256 bondAmount,
        uint256 bondFromCredits,
        uint256 bondFromWallet
    );

    event PaymentConfirmed(
        string indexed tradeId,
        address indexed buyer,
        uint256 bondAmount,
        uint256 bondFromCredits,
        uint256 bondFromWallet
    );

    event FundsReleased(
        string indexed tradeId,
        address indexed recipient,
        uint256 amount
    );

    event TradeRefunded(
        string indexed tradeId,
        address indexed seller,
        uint256 amount,
        uint256 feesToSeller,
        uint256 bondCredited
    );

    event TradeCancelled(string indexed tradeId);

    event DisputeInitiated(
        string indexed tradeId,
        address indexed initiator,
        string reason
    );

    event DisputeResolved(
        string indexed tradeId,
        DisputeRuling ruling
    );

    event BondCreditWithdrawn(
        address indexed user,
        address indexed token,
        uint256 amount
    );

    event PlatformProceedsWithdrawn(
        address indexed token,
        uint256 fees,
        uint256 bondRevenue
    );

    constructor(
        address _platformWallet,
        uint16 _bondBps,
        uint256 _minBond
    ) {
        require(_platformWallet != address(0), "Platform wallet zero");
        platformWallet = _platformWallet;
        bondBps = _bondBps;
        minBond = _minBond;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ARBITRATOR_ROLE, msg.sender);
    }

    modifier onlyParticipant(string memory tradeId) {
        Escrow storage e = escrows[tradeId];
        require(
            msg.sender == e.seller || msg.sender == e.buyer,
            "Not participant"
        );
        _;
    }

    function setBondConfig(uint16 _bondBps, uint256 _minBond)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        bondBps = _bondBps;
        minBond = _minBond;
    }

    function setBondWithdrawalThreshold(address token, uint256 threshold)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        bondWithdrawalThreshold[token] = threshold;
    }

    function _computeBond(uint256 amount) internal view returns (uint256) {
        uint256 computed = (amount * bondBps) / 10000;
        return computed < minBond ? minBond : computed;
    }

    function _calculateFees(uint256 amount, uint256 makerFeeBps, uint256 takerFeeBps)
        internal
        pure
        returns (uint256)
    {
        return (amount * (makerFeeBps + takerFeeBps)) / 10000;
    }

    function calculateFees(uint256 amount, uint256 makerFeeBps, uint256 takerFeeBps)
        public
        pure
        returns (uint256)
    {
        return _calculateFees(amount, makerFeeBps, takerFeeBps);
    }

    function getBondAmount(uint256 amount) external view returns (uint256) {
        return _computeBond(amount);
    }

    /**
     * @dev Create new escrow record. No funds move here.
     */
    function createEscrow(
        string memory tradeId,
        address buyer,
        address token,
        uint256 amount,
        uint256 timeout,
        uint256 makerFeeBps,
        uint256 takerFeeBps,
        bool isNative
    ) external {
        Escrow storage e = escrows[tradeId];
        require(e.status == EscrowStatus.NONE, "Escrow exists");
        require(buyer != address(0) && buyer != msg.sender, "Buyer invalid");
        require(amount > 0, "Amount invalid");

        uint256 bond = _computeBond(amount);

        escrows[tradeId] = Escrow({
            seller: msg.sender,
            buyer: buyer,
            token: token,
            amount: amount,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + timeout,
            makerFeeBps: makerFeeBps,
            takerFeeBps: takerFeeBps,
            status: EscrowStatus.CREATED,
            isNative: isNative,
            bondAmount: bond,
            sellerBondLocked: false,
            buyerBondLocked: false
        });

        emit EscrowCreated(tradeId, msg.sender, buyer, token, amount, isNative);
    }

    /**
     * @dev Seller funds trade amount, fee and seller bond.
     * Uses seller bond credit for this token first, then wallet for the remainder.
     */
    function fundEscrow(string memory tradeId)
        external
        payable
        nonReentrant
    {
        Escrow storage e = escrows[tradeId];
        require(e.status == EscrowStatus.CREATED, "Wrong status");
        require(msg.sender == e.seller, "Only seller");
        require(block.timestamp < e.expiresAt, "Escrow expired");

        uint256 fees = _calculateFees(e.amount, e.makerFeeBps, e.takerFeeBps);
        uint256 bond = e.bondAmount;
        address tokenKey = e.isNative ? address(0) : e.token;

        // use seller bond credits first
        uint256 availableCredit = bondCredits[e.seller][tokenKey];
        uint256 fromCredit = availableCredit >= bond ? bond : availableCredit;
        uint256 fromWalletBond = bond - fromCredit;

        if (fromCredit > 0) {
            bondCredits[e.seller][tokenKey] = availableCredit - fromCredit;
        }

        if (e.isNative) {
            // value must cover trade amount + fees + bond from wallet
            uint256 neededValue = e.amount + fees + fromWalletBond;
            require(msg.value == neededValue, "Native amount mismatch");
        } else {
            // ERC20: seller transfers amount + fees + bond from wallet
            uint256 neededToken = e.amount + fees + fromWalletBond;
            IERC20(e.token).safeTransferFrom(
                msg.sender,
                address(this),
                neededToken
            );
        }

        platformFeePool[tokenKey] += fees;
        e.status = EscrowStatus.FUNDED;
        e.sellerBondLocked = true;

        emit EscrowFunded(tradeId, e.amount, fees, bond, fromCredit, fromWalletBond);
    }

    /**
     * @dev Buyer confirms off-chain payment + locks bond.
     * Uses bond credit first, then wallet.
     */
    function confirmPayment(string memory tradeId)
        external
        payable
        nonReentrant
        onlyParticipant(tradeId)
    {
        Escrow storage e = escrows[tradeId];
        require(e.status == EscrowStatus.FUNDED, "Not funded");
        require(msg.sender == e.buyer, "Only buyer");
        require(block.timestamp < e.expiresAt, "Escrow expired");
        require(e.sellerBondLocked, "Seller bond missing");

        uint256 bond = e.bondAmount;
        address tokenKey = e.isNative ? address(0) : e.token;

        uint256 availableCredit = bondCredits[e.buyer][tokenKey];
        uint256 fromCredit = availableCredit >= bond ? bond : availableCredit;
        uint256 fromWalletBond = bond - fromCredit;

        if (fromCredit > 0) {
            bondCredits[e.buyer][tokenKey] = availableCredit - fromCredit;
        }

        if (e.isNative) {
            require(msg.value == fromWalletBond, "Native bond amount mismatch");
        } else {
            if (fromWalletBond > 0) {
                IERC20(e.token).safeTransferFrom(
                    msg.sender,
                    address(this),
                    fromWalletBond
                );
            }
        }

        e.buyerBondLocked = true;
        e.status = EscrowStatus.IN_PROGRESS;

        emit PaymentConfirmed(tradeId, msg.sender, bond, fromCredit, fromWalletBond);
    }

    /**
     * @dev Seller releases funds to buyer, both bonds credited.
     */
    function releaseFunds(string memory tradeId)
        external
        nonReentrant
        onlyParticipant(tradeId)
    {
        Escrow storage e = escrows[tradeId];
        require(e.status == EscrowStatus.IN_PROGRESS, "Not in progress");
        require(msg.sender == e.seller, "Only seller");
        require(e.sellerBondLocked && e.buyerBondLocked, "Bond missing");

        address tokenKey = e.isNative ? address(0) : e.token;

        // credit both bonds back
        bondCredits[e.seller][tokenKey] += e.bondAmount;
        bondCredits[e.buyer][tokenKey] += e.bondAmount;

        e.status = EscrowStatus.COMPLETED;

        if (e.isNative) {
            payable(e.buyer).transfer(e.amount);
        } else {
            IERC20(e.token).safeTransfer(e.buyer, e.amount);
        }

        emit FundsReleased(tradeId, e.buyer, e.amount);
    }

    /**
     * @dev Initiate dispute.
     */
    function initiateDispute(string memory tradeId, string memory reason)
        external
        onlyParticipant(tradeId)
    {
        Escrow storage e = escrows[tradeId];
        require(
            e.status == EscrowStatus.IN_PROGRESS,
            "Invalid status"
        );
        require(disputes[tradeId].createdAt == 0, "Dispute exists");
        require(e.sellerBondLocked && e.buyerBondLocked, "Bonds not locked");

        e.status = EscrowStatus.DISPUTED;

        disputes[tradeId] = Dispute({
            initiator: msg.sender,
            createdAt: block.timestamp,
            ruling: DisputeRuling.NONE,
            arbitrator: address(0),
            reason: reason
        });

        emit DisputeInitiated(tradeId, msg.sender, reason);
    }

    /**
     * @dev Arbitrator resolves dispute.
     * Winner gets trade amount + both bonds credited.
     * Loser bond goes to platform bond revenue.
     */
    function resolveDispute(
        string memory tradeId,
        DisputeRuling ruling
    ) external onlyRole(ARBITRATOR_ROLE) nonReentrant {
        Escrow storage e = escrows[tradeId];
        Dispute storage d = disputes[tradeId];

        require(e.status == EscrowStatus.DISPUTED, "Not disputed");
        require(
            ruling == DisputeRuling.BUYER_WINS || ruling == DisputeRuling.SELLER_WINS,
            "Invalid ruling"
        );

        d.ruling = ruling;
        d.arbitrator = msg.sender;

        address tokenKey = e.isNative ? address(0) : e.token;

        if (ruling == DisputeRuling.BUYER_WINS) {
            e.status = EscrowStatus.REFUNDED;

            // buyer gets trade amount + their bond credited
            bondCredits[e.buyer][tokenKey] += e.bondAmount;

            // seller loses bond => platform revenue
            platformBondRevenue[tokenKey] += e.bondAmount;

            if (e.isNative) {
                payable(e.buyer).transfer(e.amount);
            } else {
                IERC20(e.token).safeTransfer(e.buyer, e.amount);
            }
        } else {
            e.status = EscrowStatus.COMPLETED;

            // seller gets their bond credited
            bondCredits[e.seller][tokenKey] += e.bondAmount;

            // buyer loses bond => platform revenue
            platformBondRevenue[tokenKey] += e.bondAmount;

            // buyer still gets trade amount
            if (e.isNative) {
                payable(e.buyer).transfer(e.amount);
            } else {
                IERC20(e.token).safeTransfer(e.buyer, e.amount);
            }
        }

        emit DisputeResolved(tradeId, ruling);
    }

    /**
     * @dev Refund if expired and buyer never locked bond.
     */
    function refund(string memory tradeId) external nonReentrant {
        Escrow storage e = escrows[tradeId];
        require(msg.sender == e.seller, "Only seller");
        require(
            (e.status == EscrowStatus.FUNDED && block.timestamp > e.expiresAt && !e.buyerBondLocked),
            "Cannot refund"
        );

        uint256 fees = _calculateFees(e.amount, e.makerFeeBps, e.takerFeeBps);
        address tokenKey = e.isNative ? address(0) : e.token;

        // credit seller bond, return trade amount + fees
        bondCredits[e.seller][tokenKey] += e.bondAmount;

        // fees already in pool, now return to seller
        platformFeePool[tokenKey] -= fees;

        if (e.isNative) {
            payable(e.seller).transfer(e.amount + fees);
        } else {
            IERC20(e.token).safeTransfer(e.seller, e.amount + fees);
        }

        e.status = EscrowStatus.REFUNDED;
        emit TradeRefunded(tradeId, e.seller, e.amount, fees, e.bondAmount);
    }

    /**
     * @dev Cancel trade before funding.
     */
    function cancelTrade(string memory tradeId) external onlyParticipant(tradeId) {
        Escrow storage e = escrows[tradeId];
        require(e.status == EscrowStatus.CREATED, "Already funded");
        
        e.status = EscrowStatus.CANCELLED;
        emit TradeCancelled(tradeId);
    }

    /**
     * @dev Withdraw bond credits.
     */
    function withdrawBondCredits(address token, uint256 amount)
        external
        nonReentrant
    {
        address tokenKey = token == address(0) ? address(0) : token;
        uint256 balance = bondCredits[msg.sender][tokenKey];

        require(amount > 0, "Zero amount");
        require(balance >= amount, "Insufficient bond credits");

        uint256 threshold = bondWithdrawalThreshold[tokenKey];
        require(balance >= threshold, "Below withdrawal threshold");

        bondCredits[msg.sender][tokenKey] = balance - amount;

        if (tokenKey == address(0)) {
            payable(msg.sender).transfer(amount);
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit BondCreditWithdrawn(msg.sender, tokenKey, amount);
    }

    /**
     * @dev Admin withdraws platform proceeds.
     */
    function withdrawPlatformProceeds(address token)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
        nonReentrant
    {
        address tokenKey = token == address(0) ? address(0) : token;

        uint256 fees = platformFeePool[tokenKey];
        uint256 bondRev = platformBondRevenue[tokenKey];
        uint256 total = fees + bondRev;

        require(total > 0, "No proceeds");

        platformFeePool[tokenKey] = 0;
        platformBondRevenue[tokenKey] = 0;

        if (tokenKey == address(0)) {
            payable(platformWallet).transfer(total);
        } else {
            IERC20(token).safeTransfer(platformWallet, total);
        }

        emit PlatformProceedsWithdrawn(tokenKey, fees, bondRev);
    }

    /**
     * @dev Get escrow details.
     */
    function getEscrowStatus(string memory tradeId) external view returns (
        EscrowStatus status,
        uint256 amount,
        uint256 expiresAt,
        address seller,
        address buyer,
        uint256 bondAmount,
        bool sellerBondLocked,
        bool buyerBondLocked
    ) {
        Escrow memory e = escrows[tradeId];
        return (
            e.status,
            e.amount,
            e.expiresAt,
            e.seller,
            e.buyer,
            e.bondAmount,
            e.sellerBondLocked,
            e.buyerBondLocked
        );
    }

    function addArbitrator(address arbitrator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ARBITRATOR_ROLE, arbitrator);
    }
    
    function removeArbitrator(address arbitrator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ARBITRATOR_ROLE, arbitrator);
    }
    
    receive() external payable {}
}