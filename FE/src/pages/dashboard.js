import Head from 'next/head';

import { Box, Container, Button, Divider, Unstable_Grid2 as Grid, IconButton, Paper, Stack, TextField, Typography, Snackbar, Alert } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { OverviewBudget } from 'src/sections/overview/overview-budget';
import { animate } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import GroupIcon from '@mui/icons-material/Group';

import { blue, green, indigo } from '@mui/material/colors';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { OverviewSales } from 'src/sections/overview/overview-sales';
import DateRangeIcon from '@mui/icons-material/DateRange';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { OverviewTraffic } from 'src/sections/overview/overview-traffic';
import axios from 'src/api/axios';
import { Roles } from 'src/components/roles';
import { useAuth } from 'src/hooks/use-auth';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { API } from 'src/api';
import { motion } from 'framer-motion';
import { Refresh, RefreshOutlined } from '@mui/icons-material';
function createData(firstName, lastName, email, purpose, arrivalDateTime, departureDateTime, gender, age, officeemail, employee, departmentName, phoneNumber, state, city, address, pincode) {
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
                departmentName,
                phoneNumber,
                state,
                city,
                address,
                pincode,
            },
 
        ],
    };
}

function Row({ row, index }) {
    const [open, setOpen] = React.useState(false);

    return (
        <React.Fragment>

        </React.Fragment>
    );
}

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

const Page = () => {
    const [data, setData] = useState([]);
    const [todayData, setTodayData] = useState({})
    const auth = useAuth();
    const today = new Date()
    const [fromCurrentDate, setFromCurrentDate] = useState(today);
    const [toCurrentDate, setToCurrentDate] = useState(today);
    const [value, setValue] = React.useState(0);
    const [state, setState] = useState({})
    const [reset, setReset] = useState(false)
const [dummy,setDummy] = useState(false)
    const handleClose = () => {
        setState({ ...state, open: false })
    };
    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API}/dashboard/admin/getdetails`, {
                    headers: {
                        Authorization: `Bearer ${auth?.user?.accessToken}`
                    }
                });
                console.log('response from backend', response.data.data)
                setData(response.data.data)
            } catch (error) {
                console.error('Error response from backend:', error.message);
            }
        };
        fetchData();
    }, [reset,  auth?.user]);
    // useEffect(() => {
    //     const fetchTodayData = async () => {
    //         try {
    //             console.log('todays date', new Date().toISOString())
    //             const response = await axios.get(`${API}/dashboard/admin/getdetails/today/${new Date().toISOString().split('T')[0]}`, {
    //                 headers: {
    //                     Authorization: `Bearer ${auth?.user?.accessToken}`
    //                 }
    //             });
    //             console.log('response from backend today', response.data.data)
    //             setTodayData(response.data.data)
    //         } catch (error) {
    //             console.error('Error response from backend:', error.message);
    //         }
    //     };
    //     fetchTodayData();
    // }, [dummy, auth?.user]);

    useEffect(() => {
        const fetchTodayData = async () => {
            try {
                const today = new Date();
                const localDate = today.toLocaleDateString('en-CA'); // YYYY-MM-DD
                console.log('today\'s date (local):', localDate);
    
                const response = await axios.get(`${API}/dashboard/admin/getdetails/today/${localDate}`, {
                    headers: {
                        Authorization: `Bearer ${auth?.user?.accessToken}`
                    }
                });
    
                console.log('response from backend today', response.data.data);
                setTodayData(response.data.data);
            } catch (error) {
                console.error('Error response from backend:', error.message);
            }
        };
        fetchTodayData();
    }, [dummy, auth?.user]);
    

    const now = new Date();
  
    function Counter({ from, to }) {
        const nodeRef = useRef();

        useEffect(() => {
            const node = nodeRef.current;

            const controls = animate(from, to, {
                duration: 0.75,
                onUpdate(value) {
                    node.textContent = value?.toFixed(0);
                },
            });

            return () => controls?.stop();
        }, [from, to]);

        return <p ref={nodeRef} 
        style={{ fontSize: '2em', fontWeight: 600 }} />;
    }



    const vertical = 'top'
    const horizontal = 'center'
    const handleFilter = async () => {
        // Make your HTTP request to the backend here
        console.log("fromCurrentDate from handleFilter:::", fromCurrentDate)
        console.log("toCurrentDate from handleFilter:::", toCurrentDate)
        try {
            const response = await axios.get(`${API}/dashboard/admin/getDetails/${fromCurrentDate}/${toCurrentDate}`,   {
                headers: {
                    Authorization: `Bearer ${auth?.user?.accessToken}`
                }
            })
            console.log('Response', response.data.data)
            setState({ severity: 'success', message: 'Fetched Successfully', open: true })
            setData(response.data.data)
        } catch (error) {
            console.log('error', error)
        }

    }
    console.log("from current date::", fromCurrentDate);
    console.log("to current date::", toCurrentDate);
    if (auth?.user?.roles === Roles["Admin"] || auth?.user?.roles === Roles["Planner"]) {
        return (
            <>
                <Head>
                    <title>
                        Visitors
                    </title>
                </Head>
                <Snackbar open={state.open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical, horizontal }}>
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
                        flexGrow: 1,
                        py: 8,
                        backgroundColor: '#280C58'
                    }}
                >
                    <Container maxWidth="xl">

                        <Grid item 
                        
                        xs={12}
                         alignItems='flex-end' 
                         sx={{
                            p: 2, borderRadius: 5, display: 'flex', justifyContent: 'center',
                            alignItems : 'center',
                            backgroundColor: indigo[50], mb: 3,
                        
                        }}
                        >
                            <Typography variant='h6' align='left'>Today&apos;s Stats</Typography> 
                            {/* <Button variant='contained' startIcon={<RefreshOutlined/>} onClick={()=>{ setDummy(!dummy)}}>Refresh</Button> */}
                        </Grid>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.5 }}
                        >
                            <Grid container spacing={3} sx={{ mb: 2 }}>

                                <Grid container spacing={1} xs={12} sx={{
                                 
                                    borderRadius: 5,
                                }}>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        lg={6}
                                    >

                                        <Box component={Paper} sx={{ borderRadius: 2, p: 2, backgroundColor: indigo[50], height: '100%' }} elevation={7} direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                                            <Box>
                                                <Grid container xs={12}>
                                                    <Grid item xs={12}>
                                                        <Typography align='center' fontWeight={600}>No. Of Visits Scheduled Today</Typography>
                                                    </Grid>
                                                </Grid>
                                            </Box>
                                            
                                   
                                            <Box sx={{ m: 2 }}>
                                                <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                                                    <EmojiPeopleIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                    <Counter from={0} to={todayData?.indScheduledVisitsCount} />
                                                </Stack>
                                                {/* <hr /> */}
                                                {/* <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                                                    <GroupIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                    <Counter from={0} to={todayData.orgScheduledVisitsCount} />

                                                </Stack> */}
                                            </Box>
                                        </Box>

                                    </Grid>
                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                        lg={6}
                                    >
                                        <Box component={Paper}
                                         sx={{ borderRadius: 2, p: 2, backgroundColor: indigo[50], height: '100%' }}
                                         elevation={7} 
                                         display={'flex'} 
                                         justifyContent={'center'} 
                                         alignItems={'center'}
                                          flexDirection={'column'}>
                                            <Typography variant='h6'
                                             sx={{p  :1}}
                                             align='center' >No of visitors <Typography color={'white'} 
                                             sx={{display : 'inline', backgroundColor : 'success.main', borderRadius : 3, p : 0.5}}>in Campus </Typography>Today</Typography>

                                            <Stack direction={'row'} 
                                            spacing={3}>
                                                <Stack direction={'row'} 
                                                display={'flex'} 
                                                justifyContent={'center'} 
                                                alignItems={'center'} 
                                                spacing={1}>
                                                    <EmojiPeopleIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                    <Counter from={0}
                                                     to={todayData.indInCampusPNRCount} />
                                                
                                                </Stack>
                                                {/* <hr />
                                                <Stack direction={'row'} 
                                                display={'flex'} 
                                                justifyContent={'center'} 
                                                alignItems={'center'} 
                                                spacing={1}>
                                                    <GroupIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                    <Counter from={0}
                                                     to={todayData.orgInCampusPNRCount} />
                                                   

                                                </Stack> */}
                                            </Stack>

                                            <hr />

                                            <Typography variant='h6' 
                                            align='center' 
                                            sx={{p :1}} >No of visitors
                                            <Typography color={'white'}
                                             sx={{display : 'inline', backgroundColor : 'error.main', borderRadius : 3,p : 0.5}}>Exited Campus</Typography> 
                                            Today</Typography>

                                            <Divider />
                                            <Stack direction={'row'} 
                                            spacing={3}>
                                                <Stack direction={'row'} 
                                                display={'flex'} 
                                                justifyContent={'center'}
                                                 alignItems={'center'} 
                                                 spacing={1}>
                                                    <EmojiPeopleIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                    <Counter from={0} 
                                                    to={todayData.indExitedPNRCount} />
                                                  

                                                </Stack>
                                                {/* <hr />
                                                <Stack direction={'row'} 
                                                display={'flex'} 
                                                justifyContent={'center'} 
                                                alignItems={'center'} 
                                                spacing={1}>
                                                    <GroupIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                    <Counter from={0} 
                                                    to={todayData.orgExitedPNRCount} />
                                    

                                                </Stack> */}
                                            </Stack>
                                        </Box>
                                    </Grid>

                                </Grid>


                            </Grid>
                        </motion.div>
                        <Grid 
  item 
  xs={12} 
  sx={{ 
    p: 2, 
    borderRadius: 5, 
    backgroundColor: indigo[50] 
  }}
>
  <Grid 
    container 
    spacing={2} 
    alignItems="center" 
    justifyContent="center"
  >

    <Grid item xs={12} sm="auto">
      <Typography align="center" variant="h6">
        Search with date
      </Typography>
    </Grid>

    <Grid item xs={12} sm={5} md={3}>
      <TextField
        fullWidth
        id="currentDate"
        label="From Date"
        type="date"
        value={fromCurrentDate}
        InputLabelProps={{ shrink: true }}
        sx={{ backgroundColor: 'white', borderRadius: 2 }}
        onChange={(e) => {
          if (toCurrentDate != null) {
            if (new Date(e.target.value).getTime() < new Date(toCurrentDate).getTime()) {
              setFromCurrentDate(e.target.value);
            } else {
              setState({ severity: 'warning', message: 'Date cannot be less than To Date', open: true });
            }
          } else {
            setFromCurrentDate(e.target.value);
          }
        }}
      />
    </Grid>

    <Grid item xs={12} sm={5} md={3}>
      <TextField
        fullWidth
        id="tocurrentDate"
        label="To Date"
        type="date"
        value={toCurrentDate}
        InputLabelProps={{ shrink: true }}
        sx={{ backgroundColor: 'white', borderRadius: 2 }}
        onChange={(e) => {
          if (fromCurrentDate != null) {
            if (new Date(e.target.value).getTime() > new Date(fromCurrentDate).getTime()) {
              setToCurrentDate(e.target.value);
            } else {
              setState({ severity: 'warning', message: 'Date cannot be less than From Date', open: true });
            }
          } else {
            setToCurrentDate(e.target.value);
          }
        }}
      />
    </Grid>

    <Grid item xs={12} sm="auto">
      <Button 
        variant="contained" 
        onClick={handleFilter}
        sx={{ mt: { xs: 1, sm: 0 } }}
      >
        Filter Data
      </Button>
    </Grid>

    <Grid item xs={12} sm="auto">
      <Button 
        startIcon={<Refresh />} 
        variant="contained"
        onClick={() => {
          setToCurrentDate('');
          setFromCurrentDate('');
          setReset(!reset);
          setData(prevData => ({
            ...prevData,
            indPlannedVisitsCount: 0,
            orgPlannedVisitsCount: 0,
            indCancelledVisitsCount: 0,
            orgCancelledVisitsCount: 0,
            indCompletedVisitsCount: 0,
            orgCompletedVisitsCount: 0,
          }));
        }}
        sx={{ mt: { xs: 1, sm: 0 } }}
      >
        Reset
      </Button>
    </Grid>

  </Grid>
</Grid>

                        <br />
                        <motion.div
                            initial={{ opacity: 0, y: 50 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.5 }} 
                        >
                            <Grid
                                container
                                spacing={3}
                            >
                               
                                <Grid
                                    xs={12}
                                    sm={6}
                                    lg={2}

                                >
                                    <Box component={Paper} sx={{ borderRadius: 2, p: 2, backgroundColor: indigo[50], height: '100%' }} elevation={7} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                                        <Typography variant='h6' align='center' >No of Approvals Planned</Typography>
                                        {/* <IconButton>
                                        <ArrowBackIosNewIcon />
                                    </IconButton>
                                    <IconButton onClick={handleNextDate} >
                                        <ArrowForwardIosIcon />
                                    </IconButton> */}
                                        <Divider />
                                        <Box sx={{ m: 2 }}>
                                            <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                                                <EmojiPeopleIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                {/* <Counter from={0} to={100} /> */}
                                                <Counter from={0} to={data.indPlannedVisitsCount || 0} />

                                            </Stack>
                                            {/* <hr /> */}
                                            {/* <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                                                <GroupIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                <Counter from={0} to={data.orgPlannedVisitsCount || 0} />

                                            </Stack> */}
                                        </Box>
                                    </Box>
                                </Grid>
                           

                                <Grid
                                    xs={12}
                                    sm={6}
                                    lg={2}
                                >
                                    <Box component={Paper} 
                                    sx={{ borderRadius: 2, p: 2, backgroundColor: indigo[50], height: '100%' }}
                                     elevation={7} 
                                     display={'flex'} 
                                     justifyContent={'center'} 
                                     alignItems={'center'} 
                                     flexDirection={'column'}>
                                        <Typography variant='h6' align='center' >No of Visits Cancelled</Typography>
                                        {/* <IconButton>
                                        <ArrowBackIosNewIcon />
                                    </IconButton>
                                    <IconButton onClick={handleNextDate} >
                                        <ArrowForwardIosIcon />
                                    </IconButton> */}
                                        <Divider />
                                        <Box sx={{ m: 2 }}>
                                            <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                                                <EmojiPeopleIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                {/* <Counter from={0} to={100} /> */}
                                                <Counter from={0} to={data.indCancelledVisitsCount} />
                                                {/* <Typography>{date}</Typography> */}
                                            </Stack>
                                            {/* <hr />
                                            <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                                                <GroupIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                
                                                <Counter from={0} to={data.orgCancelledVisitsCount} />
                                               
                                            </Stack> */}
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid
                                    xs={12}
                                    sm={6}
                                    lg={4}
                                >

                                    <Box component={Paper} sx={{ borderRadius: 2, p: 2, backgroundColor: indigo[50], height: '100%' }} elevation={7} direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} flexDirection={'column'}>
                                        <Box>
                                            <Grid container xs={12}>
                                                <Grid item xs={12}>
                                                    <Typography align='center' fontWeight={600}>No. Of Visits Scheduled</Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                        
                                    {/* Total : {data.indPlannedVisitsCount + data.orgPlannedVisitsCount} */}
                                        <Box sx={{ m: 2 }}>
                                            <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                                                <EmojiPeopleIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                <Counter from={0} to={data?.indApprovedVisitsCount} />
                                            </Stack>
                                            {/* <hr />
                                            <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                                                <GroupIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                <Counter from={0} to={data.orgApprovedVisitsCount} />

                                            </Stack> */}
                                        </Box>
                                    </Box>

                                </Grid>
                          
                                <Grid
                                    xs={12}
                                    sm={6}
                                    lg={2}

                                >
                                    <Box component={Paper} 
                                    sx={{ borderRadius: 2, p: 2, backgroundColor: indigo[50], height: '100%' }}
                                     elevation={7}
                                      display={'flex'} 
                                      justifyContent={'center'}
                                       alignItems={'center'} 
                                       flexDirection={'column'}>
                                        <Typography variant='h6'
                                         align='center' >No of Visits Completed</Typography>
                                    
                                        <Divider />
                                        <Box sx={{ m: 2 }}>
                                            <Stack direction={'row'}
                                             display={'flex'} 
                                             justifyContent={'center'} 
                                             alignItems={'center'}
                                              spacing={1}>
                                                <EmojiPeopleIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                                {/* <Counter from={0} to={100} /> */}
                                                <Counter from={0} 
                                                to={data.indCompletedVisitsCount} />

                                            </Stack>
                                            {/* <hr />
                                            <Stack direction={'row'} 
                                            display={'flex'} 
                                            justifyContent={'center'}
                                             alignItems={'center'}
                                              spacing={1}>
                                                <GroupIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                               
                                                <Counter from={0}
                                                 to={data.orgCompletedVisitsCount} />

                                            </Stack> */}
                                        </Box>
                                    </Box>
                                </Grid>
                           
                                <Grid
                                    xs={12}
                                    sm={6}
                                    lg={2}

                                >
                                    <Box component={Paper} 
                                    sx={{ borderRadius: 2, p: 2, backgroundColor: indigo[50], height: '100%' }} 
                                    elevation={7}
                                     display={'flex'} 
                                     justifyContent={'center'} 
                                     alignItems={'center'} 
                                     flexDirection={'column'}>
                                        <Typography variant='h6' align='center' >No of Visits Failed</Typography>
                                     
                                        <Divider />
                                        <Box sx={{ m: 2 }}>
                                            <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                                                <EmojiPeopleIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                              
                                                <Counter from={0} to={data.indFailedVisitsCount} />

                                            </Stack>
                                            {/* <hr />
                                            <Stack direction={'row'} display={'flex'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                                                <GroupIcon sx={{ fontSize: '2em', color: indigo[600] }} />
                                            
                                                <Counter from={0} to={data.orgFailedVisitsCount} />

                                            </Stack> */}
                                        </Box>
                                    </Box>
                                </Grid>
                              
                                <Grid
                                    xs={12}
                                    md={6}
                                    lg={2}

                                >
                                </Grid>
                                <Grid
                                    xs={12}
                                    sm={12}
                                    lg={12}
                                >
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: indigo[50], display: "flex", justifyContent: 'center', alignItems: 'center', mx: 4, flexDirection: 'column' }}>
                                        <Typography align='center'
                                         variant='body1'
                                          fontWeight={600}>Visitors by Department</Typography>
                                        <Tabs value={value} 
                                        onChange={handleChange} 
                                        aria-label="basic tabs example" >
                                            <Tab label="Individual" 
                                            {...a11yProps(0)} />
                                            {/* <Tab label="Organization" 
                                            {...a11yProps(1)} /> */}
                                        </Tabs>
                                    </Box>
                                    <CustomTabPanel value={value} index={0}>
                                        <OverviewSales
                                            sx={{ backgroundColor: indigo[50] }}
                                            chartSeries={[
                                                {
                                                    name: 'Today',
                                                    data: Object?.values(data?.indChartData || {})
                                                }
                                            ]}

                                 
                                            data={data.indChartData}
                                            // chartSeries={[
                                            //     { name: 'This year', data: [18, 16, 5, 8, 3, 14, 14, 16, 17, 19, 18, 20] },
                                              
                                            //   ]}
                                            //   data= {{'webtech': 10, 'elearning' : 12}}
                                     
                                        />
                                    </CustomTabPanel>
                                    {/* <CustomTabPanel value={value}
                                     index={1}>
                                        <OverviewSales
                                            sx={{ backgroundColor: indigo[50] }}
                                            chartSeries={[
                                                {
                                                    name: 'Today',
                                                    data: Object?.values(data?.orgChartData || {})
                                                }
                                            ]}
                                      
                                            data={data.orgChartData}
                                        />
                                    </CustomTabPanel> */}


                                </Grid>
                              
                            </Grid>
                        </motion.div>
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

}



Page.getLayout = (page) => (
    <DashboardLayout>
        {page}
    </DashboardLayout>
);

export default Page;
