import { useState } from "react";
import { Clock3, DoorOpen, CheckCheck } from "lucide-react";
import styles from "./workspace.module.css";

export default function MovementHistory({ visit, onCheckout, onComplete }) {
  const [exitOpen, setExitOpen] = useState(false);
  const [assetResult, setAssetResult] = useState("matched");
  const [exitAssets, setExitAssets] = useState("");
  const [assetNotes, setAssetNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const checkout = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await onCheckout({
        assetResult,
        exitAssets,
        assetNotes,
        exitAuthorized: true,
      });
      if (result !== false) {
        setExitOpen(false);
        setExitAssets("");
        setAssetNotes("");
      } else
        setError(
          "Departure was not recorded. Review the visit update message and try again."
        );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };
  const time = (value) =>
    new Date(value).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  return (
    <section
      className={styles.detailSection}
      aria-label="Movement History module"
    >
      <h3>
        <Clock3 size={18} />
        Movement History
      </h3>
      <p>
        Campus entry, asset records and departure are maintained by Security.
      </p>
      {visit.overstay && (
        <p role="alert" className={styles.error}>
          Overstay: {visit.overdueMinutes} minutes past scheduled departure (
          {visit.endDate || visit.date} {visit.endTime} IST).
        </p>
      )}
      {!visit.logs.length && (
        <p>No entry recorded yet. Scan the visitor’s QR pass at arrival.</p>
      )}
      {visit.logs.map((log, i) => (
        <div key={log._id || i} className={styles.movement}>
          <span>
            Entry {i + 1}
            <small>Entry assets: {log.assets}</small>
            {log.out && (
              <>
                <small>
                  Exit assets: {log.exitAssets || "Not recorded (legacy entry)"}
                </small>
                <small>
                  {log.assetResult === "matched"
                    ? "Assets matched"
                    : log.assetResult === "discrepancy"
                      ? "Discrepancy reviewed"
                      : "Verification not recorded (legacy entry)"}
                </small>
                {log.assetNotes && <small>Resolution: {log.assetNotes}</small>}
                {log.exitVerifiedBy && (
                  <small>Verified by {log.exitVerifiedBy}</small>
                )}
              </>
            )}
          </span>
          <span>
            {time(log.in)}
            <small>
              {log.out ? `Out: ${time(log.out)}` : "Currently on campus"}
            </small>
          </span>
        </div>
      ))}
      {visit.status === "Checked in" && (
        <div className={styles.actionStrip}>
          <button
            className={styles.primaryButton}
            onClick={() => {
              setExitOpen(true);
              setError("");
            }}
          >
            <DoorOpen size={16} />
            Record check-out
          </button>
        </div>
      )}
      {visit.status === "Checked in" && exitOpen && (
        <form
          className={styles.formGrid}
          onSubmit={checkout}
          aria-label="Asset exit verification"
        >
          <h3>Verify outgoing assets</h3>
          <p>
            Entry record:{" "}
            <strong>
              {visit.logs.at(-1)?.assets || "No entry asset record"}
            </strong>
          </p>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <label className={styles.field}>
            <span>Asset comparison</span>
            <select
              value={assetResult}
              onChange={(e) => setAssetResult(e.target.value)}
            >
              <option value="matched">
                Outgoing assets match the entry record
              </option>
              <option value="discrepancy">
                Discrepancy reviewed — record resolution
              </option>
            </select>
          </label>
          {assetResult === "discrepancy" && (
            <>
              <label className={styles.field}>
                <span>Outgoing asset details</span>
                <textarea
                  required
                  maxLength={300}
                  value={exitAssets}
                  onChange={(e) => setExitAssets(e.target.value)}
                  placeholder="List outgoing devices and serial numbers, or No assets"
                />
              </label>
              <label className={styles.field}>
                <span>Discrepancy resolution</span>
                <textarea
                  required
                  maxLength={500}
                  value={assetNotes}
                  onChange={(e) => setAssetNotes(e.target.value)}
                  placeholder="Describe the difference, checks performed, and why departure is authorized"
                />
              </label>
            </>
          )}
          <label className={styles.checkbox}>
            <input type="checkbox" required />
            Outgoing assets checked and departure authorized
          </label>
          <button className={styles.primaryButton} disabled={busy}>
            {busy ? "Recording departure…" : "Verify assets & record departure"}
          </button>
          <button
            type="button"
            className={styles.textButton}
            disabled={busy}
            onClick={() => setExitOpen(false)}
          >
            Cancel verification
          </button>
        </form>
      )}
      {visit.status === "Approved" && visit.logs.length > 0 && (
        <button className={styles.textButton} onClick={onComplete}>
          <CheckCheck size={16} />
          Finish visit
        </button>
      )}
    </section>
  );
}
