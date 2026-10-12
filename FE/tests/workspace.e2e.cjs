const assert = require("node:assert/strict");
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE || undefined,
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.VMS_BASE_URL || "http://127.0.0.1:3000", {
    waitUntil: "networkidle",
  });
  const nav = page.getByRole("navigation", { name: "Workspace navigation" });
  const role = page.getByLabel("View stakeholder role");
  const dialog = () => page.getByRole("dialog");
  const openVisit = async (name) =>
    page
      .getByRole("button", { name: `View ${name} visit`, exact: true })
      .click();
  const close = async () =>
    page.getByRole("button", { name: "Close visit details" }).click();
  const search = async (text) =>
    page.getByRole("textbox", { name: "Search visitors" }).fill(text);
  assert.equal(await page.locator("tbody tr").count(), 6);
  await search("nonsense");
  assert.equal(await page.locator("tbody tr").count(), 0);
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByLabel("Filter by status").selectOption("Pending approval");
  assert.equal(await page.locator("tbody tr").count(), 2);
  await page.getByLabel("Filter by status").selectOption("All statuses");
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page
    .getByLabel("Department", { exact: true })
    .selectOption("Cyber Security");
  assert.equal(await page.locator("tbody tr").count(), 2);
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  console.log("PASS search, status and department filters");
  await page.getByRole("button", { name: "New visit", exact: true }).click();
  await dialog().getByLabel("Full name").fill("Demo Visitor");
  await dialog().getByLabel("Email address").fill("demo@example.com");
  await dialog().getByLabel("Organization").fill("Sample Institute");
  await dialog().getByRole("button", { name: "Continue", exact: true }).click();
  await dialog().getByLabel("Host name").fill("Demo Host");
  await dialog().getByLabel("Host email").fill("host@example.com");
  await dialog().getByLabel("Purpose of visit").fill("Research review");
  await dialog().getByLabel("Departure").fill("09:00");
  await dialog().getByRole("button", { name: "Continue", exact: true }).click();
  assert.match(
    await dialog().getByRole("alert").textContent(),
    /Departure must/
  );
  await dialog().getByLabel("Departure").fill("11:00");
  await dialog().getByLabel("Transport needed").check();
  await dialog().getByLabel("Stay needed").check();
  await dialog().getByLabel("Pickup location").fill("Airport");
  await dialog().getByRole("button", { name: "Continue", exact: true }).click();
  await dialog()
    .getByRole("button", { name: "Submit request", exact: true })
    .click();
  await page.getByRole("button", { name: "Next page" }).click();
  assert.equal(await page.locator("tbody tr").count(), 1);
  await page.getByRole("button", { name: "Previous page" }).click();
  await search("Demo Visitor");
  assert.match(await page.locator("tbody").textContent(), /Pending approval/);
  await page.reload({ waitUntil: "networkidle" });
  await nav.getByRole("button", { name: "Visitors", exact: true }).click();
  await search("Demo Visitor");
  assert.equal(await page.locator("tbody tr").count(), 1);
  console.log("PASS create visit, invalid departure validation, persistence");
  await role.selectOption("Host");
  await nav.getByRole("button", { name: /^Approvals/ }).click();
  await search("Demo Visitor");
  await openVisit("Demo Visitor");
  await dialog()
    .getByRole("button", { name: "Approve visit", exact: true })
    .click();
  assert.equal((await dialog().locator("svg").count()) > 0, true);
  assert.match(await dialog().textContent(), /SAMPLE VISITOR PASS/);
  await close();
  console.log("PASS host approval and sample QR pass");
  await role.selectOption("Planner");
  await nav.getByRole("button", { name: "Travel & stay", exact: true }).click();
  await search("Demo Visitor");
  await openVisit("Demo Visitor");
  await dialog()
    .getByLabel("Vehicle / travel arrangement")
    .fill("Campus shuttle");
  await dialog().getByLabel("Pickup location & time").fill("Airport at 09:00");
  await dialog()
    .getByLabel("Accommodation", { exact: true })
    .fill("Guest House 101");
  await dialog()
    .getByRole("button", { name: "Save arrangements", exact: true })
    .click();
  await close();
  console.log("PASS planner arrangements");
  await role.selectOption("Security");
  await nav.getByRole("button", { name: "Entry & exit", exact: true }).click();
  await search("Demo Visitor");
  await openVisit("Demo Visitor");
  await dialog().getByLabel("Assets carried (optional)").fill("Laptop DEMO-10");
  await dialog()
    .getByLabel("Identity and visit authorization verified")
    .check();
  await dialog()
    .getByRole("button", { name: "Check in visitor", exact: true })
    .click();
  assert.match(await dialog().textContent(), /Checked in/);
  await dialog()
    .getByRole("button", { name: "Record check-out", exact: true })
    .click();
  await dialog()
    .getByLabel("Identity and visit authorization verified")
    .check();
  await dialog()
    .getByRole("button", { name: "Check in visitor", exact: true })
    .click();
  assert.match(await dialog().textContent(), /Entry 2/);
  await dialog()
    .getByRole("button", { name: "Record check-out", exact: true })
    .click();
  await dialog()
    .getByRole("button", { name: "Finish visit", exact: true })
    .click();
  assert.match(await dialog().textContent(), /Completed/);
  await close();
  console.log("PASS security check-in, check-out, repeat entry and completion");
  await page
    .getByRole("button", { name: "Register walk-in", exact: true })
    .click();
  await dialog().getByLabel("Full name").fill("Walk In");
  await dialog().getByLabel("Email address").fill("walk@example.com");
  await dialog().getByLabel("Organization").fill("Sample");
  await dialog().getByRole("button", { name: "Continue", exact: true }).click();
  assert.equal(await dialog().getByLabel("Visit date").isDisabled(), true);
  assert.equal(await dialog().getByLabel("Departure").inputValue(), "23:59");
  assert.equal(await dialog().getByLabel("Transport needed").count(), 0);
  await dialog()
    .getByRole("button", { name: "Save as draft", exact: true })
    .click();
  await search("Walk In");
  assert.match(await page.locator("tbody").textContent(), /Draft/);
  await openVisit("Walk In");
  assert.match(await dialog().textContent(), /Continue your draft/);
  await dialog().getByRole("button", { name: "Close visit form" }).click();
  console.log("PASS same-day walk-in constraints and editable draft");
  await role.selectOption("Visitor");
  await nav.getByRole("button", { name: "Visitors", exact: true }).click();
  await search("Aditya Menon");
  await openVisit("Aditya Menon");
  assert.equal(
    await dialog()
      .getByRole("button", { name: "Approve visit", exact: true })
      .count(),
    0
  );
  assert.equal(
    await dialog()
      .getByRole("button", { name: "Check in visitor", exact: true })
      .count(),
    0
  );
  await dialog()
    .getByRole("button", { name: "Cancel visit", exact: true })
    .click();
  assert.match(await dialog().textContent(), /Cancelled/);
  await close();
  console.log("PASS visitor cancellation and role-specific actions");
  await role.selectOption("Admin");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), "sample-visitor-register.csv");
  await page.getByRole("button", { name: "Reset sample", exact: true }).click();
  await dialog()
    .getByRole("button", { name: "Reset sample", exact: true })
    .click();
  assert.equal(await page.locator("tbody tr").count(), 6);
  console.log("PASS CSV export and confirmed reset");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await nav.getByRole("button", { name: "Visitors", exact: true }).click();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth
    ),
    false
  );
  await page.getByRole("button", { name: "Open navigation" }).click();
  await nav.getByRole("button", { name: "Overview", exact: true }).click();

  assert.deepEqual(errors, []);
  console.log("PASS mobile navigation, layout and zero browser errors");
  await page.goto(
    (process.env.VMS_BASE_URL || "http://127.0.0.1:3000") + "/auth/signin",
    { waitUntil: "networkidle" }
  );
  assert.equal(await page.locator("input").count(), 2);
  console.log("PASS existing sign-in route");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
