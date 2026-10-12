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
    Card,
    CardContent,
    CardActions,
    useMediaQuery,
    useTheme
} from "@mui/material";
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
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab'
import { useAuth } from 'src/hooks/use-auth';
import { InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import { Roles } from 'src/components/roles';

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
                <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, height: '100%' }}>
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

// Mobile Card Component for displaying visitor data
function VisitorCard({ row, token, onViewDetails }) {
    const theme = useTheme();
    const formatDateTime = (dateTime) => {
        if (!dateTime) return 'N/A';
        return dateTime.split('T')[0] + ', ' + dateTime.split('T')[1].split('.')[0];
    };

    return (
        <Card 
            sx={{ 
                mb: 2, 
                backgroundColor: 'white',
                border: '1px solid',
                borderColor: indigo[100]
            }}
        >
            <CardContent sx={{ pb: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div" color="primary">
                        {row.firstName} {row.lastName}
                    </Typography>
                    <Chip 
                        label={row.pnr} 
                        size="small" 
                        sx={{ backgroundColor: indigo[50] }}
                    />
                </Box>
                
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Purpose:</strong> {row.purpose}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Arrival:</strong> {formatDateTime(row.arrivalDateTime)}
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Departure:</strong> {formatDateTime(row.departureDateTime)}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
            
            <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
                <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                    <Tooltip title="Plan Traveling">
                        <Button 
                            variant="contained"
                            size="small"
                            disabled={!row.isTraveling}
                            sx={{
                                backgroundColor: "#F46B91",
                                minWidth: 'auto',
                                px: 1,
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                },
                            }}
                        >
                            <TimeToLeaveIcon fontSize="small" />
                        </Button>
                    </Tooltip>
                    
                    <Tooltip title="Plan Accommodation">
                        <Button 
                            variant="contained"
                            size="small"
                            disabled={!row.isStaying}
                            sx={{
                                backgroundColor: "#64CFF3",
                                minWidth: 'auto',
                                px: 1,
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                },
                            }}
                        >
                            <HotelIcon fontSize="small" />
                        </Button>
                    </Tooltip>
                    
                    <Tooltip title="View Visitor Details">
                        <Button
                            onClick={() => onViewDetails(row.pnr)}
                            size="small"
                            sx={{
                                minWidth: 'auto',
                                px: 1,
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                },
                            }}
                        >
                            <RemoveRedEye fontSize="small" />
                        </Button>
                    </Tooltip>
                </Stack>
            </CardActions>
        </Card>
    );
}

function Row({ row, token }) {
    const [visitor, setVisitor] = useState({})
    const [vOpen, setVOpen] = useState(false)
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.paper',
        border: '2px solid #280C58',
        borderRadius: '2em',
        boxShadow: 24,
        p: { xs: 2, sm: 3, md: 4 },
        width: { xs: '95%', sm: '85%', md: '70%', lg: '60%' },
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto'
    };

    const getVisitorDetails = async (val) => {
        try {
            const response = await axios.get(`/visit/visitindividual/${val}`, {
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

    const handleViewDetails = (pnr) => {
        if (!vOpen) {
            getVisitorDetails(pnr)
        }
        setVOpen(!vOpen)
    }

    const handleClose = () => setVOpen(false);

    // Mobile view - return card instead of table row
    if (isMobile) {
        return (
            <>
                <Modal
                    open={vOpen}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={style}>
                        <IconButton
                            sx={{
                                position: 'sticky',
                                top: 0,
                                right: 0,
                                float: 'right',
                                mb: 2,
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
                            <Grid item xs={12} display={'flex'} justifyContent={'center'}>
                                <Chip label='Visitor Details' sx={{ backgroundColor: indigo[50] }} />
                            </Grid>
                            
                            {/* Visitor Details Grid - Responsive */}
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">First Name</Typography>
                                    <Typography variant="body1">{visitor.firstName}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Last Name</Typography>
                                    <Typography variant="body1">{visitor.lastName}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Gender</Typography>
                                    <Typography variant="body1">{visitor.gender}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Contact</Typography>
                                    <Typography variant="body1">{visitor.contact}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Email</Typography>
                                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                        {visitor.email}
                                    </Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">State</Typography>
                                    <Typography variant="body1">{visitor.state}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">District</Typography>
                                    <Typography variant="body1">{visitor.district}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Address</Typography>
                                    <Typography variant="body1">{visitor.address}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Organization</Typography>
                                    <Typography variant="body1">{visitor.organization}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Government ID Type</Typography>
                                    <Typography variant="body1">{visitor.govtIdType}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Government ID Number</Typography>
                                    <Typography variant="body1">{visitor.govtIdNumber}</Typography>
                                </div>
                            </Grid>
                            
                            <Grid item xs={12} display={'flex'} justifyContent={'center'} mt={2}>
                                <Chip label='Host Details' sx={{ backgroundColor: indigo[50] }} />
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Employee Name</Typography>
                                    <Typography variant="body1">{visitor.employee}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Office Email</Typography>
                                    <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                        {visitor.officeemail}
                                    </Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Department Name</Typography>
                                    <Typography variant="body1">{visitor.deptName}</Typography>
                                </div>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <div style={{ padding: '10px' }}>
                                    <Typography variant="subtitle1">Purpose</Typography>
                                    <Typography variant="body1">{visitor.purpose}</Typography>
                                </div>
                            </Grid>
                        </Grid>
                    </Box>
                </Modal>
                
                <VisitorCard 
                    row={row} 
                    token={token} 
                    onViewDetails={handleViewDetails}
                />
            </>
        );
    }

    // Desktop view - return table row
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
                            top: 5, 
                            right: 5, 
                            p: 2,
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
                        <Grid item xs={12} display={'flex'} justifyContent={'center'}>
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
                        
                        <Grid item xs={12} display={'flex'} justifyContent={'center'}>
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
                <TableCell align="right">{row.lastName}</TableCell>
                <TableCell align="right">{row.purpose}</TableCell>
                <TableCell align="right">
                    {row.arrivalDateTime?.split('T')[0] + ',' + row.arrivalDateTime?.split('T')[1].split('.')[0]}
                </TableCell>
                <TableCell align="right">
                    {row.departureDateTime?.split('T')[0] + ',' + row.departureDateTime?.split('T')[1].split('.')[0]}
                </TableCell>
                <TableCell align="center">
                    <Stack direction={'row'} spacing={1}>
                        <Tooltip title="Plan Traveling">
                            <Button 
                                variant='contained'
                                sx={{
                                    backgroundColor: "#F46B91",
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                    },
                                }}
                                size='small'
                                disabled={!row.isTraveling}
                                onClick={() => {}}
                            >
                                <TimeToLeaveIcon />
                            </Button>
                        </Tooltip>
                        <Tooltip title="Plan Accommodation">
                            <Button 
                                variant='contained'
                                sx={{
                                    backgroundColor: "#64CFF3",
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                    },
                                }}
                                size='small'
                                disabled={!row.isStaying}
                                onClick={() => {}}
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
                            }}
                            sx={{
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
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

const Page = () => {
    const [data, setData] = useState([]);
    const [value, setValue] = React.useState(0);
    const auth = useAuth();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const handleChangePage = (_, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (e) => {
        setRowsPerPage(parseInt(e.target.value, 10));
        setPage(0);
    };
    
    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    useEffect(() => {
        const fetchData = async () => {
            let response
            try {
                console.log(value, "value")
                if (value == 0) {
                    response = await axios.get(`/visit/visitindividual/past`, {
                        headers: {
                            Authorization: `Bearer ${auth?.user?.accessToken}`
                        }
                    });
                } 
                console.log('response new', response)
                if (response.data.data && response.data.data.length > 0) {
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
    }, [value, auth?.user?.roles]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    if (auth?.user?.roles === Roles["Host"]) {
        return (
            <>
                <Head>
                    <title>Visitor Details</title>
                </Head>
                <Box
                    component="main"
                    sx={{
                        py: { xs: 4, sm: 6, md: 8 },
                        px: { xs: 1, sm: 2 },
                        height: '100%'
                    }}
                >
                    <Container maxWidth="xl">
                        <Box sx={{ 
                            borderBottom: 1, 
                            borderColor: 'divider', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            backgroundColor: indigo[50],
                            borderRadius: { xs: '8px 8px 0 0' }
                        }}>
                            <Tabs 
                                value={value} 
                                onChange={handleChange} 
                                aria-label="basic tabs example"
                                variant={isMobile ? "fullWidth" : "standard"}
                            >
                                <Tab label="Individual" {...a11yProps(0)} />
                            </Tabs>
                        </Box>
                        
                        <CustomTabPanel value={value} index={0}>
                            <Grid container>
                                <Grid
                                    item
                                    xs={12}
                                    component={Paper}
                                    sx={{ 
                                        p: { xs: 1, sm: 2 }, 
                                        background: blue[50] 
                                    }}
                                >
                                    <Typography 
                                        variant={isMobile ? "h5" : "h4"} 
                                        align="center" 
                                        gutterBottom
                                    >
                                        Past Visits
                                    </Typography>
                                    
                                    <motion.div
                                        initial={{ opacity: 0, x: '30%' }}
                                        animate={{ opacity: 1, x: '0%' }}
                                        transition={{ duration: 0.2 }}
                                        style={{ position: 'relative' }}
                                    >
                                        {isMobile ? (
                                            // Mobile view - Card layout
                                            <Box>
                                                {paginatedData.map((row) => (
                                                    <Row
                                                        key={row.pnr}
                                                        row={row}
                                                        token={auth?.user?.accessToken}
                                                    />
                                                ))}
                                                
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
                                            // Desktop view - Table layout
                                            <TableContainer component={Paper}>
                                                <Table aria-label="collapsible table">
                                                    <TableHead>
                                                        <TableRow>
                                                            <TableCell align="center">PNR</TableCell>
                                                            <TableCell>First Name</TableCell>
                                                            <TableCell align="center">Last Name</TableCell>
                                                            <TableCell align="center">Purpose</TableCell>
                                                            <TableCell align="center">Visiting Date</TableCell>
                                                            <TableCell align="center">Exiting Date</TableCell>
                                                            <TableCell align="center">Plan</TableCell>
                                                            <TableCell align="center">Details</TableCell>
                                                        </TableRow>
                                                    </TableHead>

                                                    <TableBody sx={{ backgroundColor: indigo[50] }}>
                                                        {paginatedData.map((row) => (
                                                            <Row
                                                                key={row.pnr}
                                                                row={row}
                                                                token={auth?.user?.accessToken}
                                                            />
                                                        ))}
                                                    </TableBody>
                                                </Table>

                                                <TablePagination
                                                    rowsPerPageOptions={[5, 10, 25]}
                                                    component="div"
                                                    count={data.length}
                                                    rowsPerPage={rowsPerPage}
                                                    page={page}
                                                    onPageChange={handleChangePage}
                                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                                />
                                            </TableContainer>
                                        )}
                                    </motion.div>
                                </Grid>
                            </Grid>
                        </CustomTabPanel>
                    </Container>
                </Box>
            </>
        );
    } else {
        return (
            <Box
                component="main"
                sx={{
                    py: { xs: 4, sm: 6, md: 8 },
                    px: { xs: 2, sm: 3 },
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Paper
                    sx={{
                        p: { xs: 3, sm: 4 },
                        textAlign: 'center',
                        backgroundColor: indigo[50],
                        border: '2px solid',
                        borderColor: indigo[200]
                    }}
                >
                    <Typography 
                        variant={isMobile ? "h5" : "h4"}
                        color="error"
                    >
                        Not Authorized
                    </Typography>
                    <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ mt: 1 }}
                    >
                         You don&apos;t have permission to access this page.
                    </Typography>
                </Paper>
            </Box>
        );
    }
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;