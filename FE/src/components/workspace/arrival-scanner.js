import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Camera, QrCode, ShieldCheck, X } from "lucide-react";
import jsQR from "jsqr";
import styles from "./workspace.module.css";

export default function ArrivalScanner({ open, onClose, verify, admit }) {
  const video = useRef(null),
    stream = useRef(null),
    interval = useRef(null),
    generation = useRef(0);
  const [camera, setCamera] = useState(false),
    [busy, setBusy] = useState(false),
    [qr, setQr] = useState(""),
    [verified, setVerified] = useState(null),
    [assets, setAssets] = useState(""),
    [noAssets, setNoAssets] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const stop = () => {
    generation.current++;
    clearInterval(interval.current);
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setCamera(false);
  };
  useEffect(() => {
    if (!open) {
      generation.current++;
      clearInterval(interval.current);
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = null;
      setCamera(false);
      setVerified(null);
      setQr("");
      setAssets("");
      setNoAssets(false);
      setError("");
      setSuccess("");
      setBusy(false);
    }
    return () => {
      generation.current++;
      clearInterval(interval.current);
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, [open]);
  const check = async (code) => {
    stop();
    const current = generation.current;
    setQr(code);
    setVerified(null);
    setAssets("");
    setNoAssets(false);
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const result = await verify(code);
      if (generation.current === current) setVerified(result.visit);
    } catch (e) {
      if (generation.current === current) setError(e.message);
    } finally {
      if (generation.current === current) setBusy(false);
    }
  };
  const startCamera = async () => {
    stop();
    const current = generation.current;
    setError("");
    setVerified(null);
    setSuccess("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera access requires localhost or HTTPS. You can upload a QR image or use a USB scanner below."
      );
      return;
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      if (generation.current !== current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      setCamera(true);
      // The video stays mounted, so a stream can be attached immediately.
      video.current.srcObject = media;
      await video.current.play();
      if (generation.current !== current) return;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      interval.current = setInterval(() => {
        const element = video.current;
        if (!element || element.readyState < 2) return;
        const scale = Math.min(1, 640 / element.videoWidth);
        canvas.width = Math.floor(element.videoWidth * scale);
        canvas.height = Math.floor(element.videoHeight * scale);
        if (!canvas.width || !canvas.height) return;
        context.drawImage(element, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const found = jsQR(pixels.data, pixels.width, pixels.height, {
          inversionAttempts: "attemptBoth",
        });
        if (found) {
          clearInterval(interval.current);
          check(found.data);
        }
      }, 250);
    } catch (e) {
      if (generation.current !== current) return;
      stop();
      setError(
        e.name === "NotAllowedError"
          ? "Camera permission was denied. Allow camera access, upload a QR image, or use a USB scanner."
          : "The camera could not be opened. Upload a QR image or use a USB scanner."
      );
    }
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    stop();
    const current = generation.current;
    setVerified(null);
    setSuccess("");
    if (file.size > 8 * 1024 * 1024) {
      setError("Choose a QR image smaller than 8 MB.");
      return;
    }
    let url;
    try {
      url = URL.createObjectURL(file);
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
      if (generation.current !== current) return;
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 1600 / Math.max(image.width, image.height));
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(pixels.data, pixels.width, pixels.height, {
        inversionAttempts: "attemptBoth",
      });
      if (!code)
        throw new Error(
          "No QR code was found. Use a clear, uncropped pass image."
        );
      await check(code.data);
    } catch (e) {
      if (generation.current === current)
        setError(e.message || "This image could not be read.");
    } finally {
      if (url) URL.revokeObjectURL(url);
    }
  };
  const enter = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await admit(verified.id, {
        action: "checkin",
        version: verified.version,
        qr,
        assets: noAssets ? "No assets" : assets.trim(),
        identityVerified: true,
      });
      setSuccess(
        `${verified.name} was admitted. Asset details and arrival time were recorded.`
      );
      setVerified(null);
      setQr("");
      setAssets("");
      setNoAssets(false);
    } catch (e) {
      setError(e.message);
      setVerified(null);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      className={styles.dialog}
    >
      <DialogTitle className={styles.dialogTitle}>
        <span>
          <QrCode size={21} /> Campus arrival
          <small>
            Scan → verify authorization → record assets → allow entry
          </small>
        </span>
        <button
          className={styles.iconButton}
          disabled={busy}
          onClick={onClose}
          aria-label="Close arrival scanner"
        >
          <X size={20} />
        </button>
      </DialogTitle>
      <DialogContent>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        {success && (
          <p role="status" className={styles.formNote}>
            {success}
          </p>
        )}
        <video
          ref={video}
          muted
          playsInline
          className={styles.scannerVideo}
          hidden={!camera}
          aria-label="Visitor QR camera preview"
        />
        {!verified && (
          <>
            <div className={styles.scannerActions}>
              <button
                className={styles.primaryButton}
                disabled={busy}
                onClick={camera ? stop : startCamera}
              >
                <Camera size={17} />
                {camera ? "Stop camera" : "Start camera"}
              </button>
              <label className={styles.secondaryButton}>
                Upload QR image
                <input
                  className={styles.srOnly}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={upload}
                  disabled={busy}
                  aria-label="Upload QR image"
                />
              </label>
            </div>
            <form
              className={styles.formGrid}
              onSubmit={(event) => {
                event.preventDefault();
                check(qr.trim());
              }}
            >
              <label className={styles.field}>
                <span>QR scanner input</span>
                <input
                  value={qr}
                  onChange={(event) => {
                    setQr(event.target.value);
                    setVerified(null);
                  }}
                  required
                  maxLength={500}
                  placeholder="Scan with a USB reader or paste pass content"
                  autoComplete="off"
                />
              </label>
              <button className={styles.secondaryButton} disabled={busy}>
                {busy ? "Verifying…" : "Verify visitor pass"}
              </button>
            </form>
          </>
        )}
        {verified && (
          <section className={styles.detailSection}>
            <h3>
              <ShieldCheck size={18} />
              Authorized arrival
            </h3>
            <p>
              <strong>{verified.name}</strong> · {verified.id}
            </p>
            <p>
              Host: {verified.host} · {verified.department}
            </p>
            <p>
              {verified.date} {verified.time} –{" "}
              {verified.endDate || verified.date} {verified.endTime}
            </p>
            <form className={styles.formGrid} onSubmit={enter}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={noAssets}
                  onChange={(e) => setNoAssets(e.target.checked)}
                />
                Visitor carries no assets
              </label>
              {!noAssets && (
                <label className={styles.field}>
                  <span>Asset details</span>
                  <textarea
                    value={assets}
                    onChange={(e) => setAssets(e.target.value)}
                    required
                    maxLength={300}
                    rows={3}
                    placeholder="Device type, make/model, and serial number for each asset"
                  />
                </label>
              )}
              <label className={styles.checkbox}>
                <input type="checkbox" required />
                Photo identification checked against the visitor
              </label>
              <button className={styles.primaryButton} disabled={busy}>
                {busy ? "Recording entry…" : "Record assets & allow entry"}
              </button>
            </form>
            <button
              className={styles.textButton}
              disabled={busy}
              onClick={() => {
                setVerified(null);
                setQr("");
              }}
            >
              Scan a different pass
            </button>
          </section>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={busy} onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
