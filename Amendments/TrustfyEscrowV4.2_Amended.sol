// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
TrustfyEscrow V4.3 Amended (Ads + Escrows)

Key rules enforced on-chain:
- Supports Sell Ads and Buy Ads.
- AdBond: only Ad poster locks at createAd. AdBond is paid in the same token as the Ad's trade token.
- DisputeBond: symmetric and mandatory for BOTH parties per trade.
  * Buyer locks buyer DisputeBond at takeAd (TAKEN).
  * Seller locks seller DisputeBond at fundEscrow (FUNDED).
- Fees: MakerFeeBps and TakerFeeBps are tracked separately for analytics. On-chain they are summed and enforced as one FeeAmount.
- FeeAmount is locked by the crypto seller at FUNDED and transferred to Treasury on completion.
- Buyer receives principal to wallet on successful completion.
- Bond refunds return to Credit Wallet (internal ledger) except forfeitures and fees which go to Treasury.
- One active reservation per Ad at a time.
- One dispute per Escrow at most.
- Dispute can be opened only after PAYMENT_CONFIRMED.
- Time windows:
  * sellerFundWindow starts at TAKEN
  * buyerConfirmWindow starts at FUNDED
  * sellerReleaseWindow starts at PAYMENT_CONFIRMED (used as a UI gate for buyer dispute)
- Penalties:
  * Seller misses funding window: buyer DisputeBond refunded; AdBond forfeited only if maker is the funding party (sell ad).
  * Buyer misses confirm window: buyer DisputeBond forfeited 100% to Treasury; seller funds refunded to seller wallet; Ad reopens.
  * Dispute resolution: winner DisputeBond refunded; loser DisputeBond forfeited 100% to Treasury.
*/

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        bool ok = token.transfer(to, value);
        require(ok, "SAFE_TRANSFER_FAILED");
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        bool ok = token.transferFrom(from, to, value);
        require(ok, "SAFE_TRANSFER_FROM_FAILED");
    }
}

contract TrustfyEscrowV4_2_Amended {
    using SafeERC20 for IERC20;

    // -------------------------
    // Roles
    // -------------------------
    address public owner;
    mapping(address => bool) public isAdmin;
    mapping(address => bool) public isArbitrator;

    // -------------------------
    // Treasury
    // -------------------------
    address public treasury;

    // -------------------------
    // Config per token
    // -------------------------
    struct TokenConfig {
        bool enabled;

        // Fees are split for analytics and reporting.
        // On-chain, makerFeeBps + takerFeeBps is enforced as a single FeeAmount.
        uint16 makerFeeBps;
        uint16 takerFeeBps;

        // Bonds in bps of base trade amount.
        uint16 disputeBondBps;
        uint16 adBondBps;

        // Time windows (seconds)
        uint32 sellerFundWindow;
        uint32 buyerConfirmWindow;
        uint32 sellerReleaseWindow;
    }

    mapping(address => TokenConfig) public tokenConfig;

    // -------------------------
    // Credit Wallet (internal ledger)
    // -------------------------
    mapping(address => mapping(address => uint256)) public creditBalance; // user => token => amount

    // -------------------------
    // Ads and Escrows
    // -------------------------
    enum AdState { CREATED, TAKEN, CANCELLED, COMPLETED }
    enum EscrowStatus { CREATED, TAKEN, FUNDED, PAYMENT_CONFIRMED, DISPUTED, RESOLVED, CANCELLED }
    enum DisputeOutcome { BUYER_WINS, SELLER_WINS }

    struct Ad {
        address maker;
        bool isSellAd;     // true: maker sells crypto. false: maker buys crypto
        address token;
        uint256 amount;    // base principal for escrow
        uint256 adBond;    // locked at creation
        AdState state;
        uint256 activeEscrowId; // 0 if none
    }

    struct Escrow {
        uint256 adId;
        address buyer;  // fiat payer, receives crypto
        address seller; // crypto provider, receives fiat off-chain
        address token;
        uint256 amount;
        uint256 feeAmount;
        uint256 buyerDisputeBond;
        uint256 sellerDisputeBond;
        EscrowStatus status;

        uint256 takenAt;
        uint256 fundedAt;
        uint256 paymentConfirmedAt;

        bool disputeOpened;
        bool disputeResolved;
    }

    uint256 public nextAdId = 1;
    uint256 public nextEscrowId = 1;

    mapping(uint256 => Ad) public ads;
    mapping(uint256 => Escrow) public escrows;

    // -------------------------
    // Events
    // -------------------------
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    event AdminSet(address indexed account, bool enabled);
    event ArbitratorSet(address indexed account, bool enabled);
    event TreasurySet(address indexed treasury);

    event TokenConfigSet(
        address indexed token,
        bool enabled,
        uint16 makerFeeBps,
        uint16 takerFeeBps,
        uint16 disputeBondBps,
        uint16 adBondBps,
        uint32 sellerFundWindow,
        uint32 buyerConfirmWindow,
        uint32 sellerReleaseWindow
    );

    event CreditAdded(address indexed user, address indexed token, uint256 amount, bytes32 ref);
    event CreditWithdrawn(address indexed user, address indexed token, uint256 amount);

    event AdCreated(uint256 indexed adId, address indexed maker, bool isSellAd, address indexed token, uint256 amount, uint256 adBond);
    event AdEdited(uint256 indexed adId, uint256 newAmount);
    event AdCancelled(uint256 indexed adId);
    event AdCompleted(uint256 indexed adId);

    event EscrowTaken(uint256 indexed escrowId, uint256 indexed adId, address indexed buyer, address seller, uint256 buyerDisputeBond);
    event EscrowFunded(uint256 indexed escrowId, uint256 amount, uint256 feeAmount, uint256 sellerDisputeBond);
    event PaymentConfirmed(uint256 indexed escrowId, address indexed buyer);
    event EscrowReleased(uint256 indexed escrowId);
    event EscrowCancelled(uint256 indexed escrowId, string reason);

    event DisputeOpened(uint256 indexed escrowId, address indexed opener);
    event DisputeResolved(uint256 indexed escrowId, DisputeOutcome outcome);

    // -------------------------
    // Revert strings
    // -------------------------
    string private constant ERR_NOT_OWNER = "NOT_OWNER";
    string private constant ERR_NOT_ADMIN = "NOT_ADMIN";
    string private constant ERR_NOT_ARBITRATOR = "NOT_ARBITRATOR";
    string private constant ERR_TOKEN_DISABLED = "TOKEN_DISABLED";
    string private constant ERR_BAD_BPS = "BAD_BPS";
    string private constant ERR_BAD_STATE = "BAD_STATE";
    string private constant ERR_NOT_MAKER = "NOT_MAKER";
    string private constant ERR_NOT_BUYER = "NOT_BUYER";
    string private constant ERR_NOT_SELLER = "NOT_SELLER";
    string private constant ERR_ALREADY_TAKEN = "ALREADY_TAKEN";
    string private constant ERR_WINDOW_NOT_EXPIRED = "WINDOW_NOT_EXPIRED";
    string private constant ERR_WINDOW_EXPIRED = "WINDOW_EXPIRED";
    string private constant ERR_DISPUTE_EXISTS = "DISPUTE_EXISTS";
    string private constant ERR_ESCROW_MISMATCH = "ESCROW_MISMATCH";

    // -------------------------
    // Modifiers
    // -------------------------
    modifier onlyOwner() {
        require(msg.sender == owner, ERR_NOT_OWNER);
        _;
    }

    modifier onlyAdminOrOwner() {
        require(msg.sender == owner || isAdmin[msg.sender], ERR_NOT_ADMIN);
        _;
    }

    modifier onlyArbitrator() {
        require(isArbitrator[msg.sender], ERR_NOT_ARBITRATOR);
        _;
    }

    constructor(address treasury_) {
        require(treasury_ != address(0), "ZERO_TREASURY");
        owner = msg.sender;
        treasury = treasury_;
        emit TreasurySet(treasury_);
    }

    // -------------------------
    // Admin controls
    // -------------------------
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO_OWNER");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setAdmin(address account, bool enabled) external onlyOwner {
        isAdmin[account] = enabled;
        emit AdminSet(account, enabled);
    }

    function setArbitrator(address account, bool enabled) external onlyAdminOrOwner {
        isArbitrator[account] = enabled;
        emit ArbitratorSet(account, enabled);
    }

    function setTreasury(address treasury_) external onlyOwner {
        require(treasury_ != address(0), "ZERO_TREASURY");
        treasury = treasury_;
        emit TreasurySet(treasury_);
    }

    function setTokenConfig(address token, TokenConfig calldata cfg) external onlyAdminOrOwner {
        require(token != address(0), "ZERO_TOKEN");
        require(cfg.makerFeeBps <= 10_000 && cfg.takerFeeBps <= 10_000, ERR_BAD_BPS);
        require(cfg.disputeBondBps <= 10_000 && cfg.adBondBps <= 10_000, ERR_BAD_BPS);
        tokenConfig[token] = cfg;

        emit TokenConfigSet(
            token,
            cfg.enabled,
            cfg.makerFeeBps,
            cfg.takerFeeBps,
            cfg.disputeBondBps,
            cfg.adBondBps,
            cfg.sellerFundWindow,
            cfg.buyerConfirmWindow,
            cfg.sellerReleaseWindow
        );
    }

    // -------------------------
    // Credit wallet operations
    // -------------------------
    function withdrawCredit(address token, uint256 amount) external {
        require(token != address(0), "ZERO_TOKEN");
        require(amount > 0, "ZERO_AMOUNT");
        uint256 bal = creditBalance[msg.sender][token];
        require(bal >= amount, "INSUFFICIENT_CREDIT");
        creditBalance[msg.sender][token] = bal - amount;
        IERC20(token).safeTransfer(msg.sender, amount);
        emit CreditWithdrawn(msg.sender, token, amount);
    }

    // Optional admin credit injection hook
    function adminAddCredit(address user, address token, uint256 amount, bytes32 ref) external onlyAdminOrOwner {
        require(user != address(0), "ZERO_USER");
        require(token != address(0), "ZERO_TOKEN");
        require(amount > 0, "ZERO_AMOUNT");
        creditBalance[user][token] += amount;
        emit CreditAdded(user, token, amount, ref);
    }

    // -------------------------
    // Helpers
    // -------------------------
    function _cfg(address token) internal view returns (TokenConfig memory cfg) {
        cfg = tokenConfig[token];
        require(cfg.enabled, ERR_TOKEN_DISABLED);
    }

    function _feeAmount(address token, uint256 amount) internal view returns (uint256) {
        TokenConfig memory cfg = _cfg(token);
        uint256 bps = uint256(cfg.makerFeeBps) + uint256(cfg.takerFeeBps);
        return (amount * bps) / 10_000;
    }

    function _disputeBond(address token, uint256 amount) internal view returns (uint256) {
        TokenConfig memory cfg = _cfg(token);
        return (amount * uint256(cfg.disputeBondBps)) / 10_000;
    }

    function _adBond(address token, uint256 amount) internal view returns (uint256) {
        TokenConfig memory cfg = _cfg(token);
        return (amount * uint256(cfg.adBondBps)) / 10_000;
    }

    function _buyerOfAd(Ad memory ad, address taker) internal pure returns (address) {
        // Sell ad: maker sells, taker buys
        // Buy ad: maker buys, taker sells
        return ad.isSellAd ? taker : ad.maker;
    }

    function _sellerOfAd(Ad memory ad, address taker) internal pure returns (address) {
        return ad.isSellAd ? ad.maker : taker;
    }

    function _makerIsFundingParty(Ad memory ad) internal pure returns (bool) {
        // Funding party is the crypto seller.
        // Sell ad: maker is seller.
        // Buy ad: taker is seller.
        return ad.isSellAd;
    }

    // -------------------------
    // Ad functions
    // -------------------------
    function createAd(bool isSellAd, address token, uint256 amount) external returns (uint256 adId) {
        require(token != address(0), "ZERO_TOKEN");
        require(amount > 0, "ZERO_AMOUNT");
        _cfg(token); // require enabled

        uint256 bond = _adBond(token, amount);
        if (bond > 0) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), bond);
        }

        adId = nextAdId++;
        ads[adId] = Ad({
            maker: msg.sender,
            isSellAd: isSellAd,
            token: token,
            amount: amount,
            adBond: bond,
            state: AdState.CREATED,
            activeEscrowId: 0
        });

        emit AdCreated(adId, msg.sender, isSellAd, token, amount, bond);
    }

    function editAd(uint256 adId, uint256 newAmount) external {
        Ad storage ad = ads[adId];
        require(ad.maker != address(0), "AD_NOT_FOUND");
        require(msg.sender == ad.maker, ERR_NOT_MAKER);
        require(ad.state == AdState.CREATED, ERR_BAD_STATE);
        require(ad.activeEscrowId == 0, ERR_BAD_STATE);
        require(newAmount > 0, "ZERO_AMOUNT");
        ad.amount = newAmount;
        emit AdEdited(adId, newAmount);
    }

    function cancelAd(uint256 adId) external {
        Ad storage ad = ads[adId];
        require(ad.maker != address(0), "AD_NOT_FOUND");
        require(msg.sender == ad.maker, ERR_NOT_MAKER);
        require(ad.state == AdState.CREATED, ERR_BAD_STATE);
        require(ad.activeEscrowId == 0, ERR_BAD_STATE);

        ad.state = AdState.CANCELLED;

        // Forfeit AdBond to treasury
        if (ad.adBond > 0) {
            IERC20(ad.token).safeTransfer(treasury, ad.adBond);
            ad.adBond = 0;
        }

        emit AdCancelled(adId);
    }

    // -------------------------
    // Take flow (buyer locks DisputeBond)
    // -------------------------
    function takeAd(uint256 adId) external returns (uint256 escrowId) {
        Ad storage ad = ads[adId];
        require(ad.maker != address(0), "AD_NOT_FOUND");
        require(ad.state == AdState.CREATED, ERR_BAD_STATE);
        require(ad.activeEscrowId == 0, ERR_ALREADY_TAKEN);

        address buyer = _buyerOfAd(ad, msg.sender);
        address seller = _sellerOfAd(ad, msg.sender);

        // Disallow maker taking own ad
        require(buyer != seller, "SELF_TRADE");

        uint256 bond = _disputeBond(ad.token, ad.amount);
        require(bond > 0, "DISPUTE_BOND_ZERO");

        // Buyer locks DisputeBond
        IERC20(ad.token).safeTransferFrom(buyer, address(this), bond);

        // Create escrow
        escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            adId: adId,
            buyer: buyer,
            seller: seller,
            token: ad.token,
            amount: ad.amount,
            feeAmount: 0,
            buyerDisputeBond: bond,
            sellerDisputeBond: 0,
            status: EscrowStatus.TAKEN,
            takenAt: block.timestamp,
            fundedAt: 0,
            paymentConfirmedAt: 0,
            disputeOpened: false,
            disputeResolved: false
        });

        // Update ad
        ad.state = AdState.TAKEN;
        ad.activeEscrowId = escrowId;

        emit EscrowTaken(escrowId, adId, buyer, seller, bond);
    }

    // -------------------------
    // Funding flow (seller locks principal + fees + seller DisputeBond)
    // -------------------------
    function fundEscrow(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.adId != 0, "ESCROW_NOT_FOUND");
        require(e.status == EscrowStatus.TAKEN, ERR_BAD_STATE);
        require(msg.sender == e.seller, ERR_NOT_SELLER);

        Ad storage ad = ads[e.adId];
        require(ad.activeEscrowId == escrowId, ERR_ESCROW_MISMATCH);
        require(ad.state == AdState.TAKEN, ERR_BAD_STATE);

        TokenConfig memory cfg = _cfg(e.token);

        require(block.timestamp <= e.takenAt + uint256(cfg.sellerFundWindow), ERR_WINDOW_EXPIRED);

        uint256 fee = _feeAmount(e.token, e.amount);
        uint256 sellerBond = _disputeBond(e.token, e.amount);
        require(sellerBond > 0, "DISPUTE_BOND_ZERO");

        uint256 total = e.amount + fee + sellerBond;
        IERC20(e.token).safeTransferFrom(msg.sender, address(this), total);

        e.feeAmount = fee;
        e.sellerDisputeBond = sellerBond;
        e.status = EscrowStatus.FUNDED;
        e.fundedAt = block.timestamp;

        emit EscrowFunded(escrowId, e.amount, fee, sellerBond);
    }

    // -------------------------
    // Buyer confirms payment (fiat paid off-chain)
    // -------------------------
    function confirmPayment(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.adId != 0, "ESCROW_NOT_FOUND");
        require(e.status == EscrowStatus.FUNDED, ERR_BAD_STATE);
        require(msg.sender == e.buyer, ERR_NOT_BUYER);

        TokenConfig memory cfg = _cfg(e.token);
        require(block.timestamp <= e.fundedAt + uint256(cfg.buyerConfirmWindow), ERR_WINDOW_EXPIRED);

        e.status = EscrowStatus.PAYMENT_CONFIRMED;
        e.paymentConfirmedAt = block.timestamp;

        emit PaymentConfirmed(escrowId, msg.sender);
    }

    // -------------------------
    // Seller releases escrow (happy path)
    // -------------------------
    function releaseEscrow(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.adId != 0, "ESCROW_NOT_FOUND");
        require(e.status == EscrowStatus.PAYMENT_CONFIRMED, ERR_BAD_STATE);
        require(msg.sender == e.seller, ERR_NOT_SELLER);

        // Principal to buyer wallet
        IERC20(e.token).safeTransfer(e.buyer, e.amount);

        // Fee to treasury
        if (e.feeAmount > 0) {
            IERC20(e.token).safeTransfer(treasury, e.feeAmount);
        }

        // Dispute bonds return to Credit Wallet
        if (e.buyerDisputeBond > 0) {
            creditBalance[e.buyer][e.token] += e.buyerDisputeBond;
            emit CreditAdded(e.buyer, e.token, e.buyerDisputeBond, keccak256(abi.encodePacked("BUYER_DISPUTE_REFUND", escrowId)));
            e.buyerDisputeBond = 0;
        }
        if (e.sellerDisputeBond > 0) {
            creditBalance[e.seller][e.token] += e.sellerDisputeBond;
            emit CreditAdded(e.seller, e.token, e.sellerDisputeBond, keccak256(abi.encodePacked("SELLER_DISPUTE_REFUND", escrowId)));
            e.sellerDisputeBond = 0;
        }

        // AdBond refund to maker credit wallet
        Ad storage ad = ads[e.adId];
        if (ad.adBond > 0) {
            creditBalance[ad.maker][ad.token] += ad.adBond;
            emit CreditAdded(ad.maker, ad.token, ad.adBond, keccak256(abi.encodePacked("AD_BOND_REFUND", e.adId)));
            ad.adBond = 0;
        }

        // Finalize
        e.status = EscrowStatus.RESOLVED;
        ad.state = AdState.COMPLETED;
        ad.activeEscrowId = 0;

        emit EscrowReleased(escrowId);
        emit AdCompleted(e.adId);
    }

    // -------------------------
    // Dispute open (only after PAYMENT_CONFIRMED)
    // -------------------------
    function openDispute(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.adId != 0, "ESCROW_NOT_FOUND");
        require(e.status == EscrowStatus.PAYMENT_CONFIRMED, ERR_BAD_STATE);
        require(msg.sender == e.buyer || msg.sender == e.seller, "NOT_PARTICIPANT");
        require(!e.disputeOpened, ERR_DISPUTE_EXISTS);

        e.status = EscrowStatus.DISPUTED;
        e.disputeOpened = true;

        emit DisputeOpened(escrowId, msg.sender);
    }

    // -------------------------
    // Dispute resolve (arbitrator)
    // -------------------------
    function resolveDispute(uint256 escrowId, DisputeOutcome outcome) external onlyArbitrator {
        Escrow storage e = escrows[escrowId];
        require(e.adId != 0, "ESCROW_NOT_FOUND");
        require(e.status == EscrowStatus.DISPUTED, ERR_BAD_STATE);
        require(e.disputeOpened && !e.disputeResolved, "DISPUTE_DONE");

        // Fee to treasury
        if (e.feeAmount > 0) {
            IERC20(e.token).safeTransfer(treasury, e.feeAmount);
            e.feeAmount = 0;
        }

        // Principal settlement
        if (outcome == DisputeOutcome.BUYER_WINS) {
            IERC20(e.token).safeTransfer(e.buyer, e.amount);
        } else {
            IERC20(e.token).safeTransfer(e.seller, e.amount);
        }
        e.amount = 0;

        // DisputeBond settlement
        if (outcome == DisputeOutcome.BUYER_WINS) {
            if (e.buyerDisputeBond > 0) {
                creditBalance[e.buyer][e.token] += e.buyerDisputeBond;
                emit CreditAdded(e.buyer, e.token, e.buyerDisputeBond, keccak256(abi.encodePacked("BUYER_DISPUTE_WIN", escrowId)));
                e.buyerDisputeBond = 0;
            }
            if (e.sellerDisputeBond > 0) {
                IERC20(e.token).safeTransfer(treasury, e.sellerDisputeBond);
                e.sellerDisputeBond = 0;
            }
        } else {
            if (e.sellerDisputeBond > 0) {
                creditBalance[e.seller][e.token] += e.sellerDisputeBond;
                emit CreditAdded(e.seller, e.token, e.sellerDisputeBond, keccak256(abi.encodePacked("SELLER_DISPUTE_WIN", escrowId)));
                e.sellerDisputeBond = 0;
            }
            if (e.buyerDisputeBond > 0) {
                IERC20(e.token).safeTransfer(treasury, e.buyerDisputeBond);
                e.buyerDisputeBond = 0;
            }
        }

        // AdBond refund to maker credit wallet
        Ad storage ad = ads[e.adId];
        if (ad.adBond > 0) {
            creditBalance[ad.maker][ad.token] += ad.adBond;
            emit CreditAdded(ad.maker, ad.token, ad.adBond, keccak256(abi.encodePacked("AD_BOND_REFUND_DISPUTE", e.adId)));
            ad.adBond = 0;
        }

        // finalize
        e.disputeResolved = true;
        e.status = EscrowStatus.RESOLVED;

        ad.state = AdState.COMPLETED;
        ad.activeEscrowId = 0;

        emit DisputeResolved(escrowId, outcome);
        emit EscrowReleased(escrowId);
        emit AdCompleted(e.adId);
    }

    // -------------------------
    // Expiry: seller missed funding window
    // -------------------------
    function expireSellerFunding(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.adId != 0, "ESCROW_NOT_FOUND");
        require(e.status == EscrowStatus.TAKEN, ERR_BAD_STATE);

        TokenConfig memory cfg = _cfg(e.token);
        require(block.timestamp > e.takenAt + uint256(cfg.sellerFundWindow), ERR_WINDOW_NOT_EXPIRED);

        Ad storage ad = ads[e.adId];
        require(ad.activeEscrowId == escrowId, ERR_ESCROW_MISMATCH);
        require(ad.state == AdState.TAKEN, ERR_BAD_STATE);

        // Refund buyer dispute bond to credit
        if (e.buyerDisputeBond > 0) {
            creditBalance[e.buyer][e.token] += e.buyerDisputeBond;
            emit CreditAdded(e.buyer, e.token, e.buyerDisputeBond, keccak256(abi.encodePacked("BUYER_DISPUTE_REFUND_SELLER_NO_FUND", escrowId)));
            e.buyerDisputeBond = 0;
        }

        e.status = EscrowStatus.CANCELLED;

        // AdBond forfeiture only if maker is funding party (sell ad)
        if (_makerIsFundingParty(ad)) {
            ad.state = AdState.CANCELLED;
            if (ad.adBond > 0) {
                IERC20(ad.token).safeTransfer(treasury, ad.adBond);
                ad.adBond = 0;
            }
            ad.activeEscrowId = 0;
            emit AdCancelled(e.adId);
            emit EscrowCancelled(escrowId, "SELLER_NO_FUND_MAKER_PENALTY");
        } else {
            // reopen ad and keep AdBond locked
            ad.state = AdState.CREATED;
            ad.activeEscrowId = 0;
            emit EscrowCancelled(escrowId, "SELLER_NO_FUND_REOPEN");
        }
    }

    // -------------------------
    // Expiry: buyer missed payment confirmation window
    // -------------------------
    function expireBuyerConfirmation(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.adId != 0, "ESCROW_NOT_FOUND");
        require(e.status == EscrowStatus.FUNDED, ERR_BAD_STATE);

        TokenConfig memory cfg = _cfg(e.token);
        require(block.timestamp > e.fundedAt + uint256(cfg.buyerConfirmWindow), ERR_WINDOW_NOT_EXPIRED);

        Ad storage ad = ads[e.adId];
        require(ad.activeEscrowId == escrowId, ERR_ESCROW_MISMATCH);
        require(ad.state == AdState.TAKEN, ERR_BAD_STATE);

        // Forfeit buyer dispute bond to treasury
        if (e.buyerDisputeBond > 0) {
            IERC20(e.token).safeTransfer(treasury, e.buyerDisputeBond);
            e.buyerDisputeBond = 0;
        }

        // Refund seller locked funds to seller wallet
        uint256 refund = e.amount + e.feeAmount + e.sellerDisputeBond;
        if (refund > 0) {
            IERC20(e.token).safeTransfer(e.seller, refund);
        }

        e.amount = 0;
        e.feeAmount = 0;
        e.sellerDisputeBond = 0;

        e.status = EscrowStatus.CANCELLED;
        ad.state = AdState.CREATED;
        ad.activeEscrowId = 0;

        emit EscrowCancelled(escrowId, "BUYER_NO_CONFIRM_FORFEIT");
    }

    // -------------------------
    // UI helper: buyer dispute gate
    // -------------------------
    function buyerMayDispute(uint256 escrowId) external view returns (bool) {
        Escrow storage e = escrows[escrowId];
        if (e.adId == 0) return false;
        if (e.status != EscrowStatus.PAYMENT_CONFIRMED) return false;

        TokenConfig memory cfg = tokenConfig[e.token];
        if (!cfg.enabled) return false;
        if (e.disputeOpened) return false;

        return block.timestamp > e.paymentConfirmedAt + uint256(cfg.sellerReleaseWindow);
    }
}
