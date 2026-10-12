
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
import axios from 'src/api/axios';
import React, { useEffect, useState } from 'react';
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import Head from "next/head";
import { Container, Grid, TextField, Button, Stack, Divider, TablePagination, Chip, Tooltip, Snackbar, Alert, Dialog, DialogActions, Slide, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { blue, indigo } from "@mui/material/colors";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowBack, ArrowRight, Edit, RemoveRedEye } from '@mui/icons-material';
import { motion } from 'framer-motion';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import HotelIcon from '@mui/icons-material/Hotel';
import Modal from '@mui/material/Modal';
import DeleteIcon from '@mui/icons-material/Delete';

import CloseIcon from '@mui/icons-material/Close';
import jwt from 'jsonwebtoken';
import { API } from 'src/api';
import { useAuth } from 'src/hooks/use-auth';

function createData(firstName, lastName, email, purpose, arrivalDateTime, departureDateTime, gender, age, officeemail, employee, deptName, phoneNumber, state, district, address, pincode, pnr, isStaying, isTraveling, secondaryvisitors) {
    // console.log('the table', { firstName, lastName, email, purpose, arrivalDateTime, departureDateTime, gender, age, officeemail, employee, deptName, phoneNumber, state, district, address, pincode, pnr })

    return {
        firstName,
        lastName,
        email,
        purpose,
        arrivalDateTime,
        departureDateTime,
        history: [
            {
                date: '2022-01-01', // You may want to use a real date
                customerId: '12345', // Sample values, replace with actual data
                amount: 1,
                gender,
                age,
                officeemail,
                employee,
                deptName,
                phoneNumber,
                state,
                district,
                address,
                pincode,
            },

        ],
        pnr,
        isStaying,
        isTraveling,
        secondaryvisitors
    };
}
function Row({ row, index, setFill, setAccPlan, setTravelPlan, setPNR, setTravelRef, setAccRef, setState, setStateD, setPNRData,token }) {
    const [open, setOpen] = React.useState(false);
    const [aOpen, setAOpen] = useState(false);
    const [tOpen, setTOpen] = useState(false);
    const [travelDetails, setTravelDetails] = useState({})
    const [accDetails, setAccDetails] = useState({})
    const [value, setValue] = React.useState(0);
    // const [pnrData, setPNRData] = useState(null)
    const [qrData, setQRData] = useState('');
    // const [stateD, setStateD] = useState({})


    // const [accDetails, setAccDetails] = useState({})
    const [visitor, setVisitor] = useState({})
    const [vOpen, setVOpen] = useState()
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        border: '2px solid #280C58',
        borderRadius: '2em',
        boxShadow: 24,
        p: 4,
    };
    const getTravelbyPNR = async (val) => {
        let x
        if (true) {
            try {
                const response = await axios.get(`/orgconveyance/conveyanceorganization/${val}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                setTravelDetails(response.data.data.conveyanceDetails)
                setTravelPlan(response.data.data.conveyanceDetails)
                setTravelRef(response.data.data.finaldetails)
                x = response.data.data
                console.log('got details', response.data.data)
                console.log(tOpen, 'topen')
                setState({ severity: 'success', message: 'Fetched Successfully', open: true })
            } catch (error) {
                console.log('Error', error)
                setState({ severity: 'error', message: 'Error Fetching', open: true })
            }
        }
        console.log('val for travel', val)
        return x
    }

    const getAccomodationbyPNR = async (val) => {
        if (true) {
            try {
                const response = await axios.get(`/orgaccomodation/accommodationorganization/${val}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                setAccPlan(response.data.data.accomodationdetails)
                console.log('got details', response.data.data)
                setAccRef(response.data.data.finaldetails)
                console.log(tOpen, 'topen')
                setState({ severity: 'success', message: 'Fetched Successfully', open: true })
            } catch (error) {
                console.log('Error', error)
                setState({ severity: 'error', message: 'Error Fetching', open: true })
            }

        }
        console.log('val for travel', val)
    }

    const getVisitorDetails = async (val) => {
        if (true) {
            try {
                const response = await axios.get(`/orgvisit/visitorganization/${val}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                setVisitor(response.data.data)
                console.log('got details', response.data.data)
                setState({ severity: 'success', message: 'Fetched Successfully', open: true })
                console.log(tOpen, 'topen')
            } catch (error) {
                console.log('Error', error)
                setState({ severity: 'error', message: 'Error Fetching', open: true })
            }   

        }
        console.log('val for travel', val)
    }
    const handleOpen = () => setOpen(true);
    const handleClose = () => setVOpen(false);
    console.log('Row', row)


    const handleCancel = async (row) => {
        setStateD((prev) => { return { ...prev, openCancel: true } })
        console.log('Row data', row)
        setPNRData(row)
    }
    return (
        <React.Fragment>
            <Modal
                open={vOpen}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>

                    <IconButton
                        sx={{
                            position: 'absolute', top: 5, right: 5, p: 2,
                            backgroundColor: indigo[50],
                            '&:hover': {
                                backgroundColor: indigo[500], // Change hover color here
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Change shadow here
                            },
                        }}
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12} md={12} display={'flex'} justifyContent={'center'}>
                            <Chip label='Visitor Details' sx={{ backgroundColor: indigo[50] }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">First Name</Typography>
                                <Typography variant="body1">{visitor.firstName}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Last Name</Typography>
                                <Typography variant="body1">{visitor.lastName}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Gender</Typography>
                                <Typography variant="body1">{visitor.gender}</Typography>
                            </div>
                        </Grid>
                        {/* <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Age</Typography>
                                <Typography variant="body1">{visitor.age}</Typography>
                            </div>
                        </Grid> */}
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Contact</Typography>
                                <Typography variant="body1">{visitor.contact}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Email</Typography>
                                <Typography variant="body1">{visitor.email}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">State</Typography>
                                <Typography variant="body1">{visitor.state}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">District</Typography>
                                <Typography variant="body1">{visitor.district}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Address</Typography>
                                <Typography variant="body1">{visitor.address}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Organization</Typography>
                                <Typography variant="body1">{visitor.organization}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Government ID Type</Typography>
                                <Typography variant="body1">{visitor.govtIdType}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Government ID Number</Typography>
                                <Typography variant="body1">{visitor.govtIdNumber}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12} display={'flex'} justifyContent={'center'}>
                            <Chip label='Host Details' sx={{ backgroundColor: indigo[50] }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Employee Name</Typography>
                                <Typography variant="body1">{visitor.employee}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Office Email</Typography>
                                <Typography variant="body1">{visitor.officeemail}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Department Name</Typography>
                                <Typography variant="body1">{visitor.deptName}</Typography>
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <div style={{ padding: '10px' }}>
                                <Typography variant="subtitle1">Purpose</Typography>
                                <Typography variant="body1">{visitor.purpose}</Typography>
                            </div>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: "white" }}>
                <TableCell align='center'>{row.pnr}</TableCell>
                <TableCell component="th" scope="row">
                    {row.firstName}
                </TableCell>
                <TableCell align="center">{row.lastName}</TableCell>
                <TableCell align="center">{row.purpose}</TableCell>
                <TableCell align="center">{row.arrivalDateTime.split('T')[0] + ',' + row.arrivalDateTime.split('T')[1].split('.')[0]}</TableCell>
                <TableCell align="center">{row.departureDateTime.split('T')[0] + ',' + row.departureDateTime.split('T')[1].split('.')[0]}</TableCell>
                <TableCell align="center">{row.secondaryvisitors.length}</TableCell>
                <TableCell align="center">
                    <Stack direction={'row'} spacing={1}>
                        <Tooltip title="Plan Traveling">
                            <Button variant='contained'
                                sx={{
                                    backgroundColor: "#F46B91",
                                    '&:hover': {
                                        transform: 'scale(1.1)', // Change size on hover here
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Change shadow here
                                    },
                                }}
                                size='small'
                                disabled={!row.isTraveling}
                                onClick={() => {
                                    setFill((prev) => {
                                        return { ...prev, 'travel': true }
                                    });
                                    getTravelbyPNR(row.pnr)
                                    setPNR(row.pnr)
                                }}
                            >
                                <TimeToLeaveIcon />
                            </Button>
                        </Tooltip>
                        <Tooltip title="Plan Accomodation">
                            <Button variant='contained'
                                sx={{
                                    backgroundColor: "#64CFF3",
                                    '&:hover': {
                                        transform: 'scale(1.1)', // Change size on hover here
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Change shadow here
                                    },
                                }}
                                size='small'
                                disabled={!row.isStaying}
                                onClick={() => {
                                    setFill((prev) => { return { ...prev, 'accomodation': true } })
                                    getAccomodationbyPNR(row.pnr)
                                    setPNR(row.pnr)
                                }
                                }
                            >
                                <HotelIcon />
                            </Button>
                        </Tooltip>
                    </Stack>
                </TableCell>
                <TableCell>
                    <Tooltip title="View Visitor details">
                        <Button

                            onClick={() => {
                                if (!vOpen) {
                                    getVisitorDetails(row.pnr)
                                }
                                setVOpen(!vOpen)
                                setOpen(!open)
                            }}
                            sx={{
                                '&:hover': {
                                    transform: 'scale(1.1)', // Change size on hover here
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Change shadow here
                                },
                            }}
                        >
                            <RemoveRedEye />
                        </Button>
                    </Tooltip>
                </TableCell>
                <TableCell>
                    <Stack direction={'column'} spacing={2}>
                        {/* <Button variant='contained' size='small' sx={{ backgroundColor: 'success.main' }}
                                onClick={() => handleApprove(row)}
                                disabled={row.visitstatus == "Cancelled" || row.visitstatus == "Ongoing"}
                            >Approve</Button> */}
                        <Button variant='contained' size='small' sx={{ backgroundColor: 'error.main' }}
                            disabled={row.visitstatus == "Cancelled"}
                            onClick={() => handleCancel(row)}
                        >Cancel</Button>
                    </Stack>

                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={12}>
                    {row.isTraveling == true && tOpen == true && <>
                        <TableRow>
                            <TableCell colSpan={4}>
                            </TableCell>
                            <TableCell colSpan={8}>
                                <Typography variant="h6" gutterBottom component="div">
                                    Travel Schedule
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                                {travelDetails?.length > 0 && <>
                                    <Box sx={{ margin: 1 }}>
                                        <Table size="small" aria-label="purchases">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell />
                                                    <TableCell>Pick Up Time and Date</TableCell>
                                                    <TableCell>Pick Up Location</TableCell>
                                                    <TableCell align="right">Drop Off Time and Date</TableCell>
                                                    <TableCell align="right">Drop Off Location</TableCell>
                                                    {/* <TableCell align="right">Action</TableCell> */}
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {travelDetails.map((historyRow, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>{historyRow.pickupDateTime}</TableCell>
                                                        <TableCell>{historyRow.pickupLocation}</TableCell>
                                                        <TableCell>{historyRow.dropOffDateTime}</TableCell>
                                                        <TableCell align="right">{historyRow.dropOffLocation}</TableCell>

                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </>}
                                {travelDetails?.length == 0 && <Typography variant='h6' align='center' sx={{ backgroundColor: 'lightgray' }}>Start Filling details</Typography>}
                            </TableCell>
                        </TableRow>
                    </>}
                    {row.isStaying && aOpen == true && <>
                        <TableRow>
                            <TableCell colSpan={8}>
                                <Typography variant="h6" gutterBottom component="div">
                                    Accomodation Schedule
                                </Typography>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
                                <Collapse in={aOpen} timeout="auto" unmountOnExit>
                                    <Box sx={{ margin: 1 }}>
                                        <Table size="small" aria-label="purchases">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Arrival Date and Time </TableCell>
                                                    <TableCell>Departure Date and Time</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                <TableRow >
                                                    <TableCell>{new Date(row.arrivalDateTime).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>

                                                    <TableCell>{new Date(row.departureDateTime).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>

                                                    {/* <TableCell>{row.departureDateTime}</TableCell> */}
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </Collapse>
                            </TableCell>
                        </TableRow>
                    </>}
                </TableCell>
            </TableRow>
        </React.Fragment >
    );
}
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function OrganizationRegistrations() {
    const [data, setData] = useState([]);
    const [fill, setFill] = useState({ 'travel': false, 'accomodation': false });
    const [accRef, setAccRef] = useState([]);
    const [accPlan, setAccPlan] = useState([]);
    const [travelPlan, setTravelPlan] = useState([]);
    const [PNR, setPNR] = useState('')
    const [id, setId] = useState('')
    const [travelRef, setTravelRef] = useState('')
    const [open, setOpen] = React.useState(false);
    const [state, setState] = useState({})
    const [value, setValue] = React.useState(0);
    const [pnrData, setPNRData] = useState(null)
    const [qrData, setQRData] = useState('');
    const [stateD, setStateD] = useState({})
    const [dummy, setDummy] = useState(false)
const auth = useAuth()
    const handleClick = () => {
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setState((prev) => { return { ...prev, open: false } })
        setStateD((prev) => { return { ...prev, openCancel: false, openApprove: false } })

        setOpen(false);
    };

    function TravelRow({ row, index, formiktwo }) {
        const [tropen, setTrOpen] = React.useState(false);
        const deleteTravel = (ID) => {
            let newArray
            if (ID !== '') {
                console.log('updating row', ID)
                newArray = travelPlan.filter((item) => {
                    if (item.ind_id === ID) {
                        return false
                    }
                    else {
                        return true
                    }
                })
            }
            setTravelPlan(newArray)
        }



        return <TableBody sx={{ backgroundColor: 'white' }}>
            <TableRow
                sx={{
                    backgroundColor: indigo[50], // Initial background color
                    animation: id == row.ind_id ? 'blink-animation 0.5s infinite alternate' : 'none',
                    '@keyframes blink-animation': {
                        '0%': {
                            backgroundColor: indigo[50], // Initial background color
                        },
                        '100%': {
                            backgroundColor: 'success.light', // Final background color
                        },
                    },
                }}
                key={index}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setTrOpen(!tropen)}
                    >
                        {tropen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell align='center'>{new Date(row.pickupDateTime).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>
                <TableCell align='center'>{row?.pickupLocation}</TableCell>
                <TableCell align='center'>{new Date(row.dropOffDateTime).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>
                <TableCell align='center'>{row?.dropOffLocation}</TableCell>
                <TableCell align='center' >
                    <Stack spacing={2} direction={'row'}>
                        <Button startIcon={<Edit />}
                            variant='contained'
                            onClick={() => {
                                formiktwo.setFieldValue('pickupDateTime', row.pickupDateTime.split('.')[0])
                                formiktwo.setFieldValue('pickupLocation', row.pickupLocation)
                                formiktwo.setFieldValue('dropOffDateTime', row?.dropOffDateTime?.split('.')[0])
                                formiktwo.setFieldValue('dropOffLocation', row?.dropOffLocation)
                                formiktwo.setFieldValue('vehicleType', row.vehicleType)
                                formiktwo.setFieldValue('vehicleNo', row.vehicleNo)
                                formiktwo.setFieldValue('driverName', row.driverName)
                                formiktwo.setFieldValue('driverContact', row.driverContact)
                                formiktwo.setFieldValue('bookedBy', row.bookedBy)
                                formiktwo.setFieldValue('bookedFor', row.bookedFor)
                                formiktwo.setFieldValue('remarks', row.remarks)
                                setId(row.ind_id)
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            startIcon={<DeleteIcon />}
                            variant='contained'
                            onClick={() => {
                                deleteTravel(row.ind_id)
                            }}
                            sx={{ backgroundColor: 'error.main', borderColor: 'error.main' }}
                        >
                            Delete
                        </Button>
                    </Stack>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell colSpan={8}>
                    <Collapse in={tropen} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Travelling Details
                            </Typography>
                            <Table size="small" aria-label="purchases" >
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Booked For</TableCell>
                                        <TableCell>Driver Contact</TableCell>
                                        <TableCell>Vehicle No.</TableCell>
                                        <TableCell>Vehicle Type</TableCell>
                                        <TableCell>Booked By</TableCell>
                                        <TableCell>Remarks</TableCell>
                                        <TableCell align="right">Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>

                                    <TableRow >
                                        <TableCell align='center'>{row?.bookedFor}</TableCell>
                                        <TableCell>{row?.driverContact}</TableCell>
                                        <TableCell>{row?.vehicleNo}</TableCell>
                                        <TableCell >{row?.vehicleType}</TableCell>
                                        <TableCell >{row?.bookedBy}</TableCell>
                                        <TableCell>{row?.remarks}</TableCell>
                                        <TableCell>{row?.status}</TableCell>
                                    </TableRow>

                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </TableBody>
    }
    function AccomodationRow({ details, index, formik }) {
        const [acOpen, setAcOpen] = useState(false);
        return <> <TableRow key={index}
            sx={{
                backgroundColor: indigo[50], // Initial background color
                animation: id == details.ind_id ? 'blink-animation 0.5s infinite alternate' : 'none',
                '@keyframes blink-animation': {
                    '0%': {
                        backgroundColor: indigo[50], // Initial background color
                    },
                    '100%': {
                        backgroundColor: 'success.light', // Final background color
                    },
                },
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
            <TableCell align='center'>{details.accommodationName}</TableCell>
            <TableCell align='center'>{details.accommodationAddress}</TableCell>
            <TableCell align='center'>{new Date(details.checkin).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>
            <TableCell align='center'>{new Date(details.checkout).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>

            <TableCell align='center'>
                <Stack direction={'row'} spacing={2} >
                    <Button startIcon={<Edit />}
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
                    </Button>
                    <Button startIcon={<DeleteIcon />}
                        sx={{ backgroundColor: 'error.main', color: "white" }}
                        onClick={() => {
                            deleteAccomodation(details.ind_id)
                        }}>
                        Delete
                    </Button>
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
    const handleCancelConfirm = async () => {
        let PNRType = ''

        pnrData.type = 'Organization'
        PNRType = "Organization"

        const pdfData = {
            visitorinfo: {
                type: PNRType,
                visitors: 1,
                visitend: pnrData.departureDateTime
            }
        }
        const token = await jwt.sign(pdfData, 'approvecancel', { expiresIn: '1d' });
        sendDataToBackend1({ ...pnrData, approveByHost: false, token })
            .then(response => {
                setDummy(!dummy)

            })
            .catch(error => {
                console.error("Error sending data to backend:", error);
            });
    }
    const validationSchema = Yup.object({
        accommodationName: Yup.string().required('Accommodation Name is required'),
        accommodationAddress: Yup.string().required('Accommodation Address is required'),
        checkin: Yup.date().required('Checkin date is required'),
        checkout: Yup.date().required('Checkout date is required'),
        contactOfHotel: Yup.string().required('Contact of Hotel/Stay is required'),
        bookedBy: Yup.string().required('Booked By is required'),
        bookedFor: Yup.string().required('Booked For is required'),
        remarks: Yup.string(),
    });
    const validationSchemaTwo = Yup.object({
        pickupDateTime: Yup.date().required('Pickup Date is required'),
        // pickupTime: Yup.string().required('Pickup Time is required'),
        pickupLocation: Yup.string().required('Pickup Location is required'),
        dropOffDateTime: Yup.date().required('Drop Date is required'),
        // dropTime: Yup.string().required('Drop Time is required'),
        dropOffLocation: Yup.string().required('Drop Location is required'),
        driverName: Yup.string().required('Driver Name is required'),
        vehicleNo: Yup.string().required('Vehicle No. is required'),
        vehicleType: Yup.string().required('Vehicle Type is required'),
        driverContact: Yup.string().required('Driver Contact is required'),
        bookedBy: Yup.string().required('Booked By is required'),
        bookedFor: Yup.string().required('Booked For is required'),
        remarks: Yup.string(),
        // Add validation for other fields as needed
    });
    const formik = useFormik({
        initialValues: {
            PNR: '',
            accommodationName: '',
            accommodationAddress: '',
            checkin: '',
            checkout: '',
            contactOfHotel: '',
            bookedBy: '',
            bookedFor: '',
            remarks: '',
        },
        validationSchema: validationSchema,
        onSubmit: (values, helpers) => {
            console.log(values);
            values.PNR = PNR;
            let newArray;
            if (id !== '') {
                console.log('updating row', id)
                newArray = accPlan.map((item) => {
                    if (item.ind_id === id) {
                        return { ...item, ...values }
                    }
                    else {
                        return item
                    }
                })
            } else {
                newArray = [...accPlan, values]
            }
            setAccPlan(newArray)
            console.log('Accomodation plan', accPlan)
            helpers.resetForm()
            setId('')
        },
    });
    const formiktwo = useFormik({
        initialValues: {
            PNR: '',
            pickupDateTime: '',
            // pickupTime: '',
            pickupLocation: '',
            dropOffDateTime: '',
            // dropTime: '',
            dropOffLocation: '',
            driverName: '',
            vehicleNo: '',
            vehicleType: '',
            driverContact: '',
            bookedBy: '',
            bookedFor: '',
            remarks: '',

        },
        validationSchema: validationSchemaTwo,
        onSubmit: (values) => {
            let newArray;
            if (id !== '') {
                console.log('updating row', id)
                newArray = travelPlan.map((item) => {
                    if (item.ind_id === id) {
                        return { ...item, ...values }
                    }
                    else {
                        return item
                    }
                })
            } else {
                newArray = [...travelPlan, values]
            }
            // setTravelPlan((prev) => ([...travelPlan, values]))
            setTravelPlan(newArray)
            console.log(values);
            console.log('travel plan', travelPlan)
            setId('')
            formiktwo.resetForm()
        },
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/orgvisit/visitorganization',
                    {
                        headers: {
                            Authorization: `Bearer ${auth?.user?.accessToken}`
                        }
                    }
                );
                console.log('response', response)
                if (response.data.data && response.data.data.length > 0) {
                    if (response.data.data.length == 0) {
                        setState({ severity: 'warning', message: 'No data', open: true })
                    } else if (response.data.data.length > 0) {
                        setState({ severity: 'success', message: 'Fetched succesfully', open: true })
                    }
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
                        visitor.deptName,
                        visitor.phoneNumber,
                        visitor.state,
                        visitor.district,
                        visitor.address,
                        visitor.pincode,
                        visitor.pnr,
                        visitor.isStaying,
                        visitor.isTraveling,
                        visitor.secondaryvisitors
                    )));
                } else {
                    console.log('No data found for the given pincode');
                    setState({ severity: 'warning', message: 'No data', open: true })
                }
            } catch (error) {
                console.error('Error fetching data:', error.message);
                setState({ severity: 'error', message: error.message, open: true })
            }
        };

        fetchData();
    }, [dummy]);
    const submitAccomodation = async () => {
        try {
            const response = await axios.put(`/orgaccomodation/accommodationorganization/${PNR}`, accPlan,    {
                headers: {
                    Authorization: `Bearer ${auth?.user?.accessToken}`
                }
            });
            console.log('response', response)
            setState({ severity: 'success', message: 'Saved Successfully', open: true })
        } catch (error) {
            console.log('error while submitting accomodation', error)
            setState({ severity: 'error', message: 'Error Saving details', open: true })
        }
    }
    const submitTravelPlan = async () => {
        try {
            const response = await axios.put(`/orgconveyance/conveyanceorganization/${PNR}`, travelPlan,    {
                headers: {
                    Authorization: `Bearer ${auth?.user?.accessToken}`
                }
            });
            console.log('response', response)
            setState({ severity: 'success', message: 'Saved Successfully', open: true })

        } catch (error) {
            console.log('error while submitting accomodation', error)
            setState({ severity: 'error', message: 'Error Saving details', open: true })

        }
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
    const vertical = 'top'
    const horizontal = 'center'
    const sendDataToBackend1 = async (modifiedData) => { // Receive headers as a separate argument
        try {
            // Replace the URL with your actual backend endpoint
            if (false) {
                const token = modifiedData.token;
                console.log("token in approve ::", token)

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
                };
                const backendEndpoint = `https://10.244.3.101:8000/api/v1/handleVisits/approvalOrgVisit/${pnrData.pnr}`;
                console.log("sendDataToBackend::", modifiedData);

                // Make a PUT request to the backend with headers
                const response = await axios.put(backendEndpoint, modifiedData, { headers });
                console.log("response after update::", response.data);
                handleClose()
                setState({ severity: 'success', message: 'Submitted Successfully', open: true })

            } else {
                const token = modifiedData.token;
                console.log("token in approve ::", token)

                const headers = {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
                };
                let backendEndpoint

                backendEndpoint = `${API}/handleVisits/CancelOrgVisit/${pnrData.pnr}`;


                console.log("sendDataToBackend::", modifiedData);

                // Make a PUT request to the backend with headers
                const response = await axios.put(backendEndpoint, modifiedData, { headers });
                console.log("response after update::", response.data);
                handleClose()
                setState({ severity: 'success', message: 'Submitted Successfully', open: true })
                setDummy(!dummy)

            }

        } catch (error) {
            console.error('Error sending data to backend:', error);
            setState({ severity: 'error', message: error.response.errors[0], open: true })
        }
    };

    return (
        <>
            <Head>
                <title>Visitor Details</title>
            </Head>
            <Snackbar open={state.open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical, horizontal }}>
                <Alert
                    onClose={handleClose}
                    severity={state.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {state.message}
                </Alert>
            </Snackbar>

            <React.Fragment>
                <Dialog
                    open={stateD.openCancel}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={handleClose}
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle>{"Cancel the Meeting?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            By Cancelling, You&apos;re cancelling the visit .
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCancelConfirm}>Proceed</Button>
                        <Button onClick={handleClose}>Close</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
            <Box
                component="main"
                sx={{
                    py: 8,
                    backgroundColor: '#280C58',
                    height: '100%'
                }}
            >
                <Container>
                    <Grid container>
                        <Grid
                            item
                            xs={12}
                            component={Paper}
                            sx={{ p: 1, background: blue[50] }}
                        >
                            <Typography variant="h4" align="center" gutterBottom>
                                Organization Visit Details
                            </Typography>
                            {!fill.travel && !fill.accomodation &&

                                <motion.div
                                    initial={{ opacity: 0, x: '30%' }}
                                    animate={{ opacity: 1, x: '0%' }}
                                    transition={{ duration: 0.2 }}
                                    style={{ position: 'relative' }}
                                >
                                    <TableContainer component={Paper}>
                                        <Table aria-label="collapsible table">
                                            <TableHead>
                                                <TableRow>
                                                    {/* <TableCell /> */}
                                                    <TableCell align="center">PNR</TableCell>
                                                    <TableCell>First Name</TableCell>
                                                    <TableCell align="center">Last Name</TableCell>
                                                    {/* <TableCell align="right">Email</TableCell> */}
                                                    <TableCell align="center">Purpose</TableCell>
                                                    <TableCell align="center">Visiting Date</TableCell>
                                                    <TableCell align="center">Exiting Date</TableCell>
                                                    <TableCell align='center'>No. of Visitors</TableCell>
                                                    <TableCell align="center">Plan</TableCell>
                                                    {/* <TableCell align="center">View</TableCell> */}
                                                    <TableCell align="center">Details</TableCell>
                                                    <TableCell align='center'>Action</TableCell>

                                                </TableRow>
                                            </TableHead>
                                            <TableBody sx={{ backgroundColor: indigo[50] }} >
                                                {data.map((row) => (
                                                    <Row key={row.name} row={row} setFill={setFill} setTravelPlan={setTravelPlan} setAccPlan={setAccPlan} setPNR={setPNR} setTravelRef={setTravelRef} setAccRef={setAccRef} setState={setState} setStateD={setStateD} setPNRData={setPNRData} token={auth?.user?.accessToken} />
                                                ))}
                                                {data.length == 0 &&
                                                    <TableRow>
                                                        <TableCell colSpan={12}>  <Typography align='center' variant='h4' sx={{
                                                            p: 3
                                                        }}>No Data Available</Typography></TableCell>
                                                    </TableRow>}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </motion.div>
                            }

                            {(fill.accomodation || fill.travel) && <>
                                <Button onClick={() => {
                                    setFill({ 'travel': false, 'accomodation': false });
                                    setAccPlan([]);
                                    setTravelPlan([])
                                    setAccRef([]);
                                    formik.resetForm()
                                    formiktwo.resetForm()
                                    setId('')
                                }} startIcon={<ArrowBack />} variant='contained' sx={{ m: 2 }}>Back</Button></>}
                            {fill.accomodation &&
                                <motion.div
                                    initial={{ opacity: 0, x: '-30%' }}
                                    animate={{ opacity: 1, x: '0%' }}
                                    transition={{ duration: 0.10 }}
                                    style={{ position: 'relative' }}
                                >
                                    <Grid container xs={12} spacing={2} component={Paper} sx={{ ml: 0, my: 1 }}>
                                        <Grid item xs={12}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align='center' style={{ border: '1px solid #000' }}>Arrival Date</TableCell>
                                                        <TableCell align='center' style={{ border: '1px solid #000' }}>Departure Date</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell align='center' style={{ border: '1px solid #000' }}>{new Date(accRef.arrivalDateTime).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>
                                                        <TableCell align='center' style={{ border: '1px solid #000' }}>{new Date(accRef.departureDateTime).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </Grid>
                                        <Grid item xs={12} sx={{ overflow: 'auto' }}>
                                            <Typography variant='h5'>Accomodation Plan</Typography>
                                            <Table >
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell />
                                                        <TableCell align='center'>S.No</TableCell>
                                                        <TableCell align='center'>Accomodation Name</TableCell>
                                                        <TableCell align='center'>Accomodation Address</TableCell>
                                                        <TableCell align='center'>Check In Time</TableCell>
                                                        <TableCell align='center'>Check Out Time</TableCell>
                                                        <TableCell align='center'>Action</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                {accPlan?.length > 0 && <TableBody sx={{ backgroundColor: indigo[50] }}>
                                                    {accPlan?.map((details, index) => {
                                                        return <AccomodationRow setState={setState} index={index} key={index} details={details} formik={formik} />
                                                    })}
                                                </TableBody>}
                                                {
                                                    accPlan?.length == 0 &&
                                                    <TableBody sx={{ backgroundColor: 'lightgray' }}>
                                                        <TableCell colSpan={9} align='center'>
                                                            <Typography>Start Filling Data</Typography>

                                                        </TableCell>
                                                    </TableBody>
                                                }
                                            </Table>
                                        </Grid>
                                        <Divider />
                                        <Grid item xs={12} sx={{ backgroundColor: 'white', p: 2, ml: 2 }}>
                                            <form onSubmit={formik.handleSubmit}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            label="PNR"
                                                            name="PNR"
                                                            fullWidth
                                                            variant="outlined"
                                                            value={PNR}
                                                            disabled
                                                            // {...formik.getFieldProps('PNR')}
                                                            error={formik.touched.PNR && Boolean(formik.errors.PNR)}
                                                            helperText={formik.touched.PNR && formik.errors.PNR}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label="Accommodation Name"
                                                            name="accommodationName"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('accommodationName')}
                                                            error={formik.touched.accommodationName && Boolean(formik.errors.accommodationName)}
                                                            helperText={formik.touched.accommodationName && formik.errors.accommodationName}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label="Accommodation Address"
                                                            name="accommodationAddress"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('accommodationAddress')}
                                                            error={formik.touched.accommodationAddress && Boolean(formik.errors.accommodationAddress)}
                                                            helperText={formik.touched.accommodationAddress && formik.errors.accommodationAddress}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant='body2'>Check In Time</Typography>
                                                        <TextField
                                                            // label="Checkin"
                                                            name="checkin"
                                                            type="datetime-local"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('checkin')}
                                                            error={formik.touched.checkin && Boolean(formik.errors.checkin)}
                                                            helperText={formik.touched.checkin && formik.errors.checkin}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <Typography variant='body2'>Check Out Time</Typography>
                                                        <TextField

                                                            name="checkout"
                                                            type="datetime-local"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('checkout')}
                                                            error={formik.touched.checkout && Boolean(formik.errors.checkout)}
                                                            helperText={formik.touched.checkout && formik.errors.checkout}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label="Contact of Hotel/Stay"
                                                            name="contactOfHotel"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('contactOfHotel')}
                                                            error={formik.touched.contactOfHotel && Boolean(formik.errors.contactOfHotel)}
                                                            helperText={formik.touched.contactOfHotel && formik.errors.contactOfHotel}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label="Booked By"
                                                            name="bookedBy"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('bookedBy')}
                                                            error={formik.touched.bookedBy && Boolean(formik.errors.bookedBy)}
                                                            helperText={formik.touched.bookedBy && formik.errors.bookedBy}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label="Booked For"
                                                            name="bookedFor"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('bookedFor')}
                                                            error={formik.touched.bookedFor && Boolean(formik.errors.bookedFor)}
                                                            helperText={formik.touched.bookedFor && formik.errors.bookedFor}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            label="Remarks"
                                                            name="remarks"
                                                            fullWidth
                                                            variant="outlined"
                                                            multiline
                                                            rows={4}
                                                            {...formik.getFieldProps('remarks')}
                                                            error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                                                            helperText={formik.touched.remarks && formik.errors.remarks}
                                                        />
                                                    </Grid>
                                                </Grid>

                                                <Button type='submit' variant="contained" color="primary" sx={{ m: 2 }}>
                                                    {id == '' ? 'Add' : 'Update'}
                                                </Button>
                                            </form>
                                            <Button sx={{ m: 2 }} variant='contained'
                                                onClick={() => submitAccomodation()}
                                            >Submit Accomodation details</Button>
                                        </Grid>
                                    </Grid>


                                </motion.div>}
                            {fill.travel &&
                                <motion.div
                                    initial={{ opacity: 0, x: '-30%' }}
                                    animate={{ opacity: 1, x: '0%' }}
                                    transition={{ duration: 0.10 }}
                                    style={{ position: 'relative' }}
                                >
                                    <Grid container xs={12} spacing={2} component={Paper} sx={{ ml: 0, my: 1 }}>
                                        <Grid item xs={12}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell align='center' colSpan={2} style={{ border: '1px solid #000' }}>Initial Pick Up</TableCell>
                                                        <TableCell align='center' colSpan={2} style={{ border: '1px solid #000' }}>Final Drop Off</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell align='center' style={{ border: '1px solid #000' }}>{travelRef
                                                            ?.pickupDateTime?.split('T')[0] + ',' + travelRef
                                                                ?.pickupDateTime?.split('T')[1]?.split('.')[0]}</TableCell>
                                                        <TableCell align='center' style={{ border: '1px solid #000' }}>{travelRef
                                                            ?.pickupLocation}</TableCell>
                                                        <TableCell align='center' style={{ border: '1px solid #000' }}>{travelRef
                                                            ?.dropOffDateTime?.split('T')[0] + ',' + travelRef
                                                                ?.dropOffDateTime?.split('T')[1]?.split('.')[0]}</TableCell>
                                                        <TableCell align='center' style={{ border: '1px solid #000' }}>{travelRef
                                                            ?.dropOffLocation}</TableCell>
                                                        {/* <TableCell>{JSON.stringify(travelRef)}</TableCell> */}
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </Grid>
                                        <Grid item xs={12} sx={{ overflow: 'auto' }}>
                                            <Typography variant='h5'>Travelling Plan</Typography>
                                            <Table sx={{ my: 1 }}>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell />
                                                        <TableCell align='center'>S.No</TableCell>
                                                        <TableCell align='center'>
                                                            Pickup Date and Time
                                                        </TableCell>
                                                        <TableCell align='center'>
                                                            Pickup Location
                                                        </TableCell>
                                                        <TableCell align='center'>Drop Date and Time</TableCell>
                                                        <TableCell align='center'>Drop Location</TableCell>
                                                        <TableCell align='center'>Action</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                {travelPlan.length > 0 && travelPlan.map((row, index) =>
                                                    <TravelRow row={row} key={index} index={index}
                                                        formiktwo={formiktwo}
                                                        setState={setState}
                                                    />)}
                                                {
                                                    travelPlan.length == 0 &&
                                                    <TableBody sx={{ backgroundColor: 'lightgray' }}>
                                                        <TableCell colSpan={9} align='center'>
                                                            <Typography>Start Filling Data</Typography>

                                                        </TableCell>
                                                    </TableBody>
                                                }

                                            </Table>
                                        </Grid>
                                        <Divider />
                                        <Grid item xs={12} sx={{ backgroundColor: 'white', p: 2, ml: 2 }}>
                                            <form onSubmit={formiktwo.handleSubmit}>
                                                <Grid container spacing={3}>
                                                    {/* First Column */}
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            id="PNR"
                                                            name="PNR"
                                                            label="PNR"
                                                            value={PNR}
                                                            disabled
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.PNR && Boolean(formiktwo.errors.PNR)}
                                                            helperText={formiktwo.touched.PNR && formiktwo.errors.PNR}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="pickupDateTime"
                                                            name="pickupDateTime"
                                                            label="Pickup Date"
                                                            type="datetime-local"
                                                            value={formiktwo.values.pickupDateTime}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.pickupDateTime && Boolean(formiktwo.errors.pickupDateTime)}
                                                            helperText={formiktwo.touched.pickupDateTime && formiktwo.errors.pickupDateTime}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="pickupLocation"
                                                            name="pickupLocation"
                                                            label="Pickup Location"
                                                            value={formiktwo.values.pickupLocation}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.pickupLocation && Boolean(formiktwo.errors.pickupLocation)}
                                                            helperText={formiktwo.touched.pickupLocation && formiktwo.errors.pickupLocation}
                                                        />

                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="dropOffDateTime"
                                                            name="dropOffDateTime"
                                                            label="Drop Date"
                                                            type="datetime-local"
                                                            value={formiktwo.values.dropOffDateTime}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.dropOffDateTime && Boolean(formiktwo.errors.dropOffDateTime)}
                                                            helperText={formiktwo.touched.dropOffDateTime && formiktwo.errors.dropOffDateTime}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="dropOffLocation"
                                                            name="dropOffLocation"
                                                            label="Drop Location"
                                                            value={formiktwo.values.dropOffLocation}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.dropOffLocation && Boolean(formiktwo.errors.dropOffLocation)}
                                                            helperText={formiktwo.touched.dropOffLocation && formiktwo.errors.dropOffLocation}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="driverName"
                                                            name="driverName"
                                                            label="Driver Name"
                                                            value={formiktwo.values.driverName}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.driverName && Boolean(formiktwo.errors.driverName)}
                                                            helperText={formiktwo.touched.driverName && formiktwo.errors.driverName}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="vehicleNo"
                                                            name="vehicleNo"
                                                            label="Vehicle No."
                                                            value={formiktwo.values.vehicleNo}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.vehicleNo && Boolean(formiktwo.errors.vehicleNo)}
                                                            helperText={formiktwo.touched.vehicleNo && formiktwo.errors.vehicleNo}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="vehicleType"
                                                            name="vehicleType"
                                                            label="Vehicle Type"
                                                            value={formiktwo.values.vehicleType}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.vehicleType && Boolean(formiktwo.errors.vehicleType)}
                                                            helperText={formiktwo.touched.vehicleType && formiktwo.errors.vehicleType}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="driverContact"
                                                            name="driverContact"
                                                            label="Driver Contact"
                                                            value={formiktwo.values.driverContact}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.driverContact && Boolean(formiktwo.errors.driverContact)}
                                                            helperText={formiktwo.touched.driverContact && formiktwo.errors.driverContact}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="bookedBy"
                                                            name="bookedBy"
                                                            label="Booked By"
                                                            value={formiktwo.values.bookedBy}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.bookedBy && Boolean(formiktwo.errors.bookedBy)}
                                                            helperText={formiktwo.touched.bookedBy && formiktwo.errors.bookedBy}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="bookedFor"
                                                            name="bookedFor"
                                                            label="Booked For"
                                                            value={formiktwo.values.bookedFor}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.bookedFor && Boolean(formiktwo.errors.bookedFor)}
                                                            helperText={formiktwo.touched.bookedFor && formiktwo.errors.bookedFor}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={6}>
                                                        <TextField
                                                            fullWidth
                                                            id="remarks"
                                                            name="remarks"
                                                            label="Remarks"
                                                            multiline
                                                            rows={3}
                                                            value={formiktwo.values.remarks}
                                                            onChange={formiktwo.handleChange}
                                                            error={formiktwo.touched.remarks && Boolean(formiktwo.errors.remarks)}
                                                            helperText={formiktwo.touched.remarks && formiktwo.errors.remarks}
                                                        />
                                                        {/* Add other fields for the second column */}
                                                    </Grid>
                                                </Grid>

                                                <Button type="submit" variant="contained" color="primary" sx={{ my: 1 }}>
                                                    {id == '' ? 'Add' : 'Update'}
                                                </Button>
                                            </form>

                                            <Button sx={{ my: 2 }} variant='contained' onClick={submitTravelPlan} >Submit Travel details</Button>
                                        </Grid>
                                    </Grid>

                                </motion.div>}

                        </Grid>
                    </Grid>

                </Container>
            </Box>

        </>

    );
}

export default OrganizationRegistrations