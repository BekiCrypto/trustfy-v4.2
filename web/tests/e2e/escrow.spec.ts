import { expect, test } from "@playwright/test";

/* =======================
   Fixtures
   ======================= */

const DEFAULT_INDEXER_STATUS = {
  chainId: 97,
  contractAddress: "0x0000000000000000000000000000000000000000",
  lastSyncedBlock: 1,
  lagBlocks: 0,
};

const baseEscrowFixture = (overrides = {}) => ({
  escrowId: "0xescrow",
  chainId: 97,
  tokenKey: "0x0000000000000000000000000000000000000000",
  amount: "100000",
  feeAmount: "0",
  sellerBond: "0",
  buyerBond: "0",
  state: "CREATED",
  seller: "0xseller",
  buyer: "0xbuyer",
  updatedAtBlock: 1,
  updatedAt: new Date().toISOString(),
  ...overrides,
});

const timelineFixture = (escrowId: string, state: string) => [
  {
    id: "1",
    escrowId,
    eventName: "EscrowCreated",
    stateAfter: state,
    txHash: "0xabc",
    blockNumber: 1,
    logIndex: 0,
    timestamp: new Date().toISOString(),
    payload: {},
  },
];

const evidenceFixture = (escrowId: string) => [
  {
    id: "evidence-1",
    escrowId,
    uploader: "0xseller",
    uri: "https://example.com/invoice.pdf",
    sha256: "deadbeef",
    mime: "application/pdf",
    size: "1024",
    description: "invoice",
    createdAt: new Date().toISOString(),
  },
];

const disputeDetailFixture = (escrowId: string) => ({
  escrowId,
  status: "DISPUTED",
  openedBy: "0xbuyer",
  summary: "Buyer reported no payment",
  updatedAt: new Date().toISOString(),
  escrow: {
    escrowId,
    seller: "0xseller",
    buyer: "0xbuyer",
    state: "DISPUTED",
  },
});

/* =======================
   API Stubs
   ======================= */

const stubEscrowRoutes = async (page, escrow) => {
  await page.route("**/v1/indexer/status", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([DEFAULT_INDEXER_STATUS]),
    })
  );

  await page.route(`**/v1/escrows/${escrow.escrowId}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(escrow),
    })
  );

  await page.route(`**/v1/escrows/${escrow.escrowId}/timeline`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        timelineFixture(escrow.escrowId, escrow.state)
      ),
    })
  );

  await page.route(`**/v1/escrows/${escrow.escrowId}/messages`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    })
  );

  await page.route(
    `**/v1/escrows/${escrow.escrowId}/payment-instructions`,
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(null),
      })
  );

  await page.route(`**/v1/escrows/${escrow.escrowId}/evidence`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(evidenceFixture(escrow.escrowId)),
    })
  );
};

const stubDisputeRoutes = async (page, escrowId: string) => {
  await page.route(`**/v1/disputes/${escrowId}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(disputeDetailFixture(escrowId)),
    })
  );
};

/* =======================
   Auth
   ======================= */

const setSession = async (page, address: string, roles: string[]) =>
  page.addInitScript(
    (session) => {
      localStorage.setItem("trustfy-auth-session", JSON.stringify(session));
    },
    {
      address,
      roles,
      accessToken: "mock-token",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }
  );

/* =======================
   Escrow Detail Flows
   ======================= */

test.describe("Escrow detail flows", () => {
  test("buyer sees Take Escrow action, history, and sync status", async ({
    page,
  }) => {
    const escrow = baseEscrowFixture({
      state: "CREATED",
      buyer: "0xbuyer",
    });

    await setSession(page, "0xbuyer", ["USER"]);
    await stubEscrowRoutes(page, escrow);

    await page.goto(`/app/escrows/${escrow.escrowId}`);
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/app\/escrows\/0xescrow/);

    // Page identity check (robust)
    await expect(page.getByText(/Escrow/i)).toBeVisible();

    await expect(
      page.getByRole("button", { name: /Take Escrow/i })
    ).toBeVisible();

    await expect(page.getByText("Chain 97")).toBeVisible();
    await expect(page.getByText("EscrowCreated")).toBeVisible();

    await page.getByRole("button", { name: /Take Escrow/i }).click();

    await expect(page.getByText("Transaction status")).toBeVisible();
    await expect(page.getByText("Waiting for your action")).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
  });

  test("seller can open Fund Escrow modal on TAKEN", async ({ page }) => {
    const escrow = baseEscrowFixture({
      state: "TAKEN",
      buyer: "0xbuyer",
    });

    await setSession(page, "0xseller", ["USER"]);
    await stubEscrowRoutes(page, escrow);

    await page.goto(`/app/escrows/${escrow.escrowId}`);
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/app\/escrows\/0xescrow/);

    await expect(
      page.getByRole("button", { name: /Fund Escrow/i })
    ).toBeVisible();

    await page.getByRole("button", { name: /Fund Escrow/i }).click();

    await expect(page.getByText("Transaction status")).toBeVisible();
    await expect(page.getByText("Waiting for your action")).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
  });
});

/* =======================
   Arbitrator Flows
   ======================= */

test.describe("Arbitrator dispute flows", () => {
  test("arbitrator sees timeline, evidence, and resolve modal", async ({
    page,
  }) => {
    const escrow = baseEscrowFixture({
      state: "DISPUTED",
      buyer: "0xbuyer",
    });

    await setSession(page, "0xarb", ["USER", "ARBITRATOR"]);
    await stubEscrowRoutes(page, escrow);
    await stubDisputeRoutes(page, escrow.escrowId);

    await page.goto(`/arbitrator/disputes/${escrow.escrowId}`);
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/arbitrator\/disputes\/0xescrow/);

    await expect(page.getByText(/Dispute/i)).toBeVisible();
    await expect(page.getByText("EscrowCreated")).toBeVisible();
    await expect(page.getByText("0xseller")).toBeVisible();

    await expect(
      page.getByRole("button", { name: /Resolve dispute/i })
    ).toBeVisible();

    await page
      .getByRole("button", { name: /Resolve dispute/i })
      .click();

    await expect(page.getByText("Transaction status")).toBeVisible();
    await expect(page.getByText("Waiting for your action")).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
  });
});
