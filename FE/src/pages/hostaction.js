import Head from 'next/head';
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
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import CallIcon from '@mui/icons-material/Call';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import React, { useState } from 'react';
import { Email } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});


const Page = () => {

    const [open, setOpen] = React.useState(false);
    const [orgType, setOrgType] = useState(true)
    const [priority, setPriority] = useState('low')
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
    return (
        <>
            <Head>
                <title>
                    Host Action
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


export default Page;
