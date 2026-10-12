import React, { useState } from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { useAuth } from "src/hooks/use-auth";
import { useRouter } from "next/router";

const SessionExpiredModal = ({ open, onClose }) => {
  const auth = useAuth();
    const router = useRouter();
  
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Your session has expired or logged in a different browser.
        </Typography>
             
        <Button variant="contained" color="primary" onClick={()=>{
          // auth.signOut(auth.user.accessToken);
          auth?.verifyUser(auth?.user?.accessToken, auth?.user?.id);
      router.push('/auth/signin');

          sessionStorage.removeItem('provider');
      localStorage.removeItem('userContext');
          }}>
          OK
        </Button>
      </Box>
    </Modal>
  );
};

export default SessionExpiredModal
