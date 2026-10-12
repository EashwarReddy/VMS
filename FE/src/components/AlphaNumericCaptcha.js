import { useEffect, useState, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Fade,
  IconButton
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";
import { API } from "../api";

export default function AlphaNumericCaptcha({ onCaptchaSolved, shouldRefresh }) {
  const [captcha, setCaptcha] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });

  const canvasRef = useRef(null);

  useEffect(() => {
    fetchCaptcha();
  }, []);
  

  useEffect(() => {
    if (shouldRefresh) refreshCaptcha();
  }, [shouldRefresh]);

  // 🎨 Draw CAPTCHA on Canvas
  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Random background color
    ctx.fillStyle = `rgb(${rand(200)},${rand(200)},${rand(200)})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x = 10; // starting x-coordinate
    for (const char of text.toUpperCase()) {
        const fontSize = 22 + rand(12); // random font size 22-33
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = `rgb(${rand(256)}, ${rand(256)}, ${rand(256)})`; // random color
        ctx.fillText(char, x, 40); // adjust y if needed
        x += fontSize * 0.8; // dynamic spacing based on font size
    }
  };

  const rand = (n) => Math.floor(Math.random() * n);

  useEffect(() => {
    if (captcha?.captcha && canvasRef.current) {
      drawCaptcha(captcha.captcha);
    }
  }, [captcha]);

  const fetchCaptcha = () => {
    setLoading(true);
    axios
      .get(`${API}/captcha/captcha`)
      .then((res) => {
        setCaptcha(res.data);
        setIsVerified(false);
        setUserAnswer("");
        onCaptchaSolved(false);

      })
      .catch(() => {
        setAlert({ show: true, message: "Failed to load captcha", severity: "error" });
      })
      .finally(() => setLoading(false));
  };

  const refreshCaptcha = () => {
    setAlert({ show: true, message: "Refreshing captcha...", severity: "info" });
    fetchCaptcha();
  };

  const handleVerify = async () => {
    if (!userAnswer) {
      setAlert({ show: true, message: "Please enter CAPTCHA", severity: "warning" });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API}/captcha/verify-captcha`,
        {
          captchaId: captcha?.captchaId,
          userAnswer, // 🚨 send EXACT input (case-sensitive)
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setAlert({ show: true, message: "Captcha verified!", severity: "success" });
        setIsVerified(true);
        onCaptchaSolved(true);
      } else {
        throw new Error();
      }
    } catch {
      setAlert({ show: true, message: "Invalid CAPTCHA", severity: "error" });
      setUserAnswer("");
      onCaptchaSolved(false);
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (alert.show) {
      const t = setTimeout(() => setAlert(a => ({ ...a, show: false })), 3000);
      return () => clearTimeout(t);
    }
  }, [alert.show]);

  if (!captcha) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={20} />
        <Typography sx={{ ml: 1 }}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* CAPTCHA DISPLAY */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <canvas
          ref={canvasRef}
          width={180}
          height={50}
          style={{ border: "1px solid #ccc", borderRadius: 4 }}
        />

        <IconButton onClick={refreshCaptcha} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* INPUT + VERIFY */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <TextField
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)} // ⚠️ NO case change
          placeholder="Enter CAPTCHA"
          disabled={loading || isVerified}
          fullWidth
        />

        <Button
          variant="contained"
          onClick={handleVerify}
          disabled={loading || isVerified}
        >
          {loading ? (
            <CircularProgress size={16} />
          ) : isVerified ? (
            <>
              <CheckCircleIcon fontSize="small" /> Verified
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </Box>

      {/* ALERT */}
      <Fade in={alert.show}>
        <Alert severity={alert.severity} sx={{ mt: 2 }}>
          {alert.message}
        </Alert>
      </Fade>
    </Box>
  );
}
