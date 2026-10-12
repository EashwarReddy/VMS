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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ClearAllIcon from '@mui/icons-material/ClearAll';
// import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useRouter } from "next/router";
import EditNoteIcon from '@mui/icons-material/EditNote';
import { Close, DoneAllOutlined, FileUpload, PhotoCamera, Refresh } from "@mui/icons-material";
import Delete from "@mui/icons-material/Delete";
import { border } from "@mui/system";
import AssetRegistration from "src/components/AssetRegistration";
import { Roles } from "src/components/roles";
import MockWebcamCapture from "src/components/WebCam";
import { useRegister } from "src/contexts/registerContext";

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
  officeemail: Yup.string()
    .required("Please mention the Employee Email who referred you")
    .email("should be an email")
    .matches("@cdac.in", "Must be a CDAC employee Mail"),

  purpose: Yup.string().required("Purpose is required"),
  employee: Yup.string().required("Employee Name is required"),
  deptName: Yup.string(),
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
  govtIdType: Yup.string().required("ID is required"),

  govtIdNumber: Yup.string()
  .required("ID Number is required")
  .test("govtIdNumber-length", "Invalid ID Number length", function (value) {
    const { govtIdType } = this.parent;
    if (!value) return false; // Required validation
    const lengthMap = {
      Aadhaar: 12,
      PAN: 10,
      "Driving License": 14,
    };
    return lengthMap[govtIdType] ? value.length === lengthMap[govtIdType] : true;
  }),
    // .test("lastFourDigits", "Enter only the ", (value) => {
    //   // Check if the value is exactly 4 digits or empty
    //   return !value || /^\d{4}$/.test(value);
    // }),
  visitorType: Yup.string().required("Visitor type is required"),
  state: Yup.string().required("State is required"),
  district: Yup.string().required("district is required"),
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
const detailsList = [
  'firstName',
  'lastName',
  'gender',
  'contact',
  'email',
  'organization',
  'pincode',
  'state',
  'district',
  'address',
]
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
  const [minDate, setMinDate] = React.useState('');

  const [isRegistrationSuccess, setIsRegistrationSuccess] = useState(false);
  const [open, setOpen] = React.useState({ open: false });
  const [sOpen, setSOpen] = useState({ open: false })
  const [state, setState] = useState({})
  const [circ, setCirc] = useState(false)
  const [serverErrors, setServerErrors] = useState([])
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [failedProf, setFailedProf] = useState(false)
  const [data, setData] = useState([
    {
      "firstName": "",
      "lastName": "",
      "email": "",
      "state": "",
      "gender": '',
      "district": "",
      "address": "",
      "pincode": "",
      "visitorType": "",
      "age": "",
      "contact": "",
      'arrivalDateTime': '',
      "GovernmentId Type": '',
      "departureDateTime": ''
    }
  ])
  const [isUploading,setIsUploading] = useState(false)
  const [profileImage,setProfileImage] = useState(null)
  const [preview, setPreview] = useState(null);
  const [details, setDetails] = useState(true)
  const handleOpen = () => setOpen((prev) => { return { ...prev, open: true } });
  const handleClose = () => {
    setOpen((prev) => { return { ...prev, open: false } });
    setSOpen((prev) => { return { ...prev, open: false } });
  }
  const router = useRouter()
  const auth = useAuth()
  const handleCloseSnackbar = () => {
    setState({ ...state, open: false })
    setIsRegistrationSuccess(false);
  };
  const exportToExcel = () => {
    console.log('data',data)
    if(data.length == 0)
    {
      setState({ severity: 'error', message: 'Data is empty', open: true })

      return ;

    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(dataBlob, 'your_data.xlsx');
  };
  const sampleExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        "firstName": "",
        "lastName": "",
        "email": "",
        "state": "",
        "gender": '',
        "district": "",
        "address": "",
        "pincode": "",
        "visitorType": "",
        "age": "",
        "contact": "",
        'arrivalDateTime': '',
        "GovernmentId Type": '',
        "departureDateTime": ''
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    saveAs(dataBlob, 'your_data.xlsx');
  };

  const [jsonData1, setJsonData] = useState();
  const [error, setError] = useState(null);
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddPerson = (personDetails) => {
    // Handle adding the new person details
    console.log("Adding person:", personDetails);
    // Clone the existing jsonData array to avoid mutating the state directly
    const updatedJsonData = [...jsonData1, personDetails];

    // Update the state with the new data
    setJsonData(updatedJsonData);
    // You can perform additional actions, such as updating state or making API calls
    // Save the updated data to local storage
    localStorage.setItem("jsonData", JSON.stringify(updatedJsonData));
  };

  // Set jsonData using your file reading logic
  // console.log("sampleData::", jsonData1);
  // const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const { acceptedFiles, rejectedFiles, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        "application/vnd.ms-excel": [".xls"],
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
          ".xlsx",
        ],
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
            localStorage.setItem("jsonData", JSON.stringify(jsonData));

            setJsonData(jsonData);
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
      // age: "",
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
      // pickupDateTime: "",
      // dropoffDateTime: "",
      // pickupLocation: "",
      // dropoffLocation: "",
      isStaying: false,
      isTraveling: false,
      localConveyanceEntries: {
        pickupDateTime: "",
        pickupLocation: "",
        dropoffLocation: "",
        dropoffDateTime: "",
      },
      vehicle : ""
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
      const newValues = { ...values, submittedby: auth?.user?.email, arrivalDateTime : formik.values.arrivalDateTime+':00.000+00:00', departureDateTime : formik.values.departureDateTime+':00.000+00:00', pickupDateTime: formik.values.pickupDateTime+':00.000+00:00' ,dropoffDateTime:formik.values.dropoffDateTime+':00.000+00:00'}
      // Now you can use 'lastFourDigits' as needed
      console.log("Last Four Digits:", lastFourDigits);

      try {
        const response = await axios.post(
          '/visit/visitindividual',
          newValues,
          {
            headers: {
                Authorization: `Bearer ${auth?.user?.accessToken}`
            }
        }
        );
        console.log("Response for standard individual", response);
        setState({ severity: 'success', message: 'Submitted Successfully', open: true })
      } catch (error) {
        try {
          console.log("Error", error);
          setState({ severity: 'error', message: error.response.data.errors[0], open: true })
        } catch (e) {
          setState({ severity: 'error', message: 'Error occured', open: true })
          
        }
      
      }
    },
  });
  const [photo,setPhoto] = useState()
  const [webCam,setWebCam] = useState(false)
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

  const handleChange = (newFiles) => {
    setFiles(newFiles);
  };
const setPhotograph = (x)=>{
  setState({ severity: 'success', message: 'Photo Saved Successfully', open: true })
  setPhoto(x)

}
  // useEffect(() => {
  //   const getStateAndCity = async (pincode) => {
  //     try {
  //       const response = await normalaxios.get(
  //         `https://api.postalpincode.in/pincode/${pincode}`
  //       );

  //       if (response.data && response.data.length > 0) {
  //         const data = response.data[0];
  //         setState({ severity: 'success', message: 'Fetched State and District', open: true })
  //         if (data.Status === "Success") {
  //           const location = data.PostOffice[0];
  //           const state = location.State;
  //           const city = location.District;
  //           console.log(`State: ${state}, District: ${city}`);
  //           formik.setFieldValue("state", state);
  //           formik.setFieldValue("district", city);
  //           setState({ severity: 'success', message: 'Fetched State and District', open: true })
  //           setCirc(false)
  //         } else {
  //           console.log("Invalid pincode");
  //           formik.setFieldError("pincode", "Invalid pincode");
  //           setState({ severity: 'error', message: 'Invalid Pincode', open: true })
  //           setCirc(false)
  //         }
  //       } else {
  //         console.log("No data found for the given pincode");
  //         setState({ severity: 'error', message: 'No data found for the given pincode', open: true })
  //         setCirc(false)
  //         formik.setFieldError(
  //           "pincode",
  //           "No data found for the given pincode"
  //         );
  //       }
  //     } catch (error) {
  //       console.error("Error fetching data:", error.message);
  //       formik.setFieldError("pincode", "error while fetching data");
  //       setState({ severity: 'error', message: error?.response?.errors[0], open: true })

  //     }
  //   };
  //   console.log("trigger");
  //   if (formik.values.pincode?.length == 6 
  //     // && (
  //     // formik.values.state != '' || formik.values.district != '')
  //     ) {
  //     getStateAndCity(formik.values.pincode);
  //   } else {
  //     formik.setFieldValue("state", "");
  //     formik.setFieldValue("district", "");
  //   }
  // }, [formik.values.pincode]);

  useEffect(() => {
    setData(jsonData1)
  }, [jsonData1])
const register = useRegister();
const [pnr,setPNR] = useState(register.RegisterNow?.pnr);
  const  [currentTab,setCurrentTab] = useState(register.RegisterNow?.currentTab);
  useEffect(() => {
    //const token = searchParams.get("token");
    console.log('pnr, currentTab', pnr, currentTab, register)
    const getDetails = async (link) => {
      let response
      try {
        response = await axios.get(link,   {
          headers: {
              Authorization: `Bearer ${auth?.user?.accessToken}`
          }
      })
        setState({ severity: 'success', message: 'Fetched Details Succesfully', open: true })
      } catch (e) {
        setState({ severity: 'error', message: 'Error fetching details', open: true })

      }

      // console.log('individual', response,
      //   Object.keys(response.data.visitDetails)
      // )
      function isValidDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
      }
      Object.keys(response.data.visitDetails).map((item) => {
        formik.setFieldValue(item, response.data.visitDetails[item])
      })
      formik.setFieldValue('arrivalDateTime',  response.data.visitDetails.arrivalDateTime?.split('.')[0])
      formik.setFieldValue('departureDateTime',  response.data.visitDetails.departureDateTime?.split('.')[0])

      console.log('date', response.data.visitDetails.departureDateTime?.split('.')[0])
      // formik.setFieldValue('departureDateTime', (new Date(response.data.visitDetails.departureDateTime).toLocaleString(undefined, {  timeZone: 'IST' })).split(', ').map((s, i) => i === 0 ? s.split('/').reverse().join('-') : s.slice(0, 5).replace(" ", "T")).join('T'))
      formik.setFieldValue('accFromDate', response.data.accomodationDetails.arrivalDateTime?.split('.')[0])
      formik.setFieldValue('accToDate', response.data.accomodationDetails.departureDateTime?.split('.')[0])
      if (response.data.visitDetails.isStaying == true && response.data.visitDetails.isTraveling == true) {
        console.log('the visit and accomodation', response.data.visitDetails.isStaying, response.data.visitDetails.isTraveling, 'added pickupDateTime', response.data.conveyanceDetails[0])

        formik.setFieldValue(
          "pickupDateTime",
          response.data.conveyanceDetails[0]?.pickupDateTime?.split('.')[0]
        )
        formik.setFieldValue(
          "dropoffDateTime",
          response.data.conveyanceDetails[0]?.dropoffDateTime?.split('.')[0]
        )
        formik.setFieldValue(
          "pickupLocation",
          response.data.conveyanceDetails[0]?.pickupLocation
        )
        formik.setFieldValue(
          "dropoffLocation",
          response.data.conveyanceDetails[0]?.dropOffLocation
        )
        // formik.setFieldValue()
      }
      else if ((response.data.visitDetails.isStaying == false && response.data.visitDetails.isTraveling == true)) {
        console.log('the visit and accomodation array', response.data.visitDetails.isStaying, response.data.visitDetails.isTraveling)
        setTravel(response.data.conveyanceDetails.map(item => {
          return {
            pickupDateTime: item.pickupDateTime?.split('.')[0]+':00.000+00:00',
            dropoffDateTime: item.dropoffDateTime?.split('.')[0]+':00.000+00:00',
            dropoffLocation: item.dropOffLocation,
            pickupLocation: item.pickupLocation
          }
        }))
      }
      if (currentTab == 1) {
        setJsonData(response.data.visitDetails.secondaryvisitors)
      }
    }
    if (!!pnr) {
      try {
        console.log(currentTab, register.RegisterNow?.pnr)
        if (currentTab == 0) {
          getDetails(`/checkdetails/all-ind-details/${register.RegisterNow?.pnr}`)
          setTabValue(0)
        } else if (currentTab == 1) {
          getDetails(`/checkdetails/all-org-details/${register.RegisterNow?.pnr}`)
          setTabValue(1)
        }
      } catch (error) {
        console.log(error)
      }
    }

  }, []);

  const getProfilePhoto = async ()=>{
    try {
      const response = await axios.get(`/users/profilePhoto/${auth?.user?.id}`,{
        headers : {
          'Authorization' :`Bearer ${auth?.user?.accessToken}`
        },
        responseType: 'blob',
      });

      
      const imageUrl = URL.createObjectURL(response.data); // Create an object URL for the blob
      setSelectedFile(imageUrl);
      console.log('response', response)
      setFailedProf(false)

    } catch (error) {
      console.log('error fetching profile photo', error)
      setFailedProf(true)
    }
  }

   
  const getPhotofromVisit = async ()=>{
    try {
      console.log('pnr ---->', pnr,register.RegisterNow?.pnr)
      const response = await axios.get(`/users/visitorPhoto/${register.RegisterNow?.pnr}`,{
        headers : {
          'Authorization' :`Bearer ${auth?.user?.accessToken}`
        },
        responseType: 'blob',
      });

      
      const imageUrl = URL.createObjectURL(response.data); // Create an object URL for the blob
      setSelectedFile(imageUrl);
      setProfileImage(imageUrl)
      console.log('response', response)
    } catch (error) {
      console.log('error fetching profile photo', error)
    }
  }

  useEffect(()=>{

  if(register.RegisterNow?.pnr == null){
    getProfilePhoto();
  }else{
    getPhotofromVisit();
  }
  
  },[]);
  useEffect(()=>{
    const getProfilePhoto = async () => {
      try {
        const response = await axios.get(`/users/profilePhoto/${auth?.user?.id}`, {
          headers: {
            Authorization: `Bearer ${auth?.user?.accessToken}`,
          },
          responseType: 'blob', // Fetch the image as a Blob
        });
    
        // Create an object URL for the Blob to display the image
        const imageUrl = URL.createObjectURL(response.data);
        setProfileImage(imageUrl);
    
        // Save the Blob in setSelectedFile
        setSelectedFile(response.data);
    
        console.log('response', response);
      } catch (error) {
        console.log('error fetching profile photo', error);
      }
    };
    if(pnr == null)
    getProfilePhoto();
    },[details,auth?.user?.roles]);
useEffect(()=>{
    formik.setFieldValue('firstName', auth?.user?.firstName)
    formik.setFieldValue('lastName', auth?.user?.lastName)
    formik.setFieldValue('gender', auth?.user?.gender)
    formik.setFieldValue('contact', auth?.user?.mobileNo)
    formik.setFieldValue('email', auth?.user?.email)
    formik.setFieldValue('organization',auth?.user?.organisation)
    formik.setFieldValue('pincode',auth?.user?.pincode)
    formik.setFieldValue('address',auth?.user?.address)
    formik.setFieldValue('district',auth?.user?.district || 'Hyderabad')
    formik.setFieldValue('state',auth?.user?.state)
},[auth?.user?.roles])

useEffect(()=>{
  // console.log('clickign on reset form', auth.user)
  if( currentTab !== 0 &&  currentTab !== 1){
    formik.setFieldValue('firstName', auth?.user?.firstName)
    formik.setFieldValue('lastName', auth?.user?.lastName)
    formik.setFieldValue('gender', auth?.user?.gender)
    formik.setFieldValue('contact', auth?.user?.mobileNo)
    formik.setFieldValue('email', auth?.user?.email)
    formik.setFieldValue('organization',auth?.user?.organisation)
    formik.setFieldValue('pincode',auth?.user?.pincode)
    formik.setFieldValue('address',auth?.user?.address)
    formik.setFieldValue('district',auth?.user?.district || 'Hyderabad')
    formik.setFieldValue('state',auth?.user?.state)

  }

},[details, auth?.user?.roles])

  const files = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

//   const handleRegisterClick = async (event) => {
// console.log('formik values', formik.values)
//     event.preventDefault();
//     const formDataWithPNR = {
//       ...formik.values,
//       localConveyanceEntries:
//         travel.length > 0
//           ? travel
//           : [
//             {
//               pickupDateTime: formik.values.pickupDateTime+':00.000+00:00',
//               pickupLocation: formik.values.pickupLocation,
//               dropoffDateTime: formik.values.dropoffDateTime+':00.000+00:00',
//               dropoffLocation: formik.values.dropoffLocation,
//             },
//           ],
//       submittedby: auth?.user?.email,
//       secondaryvisitors: tabValue === 1 ? jsonData1 : [],
//       draft: false
//     };

//     try {
//       let endpoint = "";

//       if (tabValue === 0) {
//         // Use the endpoint for individual
//         endpoint = "/visit/visitindividual";
//       } else if (tabValue === 1) {
//         // Use the endpoint for organization
//         endpoint = "/orgvisit/visitorganization";
//       } else {
//         console.error("Unknown tab value");
//         return;
//       }

      
//       // Convert to Blob
//       function base64ToBlob(base64, mime) {
//         const byteCharacters = atob(base64);
//         const byteArrays = [];
    
//         for (let offset = 0; offset < byteCharacters.length; offset += 512) {
//             const slice = byteCharacters.slice(offset, offset + 512);
//             const byteNumbers = new Array(slice.length);
    
//             for (let i = 0; i < slice.length; i++) {
//                 byteNumbers[i] = slice.charCodeAt(i);
//             }
    
//             const byteArray = new Uint8Array(byteNumbers);
//             byteArrays.push(byteArray);
//         }
    
//         return new Blob(byteArrays, { type: mime });
//     }
//       const formData = new FormData();
//       console.log('blob i think b4', photo)


//       if(photo){
//         const base64Data = photo.split(',')[1];
        
//         const mimeType = 'image/png'; // Replace with your image's MIME type
//         const imageBlob = base64ToBlob(base64Data, mimeType);
//       console.log('blob i think', imageBlob, photo, base64Data)
//         // Extract Base64 data without the data URL scheme
//         formData.append('file', imageBlob, 'image.png');
        

//       }else if(selectedFile) {
//         formData.append('file', selectedFile, 'image.png');
//       }else {
//         console.log('the photo', photo,'selected file', selectedFile)
//         setState({ severity: 'error', message: 'Please save photo before submitting', open: true })
//         return;

//       }
//       Object.keys(formDataWithPNR).map(k => {
        
     
       
//         if(k == 'localConveyanceEntries' || k=='secondaryvisitors'){
//           formData.append(`${k}`, JSON.stringify(formDataWithPNR[k]))
//         }else {
//           formData.append(`${k}`, formDataWithPNR[k])
//         }
      
//       })

//       const response = await axios.post(endpoint, formData,    {
//         headers: {
//             Authorization: `Bearer ${auth?.user?.accessToken}`
//         }
//     });
//       console.log("Response:", response);
     

//       if (response.status >= 200 && response.status < 300) {
//         console.log("Form data submitted successfully!");
//         setIsRegistrationSuccess(true)
//         setState({ severity: 'success', message: 'Registered Successfully', open: true })
//         // Handle success, e.g., show a success message to the user
//         // formik.resetForm()
//         formik.setFieldValue('arrivalDateTime', '')
//         formik.setFieldValue('departureDateTime', '')
//         setJsonData({})
       
//         Object.keys(formDataWithPNR).map(k => { 
//           if(!detailsList.includes(k)){
//             formik.setFieldValue(`${k}`, '')
//           }
//         } )
//         // setSelectedFile('');
//         formik.setFieldValue('isStaying', false)
//         formik.setFieldValue('isTraveling', false)
//         setPreview('');
//       } else {
//         console.error("Failed to submit form data");
//         // setServerErrors(response)
//         setState({ severity: 'error', message: 'Registration Failed', open: true })
//         // Handle failure, e.g., show an error message to the user
//       }
//     } catch (error) {
//       console.error("Error while submitting form data:",error);
//       const errorMessage = JSON.stringify(error.response.data.errors); // Join array elements into a single string
//       setState({ severity: 'error', message: errorMessage, open: true });
//     }
    
//   };

const handleRegisterClick = async (event) => {
  event.preventDefault();
  console.log("formik values.................", formik.values);

  // Correctly build localConveyanceEntries
  const localConveyanceEntries =
    travel.length > 0
      ? travel
      : formik.values.isTraveling  
      ? [
          {
            pickupDateTime: formik.values.localConveyanceEntries?.pickupDateTime
              ? formik.values.localConveyanceEntries.pickupDateTime + ":00.000+00:00"
              : "",
            pickupLocation: formik.values.localConveyanceEntries?.pickupLocation || "",
            dropoffDateTime: formik.values.localConveyanceEntries?.dropoffDateTime
              ? formik.values.localConveyanceEntries.dropoffDateTime + ":00.000+00:00"
              : "",
            dropoffLocation: formik.values.localConveyanceEntries?.dropoffLocation || "",
          },
        ]
          : [];  

  // Validate travel data
  // if (formik.values.isTraveling && localConveyanceEntries[0].pickupDateTime === "") {
  //   setState({
  //     severity: "error",
  //     message: "Please fill in all travel details before submitting",
  //     open: true,
  //   });
  //   return;
  // }

  if (
    formik.values.isTraveling &&
    travel.length === 0 &&   // user did not add rows manually
    !formik.values.localConveyanceEntries.pickupDateTime
  ) {
    setState({
      severity: "error",
      message: "Please fill in all travel details before submitting",
      open: true,
    });
    return;
  }

  const formDataWithPNR = {
    ...formik.values,
    localConveyanceEntries,
    submittedby: auth?.user?.email,
    secondaryvisitors: tabValue === 1 ? jsonData1 : [],
    draft: false,
  };

  console.log("formDataWithPNR........................",formDataWithPNR)

  try {
    let endpoint = tabValue === 0 ? "/visit/visitindividual" : "/orgvisit/visitorganization";

    // Convert photo to Blob if available
    function base64ToBlob(base64, mime) {
      const byteCharacters = atob(base64);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      return new Blob(byteArrays, { type: mime });
    }

    const formData = new FormData();

    if (photo) {
      const base64Data = photo.split(",")[1];
      const mimeType = "image/png";
      const imageBlob = base64ToBlob(base64Data, mimeType);
      formData.append("file", imageBlob, "image.png");
    } else if (selectedFile) {
      formData.append("file", selectedFile, "image.png");
    } else {
      setState({ severity: "error", message: "Please save photo before submitting", open: true });
      return;
    }

    // Append form fields
    Object.keys(formDataWithPNR).forEach((k) => {
      if (k === "localConveyanceEntries" || k === "secondaryvisitors") {
        formData.append(k, JSON.stringify(formDataWithPNR[k]));
      } else {
        formData.append(k, formDataWithPNR[k]);
      }
    });



    const response = await axios.post(endpoint, formData, {
      headers: {
        Authorization: `Bearer ${auth?.user?.accessToken}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      setIsRegistrationSuccess(true);
      setState({ severity: "success", message: "Registered Successfully", open: true });

      // Reset form
      // formik.resetForm();
      formik.setFieldValue('arrivalDateTime', '')
      formik.setFieldValue('departureDateTime', '')
      setTravel([]);
      setJsonData({});
      setPreview("");
      router.push('/standard')
    } else {
      setState({ severity: "error", message: "Registration Failed", open: true });
    }
  } catch (error) {
    console.error("Error while submitting form data:", error);
    const errorMessage = error.response?.data?.errors
      ? JSON.stringify(error.response.data.errors)
      : "Server Error";
    setState({ severity: "error", message: errorMessage, open: true });
  }
};

const handleInitialDraftClick = async (event) => {
  event.preventDefault();
  console.log("formik values.................", formik.values);

  // Correctly build localConveyanceEntries
  const localConveyanceEntries =
    travel.length > 0
      ? travel
      : formik.values.isTraveling  
      ? [
          {
            pickupDateTime: formik.values.localConveyanceEntries?.pickupDateTime
              ? formik.values.localConveyanceEntries.pickupDateTime + ":00.000+00:00"
              : "",
            pickupLocation: formik.values.localConveyanceEntries?.pickupLocation || "",
            dropoffDateTime: formik.values.localConveyanceEntries?.dropoffDateTime
              ? formik.values.localConveyanceEntries.dropoffDateTime + ":00.000+00:00"
              : "",
            dropoffLocation: formik.values.localConveyanceEntries?.dropoffLocation || "",
          },
        ]
          : [];  

  if (
    formik.values.isTraveling &&
    travel.length === 0 &&   // user did not add rows manually
    !formik.values.localConveyanceEntries.pickupDateTime
  ) {
    setState({
      severity: "error",
      message: "Please fill in all travel details before submitting",
      open: true,
    });
    return;
  }

  const formDataWithPNR = {
    ...formik.values,
    localConveyanceEntries,
    submittedby: auth?.user?.email,
    secondaryvisitors: tabValue === 1 ? jsonData1 : [],
    draft: true,
  };

  console.log("formDataWithPNR........................",formDataWithPNR)

  try {
    let endpoint = tabValue === 0 ? "/visit/visitindividual" : "/orgvisit/visitorganization";

    // Convert photo to Blob if available
    function base64ToBlob(base64, mime) {
      const byteCharacters = atob(base64);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      return new Blob(byteArrays, { type: mime });
    }

    const formData = new FormData();

    if (photo) {
      const base64Data = photo.split(",")[1];
      const mimeType = "image/png";
      const imageBlob = base64ToBlob(base64Data, mimeType);
      formData.append("file", imageBlob, "image.png");
    } else if (selectedFile) {
      formData.append("file", selectedFile, "image.png");
    } else {
      setState({ severity: "error", message: "Please save photo before submitting", open: true });
      return;
    }

    // Append form fields
    Object.keys(formDataWithPNR).forEach((k) => {
      if (k === "localConveyanceEntries" || k === "secondaryvisitors") {
        formData.append(k, JSON.stringify(formDataWithPNR[k]));
      } else {
        formData.append(k, formDataWithPNR[k]);
      }
    });



    const response = await axios.post(endpoint, formData, {
      headers: {
        Authorization: `Bearer ${auth?.user?.accessToken}`,
      },
    });

    if (response.status >= 200 && response.status < 300) {
      console.log("Form data submitted successfully!");
      setState({ severity: 'success', message: 'Draft Saved Successfully', open: true })
      setIsRegistrationSuccess(true)
      // Handle success, e.g., show a success message to the user
      // formik.resetForm()
      formik.setFieldValue('arrivalDateTime', '')
      formik.setFieldValue('departureDateTime', '')
      setJsonData({})
      register.newRegister({
        pnr : null,
        currentTab : null
      })
    } else {
      console.error("Failed to submit form data for code between 200 and 300");
      setState({ severity: 'error', message: 'Error Saving Draft', open: true })
      // Handle failure, e.g., show an error message to the user
    }
  } catch (error) {
    console.error("Error while submitting form data:", error.response.data.errors);
    const errorMessage = error.response?.data?.errors
    ? JSON.stringify(error.response.data.errors)
    : "Server Error";
    setState({ severity: 'error', message: errorMessage, open: true });
  }
};



  const handleFinalClick = async (event) => {

    //event.preventDefault();
    console.log("formik values.................", formik.values);
  
    // Correctly build localConveyanceEntries
    const localConveyanceEntries =
      travel.length > 0
        ? travel
        : formik.values.isTraveling  
        ? [
            {
              pickupDateTime: formik.values.localConveyanceEntries?.pickupDateTime
                ? formik.values.localConveyanceEntries.pickupDateTime + ":00.000+00:00"
                : "",
              pickupLocation: formik.values.localConveyanceEntries?.pickupLocation || "",
              dropoffDateTime: formik.values.localConveyanceEntries?.dropoffDateTime
                ? formik.values.localConveyanceEntries.dropoffDateTime + ":00.000+00:00"
                : "",
              dropoffLocation: formik.values.localConveyanceEntries?.dropoffLocation || "",
            },
          ]
            : [];  
  
    if (
      formik.values.isTraveling &&
      travel.length === 0 &&   // user did not add rows manually
      !formik.values.localConveyanceEntries.pickupDateTime
    ) {
      setState({
        severity: "error",
        message: "Please fill in all travel details before submitting",
        open: true,
      });
      return;
    }
  
    const formDataWithPNR = {
      ...formik.values,
      localConveyanceEntries,
      submittedby: auth?.user?.email,
      secondaryvisitors: tabValue === 1 ? jsonData1 : [],
      draft: false,
    };
  
    console.log("formDataWithPNR........................",formDataWithPNR)
    console.log("pnr..........",pnr)
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

          // Convert photo to Blob if available
    function base64ToBlob(base64, mime) {
      const byteCharacters = atob(base64);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      return new Blob(byteArrays, { type: mime });
    }
      const formData = new FormData();
      console.log('blob i think b4', photo)
      // if(photo){
      //   const base64Data = photo.split(',')[1];
        
      //   const mimeType = 'image/png'; // Replace with your image's MIME type
      //   const imageBlob = base64ToBlob(base64Data, mimeType);
      // console.log('blob i think', imageBlob, photo, base64Data)
      //   // Extract Base64 data without the data URL scheme
      //   formData.append('file', imageBlob, 'image.png');
        

      // }else if(selectedFile) {
      //   formData.append('file', selectedFile, 'image.png');
      // }else {
      //   setState({ severity: 'error', message: 'Please save photo before submitting', open: true })
      //   return;

      // }
       // Append form fields
       Object.keys(formDataWithPNR).forEach((k) => {
        if (k === "localConveyanceEntries") {
          console.log(" JSON.stringify(formDataWithPNR[k]...........", JSON.stringify(formDataWithPNR[k]))
          formData.append(k, JSON.stringify(formDataWithPNR[k]));
        } else {
          formData.append(k, formDataWithPNR[k]);
        }
      });
console.log("formDate..........",formData)
      const response = await axios.put(endpoint, formData,    {
        headers: {
            Authorization: `Bearer ${auth?.user?.accessToken}`
        }
    });
      console.log("Response:", response);

      if (response.status >= 200 && response.status < 300) {
        console.log("Form data submitted successfully!");
        setIsRegistrationSuccess(true)
        setState({ severity: 'success', message: 'Registered Successfully', open: true })
        // Handle success, e.g., show a success message to the user
        formik.resetForm()
        formik.setFieldValue('arrivalDateTime', '')
        formik.setFieldValue('departureDateTime', '')
        setJsonData({})
        router.push('/standard')
      } else {
        console.error("Failed to submit form data");
        setState({ severity: 'error', message: 'Failed to Register', open: true })
        // Handle failure, e.g., show an error message to the user
      }
    } catch (error) {
      // console.error("Error while submitting form data:", error);
      // setState({ severity: 'error', message: error.response?.data?.errors[0], open: true })
      console.error("Error while submitting form data:",  error.response.data.errors);
      // const errorMessage = JSON.stringify(error.response.data.errors); // Join array elements into a single string
      // setState({ severity: 'error', message: errorMessage, open: true });
    }
  };
  const handleDraftClick = async (event) => {

    event.preventDefault();
    console.log("formik values.................", formik.values);
  
    // Correctly build localConveyanceEntries
    const localConveyanceEntries =
      travel.length > 0
        ? travel
        : formik.values.isTraveling  
        ? [
            {
              pickupDateTime: formik.values.localConveyanceEntries?.pickupDateTime
                ? formik.values.localConveyanceEntries.pickupDateTime + ":00.000+00:00"
                : "",
              pickupLocation: formik.values.localConveyanceEntries?.pickupLocation || "",
              dropoffDateTime: formik.values.localConveyanceEntries?.dropoffDateTime
                ? formik.values.localConveyanceEntries.dropoffDateTime + ":00.000+00:00"
                : "",
              dropoffLocation: formik.values.localConveyanceEntries?.dropoffLocation || "",
            },
          ]
            : [];  
  
    if (
      formik.values.isTraveling &&
      travel.length === 0 &&   // user did not add rows manually
      !formik.values.localConveyanceEntries.pickupDateTime
    ) {
      setState({
        severity: "error",
        message: "Please fill in all travel details before submitting",
        open: true,
      });
      return;
    }
  
    const formDataWithPNR = {
      ...formik.values,
      localConveyanceEntries,
      submittedby: auth?.user?.email,
      secondaryvisitors: tabValue === 1 ? jsonData1 : [],
      draft: true,
    };
  
    console.log("formDataWithPNR........................",formDataWithPNR)
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
         // Convert photo to Blob if available
         function base64ToBlob(base64, mime) {
          const byteCharacters = atob(base64);
          const byteArrays = [];
    
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            byteArrays.push(new Uint8Array(byteNumbers));
          }
          return new Blob(byteArrays, { type: mime });
        }
    
        const formData = new FormData();
    
        // if (photo) {
        //   const base64Data = photo.split(",")[1];
        //   const mimeType = "image/png";
        //   const imageBlob = base64ToBlob(base64Data, mimeType);
        //   formData.append("file", imageBlob, "image.png");
        // } else if (selectedFile) {
        //   formData.append("file", selectedFile, "image.png");
        // } else {
        //   setState({ severity: "error", message: "Please save photo before submitting", open: true });
        //   return;
        // }
    
        // Append form fields
        Object.keys(formDataWithPNR).forEach((k) => {
          if (k === "localConveyanceEntries") {
            formData.append(k, JSON.stringify(formDataWithPNR[k]));
          } else {
            formData.append(k, formDataWithPNR[k]);
          }
        });
  
        
  
      const response = await axios.put(endpoint, formData,   {
        headers: {
            Authorization: `Bearer ${auth?.user?.accessToken}`
        }
    });
      console.log("Response:", response);
  
      if (response.status >= 200 && response.status < 300) {
        console.log("Form data submitted successfully!");
        setIsRegistrationSuccess(true)
        setState({ severity: 'success', message: 'Draft Saved Successfully', open: true })
        // Handle success, e.g., show a success message to the user
        formik.resetForm()
        setJsonData({})
        router.push('/standard')
      } else {
        console.error("Failed to submit form data");
        setState({ severity: 'error', message: 'Failed to save draft', open: true })
        // Handle failure, e.g., show an error message to the user
      }
    } catch (error) {
      // console.error("Error while submitting form data:", error);
      // setState({ severity: 'error', message: error.response.data.errors[0], open: true })
      console.error("Error while submitting form data:",  error.response.data.errors);
      // const errorMessage = error.response.data.errors.join(', '); // Join array elements into a single string
      // setState({ severity: 'error', message: errorMessage, open: true });
    }
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

  console.log("auth roles::",auth)
if (auth?.user?.roles === Roles["Host"] || auth?.user?.roles === Roles["Visitor"] ) {
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
              formik.setFieldValue('firstName', auth?.user?.firstName)
              formik.setFieldValue('lastName', auth?.user?.lastName)
              formik.setFieldValue('gender', auth?.user?.gender)
              formik.setFieldValue('contact', auth?.user?.mobileNo)
              formik.setFieldValue('email', auth?.user?.email)
              formik.setFieldValue('organization',auth?.user?.organisation)
              formik.setFieldValue('pincode',auth?.user?.pincode)
              formik.setFieldValue('address',auth?.user?.address)
              formik.setFieldValue('district',auth?.user?.district || 'Hyderabad')
              formik.setFieldValue('state',auth?.user?.state)
              // register.newRegister(null,null)
              setTravel([])
              router.push('/standard')
            }}>Accept</Button>
            <Button variant="contained" sx={{ backgroundColor: 'error.main' }} onClick={() => { handleClose() }}>Reject</Button>
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
            By submitting for approval the details can&apos;t be changed any further.
          </Typography>
          <Stack direction={'row'} spacing={2} p={2}>
            <Button variant="contained" onClick={() => {
              handleFinalClick();
              setSOpen((prev) => { return { ...prev, open: false } });
              register.newRegister({
                pnr : null,
                currentTab : null
              })
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
              {/* <Button onClick={() => setDetails(!details)}>Reset Form</Button> */}
              <br />
              {tabValue === 0 && (
                <form
                  onSubmit={formik.handleSubmit}
                  sx={{ backgroundColor: "#1b331b", color: "primary.main" }}
                >
                  <Grid container spacing={2} alignItems={'center'}>
                  {/* <Grid item xs={4}>
<InputLabel>Upload Photo</InputLabel>
{(!!profileImage) && !isUploading ? (
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <img
              src={profileImage}
              alt="Fetched Image"
              style={styles.imagePreview}
            />
          </Grid>
        ) : isUploading ? (
          <Typography>Your uploaded photo</Typography>
        ):(
          !failedProf ? <Typography>Loading your profile photo...</Typography> : <Button onClick={()=>{
   getProfilePhoto()
          }} startIcon={<Refresh/> }>Try Again</Button>
        )}
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
                  </Grid> */}
{/* <Grid item xs={4} sx={{ backgroundColor: 'transparent' }}>
  <Box
    sx={{
      width: 300,
      height: 400,
      mt: 2,
   
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',

      borderRadius: '8px',
  
    }}
  >
    {preview ? (
      <img
        src={preview}
        alt="Preview"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '8px',
        }}
      />
    ) : !!profileImage && !isUploading ? (
      <img
        src={profileImage}
        alt="Fetched Image"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: '8px',
        }}
      />
    ) : isUploading ? (
      <Typography>Uploading your photo...</Typography>
    ) : !failedProf ? (
      <Typography>Loading your profile photo...</Typography>
    ) : (
      <Button onClick={getProfilePhoto} startIcon={<Refresh />}>
        Try Again
      </Button>
    )}
  </Box>


  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
    {!webCam && (
      <Button
        variant="contained"
        component="label"
        startIcon={<FileUpload />}
      >
        Upload Photo
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
      </Button>
    )}

    <Button
      startIcon={webCam ? <Close /> : <PhotoCamera />}
      variant={webCam ? 'outlined' : 'contained'}
      color={webCam ? 'error' : 'info'}
      onClick={() => setWebCam(!webCam)}
    >
      {webCam ? 'Close' : 'Capture Now'}
    </Button>
  </Box>

  {webCam && <MockWebcamCapture setPhoto={setPhotograph} />}

 
  {selectedFile && (
    <Typography variant="body1" sx={{ mt: 1 }}>
      Selected File: {selectedFile.name}
    </Typography>
  )}
</Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="firstName"
                        label="First Name"
                        fullWidth
                      
                        disabled
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                                        
                        disabled
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        {...formik.getFieldProps("lastName")}
                        error={
                          formik.touched.lastName && formik.errors.lastName
                        }
                        helperText={
                          formik.touched.lastName && formik.errors.lastName
                        }
                      />
                    </Grid> */}
                      <Grid
    item
    xs={12}
    sm={6}
    md={4}
    sx={{ backgroundColor: 'transparent' }}
  >
    <Box
      sx={{
        width: { xs: '100%', sm: 300 },
        height: { xs: 250, sm: 400 },
        mt: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        mx: 'auto',
      }}
    >
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />
      ) : !!profileImage && !isUploading ? (
        <img
          src={profileImage}
          alt="Fetched Image"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />
      ) : isUploading ? (
        <Typography>Uploading your photo...</Typography>
      ) : !failedProf ? (
        <Typography>Loading your profile photo...</Typography>
      ) : (
        <Button onClick={getProfilePhoto} startIcon={<Refresh />}>
          Try Again
        </Button>
      )}
    </Box>

    <Box
      sx={{
        display: 'flex',
        gap: 1,
        mt: 2,
        flexWrap: 'wrap',
        justifyContent: { xs: 'center', sm: 'flex-start' },
      }}
    >
      {!webCam && (
        <Button
          variant="contained"
          component="label"
          startIcon={<FileUpload />}
        >
          Upload Photo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </Button>
      )}

      <Button
        startIcon={webCam ? <Close /> : <PhotoCamera />}
        variant={webCam ? 'outlined' : 'contained'}
        color={webCam ? 'error' : 'info'}
        onClick={() => setWebCam(!webCam)}
      >
        {webCam ? 'Close' : 'Capture Now'}
      </Button>
    </Box>

    {webCam && <MockWebcamCapture setPhoto={setPhotograph} />}

    {selectedFile && (
      <Typography variant="body1" sx={{ mt: 1 }}>
        Selected File: {selectedFile.name}
      </Typography>
    )}
  </Grid>

  {/* First Name Field */}
  <Grid item xs={12} sm={6} md={4}>
    <TextField
      name="firstName"
      label="First Name"
      fullWidth
      disabled
      sx={{ backgroundColor: 'white', borderRadius: 2 }}
      required
      {...formik.getFieldProps("firstName")}
      error={formik.touched.firstName && formik.errors.firstName}
      helperText={formik.touched.firstName && formik.errors.firstName}
    />
  </Grid>

  {/* Last Name Field */}
  <Grid item xs={12} sm={6} md={4}>
    <TextField
      name="lastName"
      label="Last Name"
      fullWidth
      required
      disabled
      sx={{ backgroundColor: 'white', borderRadius: 2 }}
      {...formik.getFieldProps("lastName")}
      error={formik.touched.lastName && formik.errors.lastName}
      helperText={formik.touched.lastName && formik.errors.lastName}
    />
  </Grid>
                    <Grid item xs={4}>
                      <FormControl
                        fullWidth
                        required
                                        
                        disabled
                        error={formik.touched.gender && formik.errors.gender}
                      >
                        <InputLabel>Gender</InputLabel>
                        <Select
                          name="gender"
                          label="Gender"
                          value={formik.values.gender}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                        {formik.touched.gender && formik.errors.gender && (
                          <Typography variant="body2" color="error">
                            {formik.errors.gender}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid> 

                   { /*} <Grid item xs={4}>
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
                                        
                        disabled
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                                        
                        disabled
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                                        
                        disabled
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
                                        
                        disabled
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
                                        
                        disabled
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
                                        
                        disabled
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
                                        
                        disabled
                        sx={{ backgroundColor: "white", bForderRadius: 2 }}
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
                        <InputLabel>ID Type</InputLabel>
                        <Select
                          name="govtIdType"
                          label="ID Type"
                          autoComplete="off"
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
                        label="Id Number"
                        autoComplete="off"
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

                          <MenuItem value="Service Provider">
                            Service Provider
                          </MenuItem>
                          <MenuItem value="Worker">Worker</MenuItem>
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
                        autoComplete="off"
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                        autoComplete="off"
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                    <Grid item xs={4}>
                      <TextField
                        type="email"
                        name="officeemail"
                        label=" Official Email"
                        autoComplete="off"
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
                    </Grid>
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
                        autoComplete="off"
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                        autoComplete="off"
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        type="datetime-local"
                        required
                        value={formik.values.arrivalDateTime}
                        onChange={(event) =>{
                         console.log('date time', event.target.value, 'departure',formik.values.departureDateTime )
                          if(formik.values.departureDateTime != "null" && !!(formik.values.departureDateTime) ){
                            if(((new Date(event.target.value)).getTime() < (new Date(formik.values.departureDateTime)).getTime()) ){
                              
                              formik.setFieldValue(
                                "arrivalDateTime",
                                event.target.value
                              )
                            }else{
                                setState({ severity: 'warning', message: 'Date cannot be less then To Date', open: true })
                                console.log('target value',event.target.value,'departure data',formik.values.departureDateTime)
                                
                                formik.setFieldValue(
                                  "arrivalDateTime",
                                 "null"
                                );
                                formik.setFieldValue(
                                  "departureDateTime",
                                 "null"
                                )
                            }
                        }else {
                          formik.setFieldValue(
                            "arrivalDateTime",
                            event.target.value
                          )
                        }
                        
                        
                        }}
                        error={
                          formik.touched.arrivalDateTime &&
                          Boolean(formik.errors.arrivalDateTime)
                        }
                        helperText={
                          formik.touched.arrivalDateTime && formik.errors.arrivalDateTime
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
                        name="departureDateTime"
                        label="Departure Date and Time"
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        type="datetime-local"
                        required
                        value={formik.values.departureDateTime}
                        onChange={(event) =>
                        {
                          if(formik.values.arrivalDateTime != "null" && !!(formik.values.arrivalDateTime)){
                            if((new Date(event.target.value)).getTime() > (new Date(formik.values.arrivalDateTime)).getTime() ){
                              formik.setFieldValue(
                                "departureDateTime",
                                event.target.value
                              )
                            }else{
                                setState({ severity: 'warning', message: 'Date cannot be more then To Date', open: true });
                                formik.setFieldValue(
                                  "arrivalDateTime",
                                 "null"
                                );
                                formik.setFieldValue(
                                  "departureDateTime",
                                 "null"
                                )
                                
                            }
                        }else {
                          formik.setFieldValue(
                            "departureDateTime",
                            event.target.value
                          )
                        }
                         
                      
                        }
                      }
                        error={
                          formik.touched.departureDateTime &&
                          Boolean(formik.errors.departureDateTime)
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
                        // Set the minimum date to disable past dates
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
                              sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                              sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                                    <TableCell>Action</TableCell>
                                    {/* Add other Local Conveyance field headers here */}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {travel.map((entry, index) => {
                                    console.log("entry", entry);
                                    return (
                                      <TableRow key={index}>
                                    <TableCell>
                                        {new Date(entry.pickupDateTime).toLocaleString()}
                                      </TableCell>
                                      <TableCell>
                                        {entry.pickupLocation}
                                      </TableCell>

                                      <TableCell>
                                        {new Date(entry.dropoffDateTime).toLocaleString()}
                                      </TableCell>
                                      <TableCell>
                                        {entry.dropoffLocation}
                                      </TableCell>
                                        <TableCell>
                                          <Button startIcon={<Delete />} onClick={() => {
                                            setTravel(travel.filter((entry, i) => {
                                              if (index == i) {
                                                return false
                                              }
                                              return true
                                            }))
                                          }}>
                                            Remove
                                          </Button>
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
                                  autoComplete="off"
                                  fullWidth
                                  sx={{ backgroundColor: 'white', borderRadius: 2 }}
                                  type="datetime-local"
                                  required
                                  value={
                                    formik.values.localConveyanceEntries
                                      .pickupDateTime
                                  }
                                  onChange={(event) => {
                                    console.log('fomik.localConveyanceEntries', formik.values.localConveyanceEntries)
                                    formik.setFieldValue(
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
                                  inputProps={{ min: minDate }}
                                />
                              </Grid>

                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.pickupLocation`}
                                  label="Pickup Location"
                                  autoComplete="off"
                                  fullWidth
                                  required
                                  sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                                  autoComplete="off"
                                  fullWidth
                                  sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                                  inputProps={{ min: minDate }}
                                />
                              </Grid>

                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.dropoffLocation`}
                                  label="Dropoff Location"
                                  autoComplete="off"
                                  fullWidth
                                  sx={{ backgroundColor: 'white', borderRadius: 2 }}
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

                            {/* <Button
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
                                    { ...formik.values.localConveyanceEntries,pickupDateTime : formik.values.localConveyanceEntries.pickupDateTime+':00.000+00:00',dropoffDateTime :   
                                      formik.values.localConveyanceEntries.dropoffDateTime+':00.000+00:00',},
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
                            </Button> */}
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

                     <Grid container spacing={2} sx={{ py: 2 }}>
                     <Grid item xs={6}>
                       <TextField
                         name={`localConveyanceEntries.pickupDateTime`}
                         label="Pickup Date and Time"
                         autoComplete="off"
                         fullWidth
                         sx={{ backgroundColor: 'white', borderRadius: 2 }}
                         type="datetime-local"
                         required
                         value={
                           formik.values.localConveyanceEntries
                             .pickupDateTime
                         }
                         onChange={(event) => {
                           console.log('fomik.localConveyanceEntries', formik.values.localConveyanceEntries)
                           formik.setFieldValue(
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
                         inputProps={{ min: minDate }}
                       />
                     </Grid>

                     <Grid item xs={6}>
                       <TextField
                         name={`localConveyanceEntries.pickupLocation`}
                         label="Pickup Location"
                         autoComplete="off"
                         fullWidth
                         required
                         sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                         autoComplete="off"
                         fullWidth
                         sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                         inputProps={{ min: minDate }}
                       />
                     </Grid>

                     <Grid item xs={6}>
                       <TextField
                         name={`localConveyanceEntries.dropoffLocation`}
                         label="Dropoff Location"
                         autoComplete="off"
                         fullWidth
                         sx={{ backgroundColor: 'white', borderRadius: 2 }}
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



                      )}
                    </Grid>
                  </Grid>
                  <hr />
                  <Stack direction={'row'} spacing={2}>
                    {pnr == null && <Button
                      // type="submit"
                      startIcon={<EditNoteIcon />}
                      onClick={handleInitialDraftClick}
                      variant="contained"
                      color="primary"
                    >
                      Save as Intial Draft
                    </Button>}
                    {pnr == null && <Button
                      // type="submit"
                      sx={{ backgroundColor: 'success.main' }}
                      onClick={handleRegisterClick}
                      variant="contained"
                      color="primary"

                      startIcon={<DoneAllOutlined />}
                    >
                      Register Individual Visit
                    </Button>}
                  </Stack>
                  <Stack direction={'row'} spacing={2}>
                    {pnr != null && <Button
                      // type="submit"
                      startIcon={<EditNoteIcon />}
                      onClick={handleDraftClick}
                      variant="contained"
                      color="primary"
                    >
                      Save as Draft
                    </Button>}
                    {pnr != null && < Button
                      // type="submit"
                      sx={{ backgroundColor: 'success.main' }}
                      startIcon={<DoneAllOutlined />}
                      onClick={() => {
                        setSOpen((prev) => {
                          return { ...prev, open: true }
                        })
                      }}
                      variant="contained"
                      color="primary"
                    >
                      Submit for Approval
                    </Button>}

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
<InputLabel>Upload Photo</InputLabel>
{(!!profileImage) && !isUploading ? (
          <Grid container justifyContent="center" sx={{ mt: 2 }}>
            <img
              src={profileImage}
              alt="Fetched Image"
              style={styles.imagePreview}
            />
          </Grid>
        ) : isUploading ? (
          <Typography>Your uploaded photo</Typography>
        ):(
          !failedProf ? <Typography>Loading your profile photo...</Typography> : <Button onClick={()=>{
   getProfilePhoto()
          }} startIcon={<Refresh/> }>Try Again</Button>
        )}
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
                      disabled
                        name="firstName"
                        label="First Name"
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                        disabled
                        required
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                        disabled
                        error={formik.touched.gender && formik.errors.gender}
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                      >
                        <InputLabel>Gender</InputLabel>
                        <Select
                          name="gender"
                          value={formik.values.gender}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        >
                          <MenuItem value="Male">Male</MenuItem>
                          <MenuItem value="Female">Female</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
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
                      disabled
                        name="contact"
                        label="Contact"
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                      disabled
                        type="email"
                        name="email"
                        label="Email"
                        fullWidth
                        required
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        {...formik.getFieldProps("email")}
                        error={formik.touched.email && formik.errors.email}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                      disabled
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
                      disabled
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
                      disabled
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
                      disabled
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
                      disabled
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
                        <InputLabel> ID Type</InputLabel>
                        <Select
                          name="govtIdType"
                          label=" ID Type"
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
                        label="Id Number"
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

                          <MenuItem value="Service Provider">
                            Service Provider
                          </MenuItem>
                          <MenuItem value="Worker">Worker</MenuItem>
                        </Select>
                        {formik.touched.visitorType &&
                          formik.errors.visitorType && (
                            <Typography variant="body2" color="error">
                              {formik.errors.visitorType}
                            </Typography>
                          )}
                      </FormControl>
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
                        autoComplete="off"
                        fullWidth
                        required
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                        autoComplete="off"
                        fullWidth
                        required
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        {...formik.getFieldProps("deptName")}
                        error={
                          formik.touched.deptName && formik.errors.deptName
                        }
                        helperText={
                          formik.touched.deptName && formik.errors.deptName
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
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
         autoComplete="off"
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
</Grid>
                    <Grid item xs={4}>
                      <TextField
                        name="phoneNumber"
                        label="Phone Number"
                        autoComplete="off"
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                        autoComplete="off"
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        {...formik.getFieldProps("purpose")}
                        error={formik.touched.purpose && formik.errors.purpose}
                        helperText={
                          formik.touched.purpose && formik.errors.purpose
                        }
                      />
                    </Grid>
                    
                  
                    <Grid item xs={6}>
                      <TextField
                        name="arrivalDateTime"
                        label="Arrival Date and Time"
                        fullWidth
                        type="datetime-local" // Use datetime-local type to combine date and time
                        required
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        value={formik.values.arrivalDateTime}
                        onChange={(event) =>{
                          if(formik.values.departureDateTime != "null"){
                            if((new Date(event.target.value)).getTime() < (new Date(formik.values.departureDateTime)).getTime() ){
                              formik.setFieldValue(
                                "arrivalDateTime",
                                event.target.value
                              )
                            }else{
                              setState({ severity: 'warning', message: 'Date cannot be less then To Date', open: true })
                              formik.setFieldValue(
                                "arrivalDateTime",
                               "null"
                              );
                              formik.setFieldValue(
                                "departureDateTime",
                               "null"
                              )
                          }
                        }else {
                          formik.setFieldValue(
                            "arrivalDateTime",
                            event.target.value
                          )
                        }
                        
                        }}
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
                        inputProps={{ min: minDate }}
                      />
                    </Grid>
                  
                    <Grid item xs={6}>
                      <TextField
                        name="departureDateTime"
                        label="Departure Date and Time"
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        type="datetime-local" // Use datetime-local type to combine date and time
                        required
                        value={formik.values.departureDateTime}
                        onChange={(event) =>
                         { 
                          if(formik.values.arrivalDateTime != "null"){
                            if((new Date(event.target.value)).getTime() > (new Date(formik.values.arrivalDateTime)).getTime() ){
                              formik.setFieldValue(
                                "departureDateTime",
                                event.target.value
                              )
                            }else{
                              setState({ severity: 'warning', message: 'Date cannot be less then To Date', open: true })
                              formik.setFieldValue(
                                "arrivalDateTime",
                               "null"
                              );
                              formik.setFieldValue(
                                "departureDateTime",
                               "null"
                              )
                          }
                        }else {
                          formik.setFieldValue(
                            "departureDateTime",
                            event.target.value
                          )
                        }
                          
                        }
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
                              sx={{ backgroundColor: 'white', borderRadius: 2 }}
                              type="datetime-local" // Use datetime-local type to combine date and time
                              required
                              value={formik.values.accFromDate}
                              onChange={(event) =>
                                formik.setFieldValue(
                                  "accFromDate",
                                  event.target.value
                                )}
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
                              sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                            <TableContainer component={Paper} sx={{ my: 2 }}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Pickup Date and Time</TableCell>
                                    <TableCell>Pickup Location</TableCell>
                                    <TableCell>Drop Date and Time</TableCell>
                                    <TableCell>Drop Location</TableCell>
                                    <TableCell>Action</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {travel.map((entry, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        {new Date(entry.pickupDateTime).toLocaleString()}
                                      </TableCell>
                                      <TableCell>
                                        {entry.pickupLocation}
                                      </TableCell>

                                      <TableCell>
                                        {new Date(entry.dropoffDateTime).toLocaleString()}
                                      </TableCell>
                                      <TableCell>
                                        {entry.dropoffLocation}
                                      </TableCell>
                                      {/* Add other Local Conveyance fields here */}
                                      <TableCell>
                                        <Button startIcon={<Delete />} onClick={() => {
                                          setTravel(travel.filter((entry, i) => {
                                            if (index == i) {
                                              return false
                                            }
                                            return true
                                          }))
                                        }}>
                                          Remove
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                            <hr />
                            {/* Additional fields for Local Conveyance in a tabular format */}

                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.pickupDateTime`}
                                  label="Pickup Date and Time"
                                  fullWidth
                                  sx={{ backgroundColor: 'white', borderRadius: 2 }}
                                  type="datetime-local"
                                  required
                                  value={
                                    formik.values.localConveyanceEntries
                                      .pickupDateTime
                                  }
                                  onChange={(event) => {

                                    formik.setFieldValue(
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
                                  inputProps={{ min: minDate }}
                                />
                              </Grid>

                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.pickupLocation`}
                                  label="Pickup Location"
                                  fullWidth
                                  sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                                  sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                                  inputProps={{ min: minDate }}
                                />
                              </Grid>

                              <Grid item xs={6}>
                                <TextField
                                  name={`localConveyanceEntries.dropoffLocation`}
                                  label="Dropoff Location"
                                  fullWidth
                                  sx={{ backgroundColor: 'white', borderRadius: 2 }}
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

                            {/* <Button
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
                                    { ...formik.values.localConveyanceEntries,pickupDateTime : formik.values.localConveyanceEntries.pickupDateTime+':00.000+00:00',dropoffDateTime :   
                                      formik.values.localConveyanceEntries.dropoffDateTime+':00.000+00:00',},
                                   
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
                            </Button> */}

                          </div>
                        )}

                      {formik.values.isTraveling && formik.values.isStaying && (
                        <Grid container spacing={2} >
                          <Grid item xs={6}>
                            <TextField
                              name="pickupDateTime"
                              label="Pickup Date and Time"
                              fullWidth
                              sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                            <FormControl
                              fullWidth
                              required
                              sx={{ backgroundColor: 'white', borderRadius: 2 }}
                              error={
                                formik.touched.pickupLocation &&
                                formik.errors.pickupLocation
                              }
                            >
                              <InputLabel>PickUp Location</InputLabel>
                              {/* <Select
                                name="pickupLocation"
                                value={formik.values.pickupLocation}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                              >
                                <MenuItem value="airport">Airport</MenuItem>
                                <MenuItem value="station">Station</MenuItem>
                              </Select> */}
                              <TextField
                                name="pickupLocation"
                                label="Pickup Location"
                                fullWidth
                                sx={{ backgroundColor: 'white', borderRadius: 2 }}
                                type="text" // Use datetime-local type to combine date and time
                                required
                                value={formik.values.pickupLocation}
                                onChange={(event) => {
                                  console.log('pickupLocation')
                                  formik.setFieldValue(
                                    "pickupLocation",
                                    event.target.value
                                  )
                                }

                                }
                                error={
                                  formik.touched.pickupLocation &&
                                  Boolean(formik.errors.pickupLocation)
                                }
                                helperText={
                                  formik.touched.pickupLocation &&
                                  formik.errors.pickupLocation
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
                              {formik.touched.pickupLocation &&
                                formik.errors.pickupLocation && (
                                  <Typography variant="body2" color="error">
                                    {formik.errors.pickupLocation}
                                  </Typography>
                                )}
                            </FormControl>
                          </Grid>

                          <Grid item xs={6}>
                            <TextField
                              name="dropoffDateTime"
                              label="Drop off Date and Time"
                              fullWidth
                              sx={{ backgroundColor: 'white', borderRadius: 2 }}
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
                            <FormControl
                              fullWidth
                              required
                              error={
                                formik.touched.dropoffLocation &&
                                formik.errors.dropoffLocation
                              }
                            >
                              <InputLabel>Drop Location</InputLabel>
                              {/* <Select
                                name="dropoffLocation"
                                value={formik.values.dropoffLocation}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                              >
                                <MenuItem value="cdac">CDAC</MenuItem>
                              </Select> */}
                              <TextField
                                name="dropoffLocation"
                                label="Drop Off Location"
                                fullWidth
                                sx={{ backgroundColor: 'white', borderRadius: 2 }}
                                type="text" // Use datetime-local type to combine date and time
                                required
                                value={formik.values.dropoffLocation}
                                onChange={(event) => {
                                  console.log('dropoffLocation')
                                  formik.setFieldValue(
                                    "dropoffLocation",
                                    event.target.value
                                  )
                                }

                                }
                                error={
                                  formik.touched.dropoffLocation &&
                                  Boolean(formik.errors.dropoffLocation)
                                }
                                helperText={
                                  formik.touched.dropoffLocation &&
                                  formik.errors.dropoffLocation
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
                              {formik.touched.dropoffLocation &&
                                formik.errors.dropoffLocation && (
                                  <Typography variant="body2" color="error">
                                    {formik.errors.dropoffLocation}
                                  </Typography>
                                )}
                            </FormControl>
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
                  <Stack direction={'row'} spacing={2} alignItem={'center'} m={2}>
                    
                    <Grid container  style={{ marginBottom: '20px' }}>
                      <Stack>
                      <Typography variant='h6'>Download Sample Excel and fill it</Typography>
                      <Button
                        variant="contained" color="info" onClick={sampleExcel}>
                        Download
                      </Button>
                      </Stack>
                    
                    </Grid>
                    <Grid container justifyContent="flex-end" style={{ marginBottom: '20px' }}>
                      <Button
                        variant="contained" color="primary" onClick={exportToExcel}>
                        Export to Excel
                      </Button>
                    </Grid>
                  </Stack>
                  <div
                    {...getRootProps()}
                    style={{
                      marginBottom: "20px",
                      padding: "20px",
                      border: "2px dashed #ccc",
                      textAlign: "center",
                    }}
                  >
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

                  <Typography variant="body1" display={'inline-block'}>Upload Excel file (.xlsx, .xls)</Typography>
                  <Button variant="outlined" startIcon={<ClearAllIcon />} onClick={() => {
                    setJsonData({})
                  }}>Clear Table</Button>
                  <ExcelDataTable jsonData={jsonData1} setData1={setJsonData} />
                  <Stack direction={'row'} spacing={2}>
                    {pnr == null && <Button
                      // type="submit"
                      startIcon={<EditNoteIcon />}
                      onClick={handleInitialDraftClick}
                      variant="contained"
                      color="primary"
                    >
                      Save as Intial Draft
                    </Button>}
                    {pnr == null && <Button
                      // type="submit" 
                      onClick={handleRegisterClick}
                      sx={{ backgroundColor: 'success.main' }}
                      variant="contained" color="primary">
                      Register
                    </Button>}
                    {pnr != null && <Button
                      // type="submit"
                      startIcon={<EditNoteIcon />}
                      onClick={handleDraftClick}
                      variant="contained"
                      color="primary"
                    >
                      Save as Draft
                    </Button>}
                    {pnr != null && < Button
                      // type="submit"
                      sx={{ backgroundColor: 'success.main' }}
                      startIcon={<DoneAllOutlined />}
                      onClick={() => {
                        setSOpen((prev) => {
                          return { ...prev, open: true }
                        })
                      }}
                      variant="contained"
                      color="primary"
                    >
                      Submit for Approval
                    </Button>}
                  </Stack>

                  {/* Snackbar for feedback confirmation */}

                </form>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box >
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

const styles = {
  modalBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 3,
    boxShadow: 24,
  },
  imagePreview: {
    width: 300,
    height: 400,
    objectFit: 'contain',
    borderRadius: '8px',
  }
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
