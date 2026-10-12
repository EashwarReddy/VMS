import React, { useEffect, useState,useRef } from "react";
import {
  Paper,
  Box,
  Typography,
  Modal,
  Grid,
  Dialog, DialogContent, 
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Stack,
  Snackbar,
  Alert
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import { useRouter } from 'next/router';
import useMediaQuery from '@mui/material/useMediaQuery';
import jwt from 'jsonwebtoken';
import axios from "axios";
import PersonIcon from '@mui/icons-material/Person';
import MockWebcamCapture from "src/components/WebCam";
import AssetRegistration from "src/components/AssetRegistration";
import { API } from "src/api";
import { move } from "formik";
import Home from "src/components/webcamI";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { useAuth } from "src/hooks/use-auth";
import { useTheme } from "@emotion/react";
import { CircularProgress } from '@mui/material';
import { io } from "socket.io-client";
import { motion } from "framer-motion";
import { useVisitor } from "src/contexts/visitorContext";
import TimeCheckModal from "src/components/TimeCheckModal";
const Page = () => {
  const [open, setOpen] = useState(false);
  const [verified, setVerified] = useState(false);
  const [decodedData, setDecodedData] = useState([]);
  const [state, setState] = useState({ open: false, severity: '', message: '' });
  const [snack,setSnack] = useState({ open: false, severity: '', message: '' })
  const [show, setShow] = useState(false);
  const [data, setData] = useState({});
  const [photo,setPhoto] = useState()
  const [assets,setAssets] = useState([]);
  const [vehicleNo,setVehicle] = useState();
  const [isIdle, setIsIdle] = useState(true);
  const router = useRouter();
  const theme = useTheme();
  const { pnr, type, visitors } = router.query;
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const hardCodedDate = "2024-03-06";
  const visittypeRef = useRef('');
  const today = new Date();
  const auth = useAuth()
  const formattedToday = today.toISOString().slice(0, 10);
  const vertical = 'bottom'
  const horizontal = 'center'
  const [imageBlob, setImageBlob] = useState(null); // Store the image as a Blob
  const [loading, setLoading] = useState(true);
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [socket, setSocket] = useState(null)
  const visitor = useVisitor()

  useEffect(
    ()=>{
if(assets.length != 0){
  setSnack({ open: true, severity: 'success', message: 'Saved Assets' })
}

    },[assets]  
    )
    useEffect(()=>{
      if(photo){
        setSnack({ open: true, severity: 'success', message: 'Saved Photo' })
      }
    },[photo])
    
  let message = "";
  const options = {
    timeZone: 'Asia/Kolkata',  // Set the timezone to IST
    weekday: 'short',          // Use short format for the weekday (e.g., "Wed")
    year: 'numeric',
    month: 'short',            // Use short format for the month (e.g., "Aug")
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',         // Optional: display seconds
    hour12: true, timeZone : 'UTC'               // Use 12-hour time with AM/PM
  };
  // console.log(message);
  useEffect(() => {

setData(visitor.visitorNow.data)

setIsIdle(false)
  
  }, [type, auth?.user]);

  // console.log("data from server::", data);
  const fetchImage = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/facerecognition/image/${data.pnr}`, {
        responseType: "blob", // Indicates the server will send binary data
      }); // Replace with your API endpoint
      console.log('response', response.data)
      setImageBlob(response.data); // Save the blob for sending later
      setLoading(false);
     
    } catch (error) {
      console.error("Error fetching image:", error);
      setLoading(false);
      setImageBlob(null);
      // setState({ severity: 'error', message: '', open: true });

    }
  };

  useEffect(()=>{
    if(!isIdle && Object.keys(data).length > 0){
fetchImage()      
    }
  },[data])
  const verifyToken = async (token) => {
    try {
      // console.log("verifyToken::", token[1]);
      // console.log("typeOf::", typeof (token[1]));
      if(token[1] !== undefined) {
        return new Promise((resolve, reject) => {
          jwt.verify(token[1], 'approvecancel', { algorithms: ['HS256'] }, (err, decoded) => {
            if (err) {
              console.error('Token verification failed:', err);
            } else {
              // console.log('Token verified:', decoded);
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
    "Pending": "Allow",
    // Add additional statuses if needed
  };

const [status,setStatus] = useState(data?.movementStatus)
const [sendVisitor,setSendVisitor] = useState("")

useEffect(()=>{
  if (data?.movementStatus === "none") {
    setStatus("Pending");
  } else if (data?.movementStatus === "In Campus") {
     setStatus("In Campus");
  } else if (data?.movementStatus === "Exited") {
     setStatus("Exited");
  } else {
    setStatus("Blocked");
  }
  if (data?.movementStatus == "In Campus") {
     setSendVisitor("Exited")

  }
  else {
setSendVisitor("Pending")
  }

},[data])

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
  function base64ToBlob(base64, mime) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);

        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: mime });
}
  const sendStatusToBackendAllow = async () => {
    const { pnr } = data;
    const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    // console.log("currentTime:", currentTime);

    let requestBody = {};
    if (data.movementStatus === 'none' || data.movementStatus === 'Exited') {
      requestBody = {
        status: 'In Campus',
        pnr: data.pnr,
        visitInTime: currentTime,
        //type: data.visitType
      };
    } else if (data.movementStatus === 'In Campus') {
      requestBody = {
        status: 'Exited',
        pnr: data.pnr,
        visitOutTime: currentTime,
        //type: data.Type
      };
    }
    // console.log("requestbody:",  assets );

    try {
      const formData = new FormData();
      // const mimeType = 'image/png'; // Replace with your image's MIME type

// Extract Base64 data without the data URL scheme
// const base64Data = photo.split(',')[1];

// Convert to Blob
// const imageBlob = base64ToBlob(base64Data, mimeType);
      formData.append('pnr', requestBody.pnr)
      if (data.movementStatus === 'none' || data.movementStatus === 'Exited') {
        formData.append('image', imageBlob, `${data.pnr}`);
        formData.append('visitInTime', currentTime)
        formData.append('status', 'In Campus')
        // formData.append('type', data.visitType);
        formData.append('vehicleNo', vehicleNo || '')
      } 
      formData.append('assets', JSON.stringify( { "assets" : assets }))
      // formData.append('dummy', JSON.stringify({'hello' : 1, 'ther': [1,2,3,4]}))
// console.log("formData",formData)
      const response = await axios.post(`${API}/movement/visitorMovement/allow`, formData, {
        headers: {
          'Authorization': `Bearer ${auth?.user?.accessToken}`
        }
      });

      setData({...data, movementStatus : requestBody.status})
      
      // console.log('Status sent successfully:', response);
      // window.location.reload();
    } catch (error) {
      console.error('Error sending status:', error);
      setSnack({ open: true, severity: 'error', message: 'Please check photo is taken' })
    }
  };
  const sendStatusToBackendExit = async () => {
    const { pnr } = data;
    const currentTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    console.log("currentTime:", currentTime);

    let requestBody = {};
    if (data.movementStatus === 'none' || data.movementStatus === 'Exited') {
      requestBody = {
        status: 'In Campus',
        pnr: data.pnr,
        visitInTime: currentTime,
        //type: data.visitType
      };
    } else if (data.movementStatus === 'In Campus') {
      requestBody = {
        status: 'Exited',
        pnr: data.pnr,
        visitOutTime: currentTime,
        //type: data.visitType
      };
    }
    console.log("requestbody:",  requestBody );

    try {

      const response = await axios.put(`${API}/movement/visitorMovement/exit`, requestBody,
        {
          headers: {
            'Authorization': `Bearer ${auth?.user?.accessToken}`
          }
        }
      );
      setData({...data, movementStatus : requestBody.status})


      // console.log('Status sent successfully:', response);
      // window.location.reload();
    } catch (error) {
      console.error('Error sending status:', error);
    }
  };
  const handleCloseSnackbar = () =>{
setSnack({ open: false, severity: '', message: '' })
  }
  const fields = [
    { label: "PNR", value: data?.pnr },
    { label: "Name", value: data?.visitorName },
    { label: "Organization", value: data?.visitorOrg },
    { label: "Purpose", value: data?.purpose },
    { label: "Host Name", value: data?.hostName },
    { label: "ID Type", value: data?.idType },
    { label: "ID No.", value: data?.idNo },
    { label: "Visit Arrival", value: data?.inTime ? new Date(data?.inTime).toLocaleDateString("en-IN", options) : "-" },
    { label: "Visit Departure", value: data?.outTime ? new Date(data?.outTime).toLocaleDateString("en-IN", options) : "-" },
    { label: "Movement Status", value: data?.movementStatus },
  ];

  const finalAssets = assets?.length > 0 
  ? assets 
  : data?.movements?.length > 0 
      ? data.movements[data.movements.length - 1].assets || []
      : [];

  const IdleScreen = () => {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          backgroundColor: "#f5f5f5", // Soft background color
        }}
      >
        {/* Floating Logo Animation */}
        <motion.img
          src="/assets/800px-CDAC_LOGO_crop.png"
          alt="Company Logo"
          style={{ maxWidth: "200px", marginBottom: "20px" }}
          animate={{
            y: [0, -10, 0], // Floating effect
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
  
        {/* Pulsing Text Animation */}
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Typography variant="h5" fontWeight={600}>
            Waiting for the next visitor...
          </Typography>
        </motion.div>
  
        {/* Fade-in Subtext */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
            Please approach the reception desk.
          </Typography>
        </motion.div>
      </Box>
    );
  };
  if (isIdle) {
    return <IdleScreen />;
  }
  return (
<>
{
  !isIdle  && <Box sx={{ p: 3, maxWidth: isMobileOrTablet ? "100%" : 500, mx: "auto", textAlign: "center", height: isMobileOrTablet ? "100vh" : "auto" }}>
  <Box sx={{ mb: 2 }}>
    {imageBlob ? (
      <Box
        component="img"
        src={URL?.createObjectURL(imageBlob)} // Create a temporary URL for the blob
        alt="Fetched from backend"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    ) : (
      <Box sx={{ width: "100%", height: 200, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed gray", borderRadius: "8px", backgroundColor: "#f0f0f0" }}>
        <Typography variant="body1" color="textSecondary">
          No Image, Please Stand Near Device
        </Typography>
      </Box>
    )}
     { 
  (data.movementStatus !== "Exited" && data.movementStatus !== "none") &&
  (
    finalAssets.length > 0 ? (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Serial No</TableCell>
              <TableCell>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {finalAssets.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.serialNo}</TableCell>
                <TableCell>{item.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Typography variant="h4" color='grey' sx={{ backgroundColor: "whitesmoke", m: 2 }}>
        No Assets
      </Typography>  
    )
  )
}

      <Box width={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'} sx={{ backgroundColor: statusColors[status], py: 2, my: 2, borderRadius: 5 }}>
              <Typography variant="h6">{status}</Typography>
             </Box>
  </Box>
       {( data.movementStatus == "Exited"  || data.movementStatus == "none" ) &&<Box textAlign="center" bgcolor="whitesmoke" p={2}> 
        
                                        <Typography sx={{backgroundColor : `lightgray`}}>
                                        Add Asset Details
                                          </Typography>  
        <AssetRegistration setAssets={setAssets}/>
        </Box>
      }
       {
       ( data.movementStatus == "Exited"  || data.movementStatus == "none" ) && <Grid item xs={4} sx={{backgroundColor : indigo[50]}}>
 <Typography sx={{backgroundColor : `lightgray`}}>
                                      Add Vehicle Details
                                        </Typography>  
                                    
                                        <TextField
           name="vehicle"
           label="Enter your Vehicle No"
           fullWidth
           value={vehicleNo}
           variant="standard"
           placeholder="Vehicle No" 
           sx={{  borderRadius: 2, mb : 3, px :2 }}
           onChange={(e)=>{setVehicle(e.target.value)}}
         />

 
    
     </Grid>
    }
 

  <Grid container spacing={2}>
    {fields.map((field, index) => (
      <React.Fragment key={index}>
        <Grid item xs={5}>
          <Typography variant="body1" fontWeight={600}>
            {field.label}
          </Typography>
        </Grid>
        <Grid item xs={7}>
          <Typography variant="body1" color="textSecondary">
            {field.value || "-"}
          </Typography>
        </Grid>
      </React.Fragment>
    ))}
  </Grid>
 
  <Box display="flex" alignItems="center" justifyContent="space-around" width={'100%'} sx={{ pt: 2, px: 2 }}>
              <Box
                width={'100%'}
                display="flex"
                justifyContent="center"
                alignItems="center"
              >
  {status !== 'Blocked' && status !== "In Campus"   && (
        <Button
          width={'40%'}
          component={Paper}
          display="flex"
          justifyContent="center"
          // disabled ={!photo}
          alignItems="center"
          sx={{
            cursor: 'pointer',
            p :1,
            px : 10,
            backgroundColor: statusColors[status] || 'defaultColor', // Fallback color
            boxShadow: 3,
            borderRadius: 5,
            color : "black",
        
          }}
          onClick={() => sendStatusToBackendAllow()}
        >
          <Typography variant="h5" textAlign={'center'}>
                     {nextStatus[sendVisitor] || 'Default Action'} 
          </Typography>
        </Button>
      )}

{status !== 'Blocked' && status == "In Campus"  && (
        <Button
          width={'40%'}
          component={Paper}
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            cursor: 'pointer',
            p :1,
            px : 10,
            backgroundColor: statusColors[status] || 'defaultColor', // Fallback color
            boxShadow: 3,
            borderRadius: 5,
            color : "black",
          }}
          onClick={() => sendStatusToBackendExit()}
        >
          <Typography variant="h5" textAlign={'center'}>
                     {nextStatus[sendVisitor] || 'Default Action'} 
          </Typography>
        </Button>
      )}
              </Box>
            </Box>
  </Box>
}

<TimeCheckModal data={visitor.visitorNow.data}   />
{
isIdle && <IdleScreen/>
}
</>

  );
};


Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

