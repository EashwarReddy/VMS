import { Clock3, DoorOpen, CheckCheck } from "lucide-react";
import styles from "./workspace.module.css";

export default function MovementHistory({ visit, onCheckout, onComplete }) {
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
      {!visit.logs.length && (
        <p>No entry recorded yet. Scan the visitor’s QR pass at arrival.</p>
      )}
      {visit.logs.map((log, i) => (
        <div key={log._id || i} className={styles.movement}>
          <span>
            Entry {i + 1}
            <small>{log.assets}</small>
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
          <button className={styles.primaryButton} onClick={onCheckout}>
            <DoorOpen size={16} />
            Record check-out
          </button>
        </div>
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
