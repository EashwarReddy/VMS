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
import { API } from "src/api";

// Define a functional component for the index page
const Visitor = () => {
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
    const visitDetails = [
        {
          pnr: "12345",
          visitorname: "sushmita",
          purpose: "meeting",
          inDatetime: "06-03-2024",
          outDatetime: "07-03-2024",
        },
        // Add more dummy data objects as needed
      ];
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = pnr[1]; // Replace with your actual token
                console.log("token:::from useEffect", token);
                const orgResponse = await axios.get(`${API}/checkdetails/org-details/${pnr[0]}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("response.data server::", orgResponse.data.visitDetails);
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
                const indResponse = await axios.get(`${API}/checkdetails/ind-details/${pnr[0]}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("response.data server::", indResponse.data.visitDetails);
                setTravelData(indResponse.data);

                // Set accommodation data
                const accommodationDataArray = indResponse.data.accommodationDetails.map(detail => detail.accomodationdetails).flat();
                setAccData(accommodationDataArray);

                // Set conveyance data
                const conveyanceDataArray = indResponse.data.conveyanceDetails.map(detail => detail.conveyancedetails).flat();
                setConData(conveyanceDataArray);
      
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
                                <Typography variant="h4" align="center">Visitor details</Typography>
                            </Stack>


                        </Grid>
                        <Grid item xs={12}  >
                            <h2>Visitor Details </h2>
                            <TableContainer component={Paper} style={{
                                borderRadius: '0 0 10px 10px',
                                boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.3)',
                                borderBottom: `1px solid ${indigo[200]}`
                            }}>
                                <Table>
                                    <TableHead >
                                        <TableRow >
                                            <TableCell>PNR</TableCell>
                                            <TableCell>Visitor Name</TableCell>
                                        

                                            <TableCell>Purpose</TableCell>
                                            <TableCell>In-Date-Time  </TableCell>
                                            <TableCell>Out-Date-Time</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                  {visitDetails.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.pnr}</TableCell>

                      <TableCell>{detail.visitorname}</TableCell>
                      <TableCell>{detail.purpose}</TableCell>
                      <TableCell>{detail.inDatetime}</TableCell>
                      <TableCell>{detail.outDatetime}</TableCell>
                    </TableRow>
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
                      
                      
                    </Grid>
                </Box>
            ) 
            : (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100vh"
                >
                  
                </Box>
            )}


        </div>
    );
};

// Export the component as the default export
export default Visitor;