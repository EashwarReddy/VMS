import React, { useState, useEffect } from "react";
import { Box, Button, Container, Typography, Stack } from "@mui/material";
import { useRouter } from "next/router";

export default function ResultPhoto() {
  const router = useRouter();
  const [myFoto, setMyFoto] = useState("");
  const [fileImage, setFileImage] = useState(null);

  useEffect(() => {
    const photo = localStorage.getItem('myPhoto');
    setMyFoto(photo);
    urltoFile(photo, "myPhotos.jpeg", "image/jpeg").then(file => {
      setFileImage(file);
    });
  }, []);

  const urltoFile = (url, filename, mimeType) => {
    return fetch(url)
      .then(res => res.arrayBuffer())
      .then(buf => new File([buf], filename, { type: mimeType }));
  };

  const reSelfie = () => {
    router.push("/");
  };

  return (
    <Box
      sx={{
        backgroundImage: { xs: 'none', md: '/112.png', lg: '/112.png' },
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        height: '100vh',
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          mt: { xs: 0, md: 2 },
          height: { xs: '100%', md: '50%', lg: '50%' },
          width: { xs: '100%', md: '50%', lg: '40%' },
          borderWidth: { xs: 0, md: 1 },
          backgroundColor: 'teal',
          justifyContent: 'center',
          overflow: 'hidden',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ height: 80, mb: 2 }}>
            {/* <img src="" width="80px" height="80px" alt="Logo" /> */}
          </Box>
          <Box sx={{ mt: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={myFoto}
                alt="Result Photo"
                style={{ borderRadius: '50%', objectFit: 'cover', width: 200, height: 200 }}
              />
            </Box>
          </Box>
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Typography variant="h6" align="center">Check your selfies photos.</Typography>
            <Typography variant="body2" align="center">Make sure your photos are not blurry, have enough light, and are not wearing a mask.</Typography>
          </Stack>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined" color="primary" sx={{ width: '60%', borderRadius: 1 }} onClick={reSelfie}>
              Take Re-Selfie
            </Button>
          </Box>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="warning" sx={{ width: '60%', borderRadius: 1 }}>
              Save Photo
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}