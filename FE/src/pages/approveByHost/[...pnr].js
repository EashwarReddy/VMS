import Head from 'next/head';
import { useRouter } from 'next/router';

import { Box, Button, Chip, CircularProgress, Container, Unstable_Grid2 as Grid, Icon, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { indigo } from '@mui/material/colors';
// import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';

import CallIcon from '@mui/icons-material/Call';

import { Email } from '@mui/icons-material';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import MuiAlert from "@mui/material/Alert";
import axios from 'axios';
import jwt from 'jsonwebtoken';
import jsPDF from "jspdf";
import React, { useEffect, useState } from 'react';

import { useRef } from "react";
import CustomQRCode from "../../components/CustomQRCode"; // Import the custom QR code component
import { API, Frontend_API } from 'src/api';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const logoUrl = "/cdac.png";
const topLogo = "https://upload.wikimedia.org/wikipedia/en/d/db/C-DAC_LogoTransp.png"// Assuming your logo file is in the public directory


const Page = () => {
  const router = useRouter();
  // Define the logo image URL
  const [state, setState] = useState({})
  const [open, setOpen] = React.useState(false);
  const [canelOpen, setCancelOpen] = React.useState(false);
  const [orgType, setOrgType] = useState(true)
  const [priority, setPriority] = useState('low')
  const { pnr } = router.query;
  // const PNR = router.query["pnr"]["token"];
  const [data, setData] = useState([]);
  const [dataQR, setDataQR] = useState([]);

  const { type, visitors } = router.query;
  const [decodedData, setDecodedData] = useState([])
  const [verified, setVerified] = useState(null);
  const [isValidationError, setIsValidationError] = useState(false);
  const [isErrorFromServer, setIsErrorFromServer] = useState(false);
  const [isApproveSubmitted, setIsApproveSubmitted] = useState(false);
  const [approveButton, setApproveButton] = useState(false);
  const [cancelButton, setCancelButton] = useState(false);
  const qrCodeRef = useRef(null); // Reference to the QR code component
  const [isPDFGenerated, setIsPDFGenerated] = useState(false);
  const [sharedFormData, setSharedForData] = useState(''); // Define a variable in a shared scope
  const [refresh, setRefresh] = useState(false)


  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCancelClickOpen = () => {
    setCancelOpen(true);
  };

  const handleCancelClose = () => {
    setCancelOpen(false);
  };
  const priorityColors = {
    'low': 'info.main',
    'medium': 'warning.main',
    'high': 'error.main'
  }
  const handleCloseSnackbar = () => {
    setState({ ...state, open: false })

  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = pnr[1]; // Replace with your actual token
        console.log("token:::from useEffect", token, type);
        const response = await axios.get(`${API}/handleVisits/approvalIndDetails/${pnr[0]}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("response.data server::", response.data.data);
        setData(response.data.data);
        setDataQR(response.data.data);
        if (response.data.data.visitStatus === 'Cancelled' ) {
          setApproveButton(true)
          setCancelButton(true)


        }else if( response.data.data.visitStatus === 'Approved' ) {
          setApproveButton(true)
          setCancelButton(false)
        } else if (response.data.data.visitStatus === 'Ongoing' && response.data.data.approveByHost === true) {
          console.log("i am in false statement")
          setApproveButton(true)
          setCancelButton(false)

        } else if (response.data.data.visitStatus === 'Ongoing' && response.data.data.approveByHost === false) {
          console.log("i am in false statement")
          setApproveButton(false)
          setCancelButton(false)

        }

      } catch (error) {
        console.error('Error fetching data:', error);
        // setStatusFromServer(false)
      }
    };
    const fetchDataOrg = async () => {
      try {
        const token = pnr[1]; // Replace with your actual token
        console.log("token:::from useEffect", token, type);
        const response = await axios.get(`${API}/handleVisits/approvalOrgDetails/${pnr[0]}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("response.data server::", response.data.data);
        setData(response.data.data);
        setDataQR(response.data.data);
        if (response.data.data.visitStatus === 'Cancelled') {
          setApproveButton(true)
          setCancelButton(true)


        } else if (response.data.data.visitStatus === 'Ongoing' && response.data.data.approveByHost === true) {
          console.log("i am in false statement")
          setApproveButton(true)
          setCancelButton(false)

        } else if (response.data.data.visitStatus === 'Ongoing' && response.data.data.approveByHost === false) {
          console.log("i am in false statement")
          setApproveButton(false)
          setCancelButton(false)

        }

      } catch (error) {
        console.error('Error fetching data:', error);
        // setStatusFromServer(false)
      }
    };
    if(type=="organization")
    { 
      fetchDataOrg();
  }
  else{
    fetchData()
  }
    console.log(state)

    const fetchData1 = async () => {
      try {
        const token = pnr[1]; // Replace with your actual token
        console.log("token:::from useEffect", token);
        const response = await axios.get(`${API}/handleVisits/approvalIndDetails/${pnr[0]}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("response.data server::", response.data.data);
        setData(response.data.data);
        setDataQR(response.data.data);
        setOrgType(false)
        if (response.data.data.visitStatus === 'Cancelled') {
          setApproveButton(true)
          setCancelButton(true)


        } else if (response.data.data.visitStatus === 'Ongoing' && response.data.data.approveByHost === true) {
          console.log("i am in false statement")
          setApproveButton(true)
          setCancelButton(false)

        } else if (response.data.data.visitStatus === 'Ongoing' && response.data.data.approveByHost === false) {
          console.log("i am in false statement")
          setApproveButton(false)
          setCancelButton(false)

        }
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
          await fetchData();
        } else {
          console.log('i am inside of else statement')
          setDecodedData(decoded)
          await fetchData1();
        }
      }
    };

    fetchAndVerifyData();
  }, [type, pnr]);
  // const [qrData, setQRData] = useState(`http://10.244.3.203:3000/${pnr[0]}/${pnr[1]}`); // State to hold QR data

  const [qrData, setQRData] = useState(''); // State to hold QR data

  console.log("data from server::", data);
  const verifyToken = async (token) => {
    try {
      // Assuming token is a string
      console.log("verifyToken::", token[1]);
      console.log("typeOf::", typeof (token[1]));
      return new Promise((resolve, reject) => {
        jwt?.verify(token[1], 'approvecancel', { algorithms: ['HS256'] }, function (err, decoded) {
          if (err) {
            console.error('Token verification failed:', err);
            setVerified(false)
            // reject(err);
          } else {
            console.log('Token verified:', decoded);
            setVerified(true)
            resolve(decoded);
            setQRData(`${Frontend_API}/verifyPNR/${pnr[0]}/${pnr[1]}`)
          }
        });
      });
    } catch (error) {
      console.error('Token verification failed:', error);
      setVerified(false)
      throw error;
    }
  };



  const handleCancel = async () => {
    try {
      // Send data to the backend with approve status
      const token = pnr[1];
      console.log("token in approve ::", token)

      const headers = {
        'Authorization': `Bearer ${token}` // Assuming your token is a bearer token
      };
      if (data.visitorCount > 1) {
        await sendDataToBackend1({ ...data, approveByHost: false }, headers); // Pass headers separately
        setIsApproveSubmitted(false);
        setCancelButton(true)

      } else {
        await sendDataToBackend1({ ...data, approveByHost: false }, headers); // Pass headers separately
        setIsApproveSubmitted(false);
      }

    } catch (error) {
      console.error('Error approving:', error);
      setIsValidationError(true);
    }
  };





  // const handleApprove = async () => {
  //   try {
  //     // Send data to the backend with approve status

  //     if (decodedData.visitorinfo.type === 'Organization') {
  //       console.log('i am in approveOrg statement')
  //        let sharedFormdata='';
  //        generatePDF(dataQR)
  //        .then(base64String => {
  //            // Use the base64String here
  //            sharedFormdata = base64String;
  //            console.log("base64String from org approve::", base64String);

  //            // Send the base64String to your API
  //            sendDataToBackend({ ...data, approveByHost: true, sharedFormdata })
  //                .then(response => {
  //                    // Handle the response from the API if needed
  //                    setIsApproveSubmitted(false);
  //                })
  //                .catch(error => {
  //                    console.error("Error sending data to backend:", error);
  //                });
  //        })
  //        .catch(error => {
  //            console.error("Error generating PDF:", error);
  //        });
  //       // await sendDataToBackend({ ...data, approveByHost: true,sharedFormdata }); // Pass headers separately
  //       setIsApproveSubmitted(false);

  //     } else {
  //       //  let sharedFormdata =await generatePDF(dataQR);
  //       let sharedFormdata='';
  //       generatePDF(dataQR)
  //       .then(base64String => {
  //           // Use the base64String here
  //           sharedFormdata = base64String;
  //           console.log("base64String from org approve::", base64String);

  //           // Send the base64String to your API
  //           sendDataToBackend({ ...data, approveByHost: true, sharedFormdata })
  //               .then(response => {
  //                   // Handle the response from the API if needed
  //                   setIsApproveSubmitted(false);
  //               })
  //               .catch(error => {
  //                   console.error("Error sending data to backend:", error);
  //               });
  //       })
  //       .catch(error => {
  //           console.error("Error generating PDF:", error);
  //       });

  //       // await sendDataToBackend({ ...data, approveByHost: true ,sharedFormdata}); // Pass headers separately
  //       console.log('i am in approvalInd statement')

  //       setIsApproveSubmitted(false);


  //     }

  //   } catch (error) {
  //     console.error('Error approving:', error);
  //     setIsValidationError(true);
  //   }
  // };

  // Function to convert base64 string to Blob

  // const handleApprove = async () => {
  //   try {
  //       // Send data to the backend with approve status
  //       let sharedFormdata = '';

  //       if (decodedData.visitorinfo.type === 'Organization') {
  //           console.log('I am in approveOrg statement');

  //           // Generate PDF and convert it to a file
  //           generatePDF(dataQR)
  //               .then(base64String => {
  //                   // Use the base64String here
  //                   sharedFormdata = base64String;
  //                   console.log("base64String from org approve:", base64String);

  //                   // Convert base64 string to Blob
  //                   const blob = base64ToBlob(base64String);
  // console.log("blob from approve::",blob)
  //                   // Convert Blob to File
  //                   const pdfFile = new File([blob], 'qrcodes.pdf', { type: 'application/pdf' });
  //                   console.log("pdfFile from approve::",pdfFile)

  //                   // Create form data
  //                   const formData = new FormData();
  //                   formData.append('file', pdfFile);
  //                   // formData.append('sharedFormdata', sharedFormdata);
  //                   console.log("formData in approveOrg:", formData); // Log formData

  //                   // Additional data to be sent
  //                   const additionalData = {
  //                       approveByHost: true
  //                       // Add other additional data if needed
  //                   };


  //                   // Send form data to the backend
  //                   sendDataToBackend(formData, additionalData);
  //               })
  //               .catch(error => {
  //                   console.error("Error generating PDF:", error);
  //               });
  //       } else {
  //           console.log('I am in approvalInd statement');

  //           // Generate PDF and convert it to a file
  //           generatePDF(dataQR)
  //               .then(base64String => {
  //                   // Use the base64String here
  //                   sharedFormdata = base64String;
  //                   console.log("base64String from approvalInd:", base64String);

  //                   // Convert base64 string to Blob
  //                   const blob = base64ToBlob(base64String);

  //                   // Convert Blob to File
  //                   const pdfFile = new File([blob], 'qrcodes.pdf', { type: 'application/pdf' });

  //                   // Create form data
  //                   const formData = new FormData();
  //                   formData.append('file', pdfFile);
  //                   formData.append('sharedFormdata', sharedFormdata);

  //                   // Additional data to be sent
  //                   const additionalData = {
  //                       approveByHost: true
  //                       // Add other additional data if needed
  //                   };

  //                   console.log("formData in approvalInd:", formData); // Log formData

  //                   // Send form data to the backend
  //                   sendDataToBackend(formData, additionalData);
  //               })
  //               .catch(error => {
  //                   console.error("Error generating PDF:", error);
  //               });
  //       }
  //   } catch (error) {
  //       console.error('Error approving:', error);
  //       setIsValidationError(true);
  //   }
  // };


  // //   const handleApprove = async () => {
  // //     try {
  // //         // Send data to the backend with approve status
  // //         let sharedFormdata = '';

  // //         if (decodedData.visitorinfo.type === 'Organization') {
  // //             console.log('I am in approveOrg statement');

  // //             // Generate PDF and convert it to a file
  // //             generatePDF(dataQR)
  // //                 .then(base64String => {
  // //                     // Use the base64String here
  // //                     sharedFormdata = base64String;
  // //                     console.log("base64String from org approve:", base64String);

  // //                     // Convert base64 string to Blob
  // //                     const blob = base64ToBlob(base64String);

  // //                     // Convert Blob to File
  // //                     const pdfFile = new File([blob], 'qrcodes.pdf', { type: 'application/pdf' });

  // //                     // Create form data
  // //                     const formData = new FormData();
  // //                     formData.append('file', pdfFile);
  // //                     formData.append('approveByHost', true);
  // //                     formData.append('sharedFormdata', sharedFormdata);

  // //                     // Send form data to the backend
  // //                     sendDataToBackend(formData)
  // //                         .then(response => {
  // //                             // Handle the response from the API if needed
  // //                             setIsApproveSubmitted(false);
  // //                         })
  // //                         .catch(error => {
  // //                             console.error("Error sending data to backend:", error);
  // //                         });
  // //                 })
  // //                 .catch(error => {
  // //                     console.error("Error generating PDF:", error);
  // //                 });
  // //         } else {
  // //             console.log('I am in approvalInd statement');

  // //             // Generate PDF and convert it to a file
  // //             generatePDF(dataQR)
  // //                 .then(base64String => {
  // //                     // Use the base64String here
  // //                     sharedFormdata = base64String;
  // //                     console.log("base64String from approvalInd:", base64String);

  // //                     // Convert base64 string to Blob
  // //                     const blob = base64ToBlob(base64String);

  // //                     // Convert Blob to File
  // //                     const pdfFile = new File([blob], 'qrcodes.pdf', { type: 'application/pdf' });

  // //                     // Create form data
  // //                     const formData = new FormData();
  // //                     formData.append('file', pdfFile);
  // //                     formData.append('approveByHost', true);
  // //                     formData.append('sharedFormdata', sharedFormdata);

  // //                     // Send additional formData
  // //                     // Add your additional formData here
  // //                     formData.append('key1', 'value1');
  // //                     formData.append('key2', 'value2');

  // //                     // Send form data to the backend
  // //                     sendDataToBackend(formData)
  // //                         .then(response => {
  // //                             // Handle the response from the API if needed
  // //                             setIsApproveSubmitted(false);
  // //                         })
  // //                         .catch(error => {
  // //                             console.error("Error sending data to backend:", error);
  // //                         });
  // //                 })
  // //                 .catch(error => {
  // //                     console.error("Error generating PDF:", error);
  // //                 });
  // //         }
  // //     } catch (error) {
  // //         console.error('Error approving:', error);
  // //         setIsValidationError(true);
  // //     }
  // // };
  // const sendDataToBackend = async (formData, additionalData) => {
  //   try {
  //       // Replace the URL with your actual backend endpoint
  //       console.log("formData::",formData)
  //       console.log("additionalData::",additionalData)

  //       let endpoint;
  //       if (decodedData.visitorinfo.type === 'Organization') {
  //           endpoint = `https://10.244.3.101:8000/api/v1/handleVisits/approvalOrgVisit/${pnr[0]}`;
  //       } else {
  //           endpoint = `https://10.244.3.101:8000/api/v1/handleVisits/approvalIndVisit/${pnr[0]}`;
  //       }

  //       const token = pnr[1];
  //       console.log("Token in approve:", token);

  //       const headers = {
  //           'Authorization': `Bearer ${token}`,
  //           // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
  //       };

  //       // Append additional data to formData
  //       for (const [key, value] of Object.entries(additionalData)) {
  //           formData.append(key, value);
  //       }

  //       // Make a PUT request to the backend with headers and formData
  //       // const response = await axios.put(endpoint, formData, { headers });
  //       console.log("Response after update:", response.data);

  //       handleClose();
  //       handleCancelClose();
  //       setIsApproveSubmitted(true);
  //   } catch (error) {
  //       console.error('Error sending data to backend:', error);
  //       setIsApproveSubmitted(false); // Set to false to handle the submission state
  //   }
  // };



  // Function to convert Blob to base64
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.onerror = reject;
    });
  }

  // const handleApprove = async () => {
  //   try {
  //     let sharedFormdata = new FormData(); // Create a FormData object

  //     // Generate PDF file
  //     const pdfBlob = await generatePDF(dataQR);
  //     console.log("pdfBlob:::", pdfBlob); // Check the generated PDF blob

  //     const base64Data = await blobToBase64(pdfBlob);
  //     console.log('Converted base64', base64Data)

  //     // Send FormData to your API
  //     sendDataToBackend({ ...data, approveByHost: true, base64Data })
  //       .then(response => {
  //         // Handle the response from the API if needed

  //       })

  //       .catch(error => {
  //         console.error("Error sending data to backend:", error);
  //       });

  //     // Update UI state
  //     setIsApproveSubmitted(false);
  //       // Disable the approve button
  //       setApproveButtonDisabled(true);
  //       // Refresh the page
  //       // window.location.reload();
  //     setIsApproveSubmitted(false);
  //   } catch (error) {
  //     console.error('Error approving:', error);
  //     setIsValidationError(true);
  //   }
  // };
  // const [approveButtonDisabled, setApproveButtonDisabled] = useState(false);

  const handleApprove1 = async () => {
    try {
      // Perform your approval logic here

      // Disable the approve button
      setApproveButtonDisabled(true);

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error('Error approving:', error);
      // Handle errors if needed
    }
  };

  const handleApprove = async () => {
    try {


      // Generate PDF file
      const pdfBlob = await generatePDF(dataQR);
      console.log("pdfBlob:::", pdfBlob); // Check the generated PDF blob





      // const blobURL =  URL.createObjectURL(pdfBlob);
      const base64Data = await blobToBase64(pdfBlob);
      console.log('Converted base64', base64Data)







      //     // Send FormData to your API
      sendDataToBackend({ ...data, approveByHost: true, base64Data })
        .then(response => {
          // Handle the response from the API if needed
          setIsApproveSubmitted(false);
          window.location.reload();

        })
        .catch(error => {
          console.error("Error sending data to backend:", error);
        });
      // }

      // )
      // .catch(error => {
      //     console.error("Error generating PDF:", error);
      // });

      // Update UI state
      setIsApproveSubmitted(false);
    } catch (error) {
      console.error('Error approving:', error);
      setIsValidationError(true);
    }
  };


  const sendDataToBackend = async (modifiedData) => { // Receive headers as a separate argument
    try {
      // Replace the URL with your actual backend endpoint
      if (data.visitorsCount > 1) {
        const token = pnr[1];
        console.log("token in approve ::", token)

        const headers = {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
        };
        const backendEndpoint = `${API}/handleVisits/approvalOrgVisit/${pnr[0]}`;
        console.log("sendDataToBackend::", modifiedData);

        // Make a PUT request to the backend with headers
        const response = await axios.put(backendEndpoint, modifiedData, { headers });
        console.log("response after update::", response.data);
        handleClose()
        handleCancelClose()
        setIsApproveSubmitted(true);
        setApproveButton(true)
        setState({ severity: 'success', message: 'Submitted Successfully', open: true })

      } else {
        const token = pnr[1];
        console.log("token in approve ::", token)

        const headers = {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
        };
        const backendEndpoint = `${API}/handleVisits/approvalIndVisit/${pnr[0]}`;
        console.log("sendDataToBackend::", modifiedData);

        // Make a PUT request to the backend with headers
        const response = await axios.put(backendEndpoint, modifiedData, { headers });
        console.log("response after update::", response.data);
        handleClose()
        handleCancelClose()
        setIsApproveSubmitted(true);
        setState({ severity: 'success', message: 'Submitted Successfully', open: true })


      }

    } catch (error) {
      console.error('Error sending data to backend:', error);
      setIsApproveSubmitted(false); // Set to false to handle the submission state
      setState({ severity: 'error', message: error.response.errors[0], open: true })
    }
  };

  const sendDataToBackend1 = async (modifiedData, headers) => { // Receive headers as a separate argument
    try {
      // Replace the URL with your actual backend endpoint
      if (data.visitorCount > 1) {
        const backendEndpoint = `${API}/handleVisits/CancelOrgVisit/${pnr[0]}`;
        console.log("sendDataToBackend::", modifiedData);

        // Make a PUT request to the backend with headers
        const response = await axios.put(backendEndpoint, modifiedData, { headers });
        console.log("response after update::", response.data);
        setIsApproveSubmitted(true);
        handleClose()
        handleCancelClose()
        setCancelButton(true)
        setState({ severity: 'success', message: 'Submitted Successfully', open: true })

      } else {
        const backendEndpoint = `${API}/handleVisits/CancelIndVisit/${pnr[0]}`;
        console.log("sendDataToBackend::", modifiedData);

        // Make a PUT request to the backend with headers
        const response = await axios.put(backendEndpoint, modifiedData, { headers });
        console.log("response after update::", response.data);
        setIsApproveSubmitted(true);
        handleClose()
        handleCancelClose()
        setState({ severity: 'success', message: 'Submitted Successfully', open: true })

      }
    } catch (error) {
      console.error('Error sending data to backend:', error);
      setIsApproveSubmitted(false); // Set to false to handle the submission state
      setState({ severity: 'error', message: 'Failed to submit', open: true })

    }
  };

  const isDateValid = () => {
    // Check if the date in decodedData is greater than today's date
    const today = new Date();
    const decodedDate = new Date(data.visitend);

    return today > decodedDate;
  };


  const handleDownloadQR = async () => {
    // Assuming qrData is the value to be used as a query in the database
    const qrCodeValue = 1;
    // const data = { name: 'Visitor Name' }; // Replace with your actual data
    generatePDF(dataQR);

  };
  //   const generatePDF = async(data) => {
  //     const pdf = new jsPDF();

  //     // Define gradient colors
  //     let endColor = [63, 81, 181, 0.3]; // Translucent blue color (RGBA)
  //     let startColor = [173, 216, 230]; // Light blue color (RGB)
  //     // var  endColor = [0, 0, 150]; // Blue color (RGB)
  //     // var startColor = [255, 180, 255]; // Violet color (RGB)
  //     let numRectangles = 100; // Number of rectangles to draw

  //     // Calculate color step for each rectangle
  //     let colorStep = [
  //       (endColor[0] - startColor[0]) / numRectangles,
  //       (endColor[1] - startColor[1]) / numRectangles,
  //       (endColor[2] - startColor[2]) / numRectangles
  //     ];

  //     // Draw rectangles to create gradient effect
  //     let currentColor = startColor.slice(); // Copy start color

  //     // Dimensions
  //     const pdfWidth = pdf.internal.pageSize.getWidth();
  //     const pdfHeight = pdf.internal.pageSize.getHeight();
  //     const logoWidth = 40; // Adjust the logo width as needed
  //     const logoHeight = 40;
  //     const qrCodeWidth = 80; // Adjust the QR code width as needed
  //     const qrCodeHeight = 80;
  //     const contentMarginTop = 10; // Adjust the margin in points for content as needed
  //     // const qrCodeImageData = qrCodeContainer.toDataURL('image/png');

  //     // Draw QR code directly
  //     const qrCodeContainer = document.getElementById("qr-code");
  //     if (!qrCodeContainer) {
  //       console.error("QR code container not found");
  //       return;
  //     }

  //     qrCodeContainer.style.border = "5px solid red"; // Adjust the border size and color as needed
  //     qrCodeContainer.style.borderRadius = "10px"; // Optional: Add border-radius for rounded corners

  //     // Convert QR code container to image
  //     const qrCodeImageData = qrCodeContainer.toDataURL("image/png");
  //     // Logo at the top
  //     const logoX = (pdfWidth - logoWidth) / 2;
  //     const logoY = contentMarginTop;
  //     pdf.setFillColor(245, 245, 245);
  //     pdf.setDrawColor(0, 0, 0); // Black border
  //     pdf.roundedRect(10, logoY - 2.5, pdfWidth - 20, logoHeight + 3, 8, 8, 'F');
  //     pdf.addImage(topLogo, "PNG", logoX - 5, logoY, logoWidth + 10, logoHeight - 5); // Replace 'path/to/your/logo.png' with your logo path
  //     // QR code below the logo
  //     const qrCodeX = ((pdfWidth - qrCodeWidth) / 2);
  //     const qrCodeY = logoY + logoHeight + 15; // Adjust the Y position as needed
  //     pdf.setFillColor(255, 255, 255); // White color
  //     pdf.setDrawColor(0, 0, 0); // Black border
  //     pdf.rect(qrCodeX - 10, qrCodeY - 10, qrCodeWidth + 25, qrCodeHeight + 25, 'F');
  //     pdf.addImage(
  //       qrCodeImageData,
  //       "PNG",
  //       qrCodeX - 5,
  //       qrCodeY - 5,
  //       qrCodeWidth + 15,
  //       qrCodeHeight + 15
  //     );

  //     pdf.addImage(
  //       logoUrl,
  //       "PNG",
  //       qrCodeX + 27,
  //       qrCodeY + 27,
  //       qrCodeWidth - 50,
  //       qrCodeHeight - 50,
  //     );
  //     pdf.setLineWidth(2);
  //     pdf.rect(qrCodeX - 10, qrCodeY - 10, qrCodeWidth + 25, qrCodeHeight + 25);

  //     // Visitor name below the QR code at the center
  //     const visitorNameWidth =
  //       pdf.getStringUnitWidth(`PNR: Abc456Tvc`) *
  //       24;
  //     const visitorNameX = pdfWidth - visitorNameWidth + 30; // Center the text
  //     const visitorNameY = qrCodeY + qrCodeHeight + 25; // Adjust the Y position as needed
  //     pdf.setTextColor(0, 0, 0)
  //     pdf.setFontSize(24);
  //     const text = `PNR: Abc456Tvc`

  //     var leftWidth = pdfWidth / 4;
  //     var rightWidth = (3 / 4) * pdfWidth;
  //     var borderWidth = 0.5;
  //     // Set the border style for the dotted line
  //     var borderStyle = [2, 2]; // Dotted line style

  //     // Set fill color to whitesmoke
  //     pdf.setFillColor(245, 245, 245);

  //     pdf.setLineDashPattern(borderStyle);
  //     pdf.setLineWidth(borderWidth);
  //     // Draw dotted line before rounded rectangles
  //     pdf.line(10, qrCodeY + qrCodeHeight + 25, pdfWidth - 10, qrCodeY + qrCodeHeight + 25);

  //     // Reset line dash pattern
  //     pdf.setLineDashPattern([]);
  //     // Draw left section
  //     const profileimg = "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  //     let detailsSectionHeight = qrCodeY + qrCodeHeight + 40
  //     pdf.setLineWidth(1);
  //     pdf.rect(10, detailsSectionHeight, leftWidth, 60);
  //     pdf.roundedRect(10, detailsSectionHeight, leftWidth, 60, 5, 0, 'F');
  //     pdf.addImage('dummy.jpeg', 'JPEG', 15, detailsSectionHeight + 5, leftWidth - 10, 50);
  //     pdf.setLineWidth(1);
  //     pdf.rect(leftWidth + 13, detailsSectionHeight, rightWidth - 20, 60);
  //     pdf.roundedRect(leftWidth + 13, detailsSectionHeight, rightWidth - 20, 60, 0, 5, 'F');

  //     pdf.setTextColor(255, 255, 255)
  //     pdf.setTextColor(0, 0, 0); // Set text color to black
  //     pdf.setFont('bold'); // Set font style to bold
  //     pdf.setFontSize(14); // Set font size to larger
  //     detailsSectionHeight += 7
  //     pdf.text(`PNR: ${pnr[0]}`, leftWidth + 17, detailsSectionHeight);
  //     detailsSectionHeight += 7
  //     pdf.text(`Visitor Name: ${data.visitorName}`, leftWidth + 17, detailsSectionHeight);
  //     detailsSectionHeight += 7
  //     pdf.text(`Visitor Org: ${data.organisation}`, leftWidth + 17, detailsSectionHeight);
  //     detailsSectionHeight += 7
  //     pdf.text(`In Time: ${data.visitStart}`, leftWidth + 17, detailsSectionHeight);
  //     detailsSectionHeight += 7
  //     pdf.text( `Out Time: ${data.visitEnd}` , leftWidth + 17, detailsSectionHeight);
  //     detailsSectionHeight += 7
  //     pdf.text(`Host Name: ${data.email}`, leftWidth + 17, detailsSectionHeight);
  //     detailsSectionHeight += 7
  //     pdf.text(`Purpose: ${data.purpose}`, leftWidth + 17, detailsSectionHeight);
  //     pdf.setFont('normal'); // Reset font style


  //     // Draw border around the entire content
  //     pdf.setDrawColor(0, 0, 0); // Set border color to red (adjust as needed)
  //     pdf.setLineWidth(1);
  //     pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);

  // // const pdfFileName = "qrcodes.pdf"; // Adjust the file name/path as needed

  // // // Fetch the PDF file using AJAX
  // // fetch(pdfFileName)
  // //     .then(response => {
  // //         if (!response.ok) {
  // //             throw new Error("Network response was not ok");
  // //         }
  // //         return response.blob();
  // //     })
  // //     .then(blob => {
  // //         // Convert the blob to a base64 string
  // //         return new Promise((resolve, reject) => {
  // //             const reader = new FileReader();
  // //             reader.onload = () => resolve(reader.result.split(',')[1]);
  // //             reader.onerror = reject;
  // //             reader.readAsDataURL(blob);
  // //         });
  // //     })
  // //     .then(base64String => {
  // //         // Now you can use the base64String
  // //         // sharedFormData = base64String;
  // //         // console.log("sharedFormData inside function:::",sharedFormData)
  // //         setSharedForData(base64String)

  // //     })
  // //     .catch(error => {
  // //         console.error("Error fetching or converting the PDF file:", error);
  // //     });

  //      // Fetch the PDF file using AJAX
  //      const pdfFileName = "qrcodes.pdf"; 
  //      pdf.save(pdfFileName);// Adjust the file name/path as needed


  // // Save the PDF file locally
  // pdf.save(pdfFileName);

  // const pdfData = pdf.output('blob');

  // // Convert PDF data to base64
  // const reader = new FileReader();
  // reader.onloadend = function() {
  //   const base64Data = reader.result.split(',')[1];
  //   console.log('Base64 representation of the PDF:', base64Data);
  //  setSharedForData(base64Data);
  //   // Now you can use this base64 representation as needed
  // };
  // reader.readAsDataURL(pdfData);


  //     //  try {
  //     //      const response = await fetch(pdfFileName);
  //     //      if (!response.ok) {
  //     //          throw new Error("Network response was not ok");
  //     //      }
  //     //      const blob = await response.blob();
  //     //      const base64String = await new Promise((resolve, reject) => {
  //     //          const reader = new FileReader();
  //     //          reader.onload = () => resolve(reader.result.split(',')[1]);
  //     //          reader.onerror = reject;
  //     //          reader.readAsDataURL(blob);
  //     //      });
  //     //      return base64String;
  //     //  } catch (error) {
  //     //      console.error("Error fetching or converting the PDF file:", error);
  //     //      return null;
  //     //  }

  //   };
  const generatePDF = async (data) => {
    return new Promise((resolve, reject) => {
      const pdf = new jsPDF();

      // Define gradient colors
      let endColor = [63, 81, 181, 0.3]; // Translucent blue color (RGBA)
      let startColor = [173, 216, 230]; // Light blue color (RGB)
      // var  endColor = [0, 0, 150]; // Blue color (RGB)
      // var startColor = [255, 180, 255]; // Violet color (RGB)
      let numRectangles = 100; // Number of rectangles to draw

      // Calculate color step for each rectangle
      let colorStep = [
        (endColor[0] - startColor[0]) / numRectangles,
        (endColor[1] - startColor[1]) / numRectangles,
        (endColor[2] - startColor[2]) / numRectangles
      ];

      // Draw rectangles to create gradient effect
      let currentColor = startColor.slice(); // Copy start color

      // Dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const logoWidth = 40; // Adjust the logo width as needed
      const logoHeight = 40;
      const qrCodeWidth = 80; // Adjust the QR code width as needed
      const qrCodeHeight = 80;
      const contentMarginTop = 10; // Adjust the margin in points for content as needed

      // Draw QR code directly
      const qrCodeContainer = document.getElementById("qr-code");
      if (!qrCodeContainer) {
        console.error("QR code container not found");
        reject("QR code container not found");
      }

      qrCodeContainer.style.border = "5px solid red"; // Adjust the border size and color as needed
      qrCodeContainer.style.borderRadius = "10px"; // Optional: Add border-radius for rounded corners

      // Convert QR code container to image
      const qrCodeImageData = qrCodeContainer.toDataURL("image/png");

      // Your PDF generation code...

      // Logo at the top
      const logoX = (pdfWidth - logoWidth) / 2;
      const logoY = contentMarginTop;
      pdf.setFillColor(245, 245, 245);
      pdf.setDrawColor(0, 0, 0); // Black border
      pdf.roundedRect(10, logoY - 2.5, pdfWidth - 20, logoHeight + 3, 8, 8, 'F');
      pdf.addImage(topLogo, "PNG", logoX - 5, logoY, logoWidth + 10, logoHeight - 5); // Replace 'path/to/your/logo.png' with your logo path
      // QR code below the logo
      const qrCodeX = ((pdfWidth - qrCodeWidth) / 2);
      const qrCodeY = logoY + logoHeight + 15; // Adjust the Y position as needed
      pdf.setFillColor(255, 255, 255); // White color
      pdf.setDrawColor(0, 0, 0); // Black border
      pdf.rect(qrCodeX - 10, qrCodeY - 10, qrCodeWidth + 25, qrCodeHeight + 25, 'F');
      pdf.addImage(
        qrCodeImageData,
        "PNG",
        qrCodeX - 5,
        qrCodeY - 5,
        qrCodeWidth + 15,
        qrCodeHeight + 15
      );

      pdf.addImage(
        logoUrl,
        "PNG",
        qrCodeX + 27,
        qrCodeY + 27,
        qrCodeWidth - 50,
        qrCodeHeight - 50,
      );
      pdf.setLineWidth(2);
      pdf.rect(qrCodeX - 10, qrCodeY - 10, qrCodeWidth + 25, qrCodeHeight + 25);

      // Visitor name below the QR code at the center
      const visitorNameWidth =
        pdf.getStringUnitWidth(`PNR: Abc456Tvc`) *
        24;
      const visitorNameX = pdfWidth - visitorNameWidth + 30; // Center the text
      const visitorNameY = qrCodeY + qrCodeHeight + 25; // Adjust the Y position as needed
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(24);
      const text = `PNR: Abc456Tvc`

      var leftWidth = pdfWidth / 4;
      var rightWidth = (3 / 4) * pdfWidth;
      var borderWidth = 0.5;
      // Set the border style for the dotted line
      var borderStyle = [2, 2]; // Dotted line style

      // Set fill color to whitesmoke
      pdf.setFillColor(245, 245, 245);

      pdf.setLineDashPattern(borderStyle);
      pdf.setLineWidth(borderWidth);
      // Draw dotted line before rounded rectangles
      pdf.line(10, qrCodeY + qrCodeHeight + 25, pdfWidth - 10, qrCodeY + qrCodeHeight + 25);

      // Reset line dash pattern
      pdf.setLineDashPattern([]);
      // Draw left section
      const profileimg = "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
      let detailsSectionHeight = qrCodeY + qrCodeHeight + 40
      pdf.setLineWidth(1);
      pdf.rect(10, detailsSectionHeight, leftWidth, 60);
      pdf.roundedRect(10, detailsSectionHeight, leftWidth, 60, 5, 0, 'F');
      pdf.addImage('dummy.jpeg', 'JPEG', 15, detailsSectionHeight + 5, leftWidth - 10, 50);
      pdf.setLineWidth(1);
      pdf.rect(leftWidth + 13, detailsSectionHeight, rightWidth - 20, 60);
      pdf.roundedRect(leftWidth + 13, detailsSectionHeight, rightWidth - 20, 60, 0, 5, 'F');

      pdf.setTextColor(255, 255, 255)
      pdf.setTextColor(0, 0, 0); // Set text color to black
      pdf.setFont('bold'); // Set font style to bold
      pdf.setFontSize(14); // Set font size to larger
      detailsSectionHeight += 7
      pdf.text(`PNR: ${pnr[0]}`, leftWidth + 17, detailsSectionHeight);
      detailsSectionHeight += 7
      pdf.text(`Visitor Name: ${data.visitorName}`, leftWidth + 17, detailsSectionHeight);
      detailsSectionHeight += 7
      pdf.text(`Visitor Org: ${data.organisation}`, leftWidth + 17, detailsSectionHeight);
      detailsSectionHeight += 7
      pdf.text(`In Time: ${new Date(data.visitStart).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}`, leftWidth + 17, detailsSectionHeight);
      detailsSectionHeight += 7
      pdf.text(`Out Time: ${new Date(data.visitEnd).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}`, leftWidth + 17, detailsSectionHeight);
      detailsSectionHeight += 7
      pdf.text(`Host Name: ${data.hostName}`, leftWidth + 17, detailsSectionHeight);
      detailsSectionHeight += 7
      pdf.text(`Purpose: ${data.purpose}`, leftWidth + 17, detailsSectionHeight);
      pdf.setFont('normal'); // Reset font style


      // Draw border around the entire content
      pdf.setDrawColor(0, 0, 0); // Set border color to red (adjust as needed)
      pdf.setLineWidth(1);
      pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);

      // // Save the PDF file locally
      // const pdfFileName = "qrcodes.pdf";
      // pdf.save(pdfFileName);

      // Write the PDF data to a file
      // fs.writeFile('qrcodes.pdf', pdf.output(), 'binary', (err) => {
      //   if (err) {
      //       console.error('Error writing PDF file:', err);
      //   } else {
      //       console.log('PDF file written successfully');
      //   }
      // });
      const pdfBlob = pdf.output('blob');
      resolve(pdfBlob);
      // // Convert PDF data to base64
      // const pdfData = pdf.output('blob');
      // const reader = new FileReader();
      // reader.onloadend = function () {
      //     const base64Data = reader.result.split(',')[1];
      //     resolve(base64Data); // Resolve the Promise with the base64 data
      // };
      // reader.readAsDataURL(pdfData);
    });
  };
  console.log("sharedFormData:::", sharedFormData)
  if (verified) {
    if (isDateValid()) {
      // Render the component for verified and with expireDate
      return (
        <>
          <Head>
            <title>Expired Visit</title>
          </Head>
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              py: 8,
              backgroundColor: '#f0f0f0',
            }}
          >
            <Container maxWidth="sm">
              <Grid container justifyContent="center" alignItems="center">
                <Paper
                  elevation={3}
                  sx={{
                    padding: '2rem',
                    textAlign: 'center',
                  }}
                >
                  {/* Beautiful styling for expired visit */}
                  <Typography variant="h4" color="error" gutterBottom>
                    Your Visit Has Expired
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    We are sorry, but your visit has expired. Please contact the administrator for assistance.
                  </Typography>
                  {/* <Button variant="contained" color="primary">
                  Back to Home
                </Button> */}
                </Paper>
              </Grid>
            </Container>
          </Box>
        </>
      );
    } else {
      // Render the default component for verified
      return (
        <>

          {/* <TextField
            label="Enter QR Data"
            variant="outlined"
            fullWidth
            value={qrData}
            onChange={(e) => setQRData(e.target.value)}
            style={{ marginBottom: "20px" }}
          /> */}

          {/* Button to generate QR code */}
          {/* <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateQR}
          >
            Generate QR Code
          </Button> */}

          {qrData && (
            <div style={{ marginTop: "0px", display: 'none' }}>
              {/* <Typography variant="h5" gutterBottom>
                Generated QR Code:
              </Typography> */}
              <CustomQRCode
                id="qr-code"
                ref={qrCodeRef}
                value={qrData}
                logo={logoUrl}
                style={{ display: "none" }}
              />
              {/* Download button */}

            </div>
          )}

          <Head>
            <title>
              Visitor Management System
            </title>
          </Head>
          <Snackbar
            open={state.open}
            autoHideDuration={3000} // Adjust the duration as needed
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}

          >
            <MuiAlert
              elevation={6}
              variant="filled"
              onClose={handleCloseSnackbar}
              severity={state.severity}
            >
              {state.message}
            </MuiAlert>
          </Snackbar>
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
                  By approving, you&apos;re agreeing to be responsible for the visitors on campus. If there are any incidents, you might be asked to provide more information.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Close</Button>
                <Button onClick={handleApprove}>Agree</Button>

              </DialogActions>
            </Dialog>
          </React.Fragment>

          <React.Fragment>
            <Dialog
              open={canelOpen}
              TransitionComponent={Transition}
              keepMounted
              onClose={handleCancelClose}
              aria-describedby="alert-dialog-slide-description"
            >
              <DialogTitle>{"Cancel the Meeting?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-slide-description">
                  By Cancelling, You&apos;re cancelling the visit .
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCancel}>Proceed</Button>
                <Button onClick={handleCancelClose}>Close</Button>
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
                  {/* <Button size='small' variant='contained' startIcon={<Refresh />} onClick={() => setRefresh(!refresh)}>Refresh</Button> */}

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
                      data.visitorName
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
                      data.organisation
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
                      data.visitorsCount
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
                        data.purpose
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
                      data.contact
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
                      data.email
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

                    {new Date(data.visitStart).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}


                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontWeight={600} variant='h6' display={'flex'} alignItems={'center'} >
                    <Icon>
                      <FlightTakeoffIcon />
                    </Icon>Departure Date and Time
                  </Typography>
                  <Typography variant='body1' sx={{ m: 1 }}>
                    {new Date(data.visitEnd).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}

                  </Typography>
                </Grid>
                <Grid item xs={12} display={'flex'} justifyContent={'center'}>

                  <Button variant='contained'
                    sx={{ backgroundColor: 'success.main', mx: 2 }}
                    onClick={() => {
                      handleClickOpen();

                    }}

                    disabled={approveButton}
                  // disabled={approveButtonDisabled}
                  // disabled={approveButtonDisabled}

                  >
                    Approve Visit
                  </Button>
                  <Button variant='contained' sx={{ backgroundColor: 'error.main', mx: 2 }} onClick={handleCancelClickOpen} disabled={cancelButton}>
                    Cancel Visit
                  </Button>
                </Grid>
              </Grid>
            </Container>
          </Box>
        </>
      );
    }
  } else if (verified == false) {
    // Render a different component for not verified
    return (
      <>
        {/* Your component for not verified */}
        {/* Add your component JSX here */}
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


      </>
    );
  } else {
    return <>
      <Typography variant='h2'> Loading........</Typography>
      <CircularProgress />
    </>
  }


}


export default Page;
