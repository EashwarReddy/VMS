/////index.js
import React, { useState, useRef, useEffect } from "react";
import { Box, Container } from "@mui/material";
import { useRouter } from "next/router";
import { useMediaQuery } from '@mui/material';
import Webcam from 'react-webcam';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';

const Page = ()=>{
  const router = useRouter();
  const camera = useRef(null);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [image, setImage] = useState(null);
  const isMobileScreen = useMediaQuery('(min-width:600px)');
  const [ratio, setRatio] = useState(9 / 16);

  useEffect(() => {
    if (isMobileScreen) {
      setRatio(9 / 16);
    } else {
      setRatio(1); // Use a ratio of 1 for non-mobile screens if "cover" is not valid
    }
  }, [isMobileScreen]);

  const capture = () => {
    const imageSrc = camera.current.getScreenshot();
    rotateImage(imageSrc, 90, (image) => {
      setImage(image);
      localStorage.setItem('myPhoto', image);
      router.push("/result_photo");
    });
  };

  const rotateImage = (imageBase64, rotation, cb) => {
    const img = new Image();
    img.src = imageBase64;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      cb(canvas.toDataURL("image/jpeg"));
    };
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
          position: 'relative',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Webcam
            ref={camera}
            screenshotFormat="image/jpeg"
            videoConstraints={{ aspectRatio: ratio }}
            style={{ width: '100%', height: 'auto' }}
          />
          <img
            src="/camera.svg"
            width="70px"
            height="70px"
            alt="Logo"
            style={{ position: 'absolute', bottom: '10%' }}
            onClick={capture}
          />
        </Box>
      </Container>
    </Box>
  );
}
Page.getLayout = (page) => (
  <DashboardLayout>
      {page}
  </DashboardLayout>
);

export default Page;

