// Import React and Material-UI components
import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper, Box, Grid, Divider, Stack
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


    const router = useRouter();
    const { pnr } = router.query;

    const { type, visitors } = router.query;
    const [dataTravel, setTravelData] = useState([]);
    const [dataAcc, setAccData] = useState([]);
    const [dataCon, setConData] = useState([]);
    const [decodedData, setDecodedData] = useState([])
    // const dataAccArray = Object.values(dataAcc);


    const [verified, setVerified] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = pnr[1]; // Replace with your actual token
                console.log("token:::from useEffect", token);
                const orgResponse = await axios.get(`https://10.244.3.101:8000/api/v1/checkdetails/org-details/${pnr[0]}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("Organisation response data server::", orgResponse.data);
                setTravelData(orgResponse.data);
                const accommodationDataArray = orgResponse.data.accommodationDetails.map(detail => detail.accomodationdetails).flat();
                setAccData(accommodationDataArray);

                // Set conveyance data
                const conveyanceDataArray = orgResponse.data.conveyanceDetails.map(detail => detail.conveyancedetails).flat();
                setConData(conveyanceDataArray);



            } catch (error) {
                console.error('Error fetching data:', error);
                // setStatusFromServer(false)
            }
        };

        const fetchData1 = async () => {
            try {
                const token = pnr[1]; // Replace with your actual token
                console.log("token:::from useEffect", token);
                const indResponse = await axios.get(`https://10.244.3.101:8000/api/v1/checkdetails/ind-details/${pnr[0]}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("Individual response data server::", indResponse.data);
                setTravelData(indResponse.data);

                // Set accommodation data
                const accommodationDataArray = indResponse.data.accommodationDetails.map(detail => detail.accomodationdetails).flat();
                setAccData(accommodationDataArray);

                // Set conveyance data
                const conveyanceDataArray = indResponse.data.conveyanceDetails.map(detail => detail.conveyancedetails).flat();
                setConData(conveyanceDataArray);

                //             // Set accommodation data
                // const accommodationDataArray = indResponse.data.accommodationDetails.map(detail => detail.accomodationdetails);
                // setAccData(accommodationDataArray);

                // // Set conveyance data
                // const conveyanceDataArray = indResponse.data.conveyanceDetails.map(detail => detail.conveyancedetails);
                // setConData(conveyanceDataArray);
                // setData(indResponse.data);
                // if(response.data.data.visitStatus === 'Cancelled'){
                //   setApproveButton(true)
                //   setCancelButton(true)


                // }else if(response.data.data.visitStatus === 'Planned' && response.data.data.approveByHost === true){
                //   console.log("i am in false statement")
                //   setApproveButton(true)  
                //   setCancelButton(false)   

                // }else if(response.data.data.visitStatus === 'Planned' && response.data.data.approveByHost === false){
                //   console.log("i am in false statement")
                //   setApproveButton(false)  
                //   setCancelButton(false)   

                // }       
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


    console.log("Travel data from server::", dataTravel);
    console.log("Acc data from server::", dataAcc);
    console.log("Con data from server::", dataCon);
    //   console.log("DataArray::", dataAccArray);

    const verifyToken = async (token) => {
        try {
            // Assuming token is a string
            console.log("verifyToken::", token[1]);
            console.log("typeOf::", typeof (token[1]));
            return new Promise((resolve, reject) => {
                jwt.verify(token[1], 'trackdetails', { algorithms: ['HS256'] }, function (err, decoded) {
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

    function createData(accomodationName, accomodationAddress, checkInTime, checkOutTime, contactOfHotel, bookedBy, bookedFor, remarks) {
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

                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh', // Adjust as needed

                    }}
                >

                    <Grid container spacing={2} component={Paper} elevation={5} sx={{ mx: 3, px: 2, py: 1, backgroundColor: indigo[50] }}>
                        <Grid item xs={12} sx={{ backgroundColor: 'white', borderRadius: 5, p: 2 }}>
                            <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={2}>
                                <img src='/assets/800px-CDAC_LOGO_crop.png' style={{
                                    height: 75,
                                }} alt="CDAC Logo" />
                                <Typography variant="h4" align="center">Track Visit Status</Typography>
                            </Stack>


                        </Grid>
                        <Grid item xs={12}  >
                            <h2> Verified Visit Table </h2>
                            <TableContainer component={Paper} style={{
                                borderRadius: '0 0 10px 10px',
                                boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.3)',
                                borderBottom: `1px solid ${indigo[200]}`
                            }}>
                                <Table>
                                    <TableHead >
                                        <TableRow >
                                            {/* <TableCell>PNR</TableCell> */}
                                            <TableCell>First Name</TableCell>
                                            <TableCell>Last Name</TableCell>

                                            <TableCell>Purpose</TableCell>
                                            <TableCell>Visiting Date </TableCell>
                                            <TableCell>Exiting Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>

                                        <TableRow >
                                            <TableCell>{dataTravel.visitorfirstname}</TableCell>
                                            <TableCell>{dataTravel.visitorlastname}</TableCell>
                                            <TableCell>{dataTravel.purpose}</TableCell>
                                            <TableCell>{dataTravel.visitstart}</TableCell>
                                            <TableCell>{dataTravel.visitend}</TableCell>
                                        </TableRow>

                                    </TableBody>


                                </Table>
                            </TableContainer>
                            <Box
                                component="hr"
                                sx={{
                                    border: 0,
                                    height: '0.2em',
                                    backgroundColor: indigo[200],
                                    width: '100%',
                                    mt: 5,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <h2>Accommodation Details</h2>
                            <TableContainer component={Paper} style={{
                                borderRadius: '0 0 10px 10px',
                                boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.3)',
                                borderBottom: `1px solid ${indigo[200]}`
                            }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>Accommodation Name</TableCell>
                                            <TableCell align="center">Accommodation Address</TableCell>
                                            <TableCell align="right">Check-In Time</TableCell>
                                            <TableCell align="right">Check-Out Time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dataAcc.map((row, index) => (
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
                                                    {/* <TableCell component="th" scope="row">
                                                        {row.arrivalDateTime}
                                                    </TableCell> */}
                                                    <TableCell component="th" scope="row">
                                                        {row.accomodationname}
                                                    </TableCell>
                                                    <TableCell align="center">{row.accomodationaddress}</TableCell>
                                                    <TableCell align="right">{row.checkindateandtime}</TableCell>
                                                    <TableCell align="right">{row.checkoutdateandtime}</TableCell>
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
                                                                            <TableCell>{row.accomodationcontact}</TableCell>
                                                                            <TableCell>{row.bookedby}</TableCell>
                                                                            <TableCell align="right">{row.bookedfor}</TableCell>
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
                            <Box
                                component="hr"
                                sx={{
                                    border: 0,
                                    height: '0.2em',
                                    backgroundColor: indigo[200],
                                    width: '100%',
                                    mt: 5,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <h2>Conveyance Details</h2>
                            <TableContainer component={Paper} style={{
                                borderRadius: '0 0 10px 10px',
                                boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.3)',
                                borderBottom: `1px solid ${indigo[200]}`
                            }}>
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
                                        {dataCon.map((row, index) => (
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
                                                    <TableCell>{row.pickupdateandtime}</TableCell>
                                                    <TableCell>{row.pickuplocation}</TableCell>
                                                    <TableCell>{row.dropoffdateandtime}</TableCell>
                                                    <TableCell>{row.dropofflocation}</TableCell>
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
                                                                            <TableCell>{row.bookedfor}</TableCell>
                                                                            <TableCell>{row.drivercontact}</TableCell>
                                                                            <TableCell>{row.vehicleno}</TableCell>
                                                                            <TableCell>{row.vehicletype}</TableCell>
                                                                            <TableCell>{row.bookedby}</TableCell>
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
                        </Grid>
                    </Grid>
                </Box>
            ) : (
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