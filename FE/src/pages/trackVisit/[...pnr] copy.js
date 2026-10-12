// Import React and Material-UI components
import React, { useState,useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,Box
} from "@mui/material";
import Collapse from '@mui/material/Collapse';
import { blue, indigo } from "@mui/material/colors";
import Typography from '@mui/material/Typography';

import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useRouter } from "next/router";
import jwt from "jsonwebtoken";
import axios from 'axios';

// Define a functional component for the index page
const Track = () => {
  // Get today's date

  // State variables to track visit verification status
  const [visitVerified, setVisitVerified] = useState(true); // Set to true for testing
  const [visitNotVerified, setVisitNotVerified] = useState(false); // Set to false for testing
  const router = useRouter();
  const { pnr } = router.query;
  
  const [verified, setVerified] = useState(false);
//   useEffect(() => {
//     if (pnr) {
//       verifyToken(pnr);
      
//     }

//   // Cleanup function to run when the component is unmounted
//   return () => {
//     // Cleanup logic if needed
//   };
// }, [pnr]);
useEffect(() => {
  if (pnr) {
    const fetchData = async () => {
      try {
        const response = await axios.get(`https://10.244.3.33:8000/api/v1//${pnr}`);
        // Handle response data here
        console.log(response.data);
        verifyToken(pnr);
      } catch (error) {
        // Handle errors
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }

  // Cleanup function to run when the component is unmounted
  return () => {
    // Cleanup logic if needed
  };
}, [pnr]);
console.log("PNR::",pnr)

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

        setVerified(true);
        // If verification succeeds, setVerified to true
        setDecodedData(decoded)
        setExpiredDate(decoded.user.expiredDate)
        setStatusFromServer(decoded.user.approvedByHost)

        handleApprove(decoded)
      }
    });

   
  } catch (error) {
    console.error('Token verification failed:', error);
    // If verification fails, do nothing (verified remains false)
  }
};
  // Dummy data for accommodation details
  const visitDetails = [
    {
      pnr: "12345",
      fisrtName: "sushmita",
      lastName: "meena",
      purpose: "meeting",
      visitingDate: "06-03-2024",
      exitingDate: "07-03-2024",
    },
    // Add more dummy data objects as needed
  ];
  // Dummy data for accommodation details
  const accommodationDetails = [
    {
      accomodationName: "SN Grand",
      accomodationAddress: "Tukkuguda",
      checkInTime: "2024-03-10 09:00",
      checkOutTime: "2024-03-12 12:00",
      contactOfHotel: "1234567899",
      bookedBy: "John",
      bookedFor: "Sushmita",
      remarks: "no",
    },
    // Add more dummy data objects as needed
  ];

  // Dummy data for conveyance details
  const conveyanceDetails = [
    {
      pickupDateTime: "2024-03-10 08:30",
      pickupLocation: "Airport",
      dropoffDateTime: "2024-03-12 11:30",
      dropoffLocation: "Hotel",
      bookedFor: "sushmita",
      driverContact: "jack",
      vehicleNo: "AP11EG5858",
      vehicleType: "Two wheeler",
      bookedBy: "John",
      remarks: "NO",
    
    },
    // Add more dummy data objects as needed
  ];

  function createData(accomodationName, accomodationAddress, checkInTime, checkOutTime,contactOfHotel,bookedBy,bookedFor,remarks) {
    return {
        accomodationName,
        accomodationAddress,
        checkInTime,
        checkOutTime,
    
      history: [
        {
          date: '2022-01-01', // You may want to use a real date
          customerId: '12345', // Sample values, replace with actual data
          amount: 1,
          contactOfHotel,
          bookedBy,
          bookedFor,
          remarks,
          
        },
        // You can add more history entries as needed
      ],
    };
  }
  const [open, setOpen] = React.useState(false);
  const [open1, setOpen1] = React.useState(false);

  return (
    <div>
       {true ? (
      
       <>
         <div>
          <h2> Verified Visit Table </h2>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>PNR</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>

                  <TableCell>Purpose</TableCell>
                  <TableCell>Visiting Date </TableCell>
                  <TableCell>Exiting Date</TableCell>
                </TableRow>
              </TableHead>
                <TableBody>
                  {visitDetails.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.pnr}</TableCell>

                      <TableCell>{detail.fisrtName}</TableCell>
                      <TableCell>{detail.lastName}</TableCell>
                      <TableCell>{detail.purpose}</TableCell>
                      <TableCell>{detail.visitingDate}</TableCell>
                      <TableCell>{detail.exitingDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
            </Table>
          </TableContainer>
        </div>
         <div>
         <h2>Accommodation Details</h2>
         <TableContainer component={Paper}>
           <Table>
             <TableHead>
               <TableRow>
                 <TableCell />
                 <TableCell>Accommodation Name</TableCell>
                 <TableCell>Accommodation Address</TableCell>
                 <TableCell align="right">Check-In Time</TableCell>
                 <TableCell align="right">Check-Out Time</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
               {accommodationDetails.map((row, index) => (
                 <React.Fragment key={index}>
                   <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                     <TableCell>
                       <IconButton
                         aria-label="expand row"
                         size="small"
                         onClick={() => setOpen(!open)}
                       >
                         {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                       </IconButton>
                     </TableCell>
                     <TableCell component="th" scope="row">
                       {row.accomodationName}
                     </TableCell>
                     <TableCell align="right">{row.accomodationAddress}</TableCell>
                     <TableCell align="right">{row.checkInTime}</TableCell>
                     <TableCell align="right">{row.checkOutTime}</TableCell>
                   </TableRow>
                   <TableRow>
                     <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                       <Collapse in={open} timeout="auto" unmountOnExit>
                         <Box sx={{ margin: 1, backgroundColor: indigo[100], p: 1 }}>
                           <Typography variant="h6" gutterBottom component="div">
                             Other Details
                           </Typography>
                           <Table size="small" aria-label="purchases">
                             <TableHead>
                               <TableRow>
                                 <TableCell>Contact of Hotel</TableCell>
                                 <TableCell>Booked By</TableCell>
                                 <TableCell align="right">Booked For</TableCell>
                                 <TableCell align="right">Remarks</TableCell>
                               </TableRow>
                             </TableHead>
                             <TableBody>
                               <TableRow>
                                 <TableCell>{row.contactOfHotel}</TableCell>
                                 <TableCell>{row.bookedBy}</TableCell>
                                 <TableCell align="right">{row.bookedFor}</TableCell>
                                 <TableCell align="right">{row.remarks}</TableCell>
                               </TableRow>
                             </TableBody>
                           </Table>
                         </Box>
                       </Collapse>
                     </TableCell>
                   </TableRow>
                 </React.Fragment>
               ))}
             </TableBody>
           </Table>
         </TableContainer>
 
           {/* Conveyance Details */}
           <h2>Conveyance Details</h2>
           <TableContainer component={Paper}>
             <Table>
               <TableHead>
                 <TableRow>
                   <TableCell />
                   <TableCell>Pickup Date and Time</TableCell>
                   <TableCell>Pickup Location</TableCell>
                   <TableCell>Dropoff Date and Time</TableCell>
                   <TableCell>Dropoff Location</TableCell>
                 </TableRow>
               </TableHead>
               <TableBody>
                 {conveyanceDetails.map((row, index) => (
                   <React.Fragment key={index}>
                     <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                       <TableCell>
                         <IconButton
                           aria-label="expand row"
                           size="small"
                           onClick={() => setOpen1(!open1)}
                         >
                           {open1 ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                         </IconButton>
                       </TableCell>
                       <TableCell>{row.pickupDateTime}</TableCell>
                       <TableCell>{row.pickupLocation}</TableCell>
                       <TableCell>{row.dropoffDateTime}</TableCell>
                       <TableCell>{row.dropoffLocation}</TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                         <Collapse in={open1} timeout="auto" unmountOnExit>
                           <Box sx={{ margin: 1, backgroundColor: indigo[100], p: 1 }}>
                             <Typography variant="h6" gutterBottom component="div">
                               Other Details
                             </Typography>
                             <Table size="small" aria-label="purchases">
                               <TableHead>
                                 <TableRow>
                                   <TableCell>Booked For</TableCell>
                                   <TableCell>Driver Contact</TableCell>
                                   <TableCell>Vehicle No</TableCell>
                                   <TableCell>Vehicle Type</TableCell>
                                   <TableCell>Booked By</TableCell>
                                   <TableCell>Remarks</TableCell>
                                 </TableRow>
                               </TableHead>
                               <TableBody>
                                 <TableRow>
                                   <TableCell>{row.bookedFor}</TableCell>
                                   <TableCell>{row.driverContact}</TableCell>
                                   <TableCell>{row.vehicleNo}</TableCell>
                                   <TableCell>{row.vehicleType}</TableCell>
                                   <TableCell>{row.bookedBy}</TableCell>
                                   <TableCell>{row.remarks}</TableCell>
                                 </TableRow>
                               </TableBody>
                             </Table>
                           </Box>
                         </Collapse>
                       </TableCell>
                     </TableRow>
                   </React.Fragment>
                 ))}
               </TableBody>
             </Table>
           </TableContainer>
       </div>
       </>
      ):(
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

// Export the component as the default export
export default Track;