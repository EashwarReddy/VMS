import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Typography
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import { indigo } from '@mui/material/colors';
import useMediaQuery from '@mui/material/useMediaQuery';
import Head from "next/head";
import { useState } from 'react';
import { useAuth } from 'src/hooks/use-auth';
import axios from 'src/api/axios';
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
const Page = () => {
  const [accommodationRating, setAccommodationRating] = useState(0);
  const [travelConvenienceRating, setTravelConvenienceRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
  const [isValidationError, setIsValidationError] = useState(false);
  const auth = useAuth();
  const [state, setState] = useState({})

  const handleAccommodationRatingChange = (newRating) => {
    setAccommodationRating(newRating);
  };

  const handleTravelConvenienceRatingChange = (newRating) => {
    setTravelConvenienceRating(newRating);
  };

  const handleCommentChange = (event) => {
    setFeedbackComment(event.target.value);
  };

  const handleSubmit = () => {
    // Handle form submission (send feedback, etc.)
    if (accommodationRating === 0 || travelConvenienceRating === 0 || feedbackComment.trim() === '') {
      setIsValidationError(true);
      return;
    } else {
      console.log('Submitted feedback:', {
        accommodationRating,
        travelConvenienceRating,
        feedbackComment,
      });
      
      const data = {
        pnr:'12345',
accommodationRating:accommodationRating,
travelConvenienceRating:travelConvenienceRating,
feedbackComment:feedbackComment,
feedbackProvided:true,
        
      };
      const token = auth?.user?.accessToken
      console.log("token::",token)
  const headers = {
    'Authorization': `Bearer ${token}`
  }
      axios.post('/feedback/postfeedback', data,{headers})
        .then(response => {
          // Handle success
          console.log('Data sent successfully:', response.data);
         
          // You can also perform any additional actions here, such as showing a success message to the user
        })
        .catch(error => {
          // Handle error
          console.error('Error sending data:', error);
          setAccommodationRating(0)
          setTravelConvenienceRating(0)
          setFeedbackComment('')
          // Show confirmation message
          setIsFeedbackSubmitted(true);
          // You can also show an error message to the user
        });
     

      // setIsValidationError(false);
    }



  };
  const handleCloseSnackbar = () => {
    setIsFeedbackSubmitted(false);
    setIsValidationError(false);

  };
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  
  return (
    <>
      <Head>
        <title>Feedback Form</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          backgroundColor : indigo[50]
        }}
      >
        <Container>
          <Grid container justifyContent="center" component={Paper} elevation={5}>
            <Grid item xs={12} sx={{ backgroundColor: indigo[50], borderRadius: 5, p: 2, m: 1 }}>
              <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={2}>
                <img src='/assets/800px-CDAC_LOGO_crop.png' style={{
                  height: 75,
                }} alt="CDAC Logo" />
                <Typography variant="h4" align="center">Feedback Form</Typography>
              </Stack>


            </Grid>
            <Grid item xs={12} sx={{ px: 5, py : 2 }} display={'flex'} alignItems={'flex-start'} flexDirection={'column'}>

              <h2>Accommodation and Travel Feedback Form</h2>

              <div>
                <p>Accommodation Rating:</p>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleAccommodationRatingChange(star)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '2rem',
                      margin: '0.5rem',
                      color: star <= accommodationRating ? 'blue' : 'gray',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div>
                <p>Travel Convenience Rating:</p>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => handleTravelConvenienceRatingChange(star)}
                    style={{
                      cursor: 'pointer',
                      fontSize: '2rem',
                      margin: '0.5rem',
                      color: star <= travelConvenienceRating ? 'blue' : 'gray',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              <div>
                <p>Additional Comments:</p>
                <textarea
                  rows="4"
                  cols={ isSmallScreen ? "30" : "50" }
                  value={feedbackComment}
                  onChange={handleCommentChange}
                  placeholder="Enter your comments..."
                />
              </div>

              <Button
                variant="contained"
                color="primary"
                style={{ marginTop: '1rem' }}
                onClick={handleSubmit}
              >
                Submit Feedback
              </Button>


            </Grid>

          </Grid>
        </Container>
      </Box>
      {/* Snackbar for feedback confirmation */}
      <Snackbar
        open={isFeedbackSubmitted || isValidationError}
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
            ? 'Please fill out all fields before submitting.'
            : 'Feedback submitted successfully!'}
        </MuiAlert>
      </Snackbar>
    </>

  );
};

// export default FeedbackForm;
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;