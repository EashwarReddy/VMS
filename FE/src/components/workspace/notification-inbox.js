import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import styles from "./workspace.module.css";

export default function NotificationInbox({
  open,
  onClose,
  updates,
  unreadCount,
  emailDelivery,
  onRead,
  onReadAll,
  onVisit,
  error,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Notifications <small>({unreadCount} unread)</small>
      </DialogTitle>
      <DialogContent>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {!emailDelivery?.configured && (
          <p className={styles.formNote}>
            Email delivery needs to be configured by your administrator.
            Notifications are available here.
          </p>
        )}
        {!updates.length && (
          <p>No notifications yet. Visit updates will appear here.</p>
        )}
        {updates.map((update) => (
          <article
            key={update._id}
            className={styles.notificationCard}
            aria-label={
              update.read ? "Read notification" : "Unread notification"
            }
          >
            <strong>
              {update.kind === "overstay"
                ? "Overstay alert"
                : update.kind === "asset-discrepancy"
                  ? "Asset discrepancy"
                  : "Visit update"}
              {!update.read ? " · New" : ""}
            </strong>
            <p>{update.message}</p>
            {update.emailState && update.emailState !== "disabled" && (
              <small>
                Email:{" "}
                {
                  {
                    queued: "queued",
                    sending: "sending",
                    sent: "accepted by mail provider",
                    failed: "delivery failed — contact your administrator",
                  }[update.emailState]
                }
              </small>
            )}
            <small>
              {new Date(update.createdAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST
            </small>
            <div className={styles.actionStrip}>
              {update.visit && (
                <button
                  className={styles.textButton}
                  onClick={() => onVisit(update)}
                >
                  View visit
                </button>
              )}
              {!update.read && (
                <button
                  className={styles.textButton}
                  onClick={() => onRead(update._id)}
                >
                  Mark as read
                </button>
              )}
            </div>
          </article>
        ))}
      </DialogContent>
      <DialogActions>
        <Button disabled={!unreadCount} onClick={onReadAll}>
          Mark all as read
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
