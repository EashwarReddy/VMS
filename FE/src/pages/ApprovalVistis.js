import { ArrowForwardIos, PeopleOutlineRounded, Refresh } from "@mui/icons-material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Alert,
  Button,
  Chip,
  Container,
  Dialog,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Modal,
  Slide,
  Snackbar,
  Stack,
  Tooltip,
  TablePagination,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import Box from "@mui/material/Box";
import ImageIcon from '@mui/icons-material/Image';
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { blue, indigo } from "@mui/material/colors";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import axios from "src/api/axios";
import { useAuth } from "src/hooks/use-auth";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { NoDataIcon } from "@mui/icons-material";
import CustomQRCode from "src/components/CustomQRCode";
import jsPDF from "jspdf";
import jwt from "jsonwebtoken";
import { API, Frontend_API } from "src/api";
import { Roles } from "src/components/roles";

const status = {
  PrePlanned: "lightgray",
  Planned: "info.main",
  Pending: "warning.main",
  Completed: "success.main",
  Approved: "success.main",
  Cancelled: "error.main",
  Ongoing: "primary.light",
};

function createData(
  pnr,
  approvedByHost,
  firstName,
  lastName,
  email,
  purpose,
  arrivalDateTime,
  departureDateTime,
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
  visitstatus,
  draft,
  organization,
  hostname,
  secondaryvisitors
) {
  return {
    approvedByHost,
    firstName,
    lastName,
    email,
    purpose,
    arrivalDateTime,
    departureDateTime,
    visitstatus,
    history: [
      {
        date: "2022-01-01",
        customerId: "12345",
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
        pnr,
      },
    ],
    pnr,
    draft,
    organization,
    hostname,
    secondaryvisitors
  };
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const logoUrl = "/cdac.png";
const topLogo =
  "/C-DAC_Logo.png";

// Mobile Card Component for better mobile experience
// const MobileVisitorCard = ({ row, value, handleApprove, handleCancel, setModal, setsecondaryVisitors }) => {
//   const [open, setOpen] = useState(false);
  
//   return (
//     <Card sx={{ mb: 2, boxShadow: 2 }}>
//       <CardContent>
//         <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//           <Typography variant="h6" component="div">
//             PNR: {row.pnr}
//           </Typography>
//           <IconButton
//             size="small"
//             onClick={() => setOpen(!open)}
//           >
//             {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
//           </IconButton>
//         </Box>
        
//         <Stack spacing={1} mb={2}>
//           <Typography variant="body2">
//             <strong>Name:</strong> {row.firstName + " " + row.lastName}
//           </Typography>
//           <Typography variant="body2">
//             <strong>Email:</strong> {row.email}
//           </Typography>
//           <Typography variant="body2">
//             <strong>Purpose:</strong> {row.purpose}
//           </Typography>
//           <Typography variant="body2">
//             <strong>Arrival:</strong>{" "}
//             {new Date(row.arrivalDateTime).toLocaleString(undefined, {
//               month: "numeric",
//               day: "numeric",
//               year: "numeric",
//               hour: "numeric",
//               minute: "numeric",
//               hour12: true,
//               timeZone: 'UTC',
//             })}
//           </Typography>
//           <Typography variant="body2">
//             <strong>Departure:</strong>{" "}
//             {new Date(row.departureDateTime).toLocaleString(undefined, {
//               month: "numeric",
//               day: "numeric",
//               year: "numeric",
//               hour: "numeric",
//               minute: "numeric",
//               hour12: true,
//               timeZone: 'UTC',
//             })}
//           </Typography>
//         </Stack>

//         <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
//           {!row.draft && (
//             <Chip
//               label={row.visitstatus}
//               sx={{
//                 backgroundColor: status[row.visitstatus],
//                 p: 1,
//                 fontWeight: 600,
//                 fontSize: "0.8em",
//               }}
//             />
//           )}
//           {row.draft && (
//             <Button variant="contained" size="small" endIcon={<ArrowForwardIos />}>
//               View
//             </Button>
//           )}
          
//           {value == 1 && (
//             <Button
//               variant="outlined"
//               size="small"
//               startIcon={<PeopleOutlineRounded />}
//               onClick={() => {
//                 setModal(true);
//                 setsecondaryVisitors(row.secondaryvisitors);
//               }}
//             >
//               Visitors
//             </Button>
//           )}
//         </Box>

//         <Stack direction="row" spacing={1} mb={2}>
//           <Button
//             variant="contained"
//             size="small"
//             sx={{ backgroundColor: "success.main", flex: 1 }}
//             onClick={() => handleApprove(row)}
//             disabled={
//               row.visitstatus == "Cancelled" ||
//               row.visitstatus == "Ongoing" ||
//               row.visitstatus == "Completed" ||
//               row.visitstatus == "Approved"
//             }
//           >
//             Approve
//           </Button>
//           <Button
//             variant="contained"
//             size="small"
//             sx={{ backgroundColor: "error.main", flex: 1 }}
//             disabled={row.visitstatus == "Cancelled"}
//             onClick={() => handleCancel(row)}
//           >
//             Cancel
//           </Button>
//         </Stack>

//         <Collapse in={open} timeout="auto" unmountOnExit>
//           <Divider sx={{ mb: 2 }} />
//           <Typography variant="subtitle2" gutterBottom>
//             Additional Details
//           </Typography>
//           <Stack spacing={2}>
//   {row.history.map((historyRow, index) => (
//     <Box
//       key={index}
//       sx={{
//         p: 2,
//         border: '1px solid #ccc',
//         borderRadius: 2,
//         backgroundColor: '#f9f9f9',
//       }}
//     >
//       <Button
//         startIcon={<ImageIcon />}
//         variant="outlined"
//         sx={{ mb: 1 }}
//         onClick={() => handleModalImgOpen(row.pnr)}
//       >
//         View Image
//       </Button>

//       <Typography variant="body2">
//         <strong>Gender:</strong> {historyRow.gender}
//       </Typography>
//       <Typography variant="body2">
//         <strong>Age:</strong> {historyRow.age}
//       </Typography>
//       <Typography variant="body2">
//         <strong>Office Email:</strong> {historyRow.officeemail}
//       </Typography>
//       <Typography variant="body2">
//         <strong>Phone:</strong> {historyRow.phoneNumber}
//       </Typography>
//       <Typography variant="body2">
//         <strong>State:</strong> {historyRow.state}
//       </Typography>
//       <Typography variant="body2">
//         <strong>District:</strong> {historyRow.district}
//       </Typography>
//       <Typography variant="body2">
//         <strong>Address:</strong> {historyRow.address}
//       </Typography>
//       <Typography variant="body2">
//         <strong>Pin Code:</strong> {historyRow.pincode}
//       </Typography>
//     </Box>
//   ))}
// </Stack>

//         </Collapse>
//       </CardContent>
//     </Card>
//   );
// };
const MobileVisitorCard = ({ row, value, handleApprove, handleCancel, setModal, setsecondaryVisitors }) => {
  const [open, setOpen] = useState(false);
  const [modalImgOpen, setModalImgOpen] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState(null);
  const [modalImgLoading, setModalImgLoading] = useState(false);

  // Handler to open modal and fetch image
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

  return (
    <>
      <Card sx={{ mb: 2, boxShadow: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">PNR: {row.pnr}</Typography>
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Box>

          <Stack spacing={1} mb={2}>
            <Typography variant="body2"><strong>Name:</strong> {row.firstName} {row.lastName}</Typography>
            <Typography variant="body2"><strong>Email:</strong> {row.email}</Typography>
            <Typography variant="body2"><strong>Purpose:</strong> {row.purpose}</Typography>
            <Typography variant="body2"><strong>Arrival:</strong> {new Date(row.arrivalDateTime).toLocaleString()}</Typography>
            <Typography variant="body2"><strong>Departure:</strong> {new Date(row.departureDateTime).toLocaleString()}</Typography>
          </Stack>

          <Box display="flex" justifyContent="space-between" mb={2}>
            {!row.draft ? (
              <Chip label={row.visitstatus} sx={{ backgroundColor: status[row.visitstatus], p: 1, fontWeight: 600, fontSize: "0.8em" }} />
            ) : (
              <Button variant="contained" size="small" endIcon={<ArrowForwardIos />}>View</Button>
            )}

            {value === 1 && (
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

          <Stack direction="row" spacing={1} mb={2}>
            <Button
              variant="contained"
              size="small"
              sx={{ backgroundColor: "success.main", flex: 1 }}
              onClick={() => handleApprove(row)}
              disabled={[
                "Cancelled",
                "Ongoing",
                "Completed",
                "Approved",
                "Failed"   // << added here
              ].includes(row.visitstatus)}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ backgroundColor: "error.main", flex: 1 }}
              onClick={() => handleCancel(row)}
              disabled={["Cancelled", "Failed"].includes(row.visitstatus)}
            >
              Cancel
            </Button>
          </Stack>

          <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" gutterBottom>Additional Details</Typography>
            <Stack spacing={2}>
              {row.history.map((historyRow, index) => (
                <Box key={index} sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2, backgroundColor: '#f9f9f9' }}>
                  <Button
                    startIcon={<ImageIcon />}
                    variant="outlined"
                    sx={{ mb: 1 }}
                    onClick={() => handleModalImgOpen(row.pnr)}
                  >
                    View Image
                  </Button>
                  <Typography variant="body2"><strong>Gender:</strong> {historyRow.gender}</Typography>
                  <Typography variant="body2"><strong>Age:</strong> {historyRow.age}</Typography>
                  <Typography variant="body2"><strong>Office Email:</strong> {historyRow.officeemail}</Typography>
                  <Typography variant="body2"><strong>Phone:</strong> {historyRow.phoneNumber}</Typography>
                  <Typography variant="body2"><strong>State:</strong> {historyRow.state}</Typography>
                  <Typography variant="body2"><strong>District:</strong> {historyRow.district}</Typography>
                  <Typography variant="body2"><strong>Address:</strong> {historyRow.address}</Typography>
                  <Typography variant="body2"><strong>Pin Code:</strong> {historyRow.pincode}</Typography>
                </Box>
              ))}
            </Stack>
          </Collapse>
        </CardContent>
      </Card>

      {/* Image Modal */}
      <Modal open={modalImgOpen} onClose={handleModalImgClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 2,
          boxShadow: 24,
          outline: 'none',
          width: 650,
          textAlign: 'center',
        }}>
          {modalImgLoading ? (
            <CircularProgress />
          ) : modalImgSrc ? (
            <>
              <img
                src={modalImgSrc}
                alt="Fetched content"
                style={{
                  width: '600px',
                  height: '400px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  display: 'block',
                  margin: '0 auto',
                  backgroundColor: '#f0f0f0',
                }}
              />
              <Button variant="contained" color="secondary" onClick={handleModalImgClose} sx={{ mt: 2 }}>
                Close
              </Button>
            </>
          ) : (
            <>
              <div>Image not available.</div>
              <Button variant="contained" color="secondary" onClick={handleModalImgClose} sx={{ mt: 2 }}>
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

const Page = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const auth = useAuth();
  const [refresh, setRefresh] = useState(false);
  const [state, setState] = useState({});
  const [modal, setModal] = useState(false);
  const [secondaryVisitors, setsecondaryVisitors] = useState([{}]);
  const [stateD, setStateD] = useState({});
  const [value, setValue] = React.useState(0);
  const [pnrData, setPNRData] = useState(null);
  const [qrData, setQRData] = useState("");
  const qrCodeRef = useRef(null);
  const [dataQR, setDataQR] = useState([]);
  const [dummy, setDummy] = useState(false);
  const [view, setView] = useState(null);
  
  const [modalImgOpen, setModalImgOpen] = useState(false);
  const [modalImgSrc, setModalImgSrc] = useState(null);
  const [modalImgLoading, setModalImgLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const headers = Object.keys(secondaryVisitors[0]);
  
  useEffect(() => {
    if (qrData != null) setView(true);
  }, [qrData]);

  const handleApprove = async (row) => {
    console.log("Row data Jo Approve Kiya", row);
    setStateD((prev) => {
      return { ...prev, openApprove: true, openCancel: false };
    });
    setPNRData(row);
  };

  const handleCancel = async (row) => {
    setStateD((prev) => {
      return { ...prev, openCancel: true, openApprove: false };
    });
    setPNRData(row);
  };

  console.log("pnrData::", pnrData);

  function Row({ row, index, value }) {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
    console.log("Row", row);

    return (
      <React.Fragment key={index}>
        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
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
          <TableCell align="center">
            {row.firstName + " " + row.lastName}
          </TableCell>
          <TableCell align="center">{row.email}</TableCell>
          <TableCell align="center">{row.purpose}</TableCell>
          <TableCell align="center">
            {new Date(row.arrivalDateTime).toLocaleString(undefined, {
              month: "numeric",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              timeZone: 'UTC',
            })}
          </TableCell>
          <TableCell align="center">
            {new Date(row.departureDateTime).toLocaleString(undefined, {
              month: "numeric",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
              timeZone: 'UTC',
            })}
          </TableCell>
          {!row.draft && (
            <TableCell align="right">
              <Chip
                label={row.visitstatus}
                sx={{
                  backgroundColor: status[row.visitstatus],
                  p: 2,
                  fontWeight: 600,
                  fontSize: "1em",
                }}
              />
            </TableCell>
          )}
          {row.draft && (
            <TableCell align="right">
              <Button variant="contained" endIcon={<ArrowForwardIos />}>
                View
              </Button>
            </TableCell>
          )}
          {value == 1 && (
            <TableCell align="right">
              <Button
                variant="contained"
                startIcon={<PeopleOutlineRounded />}
                onClick={() => {
                  console.log('row', row);
                  setModal(true);
                  setsecondaryVisitors(row.secondaryvisitors);
                }}
              >
              </Button>
            </TableCell>
          )}
          <TableCell>
            <Stack direction={isTablet ? "column" : "row"} spacing={1}>
              <Button
                variant="contained"
                size="small"
                sx={{ backgroundColor: "success.main" }}
                onClick={() => handleApprove(row)}
                disabled={[
                  "Cancelled",
                  "Ongoing",
                  "Completed",
                  "Approved",
                  "Failed"  
                ].includes(row.visitstatus)}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                size="small"
                sx={{ backgroundColor: "error.main" }}
                disabled={["Cancelled", "Failed","Completed"].includes(row.visitstatus)}
                onClick={() => handleCancel(row)}
              >
                Cancel
              </Button>
            </Stack>
          </TableCell>
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
                      <TableRow>
                      <TableCell>Photo</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell>Age</TableCell>
                        <TableCell align="right">Office Email</TableCell>
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
                        <TableCell>{<Button startIcon={<ImageIcon/> } variant="outlined" onClick={() => handleModalImgOpen(row.pnr)}>
                        View Image
                      </Button>}</TableCell>
                          <TableCell>{historyRow.gender}</TableCell>
                          <TableCell>{historyRow.age}</TableCell>
                          <TableCell align="right">
                            {historyRow.officeemail}
                          </TableCell>
                          <TableCell>{historyRow.phoneNumber}</TableCell>
                          <TableCell align="right">{historyRow.state}</TableCell>
                          <TableCell align="right">
                            {historyRow.district}
                          </TableCell>
                          <TableCell align="right">
                            {historyRow.address}
                          </TableCell>
                          <TableCell align="right">
                            {historyRow.pincode}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

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

  const generatePDF = async (data) => {
    return new Promise((resolve, reject) => {
      const pdf = new jsPDF();
      console.log("pnrData under pdf::", data);
      // Define gradient colors
      let endColor = [63, 81, 181, 0.3]; // Translucent blue color (RGBA)
      let startColor = [173, 216, 230]; // Light blue color (RGB)
      // var  endColor = [0, 0, 150]; // Blue color (RGB)
      // var startColor = [255, 180, 255]; // Violet color (RGB)
      let numRectangles = 100; // Number of rectangles to draw

      // Calculate color step for each rectangle
      let colorStep = [
        (endColor[0] - startColor[0]) / numRectangles,
        (endColor[1] - startColor[1]) / numRectangles,
        (endColor[2] - startColor[2]) / numRectangles,
      ];

      // Draw rectangles to create gradient effect
      let currentColor = startColor.slice(); // Copy start color

      // Dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const logoWidth = 40; // Adjust the logo width as needed
      const logoHeight = 40;
      const qrCodeWidth = 80; // Adjust the QR code width as needed
      const qrCodeHeight = 80;
      const contentMarginTop = 10; // Adjust the margin in points for content as needed

      // Draw QR code directly
      const qrCodeContainer = document.getElementById("qr-code");
      if (!qrCodeContainer) {
        console.error("QR code container not found");
        reject("QR code container not found");
      }

      qrCodeContainer.style.border = "5px solid red"; // Adjust the border size and color as needed
      qrCodeContainer.style.borderRadius = "10px"; // Optional: Add border-radius for rounded corners

      // Convert QR code container to image-
      const qrCodeImageData = qrCodeContainer.toDataURL("image/png");

      // Your PDF generation code...

      // Logo at the top
      const logoX = (pdfWidth - logoWidth) / 2;
      const logoY = contentMarginTop;
      pdf.setFillColor(245, 245, 245);
      pdf.setDrawColor(0, 0, 0); // Black border
      pdf.roundedRect(
        10,
        logoY - 2.5,
        pdfWidth - 20,
        logoHeight + 3,
        8,
        8,
        "F"
      );
      pdf.addImage(
        topLogo,
        "PNG",
        logoX - 5,
        logoY,
        logoWidth + 10,
        logoHeight - 5
      ); // Replace 'path/to/your/logo.png' with your logo path
      // QR code below the logo
      const qrCodeX = (pdfWidth - qrCodeWidth) / 2;
      const qrCodeY = logoY + logoHeight + 15; // Adjust the Y position as needed
      pdf.setFillColor(255, 255, 255); // White color
      pdf.setDrawColor(0, 0, 0); // Black border
      pdf.rect(
        qrCodeX - 10,
        qrCodeY - 10,
        qrCodeWidth + 25,
        qrCodeHeight + 25,
        "F"
      );
      pdf.addImage(
        qrCodeImageData,
        "PNG",
        qrCodeX - 5,
        qrCodeY - 5,
        qrCodeWidth + 15,
        qrCodeHeight + 15
      );

      pdf.addImage(
        logoUrl,
        "PNG",
        qrCodeX + 27,
        qrCodeY + 27,
        qrCodeWidth - 50,
        qrCodeHeight - 50
      );
      pdf.setLineWidth(2);
      pdf.rect(qrCodeX - 10, qrCodeY - 10, qrCodeWidth + 25, qrCodeHeight + 25);

      // Visitor name below the QR code at the center
      const visitorNameWidth = pdf.getStringUnitWidth(`PNR: Abc456Tvc`) * 24;
      const visitorNameX = pdfWidth - visitorNameWidth + 30; // Center the text
      const visitorNameY = qrCodeY + qrCodeHeight + 25; // Adjust the Y position as needed
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(24);
      const text = `PNR: Abc456Tvc`;

      var leftWidth = pdfWidth / 4;
      var rightWidth = (3 / 4) * pdfWidth;
      var borderWidth = 0.5;
      // Set the border style for the dotted line
      var borderStyle = [2, 2]; // Dotted line style

      // Set fill color to whitesmoke
      pdf.setFillColor(245, 245, 245);

      pdf.setLineDashPattern(borderStyle);
      pdf.setLineWidth(borderWidth);
      // Draw dotted line before rounded rectangles
      pdf.line(
        10,
        qrCodeY + qrCodeHeight + 25,
        pdfWidth - 10,
        qrCodeY + qrCodeHeight + 25
      );

      // Reset line dash pattern
      pdf.setLineDashPattern([]);
      // Draw left section
      const profileimg =
        "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
      let detailsSectionHeight = qrCodeY + qrCodeHeight + 40;
      pdf.setLineWidth(1);
      pdf.rect(10, detailsSectionHeight, leftWidth, 60);
      pdf.roundedRect(10, detailsSectionHeight, leftWidth, 60, 5, 0, "F");
      pdf.addImage(
        "dummy.jpeg",
        "JPEG",
        15,
        detailsSectionHeight + 5,
        leftWidth - 10,
        50
      );
      pdf.setLineWidth(1);
      pdf.rect(leftWidth + 13, detailsSectionHeight, rightWidth - 20, 60);
      pdf.roundedRect(
        leftWidth + 13,
        detailsSectionHeight,
        rightWidth - 20,
        60,
        0,
        5,
        "F"
      );

      pdf.setTextColor(255, 255, 255);
      pdf.setTextColor(0, 0, 0); // Set text color to black
      pdf.setFont("bold"); // Set font style to bold
      pdf.setFontSize(14); // Set font size to larger
      detailsSectionHeight += 7;
      pdf.text(`PNR: ${pnrData.pnr}`, leftWidth + 17, detailsSectionHeight);
      detailsSectionHeight += 7;
      pdf.text(
        `Visitor Name: ${pnrData.firstName} ${pnrData.lastName}`,
        leftWidth + 17,
        detailsSectionHeight
      );
      detailsSectionHeight += 7;
      pdf.text(
        `Visitor Org: ${pnrData.organization}`,
        leftWidth + 17,
        detailsSectionHeight
      );
      detailsSectionHeight += 7;
      pdf.text(
        `In Time: ${new Date(pnrData.arrivalDateTime).toLocaleString(
          undefined,
          {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true, timeZone : 'UTC',
          }
        )}`,
        leftWidth + 17,
        detailsSectionHeight
      );
      detailsSectionHeight += 7;
      pdf.text(
        `Out Time: ${new Date(pnrData.departureDateTime).toLocaleString(
          undefined,
          {
            month: "numeric",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true, timeZone : 'UTC',
          }
        )}`,
        leftWidth + 17,
        detailsSectionHeight
      );
      detailsSectionHeight += 7;
      pdf.text(
        `Host Name: ${pnrData.hostname}`,
        //`Host Name: ${auth?.user?.name}`,
        leftWidth + 17,
        detailsSectionHeight
      );
      detailsSectionHeight += 7;
      pdf.text(
        `Purpose: ${pnrData.purpose}`,
        leftWidth + 17,
        detailsSectionHeight
      );
      pdf.setFont("normal"); // Reset font style

      // Draw border around the entire content
      pdf.setDrawColor(0, 0, 0); // Set border color to red (adjust as needed)
      pdf.setLineWidth(1);
      pdf.rect(5, 5, pdfWidth - 10, pdfHeight - 10);

      // // Save the PDF file locally
      // const pdfFileName = "qrcodes.pdf";
      // pdf.save(pdfFileName);

      // Write the PDF data to a file
      // fs.writeFile('qrcodes.pdf', pdf.output(), 'binary', (err) => {
      //   if (err) {
      //       console.error('Error writing PDF file:', err);
      //   } else {
      //       console.log('PDF file written successfully');
      //   }
      // });
      const pdfBlob = pdf.output("blob");
      resolve(pdfBlob);
      // // Convert PDF data to base64
      // const pdfData = pdf.output('blob');
      // const reader = new FileReader();
      // reader.onloadend = function () {
      //     const base64Data = reader.result.split(',')[1];
      //     resolve(base64Data); // Resolve the Promise with the base64 data
      // };
      // reader.readAsDataURL(pdfData);
    });
  };

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]);
      };
      reader.onerror = reject;
    });
  }

  const sendDataToBackend = async (modifiedData) => {
    // Receive headers as a separate argument
    try {
      // Replace the URL with your actual backend endpoint
      if (false) {
        const token = modifiedData.token;
        console.log("token in approve ::", token);

        const headers = {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
        };
        const backendEndpoint = `https://10.244.3.101:8000/api/v1/handleVisits/approvalOrgVisit/${pnrData.pnr}`;
        console.log("sendDataToBackend::", modifiedData);

        // Make a PUT request to the backend with headers
        const response = await axios.put(backendEndpoint, modifiedData, {
          headers,
        });
        console.log("response after update::", response.data);
        handleClose();
        setState({
          severity: "success",
          message: "Submitted Successfully",
          open: true,
        });
      } else {
        const token = modifiedData.token;
        console.log("token in approve ::", token);

        // const headers = {
        //   Authorization: `Bearer ${token}`,
        //   // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
        // };

        const headers= {
          Authorization: `Bearer ${auth?.user?.accessToken}`
        }

        
        let backendEndpoint;
        if (value == 0) {
          backendEndpoint = `${API}/handleVisits/approvalIndVisit/${pnrData.pnr}`;
        } else if (value == 1) {
          backendEndpoint = `${API}/handleVisits/approvalOrgVisit/${pnrData.pnr}`;
        }

        console.log("sendDataToBackend::", modifiedData);

        // Make a PUT request to the backend with headers
        const response = await axios.put(backendEndpoint, modifiedData, {
          headers,
        });
        console.log("response after update::", response.data);
        handleClose();
        setState({
          severity: "success",
          message: "Submitted Successfully",
          open: true,
        });
      }
    } catch (error) {
      console.error("Error sending data to backend:", error);
      setState({
        severity: "error",
        message: error.response.errors[0],
        open: true,
      });
    }
  };
  const sendDataToBackend1 = async (modifiedData) => {
    // Receive headers as a separate argument
    try {
      // Replace the URL with your actual backend endpoint
      if (false) {
        const token = modifiedData.token;
        console.log("token in approve ::", token);

        const headers = {
          Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
        };
        const backendEndpoint = `https://10.244.3.101:8000/api/v1/handleVisits/approvalOrgVisit/${pnrData.pnr}`;
        console.log("sendDataToBackend::", modifiedData);

        // Make a PUT request to the backend with headers
        const response = await axios.put(backendEndpoint, modifiedData, {
          headers,
        });
        console.log("response after update::", response.data);
        handleClose();
        setState({
          severity: "success",
          message: "Submitted Successfully",
          open: true,
        });
      } else {
        const token = modifiedData.token;
        console.log("token in approve ::", token);

        // const headers = {
        //   Authorization: `Bearer ${token}`,
        //   // 'Content-Type': 'multipart/form-data', // Assuming your token is a bearer token
        // };

        const headers= {
          Authorization: `Bearer ${auth?.user?.accessToken}`
        }
        let backendEndpoint;
        if (value == 0) {
          backendEndpoint = `${API}/handleVisits/CancelIndVisit/${pnrData.pnr}`;
        } else if (value == 1) {
          backendEndpoint = `${API}/handleVisits/CancelOrgVisit/${pnrData.pnr}`;
        }

        console.log("sendDataToBackend::", modifiedData);

        // Make a PUT request to the backend with headers
        const response = await axios.put(backendEndpoint, modifiedData, {
          headers,
        });
        console.log("response after update::", response.data);
        handleClose();
        setState({
          severity: "success",
          message: "Submitted Successfully",
          open: true,
        });
      }
    } catch (error) {
      console.error("Error sending data to backend:", error);
      setState({
        severity: "error",
        message: error.response.errors[0],
        open: true,
      });
    }
  };

  const [loadingApprove, setLoadingApprove] = useState(false);
const [loadingCancel, setLoadingCancel] = useState(false);


  const handleApproveConfirm = async () => {
    try {
      setLoadingApprove(true); // start loader
  
      console.log("handleApproveConfirm ~ pnrData: ", pnrData);
  
      let PNRType = value === 0 ? "Individual" : "Organization";
      pnrData.type = PNRType;
  
      const pdfData = {
        visitorinfo: {
          type: PNRType,
          visitors: 1,
          visitend: pnrData.departureDateTime,
        },
      };
  
      const token = jwt.sign(pdfData, "approvecancel");
      //const qrCodeURL = `${Frontend_API}/verifyPNR/${pnrData.pnr}/${token}`;
      const qrCodeURL = `${Frontend_API}/trackVisit/${pnrData.pnr}`;

      // Set QR
      await new Promise((resolve) => {
        setQRData(qrCodeURL);
        resolve();
      });
  
      // Create PDF
      const pdfBlob = await generatePDF(pnrData);
      const base64Data = await blobToBase64(pdfBlob);
  
      await sendDataToBackend({
        ...pnrData,
        approveByHost: true,
        base64Data,
        token,
        qrData: qrCodeURL,
      });
  
      setDummy((prev) => !prev);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingApprove(false); // stop loader
      handleClose(); // close dialog
    }
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


  // Trigger a side-effect when qrData changes
  useEffect(() => {
    if (qrData) {
      // Force the QR code to render correctly
      qrCodeRef.current?.render();
    }
  }, [qrData]);
  console.log("qrData:::", qrData); // Check the generated PDF blob

  const handleCancelConfirm = async () => {
    try {
      setLoadingCancel(true); // start loader
  
      let PNRType = value === 0 ? "Individual" : "Organization";
      pnrData.type = PNRType;
  
      const pdfData = {
        visitorinfo: {
          type: PNRType,
          visitors: 1,
          visitend: pnrData.departureDateTime,
        },
      };
  
      const token = jwt.sign(pdfData, "approvecancel");
  
      await sendDataToBackend1({
        ...pnrData,
        approveByHost: false,
        token,
      });
  
      setDummy((prev) => !prev);
    } catch (error) {
      console.error("Error sending data:", error);
    } finally {
      setLoadingCancel(false); // stop loader
      handleClose(); // close dialog
    }
  };

  const slicedData = data?.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        let response;
        if (value == 0) {
          response = await axios.get(
            `/host/individualVisits/${auth?.user?.email}`,
            {
              headers: {
                Authorization: `Bearer ${auth?.user?.accessToken}`
              }
            }
          );
          console.log("/host/individualVisits response: ", response);
        } else if (value == 1) {
          response = await axios.get(
            `/host/organizationVisits/${auth?.user?.email}`,
            {
              headers: {
                Authorization: `Bearer ${auth?.user?.accessToken}`
              }
            }
          );
        }

        setState({
          severity: "success",
          message: "Fetched Successfully",
          open: true,
        });
        if (response.data && response.data.data.length > 0) {
          setData(
            response.data.data.map((visitor) =>
              createData(
                visitor.pnr,
                visitor.approvedByHost,
                visitor.visitorfirstname,
                visitor.visitorlastname,
                visitor.visitoremail,
                visitor.purpose,
                visitor.visitstart,
                visitor.visitend,
                visitor.visitorgender,
                visitor.visitorage,
                visitor.visitoremail,
                visitor.employee,
                visitor.deptName,
                visitor.hostcontact,
                visitor.visitorstate,
                visitor.visitordistrict,
                visitor.visitoraddress,
                visitor.visitorpincode,
                visitor.visitstatus,
                visitor.draft,
                visitor.visitororganization,
                visitor.hostname,
                visitor.secondaryvisitors
              )
            ).reverse()
          );
        } else {
          console.log("No data");
          setState({ severity: "warning", message: "No Data", open: true });
          setData([]);
        }
      } catch (error) {
        setState({
          severity: "error",
          message: "Error Fetching, try refreshing",
          open: true,
        });
        console.error("Error fetching data:", error.message);
        setData([]);
      }
    };
    fetchData();
    console.log(state);
  }, [refresh, value, dummy, auth?.user?.accessToken]);

  const vertical = "top";
  const horizontal = "center";
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

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: isMobile ? 1 : 3 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }

  const onClose = () => {
    setModal(false);
    setsecondaryVisitors([{}]);
  };

  CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  if (auth?.user?.roles === Roles["Host"]) {
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
            sx={{ width: "100%" }}
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
            width: 650,
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
                  width: '600px',
                  height: '400px',
                  objectFit: 'contain', // This ensures no cropping
                  borderRadius: '8px',
                  display: 'block',
                  margin: '0 auto',
                  backgroundColor: '#f0f0f0', // fallback bg if image doesn't fill
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

      
  
        <React.Fragment>
          <Dialog
            open={stateD.openApprove}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-describedby="alert-dialog-slide-description"
            fullScreen={isMobile}
          >
            <DialogTitle>{"Approve the Meeting?"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-slide-description">
                By approving, you&apos;re agreeing to be responsible for the
                visitors on campus. If there are any incidents, you might be
                asked to provide more information.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
  <Button onClick={handleClose} disabled={loadingApprove}>
    Close
  </Button>

  <Button
    variant="contained"
    onClick={handleApproveConfirm}
    disabled={loadingApprove}
    startIcon={
      loadingApprove ? <CircularProgress size={20} thickness={4} /> : null
    }
  >
    {loadingApprove ? "Processing..." : "Agree"}
  </Button>
</DialogActions>

          </Dialog>
        </React.Fragment>
  
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
  <Button onClick={handleClose} disabled={loadingCancel}>
    Close
  </Button>

  <Button
    variant="contained"
    onClick={handleCancelConfirm}
    disabled={loadingCancel}
    startIcon={
      loadingCancel ? <CircularProgress size={20} thickness={4} /> : null
    }
  >
    {loadingCancel ? "Processing..." : "Proceed"}
  </Button>
</DialogActions>

          </Dialog>
        </React.Fragment>
  
        {view && qrData && (
          <CustomQRCode
            id="qr-code"
            ref={qrCodeRef}
            value={qrData}
            logo={logoUrl}
          />
        )}
        
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
                <Stack
                  direction={isMobile ? "column" : "row"}
                  display={"flex"}
                  spacing={2}
                  justifyContent={"center"}
                  alignItems={"center"}
                  m={1}
                >
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    align="center"
                    gutterBottom
                  >
                    Visitor Details
                  </Typography>
                </Stack>
                <Box sx={{ width: "100%" }}>
                  <Box
                    sx={{
                      borderBottom: 1,
                      borderColor: "divider",
                      display: "flex",
                      justifyContent: "center",
                      backgroundColor: "white",
                    }}
                  >
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
                            handleApprove={handleApprove}
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
                      // Desktop Table View
                      <Box sx={{ overflowX: 'auto' }}>
                        <TableContainer component={Paper}>
                          <Table aria-label="collapsible table">
                            <TableHead>
                              <TableRow>
                                <TableCell />
                                <TableCell align="center">PNR</TableCell>
                                <TableCell align="center">Name</TableCell>
                                <TableCell align="center">Email</TableCell>
                                <TableCell align="center">Purpose</TableCell>
                                <TableCell align="center">Arrival Date</TableCell>
                                <TableCell align="center">Departure Date</TableCell>
                                <TableCell align="center">Status</TableCell>
                                <TableCell align="center">Action</TableCell>
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
                            rowsPerPageOptions={[5, 10, 20]}
                            component="div"
                            count={data?.length || 0}
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
              );
            }
          };
          Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
          
          export default Page;