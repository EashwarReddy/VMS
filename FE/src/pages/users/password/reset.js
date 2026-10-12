import {
  CircularProgress,
  Typography,
  Box,
  Button,
  TextField,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { Stack } from "@mui/system";
import { API, Frontend_API } from "src/api";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as Yup from "yup";
import { useFormik } from "formik";
import { useRouter } from "next/router";
import { Layout as AuthLayout } from "src/layouts/auth/layout";
import { encryptPassword } from "src/utils/encryptPassword";

function Page() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(0); // 0 = form | 1 = success | -1 = link invalid
  const [loading, setLoading] = useState(false);

  const resetId = router.query.resetId;

  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .required("New Password is required")
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Must contain at least one uppercase")
      .matches(/[a-z]/, "Must contain at least one lowercase")
      .matches(/\d/, "Must contain at least one number")
      .matches(/[@$!%*?&]/, "Must contain one special char (@$!%*?&)"),

    retypePassword: Yup.string()
      .required("Retype Password is required")
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
  });

  const formik = useFormik({
    initialValues: { newPassword: "", retypePassword: "" },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const encryptedPassword = encryptPassword(
          values.newPassword,
          process.env.NEXT_PUBLIC_IV,
          process.env.NEXT_PUBLIC_SecretKey
        );
    
        const result = await axios.post(`${API}/users/password/reset`, {
          resetId,
          password: encryptedPassword,
        });
    
        setStatus(1); // success
        setTimeout(() => router.push(`${Frontend_API}/auth/signin`), 4000);
      } catch (error) {
        console.log("error object:", error);
        
        // Access error response correctly
        const errMsg =
          error?.response?.data?.errors?.[0] || "Password reset failed.";
        setMessage(errMsg);
    
        if (errMsg.includes("expired") || errMsg.includes("used")) {
          setStatus(-1); // link invalid
        }
    
        setLoading(false);
      }
    },
  });

  const handleClose = () => setMessage("");

  return (
    <>
      {/* Error Message Snackbar */}
      <Snackbar
        open={!!message}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={handleClose}
      >
        <Alert severity="error" variant="filled" sx={{ fontSize: 16 }}>
          {message}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          height: "85vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: 2,
        }}
      >
        <Paper elevation={6} sx={{ p: 4, width: 450, borderRadius: 4 }}>
          {/* ---------------- FORM ---------------- */}
          {status === 0 && (
            <Stack spacing={3}>
              <Typography variant="h4" sx={{ textAlign: "center", mb: 2 }}>
                Reset Password
              </Typography>

              <form onSubmit={formik.handleSubmit}>
                <Stack spacing={2}>
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    id="newPassword"
                    name="newPassword"
                    value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.newPassword &&
                      Boolean(formik.errors.newPassword)
                    }
                    helperText={
                      formik.touched.newPassword && formik.errors.newPassword
                    }
                  />

                  <TextField
                    label="Retype Password"
                    type="password"
                    fullWidth
                    id="retypePassword"
                    name="retypePassword"
                    value={formik.values.retypePassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.retypePassword &&
                      Boolean(formik.errors.retypePassword)
                    }
                    helperText={
                      formik.touched.retypePassword &&
                      formik.errors.retypePassword
                    }
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    sx={{ height: 45 }}
                  >
                    {loading ? <CircularProgress size={22} /> : "Submit"}
                  </Button>
                </Stack>
              </form>
            </Stack>
          )}

          {/* ---------------- SUCCESS ---------------- */}
          {status === 1 && (
            <Stack spacing={3} alignItems="center">
              <Typography variant="h4" color="success.main">
                Password Reset Successful!
              </Typography>
              <CircularProgress />
              <Typography variant="subtitle1">
                Redirecting to login...
              </Typography>
            </Stack>
          )}

          {/* ---------------- LINK INVALID ---------------- */}
          {status === -1 && (
            <Stack spacing={2} alignItems="center">
              <Typography variant="h4" color="error.main" sx={{ textAlign: "center" }}>
                Link Invalid or Expired
              </Typography>
              {/* <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                onClick={() => router.push(`${Frontend_API}/auth/forgot-password`)}
              >
                Request New Reset Link
              </Button> */}
            </Stack>
          )}
        </Paper>
      </Box>
    </>
  );
}

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;
export default Page;
