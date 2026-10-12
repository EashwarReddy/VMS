import { ArrowForwardIos, PeopleOutlineRounded, Refresh } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Alert, Button,Card,CardContent,Divider, Chip, Container, Grid, Link, Modal, Snackbar, Stack, useTheme,useMediaQuery,TablePagination,  CircularProgress, } from "@mui/material";
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
import { blue, indigo } from "@mui/material/colors";
import Head from "next/head";
import React, { useEffect, useState } from 'react';
import axios from 'src/api/axios';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
// import { useRouter } from "next/navigation";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from "@mui/material";
import jwt from "jsonwebtoken";
import { API, Frontend_API } from 'src/api';
// import { useRouter } from 'next/router';
import axiostrack from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import CloseIcon from '@mui/icons-material/Close';
import { NoDataIcon } from '@mui/icons-material';
import { Roles } from 'src/components/roles';
import { useRegister } from 'src/contexts/registerContext';
import { id } from 'date-fns/locale';
import { useRouter } from "next/router";
const status = {
  'PrePlanned': "lightgray",
  'Planned': "info.main",
  'Pending': 'warning.main',
  'Completed': 'success.main',
  'Approved': "success.main",
  'Cancelled': 'error.main'
}
function createData(pnr, firstName, lastName, email, purpose, arrivalDateTime, departureDateTime, gender, age, officeemail, employee, departmentName, phoneNumber, state, district, address, pincode, visitstatus, draft, secondaryVisitors) {

  // console.log(pnr, firstName, lastName, email, purpose, arrivalDateTime, departureDateTime, gender, age, officeemail, employee, departmentName, phoneNumber, state, district, address, pincode, visitstatus)
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
        district,
        address,
        pincode,
        pnr
      },
      // You can add more history entries as needed
    ],
    pnr,
    draft,
    secondaryVisitors
  };
}



const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Mobile Card Component for Visit Details
const MobileVisitCard = ({ dataTravel }) => {
  return (
      <Card sx={{ mb: 2, mx: 1 }}>
          <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                  Visit Information
              </Typography>
              <Stack spacing={2}>
                  <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: '100px' }}>
                          First Name:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                          {dataTravel.visitorfirstname}
                      </Typography>
                  </Stack>
                  
                  <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: '100px' }}>
                          Last Name:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                          {dataTravel.visitorlastname}
                      </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: '100px' }}>
                          Purpose:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                          {dataTravel.purpose}
                      </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: '100px' }}>
                          Visit Start:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                          {dataTravel.visitstart}
                      </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" color="textSecondary" sx={{ minWidth: '100px' }}>
                          Visit End:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                          {dataTravel.visitend}
                      </Typography>
                  </Stack>
              </Stack>
          </CardContent>
      </Card>
  );
};

// Mobile Accommodation Card Component
const MobileAccommodationCard = ({ accommodation, index }) => {
  const [open, setOpen] = useState(false);

  return (
      <Card key={index} sx={{ mb: 2, mx: 1 }}>
          <CardContent>
              <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="primary">
                          {accommodation.accomodationname}
                      </Typography>
                      <IconButton size="small" onClick={() => setOpen(!open)}>
                          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                  </Stack>

                  <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="textSecondary" sx={{ minWidth: '90px' }}>
                              Address:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                              {accommodation.accomodationaddress}
                          </Typography>
                      </Stack>
                      
                      <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="textSecondary" sx={{ minWidth: '90px' }}>
                              Check-In:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                              {accommodation.checkindateandtime}
                          </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="textSecondary" sx={{ minWidth: '90px' }}>
                              Check-Out:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                              {accommodation.checkoutdateandtime}
                          </Typography>
                      </Stack>
                  </Stack>

                  <Collapse in={open} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 2, p: 2, backgroundColor: indigo[50], borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                              Additional Details
                          </Typography>
                          <Stack spacing={1}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: '80px' }}>
                                      Contact:
                                  </Typography>
                                  <Typography variant="body2">
                                      {accommodation.accomodationcontact}
                                  </Typography>
                              </Stack>
                              
                              <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: '80px' }}>
                                      Booked By:
                                  </Typography>
                                  <Typography variant="body2">
                                      {accommodation.bookedby}
                                  </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: '80px' }}>
                                      Booked For:
                                  </Typography>
                                  <Typography variant="body2">
                                      {accommodation.bookedfor}
                                  </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: '80px' }}>
                                      Remarks:
                                  </Typography>
                                  <Typography variant="body2">
                                      {accommodation.remarks}
                                  </Typography>
                              </Stack>
                          </Stack>
                      </Box>
                  </Collapse>
              </Stack>
          </CardContent>
      </Card>
  );
};

// Mobile Conveyance Card Component
const MobileConveyanceCard = ({ conveyance, index }) => {
  const [open, setOpen] = useState(false);

  return (
      <Card key={index} sx={{ mb: 2, mx: 1 }}>
          <CardContent>
              <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" color="primary">
                          Transport #{index + 1}
                      </Typography>
                      <IconButton size="small" onClick={() => setOpen(!open)}>
                          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                      </IconButton>
                  </Stack>

                  <Stack spacing={1}>
                      <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="textSecondary" sx={{ minWidth: '100px' }}>
                              Pickup Time:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                              {conveyance.pickupdateandtime}
                          </Typography>
                      </Stack>
                      
                      <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="textSecondary" sx={{ minWidth: '100px' }}>
                              Pickup Location:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                              {conveyance.pickuplocation}
                          </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="textSecondary" sx={{ minWidth: '100px' }}>
                              Dropoff Time:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                              {conveyance.dropoffdateandtime}
                          </Typography>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="textSecondary" sx={{ minWidth: '100px' }}>
                              Dropoff Location:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                              {conveyance.dropofflocation}
                          </Typography>
                      </Stack>
                  </Stack>

                  <Collapse in={open} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 2, p: 2, backgroundColor: indigo[50], borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                              Vehicle Details
                          </Typography>
                          <Stack spacing={1}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: '90px' }}>
                                      Booked For:
                                  </Typography>
                                  <Typography variant="body2">
                                      {conveyance.bookedfor}
                                  </Typography>
                              </Stack>
                              
                              <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: '90px' }}>
                                      Driver Contact:
                                  </Typography>
                                  <Typography variant="body2">
                                      {conveyance.drivercontact}
                                  </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: '90px' }}>
                                      Vehicle No:
                                  </Typography>
                                  <Typography variant="body2">
                                      {conveyance.vehicleno}
                                  </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: '90px' }}>
                                      Vehicle Type:
                                  </Typography>
                                  <Typography variant="body2">
                                      {conveyance.vehicletype}
                                  </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: '90px' }}>
                                      Booked By:
                                  </Typography>
                                  <Typography variant="body2">
                                      {conveyance.bookedby}
                                  </Typography>
                              </Stack>

                              <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="caption" color="textSecondary" sx={{ minWidth: '90px' }}>
                                      Remarks:
                                  </Typography>
                                  <Typography variant="body2">
                                      {conveyance.remarks}
                                  </Typography>
                              </Stack>
                          </Stack>
                      </Box>
                  </Collapse>
              </Stack>
          </CardContent>
      </Card>
  );
};

// Desktop Table Row Components
const DesktopAccommodationRow = ({ row, index, open, setOpen }) => {
  return (
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
  );
};

const DesktopConveyanceRow = ({ row, index, open1, setOpen1 }) => {
  return (
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
  );
};

const TrackVisitModal = ({ open, onClose, pnr }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dataTravel, setTravelData] = useState(null);
  const [dataAcc, setAccData] = useState([]);
  const [dataCon, setConData] = useState([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsOpen1, setDetailsOpen1] = useState(false);
  const auth = useAuth();
  const token=auth?.user?.accessToken

  // Fetch data when modal opens
  useEffect(() => {
    if (open && pnr) {
      fetchVisitData();
    }
  }, [open, pnr]);

  const fetchVisitData = async () => {
    try {
      setLoading(true);
      setError('');
      
      
      if (!token) {
        setError('Access denied. Invalid or missing token.');
        return;
      }

      const response = await axios.get(
        `${API}/checkdetails/ind-details/${pnr}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      setTravelData(data);
      setAccData(
        data.accommodationDetails?.map((d) => d.accomodationdetails).flat() || []
      );
      setConData(
        data.conveyanceDetails?.map((d) => d.conveyancedetails).flat() || []
      );
    } catch (err) {
      console.error('Error fetching visit details:', err);
      setError('Failed to load visit details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          minHeight: isMobile ? '100vh' : '80vh',
          maxHeight: isMobile ? '100vh' : '90vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        backgroundColor: indigo[50],
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          Track Visit Status - PNR: {pnr}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 1, sm: 2 }, backgroundColor: indigo[50] }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : dataTravel ? (
          <Box>
            {/* Header with Logo */}
            <Box sx={{ backgroundColor: 'white', borderRadius: 2, p: 2, mb: 2 }}>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                justifyContent="center" 
                alignItems="center" 
                spacing={2}
              >
                <img 
                  src='/assets/800px-CDAC_LOGO_crop.png' 
                  style={{ height: isMobile ? 40 : 60 }} 
                  alt="CDAC Logo" 
                />
                <Typography variant={isMobile ? "h6" : "h5"} align="center">
                  Visit Details
                </Typography>
              </Stack>
            </Box>

            {/* Visit Details Section */}
            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom sx={{ mt: 2 }}>
              Visitor Information
            </Typography>
            
            {isMobile ? (
              <MobileVisitCard dataTravel={dataTravel} />
            ) : (
              <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>First Name</TableCell>
                      <TableCell>Last Name</TableCell>
                      <TableCell>Purpose</TableCell>
                      <TableCell>Visit Start</TableCell>
                      <TableCell>Visit End</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>{dataTravel.visitorfirstname}</TableCell>
                      <TableCell>{dataTravel.visitorlastname}</TableCell>
                      <TableCell>{dataTravel.purpose}</TableCell>
                      <TableCell>{dataTravel.visitstart}</TableCell>
                      <TableCell>{dataTravel.visitend}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Accommodation Details */}
            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
              Accommodation Details
            </Typography>
            
            {dataAcc.length === 0 ? (
              <Typography variant="body2" align="center" sx={{ py: 2 }}>
                No accommodation records found.
              </Typography>
            ) : (
              <>
                {isMobile ? (
                  <Box>
                    {dataAcc.map((row, index) => (
                      <MobileAccommodationCard key={index} accommodation={row} index={index} />
                    ))}
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell>Name</TableCell>
                          <TableCell>Address</TableCell>
                          <TableCell>Check-In</TableCell>
                          <TableCell>Check-Out</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataAcc.map((row, index) => (
                          <DesktopAccommodationRow 
                            key={index} 
                            row={row} 
                            index={index} 
                            open={detailsOpen} 
                            setOpen={setDetailsOpen} 
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Conveyance Details */}
            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>
              Conveyance Details
            </Typography>
            
            {dataCon.length === 0 ? (
              <Typography variant="body2" align="center" sx={{ py: 2 }}>
                No conveyance records found.
              </Typography>
            ) : (
              <>
                {isMobile ? (
                  <Box>
                    {dataCon.map((row, index) => (
                      <MobileConveyanceCard key={index} conveyance={row} index={index} />
                    ))}
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell />
                          <TableCell>Pickup Time</TableCell>
                          <TableCell>Pickup Location</TableCell>
                          <TableCell>Dropoff Time</TableCell>
                          <TableCell>Dropoff Location</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dataCon.map((row, index) => (
                          <DesktopConveyanceRow 
                            key={index} 
                            row={row} 
                            index={index} 
                            open1={detailsOpen1} 
                            setOpen1={setDetailsOpen1} 
                          />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            )}
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};


// Mobile Card Component for better mobile experience
const MobileVisitorCard = ({ row, value, handleApprove, handleCancel, setModal, setsecondaryVisitors }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const register = useRegister();

  let token = '', visitorinfo = {}, secretKey = '', options = {};
  
  if (value == 0) {
    visitorinfo = {
      pnr: row.pnr,
      type: "Individual"
    };
    secretKey = 'trackdetails';
    options = {
      expiresIn: '1d',
      algorithm: "HS256",
    };
    token = jwt.sign({ visitorinfo }, secretKey, options);
  }

  // Open modal instead of navigating
  const handleClick = () => {
    sessionStorage.setItem("visitToken", token);
    setTrackModalOpen(true);
  };

  const handleContinueClick = () => {
    register.newRegister(row['pnr'], value);
    router.push(`/standard`);
  };
  
  return (
    <>
      <Card sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" component="div">
              PNR: {row.pnr}
            </Typography>
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Box>
          
          <Stack spacing={1} mb={2}>
            <Typography variant="body2">
              <strong>Name:</strong> {row.firstName + " " + row.lastName}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {row.email}
            </Typography>
            <Typography variant="body2">
              <strong>Purpose:</strong> {row.purpose}
            </Typography>
            <Typography variant="body2">
              <strong>Arrival:</strong>{" "}
              {new Date(row.arrivalDateTime).toLocaleString(undefined, {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
                timeZone: 'UTC',
              })}
            </Typography>
            <Typography variant="body2">
              <strong>Departure:</strong>{" "}
              {new Date(row.departureDateTime).toLocaleString(undefined, {
                month: "numeric",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
                timeZone: 'UTC',
              })}
            </Typography>
          </Stack>

          <Box display="flex" justifyContent="space-between" mb={2}>
            {!row.draft ? (
              <Chip 
                label={row.visitstatus} 
                sx={{ 
                  backgroundColor: status[row.visitstatus], 
                  p: 1, 
                  fontWeight: 600, 
                  fontSize: "0.8em" 
                }} 
              />
            ) : (
              <Button 
                variant="contained" 
                size="small" 
                onClick={handleContinueClick} 
                endIcon={<ArrowForwardIos />}
              >
                View
              </Button>
            )}
          
            {value == 1 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PeopleOutlineRounded />}
                onClick={() => {
                  setModal(true);
                  setsecondaryVisitors(row.secondaryvisitors);
                }}
              >
                Visitors
              </Button>
            )}
          </Box>

          <Button
            variant="contained"
            size="small"
            sx={{ backgroundColor: "error.main", flex: 1, mr: 1 }}
            onClick={() => handleCancel(row)}
            disabled={["Cancelled", "Completed", "Failed"].includes(row.visitstatus)}
          >
            Cancel
          </Button>

          <Button 
            variant="outlined" 
            size="small"
            onClick={handleClick}
          >
            <FontAwesomeIcon icon={faLink} style={{ marginRight: 8 }} />
            Track
          </Button>
          
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Additional Details
            </Typography>
            <Stack spacing={1}>
              {row.history.map((historyRow, index) => (
                <Box key={index}>
                  <Typography variant="body2">
                    <strong>Gender:</strong> {historyRow.gender}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Age:</strong> {historyRow.age}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Office Email:</strong> {historyRow.officeemail}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {historyRow.phoneNumber}
                  </Typography>
                  <Typography variant="body2">
                    <strong>State:</strong> {historyRow.state}
                  </Typography>
                  <Typography variant="body2">
                    <strong>District:</strong> {historyRow.district}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Address:</strong> {historyRow.address}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Pin Code:</strong> {historyRow.pincode}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Collapse>
        </CardContent>
      </Card>

      {/* Track Visit Modal */}
      <TrackVisitModal 
        open={trackModalOpen} 
        onClose={() => setTrackModalOpen(false)} 
        pnr={row.pnr}
      />
    </>
  );
};

const Page = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // You can adjust the number of rows per page
  const auth = useAuth()
  const router = useRouter()
  const [modal, setModal] = useState(false);
  const [stateD, setStateD] = useState({});
  
const [secondaryVisitors, setsecondaryVisitors] = useState([{}])

  const { pnr } = router.query || {};
  const { type, visitors } = router.query || {};

  const [refresh, setRefresh] = useState(false)
  const [state, setState] = useState({})
  const [value, setValue] = React.useState(0);
  // const [value, setValue] = React.useState(0);
  const [pnrData, setPNRData] = useState(null)
  const [qrData, setQRData] = useState('');
  const [dummy, setDummy] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const headers = Object.keys(secondaryVisitors[0]).filter(item => item !== '_id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = pnr[1]; // Replace with your actual token
        console.log("token:::from useEffect", token);
        const orgResponse = await axiostrack.get(`${API}/checkdetails/org-details/${pnr[0]}`, {
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
        return `${API}/checkdetails/org-details/${pnr[0]}`



      } catch (error) {
        console.error('Error fetching data:', error);
        // setStatusFromServer(false)
      }
    };

    const fetchData1 = async () => {
      try {
        const token = pnr[1]; // Replace with your actual token
        console.log("token:::from useEffect", token);
        const indResponse = await axiostrack.get(`${API}/checkdetails/ind-details/${pnr[0]}`, {
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
        return `${API}/checkdetails/ind-details/${pnr[0]}`

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
  }, [type, pnr, auth?.user?.roles]);

  const handleCancel = async (row) => {
    setStateD((prev) => {
      return { ...prev, openCancel: true, openApprove: false };
    });
    setPNRData(row);
  };
  
  const onClose = ()=>{
    setModal(false)
    setsecondaryVisitors([{}])
  }

  function Row({ row, index, value }) {
    const [open, setOpen] = React.useState(false);
    const router = useRouter()
    const [stateD, setStateD] = useState({})
    const [pnrData, setPNRData] = useState(null)
    const [state, setState] = useState({})
    const [dummy, setDummy] = useState(false)
    // const router = useRouter();
    const { pnr } = router.query || {};
    
    const { type, visitors } = router.query || {};
    const [dataTravel, setTravelData] = useState([]);
    const [dataAcc, setAccData] = useState([]);
    const [dataCon, setConData] = useState([]);
    const [decodedData, setDecodedData] = useState([])
    const [trackModalOpen, setTrackModalOpen] = useState(false);
  const register = useRegister()
  
    const handleApprove = async (row) => {
      console.log('Row data', row)
      setStateD((prev) => { return { ...prev, openApprove: true, openCancel: false } })
      setPNRData(row)
    }
    const handleCancel = async (row) => {
      setStateD((prev) => { return { ...prev, openCancel: true, openApprove: false } })
      setPNRData(row)
  
  
    }
    const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      setState((prev) => { return { ...prev, open: false } })
      setStateD((prev) => { return { ...prev, openApprove: false, openCancel: false } })
      // setOpen(false);
    }
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
  
          // const headers = {
          //   'Authorization': `Bearer ${token}`,
          //   // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
          // };

          const headers= {
            Authorization: `Bearer ${auth?.user?.accessToken}`
          }

          let backendEndpoint
          if (value == 0) {
            backendEndpoint = `${API}/handleVisits/cancelIndVisit/${pnrData.pnr}`;
          } else if (value == 1) {
            backendEndpoint = `${API}/handleVisits/cancelOrgVisit/${pnrData.pnr}`;
          }
  
          console.log("sendDataToBackend::", modifiedData);
  
          // Make a PUT request to the backend with headers
          const response = await axios.put(backendEndpoint, modifiedData, { headers });
          setState({ severity: 'success', message: 'Submitted Successfully', open: true })
  
          console.log("response after update::", response.data);
          handleClose()
  
  
        }
  
      } catch (error) {
        console.error('Error sending data to backend:', error);
        setState({ severity: 'error', message: error.response.errors[0], open: true })
      }
    };
    const handleCancelConfirm = async () => {
      let PNRType = ''
      if (value == 0) {
        pnrData.type = 'Individual'
        PNRType = 'Individual'
      } else if (value == 1) {
        pnrData.type = 'Organization'
        PNRType = "Organization"
      }
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
          // Handle the response from the API if needed
          // setIsApproveSubmitted(false);
  
          setDummy(!dummy)
  
  
        })
        .catch(error => {
          console.error("Error sending data to backend:", error);
        });
    }
    const handleContinueClick = () => {
      // const utcDateTime = "2024-08-28T12:00:00Z"; // Example UTC date-time string
      register.newRegister(row['pnr'],value);
      router.push(`/standard`);
  };
  
  
  
    const generateTrackingLink = (pnr) => {
      // Logic to generate the tracking link based on the PNR
      // Replace this with your actual logic to generate the tracking link
      // return `https://10.244.3.101:8000/api/v1/checkdetails/org-details/${pnr[0]}`;
  
  
  
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
    };
  
    // Payload to be included in the token
    let token = '', visitorinfo = {}, secretKey = '', options = {}
    if (value == 0) {
  
      visitorinfo = {
        pnr: row.pnr,
        type: "Individual"
  
        // username: 'exampleuser'
      };
  
      // Secret key used to sign the token
      secretKey = 'trackdetails';
  
      // Options for token generation (optional)
      options = {
        expiresIn: '1d',// Token expires in 1 hour
        algorithm: "HS256",
      };
  
      // Generate the JWT token
      token = jwt.sign({ visitorinfo }, secretKey, options);
    } else if (value == 1) {
      visitorinfo = {
        pnr: row.pnr,
        type: "Organization"
  
        // username: 'exampleuser'
      };
  
      // Secret key used to sign the token
      secretKey = 'trackdetails';
  
      // Options for token generation (optional)
      options = {
        expiresIn: '1d',// Token expires in 1 hour
        algorithm: "HS256",
      };
  
      // Generate the JWT token
      token = jwt.sign({ visitorinfo }, secretKey, options);
  
    }

    const handleClick = () => {
      sessionStorage.setItem("visitToken", token);
      setTrackModalOpen(true);
    };
  
  
    // console.log('Generated token:', token);
  
    return (
      <React.Fragment key={index}>
        {/* ... your existing code for displaying the basic information */}
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
  
          <TableCell component="th" scope="row">
            {row.pnr}
          </TableCell>
          <TableCell align="center">{row.firstName + ' ' + row.lastName}</TableCell>
          <TableCell align="center">{row.email}</TableCell>
          <TableCell align="center">{row.purpose}</TableCell>
          <TableCell align="center">{new Date(row.arrivalDateTime).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>
          <TableCell align="center">{new Date(row.departureDateTime).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone : 'UTC' })}</TableCell>
        
          {!row.draft && <TableCell align='right'>
  
            <Chip label={row.visitstatus} sx={{ backgroundColor: status[row.visitstatus], p: 2, fontWeight: 600, fontSize: '1em' }} />
          </TableCell>}
          {row.draft && <TableCell align='right'>
            <Button variant='contained' onClick={handleContinueClick}
              endIcon={<ArrowForwardIos />}>Continue</Button>
          </TableCell>}
  
  
          {/* <TableCell>
                          <Stack direction={'column'} spacing={2}>
                            
                              <Button variant='contained' size='small' sx={{ backgroundColor: 'error.main' }}
                                  disabled={row.visitstatus == "Cancelled"}
                                  onClick={() => handleCancel(row)}
                              >Cancel</Button>
                          </Stack>
  
                      </TableCell> */}
                        {value == 1 && (
                                  <TableCell align="right">
                                    <Button variant="contained" startIcon={<PeopleOutlineRounded />}
                                    onClick={()=>{
                                      console.log('row', row)
                                      setModal(true);
                                      setsecondaryVisitors(row.secondaryVisitors)
                                    }}
                                    >
                                    
                                    </Button>
                                  </TableCell>
                                )}
          <TableCell>
            {row.status === 'continue' ? (
              <Button
                variant='contained'
                onClick={handleContinueClick}
                endIcon={<ArrowForwardIos />}
              >
                Continue
              </Button>
            ) : (
              <Button variant='contained' size='small' sx={{ backgroundColor: 'error.main' }}
              disabled={["Cancelled","Completed", "Failed"].includes(row.visitstatus)}
                onClick={() => handleCancel(row)}
              >Cancel</Button>
            )}
          </TableCell>
          {/* <TableCell align='center'>
            <Link href={`${Frontend_API}/trackVisit/${row.pnr}/${token}`}><FontAwesomeIcon icon={faLink} /></Link>
          </TableCell> */}
          <Button onClick={handleClick}>
      <FontAwesomeIcon icon={faLink} />
    </Button>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={12}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1, backgroundColor: indigo[100], p: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Other Details
                </Typography>
                <Box sx={{ overflowX: 'auto', width: '100%' }}>
                    <Table size="small" aria-label="purchases" sx={{ minWidth: '100%' }}>
                  <TableHead>
                    {/* ... your existing code for the table header */}
                    <TableRow>
                      <TableCell>Gender</TableCell>
                      {/* <TableCell>Age</TableCell> */}
                      <TableCell align="right">Office Email</TableCell>
                      <TableCell align="right">Employee</TableCell>
                      <TableCell>Department Name</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell align="right">State</TableCell>
                      <TableCell align="right">District</TableCell>
                      <TableCell align="right">Address</TableCell>
                      <TableCell align="right">Pin Code</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.history.map((historyRow) => (
                      <TableRow key={historyRow.date}>
                        {/* Display the additional history details */}
                        <TableCell>{historyRow.gender}</TableCell>
                        {/* <TableCell>{historyRow.age}</TableCell> */}
                        <TableCell align="right">{historyRow.officeemail}</TableCell>
                        <TableCell align="right">{historyRow.employee}</TableCell>
                        <TableCell>{historyRow.departmentName}</TableCell>
                        <TableCell>{historyRow.phoneNumber}</TableCell>
                        <TableCell align="right">{historyRow.state}</TableCell>
                        <TableCell align="right">{historyRow.district}</TableCell>
                        <TableCell align="right">{historyRow.address}</TableCell>
                        <TableCell align="right">{historyRow.pincode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
          {/* Track Visit Modal */}
          <TrackVisitModal 
          open={trackModalOpen} 
          onClose={() => setTrackModalOpen(false)} 
          pnr={row.pnr}
        />
        <React.Fragment>
          <Dialog
            open={stateD.openCancel}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
            fullScreen={isMobile}
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
      </React.Fragment>
    );
  }
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleChangePage = (event, newPage) => {
    console.log("event.target.value::", event.target.value)
    console.log("newPage value::", newPage)
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    console.log("event.target.value::", event.target.value)
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const slicedData = data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    const fetchData = async () => {

      try {
        let response
        if (value == 0) {
          response = await axios.get(`/visit/visitindividual/email?email=${auth?.user?.email}`, {
            headers: {
              Authorization: `Bearer ${auth?.user?.accessToken}`
            }
          });
        } else if (value == 1) {
          response = await axios.get(`/orgvisit/visitorganization/email?email=${auth?.user?.email}`, {
            headers: {
              Authorization: `Bearer ${auth?.user?.accessToken}`
            }
          });
        }

        console.log('response', response)
        setState({ severity: 'success', message: 'Fetched Successfully', open: true })
        if (response.data && response.data.data.length > 0) {

          setData(response.data.data.map((visitor) => createData(
            visitor.pnr,
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
            visitor.visitstatus,
            visitor.draft,
            visitor.secondaryvisitors
          )).reverse()
        );
        } else {
          console.log('No data');
          setState({ severity: 'warning', message: 'No Data', open: true })
          setData([])
        }
      } catch (error) {
        setState({ severity: 'error', message: 'Error Fetching, try refreshing', open: true })
        console.error('Error fetching data:', error.message);
        setData([])
      }
    };
    fetchData();
    console.log(state)
  }, [refresh, value, dummy, auth?.user?.roles]);

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

        // const headers = {
        //   'Authorization': `Bearer ${token}`,
        //   // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
        // };

        const headers= {
          Authorization: `Bearer ${auth?.user?.accessToken}`
        }
        let backendEndpoint
        if (value == 0) {
          backendEndpoint = `${API}/handleVisits/CancelIndVisit/${pnrData.pnr}`;
        } else if (value == 1) {
          backendEndpoint = `${API}/handleVisits/CancelOrgVisit/${pnrData.pnr}`;
        }

        console.log("sendDataToBackend::", modifiedData);

        // Make a PUT request to the backend with headers
        const response = await axios.put(backendEndpoint, modifiedData, { headers });
        console.log("response after update::", response.data);
        handleClose()
        setState({ severity: 'success', message: 'Submitted Successfully', open: true })


      }

    } catch (error) {
      console.error('Error sending data to backend:', error);
      setState({ severity: 'error', message: error.response.errors[0], open: true })
    }
  };
  const handleCancelConfirm = async () => {
    let PNRType = ''
    if (value == 0) {
      pnrData.type = 'Individual'
      PNRType = 'Individual'
    } else if (value == 1) {
      pnrData.type = 'Organization'
      PNRType = "Organization"
    }
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
        // Handle the response from the API if needed
        // setIsApproveSubmitted(false);
        setDummy(!dummy)

      })
      .catch(error => {
        console.error("Error sending data to backend:", error);
      });
  }
  const slicedData = data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setState((prev) => {
      return { ...prev, open: false };
    });
    setStateD((prev) => {
      return { ...prev, openApprove: false, openCancel: false };
    });
  };

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;



    // console.log('Row', row)
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
 
  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  if (auth?.user?.roles === Roles["Host"] || auth?.user?.roles === Roles["Visitor"]) {
    return (
      <>
        <Head>
          <title>Visitor Details</title>
        </Head>
        <Snackbar open={state.open} autoHideDuration={2000} onClose={handleClose} anchorOrigin={{ vertical, horizontal }}>
          <Alert
            onClose={handleClose}
            severity={state.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {state.message}
          </Alert>
        </Snackbar>
        <Modal open={modal} onClose={onClose}>
      <Box
         sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: isMobile ? "95vw" : isTablet ? "85vw" : "80vw",
          maxWidth: isMobile ? "none" : 900,
          height: isMobile ? "90vh" : "80vh",
          maxHeight: isMobile ? "none" : 600,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: isMobile ? 2 : 4,
          borderRadius: 2,
          overflow: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          Visitor Details
        </Typography>
        <Box sx={{ overflowX: 'auto' }}>
              <TableContainer component={Paper}>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            fontWeight: "bold",
                            textTransform: "capitalize",
                            fontSize: isMobile ? "0.75rem" : "0.875rem",
                            padding: isMobile ? "8px 4px" : "16px",
                          }}
                        >
                          {header.replace("visitor", "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {secondaryVisitors.map((visitor, index) => (
                      <TableRow key={index}>
                        {headers.map((key) => (
                          <TableCell
                            key={key}
                            sx={{
                              fontSize: isMobile ? "0.75rem" : "0.875rem",
                              padding: isMobile ? "8px 4px" : "16px",
                            }}
                          >
                            {visitor[key] || "N/A"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
        <Box textAlign="right" mt={2}>
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  
        <React.Fragment>
          <Dialog
            open={stateD.openCancel}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
            fullScreen={isMobile}
          >
            <DialogTitle>{"Cancel the Meeting?"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description">
                By Cancelling, You&apos;re cancelling the visit.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelConfirm}>Proceed</Button>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        </React.Fragment>


    <Box
          sx={{
            flexGrow: 1,
            py: isMobile ? 2 : 4,
          }}
        >
          <Container maxWidth={false} sx={{ px: isMobile ? 1 : 3 }}>
          <Grid container justifyContent="center">
              <Grid
                item
                xs={12}
                component={Paper}
                sx={{ p: isMobile ? 1 : 2, background: indigo[50] }}
              >
                <Stack direction={'row'} display={'flex'} spacing={2} justifyContent={'center'} alignItems={'center'} m={1}>
                  <Typography variant="h4" align="center" gutterBottom>
                    Visitor Details
                  </Typography>
                  {/* <Button size='small' variant='contained' startIcon={<Refresh />} onClick={() => setRefresh(!refresh)}>Refresh</Button> */}
                </Stack>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', backgroundColor: 'white' }}>
                  <Tabs
                      value={value}
                      onChange={handleChange}
                      aria-label="basic tabs example"
                      variant={isMobile ? "fullWidth" : "standard"}
                    >
                      <Tab
                        sx={{
                          backgroundColor: value == 0 ? indigo[50] : "",
                          mx: isMobile ? 0 : 1,
                          px: 1,
                          fontSize: isMobile ? "0.8rem" : "1rem",
                        }}
                        label="Individual"
                        {...a11yProps(0)}
                      />
                    </Tabs>
                  </Box>
                  <CustomTabPanel value={value} index={0}>
                  {isMobile ? (
                      // Mobile Card View
                      <Box>
                        {slicedData.map((row, index) => (
                          <MobileVisitorCard
                            key={index}
                            row={row}
                            value={value}
                            //handleApprove={handleApprove}
                            handleCancel={handleCancel}
                            setModal={setModal}
                            setsecondaryVisitors={setsecondaryVisitors}
                          />
                        ))}
                        {slicedData.length === 0 && (
                          <Box sx={{ textAlign: "center", mt: 4 }}>
                            <Typography
                              variant="h6"
                              color="textSecondary"
                              align="center"
                              mt={2}
                            >
                              No Data Available
                            </Typography>
                          </Box>
                        )}
                         <TablePagination
                                                    rowsPerPageOptions={[5, 10, 25]}
                                                    component="div"
                                                    count={data.length}
                                                    rowsPerPage={rowsPerPage}
                                                    page={page}
                                                    onPageChange={handleChangePage}
                                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                                />
                      </Box>
                    ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <TableContainer component={Paper}>
                      <Table aria-label="collapsible table">
                        <TableHead>
                          <TableRow>
                            <TableCell />
                            <TableCell align='center'>PNR</TableCell>
                            <TableCell align='center'>Name</TableCell>
                            <TableCell align="center">Email</TableCell>
                            <TableCell align="center">Purpose</TableCell>

                            <TableCell align="center">Arrival Data</TableCell>
                            <TableCell align="center">Departure Date</TableCell>
                            <TableCell align='center'>Status</TableCell>
                            <TableCell align='center'>Action</TableCell>
                            <TableCell align='center'>TrackLink</TableCell>

                            <TableCell>


                            </TableCell>

                          </TableRow>
                        </TableHead>
                        <TableBody>
                              {slicedData.map((row) => (
                                <Row key={row.name} row={row} value={value} />
                              ))}
                              {slicedData.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={9}>
                                    <Box sx={{ textAlign: "center", mt: 4 }}>
                                      <Typography
                                        variant="h5"
                                        color="textSecondary"
                                        align="center"
                                        mt={2}
                                      >
                                        No Data Available
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 20]} // You can customize the available options
                        component="div"
                        count={data?.length || 0} // Ensure count is set even if data is not available
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                      />
                    </TableContainer>
                    </Box>
                    )}
                  </CustomTabPanel>
                </Box>

              </Grid>
            </Grid>

          </Container>
        </Box>

      </>

    );
  } else {
    return (
      <>
        <h1>Not Authorized</h1>
      </>
    )
  }

};
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
