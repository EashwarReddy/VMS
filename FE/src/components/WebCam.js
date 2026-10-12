import { Camera } from '@mui/icons-material';
import { Button, Switch, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { normalaxios } from 'src/api/axios';

const WebcamCapture = ({setPhoto}) => {
  const webcamRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [webcamAvailable, setWebcamAvailable] = useState(true);
  const [imageBlob, setImageBlob] = useState(null);
  const imageUrl = 'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'; // Replace with your image URL
 // Fetch image from URL and save it as a Blob
 useEffect(() => {
  const fetchImage = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      setImageBlob(blob); // Store the blob directly
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  fetchImage();
}, [imageUrl]);

  // Function to send the image to the backend
  const sendImageToBackend = async () => {
    if (!imageBlob) return;

    try {
      setPhoto(imageSrc)
      
     console.log('imageSRC', imageSrc)
  
    } catch (error) {
      console.error('Error sending image:', error);
    }
  };
  const capturePhoto = () => {
    if (webcamRef.current) {
      const image = webcamRef.current.getScreenshot();
      setImageSrc(image);
      console.log('image src', image)
    }
  };

  // const sendImageToBackend = async () => {
  //   if (!imageData) return;

  //   try {
 
  //     // Convert base64 back to a Blob object for FormData
  //     const byteString = atob(imageData.split(',')[1]);
  //     const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
  //     const arrayBuffer = new ArrayBuffer(byteString.length);
  //     const intArray = new Uint8Array(arrayBuffer);
  //     for (let i = 0; i < byteString.length; i++) {
  //       intArray[i] = byteString.charCodeAt(i);
  //     }
  //     const imageBlob = new Blob([intArray], { type: mimeString });
      
  //     setPhoto(imageBlob)
  //     // formData.sappend('image', imageBlob, 'image.png'); // You can name the file and specify the format

  //     // const response = await fetch('https://your-backend-url.com/upload', {
  //     //   method: 'POST',
  //     //   body: formData,
  //     // });

  //     // if (response.ok) {
  //     //   console.log('Image uploaded successfully!');
  //     // } else {
  //     //   console.error('Failed to upload image.');
  //     // }
  //   } catch (error) {
  //     console.error('Error sending image:', error);
  //   }
  // };

  const handleWebcamError = () => {
    setWebcamAvailable(true);
  };

  return (
    <div >
     {/* <Button startIcon={<Camera/>} disabled>{`Camera ${!!webcamAvailable ? 'On' : 'Off'}`}</Button> <Switch checked={!!webcamAvailable} onChange={(e)=>{setWebcamAvailable(e.target.checked)}}>Close Cam</Switch> */}
      {webcamAvailable ? (
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={400}
          onUserMediaError={handleWebcamError}
          style={{
            width: '100%',     // Makes the image take up the full width of the container
            height: '100%',    // Makes the image take up the full height of the container
            objectFit: 'cover' // Ensures the image covers the entire container without distortion
          }}
        />
      ) : (
        <img
          src="https://via.placeholder.com/400x300?text=No+Webcam+Available"
          alt="No Webcam Available"
          width={400}
          style={{
            width: '100%',     // Makes the image take up the full width of the container
            height: '100%',    // Makes the image take up the full height of the container
            objectFit: 'cover' // Ensures the image covers the entire container without distortion
          }}
        />
      )}
 {/* <Webcam /> */}
      <Button onClick={capturePhoto} variant='outlined' >
        Capture Photo
      </Button>

      {imageSrc && (
        <div>
          <h3>Captured Photo:</h3>
          <img src={imageSrc} alt="Captured"  style={{
          width: '100%',    
          height: '100%',    
          objectFit: 'cover'
        }} />
        </div>
      )}
      { <Button variant='contained' onClick={()=>{sendImageToBackend()}}>Save Photo</Button>}
    </div>
  );
};

export default WebcamCapture;
