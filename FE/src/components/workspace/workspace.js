import Head from "next/head";
import Link from "next/link";
import {
  cloneElement,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Building2,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  DoorOpen,
  Hotel,
  LayoutDashboard,
  LogIn,
  MapPin,
  Menu,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Truck,
  Users,
  X,
} from "lucide-react";
import {
  DEPARTMENTS,
  ROLES,
  STATUS,
  STORAGE_KEY,
  initials,
  localDate,
  newVisit,
  seedVisits,
  timeLabel,
} from "./data";
import styles from "./workspace.module.css";

const NAV = [
  ["Overview", LayoutDashboard],
  ["Visitors", Users],
  ["Approvals", CheckCheck],
  ["Travel & stay", Truck],
  ["Entry & exit", DoorOpen],
  ["Visit history", Clock3],
];
const ROLE_NAV = {
  Admin: NAV.map(([name]) => name),
  Host: ["Overview", "Visitors", "Approvals", "Visit history"],
  Planner: ["Overview", "Travel & stay", "Visit history"],
  Security: ["Overview", "Visitors", "Entry & exit", "Visit history"],
  Visitor: ["Overview", "Visitors", "Visit history"],
};
const statusClass = (status) =>
  ({
    "Pending approval": "pending",
    Approved: "approved",
    "Checked in": "checkedIn",
    Completed: "completed",
    Declined: "cancelled",
    Cancelled: "cancelled",
    Draft: "draft",
  })[status];

function Badge({ status }) {
  return (
    <span className={`${styles.badge} ${styles[statusClass(status)]}`}>
      <span />
      {status}
    </span>
  );
}

function Field({ label, children, ...props }) {
  const id = useId();
  return (
    <label className={styles.field} htmlFor={id}>
      <span id={`${id}-label`}>{label}</span>
      {children ? (
        cloneElement(children, { id, "aria-labelledby": `${id}-label` })
      ) : (
        <input id={id} aria-labelledby={`${id}-label`} {...props} />
      )}
    </label>
  );
}

function VisitForm({ visit, spot, onClose, onSave, live, feedback }) {
  const [form, setForm] = useState(visit || newVisit(spot));
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const update = (key, value) =>
    setForm((previous) => ({ ...previous, [key]: value }));
  const validate = () => {
    if (!formRef.current.reportValidity()) return false;
    if (
      step === 1 &&
      (((form.endDate || form.date) === form.date &&
        form.endTime <= form.time) ||
        (form.endDate || form.date) < form.date)
    ) {
      setError("Departure must be after arrival.");
      return false;
    }
    setError("");
    return true;
  };
  const submit = (event) => {
    event.preventDefault();
    if (!validate()) return;
    step < 2 ? setStep(step + 1) : onSave(form, false);
  };
  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      className={styles.dialog}
    >
      <DialogTitle className={styles.dialogTitle}>
        <span>
          {visit
            ? "Continue your draft"
            : spot
              ? "Register a walk-in"
              : "Plan a new visit"}
          <small>
            {spot
              ? "A same-day visit, with host approval before entry."
              : "A warm welcome starts with a little planning."}
          </small>
        </span>
        <button
          className={styles.iconButton}
          onClick={onClose}
          aria-label="Close visit form"
        >
          <X size={20} />
        </button>
      </DialogTitle>
      <DialogContent>
        {feedback && (
          <p role="status" className={styles.formNote}>
            {feedback}
          </p>
        )}
        <div className={styles.steps}>
          {["Visitor details", "Visit details", "Review"].map(
            (label, index) => (
              <span
                key={label}
                className={index <= step ? styles.stepActive : ""}
              >
                <b>{index < step ? <Check size={13} /> : index + 1}</b>
                {label}
              </span>
            )
          )}
        </div>
        <form id="visit-form" ref={formRef} onSubmit={submit}>
          {step === 0 && (
            <div className={styles.formGrid}>
              <Field
                label="Full name"
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Ananya Sharma"
              />
              <Field
                label="Email address"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@organization.com"
              />
              <Field
                label="Organization"
                required
                maxLength={100}
                value={form.organization}
                onChange={(e) => update("organization", e.target.value)}
                placeholder="Your company or institution"
              />
              <div className={styles.formNote}>
                <ShieldCheck size={20} />
                <span>
                  {live
                    ? "Your request is stored in the shared database and sent to your host."
                    : "Sample workspace. Use fictional details; your visits stay in this browser."}
                </span>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className={styles.formGrid}>
              <Field
                label="Host name"
                required
                minLength={2}
                value={form.host}
                onChange={(e) => update("host", e.target.value)}
                placeholder="Who are you meeting?"
              />
              <Field
                label="Host email"
                type="email"
                required
                value={form.hostEmail}
                onChange={(e) => {
                  const email = e.target.value;
                  const host = live?.hosts?.find(
                    (account) => account.email === email
                  );
                  setForm((previous) => ({
                    ...previous,
                    hostEmail: email,
                    host: host?.name || previous.host,
                  }));
                }}
                list={live ? "workspace-hosts" : undefined}
                placeholder="host@example.com"
              />
              {live && (
                <datalist id="workspace-hosts">
                  {live.hosts?.map((host) => (
                    <option key={host.id} value={host.email}>
                      {host.name}
                    </option>
                  ))}
                </datalist>
              )}
              <Field label="Department">
                <select
                  value={form.department}
                  onChange={(e) => update("department", e.target.value)}
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </Field>
              <Field
                label="Purpose of visit"
                required
                maxLength={150}
                value={form.purpose}
                onChange={(e) => update("purpose", e.target.value)}
                placeholder="e.g. Project discussion"
              />
              <Field
                label="Visit date"
                type="date"
                required
                min={localDate()}
                value={form.date}
                disabled={spot}
                onChange={(e) =>
                  setForm((previous) => ({
                    ...previous,
                    date: e.target.value,
                    endDate:
                      !previous.endDate || previous.endDate < e.target.value
                        ? e.target.value
                        : previous.endDate,
                  }))
                }
              />
              {!spot && (
                <Field
                  label="Departure date"
                  type="date"
                  required
                  min={form.date}
                  value={form.endDate || form.date}
                  onChange={(e) => update("endDate", e.target.value)}
                />
              )}
              <div className={styles.twoColumns}>
                <Field
                  label="Arrival"
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                />
                <Field
                  label="Departure"
                  type="time"
                  required
                  value={form.endTime}
                  disabled={spot}
                  onChange={(e) => update("endTime", e.target.value)}
                />
              </div>
              {!spot && (
                <>
                  <div className={styles.twoColumns}>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={form.transport}
                        onChange={(e) => update("transport", e.target.checked)}
                      />
                      <Truck size={18} />
                      Transport needed
                    </label>
                    <label className={styles.checkbox}>
                      <input
                        type="checkbox"
                        checked={form.accommodation}
                        onChange={(e) =>
                          update("accommodation", e.target.checked)
                        }
                      />
                      <Hotel size={18} />
                      Stay needed
                    </label>
                  </div>
                  {form.transport && (
                    <Field
                      label="Pickup location"
                      required
                      value={form.pickup}
                      onChange={(e) => update("pickup", e.target.value)}
                      placeholder="Airport, station, or address"
                    />
                  )}
                </>
              )}
            </div>
          )}
          {step === 2 && (
            <div className={styles.review}>
              <div className={styles.reviewPerson}>
                <span className={styles.avatar}>{initials(form.name)}</span>
                <div>
                  <h3>{form.name}</h3>
                  <p>
                    {form.organization} · {form.email}
                  </p>
                </div>
              </div>
              <dl>
                <dt>Meeting with</dt>
                <dd>{form.host}</dd>
                <dt>Department</dt>
                <dd>{form.department}</dd>
                <dt>Schedule</dt>
                <dd>
                  {form.date}
                  {form.endDate && form.endDate !== form.date
                    ? ` – ${form.endDate}`
                    : ""}{" "}
                  · {timeLabel(form.time)} – {timeLabel(form.endTime)}
                </dd>
                <dt>Purpose</dt>
                <dd>{form.purpose}</dd>
                <dt>Transport / stay</dt>
                <dd>
                  {form.transport ? "Transport requested" : "No transport"} ·{" "}
                  {form.accommodation ? "Stay requested" : "No stay"}
                </dd>
              </dl>
              <div className={styles.formNote}>
                <Clock3 size={20} />
                <span>
                  {live
                    ? "Submit your request for host approval. Your QR pass becomes available after approval."
                    : "Submit your request for host approval. A sample pass becomes available after approval."}
                </span>
              </div>
            </div>
          )}
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
        </form>
      </DialogContent>
      <DialogActions className={styles.dialogActions}>
        <button
          className={styles.secondaryButton}
          onClick={() => onSave(form, true)}
        >
          Save as draft
        </button>
        <div>
          {step > 0 && (
            <button
              className={styles.textButton}
              onClick={() => {
                setStep(step - 1);
                setError("");
              }}
            >
              Back
            </button>
          )}
          <button
            className={styles.primaryButton}
            form="visit-form"
            type="submit"
          >
            {step === 2 ? "Submit request" : "Continue"}
            <ArrowRight size={16} />
          </button>
        </div>
      </DialogActions>
    </Dialog>
  );
}

function Detail({ visit, role, onClose, onChange, notify, live, feedback }) {
  const [plan, setPlan] = useState(
    visit.plan || { vehicle: "", pickup: visit.pickup || "", stay: "" }
  );
  const [assets, setAssets] = useState("");
  const [pass, setPass] = useState(null);
  const fetchPass = live?.getPass;
  useEffect(() => {
    if (!fetchPass || !["Approved", "Checked in"].includes(visit.status)) {
      setPass(null);
      return;
    }
    let active = true;
    fetchPass(visit.id)
      .then((result) => {
        if (active) setPass(result);
      })
      .catch(() => {
        if (active) setPass(null);
      });
    return () => {
      active = false;
    };
  }, [fetchPass, visit.id, visit.status]);
  const pending = visit.status === "Pending approval";
  const canApprove =
    ["Admin", "Host"].includes(role) &&
    (!live || role === "Admin" || visit.hostEmail === live.user.email);
  const canPlan = ["Admin", "Planner"].includes(role);
  const canAdmit = ["Admin", "Security"].includes(role);
  const hasPass = ["Approved", "Checked in", "Completed"].includes(
    visit.status
  );
  const patch = (changes) => onChange({ ...visit, ...changes });
  const checkIn = () => {
    patch({
      status: "Checked in",
      logs: [
        ...visit.logs,
        {
          in: new Date().toISOString(),
          out: null,
          assets: assets.trim() || "No assets",
        },
      ],
    });
    setAssets("");
    notify("Visitor checked in. Entry recorded.");
  };
  const checkOut = () => {
    patch({
      status: "Approved",
      logs: visit.logs.map((log, index) =>
        index === visit.logs.length - 1
          ? { ...log, out: new Date().toISOString() }
          : log
      ),
    });
    notify("Visitor checked out. Re-entry is available during the visit.");
  };
  return (
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      className={styles.dialog}
    >
      <DialogTitle className={styles.dialogTitle}>
        <span>
          Visit details<small>{visit.id}</small>
        </span>
        <button
          className={styles.iconButton}
          aria-label="Close visit details"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </DialogTitle>
      <DialogContent>
        {feedback && (
          <p role="status" className={styles.formNote}>
            {feedback}
          </p>
        )}
        <div className={styles.reviewPerson}>
          <span className={styles.avatar}>{initials(visit.name)}</span>
          <div>
            <h3>{visit.name || "Unnamed draft"}</h3>
            <p>{visit.organization}</p>
          </div>
          <Badge status={visit.status} />
        </div>
        <dl className={styles.detailList}>
          <dt>Host</dt>
          <dd>{visit.host}</dd>
          <dt>Department</dt>
          <dd>{visit.department}</dd>
          <dt>Schedule</dt>
          <dd>
            {visit.date}
            {visit.endDate && visit.endDate !== visit.date
              ? ` – ${visit.endDate}`
              : ""}{" "}
            · {timeLabel(visit.time)} – {timeLabel(visit.endTime)}
          </dd>
          <dt>Purpose</dt>
          <dd>{visit.purpose}</dd>
          <dt>Email</dt>
          <dd>{visit.email}</dd>
        </dl>
        <div className={styles.timeline}>
          {["Requested", "Approved", "On campus", "Visit complete"].map(
            (label, i) => (
              <span
                key={label}
                className={
                  i === 0 ||
                  (i === 1 && hasPass) ||
                  (i === 2 && visit.logs.length > 0) ||
                  (i === 3 && visit.status === "Completed")
                    ? styles.timelineDone
                    : ""
                }
              >
                <Check size={13} />
                {label}
              </span>
            )
          )}
        </div>
        {hasPass && (
          <div className={styles.pass}>
            {(!live || pass) && (
              <QRCodeSVG
                value={live ? pass.qr : `DEMO ONLY|${visit.id}`}
                size={100}
                level="M"
              />
            )}
            <div>
              <span className={styles.eyebrow}>
                {live ? "VISITOR PASS" : "SAMPLE VISITOR PASS"}
              </span>
              <h3>{visit.id}</h3>
              <p>
                {live
                  ? "Present this pass and your identification at security."
                  : "This preview does not grant campus access."}
              </p>
              <button
                className={styles.textButton}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(
                      live && pass ? pass.qr : visit.id
                    );
                    notify("Visit reference copied.");
                  } catch {
                    notify("Copy unavailable. Your reference is " + visit.id);
                  }
                }}
              >
                <Copy size={14} />
                {live ? "Copy pass" : "Copy reference"}
              </button>
            </div>
          </div>
        )}
        {pending && canApprove && (
          <div className={styles.actionStrip}>
            <button
              className={styles.secondaryButton}
              onClick={() => {
                patch({ status: "Declined" });
                notify("Visit request declined.");
              }}
            >
              Decline
            </button>
            <button
              className={styles.primaryButton}
              onClick={() => {
                patch({ status: "Approved" });
                notify("Visit approved. Sample pass is ready.");
              }}
            >
              <Check size={16} />
              Approve visit
            </button>
          </div>
        )}
        {(visit.transport || visit.accommodation) && (
          <section className={styles.detailSection}>
            <h3>
              <Truck size={18} />
              Travel & accommodation
            </h3>
            {canPlan && visit.status === "Approved" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  patch({ plan });
                  notify("Travel and stay arrangements saved.");
                }}
                className={styles.formGrid}
              >
                {visit.transport && (
                  <>
                    <Field
                      label="Vehicle / travel arrangement"
                      required
                      value={plan.vehicle}
                      onChange={(e) =>
                        setPlan({ ...plan, vehicle: e.target.value })
                      }
                      placeholder="e.g. Campus shuttle"
                    />
                    <Field
                      label="Pickup location & time"
                      required
                      value={plan.pickup}
                      onChange={(e) =>
                        setPlan({ ...plan, pickup: e.target.value })
                      }
                    />
                  </>
                )}
                {visit.accommodation && (
                  <Field
                    label="Accommodation"
                    required
                    value={plan.stay}
                    onChange={(e) => setPlan({ ...plan, stay: e.target.value })}
                    placeholder="Guest house and room"
                  />
                )}
                <button className={styles.primaryButton} type="submit">
                  Save arrangements
                </button>
              </form>
            ) : (
              <p>
                {visit.plan
                  ? [visit.plan.vehicle, visit.plan.pickup, visit.plan.stay]
                      .filter(Boolean)
                      .join(" · ")
                  : "Arrangements pending. The planner will update this visit."}
              </p>
            )}
          </section>
        )}
        {canAdmit && visit.status === "Approved" && (
          <section className={styles.detailSection}>
            <h3>
              <ShieldCheck size={18} />
              Verify & check in
            </h3>
            <p>Confirm photo identification before recording entry.</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                checkIn();
              }}
              className={styles.formGrid}
            >
              <Field
                label="Assets carried (optional)"
                value={assets}
                onChange={(e) => setAssets(e.target.value)}
                placeholder="e.g. Laptop · serial number"
              />
              <label className={styles.checkbox}>
                <input type="checkbox" required />
                Identity and visit authorization verified
              </label>
              <button className={styles.primaryButton} type="submit">
                <LogIn size={16} />
                Check in visitor
              </button>
            </form>
          </section>
        )}
        {canAdmit && visit.status === "Checked in" && (
          <div className={styles.actionStrip}>
            <button className={styles.primaryButton} onClick={checkOut}>
              <DoorOpen size={16} />
              Record check-out
            </button>
          </div>
        )}
        {canAdmit && visit.status === "Approved" && visit.logs.length > 0 && (
          <button
            className={styles.textButton}
            onClick={() => {
              patch({ status: "Completed" });
              notify("Visit marked complete.");
            }}
          >
            <CheckCheck size={16} />
            Finish visit
          </button>
        )}
        {visit.logs.length > 0 && (
          <section className={styles.detailSection}>
            <h3>
              <Clock3 size={18} />
              Movement history
            </h3>
            {visit.logs.map((log, i) => (
              <div key={i} className={styles.movement}>
                <span>
                  Entry {i + 1}
                  <small>{log.assets}</small>
                </span>
                <span>
                  {new Date(log.in).toLocaleTimeString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <small>
                    {log.out
                      ? `Out: ${new Date(log.out).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" })}`
                      : "Currently on campus"}
                  </small>
                </span>
              </div>
            ))}
          </section>
        )}
        {["Admin", "Visitor"].includes(role) &&
          ["Pending approval", "Approved", "Draft"].includes(visit.status) && (
            <button
              className={styles.dangerButton}
              onClick={() => {
                patch({ status: "Cancelled" });
                notify("Visit cancelled.");
              }}
            >
              Cancel visit
            </button>
          )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Workspace({ live = null }) {
  const connected = Boolean(live);
  const remoteVisits = live?.visits;
  const remoteRole = live?.user.role;
  const [visits, setVisits] = useState(remoteVisits || []);
  const [hydrated, setHydrated] = useState(false);
  const [role, setRole] = useState(live?.user.role || "Admin");
  const [tab, setTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All statuses");
  const [department, setDepartment] = useState("All departments");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [form, setForm] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [page, setPage] = useState(1);
  const toastTimer = useRef(null);
  const searchRef = useRef(null);
  const notify = (message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  };
  useEffect(() => {
    if (connected) {
      setHydrated(true);
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      setVisits(
        Array.isArray(stored) &&
          stored.every(
            (v) =>
              v &&
              typeof v.id === "string" &&
              typeof v.name === "string" &&
              STATUS.includes(v.status) &&
              Array.isArray(v.logs)
          )
          ? stored
          : seedVisits()
      );
    } catch {
      setVisits(seedVisits());
    }
    setHydrated(true);
  }, [connected]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  useEffect(() => {
    if (hydrated && !connected) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
      } catch {
        setToast(
          "Browser storage is unavailable. Changes will last for this session only."
        );
      }
    }
  }, [visits, hydrated, connected]);
  useEffect(() => {
    if (remoteVisits) setVisits(remoteVisits);
  }, [remoteVisits]);
  useEffect(() => {
    if (remoteRole) setRole(remoteRole);
  }, [remoteRole]);
  const navigate = (next) => {
    setTab(next);
    setPage(1);
    setSearch("");
    setFilter("All statuses");
    setDepartment("All departments");
    setNavOpen(false);
  };
  const startVisit = () => {
    if (live && role === "Planner") navigate("Travel & stay");
    else setForm({ spot: role === "Security" });
  };
  const switchRole = (next) => {
    setRole(next);
    navigate("Overview");
  };
  const counts = useMemo(
    () => ({
      today: visits.filter(
        (v) =>
          v.date <= localDate() &&
          (v.endDate || v.date) >= localDate() &&
          !["Draft", "Cancelled", "Declined"].includes(v.status)
      ).length,
      inside: visits.filter((v) => v.status === "Checked in").length,
      pending: visits.filter((v) => v.status === "Pending approval").length,
      completed: visits.filter((v) => v.status === "Completed").length,
    }),
    [visits]
  );
  const filtered = useMemo(
    () =>
      visits.filter((v) => {
        if (tab === "Approvals" && v.status !== "Pending approval")
          return false;
        if (
          tab === "Travel & stay" &&
          ((!v.transport && !v.accommodation) ||
            ["Cancelled", "Declined", "Draft"].includes(v.status))
        )
          return false;
        if (
          tab === "Entry & exit" &&
          !["Approved", "Checked in"].includes(v.status)
        )
          return false;
        if (
          tab === "Visit history" &&
          !["Completed", "Cancelled", "Declined"].includes(v.status)
        )
          return false;
        if (filter !== "All statuses" && v.status !== filter) return false;
        if (department !== "All departments" && v.department !== department)
          return false;
        return [v.name, v.id, v.host, v.organization, v.email]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      }),
    [visits, tab, filter, department, search]
  );
  const selected = visits.find((v) => v.id === selectedId);
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const safePage = Math.min(page, pages);
  const displayed = filtered.slice((safePage - 1) * 6, safePage * 6);
  const saveVisit = async (values, draft) => {
    if (live) {
      try {
        await live.saveVisit(values, draft);
        setForm(null);
        navigate("Visitors");
        notify(draft ? "Draft saved." : "Visit submitted for host approval.");
      } catch (error) {
        notify(error.message);
      }
      return;
    }
    const record = {
      ...values,
      id: values.id || `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      status: draft ? "Draft" : "Pending approval",
    };
    setVisits((previous) =>
      values.id
        ? previous.map((v) => (v.id === record.id ? record : v))
        : [record, ...previous]
    );
    setForm(null);
    navigate("Visitors");
    notify(
      draft
        ? "Draft saved. You can continue it from Visitors."
        : "Visit request submitted for host approval."
    );
  };
  const updateRecord = async (record) => {
    if (!live) {
      setVisits((previous) =>
        previous.map((v) => (v.id === record.id ? record : v))
      );
      return;
    }
    const original = visits.find((v) => v.id === record.id);
    let action;
    if (record.status !== original.status)
      action =
        record.status === "Approved"
          ? original.status === "Checked in"
            ? "checkout"
            : "approve"
          : {
              Declined: "decline",
              Cancelled: "cancel",
              "Checked in": "checkin",
              Completed: "complete",
            }[record.status];
    else action = "plan";
    try {
      await live.action(record.id, {
        action,
        version: original.version,
        plan: record.plan,
        identityVerified: true,
        assets: record.logs.at(-1)?.assets,
      });
      notify("Visit updated.");
    } catch (error) {
      notify(error.message);
      await live.reload();
    }
  };
  const exportVisits = () => {
    const columns = [
      "Reference",
      "Visitor",
      "Organization",
      "Host",
      "Department",
      "Date",
      "Time",
      "Status",
    ];
    const escape = (value) =>
      `"${String(value)
        .replace(/^[=+@-]/, "'$&")
        .replace(/"/g, '""')}"`;
    const rows = filtered.map((v) =>
      [
        v.id,
        v.name,
        v.organization,
        v.host,
        v.department,
        v.date,
        v.time,
        v.status,
      ]
        .map(escape)
        .join(",")
    );
    const url = URL.createObjectURL(
      new Blob(["\uFEFF" + [columns.join(","), ...rows].join("\r\n")], {
        type: "text/csv;charset=utf-8;",
      })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = live ? "visitor-register.csv" : "sample-visitor-register.csv";
    a.click();
    URL.revokeObjectURL(url);
    notify(
      live ? "Visitor register exported." : "Sample visitor register exported."
    );
  };
  const heading = {
    Overview: "A good day starts with a warm welcome.",
    Visitors: "Every visitor, thoughtfully managed.",
    Approvals: "The next welcome starts with you.",
    "Travel & stay": "A smooth journey. A comfortable stay.",
    "Entry & exit": "A clear view of who’s on campus.",
    "Visit history": "Every visit has a story.",
  }[tab];

  return (
    <>
      <Head>
        <title>Welcome | C-DAC Visitor Workspace</title>
        <meta
          name="description"
          content="A modern visitor workspace for C-DAC Hyderabad: plan visits, review approvals, arrange travel, and manage campus entry."
        />
      </Head>
      <div className={styles.app}>
        {navOpen && (
          <button
            className={styles.backdrop}
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
          />
        )}
        <aside
          className={`${styles.sidebar} ${navOpen ? styles.sidebarOpen : ""}`}
        >
          <Link href={live ? "/app" : "/workspace"} className={styles.brand}>
            <span className={styles.brandMark}>
              <Building2 size={25} />
            </span>
            <span>
              C-DAC<small>VISITOR WORKSPACE</small>
            </span>
          </Link>
          <div className={styles.campus}>
            <span>
              <MapPin size={15} />
              Hyderabad campus
            </span>
            <span className={styles.campusDot} />
          </div>
          <span className={styles.navLabel}>WORKSPACE</span>
          <nav aria-label="Workspace navigation">
            {NAV.filter(([name]) => ROLE_NAV[role].includes(name)).map(
              ([name, Icon]) => (
                <button
                  key={name}
                  className={tab === name ? styles.navActive : ""}
                  onClick={() => navigate(name)}
                  aria-current={tab === name ? "page" : undefined}
                >
                  <Icon size={19} />
                  <span>{name}</span>
                  {name === "Approvals" && counts.pending > 0 && (
                    <b>{counts.pending}</b>
                  )}
                </button>
              )
            )}
          </nav>
          <div className={styles.sidebarBottom}>
            <div className={styles.helpCard}>
              <span className={styles.helpIcon}>
                <Sparkles size={20} />
              </span>
              <h3>
                A better welcome,
                <br />
                from start to finish.
              </h3>
              <p>One connected space for every step of the visit.</p>
              <button onClick={startVisit}>
                {live && role === "Planner"
                  ? "Plan arrangements"
                  : "Plan a visit"}
                <ArrowUpRight size={15} />
              </button>
            </div>
            <div className={styles.profile}>
              <span className={styles.profileAvatar}>{role.slice(0, 1)}</span>
              <span>
                {role} workspace
                <small>{live ? live.user.name : "Sample experience"}</small>
              </span>
            </div>
          </div>
        </aside>
        <div className={styles.main}>
          <header className={styles.topbar}>
            <div className={styles.breadcrumb}>
              <button
                className={`${styles.iconButton} ${styles.mobileMenu}`}
                aria-label="Open navigation"
                onClick={() => setNavOpen(true)}
              >
                <Menu size={21} />
              </button>
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{tab}</strong>
            </div>
            <div className={styles.topActions}>
              <span className={styles.demoPill}>
                {live ? "Connected workspace" : "Sample workspace"}
              </span>
              <label className={styles.roleSelect}>
                <span className={styles.srOnly}>View stakeholder role</span>
                <select
                  value={role}
                  disabled={Boolean(live)}
                  onChange={(e) => switchRole(e.target.value)}
                >
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <ChevronDown size={13} />
              </label>
              <div className={styles.notificationWrap}>
                <button
                  className={styles.iconButton}
                  aria-label="Notifications"
                  aria-expanded={notifications}
                  onClick={() => setNotifications(!notifications)}
                >
                  <Bell size={19} />
                  {counts.pending > 0 && <i />}
                </button>
                {notifications && (
                  <div className={styles.notifications}>
                    <strong>Workspace updates</strong>
                    <p>{counts.pending} visit requests awaiting approval.</p>
                    <p>{counts.inside} visitors currently on campus.</p>
                    <button
                      className={styles.textButton}
                      onClick={() => {
                        navigate(
                          ROLE_NAV[role].includes("Approvals")
                            ? "Approvals"
                            : "Visitors"
                        );
                        setNotifications(false);
                      }}
                    >
                      View requests
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
              {live ? (
                <>
                  <button className={styles.textButton} onClick={live.onTools}>
                    {role === "Admin" ? "Accounts & audit" : "Pass & updates"}
                  </button>
                  <button className={styles.textButton} onClick={live.logout}>
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/app" className={styles.signIn}>
                  Sign in
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>
          </header>
          <main className={styles.content}>
            <div className={styles.pageHeading}>
              <div>
                <div className={styles.eyebrow}>
                  <span />
                  {role === "Admin"
                    ? "CAMPUS AT A GLANCE"
                    : `${role.toUpperCase()} WORKSPACE`}
                </div>
                <h1>{tab === "Overview" ? "Overview" : tab}</h1>
                <p>{heading}</p>
              </div>
              <div className={styles.headingActions}>
                <span className={styles.date}>
                  <CalendarDays size={16} />
                  {hydrated
                    ? new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "Asia/Kolkata",
                      }).format(new Date())
                    : "Hyderabad"}
                </span>
                <button className={styles.primaryButton} onClick={startVisit}>
                  <Plus size={17} />
                  {live && role === "Planner"
                    ? "Plan arrangements"
                    : role === "Security"
                      ? "Register walk-in"
                      : "New visit"}
                </button>
              </div>
            </div>
            {tab === "Overview" && (
              <>
                <section className={styles.welcome}>
                  <div>
                    <span className={styles.welcomeLabel}>
                      <span />A CONNECTED CAMPUS EXPERIENCE
                    </span>
                    <h2>
                      Make every arrival
                      <br />
                      feel like a welcome.
                    </h2>
                    <p>
                      From the first request to the final goodbye,
                      <br className={styles.desktopOnly} /> keep your campus
                      visits moving smoothly.
                    </p>
                    <button onClick={startVisit}>
                      {live && role === "Planner"
                        ? "Plan arrangements"
                        : "Plan a new visit"}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className={styles.welcomeArt} aria-hidden="true">
                    <div className={styles.orbit} />
                    <div className={styles.artBadge}>
                      <ShieldCheck size={19} />A secure welcome
                    </div>
                    <div className={styles.artPass}>
                      <div className={styles.artPassTop}>
                        <Building2 size={19} />
                        <span>
                          C-DAC<small>HYDERABAD</small>
                        </span>
                        <span className={styles.passDot} />
                      </div>
                      <div className={styles.artAvatar}>
                        <Users size={32} />
                      </div>
                      <b>Visitor pass</b>
                      <span>Welcome to our campus</span>
                      <div className={styles.artQr}>
                        <QRCodeSVG
                          value="CDAC SAMPLE PASS - NOT VALID FOR ENTRY"
                          size={66}
                        />
                      </div>
                      <small>YOUR VISIT. SIMPLIFIED.</small>
                    </div>
                    <div className={styles.artApproved}>
                      <span>
                        <Check size={16} />
                      </span>
                      <div>
                        Visit approved
                        <small>You’re expected. You’re welcome.</small>
                      </div>
                    </div>
                  </div>
                </section>
                <section className={styles.stats} aria-label="Visit statistics">
                  {[
                    [
                      "Today's visits",
                      counts.today,
                      CalendarDays,
                      "Scheduled for today",
                      "mint",
                    ],
                    [
                      "On campus",
                      counts.inside,
                      Users,
                      "Currently checked in",
                      "blue",
                    ],
                    [
                      "Awaiting approval",
                      counts.pending,
                      Clock3,
                      "Ready for your review",
                      "amber",
                    ],
                    [
                      "Visits completed",
                      counts.completed,
                      CheckCheck,
                      "A visit well concluded",
                      "purple",
                    ],
                  ].map(([label, value, Icon, caption, color]) => (
                    <div key={label} className={styles.stat}>
                      <div>
                        <span>{label}</span>
                        <span className={`${styles.statIcon} ${styles[color]}`}>
                          <Icon size={19} />
                        </span>
                      </div>
                      <strong>{String(value).padStart(2, "0")}</strong>
                      <p>
                        <span className={styles.tinyDot} />
                        {caption}
                      </p>
                    </div>
                  ))}
                </section>
              </>
            )}
            <div className={styles.workGrid}>
              <section className={styles.register}>
                <div className={styles.sectionHeading}>
                  <div>
                    <h2>
                      {tab === "Overview"
                        ? "Visitor register"
                        : tab === "Approvals"
                          ? "Requests to review"
                          : tab === "Travel & stay"
                            ? "Visitor arrangements"
                            : tab === "Entry & exit"
                              ? "Expected & on campus"
                              : tab === "Visit history"
                                ? "Previous visits"
                                : "Visitor register"}
                      <span>{filtered.length}</span>
                    </h2>
                    <p>
                      {tab === "Travel & stay"
                        ? "Transport and accommodation, all in one place."
                        : "A little clarity for every arrival."}
                    </p>
                  </div>
                  <button
                    className={styles.secondaryButton}
                    onClick={exportVisits}
                  >
                    <ArrowDownToLine size={15} />
                    <span>Export</span>
                  </button>
                </div>
                <div className={styles.tableTools}>
                  <label className={styles.search}>
                    <Search size={17} />
                    <input
                      ref={searchRef}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search visitors, hosts, or reference…"
                      aria-label="Search visitors"
                    />
                    {search && (
                      <button
                        aria-label="Clear search"
                        onClick={() => setSearch("")}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </label>
                  <label className={styles.statusFilter}>
                    <span className={styles.srOnly}>Filter by status</span>
                    <select
                      value={filter}
                      onChange={(e) => {
                        setFilter(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option>All statuses</option>
                      {STATUS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} />
                  </label>
                  <button
                    className={`${styles.secondaryButton} ${filtersOpen ? styles.filterActive : ""}`}
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    aria-expanded={filtersOpen}
                  >
                    <SlidersHorizontal size={15} />
                    <span>Filters</span>
                  </button>
                </div>
                {filtersOpen && (
                  <div className={styles.extraFilters}>
                    <Field label="Department">
                      <select
                        value={department}
                        onChange={(e) => {
                          setDepartment(e.target.value);
                          setPage(1);
                        }}
                      >
                        <option>All departments</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d}>{d}</option>
                        ))}
                      </select>
                    </Field>
                    <button
                      className={styles.textButton}
                      onClick={() => {
                        setDepartment("All departments");
                        setFilter("All statuses");
                        setSearch("");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
                <div className={styles.tableScroll}>
                  <table>
                    <thead>
                      <tr>
                        <th>VISITOR</th>
                        <th>HOST & DEPARTMENT</th>
                        <th>SCHEDULE</th>
                        <th>STATUS</th>
                        <th>
                          <span className={styles.srOnly}>View visit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayed.map((v, index) => (
                        <tr key={v.id}>
                          <td>
                            <button
                              className={styles.personButton}
                              onClick={() =>
                                v.status === "Draft"
                                  ? setForm({ visit: v, spot: v.spot })
                                  : setSelectedId(v.id)
                              }
                            >
                              <span
                                className={`${styles.avatar} ${styles["avatar" + (index % 4)]}`}
                              >
                                {initials(v.name) || "DR"}
                              </span>
                              <span>
                                <strong>{v.name || "Unnamed draft"}</strong>
                                <small>{v.organization || "Draft visit"}</small>
                              </span>
                            </button>
                          </td>
                          <td>
                            <strong>{v.host || "Not set"}</strong>
                            <small>{v.department}</small>
                          </td>
                          <td>
                            <strong>{timeLabel(v.time)}</strong>
                            <small>
                              {v.date === localDate() ? "Today" : v.date}
                            </small>
                          </td>
                          <td>
                            <Badge status={v.status} />
                          </td>
                          <td>
                            <button
                              className={styles.rowArrow}
                              aria-label={`View ${v.name || "draft"} visit`}
                              onClick={() =>
                                v.status === "Draft"
                                  ? setForm({ visit: v, spot: v.spot })
                                  : setSelectedId(v.id)
                              }
                            >
                              <ArrowUpRight size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filtered.length === 0 && (
                  <div className={styles.empty}>
                    <Search size={28} />
                    <h3>
                      {search ||
                      filter !== "All statuses" ||
                      department !== "All departments"
                        ? "No matching visits"
                        : "All clear for now"}
                    </h3>
                    <p>
                      {search
                        ? "Try a different name, host, or reference."
                        : "New visits will appear here as they move through the workspace."}
                    </p>
                    <button
                      className={styles.textButton}
                      onClick={() => {
                        setSearch("");
                        setFilter("All statuses");
                        setDepartment("All departments");
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
                <div className={styles.tableFooter}>
                  <span>
                    {filtered.length
                      ? `Showing ${(safePage - 1) * 6 + 1}–${Math.min(safePage * 6, filtered.length)} of ${filtered.length} visitors`
                      : "0 visitors"}
                  </span>
                  <div>
                    <button
                      className={styles.pageButton}
                      aria-label="Previous page"
                      disabled={safePage === 1}
                      onClick={() => setPage(safePage - 1)}
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <span>
                      {safePage} / {pages}
                    </span>
                    <button
                      className={styles.pageButton}
                      aria-label="Next page"
                      disabled={safePage === pages}
                      onClick={() => setPage(safePage + 1)}
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              </section>
              {tab === "Overview" && (
                <aside className={styles.rightRail}>
                  <section className={styles.quickActions}>
                    <h2>Quick actions</h2>
                    <p>The next step, one click away.</p>
                    {[
                      [
                        live && role === "Planner"
                          ? "Plan arrangements"
                          : "Plan a visit",
                        live && role === "Planner"
                          ? "Arrange transport and stay"
                          : "Create a visitor request",
                        Plus,
                        startVisit,
                      ],
                      ...(ROLE_NAV[role].includes("Approvals")
                        ? [
                            [
                              "Review approvals",
                              `${counts.pending} requests waiting`,
                              CheckCheck,
                              () => navigate("Approvals"),
                            ],
                          ]
                        : []),
                      ...(ROLE_NAV[role].includes("Entry & exit")
                        ? [
                            [
                              "Manage entry",
                              "Verify and welcome visitors",
                              ShieldCheck,
                              () => navigate("Entry & exit"),
                            ],
                          ]
                        : []),
                      ...(ROLE_NAV[role].includes("Travel & stay")
                        ? [
                            [
                              "Travel & stay",
                              "Take care of the journey",
                              Truck,
                              () => navigate("Travel & stay"),
                            ],
                          ]
                        : []),
                    ].map(([label, caption, Icon, action]) => (
                      <button key={label} onClick={action}>
                        <span className={styles.quickIcon}>
                          <Icon size={18} />
                        </span>
                        <span>
                          <strong>{label}</strong>
                          <small>{caption}</small>
                        </span>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </section>
                  <section className={styles.departments}>
                    <h2>Visits by department</h2>
                    <p>Today’s campus connections.</p>
                    {DEPARTMENTS.map((d) => {
                      const count = visits.filter(
                        (v) =>
                          v.department === d &&
                          v.date <= localDate() &&
                          (v.endDate || v.date) >= localDate() &&
                          !["Cancelled", "Declined", "Draft"].includes(v.status)
                      ).length;
                      return (
                        <div key={d}>
                          <div>
                            <span>{d}</span>
                            <b>{count}</b>
                          </div>
                          <span className={styles.bar}>
                            <i
                              style={{
                                width: `${counts.today ? (count / counts.today) * 100 : 0}%`,
                              }}
                            />
                          </span>
                        </div>
                      );
                    })}
                  </section>
                </aside>
              )}
            </div>
            <footer className={styles.footer}>
              <span>
                <ShieldCheck size={14} />
                Thoughtful visits. A safer campus.
              </span>
              <span>
                {live ? (
                  "Shared records · Role-protected access"
                ) : (
                  <>
                    Sample data · Stored in this browser
                    <button onClick={() => setResetOpen(true)}>
                      Reset sample
                    </button>
                  </>
                )}
              </span>
            </footer>
          </main>
        </div>
      </div>
      {form && (
        <VisitForm
          key={form.visit?.id || "new"}
          visit={form.visit}
          spot={form.spot}
          onClose={() => setForm(null)}
          onSave={saveVisit}
          live={live}
          feedback={live ? toast : null}
        />
      )}
      {selected && (
        <Detail
          key={`${selected.id}-${role}`}
          visit={selected}
          role={role}
          onClose={() => setSelectedId(null)}
          onChange={updateRecord}
          notify={
            live
              ? (message) => {
                  if (
                    message.startsWith("Visit reference copied.") ||
                    message.startsWith("Copy unavailable.")
                  )
                    notify(message);
                }
              : notify
          }
          live={live}
          feedback={live ? toast : null}
        />
      )}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle>Reset the sample workspace?</DialogTitle>
        <DialogContent>
          Your browser’s sample visits and changes will be replaced with the
          original examples.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Keep my changes</Button>
          <Button
            onClick={() => {
              setVisits(seedVisits());
              setResetOpen(false);
              navigate("Overview");
              notify("Sample workspace reset.");
            }}
          >
            Reset sample
          </Button>
        </DialogActions>
      </Dialog>
      {toast && (
        <div className={styles.toast} role="status">
          <Check size={17} />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </>
  );
}
