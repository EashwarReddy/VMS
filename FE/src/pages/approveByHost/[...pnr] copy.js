// src/pages/approval/[pnr]_[token].js
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';


import {
  Box,
  Button,
  Container,
  Grid,
  Snackbar,
  Typography,
  Paper,
  Chip,
  Icon,
  Stack
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import axios from 'axios';
import Head from "next/head";
import { decode } from 'punycode';
// Use makeStyles from @material-ui/core/styles
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import PersonIcon from '@mui/icons-material/Person';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CallIcon from '@mui/icons-material/Call';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { indigo } from '@mui/material/colors';
import { Email } from '@mui/icons-material';
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ApprovedByHost = () => {
  // Access the router object
  const router = useRouter();
  const priorityColors = {
    'low': 'info.main',
    'medium': 'warning.main',
    'high': 'error.main'
  }
  const [orgType, setOrgType] = useState(true)
  const [priority, setPriority] = useState('low')
  // Get the pnr and token from the query parameters
  const { pnr } = router.query;
  const PNR = router.query["pnr][token"];

  const [verified, setVerified] = useState(false);
  const [decodedData, setDecodedData] = useState([]);
  const [expiredDate, setExpiredDate] = useState([]);
  const [approvedFromServer, setApprovedFromServer] = useState(false);
  const [cancelledFromServer, setCancelledFromServer] = useState(false);
  const [statusFromServer, setStatusFromServer] = useState(false);

  const [isApproveSubmitted, setIsApproveSubmitted] = useState(false);
  const [isValidationError, setIsValidationError] = useState(false);
  const [isErrorFromServer, setIsErrorFromServer] = useState(false);

  useEffect(() => {

    const fetchData = async () => {
      try {
        const pnr = pnr[0]; // Assuming you have a 'pnr' variable defined somewhere

        // Set your token value
        const token = pnr[1];

        const response = await axios.get(`https://10.244.3.33:8000/api/v1/${pnr}`, {
          headers: {
            'Authorization': `Bearer ${token}` // Set your token in the Authorization header
          }
        });

        // Handle response data here
        console.log(response.data);
        verifyToken(pnr);
      } catch (error) {
        // Handle errors
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    if (pnr) {
      verifyToken(pnr);
    }


    // Cleanup function to run when the component is unmounted
    return () => {
      // Cleanup logic if needed
    };
  }, [pnr]);

  const verifyToken = async (token) => {
    try {
      // Assuming token is a string
      console.log("verifyToken::", token[1])
      console.log("typeOf::", typeof (token[1]))
      jwt.verify(token[1], 'secret', { algorithms: ['HS256'] }, function (err, decoded) {
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
    const decodedDate = new Date(decodedData.visitorDetails.date);

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
      await sendDataToBackend({ ...decodedData.user, status: 'approved', headers });
      setIsApproveSubmitted(false)
    } catch (error) {
      console.error('Error approving:', error);
      setIsValidationError(true)

    }
  };

  const handleCancel = async () => {
    try {
      // Send data to the backend with cancel status
      const headers = {
        Authorization: `Bearer ${pnr[1]}` // Assuming your token is a bearer token
      };
      await sendDataToBackend({ ...decodedData.user, status: 'canceled', headers });
    } catch (error) {
      console.error('Error canceling:', error);
    }
  };

  const sendDataToBackend = async (data) => {
    // Replace the URL with your actual backend endpoint
    // const backendEndpoint = 'https://10.244.3.33:8000/api/v1/approveedByHost/';
    console.log("sendDataToBackend::", data)
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
            <title>Expired Visit</title>
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
                    Your Visit Has Expired
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    We are sorry, but your visit has expired. Please contact the administrator for assistance.
                  </Typography>
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
            <title>Visitor Approval Form</title>
          </Head>
          <React.Fragment>
            <Dialog
              open={open}
              TransitionComponent={Transition}
              keepMounted
              onClose={handleClose}
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle>{"Approve the Meeting?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                  By approving you are taking full responsibility of the individual who is visiting, when in campus.
                  if any incident occurs, you will be called for further enquiry.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Disagree</Button>
                <Button onClick={handleClose}>Agree</Button>
              </DialogActions>
            </Dialog>
          </React.Fragment>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              py: 8,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: indigo[50]
            }}
          >
            <Container maxWidth="xl" component={Paper} sx={{ p: 4, borderRadius: 5 }} elevation={5}>
              <Grid container xs={12} spacing={1} >
                <Grid container xs={12} sx={{ backgroundColor: indigo[50], borderRadius: 5, mb: 1 }}>
                  <Grid item xs={2} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                    <Chip label="Priority: Low" sx={{ height: 40, width: 200, backgroundColor: priorityColors[priority], fontWeight: 600, fontSize: '1.3em' }} />
                  </Grid>
                  <Grid item xs={10} display={'flex'} justifyContent={'flex-start'} sx={{ pl: 50 }} >
                    <img src='/assets/800px-CDAC_LOGO_crop.png' style={{
                      height: 75,
                    }} alt="CDAC Logo" />
                  </Grid>
                </Grid>

                <Grid item xs={6}>

                  <Typography fontWeight={600} variant='h6' display={'flex'} alignItems={'center'}>
                    <Icon>
                      <PersonIcon />
                    </Icon>
                    Name of the Visitor
                  </Typography>
                  <Typography variant='h6' sx={{ m: 1 }}>
                    {
                      'name'
                    }
                  </Typography>
                </Grid>
                <Grid item xs={orgType ? 3 : 6}>
                  <Typography fontWeight={600} variant='h6' display={'flex'} alignItems={'center'}>
                    <Icon>
                      <MapsHomeWorkIcon />
                    </Icon>Organisation
                  </Typography>
                  <Typography variant='body1' sx={{ m: 1 }}>
                    {
                      'org'
                    }
                  </Typography>
                </Grid>
                {orgType && <Grid item xs={3}>
                  <Typography fontWeight={600} variant='h6' display={'flex'} alignItems={'center'}>
                    <Icon>
                      <PeopleAltIcon />
                    </Icon>
                    Number of People
                  </Typography>
                  <Typography variant='body1' sx={{ m: 1 }}>
                    {
                      '9001'
                    }
                  </Typography>
                </Grid>}
                <Grid item xs={12} display={'flex'} justifyContent={'flex-start'} sx={{
                  p: 2
                }}>
                  <Stack direction={'column'}>
                    <Typography fontWeight={600} variant='h6' display={'flex'} alignItems={'center'} >
                      <Icon>
                        <BusinessCenterIcon />
                      </Icon>   Purpose
                    </Typography>
                    <Typography variant='body1' sx={{ m: 1 }}>
                      {
                        'Purpose'
                      }
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontWeight={600} variant='h6' display={'flex'} alignItems={'center'} >
                    <Icon>
                      <CallIcon />
                    </Icon>   Contact Number
                  </Typography>
                  <Typography variant='body1' sx={{ m: 1 }}>
                    {
                      'Contact Number'
                    }
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontWeight={600} variant='h6' display={'flex'} alignItems={'center'} >
                    <Icon>
                      <Email />
                    </Icon>  Email
                  </Typography>
                  <Typography variant='body1' sx={{ m: 1 }}>
                    {
                      'Email'
                    }
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontWeight={600} variant='h6' display={'flex'} alignItems={'center'} >
                    <Icon>
                      <FlightLandIcon />
                    </Icon>Arrival Date and Time
                  </Typography>
                  <Typography variant='body1' sx={{ m: 1 }}>
                    {
                      'Arrival Date & Time'
                    }
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontWeight={600} variant='h6' display={'flex'} alignItems={'center'} >
                    <Icon>
                      <FlightTakeoffIcon />
                    </Icon>Departure Date and Time
                  </Typography>
                  <Typography variant='body1' sx={{ m: 1 }}>
                    {
                      'Departure Date & Time'
                    }
                  </Typography>
                </Grid>
                <Grid item xs={12} display={'flex'} justifyContent={'center'}>

                  <Button variant='contained'
                    sx={{ backgroundColor: 'success.main', mx: 2 }}
                    onClick={handleClickOpen}
                  >
                    Approve
                  </Button>
                  <Button variant='contained' sx={{ backgroundColor: 'error.main', mx: 2 }}>
                    Reject
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Box>
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
          component="main"
          sx={{
            flexGrow: 1,
            py: 8,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: indigo[50]
          }}
        >
          <Container maxWidth="xl" component={Paper} sx={{ p: 4, borderRadius: 5 }} elevation={5}>
            <Grid container xs={12} spacing={1} >
              <Grid container xs={12} sx={{ backgroundColor: indigo[50], borderRadius: 5, mb: 1, p : 1 }}>
                <Grid item xs={12} display={'flex'} justifyContent={'center'}  >
                  <img src='/assets/800px-CDAC_LOGO_crop.png' style={{
                    height: 75,
                  }} alt="CDAC Logo" />
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h4" color="error" align="center" gutterBottom>
                  Error: Invalid Token
                </Typography>
                <Typography variant="body1" align="center">
                  Please check your credentials and try again.
                </Typography>
              </Grid>

              {/* You can add more information or actions here */}
            </Grid>
          </Container></Box>

      </>
    );
  }
};

export default ApprovedByHost;
