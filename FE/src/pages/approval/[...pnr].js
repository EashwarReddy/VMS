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
    Typography
  } from "@mui/material";
  import MuiAlert from '@mui/material/Alert';
  import axios from 'axios';
  import Head from "next/head";
// Use makeStyles from @material-ui/core/styles

const SpecificApproval = () => {
    // Access the router object
    const router = useRouter();

    // Get the pnr and token from the query parameters
    const { pnr } = router.query;
    const PNR = router.query["pnr][token"];

const [verified, setVerified] = useState(false);



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
        setVerified(true);
        handleSubmit()
      }
    });

   
  } catch (error) {
    console.error('Token verification failed:', error);
    // If verification fails, do nothing (verified remains false)
  }
};

    // Define the logic for handling a specific approval request
    const handleSpecificApproval = async () => {
        try {
            // Implement your specific approval logic here
            // This function will handle the approval request for a specific [pnr]_[token] combination
            console.log(`Approval for PNR: ${PNR}, Token: ${token} handled successfully`);
        } catch (error) {
            console.error('Error handling specific approval:', error);
        }
    };
    const [accommodationRating, setAccommodationRating] = useState(0);
    const [travelConvenienceRating, setTravelConvenienceRating] = useState(0);
    const [feedbackComment, setFeedbackComment] = useState('');
    const [isFeedbackSubmitted, setIsFeedbackSubmitted] = useState(false);
    const [isValidationError, setIsValidationError] = useState(false);
    const [isErrorFromServer,setIsErrorFromServer] = useState(false);
    const handleAccommodationRatingChange = (newRating) => {
      setAccommodationRating(newRating);
    };
  
    const handleTravelConvenienceRatingChange = (newRating) => {
      setTravelConvenienceRating(newRating);
    };
  
    const handleCommentChange = (event) => {
      setFeedbackComment(event.target.value);
    };
  
    const handleSubmit = async() => {
      // Handle form submission (send feedback, etc.)
      if (accommodationRating === 0 || travelConvenienceRating === 0 || feedbackComment.trim() === '') {
        setIsValidationError(true);
        return;
      }else{
        console.log('Submitted feedback:', {
          accommodationRating,
          travelConvenienceRating,
          feedbackComment,
        });
  
        
        try {
          const data = {
            accommodationRating,
            travelConvenienceRating,
            feedbackComment,
            feedbackProvided:true
          };
      console.log("data::",data);
      console.log("Token in handleSubmit function::",pnr[1])    
      const headers = {
        Authorization: `Bearer ${pnr[1]}` // Assuming your token is a bearer token
      };
      const response = await axios.post('https://10.244.3.33:8000/api/v1/feedback/postfeedback', data, {
        headers: headers
      });
           setIsFeedbackSubmitted(true);
          setAccommodationRating(0)
          setTravelConvenienceRating(0)
          setFeedbackComment('')
            // Show confirmation message
            
          // Handle the response as needed
          console.log('Server response:', response.data);
        } catch (error) {
          // Handle errors
          console.error('Error sending data to server:', error);
          // setIsValidationError(true);
          setIsErrorFromServer(true);
        }
        
     
       
    // setIsValidationError(false);
      }
  
    
  
    };
    const handleCloseSnackbar = () => {
      setIsFeedbackSubmitted(false);
      setIsValidationError(false);
      setIsErrorFromServer(false)
  
    };
    return (
        <div>
            {verified ? (
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
         <div>
     <h2>Accommodation and Travel Feedback Form</h2>

     <div>
       <p>Accommodation Rating:</p>
       {[1,2,3,4,5].map((star) => (
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
       {[1,2,3,4,5].map((star) => (
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
         cols="50"
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


   </div>
   </Grid>
         </Container>
         </Box>
         {/* Snackbar for feedback confirmation */}
         <Snackbar
       open={isFeedbackSubmitted || isValidationError || isErrorFromServer}
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
      : isErrorFromServer
      ? 'Feedback Already Provided.'
      : 'Feedback Submitted Successfully!'}
       </MuiAlert>
     </Snackbar>
   </>            ) : (
             
        
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
              
    
            )}
        </div>
    );
};

export default SpecificApproval;
