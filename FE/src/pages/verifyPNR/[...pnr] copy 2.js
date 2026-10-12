import React, { useEffect, useState,useRef } from "react";
import {
  Paper,
  Box,
  Typography,
  Modal,
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import { useRouter } from 'next/router';
import useMediaQuery from '@mui/material/useMediaQuery';
import jwt from 'jsonwebtoken';
import axios from "axios";

const Scan = () => {
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const [decodedData, setDecodedData] = useState([]);
  const [state, setState] = useState({ open: false, severity: '', message: '' });
  const [show, setShow] = useState(false);
  const [data, setData] = useState({});
  const router = useRouter();
  const { pnr, type, visitors } = router.query;
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const hardCodedDate = "2024-03-06";
  const visittypeRef = useRef('');
  const today = new Date();
  const formattedToday = today.toISOString().slice(0, 10);
  console.log("formattedToday::",formattedToday)

  let message = "";
  
  try {
    // Check if data.inTime is a valid date
    const inTime = new Date(data.inTime);
    if (isNaN(inTime)) {
      throw new Error("Invalid date format");
    }
  
    // Format inTime to YYYY-MM-DD
    const inTimeDate = inTime.toISOString().slice(0, 10);
  console.log("inTimeDate::",inTimeDate)
    if (inTimeDate > formattedToday) {
      message = "You have arrived early for the visit.";
    } else if (inTimeDate === formattedToday) {
      message = "Your visit is in progress.";
    } else {
      message = "Your visit has expired.";
    }
  } catch (error) {
    console.error("Error parsing date:", error.message);
    message = "Invalid inTime format provided.";
  }
  
  console.log(message);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = pnr[1];
        console.log("token:::from useEffect", token);
        const response = await axios.get(`https://10.244.3.101:8000/api/v1/verifyScanDetails/indDetails/${pnr[0]}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("response.data server::", response.data.data);
        if(response.data.success === true){
          if(response.data.data == null){
            setState({ severity: 'success', message: response?.data?.message, open: true });
          } else {
            setData(response.data.data || {});
          }
        }
        setShow(true);
      } catch (error) {
        console.error('Error fetching data:', error);
        setShow(false);
        setState({ severity: 'error', message: error?.response?.data?.message, open: true });
      }
    };

    const fetchData1 = async () => {
      try {
        const token = pnr[1];
        console.log("token:::from useEffect", token);
        const response = await axios.get(`https://10.244.3.101:8000/api/v1/verifyScanDetails/orgDetails/${pnr[0]}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("response.data server::", response.data.data);
        setData(response.data.data || {});
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    const fetchAndVerifyData = async () => {
      if (pnr) {
        const decoded = await verifyToken(pnr);
        console.log("decoded", decoded);
        console.log("pnr", pnr);
        visittypeRef.current = decoded?.visitorinfo.type;
        console.log("decoded:", decoded);

        if (decoded?.visitorinfo.type === 'Organization') {
          console.log('Inside if statement');
          setDecodedData(decoded);
          await fetchData1();
        } else {
          console.log('Inside else statement');
          setDecodedData(decoded);
          await fetchData();
        }
      }
    };

    fetchAndVerifyData();
  }, [type, pnr]);

  console.log("data from server::", data);

  const verifyToken = async (token) => {
    try {
      console.log("verifyToken::", token[1]);
      console.log("typeOf::", typeof (token[1]));
      if(token[1] !== undefined) {
        return new Promise((resolve, reject) => {
          jwt.verify(token[1], 'approvecancel', { algorithms: ['HS256'] }, (err, decoded) => {
            if (err) {
              console.error('Token verification failed:', err);
            } else {
              console.log('Token verified:', decoded);
              setVerified(true);
              resolve(decoded);
            }
          });
        });
      }
    } catch (error) {
      console.error('Token verification failed:', error);
    }
  };

  const statusColors = {
    "In Campus": "success.main",
    "Exited": "warning.main",
    "Pending": "info.main",
    "Blocked": "error.main",
  };

  const nextStatus = {
    "Exited": "Exit",
    "Pending": "Allow"
  };

  let status = "";
  if (data?.movementStatus === "none") {
    status = "Pending";
  } else if (data?.movementStatus === "In Campus") {
    status = "In Campus";
  } else if (data?.movementStatus === "Exited") {
    status = "Exited";
  } else {
    status = "Blocked";
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

  const statestyle = {
    position: 'absolute',
    top: '60%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100%',
    boxShadow: 24,
    p: 1,
  };

  const sendStatusToBackend = async () => {
    const { pnr } = data;
    const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    console.log("currentTime:", currentTime);

    let requestBody = {};
    if (data.movementStatus === 'none' || data.movementStatus === 'Exited') {
      requestBody = {
        status: 'In Campus',
        pnr: data.pnr,
        visitInTime: currentTime,
        type: decodedData.visitorinfo.type
      };
    } else if (data.movementStatus === 'In Campus') {
      requestBody = {
        status: 'Exited',
        pnr: data.pnr,
        visitOutTime: currentTime,
        type: decodedData.visitorinfo.type
      };
    }
    console.log("requestbody:", requestBody);

    try {
      const response = await axios.post('https://10.244.3.101:8000/api/v1/movement/visitorMovement', requestBody);
      console.log('Status sent successfully:', response);
      window.location.reload();
    } catch (error) {
      console.error('Error sending status:', error);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} display={'flex'} justifyContent={'center'} alignItems={'center'}>
          <img src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=1931&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" style={{
            height: 350, width: 350, objectFit: "cover"
          }} alt="Profile logo" />
        </Box>
      </Modal>
      <Modal
        open={state.open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...statestyle, backgroundColor: state.severity === "success" ? 'success.main' : 'error.main' }} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
          <Typography variant="h5" >{state.message || "Wrong Token"}</Typography>
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
        {Object.keys(data).length !== 0 && (
          <>
            <Box width={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'} sx={{ backgroundColor: statusColors[status], py: 2, my: 2, borderRadius: 5 }}>
              <Typography variant="h6">{status}</Typography>
            </Box>
            <Box height="75%" width={'100%'}>
              <Box component={Paper} elevation={5} textAlign="center" >
                <Box textAlign="center" bgcolor="whitesmoke">
                  <img src={data?.photo} style={{
                    height: 200, width: 200, objectFit: "contain"
                  }} alt="Profile logo" />
                </Box>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign="center">
                  <Typography variant="h5">{data?.name}</Typography>
                </Box>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign="center">
                  <Typography variant="h5">{message}</Typography>
                </Box>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign="center">
                  <Typography variant="h5">{data?.visitorType}</Typography>
                </Box>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign="center">
                  <Typography variant="h6">{data?.pnr}</Typography>
                </Box>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign="center">
                  <Typography variant="h6">{data?.organizationName}</Typography>
                </Box>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign="center">
                  <Typography variant="h6">{data?.division}</Typography>
                </Box>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} textAlign="center">
                  <Typography variant="h6">{data?.visitDate}</Typography>
                </Box>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" justifyContent="space-around" width={'100%'} sx={{ pt: 2, px: 2 }}>
              <Box
                width={'100%'}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
                {data.movementStatus !== 'Blocked' &&
                  <>
                    <Box
                      width={'40%'}
                      component={Paper}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      sx={{
                        cursor: 'pointer',
                        height: 100,
                        backgroundColor: status === 'Pending' ? 'success.main' : 'warning.main',
                        boxShadow: 3,
                        borderRadius: 5,
                      }}
                      onClick={() => sendStatusToBackend()}
                    >
                      <Typography variant="h5" textAlign={'center'}>{nextStatus[status]}</Typography>
                    </Box>
                  </>
                }
              </Box>
            </Box>
          </>
        )}
      </Box>
    </>
  );
};

export default Scan;
