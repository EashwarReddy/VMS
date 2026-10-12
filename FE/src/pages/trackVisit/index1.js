// Import React and Material-UI components
import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper, 
    Box, 
    Grid, 
    Divider, 
    Stack,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from "@mui/material";
import Collapse from '@mui/material/Collapse';
import { blue, indigo } from "@mui/material/colors";
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from "next/router";
import jwt from "jsonwebtoken";
import axios from 'axios';
import { API } from "src/api";
import { useAuth } from 'src/hooks/use-auth';


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

// Define a functional component for the index page
const Track = () => {
    const router = useRouter();
    const {pnr}  = router.query;
    const auth = useAuth();
    const token=auth?.user?.accessToken
    const { type, visitors } = router.query;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [dataTravel, setTravelData] = useState([]);
    const [dataAcc, setAccData] = useState([]);
    const [dataCon, setConData] = useState([]);
    const [decodedData, setDecodedData] = useState([]);
    const [verified, setVerified] = useState(false);
    const [open, setOpen] = React.useState(false);
    const [open1, setOpen1] = React.useState(false);
    const [state, setState] = useState({
        open: false,
        severity: 'info',
        message: '',
      });

  // ✅ Fetch visit details by PNR
  const fetchData = async () => {
    try {
      if (!pnr || !token) return;
      console.log("Fetching data for PNR:", pnr);

      const indResponse = await axios.get(`${API}/checkdetails/ind-details/${pnr}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = indResponse.data;
      console.log("Individual response:", data);
      setTravelData(data);

      // Extract accommodation and conveyance
      setAccData(
        data.accommodationDetails?.map((d) => d.accomodationdetails).flat() || []
      );
      setConData(
        data.conveyanceDetails?.map((d) => d.conveyancedetails).flat() || []
      );

      setVerified(true);
    } catch (error) {
      console.error('❌ Error fetching visit details:', error);
      setState({
        open: true,
        severity: 'error',
        message: 'Failed to load visit details. Please try again later.',
      });
      setVerified(false);
    }
  };

  useEffect(() => {
    if (pnr && token) {
      fetchData();
    }
  }, [pnr, token]);
  
      
  console.log("Travel data from server::", dataTravel);
  console.log("Acc data from server::", dataAcc);
  console.log("Con data from server::", dataCon);

      
    return (
        <div>
            {true ? (
                <Box
                    sx={{
                        minHeight: '100vh',
                        p: { xs: 1, sm: 2, md: 3 },
                    }}
                >
                    <Grid 
                        container 
                        spacing={2} 
                        component={Paper} 
                        elevation={5} 
                        sx={{ 
                            mx: { xs: 0, sm: 1, md: 3 }, 
                            px: { xs: 1, sm: 2 }, 
                            py: 1, 
                            backgroundColor: indigo[50],
                            maxWidth: '100%'
                        }}
                    >
                        {/* Header */}
                        <Grid item xs={12} sx={{ backgroundColor: 'white', borderRadius: 5, p: 2 }}>
                            <Stack 
                                direction={{ xs: 'column', sm: 'row' }} 
                                display={'flex'} 
                                justifyContent={'center'} 
                                alignItems={'center'} 
                                spacing={2}
                            >
                                <img 
                                    src='/assets/800px-CDAC_LOGO_crop.png' 
                                    style={{ height: isMobile ? 50 : 75 }} 
                                    alt="CDAC Logo" 
                                />
                                <Typography 
                                    variant={isMobile ? "h5" : "h4"} 
                                    align="center"
                                >
                                    Track Visit Status
                                </Typography>
                            </Stack>
                        </Grid>

                        {/* Visit Details Section */}
                        <Grid item xs={12}>
                            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                                Verified Visit Table
                            </Typography>
                            
                            {isMobile ? (
                                <MobileVisitCard dataTravel={dataTravel} />
                            ) : (
                                <TableContainer 
                                    component={Paper} 
                                    sx={{
                                        borderRadius: '0 0 10px 10px',
                                        boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.3)',
                                        borderBottom: `1px solid ${indigo[200]}`,
                                        overflowX: 'auto'
                                    }}
                                >
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>First Name</TableCell>
                                                <TableCell>Last Name</TableCell>
                                                <TableCell>Purpose</TableCell>
                                                <TableCell>Visiting Date</TableCell>
                                                <TableCell>Exiting Date</TableCell>
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

                        {/* Accommodation Details Section */}
                        <Grid item xs={12}>
                            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                                Accommodation Details
                            </Typography>
                            
                            {dataAcc.length === 0 ? (
                                <Typography variant="body1" align="center" sx={{ py: 4 }}>
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
                                        <TableContainer 
                                            component={Paper} 
                                            sx={{
                                                borderRadius: '0 0 10px 10px',
                                                boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.3)',
                                                borderBottom: `1px solid ${indigo[200]}`,
                                                overflowX: 'auto'
                                            }}
                                        >
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
                                                        <DesktopAccommodationRow 
                                                            key={index} 
                                                            row={row} 
                                                            index={index} 
                                                            open={open} 
                                                            setOpen={setOpen} 
                                                        />
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </>
                            )}
                            
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

                        {/* Conveyance Details Section */}
                        <Grid item xs={12}>
                            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom>
                                Conveyance Details
                            </Typography>
                            
                            {dataCon.length === 0 ? (
                                <Typography variant="body1" align="center" sx={{ py: 4 }}>
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
                                        <TableContainer 
                                            component={Paper} 
                                            sx={{
                                                borderRadius: '0 0 10px 10px',
                                                boxShadow: '0px 4px 8px rgba(63, 81, 181, 0.3)',
                                                borderBottom: `1px solid ${indigo[200]}`,
                                                overflowX: 'auto'
                                            }}
                                        >
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
                                                        <DesktopConveyanceRow 
                                                            key={index} 
                                                            row={row} 
                                                            index={index} 
                                                            open1={open1} 
                                                            setOpen1={setOpen1} 
                                                        />
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                </>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            ) : (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100vh"
                    sx={{ p: 2 }}
                >
                    <Box textAlign="center">
                        <Typography 
                            variant={isMobile ? "h5" : "h4"} 
                            color="error" 
                            align="center" 
                            gutterBottom
                        >
                            Error: Invalid Token
                        </Typography>
                        <Typography variant="body1" align="center">
                            Please check your credentials and try again.
                        </Typography>
                    </Box>
                </Box>
            )}
        </div>
    );
};

// Export the component as the default export
export default Track;