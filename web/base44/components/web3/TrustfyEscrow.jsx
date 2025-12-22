// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TrustfyEscrowV2
 * @dev P2P escrow with symmetric dispute bonds for buyer and seller
 */
contract TrustfyEscrowV2 is ReentrancyGuard, AccessControl {
    using SafeERC20 for IERC20;

    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    enum EscrowStatus {
        NONE,
        CREATED,
        FUNDED,
        IN_PROGRESS,
        COMPLETED,
        DISPUTED,
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
        address token;
        uint256 amount;
        uint256 createdAt;
        uint256 expiresAt;
        uint256 makerFeeBps;
        uint256 takerFeeBps;
        EscrowStatus status;
        bool isNative;

        uint256 bondAmount;          // bond required for each side
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

    mapping(string => Escrow) public escrows;
    mapping(string => Dispute) public disputes;

    address public platformWallet;

    // global bond settings
    uint16 public bondBps;      // bond as basis points of trade amount
    uint256 public minBond;     // minimum bond in token or native
    
    event EscrowCreated(
        string indexed tradeId,
        address indexed seller,
        address indexed buyer,
        uint256 amount,
        address token
    );
    event EscrowFunded(string indexed tradeId, uint256 totalDeposit);
    event PaymentConfirmed(string indexed tradeId, address indexed buyer, uint256 bondAmount);
    event FundsReleased(string indexed tradeId, address indexed recipient, uint256 amount);
    event TradeCancelled(string indexed tradeId);
    event Refunded(string indexed tradeId, address indexed seller, uint256 amount);
    event DisputeInitiated(string indexed tradeId, address indexed initiator, string reason);
    event DisputeResolved(string indexed tradeId, DisputeRuling ruling);

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

    /**
     * @dev Admin update for bond settings
     */
    function setBondConfig(uint16 _bondBps, uint256 _minBond)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        bondBps = _bondBps;
        minBond = _minBond;
    }

    /**
     * @dev Compute bond amount from trade amount
     */
    function _computeBond(uint256 amount) internal view returns (uint256) {
        uint256 computed = (amount * bondBps) / 10000;
        return computed < minBond ? minBond : computed;
    }

    /**
     * @dev Create new escrow record, no funds yet
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

        emit EscrowCreated(tradeId, msg.sender, buyer, amount, token);
    }
    
    /**
     * @dev Seller funds trade amount, trade fees and seller bond
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
        uint256 totalRequired = e.amount + fees + e.bondAmount;

        if (e.isNative) {
            require(msg.value == totalRequired, "Native amount mismatch");
        } else {
            IERC20(e.token).safeTransferFrom(
                msg.sender,
                address(this),
                totalRequired
            );
        }

        e.status = EscrowStatus.FUNDED;
        e.sellerBondLocked = true;

        emit EscrowFunded(tradeId, totalRequired);
    }

    /**
     * @dev Buyer confirms offchain payment and locks buyer bond
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

        if (e.isNative) {
            require(msg.value == bond, "Bond amount mismatch");
        } else {
            IERC20(e.token).safeTransferFrom(
                msg.sender,
                address(this),
                bond
            );
        }

        e.buyerBondLocked = true;
        e.status = EscrowStatus.IN_PROGRESS;

        emit PaymentConfirmed(tradeId, msg.sender, bond);
    }
    
    /**
     * @dev Seller releases funds to buyer, both bonds refunded
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

        e.status = EscrowStatus.COMPLETED;

        uint256 fees = _calculateFees(e.amount, e.makerFeeBps, e.takerFeeBps);

        if (e.isNative) {
            payable(e.buyer).transfer(e.amount);
            payable(platformWallet).transfer(fees);
            payable(e.seller).transfer(e.bondAmount);
            payable(e.buyer).transfer(e.bondAmount);
        } else {
            IERC20(e.token).safeTransfer(e.buyer, e.amount);
            IERC20(e.token).safeTransfer(platformWallet, fees);
            IERC20(e.token).safeTransfer(e.seller, e.bondAmount);
            IERC20(e.token).safeTransfer(e.buyer, e.bondAmount);
        }

        emit FundsReleased(tradeId, e.buyer, e.amount);
    }
    
    /**
     * @dev Initiate dispute (no fee in V2, bonds are the stake)
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
     * @dev Arbitrator resolves dispute - winner gets both bonds
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

        uint256 fees = _calculateFees(e.amount, e.makerFeeBps, e.takerFeeBps);
        uint256 bothBonds = e.bondAmount * 2;

        if (ruling == DisputeRuling.BUYER_WINS) {
            e.status = EscrowStatus.REFUNDED;

            if (e.isNative) {
                payable(e.buyer).transfer(e.amount + bothBonds);
                payable(platformWallet).transfer(fees);
            } else {
                IERC20(e.token).safeTransfer(e.buyer, e.amount + bothBonds);
                IERC20(e.token).safeTransfer(platformWallet, fees);
            }
        } else {
            e.status = EscrowStatus.COMPLETED;

            if (e.isNative) {
                payable(e.seller).transfer(bothBonds);
                payable(e.buyer).transfer(e.amount);
                payable(platformWallet).transfer(fees);
            } else {
                IERC20(e.token).safeTransfer(e.seller, bothBonds);
                IERC20(e.token).safeTransfer(e.buyer, e.amount);
                IERC20(e.token).safeTransfer(platformWallet, fees);
            }
        }

        emit DisputeResolved(tradeId, ruling);
    }
    
    /**
     * @dev Refund if expired and buyer never locked bond
     */
    function refund(string memory tradeId) external nonReentrant {
        Escrow storage e = escrows[tradeId];
        require(msg.sender == e.seller, "Only seller");
        require(
            (e.status == EscrowStatus.FUNDED && block.timestamp > e.expiresAt && !e.buyerBondLocked),
            "Cannot refund"
        );

        uint256 fees = _calculateFees(e.amount, e.makerFeeBps, e.takerFeeBps);
        uint256 refundTotal = e.amount + fees + e.bondAmount;

        if (e.isNative) {
            payable(e.seller).transfer(refundTotal);
        } else {
            IERC20(e.token).safeTransfer(e.seller, refundTotal);
        }

        e.status = EscrowStatus.REFUNDED;
        emit Refunded(tradeId, e.seller, refundTotal);
    }
    
    /**
     * @dev Cancel trade before funding
     */
    function cancelTrade(string memory tradeId) external onlyParticipant(tradeId) {
        Escrow storage escrow = escrows[tradeId];
        require(escrow.status == EscrowStatus.CREATED, "Already funded");
        
        escrow.status = EscrowStatus.CANCELLED;
        emit TradeCancelled(tradeId);
    }
    
    /**
     * @dev Get escrow details
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

    /**
     * @dev Calculate total fees (internal)
     */
    function _calculateFees(uint256 amount, uint256 makerFeeBps, uint256 takerFeeBps)
        internal
        pure
        returns (uint256)
    {
        return (amount * (makerFeeBps + takerFeeBps)) / 10000;
    }

    /**
     * @dev Calculate fees (public view)
     */
    function calculateFees(uint256 amount, uint256 makerFeeBps, uint256 takerFeeBps)
        public
        pure
        returns (uint256)
    {
        return _calculateFees(amount, makerFeeBps, takerFeeBps);
    }

    /**
     * @dev Get bond amount for a trade amount
     */
    function getBondAmount(uint256 amount) external view returns (uint256) {
        return _computeBond(amount);
    }
    
    /**
     * @dev Add arbitrator
     */
    function addArbitrator(address arbitrator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(ARBITRATOR_ROLE, arbitrator);
    }
    
    /**
     * @dev Remove arbitrator
     */
    function removeArbitrator(address arbitrator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(ARBITRATOR_ROLE, arbitrator);
    }
    
    receive() external payable {}
}