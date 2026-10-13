const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const mongoose = require("mongoose");
process.env.WORKSPACE_MONGODB_URI =
  process.env.WORKSPACE_TEST_MONGODB_URI ||
  "mongodb://127.0.0.1:27017/vms_test_" +
    crypto.randomUUID().replaceAll("-", "");
const { app, Account, Visit } = require("../src/workspace/server");
const { promisify } = require("node:util");
const scrypt = promisify(crypto.scrypt);

test("persistent workspace permissions and visit lifecycle", async (t) => {
  await mongoose.connect(process.env.WORKSPACE_MONGODB_URI);
  await Promise.all([Account.init(), Visit.init()]);
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  t.after(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await new Promise((resolve) => server.close(resolve));
  });
  const base = "http://127.0.0.1:" + server.address().port + "/api/workspace";
  const password = crypto.randomBytes(24).toString("base64url");
  const salt = crypto.randomBytes(16).toString("hex");
  await Account.create({
    name: "Administrator",
    email: "admin@example.test",
    role: "Admin",
    salt,
    password: (await scrypt(password, salt, 64)).toString("hex"),
  });
  const call = async (path, body, session, method) => {
    const res = await fetch(base + path, {
      method: method || (body ? "POST" : "GET"),
      headers: {
        "Content-Type": "application/json",
        ...(session
          ? { Cookie: session.cookie, "X-CSRF-Token": session.csrf }
          : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    return {
      status: res.status,
      data: await res.json(),
      cookie: res.headers.get("set-cookie"),
    };
  };
  const login = async (email) => {
    const result = await call("/auth/login", { email, password });
    assert.equal(result.status, 200);
    return {
      cookie: result.cookie.split(";")[0],
      csrf: result.data.csrf,
      user: result.data.user,
    };
  };
  const admin = await login("admin@example.test");
  const staff = {};
  for (const [name, role] of [
    ["host", "Host"],
    ["otherhost", "Host"],
    ["planner", "Planner"],
    ["security", "Security"],
  ]) {
    assert.equal(
      (
        await call(
          "/users",
          { name, email: name + "@example.test", password, role },
          admin
        )
      ).status,
      201
    );
    staff[name] = await login(name + "@example.test");
  }
  let visitor, other, visit;
  await t.test("public signup cannot choose a privileged role", async () => {
    assert.equal(
      (
        await call("/auth/register", {
          name: "Visitor",
          email: "visitor@example.test",
          password,
          role: "Admin",
        })
      ).data.user.role,
      "Visitor"
    );
    assert.equal(
      (
        await call("/auth/register", {
          name: "Other",
          email: "other@example.test",
          password,
        })
      ).status,
      201
    );
    visitor = await login("visitor@example.test");
    other = await login("other@example.test");
  });
  await t.test("anonymous, CSRF and role checks protect records", async () => {
    assert.equal((await call("/visits")).status, 401);
    assert.equal((await call("/users", undefined, visitor)).status, 403);
    assert.equal(
      (
        await call(
          "/users",
          {
            name: "Forged",
            email: "forged@example.test",
            password,
            role: "Admin",
          },
          { ...admin, csrf: "wrong" }
        )
      ).status,
      403
    );
  });
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const data = {
    name: "Test Visitor",
    email: "visitor@example.test",
    organization: "Test Institute",
    host: "Host",
    hostEmail: "host@example.test",
    department: "Advanced Computing",
    purpose: "Research review",
    date,
    time: "00:00",
    endTime: "23:59",
    transport: true,
    accommodation: true,
    pickup: "Airport",
  };
  await t.test(
    "validation rejects bad schedules and unknown hosts",
    async () => {
      assert.equal(
        (
          await call(
            "/visits",
            { ...data, time: "23:59", endTime: "00:00" },
            visitor
          )
        ).status,
        400
      );
      assert.equal(
        (
          await call(
            "/visits",
            { ...data, hostEmail: "unknown@example.test" },
            visitor
          )
        ).status,
        400
      );
    }
  );
  await t.test("requesters receive only their own records", async () => {
    const result = await call(
      "/visits",
      {
        ...data,
        status: "Approved",
        creator: "other@example.test",
        logs: [{ in: "forged" }],
      },
      visitor
    );
    assert.equal(result.status, 201);
    visit = result.data.visit;
    assert.equal(visit.status, "Pending approval");
    assert.equal(visit.creator, visitor.user.email);
    assert.deepEqual(visit.logs, []);
    assert.equal(
      (await call("/visits", undefined, other)).data.visits.length,
      0
    );
    assert.equal(
      (await call("/visits", undefined, staff.host)).data.visits.length,
      1
    );
  });
  await t.test("only assigned host or administrator can approve", async () => {
    assert.equal(
      (
        await call(
          "/visits/" + visit.id + "/actions",
          { action: "approve", version: visit.version },
          visitor
        )
      ).status,
      403
    );
    assert.equal(
      (
        await call(
          "/visits/" + visit.id + "/actions",
          { action: "approve", version: visit.version },
          staff.otherhost
        )
      ).status,
      404
    );
    const result = await call(
      "/visits/" + visit.id + "/actions",
      { action: "approve", version: visit.version },
      staff.host
    );
    assert.equal(result.status, 200);
    visit = result.data.visit;
    assert.equal(visit.status, "Approved");
  });
  await t.test(
    "planners persist arrangements with concurrency protection",
    async () => {
      const result = await call(
        "/visits/" + visit.id + "/actions",
        {
          action: "plan",
          version: visit.version,
          plan: { vehicle: "Shuttle", pickup: "Airport", stay: "Guest House" },
        },
        staff.planner
      );
      assert.equal(result.status, 200);
      const stale = visit.version;
      visit = result.data.visit;
      assert.equal(
        (
          await call(
            "/visits/" + visit.id + "/actions",
            {
              action: "plan",
              version: stale,
              plan: {
                vehicle: "Shuttle",
                pickup: "Airport",
                stay: "Guest House",
              },
            },
            staff.planner
          )
        ).status,
        409
      );
      assert.equal(
        (await Visit.findOne({ id: visit.id })).plan.stay,
        "Guest House"
      );
    }
  );
  let pass;
  await t.test("approved passes are verifiable and protected", async () => {
    pass = (await call("/visits/" + visit.id + "/pass", undefined, visitor))
      .data.qr;
    assert.ok(pass.startsWith("VMS-PASS|"));
    assert.equal(
      (await call("/verify-pass", { qr: pass }, visitor)).status,
      403
    );
    assert.equal(
      (await call("/verify-pass", { qr: pass }, staff.security)).status,
      200
    );
    assert.equal(
      (
        await call(
          "/verify-pass",
          { qr: pass.slice(0, -1) + (pass.at(-1) === "a" ? "b" : "a") },
          staff.security
        )
      ).status,
      404
    );
  });
  await t.test(
    "security records repeated movements and blocks duplicate updates",
    async () => {
      const path = "/visits/" + visit.id + "/actions";
      assert.equal(
        (
          await call(
            path,
            { action: "checkin", version: visit.version },
            staff.security
          )
        ).status,
        400
      );
      assert.equal(
        (
          await call(
            path,
            {
              action: "checkin",
              identityVerified: true,
              assets: "Laptop",
              version: visit.version,
            },
            staff.security
          )
        ).status,
        400
      );
      assert.equal(
        (
          await call(
            path,
            {
              action: "checkin",
              identityVerified: true,
              qr: pass,
              version: visit.version,
            },
            staff.security
          )
        ).status,
        400
      );
      assert.equal(
        (
          await call(
            path,
            {
              action: "checkin",
              identityVerified: true,
              qr: pass.slice(0, -1) + (pass.at(-1) === "a" ? "b" : "a"),
              assets: "Laptop",
              version: visit.version,
            },
            staff.security
          )
        ).status,
        403
      );
      const request = {
        action: "checkin",
        identityVerified: true,
        qr: pass,
        assets: "Laptop",
        version: visit.version,
      };
      const results = await Promise.all([
        call(path, request, staff.security),
        call(path, request, staff.security),
      ]);
      assert.equal(results.filter((r) => r.status === 200).length, 1);
      visit = results.find((r) => r.status === 200).data.visit;
      assert.equal(
        (await call("/verify-pass", { qr: pass }, staff.security)).status,
        409
      );
      assert.equal(
        (
          await call(
            path,
            { action: "checkout", version: visit.version },
            staff.planner
          )
        ).status,
        403
      );

      visit = (
        await call(
          path,
          { action: "checkout", version: visit.version },
          staff.security
        )
      ).data.visit;
      visit = (
        await call(
          path,
          {
            action: "checkin",
            identityVerified: true,
            qr: pass,
            assets: "No assets",
            version: visit.version,
          },
          staff.security
        )
      ).data.visit;
      assert.equal(visit.logs.length, 2);
      visit = (
        await call(
          path,
          { action: "checkout", version: visit.version },
          staff.security
        )
      ).data.visit;
      visit = (
        await call(
          path,
          { action: "complete", version: visit.version },
          staff.security
        )
      ).data.visit;
      assert.equal(visit.status, "Completed");
      assert.equal(
        (await call("/verify-pass", { qr: pass }, staff.security)).status,
        404
      );
    }
  );
  await t.test(
    "draft editing and cancellation are persisted and scoped",
    async () => {
      let draft = (await call("/visits", { ...data, draft: true }, visitor))
        .data.visit;
      assert.equal(draft.status, "Draft");
      assert.equal(
        (
          await call(
            "/visits/" + draft.id,
            { ...data, version: draft.version },
            other,
            "PUT"
          )
        ).status,
        403
      );
      draft = (
        await call(
          "/visits/" + draft.id,
          { ...data, version: draft.version },
          visitor,
          "PUT"
        )
      ).data.visit;
      assert.equal(draft.status, "Pending approval");
      draft = (
        await call(
          "/visits/" + draft.id + "/actions",
          { action: "cancel", version: draft.version },
          visitor
        )
      ).data.visit;
      assert.equal((await Visit.findOne({ id: draft.id })).status, "Cancelled");
    }
  );
  await t.test("disabling an account revokes its session", async () => {
    assert.equal(
      (await call("/users/" + other.user.id, { active: false }, admin, "PATCH"))
        .status,
      200
    );
    assert.equal((await call("/visits", undefined, other)).status, 401);
    assert.equal(
      (await call("/users/" + admin.user.id, { active: false }, admin, "PATCH"))
        .status,
      400
    );
  });
  await t.test(
    "audit and personal notifications contain persisted events",
    async () => {
      assert.ok(
        (await call("/audit", undefined, admin)).data.events.length > 5
      );
      assert.equal((await call("/audit", undefined, visitor)).status, 403);
      assert.ok(
        (await call("/notifications", undefined, visitor)).data.notifications
          .length > 0
      );
    }
  );
  await t.test(
    "multi-day visits and walk-in restrictions are enforced",
    async () => {
      const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString(
        "en-CA",
        { timeZone: "Asia/Kolkata" }
      );
      const multi = await call(
        "/visits",
        { ...data, endDate: tomorrow, time: "20:00", endTime: "02:00" },
        visitor
      );
      assert.equal(multi.status, 201);
      assert.equal(multi.data.visit.endDate, tomorrow);
      assert.equal(
        (await call("/visits", { ...data, spot: true }, visitor)).status,
        403
      );
      const walk = await call(
        "/visits",
        {
          ...data,
          spot: true,
          endDate: tomorrow,
          transport: true,
          accommodation: true,
        },
        staff.security
      );
      assert.equal(walk.status, 201);
      assert.equal(walk.data.visit.endDate, date);
      assert.equal(walk.data.visit.endTime, "23:59");
      assert.equal(walk.data.visit.transport, false);
      assert.equal(walk.data.visit.accommodation, false);
      assert.ok(
        (await call("/visits", undefined, staff.security)).data.visits.some(
          (v) => v.id === walk.data.visit.id
        )
      );
    }
  );
  await t.test(
    "travel and movement modules enforce separate roles",
    async () => {
      for (const actor of [visitor, staff.host, staff.security])
        assert.equal((await call("/travel", undefined, actor)).status, 403);
      for (const actor of [visitor, staff.host, staff.planner])
        assert.equal((await call("/movements", undefined, actor)).status, 403);
      const travel = await call("/travel", undefined, staff.planner);
      assert.equal(travel.status, 200);
      assert.ok(travel.data.visits.every((v) => v.logs.length === 0));
      const movements = await call("/movements", undefined, staff.security);
      assert.equal(movements.status, 200);
      assert.ok(movements.data.visits.some((v) => v.logs.length === 2));
      const fresh = (await call("/visits", data, visitor)).data.visit;
      const approved = (
        await call(
          "/visits/" + fresh.id + "/actions",
          { action: "approve", version: fresh.version },
          staff.host
        )
      ).data.visit;
      assert.equal(
        (
          await call(
            "/visits/" + approved.id + "/actions",
            {
              action: "plan",
              version: approved.version,
              plan: {
                vehicle: "Shuttle",
                pickup: "Airport",
                stay: "Guesthouse",
              },
            },
            staff.security
          )
        ).status,
        403
      );
    }
  );
  await t.test(
    "arrival verification rejects expired, future and revoked passes",
    async () => {
      const raw = crypto.randomBytes(32).toString("hex");
      const id = "VMS-" + crypto.randomBytes(4).toString("hex").toUpperCase();
      const future = new Date(Date.now() + 86400000).toLocaleDateString(
        "en-CA",
        { timeZone: "Asia/Kolkata" }
      );
      await Visit.create({
        ...data,
        id,
        date: future,
        endDate: future,
        status: "Approved",
        creator: visitor.user.email,
        passToken: raw,
        passHash: crypto.createHash("sha256").update(raw).digest("hex"),
        logs: [],
      });
      const qr = "VMS-PASS|" + id + "|" + raw;
      assert.equal(
        (await call("/verify-pass", { qr }, staff.security)).status,
        400
      );
      const past = new Date(Date.now() - 86400000).toLocaleDateString("en-CA", {
        timeZone: "Asia/Kolkata",
      });
      await Visit.updateOne({ id }, { $set: { date: past, endDate: past } });
      assert.equal(
        (await call("/verify-pass", { qr }, staff.security)).status,
        400
      );
      await Visit.updateOne(
        { id },
        { $set: { date, endDate: date, status: "Cancelled" } }
      );
      assert.equal(
        (await call("/verify-pass", { qr }, staff.security)).status,
        404
      );
    }
  );
});
