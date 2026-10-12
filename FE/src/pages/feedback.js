import Head from 'next/head';
import { Box, Button, Container, Unstable_Grid2 as Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { indigo } from '@mui/material/colors';
import { Layout as DashboardLayout } from 'src/layouts/auth/layout';
import React from 'react';
import Rating from '@mui/material/Rating';



const Page = () => {

    // const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(0);
    const [acc, setAcc] = React.useState(0);
    const [travel, setTravel] = React.useState(0);
    const [feedback, setFeedback] = React.useState('')
    const handleClickOpen = () => {

    };

    return (
        <>
            <Head>
                <title>
                    Visit Feedback
                </title>
            </Head>

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
                <Container maxWidth="xl" component={Paper} sx={{ p: 2 }}>
                    <Grid container xs={12} spacing={4}>
                        <Grid item xs={12} display={'flex'} alignItems={'center'}
                            flexDirection={'column'}
                        >
                            <Typography fontWeight={600} variant='h6'>
                                Overall Rating
                            </Typography>
                            <Rating
                                name="simple-controlled"
                                value={value}
                                onChange={(event, newValue) => {
                                    setValue(newValue);
                                }}
                                size="large"
                            />
                        </Grid>
                        <Grid item xs={6} display={'flex'} alignItems={'center'}
                            flexDirection={'column'}>
                            <Typography fontWeight={600} variant='h6'>
                                Accomodation
                            </Typography>
                            <Rating
                                name="simple-controlled"
                                value={acc}
                                onChange={(event, newValue) => {
                                    setAcc(newValue);
                                }}
                                size="large"
                            />
                        </Grid>
                        <Grid item xs={6} display={'flex'} alignItems={'center'}
                            flexDirection={'column'}>
                            <Typography fontWeight={600} variant='h6'>
                                Travelling
                            </Typography>
                            <Rating
                                name="simple-controlled"
                                value={travel}
                                onChange={(event, newValue) => {
                                    setTravel(newValue);
                                }}
                                size="large"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant='h6'>
                                Tell us what we can improve
                            </Typography>
                            <br />
                            <TextField
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                value={feedback}
                                onChange={(e) => { setFeedback(e.target.value) }}
                            />
                        </Grid>
                        <Grid item xs={6} >

                            <Button variant='contained'
                                sx={{ backgroundColor: 'success.main', mx: 2 }}
                                onClick={handleClickOpen}
                            >
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
}

// Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
