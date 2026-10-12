import Head from "next/head";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Building2, ArrowRight, ShieldCheck } from "lucide-react";
import Workspace from "./workspace";
import styles from "./workspace.module.css";

export default function LiveApp() {
  const [user, setUser] = useState(null);
  const [visits, setVisits] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [register, setRegister] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [tools, setTools] = useState(false);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [message, setMessage] = useState("");
  const [qr, setQr] = useState("");
  const [verified, setVerified] = useState(null);
  const csrf = useRef("");
  const request = useCallback(async (path, body, method = "POST") => {
    const response = await fetch("/api/workspace" + path, {
      method: body === undefined ? "GET" : method,
      credentials: "same-origin",
      headers:
        body === undefined
          ? {}
          : {
              "Content-Type": "application/json",
              "X-CSRF-Token": csrf.current,
            },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error(
        "The API is unavailable. Start the workspace server and MongoDB."
      );
    }
    if (!response.ok)
      throw new Error(result.message || "The request could not be completed.");
    return result;
  }, []);
  const reload = useCallback(async () => {
    const [result, directory] = await Promise.all([
      request("/visits"),
      request("/hosts"),
    ]);
    setVisits(result.visits);
    setHosts(directory.hosts);
    return result;
  }, [request]);
  useEffect(() => {
    let active = true;
    request("/auth/me")
      .then(async (result) => {
        if (!active) return;
        csrf.current = result.csrf;
        setUser(result.user);
        await reload();
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [request, reload]);
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => reload().catch(() => {}), 15000);
    return () => clearInterval(interval);
  }, [user, reload]);
  const auth = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (register) await request("/auth/register", form);
      const result = await request("/auth/login", form);
      csrf.current = result.csrf;
      setUser(result.user);
      await reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  const saveVisit = async (values, draft) => {
    await request(
      values.id ? "/visits/" + values.id : "/visits",
      { ...values, draft },
      values.id ? "PUT" : "POST"
    );
    await reload();
  };
  const action = async (id, data) => {
    await request("/visits/" + id + "/actions", data);
    await reload();
  };
  const getPass = useCallback(
    (id) => request("/visits/" + id + "/pass"),
    [request]
  );
  const logout = async () => {
    try {
      await request("/auth/logout", {});
      csrf.current = "";
      setUser(null);
      setVisits([]);
    } catch (e) {
      setError(e.message);
    }
  };
  const openTools = async () => {
    setTools(true);
    setMessage("");
    setVerified(null);
    try {
      const results = await request("/notifications");
      setUpdates(results.notifications);
      if (user.role === "Admin") {
        setUsers((await request("/users")).users);
        setEvents((await request("/audit")).events);
      }
    } catch (e) {
      setMessage(e.message);
    }
  };
  const createUser = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    try {
      await request("/users", Object.fromEntries(new FormData(form)));
      form.reset();
      setUsers((await request("/users")).users);
      setMessage(
        "Account created. Share its initial password privately with the account holder."
      );
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const toggleUser = async (account) => {
    try {
      await request(
        "/users/" + account.id,
        { active: !account.active },
        "PATCH"
      );
      setUsers((await request("/users")).users);
    } catch (e) {
      setMessage(e.message);
    }
  };
  const changePassword = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    try {
      await request("/auth/password", Object.fromEntries(new FormData(form)));
      form.reset();
      setMessage("Password changed. Other sessions have been signed out.");
    } catch (e) {
      setMessage(e.message);
    } finally {
      setBusy(false);
    }
  };
  const verify = async (event) => {
    event.preventDefault();
    setVerified(null);
    try {
      const result = await request("/verify-pass", { qr });
      setVerified(result.visit);
      setMessage(
        "Pass verified. Confirm photo identification before checking in from Entry & exit."
      );
    } catch (e) {
      setMessage(e.message);
    }
  };
  if (loading)
    return (
      <div className={styles.authShell}>
        <p role="status">Opening your workspace…</p>
      </div>
    );
  if (!user)
    return (
      <>
        <Head>
          <title>Sign in | C-DAC Visitor Workspace</title>
        </Head>
        <main className={styles.authShell}>
          <section className={styles.authCard}>
            <Link href="/workspace" className={styles.brand}>
              <span className={styles.brandMark}>
                <Building2 size={25} />
              </span>
              <span>
                C-DAC<small>VISITOR WORKSPACE</small>
              </span>
            </Link>
            <h1>{register ? "Plan your first visit." : "Welcome back."}</h1>
            <p>
              {register
                ? "Create a visitor account to request and track campus visits."
                : "Sign in to your connected campus workspace."}
            </p>
            <form onSubmit={auth} className={styles.formGrid}>
              {register && (
                <label className={styles.field}>
                  <span>Full name</span>
                  <input
                    name="name"
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </label>
              )}
              <label className={styles.field}>
                <span>Email address</span>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                />
              </label>
              <label className={styles.field}>
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={register ? 12 : 1}
                  maxLength={128}
                  autoComplete={register ? "new-password" : "current-password"}
                />
              </label>
              {register && <small>Use at least 12 characters.</small>}
              {error && (
                <p role="alert" className={styles.error}>
                  {error}
                </p>
              )}
              <button className={styles.primaryButton} disabled={busy}>
                {busy
                  ? "Please wait…"
                  : register
                    ? "Create account"
                    : "Sign in"}
                <ArrowRight size={16} />
              </button>
            </form>
            <button
              className={styles.textButton}
              onClick={() => {
                setRegister(!register);
                setError("");
              }}
            >
              {register
                ? "Already registered? Sign in"
                : "New visitor? Create an account"}
            </button>
            <div className={styles.formNote}>
              <ShieldCheck size={19} />
              <span>
                Staff accounts are created by your administrator. Your role and
                records are managed securely by the server.
              </span>
            </div>
            <Link href="/workspace" className={styles.textButton}>
              Explore the sample workspace
            </Link>
          </section>
        </main>
      </>
    );
  return (
    <>
      <Workspace
        live={{
          user,
          visits,
          hosts,
          saveVisit,
          action,
          reload,
          getPass,
          logout,
          onTools: openTools,
        }}
      />
      {error && (
        <div className={styles.toast} role="alert">
          {error}
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}
      <Dialog
        open={tools}
        onClose={() => setTools(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {user.role === "Admin"
            ? "Accounts, audit & updates"
            : "Pass verification & updates"}
        </DialogTitle>
        <DialogContent>
          {message && (
            <p role="status" className={styles.formNote}>
              {message}
            </p>
          )}
          {["Admin", "Security"].includes(user.role) && (
            <section className={styles.detailSection}>
              <h3>Verify a visitor QR pass</h3>
              <form onSubmit={verify} className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Pass content</span>
                  <input
                    value={qr}
                    onChange={(e) => setQr(e.target.value)}
                    required
                    placeholder="Paste the scanned VMS-PASS content"
                  />
                </label>
                <button className={styles.primaryButton}>Verify pass</button>
              </form>
              {verified && (
                <p>
                  {verified.name} · {verified.id} · {verified.status} ·{" "}
                  {verified.date}
                </p>
              )}
            </section>
          )}
          {user.role === "Admin" && (
            <>
              <section className={styles.detailSection}>
                <h3>Create a staff or visitor account</h3>
                <form onSubmit={createUser} className={styles.formGrid}>
                  <div className={styles.twoColumns}>
                    <label className={styles.field}>
                      <span>Name</span>
                      <input name="name" required maxLength={100} />
                    </label>
                    <label className={styles.field}>
                      <span>Email</span>
                      <input name="email" type="email" required />
                    </label>
                  </div>
                  <div className={styles.twoColumns}>
                    <label className={styles.field}>
                      <span>Initial password</span>
                      <input
                        name="password"
                        type="password"
                        required
                        minLength={12}
                        maxLength={128}
                        autoComplete="new-password"
                      />
                    </label>
                    <label className={styles.field}>
                      <span>Role</span>
                      <select name="role">
                        {[
                          "Host",
                          "Planner",
                          "Security",
                          "Visitor",
                          "Admin",
                        ].map((role) => (
                          <option key={role}>{role}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <button className={styles.primaryButton} disabled={busy}>
                    Create account
                  </button>
                </form>
              </section>
              <section className={styles.detailSection}>
                <h3>Account access</h3>
                {users.map((account) => (
                  <div key={account.id} className={styles.movement}>
                    <span>
                      {account.name}
                      <small>
                        {account.email} · {account.role}
                      </small>
                    </span>
                    <button
                      className={styles.textButton}
                      disabled={account.id === user.id}
                      onClick={() => toggleUser(account)}
                    >
                      {account.active ? "Disable" : "Enable"}
                    </button>
                  </div>
                ))}
              </section>
              <section className={styles.detailSection}>
                <h3>Audit history</h3>
                {events.map((event) => (
                  <div className={styles.movement} key={event._id}>
                    <span>
                      {event.action}
                      <small>
                        {event.actor} · {event.visit || "Account"}
                      </small>
                    </span>
                    <span>
                      {new Date(event.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                      })}
                    </span>
                  </div>
                ))}
              </section>
            </>
          )}
          <section className={styles.detailSection}>
            <h3>Change your password</h3>
            <form onSubmit={changePassword} className={styles.formGrid}>
              <label className={styles.field}>
                <span>Current password</span>
                <input
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </label>
              <label className={styles.field}>
                <span>New password</span>
                <input
                  name="newPassword"
                  type="password"
                  required
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                />
              </label>
              <button className={styles.primaryButton} disabled={busy}>
                Change password
              </button>
            </form>
          </section>
          <section className={styles.detailSection}>
            <h3>Your notifications</h3>
            {updates.length ? (
              updates.map((update) => (
                <div className={styles.movement} key={update._id}>
                  <span>
                    {update.message}
                    <small>{update.visit}</small>
                  </span>
                  <span>
                    {new Date(update.createdAt).toLocaleString("en-IN", {
                      timeZone: "Asia/Kolkata",
                    })}
                  </span>
                </div>
              ))
            ) : (
              <p>No updates yet.</p>
            )}
          </section>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTools(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
