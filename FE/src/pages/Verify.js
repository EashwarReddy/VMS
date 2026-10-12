import { CircularProgress, Typography, Box, Button, Alert } from "@mui/material";
import { Stack } from "@mui/system";
import { API } from "src/api";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Layout as AuthLayout } from "src/layouts/auth/layout";
import { useRouter } from "next/router";

function Page() {
  const router = useRouter();
  const [status, setStatus] = useState(0);       // 0 = loading, 1 = success, -1 = error
  const [message, setMessage] = useState("");    // backend error or success message
  const [loading, setLoading] = useState(false);

  const id = router.query.id;

  const verifyUser = () => {
    if (!id) return;

    setStatus(0);
    setMessage("");
    setLoading(true);

    axios
      .get(`${API}/users/verify`, { params: { id } })
      .then((res) => {
        setStatus(1);
        setMessage("Verification successful! Redirecting to login...");

        setTimeout(() => router.push("/"), 3000);
      })
      .catch((error) => {
        setStatus(-1);

        // Extract backend message
        const backendMsg =
          error?.response?.data?.errors?.[0] ||
          error?.response?.data?.message ||
          "Verification failed. Please try again.";

        setMessage(backendMsg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (router.isReady) verifyUser();
  }, [router.isReady, id]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      {status === 0 && (
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="h6">Verifying, please wait...</Typography>
        </Stack>
      )}

      {status === 1 && (
        <Stack spacing={2} alignItems="center">
          <Alert severity="success" sx={{ fontSize: 18 }}>
            {message}
          </Alert>
          <CircularProgress />
          <Typography variant="subtitle2">Redirecting...</Typography>
        </Stack>
      )}

      {status === -1 && (
        <Stack spacing={3} alignItems="center">
          <Alert severity="error" sx={{ fontSize: 18 }}>
            {message}
          </Alert>

          {/* Retry button */}
          <Button
            variant="contained"
            color="warning"
            onClick={verifyUser}
            disabled={loading}
          >
            {loading ? "Retrying..." : "Retry Verification"}
          </Button>

          {/* Go home */}
          <Button variant="contained" color="primary" href="/" sx={{ width: "70%" }}>
            Go to Home
          </Button>
        </Stack>
      )}
    </Box>
  );
}

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;
