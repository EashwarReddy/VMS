// Import React and Material-UI components
import {
    Box, Grid,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import Typography from '@mui/material/Typography';
import { indigo } from "@mui/material/colors";
import React, { useEffect, useState } from "react";

import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";

import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { useAuth } from "src/hooks/use-auth";
import { Roles } from "src/components/roles";
import { API } from "src/api";
// Define a functional component for the index page
const Page = () => {
    // Get today's date


    const router = useRouter();
    const { pnr } = router.query;
    const auth = useAuth();

    const { type, visitors } = router.query;
    const [dataTravel, setTravelData] = useState([]);
    const [dataAcc, setAccData] = useState([]);
    const [dataCon, setConData] = useState([]);
    const [decodedData, setDecodedData] = useState([])
    // const dataAccArray = Object.values(dataAcc);


    const [verified, setVerified] = useState(false);
    const feedback = [
        {
            pnr: "12345",
            accomodationRatings: "sushmita",
            conRatings: "meeting",
            feedback: "06-03-2024",
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
    // Assuming your star ratings are represented by integers
    const ratings = [5, 3];

    const StarRating = ({ rating }) => {
        const stars = [];
        for (let i = 0; i < rating; i++) {
            stars.push(<StarIcon key={i} />);
        }
        return stars;
    };


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
    if (auth?.user?.roles === Roles["Admin"] || auth?.user?.roles === Roles["Planner"]) {
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
                                <Typography variant="h4" align="center">Feedback Status</Typography>
                            </Stack>


                        </Grid>
                        <Grid item xs={12}  >
                            <h2>Feedback Details</h2>
                            <TableContainer component={Paper} style={{
                                borderRadius: '0 0 10px 10px    ',
                                boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.3)',
                                borderBottom: `1px solid ${indigo[200]}`
                            }}>
                                <Table>
                                    <TableHead >
                                        <TableRow >
                                            <TableCell>PNR</TableCell>
                                            <TableCell>Visitor Name</TableCell>


                                            <TableCell>Purpose</TableCell>
                                            <TableCell>Accomodation Rating</TableCell>
                                            <TableCell>Conveyance Rating</TableCell>

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* {feedback.map((detail, index) => (
                    <TableRow key={index}>
                      <TableCell>{detail.pnr}</TableCell>
                      <TableCell>{detail.accomodationRatings}</TableCell>
                      <TableCell>{detail.conRatings}</TableCell>
                      <TableCell>{detail.feedback}</TableCell>
                    </TableRow>
                  ))} */}

                                        <TableRow >
                                            <TableCell>12356</TableCell>
                                            <TableCell>Soumya Shaikh</TableCell>
                                            <TableCell>To Attend Alumina</TableCell>
                                            {ratings.map((rating, index) => (
                                                <TableCell key={index}>
                                                    <StarRating rating={rating} />
                                                </TableCell>
                                            ))}
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
}else {
    return (
        <>
            <h1>Not Authorized</h1>
        </>
    )
  }
};
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
// Export the component as the default export
export default Page;