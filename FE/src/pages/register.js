import Head from "next/head";
import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

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
  Stack
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';

// import {  Input } from '@material-ui/core';
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import ExcelDataTable from "./exceldataTable"; // Import the ExcelDataTable component
// import {sampleData} from './sample.xls'
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

import { Button, Container, Grid, InputAdornment, TextField } from "@mui/material";
import { blue, indigo } from "@mui/material/colors";
import { useTheme } from "@mui/material/styles";
// import axios from "axios";
import axios from "src/api/axios";
import { normalaxios } from "src/api/axios";
import { useFormik } from "formik";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import * as Yup from "yup";
import { useAuth } from "src/hooks/use-auth";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required("First Name is required"),
  lastName: Yup.string().required("Last Name is required"),
  gender: Yup.string().required("Gender is required"),
  age: Yup.number()
    .required("Age is required")
    .min(18, "You must be at least 18 years old"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  // officeemail: Yup.string()
  //   .email("Invalid office email address")
  //   .required(" Official Email is required"),
  officeemail: Yup.string().required('Please mention the Employee Email who referred you').email('should be an email').matches('@cdac.in', 'Must be a CDAC employee Mail'),

  purpose: Yup.string().required("Purpose is required"),
  employee: Yup.string().required("Employee Name is required"),
  depttName: Yup.string(),
  phoneNumber: Yup.string()
    .required("Phone Number is required")
    .matches(
      /^(\+91[\-\s]?)?[789]\d{9}$/,
      "Invalid Indian phone number. Please enter a valid Indian phone number with 10 digits."
    ),

  contact: Yup.string()
    .required("Phone Number is required")
    .matches(
      /^(\+91[\-\s]?)?[789]\d{9}$/,
      "Invalid Indian phone number. Please enter a valid Indian phone number with 10 digits."
    ),
  organization: Yup.string().required("organization name is required"),

  state: Yup.string().required("State is required"),
  district: Yup.string().required("District is required"),
  address: Yup.string().required("Address is required"),
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
  const excelDataTableRef = useRef();
  const [isPDFGenerated, setIsPDFGenerated] = useState(false);
  const [isValidationError, setIsValidationError] = useState(false);
  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const auth = useAuth()
  const [open, setOpen] = React.useState({ open: false });
  const handleOpen = () => setOpen((prev) => { return { ...prev, open: true } });
  const handleClose = () => setOpen((prev) => { return { ...prev, open: false } });
  const sampleData = [
    [
      "First Name",
      "Last Name",
      "Gender",
      "Age",
      "Contact",
      "Email",
      "Pincode",
      "State",
      "district",
      "Address",
      "Organization Name",
      "GovernmentId Type",
      "GovernmentId Number",
    ],
    [
      "John",
      "Doe",
      "male",
      "34",
      "1234567890",
      "john.doe@example.com",
      "232323",
      "AP",
      "Kurnool",
      "Kukatpally",
      "CDAC",
      "pancard",
      "eeopjhjhj",
    ],
    //   ['Jane', 'Smith', 'jane.smith@example.com'],
    // Add more rows as needed
  ];
  const [jsonData1, setJsonData] = useState();
  const [error, setError] = useState(null);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddNewRecord = (newRecordDetails) => {
    // Handle adding the new person details
    console.log('Adding newRecordDetails:', newRecordDetails);
    // Clone the existing jsonData array to avoid mutating the state directly
    const updatedJsonData = [...jsonData1, newRecordDetails];

    setJsonData(updatedJsonData);
    // Call the handleAddNewRecord function from ExcelDataTable component using the ref
    if (excelDataTableRef.current) {
      excelDataTableRef.current.handleAddNewRecord(newRecordDetails);
    }
  };

  const handleCloseSnackbar = () => {
    setIsPDFGenerated(false);
    setIsValidationError(false);
    setIsRegistrationSuccess(false);
  };


  // Set jsonData using your file reading logic
  console.log("sampleData::", jsonData1);
  // const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const { acceptedFiles, rejectedFiles, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
      },
      onDrop: async (acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
          setError("Please select only .xls or .xlsx files.");
          console.log("Rejected Files:", rejectedFiles);
        } else {
          setError(null);
          const file = acceptedFiles[0];
          const reader = new FileReader();

          reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];

            // Convert sheet data to an array of objects
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            console.log("jsonData::", jsonData);
            setJsonData(jsonData);
            // localStorage.setItem('jsonData',JSON.stringify())
            // Insert data into MongoDB
            try {
              // await ExcelData.create(jsonData);
              console.log("Data inserted into MongoDB");
            } catch (error) {
              console.error("Error inserting data into MongoDB:", error);
            }
          };

          reader.readAsArrayBuffer(file);
          // Handle the accepted files
          console.log("Accepted Files:", acceptedFiles);
        }
      },
    });


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
      depttName: "",
      phoneNumber: "",

      organization: "",
      pickupDateTime: "",
      dropoffDateTime: "",
      pickupLocation: "",
      dropoffLocation: "",
      pickupDateTime: "",
      dropoffDateTime: "",

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
    district: Yup.string().required("district is required"),
    localConveyanceEntries: Yup.array().of(
      Yup.object().shape({
        pickupDateTime: Yup.string().required(
          "Pickup Date and Time is required"
        ),
        pickupLocation: Yup.string().required(
          "pickupLocation is required"
        ),
        dropoffLocation: Yup.string().required(
          "dropoff location is required"
        ),
        dropoffDateTime: Yup.string().required(
          " dropoff Date Time is required"
        ),
        // ... Add validations for other Local Conveyance fields
      })
    ),
    onSubmit: async (values) => {
      console.log(values);
      // Implement your form submission logic here
      try {
        const response = await axios.post(`/users/`, {})
        console.log('reposne', response)
      } catch (error) {
        console.log('error while submitting', error)
      }
      console.log("Form submitted with values:", values);
      const lastFourDigits = values.govtIdNumber
        ? values.govtIdNumber.slice(-4)
        : "";

      // Now you can use 'lastFourDigits' as needed
      console.log("Last Four Digits:", lastFourDigits);
    },
  });

  const [tabValue, setTabValue] = React.useState(0);
  const tabIndicatorColor = "secondary"; // Change this to the color you want for the indicator
  const tabTextColor = "secondary"; // Change this to the color you want for the text
  const [travel, setTravel] = useState([]);
  const handleTabChange = (event, newValue) => {
    console.log('formik touched', formik.touched, formik.dirty)
    if (formik.dirty) {
      setOpen({ open: true, val: newValue });
    } else {
      setTabValue(newValue);

    }
  };
  console.log("Tab Value::", tabValue)

  const handleChange = (newFiles) => {
    setFiles(newFiles);
  };
  const [minDate, setMinDate] = React.useState('');

  React.useEffect(() => {
    // Get the current date and time in the format required for the datetime-local input
    const currentDate = new Date().toISOString().slice(0, 16);

    // Set the minimum date to the current date and time
    setMinDate(currentDate);
  }, []);

  useEffect(() => {
    const getStateAndCity = async (pincode) => {
      try {
        const response = await normalaxios.get(`https://api.postalpincode.in/pincode/${pincode}`);

        if (response.data && response.data.length > 0) {
          const data = response.data[0];

          if (data.Status === 'Success') {
            const location = data.PostOffice[0];
            const state = location.State;
            const city = location.District;
            console.log(`State: ${state}, City: ${city}`);
            formik.setFieldValue('state', state)
            formik.setFieldValue('district', city)
          } else {
            console.log('Invalid pincode');
            formik.setFieldError('pincode', 'Invalid pincode')
          }
        } else {
          console.log('No data found for the given pincode');
          formik.setFieldError('pincode', 'No data found for the given pincode')
        }
      } catch (error) {
        console.error('Error fetching data:', error.message);
        formik.setFieldError('pincode', 'error while fetching data')
      }
    }
    console.log('trigger')
    if (formik.values.pincode.length == 6) {
      getStateAndCity(formik.values.pincode)
    } else {
      formik.setFieldValue('state', '')
      formik.setFieldValue('district', '')
    }
  }, [formik.values.pincode])


  // useEffect(() => {
  //   // Retrieve data from local storage when the component mounts
  //   const storedData = localStorage.getItem('jsonData');
  //   if (storedData) {
  //     setJsonData(JSON.parse(storedData));
  //   }
  // }, []);

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));


  const handleRegisterClick = async (event) => {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Generate a v4 UUID
    // const uuid = uuidv4().replace(/-/g, ''); // Remove dashes from the generated UUID
    // const alphaPart = uuid.substr(0, 4);
    // const numericPart = uuid.substr(4, 8);

    // // Ensure that the PNR is at least 8 characters long
    // const paddedNumericPart = numericPart.padEnd(8, '0');

    // const pnr = `${alphaPart}${paddedNumericPart}`;

    // Append the PNR to the form data
    const formDataWithPNR = {
      ...formik.values,
      // pnr: pnr,
      localConveyanceEntries: travel.length > 0 ? travel : [{
        pickupDateTime: formik.values.pickupDateTime,
        pickupLocation: formik.values.pickupLocation,
        dropoffDateTime: formik.values.dropoffDateTime,
        dropoffLocation: formik.values.dropoffLocation
      }],
      submittedby: auth?.user?.email
    };

    try {
      console.log(
        "Data with PNR:", formDataWithPNR
      );

      // Assuming your backend API endpoint for form submission is /api/v1/visitorCreation
      const response = await axios.post(
        `/visit/visitindividual`, formDataWithPNR,

      );

      if (response.ok) {
        console.log("Form data submitted successfully!");
        // Handle success, e.g., show a success message to the user
      } else {
        console.error("Failed to submit form data");
        // Handle failure, e.g., show an error message to the user
      }
    } catch (error) {
      console.error("Error while submitting form data:", error);
    }
  };


  //   useEffect(() => {
  //     const getStateAndCity = async (pincode) => {
  //         try {
  //             const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

  //             if (response.data && response.data.length > 0) {
  //                 const data = response.data[0];

  //                 if (data.Status === 'Success') {
  //                     const location = data.PostOffice[0];
  //                     const state = location.State;
  //                     const city = location.District;
  //                     console.log(`State: ${state}, City: ${city}`);
  //                     formik.setFieldValue('state', state)
  //                     formik.setFieldValue('city', city)
  //                 } else {
  //                     console.log('Invalid pincode');
  //                     formik.setFieldError('pincode', 'Invalid pincode')
  //                 }
  //             } else {
  //                 console.log('No data found for the given pincode');
  //                 formik.setFieldError('pincode', 'No data found for the given pincode')
  //             }
  //         } catch (error) {
  //             console.error('Error fetching data:', error.message);
  //             formik.setFieldError('pincode', 'error while fetching data')
  //         }
  //     }
  //     console.log('trigger')
  //     if (formik.values.pincode.length == 6) {
  //         getStateAndCity(formik.values.pincode)
  //     } else {
  //         formik.setFieldValue('state', '')
  //         formik.setFieldValue('city', '')
  //     }
  // }, [formik.values.pincode])
  const AddPersonModal = ({ isOpen, onClose, onAddPerson }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [age, setAge] = useState('');

    const [gender, setGender] = useState('');
    const [pincode, setPincode] = useState('');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [address, setAddress] = useState('');
    const [organizationName, setorganizationName] = useState('');
    const [govtIdType, setgovtIdType] = useState('');
    const [govtIdNumber, setgovtIdNumber] = useState('');
    const isAgeValid = /^\d+$/.test(age); // Numeric validation for age
    const isContactValid = /^\d{10}$/.test(contact); // 10-digit numeric validation for contact
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Basic email validation
    const isPincodeValid = /^\d{6}$/.test(pincode); // 6-digit numeric validation for pincode
    const extractedLast4Digits = govtIdNumber.slice(-4); // Extract last 4 digits

    const isGovtIdNumberValid = /^\d{4}$/.test(extractedLast4Digits);
    const handleAddNewRecord = () => {
      // Validate the inputs and perform necessary checks
      // You can also perform additional validation as needed
      if (isAgeValid && isContactValid && isEmailValid && isPincodeValid) {
        // Perform your action

        console.log('Adding new record...');
      } else {
        console.error('Validation failed. Please check the form fields.');
      }

      // Call the onAddPerson callback to pass the new person details
      onAddPerson({
        firstName,
        lastName,
        age,
        gender,
        pincode,
        contact,
        email,
        state,
        district,
        address,
        organizationName,
        govtIdType,
        govtIdNumber,
      });

      // Reset the input fields
      setFirstName('');
      setLastName('');
      setAge('');
      setGender('');
      setPincode('');
      setContact('');
      setEmail('');
      setState('');
      setDistrict('');
      setAddress('');
      setorganizationName('');
      setgovtIdType('');
      setgovtIdNumber('');

      // Close the modal
      onClose();
    };

    return (
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>Add More Person</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={firstName.trim() === ''}
                helperText={firstName.trim() === '' && 'Please enter First Name'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={lastName.trim() === ''}
                helperText={lastName.trim() === '' && 'Please enter Last Name'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Age"
                variant="outlined"
                fullWidth
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                error={age.trim() === ''}
                helperText={age.trim() === '' && 'Please enter Age'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Gender"
                variant="outlined"
                fullWidth
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                error={gender.trim() === ''}
                helperText={gender.trim() === '' && 'Please enter  gender'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Contact"
                variant="outlined"
                fullWidth
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                error={!isContactValid}
                helperText={!isContactValid && 'Please enter a valid 10-digit contact number'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!isEmailValid}
                helperText={!isEmailValid && 'Please enter a valid email address'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Pincode"
                variant="outlined"
                fullWidth
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                error={pincode.trim() === ''}
                helperText={pincode.trim() === '' && 'Please enter Pincode'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="State"
                variant="outlined"
                fullWidth
                value={state}
                onChange={(e) => setState(e.target.value)}
                error={state.trim() === ''}
                helperText={state.trim() === '' && 'Please enter state'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="District"
                variant="outlined"
                fullWidth
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                error={district.trim() === ''}
                helperText={district.trim() === '' && 'Please enter district'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Address"
                variant="outlined"
                fullWidth
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={address.trim() === ''}
                helperText={address.trim() === '' && 'Please enter Address'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Organization Name"
                variant="outlined"
                fullWidth
                value={organizationName}
                onChange={(e) => setorganizationName(e.target.value)}
                error={organizationName.trim() === ''}
                helperText={organizationName.trim() === '' && 'Please enter Organization Name'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Governement Id type"
                variant="outlined"
                fullWidth
                value={govtIdType}
                onChange={(e) => setgovtIdType(e.target.value)}
                error={govtIdType.trim() === ''}
                helperText={govtIdType.trim() === '' && 'Please enter govt id type'}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Government Id Number"
                variant="outlined"
                fullWidth
                value={govtIdNumber}
                onChange={(e) => setgovtIdNumber(e.target.value)}
                error={!isGovtIdNumberValid}
                helperText={!isGovtIdNumberValid && 'Please enter a valid last  4-digit government Id Number'}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddNewRecord}>Add Person</Button>
        </DialogActions>
      </Dialog>
    );
  };

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: indigo[50],
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: 4
  };
  return (
    <>
      <Head>
        <title>Visitor Form</title>
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
          <Stack direction={'row'} spacing={2} p={2}>
            <Button variant="contained" onClick={() => {
              setTabValue(open.val)
              handleClose();
              formik.resetForm();
            }}>Accept</Button>
            <Button variant="contained" sx={{ backgroundColor: 'error.main' }} onClick={() => { handleClose() }}>Reject</Button>
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
                Visitor Form
              </Typography>

              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                centered
                indicatorColor={tabIndicatorColor}
                textColor={tabTextColor}
              >
                <Tab label="Individual" />
                <Tab label="Organization" />
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
              <Grid item xs={12} lg={12} justifyContent="center" display={"flex"}>
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
                      <TextField
                        name="firstName"
                        label="First Name"
                        fullWidth
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
                          value={formik.values.gender}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
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
                    <Grid item xs={4}>
                      <TextField
                        type="number"
                        name="age"
                        label="Age"
                        fullWidth
                        required
                        {...formik.getFieldProps("age")}
                        error={formik.touched.age && formik.errors.age}
                        helperText={formik.touched.age && formik.errors.age}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="contact"
                        label="Contact"
                        fullWidth
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
                        required
                        {...formik.getFieldProps("email")}
                        error={formik.touched.email && formik.errors.email}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="pincode"
                        label="Pincode"
                        fullWidth
                        required
                        {...formik.getFieldProps("pincode")}
                        error={formik.touched.pincode && formik.errors.pincode}
                        helperText={
                          formik.touched.pincode && formik.errors.pincode
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="state"
                        label="State"
                        fullWidth
                        required
                        {...formik.getFieldProps("state")}
                        error={formik.touched.state && formik.errors.state}
                        helperText={formik.touched.state && formik.errors.state}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="district"
                        label="district"
                        fullWidth
                        required
                        {...formik.getFieldProps("district")}
                        error={formik.touched.district && formik.errors.district}
                        helperText={formik.touched.district && formik.errors.district}
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        name="address"
                        label="Address"
                        fullWidth
                        required
                        {...formik.getFieldProps("address")}
                        error={formik.touched.address && formik.errors.address}
                        helperText={
                          formik.touched.address && formik.errors.address
                        }
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        name="organization"
                        label="Organization Name"
                        fullWidth
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
                    <Grid item xs={12} lg={12} justifyContent="center" display={"flex"}>
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
                        name="depttName"
                        label="Department Name(Optional)"
                        fullWidth
                        {...formik.getFieldProps("depttName")}
                        error={
                          formik.touched.depttName && formik.errors.depttName
                        }
                        helperText={
                          formik.touched.depttName && formik.errors.depttName
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        type="email"
                        name="officeemail"
                        label=" Official Email"
                        fullWidth
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
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="phoneNumber"
                        label="Phone Number"
                        fullWidth
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
                        {...formik.getFieldProps("purpose")}
                        error={formik.touched.purpose && formik.errors.purpose}
                        helperText={
                          formik.touched.purpose && formik.errors.purpose
                        }
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

                    <Grid item xs={6}>
                      <TextField
                        name="arrivalDateTime"
                        label="Arrival Date and Time"
                        fullWidth
                        type="datetime-local" // Use datetime-local type to combine date and time
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
        inputProps={{ min: minDate }}
        />
      </Grid>
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
                        type="datetime-local" // Use datetime-local type to combine date and time
                        required
                        value={formik.values.departureDateTime}
                        onChange={(event) =>
                          formik.setFieldValue(
                            "departureDateTime",
                            event.target.value
                          )
                        }
                        error={
                          formik.touched.departureDateTime &&
                          Boolean(formik.errors.departureDateTime)
                        }
                        helperText={
                          formik.touched.departureDateTime &&
                          formik.errors.departureDateTime
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
                        inputProps={{ min: minDate }}
        />
      </Grid>
                    <hr />
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="isStaying"
                            checked={formik.values.isStaying}
                            onChange={formik.handleChange}
                          />
                        }
                        label="Is Accomodation required?"
                      />
                      <hr />
                      {formik.values.isStaying && (
                        <Grid container spacing={2} sx={{ p: 2 }}>
                          <Grid item xs={6}>
                            <TextField
                              name="accFromDate"
                              label="From Date and Time"
                              fullWidth
                              type="datetime-local" // Use datetime-local type to combine date and time
                              required
                              value={formik.values.accFromDate}
                              onChange={(event) =>
                                formik.setFieldValue(
                                  "accFromDate",
                                  event.target.value
                                )
                              }
                              error={
                                formik.touched.accFromDate &&
                                Boolean(formik.errors.accFromDate)
                              }
                              helperText={
                                formik.touched.accFromDate &&
                                formik.errors.accFromDate
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
                              inputProps={{ min: minDate }}
                              />
                            </Grid>

                          <Grid item xs={6}>
                            <TextField
                              name="accToDate"
                              label="To Date and Time"
                              fullWidth
                              type="datetime-local" // Use datetime-local type to combine date and time
                              required
                              value={formik.values.accToDate}
                              onChange={(event) =>
                                formik.setFieldValue(
                                  "accToDate",
                                  event.target.value
                                )
                              }
                              error={
                                formik.touched.accToDate &&
                                Boolean(formik.errors.accToDate)
                              }
                              helperText={
                                formik.touched.accToDate &&
                                formik.errors.accToDate
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
                              inputProps={{ min: minDate }}
        />
      </Grid>
                        </Grid>
                      )}
                    </Grid>
                    <hr />
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="isTraveling"
                            checked={formik.values.isTraveling}
                            onChange={formik.handleChange}
                          />
                        }
                        label="Is Local Conveyance required?"
                      />
                      <hr />
                      {formik.values.isTraveling &&
                        !formik.values.isStaying && (
                          <div>
                            <TableContainer component={Paper}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Pickup Date and Time</TableCell>
                                    <TableCell>Pickup Location</TableCell>
                                    <TableCell>Drop Date and Time</TableCell>
                                    <TableCell>Drop Location</TableCell>
                                    {/* Add other Local Conveyance field headers here */}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {travel.map((entry, index) => {
                                    console.log("entry", entry);
                                    return (
                                      <TableRow key={index}>
                                        <TableCell>
                                          {entry.pickupDateTime}
                                        </TableCell>
                                        <TableCell>
                                          {entry.pickupLocation}
                                        </TableCell>
                                        <TableCell>
                                          {entry.dropoffDateTime}
                                        </TableCell>
                                        <TableCell>
                                          {entry.dropoffLocation}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>

                            <hr />

                            <Grid container spacing={2} sx={{ py: 2 }}>
                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.pickupDateTime`}
                                  label="Pickup Date and Time"
                                  fullWidth
                                  type="datetime-local"
                                  required
                                  value={
                                    formik.values.localConveyanceEntries
                                      .pickupDateTime
                                  }
                                  onChange={(event) => {

                                    return formik.setFieldValue(
                                      `localConveyanceEntries.pickupDateTime`,
                                      event.target.value
                                    )
                                  }

                                  }
                                  error={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      ?.pickupDateTime &&
                                    Boolean(
                                      formik.errors.localConveyanceEntries
                                        ?.pickupDateTime
                                    )
                                  }
                                  helperText={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      ?.pickupDateTime &&
                                    formik.errors.localConveyanceEntries
                                      ?.pickupDateTime
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
                                />
                              </Grid>

                              {/* <Grid item xs={6}>
                          <FormControl
                            fullWidth
                            required
                            error={
                              formik.touched.localConveyanceEntries &&
                              formik.touched.localConveyanceEntries
                                ?.pickupLocation &&
                              Boolean(
                                formik.errors.localConveyanceEntries
                                  ?.pickupLocation
                              )
                            }
                          >
                            <InputLabel>PickUp Location</InputLabel>
                            <Select
                              name={`localConveyanceEntries.pickupLocation`}
                              value={
                                formik.values.localConveyanceEntries
                                  .pickupLocation
                              }
                              onChange={(event) =>
                                formik.setFieldValue(
                                  `localConveyanceEntries.pickupLocation`,
                                  event.target.value
                                )
                              }
                              onBlur={formik.handleBlur}
                            >
                              <MenuItem value="airport">Airport</MenuItem>
                              <MenuItem value="station">Station</MenuItem>
                            </Select>
                            {formik.touched.localConveyanceEntries &&
                              formik.touched.localConveyanceEntries
                                ?.pickupLocation &&
                              formik.errors.localConveyanceEntries
                                ?.pickupLocation && (
                                <Typography variant="body2" color="error">
                                  {
                                    formik.errors.localConveyanceEntries
                                      ?.pickupLocation
                                  }
                                </Typography>
                              )}
                          </FormControl>
                        </Grid> */}

                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.pickupLocation`}
                                  label="Pickup Location"
                                  fullWidth
                                  required
                                  value={
                                    formik.values.localConveyanceEntries
                                      .pickupLocation
                                  }
                                  onChange={(event) =>
                                    formik.setFieldValue(
                                      `localConveyanceEntries.pickupLocation`,
                                      event.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      .pickupLocation &&
                                    Boolean(
                                      formik.errors.localConveyanceEntries
                                        ?.pickupLocation
                                    )
                                  }
                                  helperText={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      .pickupLocation &&
                                    formik.errors.localConveyanceEntries
                                      ?.pickupLocation
                                  }
                                />
                              </Grid>

                              {/* Add other Local Conveyance fields here */}
                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.dropoffDateTime`}
                                  label="Drop Date and Time"
                                  fullWidth
                                  type="datetime-local"
                                  required
                                  value={
                                    formik.values.localConveyanceEntries
                                      .dropoffDateTime
                                  }
                                  onChange={(event) =>
                                    formik.setFieldValue(
                                      `localConveyanceEntries.dropoffDateTime`,
                                      event.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      ?.dropoffDateTime &&
                                    Boolean(
                                      formik.errors.localConveyanceEntries
                                        ?.dropoffDateTime
                                    )
                                  }
                                  helperText={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      ?.dropoffDateTime &&
                                    formik.errors.localConveyanceEntries
                                      ?.dropoffDateTime
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
                                />
                              </Grid>

                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.dropoffLocation`}
                                  label="Dropoff Location"
                                  fullWidth
                                  required
                                  value={
                                    formik.values.localConveyanceEntries
                                      .dropoffLocation
                                  }
                                  onChange={(event) =>
                                    formik.setFieldValue(
                                      `localConveyanceEntries.dropoffLocation`,
                                      event.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      .dropoffLocation &&
                                    Boolean(
                                      formik.errors.localConveyanceEntries
                                        ?.dropoffLocation
                                    )
                                  }
                                  helperText={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      .dropoffLocation &&
                                    formik.errors.localConveyanceEntries
                                      ?.dropoffLocation
                                  }
                                />
                              </Grid>
                            </Grid>

                            <Button
                              variant="outlined"
                              onClick={() => {
                                if (
                                  formik.values.localConveyanceEntries
                                    .pickupDateTime != "" &&
                                  formik.values.localConveyanceEntries
                                    .pickupLocation != "" &&
                                  formik.values.localConveyanceEntries
                                    .dropoffDateTime != "" &&
                                  formik.values.localConveyanceEntries
                                    .dropoffLocation != ""
                                ) {
                                  setTravel([
                                    ...travel,
                                    formik.values.localConveyanceEntries,
                                  ]);
                                  formik.setFieldValue(
                                    "localConveyanceEntries",
                                    {
                                      pickupDateTime: "",
                                      pickupLocation: "",
                                      dropoffDateTime: "",
                                      dropoffLocation: "",
                                    }
                                  );
                                }
                              }}
                            >
                              Add More Rows
                            </Button>
                            {/* Button to add more Local Conveyance entries */}
                            {/* <Button
                        type="button"
                        variant="outlined"
                        onClick={() => {
                          formik.setFieldValue("localConveyanceEntries", [
                            ...formik.values.localConveyanceEntries,
                            {
                              pickupDateTime: "",
                              pickupLocation: "", // Add default values for other fields
                            },
                          ]);
                        }}
                      >
                        Add More Local Conveyance
                      </Button> */}
                            <hr />
                          </div>
                        )}

                      {formik.values.isTraveling && formik.values.isStaying && (
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              name="pickupDateTime"
                              label="Pickup Date and Time"
                              fullWidth
                              type="datetime-local" // Use datetime-local type to combine date and time
                              required
                              value={formik.values.pickupDateTime}
                              onChange={(event) =>
                                formik.setFieldValue(
                                  "pickupDateTime",
                                  event.target.value
                                )
                              }
                              error={
                                formik.touched.pickupDateTime &&
                                Boolean(formik.errors.pickupDateTime)
                              }
                              helperText={
                                formik.touched.pickupDateTime &&
                                formik.errors.pickupDateTime
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
                            />
                          </Grid>

                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              required
                              error={formik.touched.pickupLocation && formik.errors.pickupLocation}
                              // Adding select prop to make it a dropdown-like input
                              label="PickUp Location"
                              name="pickupLocation"
                              value={formik.values.pickupLocation}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              helperText={
                                formik.touched.pickupLocation && formik.errors.pickupLocation && (
                                  <Typography variant="body2" color="error">
                                    {formik.errors.pickupLocation}
                                  </Typography>
                                )
                              }

                            >

                            </TextField>
                          </Grid>

                          <Grid item xs={6}>
                            <TextField
                              name="dropoffDateTime"
                              label="Drop off Date and Time"
                              fullWidth
                              type="datetime-local" // Use datetime-local type to combine date and time
                              required
                              value={formik.values.dropoffDateTime}
                              onChange={(event) =>
                                formik.setFieldValue(
                                  "dropoffDateTime",
                                  event.target.value
                                )
                              }
                              error={
                                formik.touched.dropoffDateTime &&
                                Boolean(formik.errors.dropoffDateTime)
                              }
                              helperText={
                                formik.touched.dropoffDateTime &&
                                formik.errors.dropoffDateTime
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
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              required
                              error={formik.touched.dropoffLocation && formik.errors.dropoffLocation}
                              // Adding select prop to make it a dropdown-like input
                              label="Drop off Location"
                              name="dropoffLocation"
                              value={formik.values.dropoffLocation}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              helperText={
                                formik.touched.dropoffLocation && formik.errors.dropoffLocation && (
                                  <Typography variant="body2" color="error">
                                    {formik.errors.dropoffLocation}
                                  </Typography>
                                )
                              }

                            >

                            </TextField>
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>

                  <Button
                    type="submit"
                    onClick={handleRegisterClick}
                    variant="contained"
                    color="primary"

                  >
                    Register
                  </Button>
                  {/* Snackbar for feedback confirmation */}
                  <Snackbar
                    open={isRegistrationSuccess}
                    autoHideDuration={2000} // Adjust the duration as needed
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  >
                    <MuiAlert
                      elevation={6}
                      variant="filled"
                      onClose={handleCloseSnackbar}
                      severity="success"
                    >
                      Registration Successful!
                    </MuiAlert>
                  </Snackbar>
                </form>
              )}

              {tabValue === 1 && (

                <form onSubmit={formik.handleSubmit}>
                  <Grid item xs={12} justifyContent="center" display={"flex"}>
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
                      Primary Person Personal Details
                    </Button>
                  </Grid>
                  <br />
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        name="firstName"
                        label="First Name"
                        fullWidth
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
                          value={formik.values.gender}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
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
                    <Grid item xs={4}>
                      <TextField
                        type="number"
                        name="age"
                        label="Age"
                        fullWidth
                        required
                        {...formik.getFieldProps("age")}
                        error={formik.touched.age && formik.errors.age}
                        helperText={formik.touched.age && formik.errors.age}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="contact"
                        label="Contact"
                        fullWidth
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
                        required
                        {...formik.getFieldProps("email")}
                        error={formik.touched.email && formik.errors.email}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="pincode"
                        label="Pincode"
                        fullWidth
                        required
                        {...formik.getFieldProps("pincode")}
                        error={formik.touched.pincode && formik.errors.pincode}
                        helperText={
                          formik.touched.pincode && formik.errors.pincode
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="state"
                        label="State"
                        fullWidth
                        required
                        {...formik.getFieldProps("state")}
                        error={formik.touched.state && formik.errors.state}
                        helperText={formik.touched.state && formik.errors.state}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="district"
                        label="District"
                        fullWidth
                        required
                        {...formik.getFieldProps("district")}
                        error={formik.touched.district && formik.errors.district}
                        helperText={formik.touched.district && formik.errors.district}
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        name="address"
                        label="Address"
                        fullWidth
                        required
                        {...formik.getFieldProps("address")}
                        error={formik.touched.address && formik.errors.address}
                        helperText={
                          formik.touched.address && formik.errors.address
                        }
                      />
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        name="organization"
                        label="Organization Name"
                        fullWidth
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
                    <Grid item xs={12} justifyContent="center" display={"flex"}>
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
                        Details of Meet
                      </Button>
                    </Grid>

                    <Grid item xs={4}>
                      <TextField
                        name="employee"
                        label="Employee Name to meet"
                        fullWidth
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
                        name="depttName"
                        label="Department Name(Optional)"
                        fullWidth
                        {...formik.getFieldProps("depttName")}
                        error={
                          formik.touched.depttName && formik.errors.depttName
                        }
                        helperText={
                          formik.touched.depttName && formik.errors.depttName
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        type="email"
                        name="officeemail"
                        label=" Official Email"
                        fullWidth
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
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="phoneNumber"
                        label="Phone Number"
                        fullWidth
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
                        {...formik.getFieldProps("purpose")}
                        error={formik.touched.purpose && formik.errors.purpose}
                        helperText={
                          formik.touched.purpose && formik.errors.purpose
                        }
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

                    <Grid item xs={6}>
                      <TextField
                        name="arrivalDateTime"
                        label="Arrival Date and Time"
                        fullWidth
                        type="datetime-local" // Use datetime-local type to combine date and time
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
        inputProps={{ min: minDate }}
        />
      </Grid>
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
                        type="datetime-local" // Use datetime-local type to combine date and time
                        required
                        value={formik.values.departureDateTime}
                        onChange={(event) =>
                          formik.setFieldValue(
                            "departureDateTime",
                            event.target.value
                          )
                        }
                        error={
                          formik.touched.departureDateTime &&
                          Boolean(formik.errors.departureDateTime)
                        }
                        helperText={
                          formik.touched.departureDateTime &&
                          formik.errors.departureDateTime
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
                        inputProps={{ min: minDate }}
                        />
                      </Grid>

                    <hr />
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="isStaying"
                            checked={formik.values.isStaying}
                            onChange={formik.handleChange}
                          />
                        }
                        label="Is Accomodation required?"
                      />
                      <hr />
                      {formik.values.isStaying && (
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              name="accFromDate"
                              label="From Date and Time"
                              fullWidth
                              type="datetime-local" // Use datetime-local type to combine date and time
                              required
                              value={formik.values.accFromDate}
                              onChange={(event) =>
                                formik.setFieldValue(
                                  "accFromDate",
                                  event.target.value
                                )
                              }
                              error={
                                formik.touched.accFromDate &&
                                Boolean(formik.errors.accFromDate)
                              }
                              helperText={
                                formik.touched.accFromDate &&
                                formik.errors.accFromDate
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
                            />
                          </Grid>

                          <Grid item xs={6}>
                            <TextField
                              name="accToDate"
                              label="To Date and Time"
                              fullWidth
                              type="datetime-local" // Use datetime-local type to combine date and time
                              required
                              value={formik.values.accToDate}
                              onChange={(event) =>
                                formik.setFieldValue(
                                  "accToDate",
                                  event.target.value
                                )
                              }
                              error={
                                formik.touched.accToDate &&
                                Boolean(formik.errors.accToDate)
                              }
                              helperText={
                                formik.touched.accToDate &&
                                formik.errors.accToDate
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
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            name="isTraveling"
                            checked={formik.values.isTraveling}
                            onChange={formik.handleChange}
                          />
                        }
                        label="Is Local Conveyance required?"
                      />
                      <hr />
                      {formik.values.isTraveling &&
                        !formik.values.isStaying && (
                          <div>
                            <TableContainer component={Paper}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Pickup Date and Time</TableCell>
                                    <TableCell>Pickup Location</TableCell>
                                    <TableCell>Drop Date and Time</TableCell>
                                    <TableCell>Drop Location</TableCell>
                                    {/* Add other Local Conveyance field headers here */}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {travel.map((entry, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {entry.pickupDateTime}
                                      </TableCell>
                                      <TableCell>
                                        {entry.pickupLocation}
                                      </TableCell>

                                      <TableCell>
                                        {entry.dropoffDateTime}
                                      </TableCell>
                                      <TableCell>
                                        {entry.dropoffLocation}
                                      </TableCell>
                                      {/* Add other Local Conveyance fields here */}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>

                            {/* Additional fields for Local Conveyance in a tabular format */}

                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.pickupDateTime`}
                                  label="Pickup Date and Time"
                                  fullWidth
                                  type="datetime-local"
                                  required
                                  value={
                                    formik.values.localConveyanceEntries
                                      .pickupDateTime
                                  }
                                  onChange={(event) =>
                                    formik.setFieldValue(
                                      `localConveyanceEntries.pickupDateTime`,
                                      event.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      ?.pickupDateTime &&
                                    Boolean(
                                      formik.errors.localConveyanceEntries
                                        ?.pickupDateTime
                                    )
                                  }
                                  helperText={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      ?.pickupDateTime &&
                                    formik.errors.localConveyanceEntries
                                      ?.pickupDateTime
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
                                />
                              </Grid>

                              {/* <Grid item xs={6}>
                          <FormControl
                            fullWidth
                            required
                            error={
                              formik.touched.localConveyanceEntries &&
                              formik.touched.localConveyanceEntries
                                ?.pickupLocation &&
                              Boolean(
                                formik.errors.localConveyanceEntries
                                  ?.pickupLocation
                              )
                            }
                          >
                            <InputLabel>PickUp Location</InputLabel>
                            <Select
                              name={`localConveyanceEntries.pickupLocation`}
                              value={
                                formik.values.localConveyanceEntries
                                  .pickupLocation
                              }
                              onChange={(event) =>
                                formik.setFieldValue(
                                  `localConveyanceEntries.pickupLocation`,
                                  event.target.value
                                )
                              }
                              onBlur={formik.handleBlur}
                            >
                              <MenuItem value="airport">Airport</MenuItem>
                              <MenuItem value="station">Station</MenuItem>
                            </Select>
                            {formik.touched.localConveyanceEntries &&
                              formik.touched.localConveyanceEntries
                                ?.pickupLocation &&
                              formik.errors.localConveyanceEntries
                                ?.pickupLocation && (
                                <Typography variant="body2" color="error">
                                  {
                                    formik.errors.localConveyanceEntries
                                      ?.pickupLocation
                                  }
                                </Typography>
                              )}
                          </FormControl>
                        </Grid> */}

                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.pickupLocation`}
                                  label="Pickup Location"
                                  fullWidth
                                  required
                                  value={
                                    formik.values.localConveyanceEntries
                                      .pickupLocation
                                  }
                                  onChange={(event) =>
                                    formik.setFieldValue(
                                      `localConveyanceEntries.pickupLocation`,
                                      event.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      .pickupLocation &&
                                    Boolean(
                                      formik.errors.localConveyanceEntries
                                        ?.pickupLocation
                                    )
                                  }
                                  helperText={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      .pickupLocation &&
                                    formik.errors.localConveyanceEntries
                                      ?.pickupLocation
                                  }
                                />
                              </Grid>

                              {/* Add other Local Conveyance fields here */}
                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.dropoffDateTime`}
                                  label="Drop Date and Time"
                                  fullWidth
                                  type="datetime-local"
                                  required
                                  value={
                                    formik.values.localConveyanceEntries
                                      .dropoffDateTime
                                  }
                                  onChange={(event) =>
                                    formik.setFieldValue(
                                      `localConveyanceEntries.dropoffDateTime`,
                                      event.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      ?.dropoffDateTime &&
                                    Boolean(
                                      formik.errors.localConveyanceEntries
                                        ?.dropoffDateTime
                                    )
                                  }
                                  helperText={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      ?.dropoffDateTime &&
                                    formik.errors.localConveyanceEntries
                                      ?.dropoffDateTime
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
                                />
                              </Grid>

                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.dropoffLocation`}
                                  label="Dropoff Location"
                                  fullWidth
                                  required
                                  value={
                                    formik.values.localConveyanceEntries
                                      .dropoffLocation
                                  }
                                  onChange={(event) =>
                                    formik.setFieldValue(
                                      `localConveyanceEntries.dropoffLocation`,
                                      event.target.value
                                    )
                                  }
                                  error={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      .dropoffLocation &&
                                    Boolean(
                                      formik.errors.localConveyanceEntries
                                        ?.dropoffLocation
                                    )
                                  }
                                  helperText={
                                    formik.touched.localConveyanceEntries &&
                                    formik.touched.localConveyanceEntries
                                      .dropoffLocation &&
                                    formik.errors.localConveyanceEntries
                                      ?.dropoffLocation
                                  }
                                />
                              </Grid>
                            </Grid>

                            <Button
                              type="button"
                              variant="outlined"
                              onClick={() => {
                                if (
                                  formik.values.localConveyanceEntries
                                    .pickupDateTime != "" &&
                                  formik.values.localConveyanceEntries
                                    .pickupLocation != "" &&
                                  formik.values.localConveyanceEntries
                                    .dropoffDateTime != "" &&
                                  formik.values.localConveyanceEntries
                                    .dropoffLocation != ""
                                ) {
                                  setTravel([
                                    ...travel,
                                    formik.values.localConveyanceEntries,
                                  ]);
                                  formik.setFieldValue(
                                    "localConveyanceEntries",
                                    {
                                      pickupDateTime: "",
                                      pickupLocation: "",
                                      dropoffDateTime: "",
                                      dropoffLocation: "",
                                    }
                                  );
                                }
                              }}
                            >
                              Add More Rows
                            </Button>
                            {/* Button to add more Local Conveyance entries */}
                            {/* <Button
                        type="button"
                        variant="outlined"
                        onClick={() => {
                          formik.setFieldValue("localConveyanceEntries", [
                            ...formik.values.localConveyanceEntries,
                            {
                              pickupDateTime: "",
                              pickupLocation: "", // Add default values for other fields
                            },
                          ]);
                        }}
                      >
                        Add More Local Conveyance
                      </Button> */}
                          </div>
                        )}
                      {formik.values.isTraveling && formik.values.isStaying && (
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <TextField
                              name="pickupDateTime"
                              label="Pickup Date and Time"
                              fullWidth
                              type="datetime-local" // Use datetime-local type to combine date and time
                              required
                              value={formik.values.pickupDateTime}
                              onChange={(event) =>
                                formik.setFieldValue(
                                  "pickupDateTime",
                                  event.target.value
                                )
                              }
                              error={
                                formik.touched.pickupDateTime &&
                                Boolean(formik.errors.pickupDateTime)
                              }
                              helperText={
                                formik.touched.pickupDateTime &&
                                formik.errors.pickupDateTime
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
                            />
                          </Grid>

                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              required
                              error={formik.touched.pickupLocation && formik.errors.pickupLocation}
                              // Adding select prop to make it a dropdown-like input
                              label="PickUp Location"
                              name="pickupLocation"
                              value={formik.values.pickupLocation}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              helperText={
                                formik.touched.pickupLocation && formik.errors.pickupLocation && (
                                  <Typography variant="body2" color="error">
                                    {formik.errors.pickupLocation}
                                  </Typography>
                                )
                              }

                            >

                            </TextField>
                          </Grid>

                          <Grid item xs={6}>
                            <TextField
                              name="dropoffDateTime"
                              label="Drop off Date and Time"
                              fullWidth
                              type="datetime-local" // Use datetime-local type to combine date and time
                              required
                              value={formik.values.dropoffDateTime}
                              onChange={(event) =>
                                formik.setFieldValue(
                                  "dropoffDateTime",
                                  event.target.value
                                )
                              }
                              error={
                                formik.touched.dropoffDateTime &&
                                Boolean(formik.errors.dropoffDateTime)
                              }
                              helperText={
                                formik.touched.dropoffDateTime &&
                                formik.errors.dropoffDateTime
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
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              required
                              error={formik.touched.dropoffLocation && formik.errors.dropoffLocation}

                              label="Dropoff Location"
                              name="dropoffLocation"
                              value={formik.values.dropoffLocation}
                              onChange={formik.handleChange}
                              onBlur={formik.handleBlur}
                              helperText={
                                formik.touched.dropoffLocation && formik.errors.dropoffLocation && (
                                  <Typography variant="body2" color="error">
                                    {formik.errors.dropoffLocation}
                                  </Typography>
                                )
                              }

                            >

                            </TextField>
                          </Grid>
                        </Grid>
                      )}
                      <hr />
                    </Grid>
                  </Grid>

                  <br />
                  
                  <Grid item xs={12} justifyContent="center" display={"flex"}>
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
                      Secondary Persons Personal Details
                    </Button>
                  </Grid>
                  <br />
                  <Stack direction={'row'} spacing={2} alignItem={'center'} m ={2}>
                    <Typography variant='h6'>Download Sample Excel and fill it</Typography>
                    <Button variant="outlined" startIcon={<FileDownloadIcon/>}>Download</Button>
                  </Stack>
                  <div {...getRootProps()} style={{ marginBottom: '20px', padding: '20px', border: '2px dashed #ccc', textAlign: 'center' }}>
                    <input {...getInputProps()} />
                    <p>
                      Drag and drop some files here, or click to select files
                    </p>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                  </div>
                  <aside>
                    <h4>Files</h4>
                    <ul>{files}</ul>
                  </aside>
                  <br />

                  <Typography>Upload Excel file (.xlsx, .xls)</Typography>
                  {/* <Button onClick={handleOpenModal}>Add More Person</Button> */}
                  {/* <AddPersonModal isOpen={isModalOpen} onClose={handleCloseModal} onAddPerson={handleAddNewRecord} /> */}
                  <ExcelDataTable jsonData={jsonData1} setData1={setJsonData} ref={excelDataTableRef} handleAddNewRecord={handleAddNewRecord} />

                  <Button type="submit" variant="contained" color="primary">
                    Register
                  </Button>
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
