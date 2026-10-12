import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import axios from 'src/api/axios';;
import React, { useEffect, useState } from 'react';
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import Head from "next/head";
import { Container, Grid, TextField, Button, Chip, Stack } from "@mui/material";
import { blue, indigo } from "@mui/material/colors";
import DeleteIcon from '@mui/icons-material/Delete';
const status = {
    'Planned': "info.main",
    'Pending': 'warning.main',
    'Complete': 'success.main'
}
function createData(firstName, lastName, email, purpose, arrivalDateTime, departureDateTime, gender, age, officeemail, employee, departmentName, phoneNumber, state, city, address, pincode, visitstatus) {
    return {
        firstName,
        lastName,
        email,
        purpose,
        arrivalDateTime,
        departureDateTime,
        visitstatus,
        history: [
            {
                date: '2022-01-01', // You may want to use a real date
                customerId: '12345', // Sample values, replace with actual data
                amount: 1,
                gender,
                age,
                officeemail,
                employee,
                departmentName,
                phoneNumber,
                state,
                city,
                address,
                pincode,
            },
            // You can add more history entries as needed
        ],
    };
}

function AccomodationRow({ details, index, }) {
    const [acOpen, setAcOpen] = useState(false);
    return <> <TableRow key={index}
        sx={{
            backgroundColor: indigo[50], // Initial background color
        }}
    >
        <TableCell>
            <IconButton
                aria-label="expand row"
                size="small"
                onClick={() => setAcOpen(!acOpen)}
            >
                {acOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
        </TableCell>
        <TableCell align='center'>{index + 1}</TableCell>
        <TableCell align='center'>{details.pnr}</TableCell>
        <TableCell align='center'>{details.accommodationAddress}</TableCell>
        <TableCell align='center'>{new Date(details.checkin).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>
        <TableCell align='center'>{new Date(details.checkout).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>

        <TableCell align='center'>
            <Stack direction={'row'} spacing={2} >
                {/* <Button startIcon={<Edit />}
                    variant='contained'
                    onClick={() => {
                        formik.setFieldValue('accommodationName', details.accommodationName)
                        formik.setFieldValue('accommodationAddress', details.accommodationAddress)
                        formik.setFieldValue('checkin', details.checkin)
                        formik.setFieldValue('checkout', details.checkout)
                        formik.setFieldValue('contactOfHotel', details.contactOfHotel)
                        formik.setFieldValue('driverContact', details.driverContact)
                        formik.setFieldValue('bookedBy', details.bookedBy)
                        formik.setFieldValue('bookedFor', details.bookedFor)
                        formik.setFieldValue('remarks', details.remarks)
                        setId(details.ind_id)
                    }}
                >
                    Edit
                </Button> */}
                {/* <Button startIcon={<DeleteIcon />}
                    sx={{ backgroundColor: 'error.main', color: "white" }}
                    onClick={() => {
                        deleteAccomodation(details.ind_id)
                    }}>
                    Delete
                </Button> */}
            </Stack>

        </TableCell>
    </TableRow>
        <TableRow>
            <TableCell colSpan={8}>
                <Collapse in={acOpen} timeout="auto" unmountOnExit>
                    <Box sx={{ margin: 1 }}>
                        <Typography variant="h6" gutterBottom component="div">
                            Accomodation Details
                        </Typography>
                        <Table size="small" aria-label="purchases" >
                            <TableHead>
                                <TableRow>
                                    <TableCell align='center'>S.No</TableCell>
                                    <TableCell align='center'>Accomodation Name</TableCell>
                                    <TableCell align='center'>Accomodation Address</TableCell>
                                    <TableCell align='center'>Check In Time</TableCell>
                                    <TableCell align='center'>Check Out Time</TableCell>
                                    <TableCell align='center'>Action</TableCell>
                                    <TableCell>contactOfHotel</TableCell>
                                    <TableCell>Booked By</TableCell>
                                    <TableCell>Booked For</TableCell>
                                    <TableCell>Remarks</TableCell>
                                    <TableCell align="right">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                <TableRow >
                                    <TableCell align='center'>{details.contactOfHotel}</TableCell>
                                    <TableCell align='center'>{details.bookedBy}</TableCell>
                                    <TableCell align='center'>{details.bookedFor}</TableCell>
                                    <TableCell align='center'>{details.remarks}</TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </>
}
const deleteAccomodation = (ID) => {
    let newArray
    if (ID !== '') {
        console.log('updating row', ID)
        newArray = accPlan.filter((item) => {
            if (item.ind_id === ID) {
                return false
            }
            else {
                return true
            }
        })
    }
    setAccPlan(newArray)
}
const Page = () => {
    const [data, setData] = useState([]);
    const [state, setState] = useState({})
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('accomodation/accommodationindividual');
                console.log('response', response)
                if (response.data && response.data.data.length > 0) {
                    setData(response.data.data.map((visitor) => createData(
                        visitor.firstName,
                        visitor.lastName,
                        visitor.email,
                        visitor.purpose,
                        visitor.arrivalDateTime,
                        visitor.departureDateTime,
                        visitor.gender,
                        visitor.age,
                        visitor.officeemail,
                        visitor.employee,
                        visitor.depttName,
                        visitor.phoneNumber,
                        visitor.state,
                        visitor.city,
                        visitor.address,
                        visitor.pincode,
                        visitor.visitstatus
                    )));
                } else {
                    console.log('No data found for the given pincode');
                }
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        console.log('hello from my registreation details')
    }, [])

    return (
        <>
            <Head>
                <title>Visitor Details</title>
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
                        <Grid item xs={12} sx={{ overflow: 'auto' }}>
                            <Typography variant='h5'>Accomodation Plan</Typography>
                            <Table >
                                <TableHead>
                                    <TableRow>
                                        <TableCell />
                                        <TableCell align='center'>PNR</TableCell>
                                        <TableCell align='center'>Arrival Date and Time</TableCell>
                                        <TableCell align='center'>Departure Time and Date</TableCell>

                                    </TableRow>
                                </TableHead>
                                {data?.length > 0 && <TableBody sx={{ backgroundColor: indigo[50] }}>
                                    {data?.map((details, index) => {
                                        return <AccomodationRow setState={setState} index={index} key={index} details={details}
                                        />
                                    })}
                                </TableBody>}
                            </Table>
                        </Grid>
                    </Grid>

                </Container>
            </Box>

        </>

    );
};
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
