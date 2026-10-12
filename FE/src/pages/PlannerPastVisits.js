import { ArrowForwardIos, Refresh } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Alert, Button, Chip, Container, Grid, Snackbar, Stack, TablePagination } from "@mui/material";
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
import { useRouter } from "next/navigation";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { NoDataIcon } from '@mui/icons-material';
import { Roles } from 'src/components/roles';
const status = {
    'PrePlanned': "lightgray",
    'Planned': "info.main",
    'Pending': 'warning.main',
    'Complete': 'success.main',
    'Cancelled': 'error.main'
}
function createData(pnr, firstName, lastName, email, purpose, arrivalDateTime, departureDateTime, gender, age, officeemail, employee, departmentName, phoneNumber, state, district, address, pincode, visitstatus, draft) {

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
        draft
    };
}

function Row({ row, index, value }) {
    const [open, setOpen] = React.useState(false);
    const router = useRouter()
    console.log('Row', row)
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
                    <Button variant='contained' endIcon={<ArrowForwardIos />}>Approve</Button>
                </TableCell>}
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, backgroundColor: indigo[100], p: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Other Details
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    {/* ... your existing code for the table header */}
                                    <TableRow>
                                        <TableCell>Gender</TableCell>
                                        <TableCell>Age</TableCell>
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
                                            <TableCell>{historyRow.age}</TableCell>
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
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
}

const Page = () => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5); // You can adjust the number of rows per page
    const auth = useAuth()
    const [refresh, setRefresh] = useState(false)
    const [state, setState] = useState({})
    const [value, setValue] = React.useState(0);

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

    const slicedData = data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    useEffect(() => {
        const fetchData = async () => {

            try {
                let response
                if (value == 0) {
                    response = await axios.get(`/visit/visitindividual/email?email=${auth?.user?.email}`,    {
                        headers: {
                            Authorization: `Bearer ${auth?.user?.accessToken}`
                        }
                    });
                } else if (value == 1) {
                    response = await axios.get(`/orgvisit/visitorganization/email?email=${auth?.user?.email}`,
                        {
                            headers: {
                                Authorization: `Bearer ${auth?.user?.accessToken}`
                            }
                        }
                    );
                }

                console.log('response', response)
                setState({ severity: 'success', message: 'Fetched Successfully', open: true })
                if (response.data && response.data.data.length > 0) {
                    // console.log('the response mapped array', response.data.data
                    //   // .map((visitor) =>(
                    //   //   visitor.firstName,
                    //   //   visitor.lastName,
                    //   //   visitor.email,
                    //   //   visitor.purpose,
                    //   //   visitor.arrivalDateTime,
                    //   //   visitor.departureDateTime,
                    //   //   visitor.gender,
                    //   //   visitor.age,
                    //   //   visitor.officeemail,
                    //   //   visitor.employee,
                    //   //   visitor.deptName,
                    //   //   visitor.phoneNumber,
                    //   //   visitor.state,
                    //   //   visitor.district,
                    //   //   visitor.address,
                    //   //   visitor.pincode,
                    //   //   visitor.visitstatus,
                    //   //   visitor.pnr
                    //   // )
                    //   // )
                    // )
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
                        visitor.draft
                    )));
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
    }, [refresh, value, auth?.user?.accessToken]);

    const vertical = 'top'
    const horizontal = 'center'
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setState((prev) => { return { ...prev, open: false } })
        // setOpen(false);
    };
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
    if (auth?.user?.roles === Roles["Admin"] || auth?.user?.roles === Roles["Planner"]) {
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
            <Box
                // component="main"
                sx={{
                    flexGrow: 1,
                    py: 4,
                }}
            >
                <Container>
                    <Grid container justifyContent="center">
                        <Grid
                            item
                            xs={12}
                            component={Paper}
                            sx={{ p: 2, background: indigo[50] }}
                        >
                            <Stack direction={'row'} display={'flex'} spacing={2} justifyContent={'center'} alignItems={'center'} m={1}>
                                <Typography variant="h4" align="center" gutterBottom>
                                    Visitor Details
                                </Typography>
                                {/* <Button size='small' variant='contained' startIcon={<Refresh />} onClick={() => setRefresh(!refresh)}>Refresh</Button> */}
                            </Stack>
                            <Box sx={{ width: '100%' }}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', backgroundColor: 'white' }}>
                                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" >
                                        <Tab
                                            sx={{ backgroundColor: value == 0 ? indigo[50] : '', mx: 1, px: 1 }}
                                            label="Individual" {...a11yProps(0)} />
                                        <Tab
                                            sx={{ backgroundColor: value == 1 ? indigo[50] : '', mx: 1, px: 1 }}
                                            label="Organization" {...a11yProps(1)} />
                                    </Tabs>
                                </Box>
                                <CustomTabPanel value={value} index={0}>
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
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {slicedData.map((row) => (
                                                    <Row key={row.name} row={row} value={value} />
                                                ))}
                                                {slicedData.length == 0 &&
                                                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                                                        <Typography variant="h5" color="textSecondary" align="center" mt={2}>
                                                            No Data Available
                                                        </Typography>
                                                    </Box>
                                                }
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
                                </CustomTabPanel>
                                <CustomTabPanel value={value} index={1}>
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
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {slicedData.map((row) => (
                                                    <Row key={row.name} row={row} value={value} />
                                                ))}
                                                {slicedData.length == 0 &&
                                                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                                                        <Typography variant="h5" color="textSecondary" align="center" mt={2}>
                                                            No Data Available
                                                        </Typography>
                                                    </Box>
                                                }
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
                                </CustomTabPanel>
                            </Box>

                        </Grid>
                    </Grid>

                </Container>
            </Box>

        </>

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

export default Page;
