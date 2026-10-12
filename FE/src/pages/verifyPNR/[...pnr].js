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
  // console.log("formattedToday::", formattedToday);
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

    const fetchData = async () => {
      if(!!auth?.user?.accessToken){
        // console.log('fetching data only if token')
      }
      // console.log('fetching data all time')

      try {
        const token = pnr[1];
        // console.log("token:::from useEffect", token);
        const response = await axios.get(`${API}/verifyScanDetails/indDetails/${pnr[0]}`, {
          headers: {
            'Authorization': `Bearer ${auth?.user?.accessToken}`
          }
        });
        // console.log("response.data server::", response.data.data);
        if(response.data.success === true){
          if(response.data.data == null){
            setState({ severity: 'success', message: response?.data?.message, open: true });
          } else {
            setData(response.data.data || {});
            try {
              if (!data.inTime) {
                throw new Error("data.inTime is undefined or null");
              }
              
              // Print the raw data.inTime value
              // console.log("Raw data.inTime::", data.inTime);
            
              // Check if data.inTime is a valid date
              const inTime = new Date(data.inTime);
              if (isNaN(inTime.getTime())) { // Check if it's a valid date
                throw new Error("Invalid date format");
              }
            
              // Format inTime to YYYY-MM-DD
              const inTimeDate = inTime.toISOString().slice(0, 10);
              // console.log("inTimeDate::", inTimeDate);
            
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
          }
        }
        setShow(true);
        setState({ open: false });

      } catch (error) {
        console.error('Error fetching data:', error);
        setShow(false);
        setState({ severity: 'error', message: error?.response?.data?.message, open: true });
      }
    };

    const fetchData1 = async () => {
      try {
        const token = pnr[1];
        // console.log("token:::from useEffect", token);
        const response = await axios.get(`${API}/verifyScanDetails/orgDetails/${pnr[0]}`, {
          headers: {
            'Authorization': `Bearer ${auth?.user?.accessToken}`
          }
        });
        // console.log("response.data server::", response.data.data);
        setData(response.data.data || {});
        setState({ open: false });

        try {
          if (!data.inTime) {
            throw new Error("data.inTime is undefined or null");
          }
          
          // Print the raw data.inTime value
          // console.log("Raw data.inTime::", data.inTime);
        
          // Check if data.inTime is a valid date
          const inTime = new Date(data.inTime);
          if (isNaN(inTime.getTime())) { // Check if it's a valid date
            throw new Error("Invalid date format");
          }
        
          // Format inTime to YYYY-MM-DD
          const inTimeDate = inTime.toISOString().slice(0, 10);
          // console.log("inTimeDate::", inTimeDate);
        
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
      } catch (error) {
        console.error('Error fetching data:', error);
        setState({ severity: 'error', message: error?.response?.data?.message, open: true });

      }
    };
  
    const fetchImage = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/facerecognition/image/${pnr[0]}`, {
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

    
    const fetchAndVerifyData = async () => {
      if (pnr) {
        const decoded = await verifyToken(pnr);
        // console.log("decoded", decoded);
        // console.log("pnr", pnr);
        visittypeRef.current = decoded?.visitorinfo.type;
        // console.log("decoded:", decoded);

        if (decoded?.visitorinfo.type === 'Organization') {
          // console.log('Inside if statement');
          setDecodedData(decoded);
          await fetchData1();
        } else {
          // console.log('Inside else statement');
          setDecodedData(decoded);
          await fetchData();
          await fetchImage();
        }
      }
    };

    fetchAndVerifyData();
  }, [type, auth?.user]);

  // console.log("data from server::", data);

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

  let status = data?.movementStatus;

  if (data?.movementStatus === "none") {
    status = "Pending";
  } else if (data?.movementStatus === "In Campus") {
    status = "In Campus";
  } else if (data?.movementStatus === "Exited") {
    status = "Exited";
  } else {
    status = "Blocked";
  }
  let sendVisitor = ""

  if (data?.movementStatus == "In Campus") {
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
        formData.append('image', imageBlob, `${pnr[0]}`);
        formData.append('visitInTime', currentTime)
        formData.append('status', 'In Campus')
        formData.append('type', decodedData.visitorinfo.type);
        formData.append('vehicleNo', vehicleNo)
      } 
      formData.append('assets', JSON.stringify( { "assets" : assets }))
      formData.append('dummy', JSON.stringify({'hello' : 1, 'ther': [1,2,3,4]}))
// console.log("formData",formData)
      const response = await axios.post(`${API}/movement/visitorMovement/allow`, formData, {
        headers: {
          'Authorization': `Bearer ${auth?.user?.accessToken}`
        }
      });

      if (response.ok) {
        // console.log('Image uploaded successfully!');
      } else {
        console.error('Failed to upload image.');
        // setSnack({ open: true, severity: 'error', message: 'Failed to Upload Image' })
      }
      // console.log('Status sent successfully:', response);
      window.location.reload();
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
    console.log("requestbody:",  assets );

    try {
      // const formData = new FormData();
      
      // formData.append('pnr', requestBody.pnr)
      // if (data.movementStatus === 'none' || data.movementStatus === 'Exited') {
      //   formData.append('image', photo, 'image.png');
      //   formData.append('assets', JSON.stringify( { "assets" : assets }))
      //   formData.append('visitInTime', currentTime)
      //   formData.append('status', 'In Campus')
      //   formData.append('type', decodedData.visitorinfo.type)
      // } else if (data.movementStatus === 'In Campus') {
      //   formData.append('visitOutTime', currentTime)
      //   formData.append('status', 'Exited')
      //   formData.append('type', decodedData.visitorinfo.type)
      // }
 

      
      // formData.append('dummy', JSON.stringify({'hello' : 1, 'ther': [1,2,3,4]}))

      const response = await axios.put(`${API}/movement/visitorMovement/exit`, requestBody,
        {
          headers: {
            'Authorization': `Bearer ${auth?.user?.accessToken}`
          }
        }
      );

      if (response.ok) {
        // console.log('Image uploaded successfully!');
      } else {
        console.error('Failed to upload image.');
      }
      // console.log('Status sent successfully:', response);
      window.location.reload();
    } catch (error) {
      console.error('Error sending status:', error);
    }
  };
  const handleCloseSnackbar = () =>{
setSnack({ open: false, severity: '', message: '' })
  }
  return (
    <Box sx={{width : "100%"}}>
    <Snackbar open={snack.open} 
    autoHideDuration={2000} 
    onClose={handleCloseSnackbar}
    anchorOrigin={{ vertical, horizontal }}
    >
  <Alert
    onClose={handleCloseSnackbar}
    severity={snack.severity}
    variant="filled"
    sx={{ width: '100%' }}
  >
    {snack.message}
  </Alert>
</Snackbar>
    
      {/* <Modal
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
      </Modal> */}
      <Modal
        open={state.open}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{ ...statestyle, backgroundColor: state.severity === "success" ? 'success.main' : 'error.main' }} display={'flex'}
        //  justifyContent={'center'}
        //  alignItems={'center'}
          flexDirection={'column'}>
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
        width={'100%'}
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
                
              {data.movementDetails && data.movementStatus !== "Exited" &&  <Box textAlign="center" bgcolor="whitesmoke" p={2}>
      {/* <img src={`${API}/images/${data.movementDetails?.movements[data.movementDetails?.movements.length - 1].photo}`} 
       style={{
        width: '100%',     // Makes the image take up the full width of the container
        height: '100%',    // Makes the image take up the full height of the container
        objectFit: 'cover' // Ensures the image covers the entire container without distortion
      }}
       /> */}
         {!!imageBlob && <Box
        component="img"
        src={URL?.createObjectURL(imageBlob)} // Create a temporary URL for the blob
        alt="Fetched from backend"
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      /> }{
        !imageBlob && <Typography variant="h5">No Image Found</Typography>
      }
    </Box>}
    { 
     (data.movementStatus !== "Exited"  && data.movementStatus !== "none"  ) && (data.movementDetails?.movements[data.movementDetails?.movements.length - 1].assets.length > 0?
        <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Serial No</TableCell>
              <TableCell>Type</TableCell>
              {/* <TableCell>Action</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.movementDetails?.movements[data.movementDetails?.movements.length - 1].assets?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.serialNo}</TableCell> {/* Serial No */}
                <TableCell>{item.type}</TableCell> {/* Type */}
                {/* <TableCell>
                  <Button variant="contained">Ok</Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer> : <Typography variant="h4" color={'grey'} sx={{backgroundColor : "whitesmoke", m : 2}}>No Assets</Typography>)
    }
    {

( data.movementStatus == "Exited"  || data.movementStatus == "none" ) && <Box textAlign="center" bgcolor="whitesmoke" p={2}>
        {/* <MockWebcamCapture setPhoto={setPhoto}/> */}
        <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 300,
        height: 300,
        borderRadius: 2,
        boxShadow: 3,
        overflow: "hidden", // Ensures the image doesn't overflow the box
        backgroundColor: loading ? "#f0f0f0" : "transparent", // Placeholder background while loading
      }}
    >
      {loading ? (
        <CircularProgress />
      ) : !!imageBlob ? (
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
      ) : <Typography variant="h5">No Image Found</Typography>}
    </Box>
        
         {/* <Home/> */}
         </Box>
    }
<hr/>
    {
       ( data.movementStatus == "Exited"  || data.movementStatus == "none" ) &&<Box textAlign="center" bgcolor="whitesmoke" p={2}> 
      
                                      <Typography sx={{backgroundColor : `lightgray`}}>
                                      Add Asset Details
                                        </Typography>  
                                    
                             
      <AssetRegistration setAssets={setAssets}/>
      </Box>
    }
    <hr/>
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
      <Grid container spacing={2} sx={{p : 1}}>

        <Grid item xs={6} sm={6}>
          <Typography variant="h5" align="left" fontWeight={600}>PNR:</Typography>
        </Grid>
        <Grid item xs={6} sm={6}>
          <Typography variant="h6" align="left">{data?.pnr}</Typography>
        </Grid>

        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">Name:</Typography>
        </Grid>
        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">{data?.visitorName}</Typography>
        </Grid>

        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">Organization:</Typography>
        </Grid>
        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">{data?.visitorOrg}</Typography>
        </Grid>

        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">Purpose:</Typography>
        </Grid>
        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">{data?.purpose}</Typography>
        </Grid>

        <Grid item  xs={6} sm={6}>
          <Typography variant="h5" align="left">{message}</Typography>
        </Grid>
        <Grid item  xs={6} sm={6} />

        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">Host Name:</Typography>
        </Grid>
        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">{data?.hostName}</Typography>
        </Grid>

        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">Id Type:</Typography>
        </Grid>
        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">{data?.idType}</Typography>
        </Grid>

        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">Id No:</Typography>
        </Grid>
        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">{data?.idNo}</Typography>
        </Grid>

        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">Visit Arrival:</Typography>
        </Grid>
        <Grid item  xs={6} sm={6}>
        
          <Typography variant="h6" align="left">{new Date(data?.inTime).toLocaleDateString('en-IN', options)}</Typography>
        </Grid>

        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">Visit Departure:</Typography>
        </Grid>
        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">{new Date(data?.outTime).toLocaleDateString('en-IN', options)}</Typography>
        </Grid>

        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">Movement Status:</Typography>
        </Grid>
        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">{data?.movementStatus}</Typography>
        </Grid>
        {!( data.movementStatus == "Exited"  || data.movementStatus == "none" ) && <>
          <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">Vehicle:</Typography>
        </Grid>
        <Grid item  xs={6} sm={6}>
          <Typography variant="h6" align="left">{data?.movementDetails?.movements[data?.movementDetails?.movements?.length -1]?.vehicleNo || 'N/A'}</Typography>
        </Grid>
        </>}
     
      </Grid>
              </Box>
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
       
          </>
        )}
      </Box>
    </Box>
  );
};


Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;

