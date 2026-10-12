import Head from 'next/head';
import { useRouter } from 'next/router';

import { Box, Button, Chip, Container, Unstable_Grid2 as Grid, Icon, Paper, Stack, Typography } from '@mui/material';
import { indigo } from '@mui/material/colors';
// import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
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

import CallIcon from '@mui/icons-material/Call';

import FlightLandIcon from '@mui/icons-material/FlightLand';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import React, { useEffect, useState } from 'react';
import { Email } from '@mui/icons-material';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { API } from 'src/api';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});


const Page = () => {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [canelOpen, setCancelOpen] = React.useState(false);
  const [orgType, setOrgType] = useState(true)
  const [priority, setPriority] = useState('low')
  const [data, setData] = useState([]);
  const { type, visitors } = router.query;
  const [decodedData, setDecodedData] = useState([])
  const [verified, setVerified] = useState(false);
  const [isValidationError, setIsValidationError] = useState(false);
  const [isErrorFromServer, setIsErrorFromServer] = useState(false);
  const [isApproveSubmitted, setIsApproveSubmitted] = useState(false);
  const [approveButton, setApproveButton] = useState(false);
  const [cancelButton, setCancelButton] = useState(false);
  const [statusFromServer, setStatusFromServer] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
const [errorOpen, setErrorOpen] = useState(false);


  const { pnr } = router.query;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCancelClickOpen = () => {
    setCancelOpen(true);
  };

  const handleCancelClose = () => {
    setCancelOpen(false);
  };
  const priorityColors = {
    'low': 'info.main',
    'medium': 'warning.main',
    'high': 'error.main'
  }


    const fetchData1 = async () => {
      try {
        if (!pnr ) return;
            console.log("Fetching data for PNR:", pnr);
        const response = await axios.get(`${API}/handleVisits/approvalIndDetails/visitor//${pnr}`);
        console.log("response.data server::", response.data.data);
        setData(response.data.data);
        if (response.data.data.visitStatus === 'Cancelled') {
          setApproveButton(true)
          setCancelButton(true)


        } else if (response.data.data.visitStatus === 'Planned' && response.data.data.approveByHost === true) {
          console.log("i am in false statement")
          setApproveButton(true)
          setCancelButton(false)

        } else if (response.data.data.visitStatus === 'Planned' && response.data.data.approveByHost === false) {
          console.log("i am in false statement")
          setApproveButton(false)
          setCancelButton(false)

        }
        let visitend=response.data.data.visitEnd;
        setDecodedData(visitend)
        setVerified(true)

      } catch (error) {
        console.error('Error fetching data:', error);
        setStatusFromServer(false)
      }

    };

          useEffect(() => {
            if (pnr) {
              fetchData1();
            }
          }, [pnr]);


  const handleCancel = async () => {
    try {
        await sendDataToBackend1({ ...data, approveByHost: false }); // Pass headers separately
        setIsApproveSubmitted(false);
    

    } catch (error) {
      console.error('Error approving:', error);
      setIsValidationError(true);
    }
  };

  const sendDataToBackend1 = async (modifiedData) => { // Receive headers as a separate argument
    try {
        const backendEndpoint = `${API}/handleVisits/CancelIndVisit/visitor/${pnr}`;
        console.log("sendDataToBackend::", modifiedData);

        // Make a PUT request to the backend with headers
        const response = await axios.put(backendEndpoint, modifiedData);
        console.log("response after update::", response.data);
        setIsApproveSubmitted(true);
        setCancelButton(true);       // 🔒 disable cancel button
        setSuccessOpen(true);        // ✅ show success popup
        handleClose()
        handleCancelClose()
    } catch (error) {
      console.error('Error sending data to backend:', error);
      setIsApproveSubmitted(false); // Set to false to handle the submission state
      setErrorOpen(true);
    }
  };

  const isDateValid = () => {
    // Check if the date in decodedData is greater than today's date
    const today = new Date();
    const decodedDate = new Date(decodedData.visitend);

    return today > decodedDate;
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
            <title>
              PNR |Visitor Management System Devias Kit
            </title>
          </Head>
          <React.Fragment>
          </React.Fragment>

          <React.Fragment>
            <Dialog
              open={canelOpen}
              TransitionComponent={Transition}
              keepMounted
              onClose={handleCancelClose}
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle>{"Cancel the Meeting?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                  By Cancelling, you&apos;re not allowed to visit.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancel}>Proceed</Button>
                <Button onClick={handleCancelClose}>Close</Button>
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
                      data.visitorName
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
                      data.organisation
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
                      data.visitorsCount
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
                        data.purpose
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
                      data.contact
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
                      data.email
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
                      data.visitStart
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
                      data.visitEnd
                    }
                  </Typography>
                </Grid>
                <Grid item xs={12} display={'flex'} justifyContent={'center'}>
                  <Button variant='contained' sx={{ backgroundColor: 'error.main', mx: 2 }} onClick={handleCancelClickOpen} disabled={cancelButton === true}>
                    Cancel Visit
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Box>
          <Snackbar
  open={successOpen}
  autoHideDuration={3000}
  onClose={() => setSuccessOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert
    severity="success"
    variant="filled"
    onClose={() => setSuccessOpen(false)}
  >
    Visit cancelled successfully!
  </Alert>
</Snackbar>

<Snackbar
  open={errorOpen}
  autoHideDuration={3000}
  onClose={() => setErrorOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert
    severity="error"
    variant="filled"
    onClose={() => setErrorOpen(false)}
  >
    Failed to cancel visit. Please try again.
  </Alert>
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

}

export default Page;
