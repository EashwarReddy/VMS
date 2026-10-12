// src/pages/approval/[pnr]_[token].js
import { useRouter } from 'next/router';
import React, { useEffect ,useState} from 'react';
import jwt from 'jsonwebtoken';


import {
    Box,
    Button,
    Container,
    Grid,
    Snackbar,
    Typography,
    Paper
  } from "@mui/material";
  import MuiAlert from '@mui/material/Alert';
  import axios from 'axios';
  import Head from "next/head";
import { decode } from 'punycode';
// Use makeStyles from @material-ui/core/styles

const CancelByVisitor = () => {
    // Access the router object
    const router = useRouter();

    // Get the pnr and token from the query parameters
    const { pnr } = router.query;
    const PNR = router.query["pnr][token"];

const [verified, setVerified] = useState(false);
const [decodedData,setDecodedData] = useState([]);
const [expiredDate,setExpiredDate] = useState([]);
const [approvedFromServer,setApprovedFromServer] = useState(false);
const [cancelledFromServer,setCancelledFromServer] = useState(false);
const [statusFromServer,setStatusFromServer] = useState(false);

const [isApproveSubmitted, setIsApproveSubmitted] = useState(false);
const [isValidationError, setIsValidationError] = useState(false);
const [isErrorFromServer,setIsErrorFromServer] = useState(false);

useEffect(() => {
  if (pnr) {
    verifyToken(pnr);
  }


  // Cleanup function to run when the component is unmounted
  return () => {
    // Cleanup logic if needed
  };
}, [pnr]);

const verifyToken = async(token) => {
  try {
    // Assuming token is a string
    console.log("verifyToken::",token[1])
    console.log("typeOf::",typeof(token[1]))
    jwt.verify(token[1], 'secret', { algorithms: ['HS256'] }, function(err, decoded) {
        // const verifiedToken = jose.JWT.verify(token, key);
 
    if (err) {
        console.error('Token verification failed:', err);
        // Handle the error
      } else {
        // Token is valid, and decoded contains the payload
        console.log('Token verified:', decoded);
        // If verification succeeds, setVerified to true
        setDecodedData(decoded)
        // setExpiredDate(decoded.user.expiredDate)
        // setStatusFromServer(decoded.user.approvedByHost)

        setVerified(true);
        handleApprove(decoded)
      }
    });

   
  } catch (error) {
    console.error('Token verification failed:', error);
    // If verification fails, do nothing (verified remains false)
  }
};
const isDateValid = () => {
  // Check if the date in decodedData is greater than today's date
  const today = new Date();
  const decodedDate = new Date(decodedData);

  return today > decodedDate;
};
    // Define the logic for handling a specific approval request
    const handleApprovedByHost = async () => {
        try {
            // Implement your specific approval logic here
            // This function will handle the approval request for a specific [pnr]_[token] combination
            console.log(`Approval for PNR: ${PNR}, Token: ${token} handled successfully`);
        } catch (error) {
            console.error('Error handling specific approval:', error);
        }
    };
   
   
    const handleApprove = async () => {
      try {
        // Send data to the backend with approve status
        const headers = {
          Authorization: `Bearer ${pnr[1]}` // Assuming your token is a bearer token
        };
        await sendDataToBackend({ ...decodedData.visitorsDetails, status: 'approved',headers });
        setIsApproveSubmitted(false)
      } catch (error) {
        console.error('Error approving:', error);
        setIsValidationError(true)

      }
    };
  
    // const handleCancel = async () => {
    //   try {
    //     // Send data to the backend with cancel status
    //     const headers = {
    //       Authorization: `Bearer ${pnr[1]}` // Assuming your token is a bearer token
    //     };
    //     await sendDataToBackend({ ...decodedData.user, status: 'canceled',headers });
    //   } catch (error) {
    //     console.error('Error canceling:', error);
    //   }
    // };
  

    

    const handleCancel = async () => {
      try {
        // Prepare the data to be sent to the backend
        const requestData = {
          ...decodedData.visitorsDetails,
          status: 'canceled' // Update the status to 'canceled'
        };
    
        // Set up headers for authorization
        const headers = {
          Authorization: `Bearer ${pnr[1]}` // Assuming your token is a bearer token
        };
    
        // Make a PUT request to the backend
        const response = await axios.put(`/api/cancel-visit/${pnr}`, requestData, { headers });
    
        // Check if the request was successful
        if (response.status === 200) {
          setCancelledFromServer(true); // Update state to reflect successful cancellation
          setStatusFromServer('canceled'); // Update status in the component state
        } else {
          console.error('Failed to cancel visit:', response.data);
          setIsErrorFromServer(true); // Update state to handle server error
        }
      } catch (error) {
        console.error('Error canceling:', error);
        setIsErrorFromServer(true); // Update state to handle server error
      }
    };
    
    const sendDataToBackend = async (data) => {
      // Replace the URL with your actual backend endpoint
      // const backendEndpoint = 'https://10.244.3.33:8000/api/v1/approveedByHost/';
      console.log("sendDataToBackend::",data)
      // Make a POST request to the backend
      // await axios.post(backendEndpoint, data);
      setIsApproveSubmitted(true)
    };
    const handleCloseSnackbar = () => {
      setIsApproveSubmitted(false);
      setIsValidationError(false);
      setIsErrorFromServer(false)
  
    };

    if (verified) {
      if (isDateValid()) {
        // Render the component for verified and with expireDate
        return (
          <>
          <Head>
            <title>cancelled Visit</title>
          </Head>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              py: 8,
              backgroundColor: '#f0f0f0',
            }}
          >
            <Container maxWidth="sm">
              <Grid container justifyContent="center" alignItems="center">
                <Paper
                  elevation={3}
                  sx={{
                    padding: '2rem',
                    textAlign: 'center',
                  }}
                >
                  {/* Beautiful styling for expired visit */}
                  <Typography variant="h4" color="error" gutterBottom>
                    Your Visit Has cancelled
                  </Typography>
                  {/* <Typography variant="body1" gutterBottom>
                    We are sorry, but your visit has cancelled. Please contact the administrator for assistance.
                  </Typography> */}
                  {/* <Button variant="contained" color="primary">
                    Back to Home
                  </Button> */}
                </Paper>
              </Grid>
            </Container>
          </Box>
        </>
        );
      } else {
        // Render the default component for verified
        return (
          <>
          <Head>
            <title>Visitor cancellation Form</title>
          </Head>
          <Box
           component="main"
           sx={{
             flexGrow: 1,
             py: 8,
             backgroundColor: '#f0f0f0', // Set a background color for better visibility
           }}
         >
           <Container maxWidth="sm">
             <Grid container justifyContent="center" alignItems="center">
               {/* Middle Box displaying data */}
               <Paper
                 elevation={3}
                 sx={{
                   padding: '2rem',
                   textAlign: 'center',
                 }}
               >
                 {/* Display your data here using Typography */}
                 <Typography variant="h6" gutterBottom>
                   Visitor Information
                 </Typography>
                
               
                 <Grid container justifyContent="center" spacing={2} mt={2}>
                 {/* <Grid item>
                   <Button disabled={statusFromServer===true}variant="contained" color="primary" onClick={handleApprove}>
                     Approve
                   </Button>
                 </Grid> */}
                 <Grid item>
                   <Button disabled={statusFromServer===false} variant="contained" color="secondary" onClick={handleCancel}>
                     Cancel
                   </Button>
                 </Grid>
               </Grid>
               </Paper>         
             </Grid>
           </Container>
         </Box>
              {/* Snackbar for feedback confirmation */}
              <Snackbar
            open={isApproveSubmitted || isValidationError || isErrorFromServer}
            autoHideDuration={3000} // Adjust the duration as needed
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              onClose={handleCloseSnackbar}
              severity={isValidationError ? 'error' : 'success'}
            >
              {isValidationError
           ? 'Please Approve.'
           : isErrorFromServer
           ? ' Already Approved Provided.'
           : 'Approved  Successfully!'}
            </MuiAlert>
          </Snackbar>
        </> 
        );
      }
    } else {
      // Render a different component for not verified
      return (
        <>
          {/* Your component for not verified */}
          {/* Add your component JSX here */}
          <Box
             display="flex"
             justifyContent="center"
             alignItems="center"
             height="100vh"
           >
             <Box>
               <Typography variant="h4" color="error" align="center" gutterBottom>
                 Error: Invalid Token
               </Typography>
               <Typography variant="body1" align="center">
                 Please check your credentials and try again.
               </Typography>
               {/* You can add more information or actions here */}
             </Box>
           </Box>
              
    
        </>
      );
    }
};

export default CancelByVisitor;
