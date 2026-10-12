import { useEffect, useState } from "react";
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
import RefreshIcon from '@mui/icons-material/Refresh';
import { API } from "../api";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function MathCaptcha({ onCaptchaSolved, shouldRefresh }) {
  const [captcha, setCaptcha] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", severity: "success" });

  useEffect(() => {
    fetchCaptcha();
  }, []);

  // Add this to refresh captcha when parent component needs it
  useEffect(() => {
    if (shouldRefresh) {
      refreshCaptcha();
    }
  }, [shouldRefresh]);

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
      .catch((err) => {
        console.error("Error fetching captcha:", err);
        setAlert({
          show: true,
          message: "Failed to load captcha",
          severity: "error"
        });
      })
      .finally(() => setLoading(false));
  };

  const refreshCaptcha = () => {
    setAlert({
      show: true,
      message: "Refreshing captcha...",
      severity: "info"
    });
    fetchCaptcha();
  };

  const handleVerify = async () => {
    if (!userAnswer.trim()) {
      setAlert({
        show: true,
        message: "Please enter your answer",
        severity: "warning"
      });
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/captcha/verify-captcha`, {
        captchaId: captcha?.captchaId,
        userAnswer,
      },{ withCredentials: true });

      if (res.data.success) {
        setAlert({
          show: true,
          message: "Captcha verified!",
          severity: "success"
        });
        setIsVerified(true);
        onCaptchaSolved(true);
      } else {
        setAlert({
          show: true,
          message: "Incorrect answer",
          severity: "error"
        });
        onCaptchaSolved(false);
        setUserAnswer("");
        fetchCaptcha();
      }
    } catch (err) {
      console.error("Error verifying captcha:", err);
      setAlert({
        show: true,
        message: "Verification failed",
        severity: "error"
      });
      onCaptchaSolved(false);
    } finally {
      setLoading(false);
    }
  };

  // Auto hide alert after 3 seconds
  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  if (!captcha) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 1 }}>
        <CircularProgress size={20} sx={{ mr: 1 }} />
        <Typography variant="body2" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  return (
  <Box sx={{ width: "100%" }}>
    {/* Captcha Question Section */}
    <Box 
      sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        mb: 2,
        p: 2,
        backgroundColor: "grey.50",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "grey.200"
      }}
    >
      <Box sx={{ flex: 1, textAlign: "center" }}>
        <Typography
          variant="body2"
          sx={{ 
            color: "text.secondary", 
            fontSize: "0.875rem",
            fontWeight: 500,
            mb: 0.5
          }}
        >
          Security Verification
        </Typography>
        <Typography
          variant="h6"
          sx={{ 
            color: "text.primary", 
            fontWeight: 600,
            fontSize: "1.125rem",
            letterSpacing: "0.5px"
          }}
        >
          {captcha.question} = ?
        </Typography>
      </Box>
      
      {/* Refresh button */}
      <IconButton 
        onClick={refreshCaptcha} 
        size="small" 
        disabled={loading}
        sx={{ 
          ml: 1,
          backgroundColor: "primary.main",
          color: "white",
          width: 32,
          height: 32,
          "&:hover": {
            backgroundColor: "primary.dark"
          },
          "&:disabled": {
            backgroundColor: "grey.300",
            color: "grey.500"
          }
        }}
        title="Generate new captcha"
      >
        <RefreshIcon fontSize="small" />
      </IconButton>
    </Box>

    {/* Input and Verify Section */}
    <Box sx={{ display: "flex", gap: 1, alignItems: "stretch"}}>
      <TextField
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter your answer"
        variant="outlined"
        disabled={loading || isVerified}
        sx={{
          flex: 1,
          "& .MuiOutlinedInput-root": {
            height: "44px",
            fontSize: "1rem",
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
                borderWidth: "2px"
              }
            }
          },
          "& .MuiInputBase-input": {
            textAlign: "center",
            fontWeight: 500,
            fontSize: "1.1rem"
          }
        }}
      />
      
      <Button
        variant="contained"
        onClick={handleVerify}
        disabled={loading || !userAnswer.trim() || isVerified}
        sx={{
          minWidth: "100px",
          height: "44px",
          fontWeight: 600,
          textTransform: "none",
          borderRadius: 1,
          backgroundColor: isVerified ? "success.main" : "primary.main",
          "&:hover": {
            backgroundColor: isVerified ? "success.dark" : "primary.dark"
          },
          "&:disabled": {
            backgroundColor: "grey.300",
            color: "grey.500"
          }
        }}
      >
        {loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : isVerified ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CheckCircleIcon fontSize="small" />
            Verified
          </Box>
        ) : (
          "Verify"
        )}
      </Button>
    </Box>

    {/* Alert Section */}
    <Fade in={alert.show}>
      <Box>
        <Alert 
          severity={alert.severity}
          variant="filled"
          sx={{ 
            fontSize: "0.875rem",
            fontWeight: 500,
            borderRadius: 2,
            "& .MuiAlert-icon": {
              fontSize: "1.25rem"
            }
          }}
        >
          {alert.message}
        </Alert>
      </Box>
    </Fade>
  </Box>
);

}