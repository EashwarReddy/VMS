import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Button,
  Chip,
  Container,
  Modal,
  Grid
} from "@mui/material";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Slide from "@mui/material/Slide";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { blue, indigo } from "@mui/material/colors";
import axios from "axios";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function createData(
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
  city,
  address,
  pincode
) {
  return {
    firstName,
    lastName,
    email,
    purpose,
    arrivalDateTime,
    departureDateTime,
    history: [
      {
        date: "2022-01-01", // You may want to use a real date
        customerId: "12345", // Sample values, replace with actual data
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
      // You can add more history entries as needed
    ],
  };
}

// Assume fetchData and setData are part of your component

const Page = () => {

  const [data, setData] = useState([]);
  const status = {
    "In Campus": "success.main",
    "Exited": "warning.main",
    "Pending": "info.main",
    "Blocked": "error.main",
  };
  
  const [dopen, setDOpen] = React.useState(false);
  const [dvistor, setDVisitor] = useState({});
  const handleClickOpen = () => {
    setDOpen(true);
  };

  const handleClose = () => {
    setDOpen(false);
    setDVisitor({});
  };
  const myRow = [
    {
      pnr: "aedads-2dasd-3434d",
      firstName: "Sekiro",
      lastName: "Hirata",
      email: "test@test.in",
      purpose: "to meet the HR",
      status: "In Campus",
    },
    {
      pnr: "grscds-d3asd-5611d",
      firstName: "Gyoubu",
      lastName: "Oniwa",
      email: "test@test.in",
      purpose: "Getting docs verified",
      status: "Exited",
    },
    {
      pnr: "frdcds-da7sd-6674d",
      firstName: "Genichiro",
      lastName: "Ashina",
      email: "test@test.in",
      purpose: "To submit Documents",
      status: "Blocked",
    },
  ];


  function Row({ row, index }) {
    const [open, setOpen] = React.useState(false);
    return (
      <React.Fragment>
        <TableRow
          sx={{ "& > *": { borderBottom: "unset" }, backgroundColor: "white" }}
        >
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
          <TableCell align="center" component="th" scope="row">
            {row.firstName}
          </TableCell>
          <TableCell align="center">{row.lastName}</TableCell>
          <TableCell align="center">{row.email}</TableCell>
          <TableCell align="center">{row.purpose}</TableCell>
          <TableCell align="center">
            <Chip
              label={row.status}
              variant="filled"
              size="medium"
              sx={{
                backgroundColor: status[row.status],
                p: 2,
                fontWeight: 600,
                fontSize: "1em",
              }}
            />
          </TableCell>
          <TableCell align="center">
            <Button
              variant="contained"
              onClick={() => {
                handleClickOpen();
                setDVisitor({
                  name: row.firstName + " " + row.lastName,
                  pnr: row.pnr,
                });
              }}
            >
              Action
            </Button>

          </TableCell>

          <TableCell align="center">
            <Button
              variant="contained"

            >
              All Details
            </Button>

          </TableCell>


        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Typography>No Data Yet</Typography>
              <TableRow
                sx={{
                  "& > *": { borderBottom: "unset" },
                  backgroundColor: "white",
                }}
              >
                <TableCell>
                  <IconButton
                    aria-label="expand row"
                    size="small"
                    onClick={() => setOpen(!open)}
                  >
                    {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>

                <TableCell
                  component="th"
                  scope="row"
                  style={{ paddingBottom: 0, paddingTop: 0 }}
                  colSpan={7}
                >
                  {row.pnr}
                </TableCell>
                <TableCell component="th" scope="row">
                  {row.firstName}
                </TableCell>
                <TableCell align="right">{row.lastName}</TableCell>
                <TableCell align="right">{row.email}</TableCell>
                <TableCell align="right">{row.purpose}</TableCell>
                <TableCell align="right">{row.arrivalDateTime}</TableCell>
                <TableCell align="right">{row.departureDateTime}</TableCell>
              </TableRow>
            </Collapse>
          </TableCell>
        </TableRow>
        {/* <TableBody>
                    {row.history.map((historyRow) => (
                      <TableRow key={historyRow.pnr}>
                        <TableCell>{historyRow.firstName}</TableCell>
                        <TableCell>{historyRow.lastName}</TableCell>
                        <TableCell align="right">{historyRow.email}</TableCell>
                        <TableCell align="right">{historyRow.purpose}</TableCell>
                        <TableCell>{historyRow.arrivalDateTime}</TableCell>
                        <TableCell>{historyRow.departureDateTime}</TableCell>
                      
                       
                      </TableRow>
                    ))}
                  </TableBody> */}
        {/* <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                                <Typography variant="h6" gutterBottom component="div">
                                    Travel Schedule
                                </Typography>
                                <Table size="small" aria-label="purchases">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Gender</TableCell>
                                            <TableCell>Age</TableCell>
                                            <TableCell align="right">Office Email</TableCell>
                                            <TableCell align="right">Employee</TableCell>
                                            <TableCell>Department Name</TableCell>
                                            <TableCell>Phone</TableCell>
                                            <TableCell align="right">State</TableCell>
                                            <TableCell align="right">City</TableCell>
                                            <TableCell align="right">Address</TableCell>
                                            <TableCell align="right">Pin Code</TableCell>
                                            <TableCell align="right">Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {row.history.map((historyRow) => (
                                            <TableRow key={historyRow.date}>
                                      
                                                <TableCell>{historyRow.gender}</TableCell>
                                                <TableCell>{historyRow.age}</TableCell>
                                                <TableCell align="right">{historyRow.officeemail}</TableCell>
                                                <TableCell align="right">{historyRow.employee}</TableCell>
                                                <TableCell>{historyRow.departmentName}</TableCell>
                                                <TableCell>{historyRow.phoneNumber}</TableCell>
                                                <TableCell align="right">{historyRow.state}</TableCell>
                                                <TableCell align="right">{historyRow.city}</TableCell>
                                                <TableCell align="right">{historyRow.address}</TableCell>
                                                <TableCell align="right">{historyRow.pincode}</TableCell>
                                                <TableCell align='right'><Button variant='contained' size='small' onClick={() => { setFill(true) }}>Fill Details</Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow> */}
      </React.Fragment>
    );
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://10.244.3.187:4000/api/v1/getAllVisitors"
        );

        if (response.data && response.data.length > 0) {
          setData(
            response.data.map((visitor) =>
              createData(
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
                visitor.depttName,
                visitor.phoneNumber,
                visitor.state,
                visitor.city,
                visitor.address,
                visitor.pincode
              )
            )
          );
        } else {
          console.log("No data found for the given pincode");
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    fetchData();
  }, []);
  const addRows = () => { };
  return (
    <>
      <Head>
        <title>Monitor Users</title>
      </Head>
      <React.Fragment>
        <Dialog
          open={dopen}
          TransitionComponent={Transition}
          keepMounted
          onClose={handleClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{`User : ${dvistor.name}, PNR : ${dvistor.pnr}`}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Specifiy certain action for the visitor, In case of any suspicious
              acitivity or emergency contact central authority for immediate
              action.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="conatined"
              sx={{ backgroundColor: "success.main" }}
              onClick={handleClose}
            >
              Allow
            </Button>
            <Button
              variant="conatined"
              sx={{ backgroundColor: "info.main" }}
              onClick={handleClose}
            >
              Check
            </Button>
            <Button
              variant="conatined"
              sx={{ backgroundColor: "warning.main" }}
              onClick={handleClose}
            >
              Hold
            </Button>
            <Button
              variant="conatined"
              sx={{ backgroundColor: "error.main" }}
              onClick={handleClose}
            >
              Block
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
          backgroundColor: "#280C58",
        }}
      >
        <Container>
          <Grid container justifyContent="center">
            <Grid
              item
              xs={12}
              component={Paper}
              sx={{ p: 2, background: blue[50] }}
            >
              <Typography variant="h4" align="center" gutterBottom>
                Monitor Visitors
              </Typography>
              <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>PNR number</TableCell>
                      <TableCell align="center">First Name</TableCell>
                      <TableCell align="center">Last Name</TableCell>
                      <TableCell align="center">Email</TableCell>
                      <TableCell align="center">Purpose</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Action</TableCell>
                      <TableCell align="center">All Details</TableCell>

                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ backgroundColor: indigo[50] }}>
                    {myRow.map((row) => (
                      <Row key={row.name} row={row} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
