import Head from "next/head";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Autocomplete from "@mui/material/Autocomplete";
import emails from "../components/emails";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Snackbar,
  Typography,
  Modal,
  Stack,
  Divider,
  LinearProgress,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";

// import {  Input } from '@material-ui/core';
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import ExcelDataTable from "./exceldataTable"; // Import the ExcelDataTable component
// import {sampleData} from './sample.xls'

import {
  Button,
  Container,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { blue, indigo } from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";
import axios, { normalaxios } from "src/api/axios";
import { useFormik } from "formik";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import * as Yup from "yup";
import { useAuth } from "src/hooks/use-auth";
// import * as XLSX from 'xlsx';
import { saveAs } from "file-saver";
import { useRouter } from "next/router";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { Close, DoneAllOutlined, FileUpload, PhotoCamera } from "@mui/icons-material";

import MockWebcamCapture from "src/components/WebCam";

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  gender: Yup.string().required("Gender is required"),
 
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  // officeemail: Yup.string()
  //   .email("Invalid office email address")
  //   .required(" Official Email is required"),
  officeemail: Yup.string()
    .required("Please mention the Employee Email who referred you"),
    
  purpose: Yup.string().required("Purpose is required"),
  employee: Yup.string().required("Employee Name is required"),
  deptName: Yup.string().required("Department name or Group Name is required"),
  phoneNumber: Yup.string()
    .required("Phone Number is required")
    .matches(
      /^(\+91[\-\s]?)?[56789]\d{9}$/,
      "Invalid Indian phone number. Please enter a valid Indian phone number with 10 digits."
    ),

  contact: Yup.string()
    .required("Phone Number is required")
    .matches(
      /^(\+91[\-\s]?)?[56789]\d{9}$/,
      "Invalid Indian phone number. Please enter a valid Indian phone number with 10 digits."
    ),
  organization: Yup.string().required("organization name is required"),
  govtIdType: Yup.string().required("Government ID is required"),

  // govtIdNumber: Yup.string().required("Government ID Number is required"),
  govtIdNumber: Yup.string().required("Government ID Number is required"),
  // .test("lastFourDigits", "Enter only the ", (value) => {
  //   // Check if the value is exactly 4 digits or empty
  //   return !value || /^\d{4}$/.test(value);
  // }),
  visitorType: Yup.string().required("Visitor type is required"),

  state: Yup.string().required("State is required"),
  district: Yup.string().required("district is required"),
  address: Yup.string().required("Organization Address is required"),
  pincode: Yup.string().required("Pincode is required"),

  arrivalDateTime: Yup.string().required("Arrival date and time  is required"),
  // .matches(
  //   /^([01]\d|2[0-3]):[0-5]\d$/,
  //   "Invalid Arrival Time. Please enter a valid time in HH:mm format"
  // ),

  departureDateTime: Yup.date().required("Departure date and time is required"),
  // .when(
  //   "arrivalDate",
  //   (arrivalDate, schema) =>
  //     arrivalDate &&
  //     schema.min(arrivalDate, "Departure date should be after Arrival date")
  // )

  // .when(
  //   "arrivalTime",
  //   (arrivalTime, schema) =>
  //     arrivalTime &&
  //     schema.min(arrivalTime, "Departure time should be after Arrival time")
  // ),

  pickupDateTime: Yup.string().required("pickup date and time  is required"),
  dropoffDateTime: Yup.string().required("Arrival date and time  is required"),
  isStaying: Yup.boolean()
    .required("Please indicate if you are staying")
    .oneOf([true], "You must indicate if you are staying or not"),
  isTraveling: Yup.boolean()
    .required("Please indicate if you are traveling")
    .oneOf([true], "You must indicate if you are traveling or not"),
});

const AccommodationSchema = Yup.object().shape({
  accFromDate: Yup.date().required("From Date is required"),
  // .min(new Date(), "Arrival Date should be today or in the future"),

  accToDate: Yup.string().required("To date is required"),
});

const TransportationSchema = Yup.object().shape({
  pickupLocation: Yup.string().when("isTraveling", {
    is: true,
    then: () => Yup.string().required("Pickup Location is required"),
  }),
  dropoffLocation: Yup.string().when("isTraveling", {
    is: true,
    then: () => Yup.string().required("Drop-off Location is required"),
  }),
  pickupDateTime: Yup.date().when("isTraveling", {
    is: true,
    then: () => Yup.date().required("Pickup Date and Time is required"),
  }),
  dropoffDateTime: Yup.date().when("isTraveling", {
    is: true,
    then: () => Yup.date().required("Drop-off Date and Time is required"),
  }),

  // ... other transportation-related fields
});
const now = new Date();

const Page = () => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [minDate, setMinDate] = React.useState("");

  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [open, setOpen] = React.useState({ open: false });
  const [sOpen, setSOpen] = useState({ open: false });
  const [state, setState] = useState({});
  const [circ, setCirc] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
    const [profileImage,setProfileImage] = useState(null)
    const [preview, setPreview] = useState(null);
    const [details, setDetails] = useState(true)
      const [isUploading,setIsUploading] = useState(false)
    const [webCam,setWebCam] = useState(false)
    
  const [selectedFile, setSelectedFile] = useState(null);

  const handleOpen = () =>
    setOpen((prev) => {
      return { ...prev, open: true };
    });
  const handleClose = () => {
    setOpen((prev) => {
      return { ...prev, open: false };
    });
    setSOpen((prev) => {
      return { ...prev, open: false };
    });
  };
  const router = useRouter();
  const auth = useAuth();
  const handleCloseSnackbar = () => {
    setState({ ...state, open: false });
    setIsRegistrationSuccess(false);
  };

  const [data, setData] = useState([
    {
      firstName: "",
      lastName: "",
      email: "",
      state: "",
      gender: "",
      district: "",
      address: "",
      pincode: "",
      age: "",
      contact: "",
      arrivalDateTime: "",
      "GovernmentId Type": "",
      departureDateTime: "",
    },
  ]);

  const [jsonData1, setJsonData] = useState();
  const [error, setError] = useState(null);


  const formik = useFormik({
    initialValues: {
      pnr: "",
      firstName: "",
      lastName: "",
      gender: "",
      age: "",
      contact: "",
      state: "",
      district: "",
      address: "",
      pincode: "",
      purpose: "",
      officeemail: "",
      email: "",
      employee: "",
      deptName: "",
      phoneNumber: "",
      govtIdType: "",
      govtIdNumber: "",
      visitorType: "",
      organization: "",
      pickupDateTime: "",
      dropoffDateTime: "",
      pickupLocation: "",
      dropoffLocation: "",
      isStaying: false,
      isTraveling: false,
      localConveyanceEntries: {
        pickupDateTime: "",
        pickupLocation: "",
        dropoffLocation: "",
        dropoffDateTime: "",
      },
    },
    validationSchema: Yup.object()
      .concat(RegisterSchema)
      .concat(AccommodationSchema)
      .concat(TransportationSchema),
    pincode: Yup.string()
      .required("Pincode is required")
      .matches(/^\d{6}$/, "Invalid Pincode"),
    state: Yup.string().required("State is required"),
    district: Yup.string().required("District is required"),
    localConveyanceEntries: Yup.array().of(
      Yup.object().shape({
        pickupDateTime: Yup.string().required(
          "Pickup Date and Time is required"
        ),
        pickupLocation: Yup.string().required("pickupLocation is required"),
        dropoffLocation: Yup.string().required("dropoff location is required"),
        dropoffDateTime: Yup.string().required(
          " dropoff Date Time is required"
        ),
        // ... Add validations for other Local Conveyance fields
      })
    ),
    onSubmit: async (values) => {
      console.log(values);
      // Implement your form submission logic here
      console.log("Form submitted with values:", values, jsonData1);
      const lastFourDigits = values.govtIdNumber
        ? values.govtIdNumber.slice(-4)
        : "";
      const newValues = { ...values, submittedby: auth?.user?.email, arrivalDateTime : formik.values.arrivalDateTime+':00.000+00:00', departureDateTime : formik.values.departureDateTime+':00.000+00:00', pickupDateTime: formik.values.pickupDateTime+':00.000+00:00' ,dropoffDateTime:formik.values.dropoffDateTime+':00.000+00:00' };
      // Now you can use 'lastFourDigits' as needed
      console.log("Last Four Digits:", lastFourDigits);

      try {
        const response = await axios.post('/visit/visitindividual', newValues, {
          headers: {
            Authorization: `Bearer ${auth?.user?.accessToken}`,
          },
        });
        console.log("Response for standard individual", response);
        setState({
          severity: "success",
          message: "Submitted Successfully",
          open: true,
        });
      } catch (error) {
        console.log("Error", error);
        setState({
          severity: "error",
          message: error.response.data.errors[0],
          open: true,
        });
      }
    },
  });

  const [tabValue, setTabValue] = React.useState(0);
  const tabIndicatorColor = "secondary"; // Change this to the color you want for the indicator
  const tabTextColor = "secondary"; // Change this to the color you want for the text
  const [travel, setTravel] = useState([]);
  const handleTabChange = (event, newValue) => {
    // console.log('formik touched', formik.touched, formik.dirty)
    if (formik.dirty) {
      setOpen({ open: true, val: newValue });
    } else {
      setTabValue(newValue);
    }
  };



  useEffect(() => {
    const getStateAndCity = async (pincode) => {
      try {
        const response = await normalaxios.get(
          `https://api.postalpincode.in/pincode/${pincode}`
        );

        if (response.data && response.data.length > 0) {
          const data = response.data[0];
          setState({
            severity: "success",
            message: "Fetched State and District",
            open: true,
          });
          if (data.Status === "Success") {
            const location = data.PostOffice[0];
            const state = location.State;
            const city = location.District;
            console.log(`State: ${state}, District: ${city}`);
            formik.setFieldValue("state", state);
            formik.setFieldValue("district", city);
            setState({
              severity: "success",
              message: "Fetched State and District",
              open: true,
            });
            setCirc(false);
          } else {
            console.log("Invalid pincode");
            formik.setFieldError("pincode", "Invalid pincode");
            setState({
              severity: "error",
              message: "Invalid Pincode",
              open: true,
            });
            setCirc(false);
          }
        } else {
          console.log("No data found for the given pincode");
          setState({
            severity: "error",
            message: "No data found for the given pincode",
            open: true,
          });
          setCirc(false);
          formik.setFieldError(
            "pincode",
            "No data found for the given pincode"
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error.message);
        formik.setFieldError("pincode", "error while fetching data");
        setState({
          severity: "error",
          message: error.response.errors[0],
          open: true,
        });
      }
    };
    console.log("trigger");
    if (
      formik.values.pincode.length == 6
      // && (
      // formik.values.state != '' || formik.values.district != '')
    ) {
      getStateAndCity(formik.values.pincode);
    } else {
      formik.setFieldValue("state", "");
      formik.setFieldValue("district", "");
    }
  }, [formik.values.pincode]);

  useEffect(() => {
    setData(jsonData1);
  }, [jsonData1]);

  const { currentTab, pnr } = router.query;
  useEffect(() => {
    //const token = searchParams.get("token");
    const getDetails = async (link) => {
      let response;
      try {
        response = await axios.get(link, {
          headers: {
            Authorization: `Bearer ${auth?.user?.accessToken}`,
          },
        });
        setState({
          severity: "success",
          message: "Fetched Details Succesfully",
          open: true,
        });
      } catch (e) {
        setState({
          severity: "error",
          message: "Error fetching details",
          open: true,
        });
      }

      // console.log('individual', response,
      //   Object.keys(response.data.visitDetails)
      // )
      function isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      }
      Object.keys(response.data.visitDetails).map((item) => {
        formik.setFieldValue(item, response.data.visitDetails[item]);
      });
      formik.setFieldValue(
        "arrivalDateTime",
        response.data.visitDetails.arrivalDateTime?.split(".")[0]
      );
      formik.setFieldValue(
        "departureDateTime",
        response.data.visitDetails.departureDateTime?.split(".")[0]
      );
      formik.setFieldValue(
        "accFromDate",
        response.data.accomodationDetails.arrivalDateTime?.split(".")[0]
      );
      formik.setFieldValue(
        "accToDate",
        response.data.accomodationDetails.departureDateTime?.split(".")[0]
      );
      if (
        response.data.visitDetails.isStaying == true &&
        response.data.visitDetails.isTraveling == true
      ) {
        console.log(
          "the visit and accomodation",
          response.data.visitDetails.isStaying,
          response.data.visitDetails.isTraveling,
          "added pickupDateTime",
          response.data.conveyanceDetails[0]
        );

        formik.setFieldValue(
          "pickupDateTime",
          response.data.conveyanceDetails[0]?.pickupDateTime?.split(".")[0]
        );
        formik.setFieldValue(
          "dropoffDateTime",
          response.data.conveyanceDetails[0]?.pickupDateTime?.split(".")[0]
        );
        formik.setFieldValue(
          "pickupLocation",
          response.data.conveyanceDetails[0]?.pickupLocation
        );
        formik.setFieldValue(
          "dropoffLocation",
          response.data.conveyanceDetails[0]?.dropOffLocation
        );
        // formik.setFieldValue()
      } else if (
        response.data.visitDetails.isStaying == false &&
        response.data.visitDetails.isTraveling == true
      ) {
        console.log(
          "the visit and accomodation array",
          response.data.visitDetails.isStaying,
          response.data.visitDetails.isTraveling
        );
        setTravel(
          response.data.conveyanceDetails.map((item) => {
            return {
              pickupDateTime: item.pickupDateTime?.split(".")[0],
              dropoffDateTime: item.pickupDateTime?.split(".")[0],
              dropoffLocation: item.dropOffLocation,
              pickupLocation: item.pickupLocation,
            };
          })
        );
      }
      if (currentTab == 1) {
        setJsonData(response.data.visitDetails.secondaryvisitors);
      }
    };
    if (router.isReady) {
      try {
        console.log(currentTab, pnr);
        if (currentTab == 0) {
          getDetails(`/checkdetails/all-ind-details/${pnr}`);
          setTabValue(0);
        } else if (currentTab == 1) {
          getDetails(`/checkdetails/all-org-details/${pnr}`);
          setTabValue(1);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [router.isReady]);

  const handleRegisterClick = async (event) => {
    console.log("formik values",formik.values)

    event.preventDefault();
    const formDataWithPNR = {
      ...formik.values,
      
      localConveyanceEntries:
        travel.length > 0
          ? travel
          : [
              {
                pickupDateTime: formik.values.pickupDateTime+':00.000+00:00',
                pickupLocation: formik.values.pickupLocation,
                dropoffDateTime: formik.values.dropoffDateTime+':00.000+00:00',
                dropoffLocation: formik.values.dropoffLocation,
              },
            ],
      submittedby: auth?.user?.email,
      secondaryvisitors: tabValue === 1 ? jsonData1 : [],
      draft: false,
    };

    try {
      let endpoint = "";

      if (tabValue === 0) {
        // Use the endpoint for individual
        endpoint = "/visit/visitindividual";
      } else if (tabValue === 1) {
        // Use the endpoint for organization
        endpoint = "/orgvisit/visitorganization";
      } else {
        console.error("Unknown tab value");
        return;
      }
      const formData = new FormData();
      if(selectedFile) {
        formData.append('file', selectedFile, 'image.png');
      }

      Object.keys(formDataWithPNR).map(k => {
        
          formData.append(`${k}`, formDataWithPNR[k])
      })

      const response = await axios.post(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${auth?.user?.accessToken}`,
        },
      });
      console.log("Response:", response);
      

      if (response.status >= 200 && response.status < 300) {
        console.log("Form data submitted successfully!");
        setIsRegistrationSuccess(true);
        setState({
          severity: "success",
          message: "Registered Successfully",
          open: true,
        });
        // Handle success, e.g., show a success message to the user
        formik.resetForm();
        formik.setFieldValue("arrivalDateTime", "");
        formik.setFieldValue("departureDateTime", "");
        setPreview('');
        setJsonData({});
      } else {
        console.error("Failed to submit form data");
        // setServerErrors(response)
        setState({
          severity: "error",
          message: "Registration Failed",
          open: true,
        });
        // Handle failure, e.g., show an error message to the user
      }
    } catch (error) {
      console.error(
        "Error while submitting form data:",
        error.response.data.errors
      );
      const errorMessage = error.response.data.errors.join(", "); // Join array elements into a single string
      setState({ severity: "error", message: errorMessage, open: true });
    }
  };

  const handleFinalClick = async (event) => {
    // event.preventDefault();
    const formDataWithPNR = {
      ...formik.values,
      localConveyanceEntries:
        travel.length > 0
          ? travel
          : [
              {
                pickupDateTime: formik.values.pickupDateTime,
                pickupLocation: formik.values.pickupLocation,
                dropoffDateTime: formik.values.dropoffDateTime,
                dropoffLocation: formik.values.dropoffLocation,
              },
            ],
      submittedby: auth?.user?.email,
      secondaryvisitors: tabValue === 1 ? jsonData1 : [],
      draft: false,
    };

    try {
      let endpoint = "";

      if (tabValue === 0) {
        // Use the endpoint for individual
        endpoint = `/visit/visitindividual/${pnr}`;
      } else if (tabValue === 1) {
        // Use the endpoint for organization
        endpoint = `/orgvisit/visitorganization/${pnr}`;
      } else {
        console.error("Unknown tab value");
        return;
      }

      const response = await axios.put(endpoint, formDataWithPNR, {
        headers: {
          Authorization: `Bearer ${auth?.user?.accessToken}`,
        },
      });
      console.log("Response:", response);

      if (response.status >= 200 && response.status < 300) {
        console.log("Form data submitted successfully!");
        setIsRegistrationSuccess(true);
        setState({
          severity: "success",
          message: "Registered Successfully",
          open: true,
        });
        // Handle success, e.g., show a success message to the user
        formik.resetForm();
        formik.setFieldValue("arrivalDateTime", "");
        formik.setFieldValue("departureDateTime", "");
        setJsonData({});
        router.push("/spotRegistration");
      } else {
        console.error("Failed to submit form data");
        setState({
          severity: "error",
          message: "Failed to Register",
          open: true,
        });
        // Handle failure, e.g., show an error message to the user
      }
    } catch (error) {
      // console.error("Error while submitting form data:", error);
      // setState({ severity: 'error', message: error.response?.data?.errors[0], open: true })
      console.error(
        "Error while submitting form data:",
        error.response.data.errors
      );
      const errorMessage = error.response.data.errors.join(", "); // Join array elements into a single string
      setState({ severity: "error", message: errorMessage, open: true });
    }
  };


  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 400,
    bgcolor: indigo[50],
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: 4,
  };


  function getCurrentDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  
  function getCurrentDateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${getCurrentDate()}T${hours}:${minutes}`;
  }
  

  
  useEffect(() => {
    formik.setFieldValue("arrivalDateTime", getCurrentDateTime());
    formik.setFieldValue("departureDateTime", getEndOfDay());

  }, []);
  

  function getEndOfDay() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}T23:59`;
  }
  
  
  
  useEffect(() => {
    formik.setFieldValue("departureDateTime", getEndOfDay());
    
  }, []);
  React.useEffect(() => {
    // Get the current date and time in the format required for the datetime-local input
    const currentDate = new Date().toISOString().slice(0, 16);

    // Set the minimum date to the current date and time
    setMinDate(currentDate);
  }, []);
  const handleFileChange = (event) => {
    setIsUploading(true)
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result); // Set the image data URL for preview
      
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <>
      <Head>
        <title>Spot Registration Form</title>
      </Head>
      <Modal
        open={open.open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Are you sure?
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            By changing tabs in between, your data won&apos;t be saved.
          </Typography>
          <Stack direction={"row"} spacing={2} p={2}>
            <Button
              variant="contained"
              onClick={() => {
                setTabValue(open.val);
                handleClose();
                formik.resetForm();
                router.push("/standard");
              }}
            >
              Accept
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "error.main" }}
              onClick={() => {
                handleClose();
              }}
            >
              Reject
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Snackbar
        open={state.open}
        autoHideDuration={3000} // Adjust the duration as needed
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={state.severity}
        >
          {state.message}
        </MuiAlert>
      </Snackbar>
      <Modal
        open={sOpen.open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Are you sure?
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            By submitting for approval the details can&apos;t be changed any
            further.
          </Typography>
          <Stack direction={"row"} spacing={2} p={2}>
            <Button
              variant="contained"
              onClick={() => {
                handleFinalClick();
                setSOpen((prev) => {
                  return { ...prev, open: false };
                });
              }}
            >
              Accept
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: "error.main" }}
              onClick={() => {
                handleClose();
              }}
            >
              Reject
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
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
              <Typography variant="h4" align="center" gutterBottom>
                Spot Registration Form   

              </Typography>

              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                indicatorColor={tabIndicatorColor}
                textColor={tabTextColor}
              >
                <Tab label="Individual" />
                {/* <Tab label="Organization" /> */}
              </Tabs>
              {/* <Grid item xs={12} justifyContent="center">
                <Button
                  variant="outlined"
                  sx={{
                    cursor: "unset",
                    mt: 2,
                    mx: 20,
                    borderColor: `${theme.palette.grey[50]} !important`,
                    color: `${theme.palette.grey[900]}!important`,
                    fontWeight: 500,
                    borderRadius: 5,
                    backgroundColor: "#aaaa",
                  }}
                  disableRipple
                  disabled
                >
                  Personal Details
                </Button>
              </Grid> */}
              <br />
              <Grid
                item
                xs={12}
                lg={12}
                justifyContent="center"
                display={"flex"}
              >
                <Button
                  variant="outlined"
                  sx={{
                    cursor: "unset",
                    mt: 2,
                    // mx: 20,
                    borderColor: `${theme.palette.grey[50]} !important`,
                    color: `${theme.palette.grey[900]}!important`,
                    fontWeight: 500,
                    borderRadius: 5,
                    backgroundColor: "#aaaa",
                  }}
                  disableRipple
                  disabled
                >
                  Personal Details
                </Button>
              </Grid>
              <br />
              {tabValue === 0 && (
                <form
                  onSubmit={formik.handleSubmit}
                  sx={{ backgroundColor: "#1b331b", color: "primary.main" }}
                >
                  <Grid container spacing={2}>
                  <Grid item xs={4}>
<InputLabel>Upload Photo</InputLabel>

{ !webCam && <Button
        variant="contained"
        component="label"
        sx={{ mb: 2 }}
        startIcon={<FileUpload/>}
      >
        Upload Photo
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Button> }
      {preview && (
        <div style={{ marginTop: "20px" }}>
      
          <img
            src={preview}
            alt="Preview"
            style={{ maxWidth: "300px", maxHeight: "300px" }}
          />
        </div>
      )}
        
        <Button startIcon={webCam ? <Close/>: <PhotoCamera/>} sx={{ mb: 2 }}  variant={webCam ? "outlined" : "contained"} color={webCam ? "error" : "info"}   onClick={()=>setWebCam(!webCam)}>{webCam ? "close" : "Capture Now"}</Button>
      {webCam && <MockWebcamCapture setPhoto={setPhotograph}/> }
      



      {selectedFile && (
        <Typography variant="body1">
          Selected File: {selectedFile.name}
        </Typography>
      )}
                  </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="firstName"
                        label="First Name"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("firstName")}
                        error={
                          formik.touched.firstName && formik.errors.firstName
                        }
                        helperText={
                          formik.touched.firstName && formik.errors.firstName
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="lastName"
                        label="Last Name"
                        fullWidth
                        required
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        {...formik.getFieldProps("lastName")}
                        error={
                          formik.touched.lastName && formik.errors.lastName
                        }
                        helperText={
                          formik.touched.lastName && formik.errors.lastName
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <FormControl
                        fullWidth
                        required
                        error={formik.touched.gender && formik.errors.gender}
                      >
                        <InputLabel>Gender</InputLabel>
                        <Select
                          name="gender"
                          label="Gender"
                          value={formik.values.gender}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          sx={{ backgroundColor: "white", borderRadius: 2 }}
                        >
                          <MenuItem value="male">Male</MenuItem>
                          <MenuItem value="female">Female</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                        {formik.touched.gender && formik.errors.gender && (
                          <Typography variant="body2" color="error">
                            {formik.errors.gender}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                    {/* <Grid item xs={4}>
                      <TextField
                        type="number"
                        name="age"
                        label="Age"
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        fullWidth
                        required
                        {...formik.getFieldProps("age")}
                        error={formik.touched.age && formik.errors.age}
                        helperText={formik.touched.age && formik.errors.age}
                      />
                    </Grid> */}
                    <Grid item xs={4}>
                      <TextField
                        name="contact"
                        label="Contact"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("contact")}
                        error={formik.touched.contact && formik.errors.contact}
                        helperText={
                          formik.touched.contact && formik.errors.contact
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        type="email"
                        name="email"
                        label="Email"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("email")}
                        error={formik.touched.email && formik.errors.email}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="organization"
                        label="Organization Name"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("organization")}
                        error={
                          formik.touched.organization &&
                          formik.errors.organization
                        }
                        helperText={
                          formik.touched.organization &&
                          formik.errors.organization
                        }
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        name="pincode"
                        label=" Organization Pincode"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("pincode")}
                        error={formik.touched.pincode && formik.errors.pincode}
                        helperText={
                          formik.touched.pincode && formik.errors.pincode
                        }
                        onChange={(e) => {
                          formik.setFieldValue("pincode", e.target.value);
                          setCirc(true);
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="state"
                        label="Organization State"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("state")}
                        error={formik.touched.state && formik.errors.state}
                        helperText={formik.touched.state && formik.errors.state}
                      />
                      {circ && formik.values.pincode.length !== 0 && (
                        <LinearProgress />
                      )}
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="district"
                        label="Organization District"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("district")}
                        error={
                          formik.touched.district && formik.errors.district
                        }
                        helperText={
                          formik.touched.district && formik.errors.district
                        }
                      />
                      {circ && formik.values.pincode.length != 0 && (
                        <LinearProgress />
                      )}
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        name="address"
                        label=" Organization Address"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("address")}
                        error={formik.touched.address && formik.errors.address}
                        helperText={
                          formik.touched.address && formik.errors.address
                        }
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <FormControl
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        error={
                          formik.touched.govtIdType && formik.errors.govtIdType
                        }
                      >
                        <InputLabel>Government ID Type</InputLabel>
                        <Select
                          name="govtIdType"
                          label="Government ID Type"
                          value={formik.values.govtIdType}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          sx={{ border: "none" }}
                          variant="standard"
                        >
                          <MenuItem value="AADHAR">Aadhar Card</MenuItem>
                          <MenuItem value="VOTERID">Voter ID</MenuItem>
                          <MenuItem value="PAN">PAN Card</MenuItem>
                          <MenuItem value="DRIVING_LICENSE">
                            Driving License
                          </MenuItem>
                          <MenuItem value="ORGANIZATION_ID">
                            Organisation
                          </MenuItem>
                          <MenuItem value="PASSPORT">Passport</MenuItem>
                        </Select>
                        {formik.touched.govtIdType &&
                          formik.errors.govtIdType && (
                            <Typography variant="body2" color="error">
                              {formik.errors.govtIdType}
                            </Typography>
                          )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="govtIdNumber"
                        label="Government Id Number"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("govtIdNumber")}
                        error={
                          formik.touched.govtIdNumber &&
                          formik.errors.govtIdNumber
                        }
                        helperText={
                          formik.touched.govtIdNumber &&
                          formik.errors.govtIdNumber
                        }
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <FormControl
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        error={
                          formik.touched.govtIdType && formik.errors.govtIdType
                        }
                      >
                        <InputLabel>Type of Visitor</InputLabel>
                        <Select
                          name="visitorType"
                          label="Type of Visitor"
                          value={formik.values.visitorType}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          sx={{ border: "none" }}
                          variant="standard"
                        >
                          <MenuItem value="Visitor(CDAC)">Visitor(CDAC)</MenuItem>
                          <MenuItem value="Visitor(Other Organization)">Visitor(Other Organization)</MenuItem>

                          <MenuItem value="SERVICE PROVIDER">
                            Service Provider
                          </MenuItem>
                          <MenuItem value="WORKERS">Workers</MenuItem>
                        </Select>
                        {formik.touched.visitorType &&
                          formik.errors.visitorType && (
                            <Typography variant="body2" color="error">
                              {formik.errors.visitorType}
                            </Typography>
                          )}
                      </FormControl>
                    </Grid>

                    {/* <Grid
                      item
                      xs={12}
                      lg={12}
                      justifyContent="center"
                      display={"flex"}
                    >
                      <Button
                        variant="outlined"
                        sx={{
                          cursor: "unset",
                          mt: 2,
                          // mx: 20,
                          borderColor: `${theme.palette.grey[50]} !important`,
                          color: `${theme.palette.grey[900]}!important`,
                          fontWeight: 500,
                          borderRadius: 5,
                          backgroundColor: "#aaaa",
                        }}
                        disableRipple
                        disabled
                      >
                      Asset Registraion
                      </Button>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <AssetRegistration/>
                    </Grid> */}
                    <Grid
                      item
                      xs={12}
                      lg={12}
                      justifyContent="center"
                      display={"flex"}
                    >
                      <Button
                        variant="outlined"
                        sx={{
                          cursor: "unset",
                          mt: 2,
                          // mx: 20,
                          borderColor: `${theme.palette.grey[50]} !important`,
                          color: `${theme.palette.grey[900]}!important`,
                          fontWeight: 500,
                          borderRadius: 5,
                          backgroundColor: "#aaaa",
                        }}
                        disableRipple
                        disabled
                      >
                        Details of Meet
                      </Button>
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        name="employee"
                        label="Employee Name to meet"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("employee")}
                        error={
                          formik.touched.employee && formik.errors.employee
                        }
                        helperText={
                          formik.touched.employee && formik.errors.employee
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="deptName"
                        label="Department Name/Group Name"
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        fullWidth
                        required
                        {...formik.getFieldProps("deptName")}
                        error={
                          formik.touched.deptName && formik.errors.deptName
                        }
                        helperText={
                          formik.touched.deptName && formik.errors.deptName
                        }
                      />
                    </Grid>
                    { <Grid item xs={4}>
                      <TextField
                        type="email"
                        name="officeemail"
                        label=" Official Email"
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("officeemail")}
                        error={
                          formik.touched.officeemail &&
                          formik.errors.officeemail
                        }
                        helperText={
                          formik.touched.officeemail &&
                          formik.errors.officeemail
                        }
                      />
                    </Grid> }
               {/* <Grid item xs={4}>
  <Autocomplete
    disablePortal
    options={emails} // Your array of emails
    fullWidth
    getOptionLabel={(option) => option.label || ""} // Display label in dropdown
    onChange={(event, value) => {
      // Update the formik field value with the selected option's value
      formik.setFieldValue("officeemail", value ? value.label : "");
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Official Email"
        fullWidth
        sx={{ backgroundColor: "white", borderRadius: 2 }}
        required
        error={formik.touched.officeemail && Boolean(formik.errors.officeemail)}
        helperText={formik.touched.officeemail && formik.errors.officeemail}
        onChange={(event) => {
          // Manually trigger formik's onChange to handle typing in the TextField
          formik.handleChange(event);
        }}
        name="officeemail" // Ensure the TextField is linked to Formik
      />
    )}
  />
</Grid> */}


                    <Grid item xs={4}>
                      <TextField
                        name="phoneNumber"
                        label="Phone Number"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        required
                        {...formik.getFieldProps("phoneNumber")}
                        error={
                          formik.touched.phoneNumber &&
                          formik.errors.phoneNumber
                        }
                        helperText={
                          formik.touched.phoneNumber &&
                          formik.errors.phoneNumber
                        }
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        name="purpose"
                        label="Purpose"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        {...formik.getFieldProps("purpose")}
                        error={formik.touched.purpose && formik.errors.purpose}
                        helperText={
                          formik.touched.purpose && formik.errors.purpose
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="arrivalDateTime"
                        label="Arrival Date and Time"
                        fullWidth
                        sx={{ backgroundColor: "white", borderRadius: 2 }}
                        type="datetime-local"
                        required
                        value={formik.values.arrivalDateTime}
                        onChange={(event) =>
                          formik.setFieldValue(
                            "arrivalDateTime",
                            event.target.value
                          )
                        }
                        error={
                          formik.touched.arrivalDateTime &&
                          Boolean(formik.errors.arrivalDateTime)
                        }
                        helperText={
                          formik.touched.arrivalDateTime &&
                          formik.errors.arrivalDateTime
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {/* <EventIcon /> */}
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              {/* <ScheduleIcon /> */}
                            </InputAdornment>
                          ),
                        }}
                        // Set the minimum date to disable past dates
                        // inputProps={{ min: minDate }}
                        // inputProps={{ min: `${getCurrentDate()}T00:00` }} // Disable past dates, allow time change
                        inputProps={{
                          min: `${getCurrentDate()}T00:00`, // Disable past dates
                          max: `${getCurrentDate()}T23:59`, // Disable future dates
                        }}
                      />
                    </Grid>
                    {/* <Grid item xs={4}>
                    <FormControl
                      fullWidth
                      required
                      error={
                        formik.touched.govtIdType && formik.errors.govtIdType
                      }
                    >
                      <InputLabel>Government ID Type</InputLabel>
                      <Select
                        name="govtIdType"
                        value={formik.values.govtIdType}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        <MenuItem value="aadhar">Aadhar Card</MenuItem>
                        <MenuItem value="voterid">Voter ID</MenuItem>
                        <MenuItem value="pan">PAN Card</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                      {formik.touched.govtIdType &&
                        formik.errors.govtIdType && (
                          <Typography variant="body2" color="error">
                            {formik.errors.govtIdType}
                          </Typography>
                        )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      // type="number"
                      name="govtidNo"
                      label="Government Id Number"
                      fullWidth
                      required
                      {...formik.getFieldProps("govtidNo")}
                      error={formik.touched.govtidNo && formik.errors.govtidNo}
                      helperText={
                        formik.touched.govtidNo && formik.errors.govtidNo
                      }
                    />
                  </Grid> */}
                    {/* <Grid item xs={4}>
                      <TextField
                        name="arrivalDate"
                        label="Arrival Date"
                        fullWidth
                        type="date"
                        required
                        value={formik.values.arrivalDate}
                        onChange={(event) =>
                          formik.setFieldValue("arrivalDate", event.target.value)
                        }
                        error={
                          formik.touched.arrivalDate &&
                          Boolean(formik.errors.arrivalDate)
                        }
                        helperText={
                          formik.touched.arrivalDate && formik.errors.arrivalDate
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="arrivalTime"
                        label="Arrival Time"
                        fullWidth
                        type="time"
                        required
                        value={formik.values.arrivalTime}
                        onChange={(event) =>
                          formik.setFieldValue("arrivalTime", event.target.value)
                        }
                        error={
                          formik.touched.arrivalTime &&
                          Boolean(formik.errors.arrivalTime)
                        }
                        helperText={
                          formik.touched.arrivalTime && formik.errors.arrivalTime
                        }
                      />
                    </Grid> */}

                   
                    {/* <Grid item xs={4}>
                      <TextField
                        name="departureDate"
                        label="Departure Date"
                        fullWidth
                        type="date"
                        required
                        value={formik.values.departureDate}
                        onChange={(event) =>
                          formik.setFieldValue(
                            "departureDate",
                            event.target.value
                          )
                        }
                        error={
                          formik.touched.departureDate &&
                          Boolean(formik.errors.departureDate)
                        }
                        helperText={
                          formik.touched.departureDate &&
                          formik.errors.departureDate
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="departureTime"
                        label="Departure Time"
                        fullWidth
                        type="time"
                        required
                        value={formik.values.departureTime}
                        onChange={(event) =>
                          formik.setFieldValue(
                            "departureTime",
                            event.target.value
                          )
                        }
                        error={
                          formik.touched.departureTime &&
                          Boolean(formik.errors.departureTime)
                        }
                        helperText={
                          formik.touched.departureTime &&
                          formik.errors.departureTime
                        }
                      />
                    </Grid> */}
                
<Grid item xs={6}>
  <TextField
    name="departureDateTime"
    label="Departure Date and Time"
    fullWidth
    sx={{ display: "none" }} // Hide the field in the frontend
    type="hidden"
    required
    value={formik.values.departureDateTime}
    onChange={(event) =>
      formik.setFieldValue("departureDateTime", event.target.value)
    }
    error={
      formik.touched.departureDateTime && Boolean(formik.errors.departureDateTime)
    }
    helperText={
      formik.touched.departureDateTime && formik.errors.departureDateTime
    }
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          {/* <EventIcon /> */}
        </InputAdornment>
      ),
      endAdornment: (
        <InputAdornment position="end">
          {/* <ScheduleIcon /> */}
        </InputAdornment>
      ),
    }}
    inputProps={{
      min: `${getCurrentDateTime()}`, // Disable past dates
      max: `${getCurrentDateTime()}`, // Disable future dates
    }}
  />
</Grid>
                  </Grid>
                  {/* <hr /> */}
                  <Grid item xs={12} justifyContent="center" display={"flex"}>
                    {/* <Button
                        variant="outlined"
                        sx={{
                          cursor: "unset",
                          mt: 2,
                          mx: 20,
                          borderColor: `${theme.palette.grey[50]} !important`,
                          color: `${theme.palette.grey[900]}!important`,
                          fontWeight: 500,
                          borderRadius: 5,
                          backgroundColor: "#aaaa",
                        }}
                        disableRipple
                        disabled
                      >
                        Take Photo
                      </Button> */}
                  </Grid>
                  <br></br>
                  {/* <Webcam/> */}
                  {/* <hr/> */}
                  <Stack direction={"row"} spacing={2}>
                    {/* {pnr == null && <Button
                      // type="submit"
                      startIcon={<EditNoteIcon />}
                      onClick={handleInitialDraftClick}
                      variant="contained"
                      color="primary"
                    >
                      Save as Intial Draft
                    </Button>} */}
                    {pnr == null && (
                      <Button
                        // type="submit"
                        sx={{ backgroundColor: "success.main" }}
                        onClick={handleRegisterClick}
                        variant="contained"
                        color="primary"
                        startIcon={<DoneAllOutlined />}
                      >
                        Register Individual Visit
                      </Button>
                    )}
                  </Stack>

                  <Snackbar
                    open={isRegistrationSuccess}
                    autoHideDuration={3000} // Adjust the duration as needed
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                  >
                    <MuiAlert
                      elevation={6}
                      variant="filled"
                      onClose={handleCloseSnackbar}
                      severity="success"
                    >
                      {state.message}
                    </MuiAlert>
                  </Snackbar>
                </form>
              )}

            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );

};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
