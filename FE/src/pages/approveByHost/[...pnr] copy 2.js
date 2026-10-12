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

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const Page = () => {
    const router = useRouter();

    const [open, setOpen] = React.useState(false);
    const [orgType, setOrgType] = useState(true)
    const [priority, setPriority] = useState('low')
    const { pnr } = router.query;
    const PNR = router.query["pnr][token"];

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    const priorityColors = {
        'low': 'info.main',
        'medium': 'warning.main',
        'high': 'error.main'
    }
    useEffect(() => {

        const fetchData = async () => {
            try {
                const pnr = pnr[0]; // Assuming you have a 'pnr' variable defined somewhere

                // Set your token value
                const token = pnr[1];

                const response = await axios.get(`https://10.244.3.101:8000/api/v1/handleVisits/approvalIndDetails${pnr}`, {
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
            jwt.verify(token[1], 'approvecancel', { algorithms: ['HS256'] }, function (err, decoded) {
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
    return (
        <>
            <Head>
                <title>
                    Overview | Devias Kit
                </title>
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
                            By approving, you&apos;re agreeing to be responsible for the visitors on campus. If there are any incidents, you might be asked to provide more information.
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


export default Page;
