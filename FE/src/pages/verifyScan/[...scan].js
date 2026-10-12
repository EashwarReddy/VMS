import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Grid,
  Typography,
  Button,
  Modal,
} from "@mui/material";
import { blue, green, indigo, orange, red } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import useMediaQuery from '@mui/material/useMediaQuery';
import jwt from 'jsonwebtoken';
import axios from "axios";
import { API } from "src/api";
const Scan = () => {
  // Get today's date
  const today = new Date();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [verified, setVerified] = useState(false);
  const [decodedData, setDecodedData] = useState([])

  // Format today's date as YYYY-MM-DD
  const formattedToday = today.toISOString().slice(0, 10);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  // Hard-coded date
  const router = useRouter();

  const hardCodedDate = "2024-03-06";
  const [data, setData] = useState([]);
  const { pnr } = router.query;

  const { type, visitors } = router.query;

  // Compare the hard-coded date with today's date
  let message = "";
  if (hardCodedDate < formattedToday) {
    message = "You have arrived early for the visit.";
  } else if (hardCodedDate === formattedToday) {
    message = "Your visit is in progress.";
  } else {
    message = "Your visit has expired.";
  }

  // Dummy data for visit details
  const visitDetails = [
    {
      pnr: 123,
      firstName: "sushmita",
      lastName: "meena",
      purpose: "meeting",
      visitingDate: "06-03-2024",
      exitingDate: "07-03-2024",
    },
  ];
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = pnr[1]; // Replace with your actual token
        console.log("token:::from useEffect", token);
        const response = await axios.get(`${API}/verifyScanDetails/indDetails/${pnr[0]}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("response.data server::", response.data.data);
        setData(response.data.data);
        setDataQR(response.data.data);


      } catch (error) {
        console.error('Error fetching data:', error);
        // setStatusFromServer(false)
      }
    };

    const fetchData1 = async () => {
      try {
        const token = pnr[1]; // Replace with your actual token
        console.log("token:::from useEffect", token);
        const response = await axios.get(`${API}/verifyScanDetails/orgDetails/${pnr[0]}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("response.data server::", response.data.data);
        setData(response.data.data);
        setDataQR(response.data.data);

      } catch (error) {
        console.error('Error fetching data:', error);
        // setStatusFromServer(false)
      }
    };
    const fetchAndVerifyData = async () => {


      if (pnr) {
        const decoded = await verifyToken(pnr);
        console.log("decoded:", decoded);
        // Now you can use the decoded data as needed here
        if (decoded.visitorinfo.type === 'Organization') {
          console.log('i am inside of if statement')
          setDecodedData(decoded)
          await fetchData1();
        } else {
          console.log('i am inside of else statement')
          setDecodedData(decoded)
          await fetchData();
        }
      }
    };

    fetchAndVerifyData();
  }, [type, pnr]);


  console.log("data from server::", data);
  const verifyToken = async (token) => {
    try {
      // Assuming token is a string
      console.log("verifyToken::", token[1]);
      console.log("typeOf::", typeof (token[1]));
      return new Promise((resolve, reject) => {
        jwt.verify(token[1], 'approvecancel', { algorithms: ['HS256'] }, function (err, decoded) {
          if (err) {
            console.error('Token verification failed:', err);
            reject(err);
          } else {
            console.log('Token verified:', decoded);
            setVerified(true)
            resolve(decoded);
          }
        });
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      throw error;
    }
  };
  const statusColors = {
    "In Campus": "success.main",
    "Exited": "warning.main",
    "Pending": "info.main",
    "Blocked": "error.main",
  }
  const buttonColors = {
    "In Campus": ["#32CD32", "#5efc82"],
    "Exited": ["#ff7e5f", "#feb47b"],
    "Pending": ["#0072ff", "#00c6ff"],
    "Blocked": ["#ff6e7f", "#bfe9ff"],
  }
  const nextStatus = {
    "Exited": "Exit",
    "Pending": "Allow"
  }
  // const status = "In Campus"
  let status = ""
  // data.movementStatus='Exited'
  if (data.movementStatus == "none") {
    status = "Pending"

  }
  else if (data.movementStatus == "In Campus") {
    status = "In Campus"

  }
  else if (data.movementStatus == "Exited") {
    status = "Exited"

  }
  else {
    status = "Blocked"

  }

  let sendVisitor = ""

  if (data.movementStatus == "In Campus") {
    sendVisitor = "Exited"

  }
  else {
    sendVisitor = "Pending"

  }

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    boxShadow: 24,
    p: 1,
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" style={{
            height: 350, width: 350, objectFit: "cover"
          }} alt="Profile logo" />
        </Box>
      </Modal>
      <Box
        display="flex"
        flexDirection="column"
        height="100vh"
        justifyContent="center"
        alignItems={'center'}
        sx={{ backgroundColor: indigo[50], px: 2 }}
        width={isSmallScreen ? '100%' : '50%'}
      >
        <Box height="15%" sx={{ py: 1 }}>
          <Box textAlign="center">
            <img src='/assets/800px-CDAC_LOGO_crop.png' style={{
              height: 75,
            }} alt="CDAC Logo" />
          </Box>
        </Box>
        <Box width={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'} sx={{ backgroundColor: statusColors[status], py: 2, my: 2, borderRadius: 5 }}>
          <Typography variant="h6">{status}</Typography>
        </Box>
        <Box height="75%" width={'100%'}>
          <Box component={Paper} elevation={5} textAlign="center" >
            <Box textAlign="center" bgcolor="whitesmoke">
              <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" style={{
                height: 150, width: 150, objectFit: "cover"
              }} alt="Profile logo" onClick={handleOpen} />
            </Box>
            <Box sx={{ py: 1 }}>

              <div >
                <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'left', paddingLeft: 2 }}><strong>PNR:  {data.pnr}</strong></Typography>
                <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'left', paddingLeft: 2 }}><strong>No. Of Vistors:{data.visitor}</strong> </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'left', paddingLeft: 2 }}><strong>Visitor Name:{data.visitorName}</strong> </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'left', paddingLeft: 2 }}><strong>Visitor Org:{data.visitorOrg}</strong> </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'left', paddingLeft: 2 }}><strong>Govt ID Type:{data.idType}</strong></Typography>
                <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'left', paddingLeft: 2 }}><strong>Govt ID No.:{data.idNo}</strong> </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'left', paddingLeft: 2 }}><strong>In Time:{data.inTime}</strong> </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'left', paddingLeft: 2 }}><strong>Out Time:{data.outTime}</strong> </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'left', paddingLeft: 2 }}><strong>Host Name:{data.hostName}</strong> </Typography>
                <Typography variant="body1" sx={{ marginBottom: 1, textAlign: 'left', paddingLeft: 2 }}><strong>Purpose:{data.purpose}</strong></Typography>
              </div>

            </Box>

          </Box>
        </Box>
        <Box height="10%" width={'100%'} sx={{ mt: 1 }}>
          <Box textAlign="center">
            {(status != "Blocked") && <Button
              variant="contained"
              color="primary"
              // style={{
              //   borderRadius: '50px',
              //   width: '100%',
              //   // You can adjust the padding as needed
              //   backgroundColor: buttonColors[sendVisitor],
              //   textTransform: 'none',
              // }}
              style={{
                borderRadius: '50px',
                padding: '10px 30px',
                background: `linear-gradient( ${buttonColors[sendVisitor][1]} , ${buttonColors[sendVisitor][0]})`, /* Gradient background */
                boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)', /* Shadow */
                color: '#fff', /* Text color */
                textTransform: 'uppercase', /* Uppercase text */
                border: 'none', /* No border */
                cursor: 'pointer', /* Cursor style */
                transition: 'all 0.3s ease', /* Transition for smooth hover effect */
                width: '100%',
              }}
              sx={{
                '&:hover': {
                  background: 'linear-gradient(to left, #00c6ff, #0072ff)', /* Change gradient direction on hover */
                  boxShadow: '0px 15px 20px rgba(0, 0, 0, 0.2)', /* Change shadow on hover */
                },
              }}
            >
              {nextStatus[sendVisitor]}
            </Button>}
          </Box>
        </Box>
      </Box>
    </>

    // <div>
    //   <h1>Visitor&apos;s Details</h1>
    //   <p>Today&apos;s Date: {formattedToday}</p>
    //   <p>Hard-coded Date: {hardCodedDate}</p>
    //   <p>{message}</p>

    //   {/* Conditionally render the table if the visit is in progress */}
    //   {message === "Your visit is in progress." && (
    //     <TableContainer component={Paper} sx={{ margin: 1, backgroundColor: indigo[100], p: 1 }}>
    //       <Table>
    //         <TableHead>
    //           <TableRow>
    //             <TableCell>PNR</TableCell>
    //             <TableCell>First Name</TableCell>
    //             <TableCell>Last Name</TableCell>
    //             <TableCell>Purpose</TableCell>
    //             <TableCell>Visit Date</TableCell>
    //             <TableCell>Exit Date</TableCell>
    //           </TableRow>
    //         </TableHead>
    //         <TableBody>
    //           {visitDetails.map((detail) => (
    //             <TableRow key={detail.pnr}>
    //               <TableCell>{detail.pnr}</TableCell>

    //               <TableCell>{detail.firstName}</TableCell>
    //               <TableCell>{detail.lastName}</TableCell>
    //               <TableCell>{detail.purpose}</TableCell>
    //               <TableCell>{detail.visitingDate}</TableCell>

    //               <TableCell>{detail.exitingDate}</TableCell>
    //             </TableRow>
    //           ))}
    //         </TableBody>
    //       </Table>
    //     </TableContainer>
    //   )}
    // </div>
  );
};

export default Scan;