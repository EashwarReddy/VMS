const assert = require("node:assert/strict");
const { chromium } = require("playwright");
const { parse } = require("dotenv");
const fs = require("node:fs"),
  crypto = require("node:crypto");
(async () => {
  const config = parse(
    fs.readFileSync(
      require("node:path").resolve(__dirname, "../../BE/.workspace.env")
    )
  );
  const base = process.env.VMS_BASE_URL || "http://127.0.0.1:3000";
  if (!["localhost", "127.0.0.1"].includes(new URL(base).hostname))
    throw new Error(
      "Run this fixture test against a local development instance only."
    );
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const password = crypto.randomBytes(24).toString("base64url");
  const suffix = crypto.randomUUID().slice(0, 8);
  const visitorName = "Connected Visitor " + suffix;
  const accounts = {};
  for (const role of ["Host", "Planner", "Security", "Visitor"])
    accounts[role] = {
      name: role + " Tester",
      email: role.toLowerCase() + "-" + suffix + "@example.test",
      password,
      role,
    };
  async function login(email, pass) {
    await page.goto(base + "/app", { waitUntil: "networkidle" });
    await page.getByLabel("Email address").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(pass);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await page.getByText("Connected workspace", { exact: true }).waitFor();
  }
  async function logout() {
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await page
      .getByRole("heading", { name: "Welcome back.", exact: true })
      .waitFor();
  }
  const navigation = () =>
    page.getByRole("navigation", { name: "Workspace navigation" });
  const dialog = () => page.getByRole("dialog");
  async function openVisit() {
    await page
      .getByRole("button", {
        name: "View " + visitorName + " visit",
        exact: true,
      })
      .click();
  }
  await login(
    config.WORKSPACE_ADMIN_EMAIL,
    config.WORKSPACE_ADMIN_PASSWORD_B64
      ? Buffer.from(config.WORKSPACE_ADMIN_PASSWORD_B64, "base64").toString(
          "utf8"
        )
      : config.WORKSPACE_ADMIN_PASSWORD
  );
  await page
    .getByRole("button", { name: "Accounts & audit", exact: true })
    .click();
  for (const account of Object.values(accounts)) {
    await dialog().getByLabel("Name", { exact: true }).fill(account.name);
    await dialog().getByLabel("Email", { exact: true }).fill(account.email);
    await dialog()
      .getByLabel("Initial password", { exact: true })
      .fill(account.password);
    await dialog().locator('select[name="role"]').selectOption(account.role);
    await dialog()
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await dialog()
      .getByText(account.email + " · " + account.role, { exact: true })
      .waitFor();
  }
  await dialog().getByRole("button", { name: "Close", exact: true }).click();
  await logout();
  console.log("PASS admin creates real stakeholder accounts");
  await login(accounts.Visitor.email, password);
  assert.equal(
    await page.getByLabel("View stakeholder role").isDisabled(),
    true
  );
  await page.getByRole("button", { name: "New visit", exact: true }).click();
  for (const [label, value] of [
    ["Full name", visitorName],
    ["Email address", accounts.Visitor.email],
    ["Organization", "Test Institute"],
  ])
    await dialog().getByLabel(label, { exact: true }).fill(value);
  await dialog().getByRole("button", { name: "Continue", exact: true }).click();
  await dialog()
    .getByLabel("Host name", { exact: true })
    .fill(accounts.Host.name);
  await dialog()
    .getByLabel("Host email", { exact: true })
    .fill(accounts.Host.email);
  await dialog()
    .getByLabel("Purpose of visit", { exact: true })
    .fill("Connected workflow test");
  await dialog().getByLabel("Arrival", { exact: true }).fill("00:00");
  await dialog().getByLabel("Departure", { exact: true }).fill("23:59");
  await dialog().getByLabel("Transport needed").check();
  await dialog().getByLabel("Stay needed").check();
  await dialog().getByLabel("Pickup location", { exact: true }).fill("Airport");
  await dialog().getByRole("button", { name: "Continue", exact: true }).click();
  await dialog()
    .getByRole("button", { name: "Submit request", exact: true })
    .click();
  await page
    .getByRole("button", {
      name: "View " + visitorName + " visit",
      exact: true,
    })
    .waitFor();
  await page.reload({ waitUntil: "networkidle" });
  await navigation()
    .getByRole("button", { name: "Visitors", exact: true })
    .click();
  await openVisit();
  assert.match(await dialog().textContent(), /Pending approval/);
  await dialog().getByRole("button", { name: "Close visit details" }).click();
  await logout();
  console.log("PASS visitor submission and database persistence after reload");
  await login(accounts.Host.email, password);
  await navigation()
    .getByRole("button", { name: /^Approvals/ })
    .click();
  await openVisit();
  await dialog()
    .getByRole("button", { name: "Approve visit", exact: true })
    .click();
  await dialog().getByText("VISITOR PASS", { exact: true }).waitFor();
  await dialog()
    .getByRole("button", { name: "Copy pass", exact: true })
    .click();
  const qr = await page.evaluate(() => navigator.clipboard.readText());
  assert.ok(qr.startsWith("VMS-PASS|"));
  await dialog().getByRole("button", { name: "Close visit details" }).click();
  await logout();
  console.log("PASS assigned host approval and real QR pass");
  await login(accounts.Planner.email, password);
  await navigation()
    .getByRole("button", { name: "Travel & stay", exact: true })
    .click();
  await openVisit();
  await dialog().getByLabel("Vehicle / travel arrangement").fill("Shuttle");
  await dialog().getByLabel("Pickup location & time").fill("Airport 09:00");
  await dialog()
    .getByLabel("Accommodation", { exact: true })
    .fill("Guest House 101");
  await dialog()
    .getByRole("button", { name: "Save arrangements", exact: true })
    .click();
  await page
    .getByRole("status")
    .filter({ hasText: "Visit updated." })
    .waitFor();
  await dialog().getByRole("button", { name: "Close visit details" }).click();
  await logout();
  console.log("PASS planner saves shared arrangements");
  await login(accounts.Security.email, password);
  await page
    .getByRole("button", { name: "Pass & updates", exact: true })
    .click();
  await dialog().getByLabel("Pass content").fill(qr);
  await dialog()
    .getByRole("button", { name: "Verify pass", exact: true })
    .click();
  await dialog()
    .getByText(/Pass verified/)
    .waitFor();
  await dialog().getByRole("button", { name: "Close", exact: true }).click();
  await navigation()
    .getByRole("button", { name: "Entry & exit", exact: true })
    .click();
  await openVisit();
  await dialog().getByLabel("Assets carried (optional)").fill("Laptop TEST-1");
  await dialog()
    .getByLabel("Identity and visit authorization verified")
    .check();
  await dialog()
    .getByRole("button", { name: "Check in visitor", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Record check-out", exact: true })
    .waitFor();
  await dialog()
    .getByRole("button", { name: "Record check-out", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Finish visit", exact: true })
    .waitFor();
  await dialog()
    .getByRole("button", { name: "Finish visit", exact: true })
    .click();
  await dialog().getByText("Completed", { exact: true }).waitFor();
  await dialog().getByRole("button", { name: "Close visit details" }).click();
  await logout();
  console.log("PASS security verifies QR, checks in/out and completes visit");
  await login(accounts.Visitor.email, password);
  await navigation()
    .getByRole("button", { name: "Visit history", exact: true })
    .click();
  await openVisit();
  assert.match(await dialog().textContent(), /Guest House 101/);
  assert.match(await dialog().textContent(), /Laptop TEST-1/);
  assert.equal(
    await dialog()
      .getByRole("button", { name: "Check in visitor", exact: true })
      .count(),
    0
  );
  await dialog().getByRole("button", { name: "Close visit details" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth
    ),
    false
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS visitor tracking, permission-aware UI, mobile layout and zero browser errors"
  );
  await browser.close();
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
