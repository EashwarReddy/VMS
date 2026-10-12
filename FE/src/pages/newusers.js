import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import axios, { axiosPrivate } from 'src/api/axios';
import React, { useEffect, useState } from 'react';
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import Head from "next/head";
import { 
  Container, 
  Grid, 
  TextField, 
  Button, 
  Stack, 
  Divider, 
  TablePagination, 
  Chip, 
  Tooltip, 
  Switch,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme,
  Collapse,
  Avatar
} from "@mui/material";
import { blue, indigo, grey } from "@mui/material/colors";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowBack, ArrowRight, Edit, Refresh, RemoveRedEye, ExpandMore, ExpandLess, Person } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Modal from '@mui/material/Modal';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';
import { useAuth } from 'src/hooks/use-auth';
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3, height: '100%' }}>
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

function createData(
  id,
  firstName,
  lastName,
  email,
  purpose,
  age,
  officeemail,
  employee,
  deptName,
  phoneNumber,
  state,
  district,
  address,
  pincode,
  DOB,
  mobileNo,
  organisation,
  referenceEmail,
  isEnabled
) {
    console.log("creating row", {
      id,
      firstName,
      lastName,
      email,
      purpose,
      age,
      officeemail,
      employee,
      deptName,
      phoneNumber,
      state,
      district,
      address,
      pincode,
      DOB,
      mobileNo,
      organisation,
      referenceEmail,
      isEnabled
    })
    return {
      id,
      firstName,
      lastName,
      email,
      purpose,
      age,
      officeemail,
      employee,
      deptName,
      phoneNumber,
      state,
      district,
      address,
      pincode,
      DOB,
      mobileNo,
      organisation,
      referenceEmail,
      isEnabled
    };
}

// Mobile Card Component for better mobile experience
// function UserCard({ row, setEnableModal, setDisableModal, setID, getVisitorDetails, setVOpen, token }) {
//     const [expanded, setExpanded] = useState(false);

//     const handleExpandClick = () => {
//         setExpanded(!expanded);
//     };

//     // Fixed visitor details handler
//     const handleViewDetails = async () => {
//         try {
//             // Set the visitor ID first
//             setID(row.id);
            
//             // Call the function to get visitor details
//             await getVisitorDetails(row.id);
            
//             // Open the modal
//             setVOpen(true);
//         } catch (error) {
//             console.error('Error viewing visitor details:', error);
//         }
//     };

//     return (
//         <Card 
//             sx={{ 
//                 mb: 2, 
//                 boxShadow: 2,
//                 '&:hover': {
//                     boxShadow: 4,
//                     transform: 'translateY(-2px)',
//                     transition: 'all 0.2s ease-in-out'
//                 }
//             }}
//         >
//             <CardContent sx={{ pb: 1 }}>
//                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                     <Avatar sx={{ bgcolor: indigo[500], mr: 2 }}>
//                         <Person />
//                     </Avatar>
//                     <Box sx={{ flexGrow: 1 }}>
//                         <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
//                             {row.firstName} {row.lastName}
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                             {row.email}
//                         </Typography>
//                     </Box>
//                     <Switch 
//                         color="secondary"  
//                         onChange={(e) => {
//                             if(e.target.checked){
//                                 setEnableModal(true);
//                             } else if(!e.target.checked){
//                                 setDisableModal(true);
//                             }
//                             setID(row.id)
//                         }}
//                         checked={row.isEnabled}
//                         size="small"
//                     />
//                 </Box>

//                 <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
//                     <Chip 
//                         label={row.organisation} 
//                         size="small" 
//                         variant="outlined"
//                         sx={{ bgcolor: blue[50] }}
//                     />
//                     <Chip 
//                         label={row.referenceEmail} 
//                         size="small" 
//                         variant="outlined"
//                         sx={{ bgcolor: grey[100] }}
//                     />
//                 </Box>

//                 <Collapse in={expanded} timeout="auto" unmountOnExit>
//                     <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${grey[200]}` }}>
//                         <Grid container spacing={2}>
//                             <Grid item xs={6}>
//                                 <Typography variant="caption" color="text.secondary">
//                                     Phone
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     {row.phoneNumber || 'N/A'}
//                                 </Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography variant="caption" color="text.secondary">
//                                     State
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     {row.state || 'N/A'}
//                                 </Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography variant="caption" color="text.secondary">
//                                     District
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     {row.district || 'N/A'}
//                                 </Typography>
//                             </Grid>
//                             <Grid item xs={6}>
//                                 <Typography variant="caption" color="text.secondary">
//                                     Age
//                                 </Typography>
//                                 <Typography variant="body2">
//                                     {row.age || 'N/A'}
//                                 </Typography>
//                             </Grid>
//                         </Grid>
//                     </Box>
//                 </Collapse>
//             </CardContent>
            
//             <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
//                 <Button
//                     size="small"
//                     onClick={handleExpandClick}
//                     endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
//                     sx={{ color: indigo[600] }}
//                 >
//                     {expanded ? 'Less Info' : 'More Info'}
//                 </Button>
                
//                 <Tooltip title="View Details">
//                     <Button
//                         size="small"
//                         onClick={handleViewDetails} // Fixed: Use proper handler function
//                         sx={{
//                             bgcolor: indigo[50],
//                             color: indigo[600],
//                             '&:hover': {
//                                 bgcolor: indigo[100],
//                                 transform: 'scale(1.1)',
//                             },
//                         }}
//                     >
//                         <RemoveRedEye fontSize="small" />
//                     </Button>
//                 </Tooltip>
//             </CardActions>
//         </Card>
//     );
// }
// Updated UserCard Component with proper modal handling
function UserCard({ row, setEnableModal, setDisableModal, setID, getVisitorDetails, setVOpen, token, visitor, setVisitor }) {
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    // Fixed visitor details handler
    const handleViewDetails = async () => {
        try {
            console.log('Viewing details for user:', row.id);
            
            // Set the visitor ID first
            setID(row.id);
            
            // Call the API to get visitor details
            const response = await axios.get(`/users/${row.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            
            // Set the visitor data
            setVisitor(response.data.data);
            console.log('Got visitor details:', response.data.data);
            
            // Open the modal
            setVOpen(true);
        } catch (error) {
            console.error('Error viewing visitor details:', error);
        }
    };

    return (
        <Card 
            sx={{ 
                mb: 2, 
                boxShadow: 2,
                '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s ease-in-out'
                }
            }}
        >
            <CardContent sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: indigo[500], mr: 2 }}>
                        <Person />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            {row.firstName} {row.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {row.email}
                        </Typography>
                    </Box>
                    <Switch 
                        color="secondary"  
                        onChange={(e) => {
                            if(e.target.checked){
                                setEnableModal(true);
                            } else if(!e.target.checked){
                                setDisableModal(true);
                            }
                            setID(row.id)
                        }}
                        checked={row.isEnabled}
                        size="small"
                    />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    <Chip 
                        label={row.organisation} 
                        size="small" 
                        variant="outlined"
                        sx={{ bgcolor: blue[50] }}
                    />
                    <Chip 
                        label={row.referenceEmail} 
                        size="small" 
                        variant="outlined"
                        sx={{ bgcolor: grey[100] }}
                    />
                </Box>

                <Collapse in={expanded} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${grey[200]}` }}>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Phone
                                </Typography>
                                <Typography variant="body2">
                                    {row.phoneNumber || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    State
                                </Typography>
                                <Typography variant="body2">
                                    {row.state || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    District
                                </Typography>
                                <Typography variant="body2">
                                    {row.district || 'N/A'}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Age
                                </Typography>
                                <Typography variant="body2">
                                    {row.age || 'N/A'}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Collapse>
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Button
                    size="small"
                    onClick={handleExpandClick}
                    endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                    sx={{ color: indigo[600] }}
                >
                    {expanded ? 'Less Info' : 'More Info'}
                </Button>
                
                <Tooltip title="View Details">
                    <Button
                        size="small"
                        onClick={handleViewDetails}
                        sx={{
                            bgcolor: indigo[50],
                            color: indigo[600],
                            '&:hover': {
                                bgcolor: indigo[100],
                                transform: 'scale(1.1)',
                            },
                        }}
                    >
                        <RemoveRedEye fontSize="small" />
                    </Button>
                </Tooltip>
            </CardActions>
        </Card>
    );
}

function Row({ row, setEnableModal, setDisableModal, setID, token }) {
    const [open, setOpen] = React.useState(false);
    const [aOpen, setAOpen] = useState(false);
    const [tOpen, setTOpen] = useState(false);
    const [travelDetails, setTravelDetails] = useState([])
    const [visitor, setVisitor] = useState({})
    const [vOpen, setVOpen] = useState(false)

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: '90%', md: '80%', lg: '70%' },
        maxWidth: 800,
        bgcolor: 'background.paper',
        border: '2px solid #280C58',
        borderRadius: '16px',
        boxShadow: 24,
        p: { xs: 2, sm: 3, md: 4 },
        maxHeight: '90vh',
        overflow: 'auto'
    };
    
    const getVisitorDetails = async (val) => {
        if (true) {
            try {
                const response = await axios.get(`/users/${val}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setVisitor(response.data.data)
                console.log('got details', response.data.data)
            } catch (error) {
                console.log('Error', error)
            }
        }
    }

    const handleViewDetails = (pnr) => {
        if (!vOpen) {
            getVisitorDetails(pnr)
        }
        setVOpen(!vOpen)
    }

    const handleClose = () => setVOpen(false);

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
                            position: 'absolute', 
                            top: { xs: 8, sm: 12 }, 
                            right: { xs: 8, sm: 12 }, 
                            p: 1,
                            backgroundColor: indigo[50],
                            '&:hover': {
                                backgroundColor: indigo[500],
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                        onClick={handleClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} display={'flex'} justifyContent={'center'} sx={{ mb: 2 }}>
                            <Chip 
                                label='User Details' 
                                sx={{ 
                                    backgroundColor: indigo[50],
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    px: 2
                                }} 
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    First Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.firstName}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Last Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.lastName}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Gender
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.gender}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Contact
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.mobileNo}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Email
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                                    {visitor.email}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    State
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.state}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    District
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.district}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Address
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.address}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Organization
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.organisation}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>

            <TableRow sx={{ '& > *': { borderBottom: 'unset' }, backgroundColor: "white" }}>
                <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: indigo[100] }}>
                            <Person fontSize="small" />
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {row.firstName}
                        </Typography>
                    </Box>
                </TableCell>
                <TableCell align="right">
                    <Typography variant="body2">{row.lastName}</Typography>
                </TableCell>
                <TableCell align="right">
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {row.email}
                    </Typography>
                </TableCell>
                <TableCell align="right">
                    <Chip 
                        label={row.organisation} 
                        size="small" 
                        variant="outlined"
                        sx={{ bgcolor: blue[50] }}
                    />
                </TableCell>
                <TableCell align="center">
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {row.referenceEmail}
                    </Typography>
                </TableCell>
                <TableCell align="center">
                    <Tooltip title="View Visitor details">
                        <IconButton
                            onClick={() => {
                                if (!vOpen) {
                                    getVisitorDetails(row.id)
                                }
                                setVOpen(true)
                            }}
                            sx={{
                                bgcolor: indigo[50],
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                    bgcolor: indigo[100]
                                },
                            }}
                        >
                            <RemoveRedEye />
                        </IconButton>
                    </Tooltip>
                </TableCell>
                <TableCell align='center'>
                    <Tooltip title={row.isEnabled ? "Disable User" : "Enable User"}>
                        <Switch 
                            color="secondary"  
                            onChange={(e) => {
                                if(e.target.checked){
                                    setEnableModal(true);
                                } else if(!e.target.checked){
                                    setDisableModal(true);
                                }
                                setID(row.id)
                            }}
                            checked={row.isEnabled}
                        />
                    </Tooltip>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

const Page = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
    
    const [data, setData] = useState([]);
    const [fill, setFill] = useState({ 'travel': false, 'accomodation': false });
    const [accRef, setAccRef] = useState([]);
    const [accPlan, setAccPlan] = useState([]);
    const [travelPlan, setTravelPlan] = useState([]);
    const [PNR, setPNR] = useState('')
    const [id, setId] = useState('')
    const [travelRef, setTravelRef] = useState('')
    const [value, setValue] = React.useState(0);
    const [ID, setID] = useState(null)
    const auth = useAuth();
    const [enableModal, setEnableModal] = useState(null)
    const [disableModal, setDisableModal] = useState(null)
    const [refresh, setRefresh] = useState(false)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [vOpen, setVOpen] = useState(false);
    const [visitor, setVisitor] = useState({}); 

    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const getVisitorDetails = async (val) => {
        try {
            const response = await axios.get(`/users/${val}`, {
                headers: {
                    Authorization: `Bearer ${auth?.user?.accessToken}`
                }
            })
            console.log('got details', response.data.data)
        } catch (error) {
            console.log('Error', error)
        }
    }

     // Add modal close handler
     const handleModalClose = () => {
        setVOpen(false);
        setVisitor({}); // Clear visitor data when closing
    };

    useEffect(() => {
        const fetchData = async () => {
            let response
            try {
                console.log(value, "value")
                
                response = await axios.get(`/users/getAllUsers`, {
                    headers: {
                        Authorization: `Bearer ${auth?.user?.accessToken}`
                    }
                });
              
                console.log('response from users', response)
                if (response.data.data && response.data.data.length > 0) {
                    setData(response.data.data.map((visitor) => createData(
                      visitor._id,
                      visitor.firstName,
                      visitor.lastName,
                      visitor.email,
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
                      visitor.DOB,
                      visitor.mobileNo,
                      visitor.organisation,
                      visitor.referenceEmail,
                      visitor.isEnabled                  
                    )));
                } else {
                    console.log('No data found for the given pincode');
                    setData([])
                }
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };

        fetchData();
    }, [value, enableModal, disableModal, refresh, auth?.user?.accessToken]);

    const sendUserEnable = async() => {
        console.log("sending true")
        try {
            const response = await axios.put(`users/${ID}`, {
                isEnabled: true
            }, {
                headers: {
                    Authorization: `Bearer ${auth?.user?.accessToken}`
                }
            })
            setEnableModal(false);
        } catch (error) {
            console.error('Error enabling user:', error);
        }
    }

    const sendUserDisable = async () => {
        try {
            const response = await axios.put(`users/${ID}`, {
                isEnabled: false
            }, {
                headers: {
                    Authorization: `Bearer ${auth?.user?.accessToken}`
                }
            })
            setDisableModal(false);
        } catch (error) {
            console.error('Error disabling user:', error);
        }
        console.log("sending false")
    }

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 400 },
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: { xs: 3, sm: 4 },
        borderRadius: 2
    };

    return (
        <>
            <Head>
                <title>User Management</title>
            </Head>
            
             {/* Visitor Details Modal - Shared between mobile and desktop */}
             <Modal
                open={vOpen}
                onClose={handleModalClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalStyle}>
                    <IconButton
                        sx={{
                            position: 'absolute', 
                            top: { xs: 8, sm: 12 }, 
                            right: { xs: 8, sm: 12 }, 
                            p: 1,
                            backgroundColor: indigo[50],
                            '&:hover': {
                                backgroundColor: indigo[500],
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                            },
                        }}
                        onClick={handleModalClose}
                        aria-label="close"
                    >
                        <CloseIcon />
                    </IconButton>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} display={'flex'} justifyContent={'center'} sx={{ mb: 2 }}>
                            <Chip 
                                label='User Details' 
                                sx={{ 
                                    backgroundColor: indigo[50],
                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                    px: 2
                                }} 
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    First Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.firstName || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Last Name
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.lastName || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Gender
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.gender || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Contact
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.mobileNo || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Email
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: 'break-word' }}>
                                    {visitor.email || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    State
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.state || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    District
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.district || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Address
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.address || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={4}>
                            <Box sx={{ p: { xs: 1, sm: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Organization
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {visitor.organisation || 'N/A'}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Modal>
            
            {/* Enable Modal */}
            <Modal
                open={enableModal}
                onClose={() => {setEnableModal(false)}}
                aria-labelledby="confirm-enable-title"
                aria-describedby="confirm-enable-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="confirm-enable-title" variant="h6" component="h2" gutterBottom>
                        Enable User
                    </Typography>
                    <Typography id="confirm-enable-description" sx={{ mt: 2, mb: 3 }}>
                        Are you sure you want to enable this user?
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button onClick={() => {setEnableModal(false)}} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={() => {sendUserEnable()}} variant="contained" color="primary">
                            Confirm
                        </Button>
                    </Stack>
                </Box>
            </Modal>
            
            {/* Disable Modal */}
            <Modal
                open={disableModal}
                onClose={() => {setDisableModal(false)}}
                aria-labelledby="confirm-disable-title"
                aria-describedby="confirm-disable-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="confirm-disable-title" variant="h6" component="h2" gutterBottom>
                        Disable User
                    </Typography>
                    <Typography id="confirm-disable-description" sx={{ mt: 2, mb: 3 }}>
                        Are you sure you want to disable this user?
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button onClick={() => {setDisableModal(false)}} variant="outlined">
                            Cancel
                        </Button>
                        <Button onClick={() => {sendUserDisable()}} variant="contained" color="primary">
                            Confirm
                        </Button>
                    </Stack>
                </Box>
            </Modal>
            
            <Box
                component="main"
                sx={{
                    py: { xs: 4, sm: 6, md: 8 },
                    px: { xs: 1, sm: 2 },
                    minHeight: '100vh',
                    backgroundColor: '#f5f5f5'
                }}
            >
                <Container maxWidth="xl">
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper 
                                sx={{ 
                                    p: { xs: 2, sm: 3, md: 4 }, 
                                    background: blue[50],
                                    borderRadius: 2,
                                    boxShadow: 3
                                }}
                            >
                                <Typography 
                                    variant={isMobile ? "h5" : "h4"} 
                                    align="center" 
                                    gutterBottom
                                    sx={{ 
                                        fontWeight: 600,
                                        color: indigo[800],
                                        mb: { xs: 2, sm: 3 }
                                    }}
                                >
                                    User Management
                                </Typography>
                                
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    {/* Mobile Card View */}
                                    {isMobile ? (
                                        <Box>
                                            {paginatedData.map((row) => (
                                                <UserCard
                                                key={row.id}
                                                row={row}
                                                setEnableModal={setEnableModal}
                                                setDisableModal={setDisableModal}
                                                setID={setID}
                                                getVisitorDetails={getVisitorDetails}
                                                setVOpen={setVOpen}
                                                token={auth?.user?.accessToken}
                                                visitor={visitor}
                                                setVisitor={setVisitor}
                                                />
                                            ))}
                                        </Box>
                                    ) : (
                                        /* Desktop Table View */
                                        <TableContainer 
                                            component={Paper} 
                                            sx={{ 
                                                borderRadius: 2,
                                                boxShadow: 2,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Table aria-label="users table">
                                                <TableHead>
                                                    <TableRow sx={{ bgcolor: indigo[100] }}>
                                                        <TableCell sx={{ fontWeight: 600, color: indigo[800] }}>
                                                            User
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 600, color: indigo[800] }}>
                                                            Last Name
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 600, color: indigo[800] }}>
                                                            Email
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 600, color: indigo[800] }}>
                                                            Organisation
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 600, color: indigo[800] }}>
                                                            Reference
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 600, color: indigo[800] }}>
                                                            Details
                                                        </TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 600, color: indigo[800] }}>
                                                            Status
                                                        </TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody sx={{ backgroundColor: 'white' }}>
                                                    {paginatedData.map((row) => (
                                                        <Row
                                                            key={row.id}
                                                            row={row}
                                                            setEnableModal={setEnableModal}
                                                            setDisableModal={setDisableModal}
                                                            setID={setID}
                                                            token={auth?.user?.accessToken}
                                                        />
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                    
                                    {/* Pagination */}
                                    <Box sx={{ mt: 2 }}>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25]}
                                            component="div"
                                            count={data.length}
                                            rowsPerPage={rowsPerPage}
                                            page={page}
                                            onPageChange={handleChangePage}
                                            onRowsPerPageChange={handleChangeRowsPerPage}
                                            sx={{
                                                '.MuiTablePagination-toolbar': {
                                                    flexDirection: isMobile ? 'column' : 'row',
                                                    gap: isMobile ? 1 : 0,
                                                },
                                                '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                                                    fontSize: isMobile ? '0.875rem' : '1rem',
                                                }
                                            }}
                                        />
                                    </Box>
                                </motion.div>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </>
    );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;