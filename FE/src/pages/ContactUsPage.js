// pages/ContactUsPage.js

import { Alert, Box, Button, Card, CardContent, Container, Grid, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { indigo } from '@mui/material/colors';
import Head from 'next/head';
import { useState } from 'react';

import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
const Page = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false); // State to manage the chat visibility


  const handleSubmit = (e) => {
    e.preventDefault();

    // Perform any necessary actions (e.g., send form data to a server)

    // Show success Snackbar
    setIsSnackbarOpen(true);

    // Reset form fields
    setName('');
    setEmail('');
    setMessage('');
  };

  const handleSnackbarClose = () => {
    setIsSnackbarOpen(false);
  };
  const handleChatToggle = () => {
    setIsChatOpen((prevIsChatOpen) => !prevIsChatOpen);
  };


  return (
    <>
      <Head>
        <title>Standard user Form</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container>
          <Grid container justifyContent="center">
            <Stack sx={{ backgroundColor: indigo[50], borderRadius: 5, width : '100%', p : 1, my:1 }} direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={2}>
              <img src='/assets/800px-CDAC_LOGO_crop.png' style={{
                height: 75,
              }} alt="CDAC Logo" />
              <Typography variant="h4" align="center">Contact Us</Typography>
            </Stack>

            <Grid container spacing={3}>
              {/* Contact Information */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">Contact Information</Typography>
                    <Typography>
                      Email: contact@cdac.in
                      <br />
                      Phone: +1 (123) 456-7890
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Location */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h5">Our Location</Typography>
                    <Typography>
                      Centre for Development of Advanced Computing
                      Plot No. 6 & 7, Hardware Park, Sy No. 1/1, Srisailam Highway, Keshavagiri Post
                      <br />
                      Hyderabad, Telangana, India
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Contact Form */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" style={{ marginBottom: '10px' }}>Send Us a Message</Typography>
                    {/* Add your contact form here */}
                    {/* You can use form components from Material-UI or any other library */}
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Your Name"
                            variant="outlined"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            label="Your Email"
                            variant="outlined"
                            fullWidth
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            label="Message"
                            variant="outlined"
                            multiline
                            rows={4}
                            fullWidth
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained" color="primary">
                            Submit
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>


            {/* Snackbar for success message */}
            <Snackbar
              open={isSnackbarOpen}
              autoHideDuration={2000} // Adjust the duration as needed
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                Message sent successfully!
              </Alert>
            </Snackbar>
            {/* Images */}
            <Grid container spacing={3} style={{ marginTop: '20px' }}>
              {/* Image 1 */}
              <Grid item xs={12} md={4}>
                <img src="/contact1.jpg" alt="Image 1" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              </Grid>
              {/* Image 2 */}
              <Grid item xs={12} md={4}>
                <img src="/contact2.png" alt="Image 2" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              </Grid>
              {/* Image 3 */}
              <Grid item xs={12} md={4}>
                <img src="/contact3.jpg" alt="Image 3" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              </Grid>
            </Grid>

          </Grid>
          {/* <Grid container spacing={3} sx={{ position: 'relative',marginLeft:'10%' }}>
             
              <Grid item xs={12} md={6} sx={{ position: 'absolute', bottom: '0', right: '0', margin: '20px' }}>
                <Button variant="contained" color="primary" onClick={handleChatToggle}>
                  Help
                </Button>
              </Grid>

    
              {isChatOpen && (
                <Grid item xs={12} md={6} sx={{ position: 'absolute', bottom: '0', right: '-30px', margin: '20px'  }}>
                  <Card>
                    <CardContent>
                      <Chatboat />
                    </CardContent>
                  </Card>
                </Grid>
              )}

            </Grid> */}
        </Container>
      </Box>
    </>
  );
};

// export default FeedbackForm;
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
