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
import Head from "next/head";
import ConfirmDialog from 'src/components/ConfirmDialog';
import { 
    Container, 
    Grid, 
    TextField, 
    Button, 
    Stack, 
    Divider, 
    Chip, 
    Tooltip, 
    Snackbar, 
    Alert, 
    Slide, 
    Card,
    CardContent,
    CardActions,
    useTheme,
    useMediaQuery,
    TablePagination
} from "@mui/material";
import { blue, indigo } from "@mui/material/colors";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowBack,
    Edit,
    Schedule,
    LocationOn,
    Phone,Hotel, RemoveRedEye } from '@mui/icons-material';
import { motion } from 'framer-motion';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import HotelIcon from '@mui/icons-material/Hotel';
import Modal from '@mui/material/Modal';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import jwt from 'jsonwebtoken';
import { API } from 'src/api';
import { useAuth } from 'src/hooks/use-auth';



function createData(firstName, lastName, email, purpose, arrivalDateTime, departureDateTime, gender, age, officeemail, employee, deptName, phoneNumber, state, district, address, pincode, pnr, isStaying, isTraveling) {
    return {
        firstName,
        lastName,
        email,
        purpose,
        arrivalDateTime,
        departureDateTime,
        history: [
            {
                date: '2022-01-01',
                customerId: '12345',
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
        isTraveling
    };
}

// Mobile Card Component for responsive design
function MobileCard({ row, index, setFill, setAccPlan, setTravelPlan, setPNR, setTravelRef, setAccRef, setState, setStateD, setPNRData, token }) {
    const [visitor, setVisitor] = useState({});
    const [vOpen, setVOpen] = useState(false);
    const [expandedDetails, setExpandedDetails] = useState(false);
    const theme = useTheme();

    const getVisitorDetails = async (val) => {
        try {
            const response = await axios.get(`/visit/visitindividual/${val}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setVisitor(response.data.data);
            setState({ severity: 'success', message: 'Fetched Successfully', open: true });
        } catch (error) {
            console.log('Error', error);
            setState({ severity: 'error', message: error.response.data.errors[0], open: true });
        }
    };

    const getTravelbyPNR = async (val) => {
        try {
            const response = await axios.get(`/conveyance/conveyanceindividual/${val}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTravelPlan(response.data.data.conveyanceDetails);
            setTravelRef(response.data.data.finaldetails);
            setState({ severity: 'success', message: 'Fetched Successfully', open: true });
            return response.data.data;
        } catch (error) {
            console.log('Error', error);
            setState({ severity: 'error', message: error.response.data.errors[0], open: true });
        }
    };

    const getAccomodationbyPNR = async (val) => {
        try {
            const response = await axios.get(`/accomodation/accommodationindividual/${val}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAccPlan(response.data.data.accomodationdetails);
            setAccRef(response.data.data.finaldetails);
            setState({ severity: 'success', message: 'Fetched Successfully', open: true });
        } catch (error) {
            console.log('Error', error);
            setState({ severity: 'error', message: error.response.data.errors[0], open: true });
        }
    };

    const handleCancel = (row) => {
        setStateD((prev) => ({ ...prev, openCancel: true }));
        setPNRData(row);
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        bgcolor: 'background.paper',
        border: '2px solid #280C58',
        borderRadius: '2em',
        boxShadow: 24,
        p: { xs: 2, sm: 4 },
    };

    return (
        <>
            <Modal
                open={vOpen}
                onClose={() => setVOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <IconButton
                        sx={{
                            position: 'absolute', 
                            top: { xs: 8, sm: 16 }, 
                            right: { xs: 8, sm: 16 }, 
                            p: { xs: 1, sm: 2 },
                            backgroundColor: indigo[50],
                            '&:hover': {
                                backgroundColor: indigo[500],
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                        onClick={() => setVOpen(false)}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid item xs={12} display={'flex'} justifyContent={'center'}>
                            <Chip label='Visitor Details' sx={{ backgroundColor: indigo[50] }} />
                        </Grid>
                        
                        {/* Visitor Details Grid - Responsive */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">First Name</Typography>
                                <Typography variant="body2">{visitor.firstName}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Last Name</Typography>
                                <Typography variant="body2">{visitor.lastName}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Gender</Typography>
                                <Typography variant="body2">{visitor.gender}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Contact</Typography>
                                <Typography variant="body2">{visitor.contact}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Email</Typography>
                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{visitor.email}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">State</Typography>
                                <Typography variant="body2">{visitor.state}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">District</Typography>
                                <Typography variant="body2">{visitor.district}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Address</Typography>
                                <Typography variant="body2">{visitor.address}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Organization</Typography>
                                <Typography variant="body2">{visitor.organization}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Government ID Type</Typography>
                                <Typography variant="body2">{visitor.govtIdType}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Government ID Number</Typography>
                                <Typography variant="body2">{visitor.govtIdNumber}</Typography>
                            </Box>
                        </Grid>
                        
                        {/* Host Details */}
                        <Grid item xs={12} display={'flex'} justifyContent={'center'}>
                            <Chip label='Host Details' sx={{ backgroundColor: indigo[50] }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Employee Name</Typography>
                                <Typography variant="body2">{visitor.employee}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Office Email</Typography>
                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{visitor.officeemail}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Department Name</Typography>
                                <Typography variant="body2">{visitor.deptName}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold">Purpose</Typography>
                                <Typography variant="body2">{visitor.purpose}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>

            <Card sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">PNR</Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                                {row.pnr}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                            <Typography variant="body1">{row.firstName} {row.lastName}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle2" color="textSecondary">Purpose</Typography>
                            <Typography variant="body1">{row.purpose}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">Arrival</Typography>
                            <Typography variant="body2">
                                {row.arrivalDateTime.split('T')[0]} at {row.arrivalDateTime.split('T')[1].split('.')[0]}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle2" color="textSecondary">Departure</Typography>
                            <Typography variant="body2">
                                {row.departureDateTime.split('T')[0]} at {row.departureDateTime.split('T')[1].split('.')[0]}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
                
                <CardActions sx={{ flexDirection: { xs: 'column', sm: 'row' }, gap: 1, p: 2 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flex: 1 }}>
                        <Tooltip title="Plan Traveling">
                            <Button 
                                variant='contained'
                                sx={{
                                    backgroundColor: "#F46B91",
                                    minWidth: { xs: '100%', sm: 'auto' },
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                    },
                                }}
                                size='small'
                                disabled={!row.isTraveling}
                                onClick={() => {
                                    setFill((prev) => ({ ...prev, 'travel': true }));
                                    getTravelbyPNR(row.pnr);
                                    setPNR(row.pnr);
                                }}
                                startIcon={<TimeToLeaveIcon />}
                            >
                                Travel
                            </Button>
                        </Tooltip>
                        
                        <Tooltip title="Plan Accommodation">
                            <Button 
                                variant='contained'
                                sx={{
                                    backgroundColor: "#64CFF3",
                                    minWidth: { xs: '100%', sm: 'auto' },
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                    },
                                }}
                                size='small'
                                disabled={!row.isStaying}
                                onClick={() => {
                                    setFill((prev) => ({ ...prev, 'accommodation': true }));
                                    getAccomodationbyPNR(row.pnr);
                                    setPNR(row.pnr);
                                }}
                                startIcon={<HotelIcon />}
                            >
                                Hotel
                            </Button>
                        </Tooltip>
                        
                        <Tooltip title="View Visitor details">
                            <Button
                                variant='outlined'
                                sx={{
                                    minWidth: { xs: '100%', sm: 'auto' },
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                    },
                                }}
                                onClick={() => {
                                    if (!vOpen) {
                                        getVisitorDetails(row.pnr);
                                    }
                                    setVOpen(true);
                                }}
                                startIcon={<RemoveRedEye />}
                            >
                                View Details
                            </Button>
                        </Tooltip>
                      
                    </Stack>
                </CardActions>
            </Card>
        </>
    );
}

function Row({ row, index, setFill, setAccPlan, setTravelPlan, setPNR, setTravelRef, setAccRef, setState, setStateD, setPNRData, token }) {
    const [open, setOpen] = React.useState(false);
    const [aOpen, setAOpen] = useState(false);
    const [tOpen, setTOpen] = useState(false);
    const [travelDetails, setTravelDetails] = useState({});
    const [accDetails, setAccDetails] = useState({});
    const [visitor, setVisitor] = useState({});
    const [vOpen, setVOpen] = useState(false);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // If mobile, render the mobile card component
    if (isMobile) {
        return (
            <MobileCard 
                row={row} 
                index={index} 
                setFill={setFill} 
                setAccPlan={setAccPlan} 
                setTravelPlan={setTravelPlan} 
                setPNR={setPNR} 
                setTravelRef={setTravelRef} 
                setAccRef={setAccRef} 
                setState={setState} 
                setStateD={setStateD} 
                setPNRData={setPNRData} 
                token={token} 
            />
        );
    }

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        overflow: 'auto',
        bgcolor: 'background.paper',
        border: '2px solid #280C58',
        borderRadius: '2em',
        boxShadow: 24,
        p: 4,
    };

    const getTravelbyPNR = async (val) => {
        try {
            const response = await axios.get(`/conveyance/conveyanceindividual/${val}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTravelDetails(response.data.data.conveyanceDetails);
            setTravelPlan(response.data.data.conveyanceDetails);
            setTravelRef(response.data.data.finaldetails);
            setState({ severity: 'success', message: 'Fetched Successfully', open: true });
        } catch (error) {
            console.log('Error', error);
            setState({ severity: 'error', message: error.response.data.errors[0], open: true });
        }
    };

    const getAccomodationbyPNR = async (val) => {
        try {
            const response = await axios.get(`/accomodation/accommodationindividual/${val}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAccPlan(response.data.data.accomodationdetails);
            setAccRef(response.data.data.finaldetails);
            setState({ severity: 'success', message: 'Fetched Successfully', open: true });
        } catch (error) {
            console.log('Error', error);
            setState({ severity: 'error', message: error.response.data.errors[0], open: true });
        }
    };

    const getVisitorDetails = async (val) => {
        try {
            const response = await axios.get(`/visit/visitindividual/${val}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setVisitor(response.data.data);
            setState({ severity: 'success', message: 'Fetched Successfully', open: true });
        } catch (error) {
            console.log('Error', error);
            setState({ severity: 'error', message: error.response.data.errors[0], open: true });
        }
    };

    const handleCancel = async (row) => {
        setStateD((prev) => ({ ...prev, openCancel: true }));
        setPNRData(row);
    };

    return (
        <React.Fragment>
            <Modal
                open={vOpen}
                onClose={() => setVOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <IconButton
                        sx={{
                            position: 'absolute', 
                            top: 5, 
                            right: 5, 
                            p: 2,
                            backgroundColor: indigo[50],
                            '&:hover': {
                                backgroundColor: indigo[500],
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                        onClick={() => setVOpen(false)}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} display={'flex'} justifyContent={'center'}>
                            <Chip label='Visitor Details' sx={{ backgroundColor: indigo[50] }} />
                        </Grid>
                        
                        {/* All visitor detail fields - responsive grid */}
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">First Name</Typography>
                                <Typography variant="body1">{visitor.firstName}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Last Name</Typography>
                                <Typography variant="body1">{visitor.lastName}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Gender</Typography>
                                <Typography variant="body1">{visitor.gender}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Contact</Typography>
                                <Typography variant="body1">{visitor.contact}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Email</Typography>
                                <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{visitor.email}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">State</Typography>
                                <Typography variant="body1">{visitor.state}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">District</Typography>
                                <Typography variant="body1">{visitor.district}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Address</Typography>
                                <Typography variant="body1">{visitor.address}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Organization</Typography>
                                <Typography variant="body1">{visitor.organization}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Government ID Type</Typography>
                                <Typography variant="body1">{visitor.govtIdType}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Government ID Number</Typography>
                                <Typography variant="body1">{visitor.govtIdNumber}</Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} display={'flex'} justifyContent={'center'}>
                            <Chip label='Host Details' sx={{ backgroundColor: indigo[50] }} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Employee Name</Typography>
                                <Typography variant="body1">{visitor.employee}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Office Email</Typography>
                                <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>{visitor.officeemail}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Department Name</Typography>
                                <Typography variant="body1">{visitor.deptName}</Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: 1 }}>
                                <Typography variant="subtitle1">Purpose</Typography>
                                <Typography variant="body1">{visitor.purpose}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>

            {/* Desktop table row */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: "white" }} key={index}>
                <TableCell align='center'>{row.pnr}</TableCell>
                <TableCell component="th" scope="row">{row.firstName}</TableCell>
                <TableCell align="right">{row.lastName}</TableCell>
                <TableCell align="right">{row.purpose}</TableCell>
                <TableCell align="right">
                    {row.arrivalDateTime.split('T')[0] + ',' + row.arrivalDateTime.split('T')[1].split('.')[0]}
                </TableCell>
                <TableCell align="right">
                    {row.departureDateTime.split('T')[0] + ',' + row.departureDateTime.split('T')[1].split('.')[0]}
                </TableCell>
                <TableCell align="center">
                    <Stack direction={'row'} spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                        <Tooltip title="Plan Traveling">
                            <Button 
                                variant='contained'
                                sx={{
                                    backgroundColor: "#F46B91",
                                    minWidth: '40px',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                    },
                                }}
                                size='small'
                                disabled={!row.isTraveling}
                                onClick={() => {
                                    setFill((prev) => ({ ...prev, 'travel': true }));
                                    getTravelbyPNR(row.pnr);
                                    setPNR(row.pnr);
                                }}
                            >
                                <TimeToLeaveIcon />
                            </Button>
                        </Tooltip>
                        <Tooltip title="Plan Accommodation">
                            <Button 
                                variant='contained'
                                sx={{
                                    backgroundColor: "#64CFF3",
                                    minWidth: '40px',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                    },
                                }}
                                size='small'
                                disabled={!row.isStaying}
                                onClick={() => {
                                    setFill((prev) => ({ ...prev, 'accommodation': true }));
                                    getAccomodationbyPNR(row.pnr);
                                    setPNR(row.pnr);
                                }}
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
                                    getVisitorDetails(row.pnr);
                                }
                                setVOpen(!vOpen);
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
        </TableRow>
  
        </React.Fragment >
    );
}
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function IndividualRegistrations() {
    const [data, setData] = useState([]);
  const [fill, setFill] = useState({ travel: false, accommodation: false });
  const [accRef, setAccRef] = useState({});
  const [accPlan, setAccPlan] = useState([]);
  const [travelPlan, setTravelPlan] = useState([]);
  const [PNR, setPNR] = useState('');
  const [id, setId] = useState('');
  const [travelRef, setTravelRef] = useState({});
  const [pnrData, setPNRData] = useState(null)
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({});
  const [stateD, setStateD] = useState({});
  const auth = useAuth()
  const [currentEditId, setCurrentEditId] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const handleClose = () => {
    setOpen(false);
    setState({});
    setStateD({});
  };
  const handleEdit = (details) => {
    formik.setFieldValue('accommodationName', details.accommodationName);
    formik.setFieldValue('accommodationAddress', details.accommodationAddress);
    formik.setFieldValue('checkin', details.checkin);
    formik.setFieldValue('checkout', details.checkout);
    formik.setFieldValue('contactOfHotel', details.contactOfHotel);
    formik.setFieldValue('driverContact', details.driverContact);
    formik.setFieldValue('bookedBy', details.bookedBy);
    formik.setFieldValue('bookedFor', details.bookedFor);
    formik.setFieldValue('remarks', details.remarks);
    setId(details.ind_id);
  };

function TravelRow({ row, index, formiktwo }) {
  const [tropen, setTrOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    accId: null,
  });

  // 🔹 Open dialog before deleting
  const handleOpenDeleteDialog = (accId) => {
    setDeleteDialog({ open: true, accId });
  };

  // 🔹 Close dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, accId: null });
  };

  // 🔹 Confirm delete (actual API call)
  const handleConfirmDelete = async () => {
    const { accId } = deleteDialog;
    try {
      const response = await axios.delete(
        `/conveyance/conveyanceindividual/${PNR}/${accId}`,
        {
          headers: {
            Authorization: `Bearer ${auth?.user?.accessToken}`,
          },
        }
      );

      // Update UI immediately
      setTravelPlan((prev) => prev.filter((item) => item.ind_id !== accId));

      setState({
        severity: 'success',
        message: response.data.message || 'Conveyance deleted successfully!',
        open: true,
      });
    } catch (error) {
      console.error('Error deleting Conveyance:', error);
      setState({
        severity: 'error',
        message:
          error.response?.data?.errors?.[0] || 'Error deleting conveyance',
        open: true,
      });
    } finally {
      handleCloseDeleteDialog();
    }
  };


  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString(undefined, {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  const handleEdit = () => {
    formiktwo.setFieldValue('pickupDateTime', row.pickupDateTime.split('.')[0]);
    formiktwo.setFieldValue('pickupLocation', row.pickupLocation);
    formiktwo.setFieldValue('dropOffDateTime', row?.dropOffDateTime?.split('.')[0]);
    formiktwo.setFieldValue('dropOffLocation', row?.dropOffLocation);
    formiktwo.setFieldValue('vehicleType', row.vehicleType);
    formiktwo.setFieldValue('vehicleNo', row.vehicleNo);
    formiktwo.setFieldValue('driverName', row.driverName);
    formiktwo.setFieldValue('driverContact', row.driverContact);
    formiktwo.setFieldValue('bookedBy', row.bookedBy);
    formiktwo.setFieldValue('bookedFor', row.bookedFor);
    formiktwo.setFieldValue('remarks', row.remarks);
    setId(row.ind_id);
  };

  // Mobile Card Layout
  if (isMobile) {
    return (
      <Card 
        sx={{ 
          mb: 2, 
          backgroundColor: id === row.ind_id ? 'success.light' : 'white',
          border: id === row.ind_id ? 2 : 1,
          borderColor: id === row.ind_id ? 'success.main' : 'grey.300',
          transition: 'all 0.3s ease'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" color="primary">
              Trip #{index + 1}
            </Typography>
            <Chip 
              label={row?.status || 'Pending'} 
              color={row?.status === 'Confirmed' ? 'success' : 'warning'}
              size="small"
            />
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">Pickup</Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {formatDateTime(row.pickupDateTime)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2">{row?.pickupLocation}</Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">Drop-off</Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {formatDateTime(row.dropOffDateTime)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2">{row?.dropOffLocation}</Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              size="small"
              onClick={() => setTrOpen(!tropen)}
              sx={{ textTransform: 'none' }}
            >
              {tropen ? 'Hide Details' : 'Show Details'}
              {tropen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </Button>
          </Box>

          <Collapse in={tropen} timeout="auto" unmountOnExit>
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Booked For</Typography>
                  <Typography variant="body2" fontWeight="medium">{row?.bookedFor}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Booked By</Typography>
                  <Typography variant="body2" fontWeight="medium">{row?.bookedBy}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Vehicle Type</Typography>
                  <Typography variant="body2" fontWeight="medium">{row?.vehicleType}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Vehicle No.</Typography>
                  <Typography variant="body2" fontWeight="medium">{row?.vehicleNo}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Driver Contact</Typography>
                  <Typography variant="body2" fontWeight="medium">{row?.driverContact}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Remarks</Typography>
                  <Typography variant="body2">{row?.remarks || 'No remarks'}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Collapse>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              startIcon={<Edit />}
              variant="contained"
              size="small"
              onClick={handleEdit}
              sx={{ minWidth: 'auto' }}
            >
              Edit
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              variant="contained"
              size="small"
              onClick={() => handleOpenDeleteDialog(row.ind_id)}
              sx={{
                backgroundColor: 'error.main',
                borderColor: 'error.main',
                "&:hover": { backgroundColor: 'error.dark' },
                minWidth: 'auto'
              }}
            >
              Delete
            </Button>
          </Stack>
          {/* 🔹 Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Confirm Deletion"
        message="Are you sure you want to delete this accommodation record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
        </CardContent>
      </Card>
    );
  }

  // Desktop/Tablet Table Layout
  return (
    <TableBody sx={{ backgroundColor: 'white' }}>
      <TableRow
        sx={{
          backgroundColor: indigo[50],
          animation: id === row.ind_id ? 'blink-animation 0.5s infinite alternate' : 'none',
          '@keyframes blink-animation': {
            '0%': {
              backgroundColor: indigo[50],
            },
            '100%': {
              backgroundColor: 'success.light',
            },
          },
        }}
        key={index}
      >
        <TableCell sx={{ py: 1 }}>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setTrOpen(!tropen)}
          >
            {tropen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{index + 1}</TableCell>
        
        {/* Responsive date/time display */}
        <TableCell align="center" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          <Typography variant={isTablet ? "caption" : "body2"}>
            {formatDateTime(row.pickupDateTime)}
          </Typography>
        </TableCell>
        
        <TableCell align="center" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          <Typography variant={isTablet ? "caption" : "body2"} noWrap>
            {row?.pickupLocation}
          </Typography>
        </TableCell>
        
        <TableCell align="center" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          <Typography variant={isTablet ? "caption" : "body2"}>
            {formatDateTime(row.dropOffDateTime)}
          </Typography>
        </TableCell>
        
        <TableCell align="center" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          <Typography variant={isTablet ? "caption" : "body2"} noWrap>
            {row?.dropOffLocation}
          </Typography>
        </TableCell>
        
        <TableCell align="center" sx={{ py: 1, minWidth: 160 }}>
          <Stack
            spacing={1}
            direction={{ xs: 'column', sm: 'row' }}
            useFlexGap
            flexWrap="wrap"
            justifyContent={{ xs: 'center', sm: 'flex-start' }}
          >
            <Button
              startIcon={<Edit />}
              variant="contained"
              size="small"
              onClick={handleEdit}
              sx={{ minWidth: isTablet ? 80 : 'auto' }}
            >
              {isTablet ? '' : 'Edit'}
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              variant="contained"
              size="small"
              onClick={() => handleOpenDeleteDialog(row.ind_id)}
              sx={{
                backgroundColor: 'error.main',
                borderColor: 'error.main',
                "&:hover": { backgroundColor: 'error.dark' },
                minWidth: isTablet ? 80 : 'auto'
              }}
            >
              {isTablet ? '' : 'Delete'}
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
      {/* 🔹 Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Confirm Deletion"
        message="Are you sure you want to delete this accommodation record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
      
      <TableRow>
        <TableCell colSpan={8}>
          <Collapse in={tropen} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Travel Details
              </Typography>
              
              {/* Responsive details view */}
              {isTablet ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Booking Information</Typography>
                        <Typography variant="body2"><strong>Booked For:</strong> {row?.bookedFor}</Typography>
                        <Typography variant="body2"><strong>Booked By:</strong> {row?.bookedBy}</Typography>
                        <Typography variant="body2"><strong>Status:</strong> {row?.status}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Vehicle Information</Typography>
                        <Typography variant="body2"><strong>Vehicle Type:</strong> {row?.vehicleType}</Typography>
                        <Typography variant="body2"><strong>Vehicle No:</strong> {row?.vehicleNo}</Typography>
                        <Typography variant="body2"><strong>Driver Contact:</strong> {row?.driverContact}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  {row?.remarks && (
                    <Grid item xs={12}>
                      <Card variant="outlined">
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom>Remarks</Typography>
                          <Typography variant="body2">{row?.remarks}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Table size="small" aria-label="travel details">
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
                    <TableRow>
                      <TableCell align="center">{row?.bookedFor}</TableCell>
                      <TableCell>{row?.driverContact}</TableCell>
                      <TableCell>{row?.vehicleNo}</TableCell>
                      <TableCell>{row?.vehicleType}</TableCell>
                      <TableCell>{row?.bookedBy}</TableCell>
                      <TableCell>{row?.remarks}</TableCell>
                      <TableCell>{row?.status}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </TableBody>
  );
}

function MobileAccommodationCard({ details, index, formik, onEdit, onDelete }) {
    const [expanded, setExpanded] = useState(false);

    console.log('Accommodation details:', details);

    const [deleteDialog, setDeleteDialog] = useState({
      open: false,
      accId: null,
    });
  
    // 🔹 Open dialog before deleting
    const handleOpenDeleteDialog = (accId) => {
      setDeleteDialog({ open: true, accId });
    };
  
    // 🔹 Close dialog
    const handleCloseDeleteDialog = () => {
      setDeleteDialog({ open: false, accId: null });
    };
  
    // 🔹 Confirm delete (actual API call)
    const handleConfirmDelete = async () => {
      const { accId } = deleteDialog;
      try {
        const response = await axios.delete(
          `/accomodation/accommodationindividual/${PNR}/${accId}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.user?.accessToken}`,
            },
          }
        );
  
        // Update UI immediately
        setAccPlan((prev) => prev.filter((item) => item.ind_id !== accId));
  
        setState({
          severity: 'success',
          message: response.data.message || 'Accommodation deleted successfully!',
          open: true,
        });
      } catch (error) {
        console.error('Error deleting accommodation:', error);
        setState({
          severity: 'error',
          message:
            error.response?.data?.errors?.[0] || 'Error deleting accommodation',
          open: true,
        });
      } finally {
        handleCloseDeleteDialog();
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      });
    };
  
    return (
      <Card sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1 }}>
                {details.accommodationName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                  {details.accommodationAddress}
                </Typography>
              </Box>
            </Box>
            <Chip label={`#${index + 1}`} size="small" color="primary" />
          </Box>
  
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                CHECK IN
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ fontSize: 14, color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                  {formatDate(details.checkin)}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                CHECK OUT
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ fontSize: 14, color: 'error.main', mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 500 }}>
                  {formatDate(details.checkout)}
                </Typography>
              </Box>
            </Box>
          </Box>
  
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Additional Details
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    HOTEL CONTACT
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Phone sx={{ fontSize: 14, color: 'primary.main', mr: 0.5 }} />
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                      {details.contactOfHotel}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      BOOKED BY
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                      {details.bookedBy}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      BOOKED FOR
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                      {details.bookedFor}
                    </Typography>
                  </Box>
                </Box>
                {details.remarks && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                      REMARKS
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                      {details.remarks}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Collapse>
  
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{ fontSize: '0.75rem' }}
            >
              {expanded ? 'Show Less' : 'Show More'}
              {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </Button>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Edit sx={{ fontSize: 16 }} />}
                onClick={() => onEdit(details)}
                sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1.5 }}
              >
                Edit
              </Button>
             
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleOpenDeleteDialog(details.ind_id)}
                sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1.5 }}
              >
                Delete
              </Button>
            </Stack>
          </Box>
          {/* Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Confirm Deletion"
        message="Are you sure you want to delete this accommodation record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />

      {/* Snackbar for feedback */}
      <Snackbar
        open={state.open}
        autoHideDuration={2000}
        onClose={() => setState({ ...state, open: false })}
      >
        <Alert severity={state.severity}>{state.message}</Alert>
      </Snackbar>
        </CardContent>
      </Card>
    );
  }


function AccommodationRow({ details, index, onEdit, currentEditId }) {
    const [acOpen, setAcOpen] = useState(false);

    const [deleteDialog, setDeleteDialog] = useState({
      open: false,
      accId: null,
    });
  
    // 🔹 Open dialog before deleting
    const handleOpenDeleteDialog = (accId) => {
      setDeleteDialog({ open: true, accId });
    };
  
    // 🔹 Close dialog
    const handleCloseDeleteDialog = () => {
      setDeleteDialog({ open: false, accId: null });
    };
  
    // 🔹 Confirm delete (actual API call)
    const handleConfirmDelete = async () => {
      const { accId } = deleteDialog;
      try {
        const response = await axios.delete(
          `/accomodation/accommodationindividual/${PNR}/${accId}`,
          {
            headers: {
              Authorization: `Bearer ${auth?.user?.accessToken}`,
            },
          }
        );
  
        // Update UI immediately
        setAccPlan((prev) => prev.filter((item) => item.ind_id !== accId));
  
        setState({
          severity: 'success',
          message: response.data.message || 'Accommodation deleted successfully!',
          open: true,
        });
      } catch (error) {
        console.error('Error deleting accommodation:', error);
        setState({
          severity: 'error',
          message:
            error.response?.data?.errors?.[0] || 'Error deleting accommodation',
          open: true,
        });
      } finally {
        handleCloseDeleteDialog();
      }
    };

    
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString(undefined, {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'UTC'
      });
    };
  
    const isEditing = currentEditId === details.ind_id;
  
    return (
      <>
        <TableRow 
          sx={{
            backgroundColor: '#f3f4f6',
            animation: isEditing ? 'blink-animation 0.5s infinite alternate' : 'none',
            '@keyframes blink-animation': {
              '0%': { backgroundColor: '#f3f4f6' },
              '100%': { backgroundColor: '#dcfce7' },
            },
          }}
        >
          <TableCell sx={{ py: 1 }}>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setAcOpen(!acOpen)}
            >
              {acOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell align="center" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
            {index + 1}
          </TableCell>
          <TableCell align="center" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, maxWidth: { xs: 120, sm: 'none' } }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {details.accommodationName}
            </Typography>
          </TableCell>
          <TableCell align="center" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, maxWidth: { xs: 150, sm: 'none' } }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              {details.accommodationAddress}
            </Typography>
          </TableCell>
          <TableCell align="center" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: { xs: 120, sm: 'auto' } }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
              {formatDate(details.checkin)}
            </Typography>
          </TableCell>
          <TableCell align="center" sx={{ py: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' }, minWidth: { xs: 120, sm: 'auto' } }}>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
              {formatDate(details.checkout)}
            </Typography>
          </TableCell>
          <TableCell align="center" sx={{ py: 1, minWidth: 160 }}>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
              <Button
                startIcon={<Edit sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                variant="contained"
                size="small"
                onClick={() => onEdit(details)}
                sx={{ 
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  minWidth: 'auto'
                }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                sx={{ 
                  backgroundColor: 'error.main', 
                  color: 'white',
                  fontSize: { xs: '0.7rem', sm: '0.875rem' },
                  px: { xs: 1, sm: 2 },
                  minWidth: 'auto',
                  '&:hover': { backgroundColor: 'error.dark' }
                }}
                size="small"
                onClick={() => handleOpenDeleteDialog(details.ind_id)}
              >
                Delete
              </Button>
            </Stack>
          </TableCell>
        </TableRow>
     {/* 🔹 Confirmation Dialog */}
     <ConfirmDialog
        open={deleteDialog.open}
        title="Confirm Deletion"
        message="Are you sure you want to delete this accommodation record? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseDeleteDialog}
      />
        <TableRow>
          <TableCell colSpan={7} sx={{ py: 0, borderBottom: acOpen ? 'none' : '1px solid rgba(224, 224, 224, 1)' }}>
            <Collapse in={acOpen} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  Accommodation Details
                </Typography>
                <TableContainer>
                  <Table size="small" aria-label="accommodation details">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Hotel Contact</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Booked By</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Booked For</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Remarks</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {details.contactOfHotel}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {details.bookedBy}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {details.bookedFor}
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {details.remarks}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }
//   const validationSchema = Yup.object({
//     accommodationName: Yup.string().required('Accommodation Name is required'),
//     accommodationAddress: Yup.string().required('Accommodation Address is required'),
//     checkin: Yup.date().required('Checkin date is required'),
//     checkout: Yup.date().required('Checkout date is required'),
//     contactOfHotel: Yup.string().required('Contact of Hotel/Stay is required'),
//     bookedBy: Yup.string().required('Booked By is required'),
//     bookedFor: Yup.string().required('Booked For is required'),
//     remarks: Yup.string(),
// });
const validationSchema = Yup.object({
  accommodationName: Yup.string().required('Accommodation Name is required'),
  accommodationAddress: Yup.string().required('Accommodation Address is required'),

  checkin: Yup.date()
    .required('Checkin date is required'),

  checkout: Yup.date()
    .required('Checkout date is required')
    .min(
      Yup.ref('checkin'),
      'Checkout date must be after Checkin date'
    ),

    contactOfHotel: Yup.string()
    .required('Contact of Hotel/Stay is required')
    .matches(/^\d{10}$/, 'Contact of Hotel/Stay must be exactly 10 digits'),
  
  bookedBy: Yup.string().required('Booked By is required'),
  bookedFor: Yup.string().required('Booked For is required'),
  remarks: Yup.string(),
});

// const validationSchemaTwo = Yup.object({
//     pickupDateTime: Yup.date().required('Pickup Date is required'),
//     // pickupTime: Yup.string().required('Pickup Time is required'),
//     pickupLocation: Yup.string().required('Pickup Location is required'),
//     dropOffDateTime: Yup.date().required('Drop Date is required'),
//     // dropTime: Yup.string().required('Drop Time is required'),
//     dropOffLocation: Yup.string().required('Drop Location is required'),
//     driverName: Yup.string().required('Driver Name is required'),
//     vehicleNo: Yup.string().required('Vehicle No. is required'),
//     vehicleType: Yup.string().required('Vehicle Type is required'),
//     driverContact: Yup.string().required('Driver Contact is required'),
//     bookedBy: Yup.string().required('Booked By is required'),
//     bookedFor: Yup.string().required('Booked For is required'),
//     remarks: Yup.string(),
//     // Add validation for other fields as needed
// });
const validationSchemaTwo = Yup.object({
  pickupDateTime: Yup.date()
    .required('Pickup Date is required'),

  dropOffDateTime: Yup.date()
    .required('Drop Date is required')
    .min(
      Yup.ref('pickupDateTime'),
      'Drop-off Date must be after Pickup Date'
    ),

  pickupLocation: Yup.string().required('Pickup Location is required'),
  dropOffLocation: Yup.string().required('Drop Location is required'),
  driverName: Yup.string().required('Driver Name is required'),
  vehicleNo: Yup.string().required('Vehicle No. is required'),
  vehicleType: Yup.string().required('Vehicle Type is required'),
  driverContact: Yup.string().required('Driver Contact is required')
  .matches(/^\d{10}$/, 'Driver Contact must be exactly 10 digits'),
  bookedBy: Yup.string().required('Booked By is required'),
  bookedFor: Yup.string().required('Booked For is required'),
  remarks: Yup.string(),
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
    onSubmit: async (values, helpers) => {
      values.PNR = PNR;
      let newArray;
  
      if (id !== '') {
        // Update existing row
        newArray = accPlan.map((item) =>
          item.ind_id === id ? { ...item, ...values } : item
        );
      } else {
        // Add new row
        newArray = [...accPlan, values];
      }
  
      setAccPlan(newArray);
      helpers.resetForm();
      setId('');
  
      // ✅ Now immediately call the backend
      try {
        const response = await axios.put(
          `/accomodation/accommodationindividual/${PNR}`,
          newArray,
          {
            headers: {
              Authorization: `Bearer ${auth?.user?.accessToken}`,
            },
          }
        );
  
        // ✅ Refetch latest accommodation with updated IDs
        const refreshed = await axios.get(
          `/accomodation/accommodationindividual/${PNR}`,
          {
            headers: { Authorization: `Bearer ${auth?.user?.accessToken}` },
          }
        );
        setAccPlan(refreshed.data.data.accomodationdetails);
  
        setState({
          severity: 'success',
          message: id ? 'Updated & Saved Successfully' : 'Added & Saved Successfully',
          open: true,
        });
      } catch (error) {
        console.error('Error saving accommodation:', error);
        setState({
          severity: 'error',
          message:
            error.response?.data?.errors?.[0] || 'Error saving accommodation',
          open: true,
        });
      }
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
        // Add initial values for other fields
    },
    validationSchema: validationSchemaTwo,
    onSubmit: async (values,helpers) => {
      values.PNR = PNR;
        let newArray;
        if (id !== '') {
            // console.log('updating row', id)
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
        // console.log(values);
        // console.log('travel plan', travelPlan)
        helpers.resetForm();
        setId('')


        try {
          const response = await axios.put(
            `/conveyance/conveyanceindividual/${PNR}`,
            newArray,
            {
              headers: {
                Authorization: `Bearer ${auth?.user?.accessToken}`,
              },
            }
          );
    
          // ✅ Refetch latest accommodation with updated IDs
          const refreshed = await axios.get(
            `/conveyance/conveyanceindividual/${PNR}`,
            {
              headers: { Authorization: `Bearer ${auth?.user?.accessToken}` },
            }
          );
          setTravelPlan(refreshed.data.data.conveyanceDetails);
    
          setState({
            severity: 'success',
            message: id ? 'Updated & Saved Successfully' : 'Added & Saved Successfully',
            open: true,
          });
        } catch (error) {
          console.error('Error saving Travel:', error);
          setState({
            severity: 'error',
            message:
              error.response?.data?.errors?.[0] || 'Error saving Travel',
            open: true,
          });
        }

    },
});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/visit/visitindividual/planner',
                    {
                        headers: {
                            Authorization: `Bearer ${auth?.user?.accessToken}`
                        }
                    }
                );
                // console.log('response', response)
                if (response.data.data && response.data.data.length > 0) {
                    setState({ severity: 'success', message: 'Fetched succesfully', open: true })
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
                        visitor.isTraveling
                    )).reverse());
                } else {
                    // console.log('No data found for the given');
                    setState({ severity: 'warning', message: 'No data', open: true })
                }
            } catch (error) {
                console.error('Error fetching data:', error.message);
                setState({ severity: 'error', message: error.response.data.errors[0], open: true })
            }
        };

        fetchData();
    }, [auth?.user?.accessToken]);

    const submitAccomodation = async () => {
        if(accPlan.length == 0){
            setState({ severity: 'warning', message: 'Please click add before submitting', open: true })
            return ;
            
        }
        try {
            const response = await axios.put(`/accomodation/accommodationindividual/${PNR}`, accPlan,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.user?.accessToken}`
                    }
                }
            );

            // Refetch accommodation so each entry has indid from backend
    const refreshed = await axios.get(`/accomodation/accommodationindividual/${PNR}`,
      { headers: { Authorization: `Bearer ${auth?.user?.accessToken}` } }
  );
  console.log("accdetails",refreshed.data.data.accomodationdetails)
  setAccPlan(refreshed.data.data.accomodationdetails); // contains indid

            // console.log('response', response)
            setState({ severity: 'success', message: 'Saved Successfully', open: true })
        } catch (error) {
            console.log('error while submitting accomodation', error)
            setState({ severity: 'error', message: error.response.data.errors[0], open: true })
        }
    }
    const submitTravelPlan = async () => {
        if(travelPlan.length == 0){
            setState({ severity: 'warning', message: 'Please fill details and click add before submitting', open: true })
            return ;
            
        }
        try {
            const response = await axios.put(`/conveyance/conveyanceindividual/${PNR}`, travelPlan,
                {
                    headers: {
                        Authorization: `Bearer ${auth?.user?.accessToken}`
                    }
                }
            );
            console.log('response', response)
            setState({ severity: 'success', message: 'Saved Successfully', open: true })

        } catch (error) {
            console.log('error while submitting accomodation', error)
            setState({ severity: 'error', message: error.response.data.errors[0], open: true })

        }
    }

     // ✅ Pagination state
     const [page, setPage] = useState(0);
     const [rowsPerPage, setRowsPerPage] = useState(10);
 
     // ✅ Handle page change
     const handleChangePage = (event, newPage) => {
         setPage(newPage);
     };
 
     // ✅ Handle rows per page change
     const handleChangeRowsPerPage = (event) => {
         setRowsPerPage(parseInt(event.target.value, 10));
         setPage(0); // Reset to first page
     };
 
     // ✅ Get paginated data
     const paginatedData = data.slice(
         page * rowsPerPage,
         page * rowsPerPage + rowsPerPage
     );

    const vertical = 'top'
    const horizontal = 'center'
   return (
        <>
            <Head>
                <title>Visitor Details</title>
            </Head>
            <Snackbar 
                open={state.open} 
                autoHideDuration={2000} 
                onClose={handleClose} 
                anchorOrigin={{ vertical, horizontal }}
            >
                <Alert
                    onClose={handleClose}
                    severity={state.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {state.message}
                </Alert>
            </Snackbar>
            
            
            <Box
                component="main"
                sx={{
                    py: { xs: 2, sm: 4, md: 8 },
                    px: { xs: 1, sm: 2 },
                    backgroundColor: '#280C58',
                    minHeight: '100vh'
                }}
            >
                <Container maxWidth="xl">
                    <Grid container spacing={{ xs: 1, sm: 2 }}>
                        <Grid
                            item
                            xs={12}
                            component={Paper}
                            sx={{ 
                                p: { xs: 1, sm: 2 }, 
                                background: blue[50],
                                overflow: 'hidden'
                            }}
                        >
                            <Typography 
                                variant="h4" 
                                align="center" 
                                gutterBottom
                                sx={{
                                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                                    mb: { xs: 2, sm: 3 }
                                }}
                            >
                                Individual Visitor Details
                            </Typography>
                            
                            {!fill.travel && !fill.accommodation && (
                                <motion.div
                                    initial={{ opacity: 0, x: '30%' }}
                                    animate={{ opacity: 1, x: '0%' }}
                                    transition={{ duration: 0.2 }}
                                    style={{ position: 'relative' }}
                                >

{isMobile ? (
     <Box>
           {data?.length > 0 ? (
            data.map((row, index) => (
              <MobileCard
              key={row.pnr || index}   // ✅ unique key
              row={row} 
              index={index} 
                setFill={setFill} 
                setAccPlan={setAccPlan} 
                setTravelPlan={setTravelPlan} 
                setPNR={setPNR} 
                setTravelRef={setTravelRef} 
                setAccRef={setAccRef} 
                setState={setState} 
                setStateD={setStateD} 
                setPNRData={setPNRData} 
                token={auth?.user?.accessToken} 
            />
          ))
        ) : (
          <Card sx={{ textAlign: 'center', py: 4 }}>
            <CardContent>
              <Hotel sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No accommodations planned yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start filling data to see your accommodation plan
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>
    ) : (

                                    <TableContainer 
                                        component={Paper} 
                                        sx={{ 
                                            overflowX: 'auto',
                                            '& .MuiTable-root': {
                                                minWidth: { xs: 800, sm: 'auto' }
                                            }
                                        }}
                                    >
                                        <Table aria-label="collapsible table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                    >
                                                        PNR
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                        First Name
                                                    </TableCell>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                    >
                                                        Last Name
                                                    </TableCell>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                    >
                                                        Purpose
                                                    </TableCell>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                    >
                                                        Visiting Date
                                                    </TableCell>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                    >
                                                        Exiting Date
                                                    </TableCell>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                    >
                                                        Plan
                                                    </TableCell>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                    >
                                                        Details
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            {data.length > 0 && (
                                                <TableBody sx={{ backgroundColor: indigo[50] }}>
                                                    {paginatedData.map((row) => (
                                                        <Row 
                                                            key={row.name|| row.pnr} 
                                                            row={row} 
                                                            setFill={setFill} 
                                                            setTravelPlan={setTravelPlan} 
                                                            setAccPlan={setAccPlan} 
                                                            setPNR={setPNR} 
                                                            setTravelRef={setTravelRef} 
                                                            setAccRef={setAccRef} 
                                                            setState={setState} 
                                                            setStateD={setStateD} 
                                                            setPNRData={setPNRData} 
                                                            token={auth?.user?.accessToken} 
                                                        />
                                                    ))}
                                                </TableBody>
                                            )}
                                            {data.length === 0 && (
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell colSpan={12}>
                                                            <Typography 
                                                                align='center' 
                                                                variant='h4' 
                                                                sx={{
                                                                    p: 3,
                                                                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
                                                                }}
                                                            >
                                                                No Data Available
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            )}

                                        </Table>
                                                              {/* ✅ Pagination Component - Only show when there's data */}
            {data.length > 0 && (
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50, 100]}
                    component="div"
                    count={data.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{
                        '.MuiTablePagination-toolbar': {
                            backgroundColor: '#f5f5f5',
                            borderTop: '1px solid #e0e0e0',
                        },
                        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                        },
                    }}
                />
            )}
                                    </TableContainer>
                                      )}
                                </motion.div>
                            )}
      
                            {(fill.accommodation || fill.travel) && (
                                <Button 
                                    onClick={() => {
                                        setFill({ 'travel': false, 'accomodation': false });
                                        setAccPlan([]);
                                        setTravelPlan([])
                                        setAccRef([]);
                                        formik.resetForm()
                                        formiktwo.resetForm()
                                        setId('')
                                    }} 
                                    startIcon={<ArrowBack />} 
                                    variant='contained' 
                                    sx={{ 
                                        m: { xs: 1, sm: 2 },
                                        width: { xs: '100%', sm: 'auto' }
                                    }}
                                >
                                    Back
                                </Button>
                            )}
      
                            {fill.accommodation && (
                                <motion.div
                                    initial={{ opacity: 0, x: '-30%' }}
                                    animate={{ opacity: 1, x: '0%' }}
                                    transition={{ duration: 0.10 }}
                                    style={{ position: 'relative' }}
                                >
                                    <Grid 
                                        container 
                                        spacing={{ xs: 1, sm: 2 }} 
                                        component={Paper} 
                                        sx={{ 
                                            ml: 0, 
                                            my: 1,
                                            p: { xs: 1, sm: 2 }
                                        }}
                                    >
                                        <Grid item xs={12}>
                                            <TableContainer sx={{ overflowX: 'auto' }}>
                                                <Table>
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell 
                                                                align='center' 
                                                                style={{ border: '1px solid #000' }}
                                                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                            >
                                                                Arrival Date
                                                            </TableCell>
                                                            <TableCell 
                                                                align='center' 
                                                                style={{ border: '1px solid #000' }}
                                                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                            >
                                                                Departure Date
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableHead>
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell 
                                                                align='center' 
                                                                style={{ border: '1px solid #000' }}
                                                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                            >
                                                                {new Date(accRef.arrivalDateTime).toLocaleString(undefined, { 
                                                                    month: 'numeric', 
                                                                    day: 'numeric', 
                                                                    year: 'numeric', 
                                                                    hour: 'numeric', 
                                                                    minute: 'numeric', 
                                                                    hour12: true, 
                                                                    timeZone: 'UTC' 
                                                                })}
                                                            </TableCell>
                                                            <TableCell 
                                                                align='center' 
                                                                style={{ border: '1px solid #000' }}
                                                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                            >
                                                                {new Date(accRef.departureDateTime).toLocaleString(undefined, { 
                                                                    month: 'numeric', 
                                                                    day: 'numeric', 
                                                                    year: 'numeric', 
                                                                    hour: 'numeric', 
                                                                    minute: 'numeric', 
                                                                    hour12: true, 
                                                                    timeZone: 'UTC' 
                                                                })}
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                        
    <Grid item xs={12} sx={{ overflow: 'auto' }}>
      <Typography 
        variant="h5"
        sx={{ 
          fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
          mb: 3,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <Hotel sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' } }} />
        Accommodation Plan
      </Typography>

      {isMobile ? (
        // Mobile Card View
        <Box>
          {accPlan?.length > 0 ? (
            accPlan.map((details, index) => (
              <MobileAccommodationCard
                key={details.ind_id}
                details={details}
                index={index}
                formik={formik}
                onEdit={handleEdit}
              />
            ))
          ) : (
            <Card sx={{ textAlign: 'center', py: 4 }}>
              <CardContent>
                <Hotel sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No accommodations planned yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start filling data to see your accommodation plan
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      ) : (
        // Desktop Table View
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell />
                <TableCell 
                  align="center"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                >
                  S.No
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                >
                  Accommodation Name
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                >
                  Address
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                >
                  Check In
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                >
                  Check Out
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600 }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {accPlan?.length > 0 ? (
                accPlan.map((details, index) => (
                  <AccommodationRow 
                    key={details.ind_id}
                    details={details}
                    index={index}
                    formik={formik}
                    onEdit={handleEdit}
                    currentEditId={currentEditId}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Hotel sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Start Filling Data
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Grid>
                                        
                                        <Divider sx={{ width: '100%', my: 2 }} />
                                        
                                        <Grid item xs={12} sx={{ backgroundColor: 'white', p: { xs: 1, sm: 2 } }}>
                                            <form onSubmit={formik.handleSubmit}>
                                                <Grid container spacing={{ xs: 1, sm: 2 }}>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            label="PNR"
                                                            name="PNR"
                                                            fullWidth
                                                            variant="outlined"
                                                            value={PNR}
                                                            disabled
                                                            error={formik.touched.PNR && Boolean(formik.errors.PNR)}
                                                            helperText={formik.touched.PNR && formik.errors.PNR}
                                                            size="small"
                                                            sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.875rem' } } }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            label="Accommodation Name"
                                                            name="accommodationName"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('accommodationName')}
                                                            error={formik.touched.accommodationName && Boolean(formik.errors.accommodationName)}
                                                            helperText={formik.touched.accommodationName && formik.errors.accommodationName}
                                                            size="small"
                                                            sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.875rem' } } }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            label="Accommodation Address"
                                                            name="accommodationAddress"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('accommodationAddress')}
                                                            error={formik.touched.accommodationAddress && Boolean(formik.errors.accommodationAddress)}
                                                            helperText={formik.touched.accommodationAddress && formik.errors.accommodationAddress}
                                                            size="small"
                                                            sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.875rem' } } }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography 
                                                            variant='body2'
                                                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                        >
                                                            Check In Time
                                                        </Typography>
                                                        <TextField
  name="checkin"
  type="datetime-local"
  fullWidth
  variant="outlined"
  {...formik.getFieldProps('checkin')}
  error={formik.touched.checkin && Boolean(formik.errors.checkin)}
  helperText={formik.touched.checkin && formik.errors.checkin}
  size="small"
  InputProps={{
    inputProps: {
      min: new Date().toISOString().slice(0, 16),  // ⛔ disable past dates
    },
  }}
/>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <Typography 
                                                            variant='body2'
                                                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                                        >
                                                            Check Out Time
                                                        </Typography>
                                                        <TextField
  name="checkout"
  type="datetime-local"
  fullWidth
  variant="outlined"
  {...formik.getFieldProps('checkout')}
  error={formik.touched.checkout && Boolean(formik.errors.checkout)}
  helperText={formik.touched.checkout && formik.errors.checkout}
  size="small"
  InputProps={{
    inputProps: {
      min: formik.values.checkin || new Date().toISOString().slice(0, 16),
    },
  }}
/>

                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            label="Contact of Hotel/Stay"
                                                            name="contactOfHotel"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('contactOfHotel')}
                                                            error={formik.touched.contactOfHotel && Boolean(formik.errors.contactOfHotel)}
                                                            helperText={formik.touched.contactOfHotel && formik.errors.contactOfHotel}
                                                            size="small"
                                                            sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.875rem' } } }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            label="Booked By"
                                                            name="bookedBy"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('bookedBy')}
                                                            error={formik.touched.bookedBy && Boolean(formik.errors.bookedBy)}
                                                            helperText={formik.touched.bookedBy && formik.errors.bookedBy}
                                                            size="small"
                                                            sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.875rem' } } }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            label="Booked For"
                                                            name="bookedFor"
                                                            fullWidth
                                                            variant="outlined"
                                                            {...formik.getFieldProps('bookedFor')}
                                                            error={formik.touched.bookedFor && Boolean(formik.errors.bookedFor)}
                                                            helperText={formik.touched.bookedFor && formik.errors.bookedFor}
                                                            size="small"
                                                            sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.875rem' } } }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
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
                                                            size="small"
                                                            sx={{ '& .MuiInputBase-input': { fontSize: { xs: '0.875rem' } } }}
                                                        />
                                                    </Grid>
                                                </Grid>
      
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    flexDirection: { xs: 'column', sm: 'row' }, 
                                                    gap: 2, 
                                                    mt: 2 
                                                }}>
                                                    <Button 
                                                        type='submit' 
                                                        variant="contained" 
                                                        color="primary"
                                                        fullWidth={window.innerWidth < 600}
                                                    >
                                                        {id == '' ? 'Add' : 'Update'}
                                                    </Button>
                                                   
                                                </Box>
                                            </form>
                                        </Grid>
                                    </Grid>
                                </motion.div>
                            )}
      
      {fill.travel && (
  <motion.div
    initial={{ opacity: 0, x: '-30%' }}
    animate={{ opacity: 1, x: '0%' }}
    transition={{ duration: 0.1 }}
    style={{ position: 'relative' }}
  >
    <Grid
      container
      spacing={{ xs: 1, sm: 2 }}
      component={Paper}
      sx={{
        ml: 0,
        my: 1,
        p: { xs: 1, sm: 2 },
      }}
    >
      {/* ===== INITIAL PICKUP & FINAL DROPOFF ===== */}
      <Grid item xs={12}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  colSpan={2}
                  sx={{ border: '1px solid #000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Initial Pick Up
                </TableCell>
                <TableCell
                  align="center"
                  colSpan={2}
                  sx={{ border: '1px solid #000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Final Drop Off
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {travelRef?.pickupDateTime
                    ? `${travelRef.pickupDateTime.split('T')[0]}, ${
                        travelRef.pickupDateTime.split('T')[1]?.split('.')[0]
                      }`
                    : '-'}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {travelRef?.pickupLocation || '-'}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {travelRef?.dropOffDateTime
                    ? `${travelRef.dropOffDateTime.split('T')[0]}, ${
                        travelRef.dropOffDateTime.split('T')[1]?.split('.')[0]
                      }`
                    : '-'}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ border: '1px solid #000', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {travelRef?.dropOffLocation || '-'}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* ===== TRAVEL PLAN SECTION ===== */}
      <Grid item xs={12} sx={{ overflow: 'auto' }}>
        <Typography
          variant="h5"
          sx={{
            fontSize: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
            mb: 3,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <TimeToLeaveIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
          Travelling Plan
        </Typography>

        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
          <Table>
            <TableBody>
              {travelPlan?.length > 0 ? (
                travelPlan.map((row, index) => (
                  <TravelRow
                    key={row.ind_id || index}
                    row={row}
                    index={index}
                    formiktwo={formiktwo}
                    setState={setState}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <Hotel sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No travel plans yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Start filling data to see your travel plan
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      {/* ===== FORM SECTION ===== */}
      <Divider sx={{ my: 3 }} />
      <Grid item xs={12} sx={{ backgroundColor: 'white', p: 2, ml: 2 }}>
        <form onSubmit={formiktwo.handleSubmit}>
          <Grid container spacing={3}>
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

            {[
              ['pickupDateTime', 'Pickup Date', 'datetime-local'],
              ['pickupLocation', 'Pickup Location'],
              ['dropOffDateTime', 'Drop Date', 'datetime-local'],
              ['dropOffLocation', 'Drop Location'],
              ['driverName', 'Driver Name'],
              ['vehicleNo', 'Vehicle No.'],
              ['vehicleType', 'Vehicle Type'],
              ['driverContact', 'Driver Contact'],
              ['bookedBy', 'Booked By'],
              ['bookedFor', 'Booked For'],
            ].map(([id, label, type = 'text']) => (
              <Grid item xs={6} key={id}>
                <TextField
                  fullWidth
                  id={id}
                  name={id}
                  label={label}
                  type={type}
                  value={formiktwo.values[id]}
                  onChange={formiktwo.handleChange}
                  error={formiktwo.touched[id] && Boolean(formiktwo.errors[id])}
                  helperText={formiktwo.touched[id] && formiktwo.errors[id]}
                  InputProps={{
                    inputProps:
                      type === "datetime-local"
                        ? {
                            min: new Date().toISOString().slice(0, 16), // ⛔ disable past
                          }
                        : {},
                  }}
                />
              </Grid>
            ))}

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
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ my: 2 }}
          >
            {id === '' ? 'Add' : 'Update'}
          </Button>
        </form>
      </Grid>
    </Grid>
  </motion.div>
)}

      
                              </Grid>
                          </Grid>
      
                      </Container>
                  </Box>
      
              </>
      
          );

}

export default IndividualRegistrations