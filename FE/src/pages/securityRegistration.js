import { ArrowForwardIos, Refresh } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { 
  Alert, 
  Button, 
  Chip, 
  Container, 
  Grid, 
  CircularProgress, 
  Modal, 
  Snackbar, 
  Stack, 
  TablePagination,
  Card,
  CardContent,
  CardActions,
  useMediaQuery,
  useTheme
} from "@mui/material";
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
import ImageIcon from '@mui/icons-material/Image';
import axios from 'src/api/axios';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { useRouter } from "next/navigation";
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Slide } from "@mui/material";
import jwt from "jsonwebtoken";
import { API } from 'src/api';
import axiostrack from 'axios';
import { Roles } from 'src/components/roles';

const status = {
  'PrePlanned': "lightgray",
  'Planned': "info.main",
  'Pending': 'warning.main',
  'Complete': 'success.main',
  'Cancelled': 'error.main'
}

function createData(pnr, firstName, lastName, email, purpose, arrivalDateTime, departureDateTime, gender, age, officeemail, employee, departmentName, phoneNumber, state, district, address, pincode, visitstatus, draft) {
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
        district,
        address,
        pincode,
        pnr
      },
    ],
    pnr,
    draft
  };
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Mobile Card Component
const MobileVisitorCard = ({ visitor, onCancel, onContinue, onViewImage }) => {
  const [expanded, setExpanded] = useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ mb: 2, boxShadow: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {visitor.firstName} {visitor.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              PNR: {visitor.pnr}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {visitor.email}
            </Typography>
          </Box>
          {!visitor.draft && (
            <Chip 
              label={visitor.visitstatus} 
              sx={{ 
                backgroundColor: status[visitor.visitstatus], 
                fontWeight: 600,
                minWidth: 80
              }} 
              size="small"
            />
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Purpose:</strong> {visitor.purpose}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Arrival:</strong> {new Date(visitor.arrivalDateTime).toLocaleString(undefined, { 
              month: 'numeric', 
              day: 'numeric', 
              year: 'numeric', 
              hour: 'numeric', 
              minute: 'numeric', 
              hour12: true, 
              timeZone: 'UTC' 
            })}
          </Typography>
          <Typography variant="body2">
            <strong>Departure:</strong> {new Date(visitor.departureDateTime).toLocaleString(undefined, { 
              month: 'numeric', 
              day: 'numeric', 
              year: 'numeric', 
              hour: 'numeric', 
              minute: 'numeric', 
              hour12: true, 
              timeZone: 'UTC' 
            })}
          </Typography>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Additional Details
            </Typography>
            {visitor.history.map((historyRow) => (
              <Box key={historyRow.date}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Gender:</strong> {historyRow.gender}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Phone:</strong> {historyRow.phoneNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Office Email:</strong> {historyRow.officeemail}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Employee:</strong> {historyRow.employee}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Department:</strong> {historyRow.departmentName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>State:</strong> {historyRow.state}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>District:</strong> {historyRow.district}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Address:</strong> {historyRow.address}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Pin Code:</strong> {historyRow.pincode}
                    </Typography>
                  </Grid>
                </Grid>
                <Button 
                  startIcon={<ImageIcon />} 
                  variant="outlined" 
                  onClick={() => onViewImage(visitor.pnr)}
                  sx={{ mt: 2 }}
                  size="small"
                >
                  View Image
                </Button>
              </Box>
            ))}
          </Box>
        </Collapse>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <IconButton
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          size="small"
        >
          {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
        
        <Box>
          {visitor.draft ? (
            <Button 
              variant='contained' 
              onClick={onContinue}
              endIcon={<ArrowForwardIos />}
              size="small"
            >
              Continue
            </Button>
          ) : (
            <Button 
              variant='contained' 
              size='small' 
              sx={{ backgroundColor: 'error.main' }}
              disabled={["Cancelled","Completed", "Failed"].includes(visitor.visitstatus)}
              onClick={() => onCancel(visitor)}
            >
              Cancel
            </Button>
          )}
        </Box>
      </CardActions>
    </Card>
  );
};

// Desktop Row Component
function Row({ row, index, value, onCancel, onContinue, onViewImage }) {
  const [open, setOpen] = React.useState(false);

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
          {row.pnr}
        </TableCell>
        <TableCell align="center">{row.firstName + ' ' + row.lastName}</TableCell>
        <TableCell align="center">{row.email}</TableCell>
        <TableCell align="center">{row.purpose}</TableCell>
        <TableCell align="center">{new Date(row.arrivalDateTime).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'UTC' })}</TableCell>
        <TableCell align="center">{new Date(row.departureDateTime).toLocaleString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true, timeZone: 'UTC' })}</TableCell>
        {!row.draft && <TableCell align='right'>
          <Chip label={row.visitstatus} sx={{ backgroundColor: status[row.visitstatus], p: 2, fontWeight: 600, fontSize: '1em' }} />
        </TableCell>}
        {row.draft && <TableCell align='right'>
          <Button variant='contained' onClick={onContinue}
            endIcon={<ArrowForwardIos />}>Continue</Button>
        </TableCell>}
        <TableCell>
          {row.status === 'continue' ? (
            <Button
              variant='contained'
              onClick={onContinue}
              endIcon={<ArrowForwardIos />}
            >
              Continue
            </Button>
          ) : (
            <Button variant='contained' size='small' sx={{ backgroundColor: 'error.main' }}
            disabled={["Cancelled","Completed", "Failed"].includes(row.visitstatus)}
              onClick={() => onCancel(row)}
            >Cancel</Button>
          )}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, backgroundColor: indigo[100], p: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Other Details
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Photo</TableCell>
                    <TableCell>Gender</TableCell>
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
                      <TableCell>
                        <Button startIcon={<ImageIcon />} variant="outlined" onClick={() => onViewImage(row.pnr)}>
                          View Image
                        </Button>
                      </TableCell>
                      <TableCell>{historyRow.gender}</TableCell>
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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const auth = useAuth();
  const router = useRouter();
  const [stateD, setStateD] = useState({});
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { pnr } = router.query || {};
  const { type, visitors } = router.query || {};

  const [refresh, setRefresh] = useState(false);
  const [state, setState] = useState({});
  const [value, setValue] = React.useState(0);
  const [pnrData, setPNRData] = useState(null);
  const [qrData, setQRData] = useState('');
  const [dummy, setDummy] = useState(false);
  const [view, setView] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  
  const [modalImgOpen, setModalImgOpen] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState(null);
  const [modalImgLoading, setModalImgLoading] = useState(false);

  const handleCancel = async (row) => {
    setStateD((prev) => ({ ...prev, openCancel: true, openApprove: false }));
    setPNRData(row);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setState((prev) => ({ ...prev, open: false }));
    setStateD((prev) => ({ ...prev, openApprove: false, openCancel: false }));
    setCancelLoading(false); // Reset loading state
  };

  const handleContinueClick = () => {
    router.push(`/spotRegistration?pnr=${pnrData?.pnr}&currentTab=${value}`);
  };

  const handleModalImgOpen = async (id) => {
    setModalImgOpen(true);
    setModalImgLoading(true);

    try {
      const response = await axios.get(`/facerecognition/visitimage/${id}`, {
        responseType: 'blob',
      });
      const blobUrl = URL.createObjectURL(response.data);
      setModalImgSrc(blobUrl);
    } catch (err) {
      console.error('Error fetching image:', err);
      setModalImgSrc(null);
    } finally {
      setModalImgLoading(false);
    }
  };

  const handleModalImgClose = () => {
    setModalImgOpen(false);
    setModalImgSrc(null);
  };

  const sendDataToBackend1 = async (modifiedData) => {
    try {
      const token = modifiedData.token;
      console.log("token in approve ::", token);

      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      let backendEndpoint;
      if (value === 0) {
        backendEndpoint = `${API}/handleVisits/cancelIndVisit/${pnrData.pnr}`;
      } else if (value === 1) {
        backendEndpoint = `${API}/handleVisits/cancelOrgVisit/${pnrData.pnr}`;
      }

      console.log("sendDataToBackend::", modifiedData);

      // Set timeout for the request
      const response = await axios.put(backendEndpoint, modifiedData, { 
        headers,
        timeout: 15000 // 15 seconds timeout
      });
      
      setState({ severity: 'success', message: 'Visit cancelled successfully', open: true });

      // Optimistically update the UI
      setData(prevData => 
        prevData.map(item => 
          item.pnr === pnrData.pnr 
            ? { ...item, visitstatus: 'Cancelled' }
            : item
        )
      );

      console.log("response after update::", response.data);
      handleClose();

    } catch (error) {
      console.error('Error sending data to backend:', error);
      const errorMessage = error.code === 'ECONNABORTED' 
        ? 'Request timed out. Please try again.' 
        : error.response?.data?.errors?.[0] || 'Failed to cancel visit. Please try again.';
      setState({ severity: 'error', message: errorMessage, open: true });
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelConfirm = async () => {
    setCancelLoading(true);
    
    try {
      let PNRType = '';
      if (value === 0) {
        pnrData.type = 'Individual';
        PNRType = 'Individual';
      }
      
      const pdfData = {
        visitorinfo: {
          type: PNRType,
          visitors: 1,
          visitend: pnrData.departureDateTime
        }
      };
      
      const token = await jwt.sign(pdfData, 'approvecancel', { expiresIn: '1d' });
      
      await sendDataToBackend1({ ...pnrData, approveByHost: false, token });
      
      setDummy(!dummy);
    } catch (error) {
      console.error("Error sending data to backend:", error);
      setState({ severity: 'error', message: 'Failed to cancel visit. Please try again.', open: true });
      setCancelLoading(false);
    }
  };

  const slicedData = data?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    console.log("event.target.value::", event.target.value);
    console.log("newPage value::", newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    console.log("event.target.value::", event.target.value);
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (auth?.user?.email.length > 0) {
        try {
          let response;
          if (value === 0) {
            response = await axios.get(`/visit/visitindividual/email?email=${auth?.user?.email}`, {
              headers: {
                Authorization: `Bearer ${auth?.user?.accessToken}`
              }
            });
          }

          console.log('response', response);
          setState({ severity: 'success', message: 'Fetched Successfully', open: true });
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
              visitor.draft
            )).reverse()
          );
          } else {
            console.log('No data');
            setState({ severity: 'warning', message: 'No Data', open: true });
            setData([]);
          }
        } catch (error) {
          setState({ severity: 'error', message: 'Error Fetching, try refreshing', open: true });
          console.error('Error fetching data:', error.message);
          setData([]);
        }
      }
    };

    fetchData();
    console.log(state);
  }, [refresh, value, dummy, auth?.user?.roles]);

  const vertical = 'top';
  const horizontal = 'center';

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

  if (auth?.user?.roles === Roles["Host"] || auth?.user?.roles === Roles["Visitor"] || auth?.user?.roles === Roles["SecurityGuard"]) {
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

        <Modal open={modalImgOpen} onClose={handleModalImgClose}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 2,
              boxShadow: 24,
              outline: 'none',
              width: { xs: '90%', sm: 650 },
              maxWidth: '90vw',
              textAlign: 'center',
            }}
          >
            {modalImgLoading ? (
              <CircularProgress />
            ) : modalImgSrc ? (
              <>
                <img
                  src={modalImgSrc}
                  alt="Fetched content"
                  style={{
                    width: '100%',
                    maxWidth: '600px',
                    height: 'auto',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    display: 'block',
                    margin: '0 auto',
                    backgroundColor: '#f0f0f0',
                  }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleModalImgClose}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </>
            ) : (
              <>
                <div>Image not available.</div>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleModalImgClose}
                  sx={{ mt: 2 }}
                >
                  Close
                </Button>
              </>
            )}
          </Box>
        </Modal>

        <Box
          sx={{
            flexGrow: 1,
            py: { xs: 2, md: 4 },
            px: { xs: 1, md: 0 }
          }}
        >
          <Container maxWidth="xl">
            <Grid container justifyContent="center">
              <Grid
                item
                xs={12}
                component={Paper}
                sx={{ 
                  p: { xs: 1, md: 2 }, 
                  background: indigo[50],
                  borderRadius: 2
                }}
              >
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  display={'flex'} 
                  spacing={2} 
                  justifyContent={'center'} 
                  alignItems={'center'} 
                  sx={{ m: 1, textAlign: { xs: 'center', sm: 'left' } }}
                >
                  <Typography 
                    variant={{ xs: "h5", md: "h4" }} 
                    align="center" 
                    gutterBottom
                    sx={{ mb: { xs: 1, md: 0 } }}
                  >
                    Visitor Details
                  </Typography>
                </Stack>

                <Box sx={{ width: '100%' }}>
                  {isMobile ? (
                    // Mobile View - Card Layout
                    <Box sx={{ mt: 2 }}>
                      {slicedData.length === 0 ? (
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                          <Typography variant="h6" color="textSecondary" align="center">
                            No Data Available
                          </Typography>
                        </Box>
                      ) : (
                        slicedData.map((visitor, index) => (
                          <MobileVisitorCard
                            key={visitor.pnr}
                            visitor={visitor}
                            onCancel={handleCancel}
                            onContinue={handleContinueClick}
                            onViewImage={handleModalImgOpen}
                          />
                        ))
                      )}
                      
                      {/* Mobile Pagination */}
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 20]}
                        component="div"
                        count={data?.length || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                          '.MuiTablePagination-toolbar': {
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 1
                          },
                          '.MuiTablePagination-spacer': {
                            display: { xs: 'none', sm: 'block' }
                          }
                        }}
                      />
                    </Box>
                  ) : (
                    // Desktop View - Table Layout
                    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
                      <Table aria-label="collapsible table">
                        <TableHead>
                          <TableRow>
                            <TableCell />
                            <TableCell align='center'>PNR</TableCell>
                            <TableCell align='center'>Name</TableCell>
                            <TableCell align="center">Email</TableCell>
                            <TableCell align="center">Purpose</TableCell>
                            <TableCell align="center">Arrival Date</TableCell>
                            <TableCell align="center">Departure Date</TableCell>
                            <TableCell align='center'>Status</TableCell>
                            <TableCell align='center'>Action</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {slicedData.map((row, index) => (
                            <Row 
                              key={row.pnr} 
                              row={row} 
                              index={index}
                              value={value}
                              onCancel={handleCancel}
                              onContinue={handleContinueClick}
                              onViewImage={handleModalImgOpen}
                            />
                          ))}
                          {slicedData.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9}>
                                <Box sx={{ textAlign: 'center', mt: 4 }}>
                                  <Typography variant="h5" color="textSecondary" align="center" mt={2}>
                                    No Data Available
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 20]}
                        component="div"
                        count={data?.length || 0}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                      />
                    </TableContainer>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Cancel Dialog */}
        <Dialog
          open={stateD.openCancel}
          TransitionComponent={Transition}
          keepMounted
          onClose={!cancelLoading ? handleClose : undefined} // Prevent closing while loading
          aria-describedby="alert-dialog-slide-description"
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{"Cancel the Meeting?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              By Cancelling, You&apos;re cancelling the visit.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCancelConfirm}
              disabled={cancelLoading}
              startIcon={cancelLoading && <CircularProgress size={16} />}
            >
              {cancelLoading ? 'Processing...' : 'Proceed'}
            </Button>
            <Button 
              onClick={handleClose}
              disabled={cancelLoading}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  } else {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h4">Not Authorized</Typography>
      </Box>
    );
  }
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;