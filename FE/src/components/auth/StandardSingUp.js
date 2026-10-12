import React, { useEffect, useState } from 'react'
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, LinearProgress, Link, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from '@mui/material';
import { Container } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import MuiAlert from "@mui/material/Alert";
import axios from 'src/api/axios';
import { normalaxios } from 'src/api/axios';
import { red } from '@mui/material/colors';
import { FileUpload } from '@mui/icons-material';
import { encryptPassword } from 'src/utils/encryptPassword';
import AlphaNumericCaptcha from "src/components/AlphaNumericCaptcha";
import CryptoJS from "crypto-js";
const RegisterSchema = Yup.object().shape({
    firstName: Yup.string().required('First Name is required'),
    lastName: Yup.string().required('Last Name is required'),
    gender: Yup.string().required('Gender is required'),
    // DOB: Yup.string().required('Date of Birth is required'),
    email: Yup.string().email('Invalid email address').required('Email is required')
    .test('not-cdac', 'Email cannot be from @cdac.in', value => {
        // Check if the email ends with @amazon.in
        return !value || !value.endsWith('@cdac.in');
      }),
    mobileNo: Yup.string().matches(/^[0-9]*$/, 'Phone number must contain only digits')
        .matches(/^\d{10}$/, 'Phone number must contain 10 digits')
        .required('Phone number is required'),
    address: Yup.string().required('Address is required'),
    pincode: Yup.string().required('Pincode is required'),
    state: Yup.string().required('State is required'),
    district: Yup.string().required('District is required'),
    referenceEmail: Yup.string().required('Please mention the Employee Email who referred you').email('should be an email').matches('@cdac.in', 'Must be a CDAC employee Mail'),
    organisation: Yup.string().required('Please metion your Organisation, type n/a if not applicable'),
    password: Yup.string()
    .required('Please enter a password')
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
});
const SECRET_KEY = process.env.NEXT_PUBLIC_SecretKey;
function StandardSignUp() {
    const router = useRouter();
    const auth = useAuth();
    const theme = useTheme();
    const [Ropen, setRopen] = useState(false);
    const [username, setUsername] = useState("");
    const [gotUser, setGotUser] = useState(false);
    const [circ, setCirc] = useState(false);
    const [sCirc, setSCirc] = useState(false)
    const [snakc, setSnakc] = useState(false);
    const [state, setState] = useState({})
    const vertical = "top";
    const horizontal = "center";
    const [uError, setUerror] = useState(false);
    const [open, setOpen] = useState(false);
      const [photo,setPhoto] = useState()
    const [webCam,setWebCam] = useState(false)
     const [preview, setPreview] = useState(null);
       const [isUploading,setIsUploading] = useState(false)
       const [selectedFile, setSelectedFile] = useState(null);
     
    const handleCloseSnackbar = () => {
        setState({ ...state, open: false })

    };
    const handleRClose = () => {
        setRopen(false);
    };

    const handleSClose = () => {
        setSnakc(false);
    };

    const [captchaOk, setCaptchaOk] = useState(false);
    const [captchaKey, setCaptchaKey] = useState(0);

    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            // DOB: '',
            gender: '',
            email: '',
            referenceEmail: '',
            mobileNo: '',
            address: '',
            pincode: '',
            state: '',
            district: '',
            organisation: '',
            password: ''
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values, helpers) => {
            let result;
          
            // 🧩 1. Block submit if captcha not solved
            if (!captchaOk) {
              setCaptchaKey(k => k + 1);  // 🔄 FORCE captcha reload
              setState({
                open: true,
                message: "Please verify captcha",
                severity: "error",
              });
              return;
            }
          
            setCirc(true);
          
            try {
              console.log("Values Received are ", values);
          
              // 🔐 Encrypt password before sending to backend
              const encryptedPassword = CryptoJS.AES.encrypt(
                values.password,
                SECRET_KEY
              ).toString();
          
              const secureValues = {
                ...values,
                password: encryptedPassword,
              };
          
              result = await auth.signUp(secureValues, selectedFile);
          
              if (result.status === 200) {
                setUerror(result.data.data);
                setGotUser(true);
                setSnakc(true);
                setRopen(true);
                setOpen(true);
                formik.resetForm();
          
                setState({
                  severity: 'success',
                  message: 'User Created Successfully',
                  open: true,
                });
          
                // 🧼 Reset captcha for next signup
                setCaptchaOk(false);
                setCaptchaKey(k => k + 1);
              } 
              else {
                const errorMsg =
                  result?.response?.data?.errors?.[0] || "Registration failed";
          
                setUerror(errorMsg);
          
                // 🔄 Reset captcha on failure
                setCaptchaOk(false);
                setCaptchaKey(k => k + 1);
          
                setGotUser(true);
                setSnakc(true);
                setOpen(true);
          
                // setState({
                //   severity: 'error',
                //   message: 'Failed to create user',
                //   open: true,
                // });
                setTimeout(() => {
                    setUerror(false);
                }, 3000);
            
                helpers.setErrors({ submit: errorMsg });
              }
            } 
            catch (err) {
              console.log('error', err);
          
              // 🔄 Always reset captcha on error
              setCaptchaOk(false);
              setCaptchaKey(k => k + 1);
          
              helpers.setStatus({ success: false });
              helpers.setSubmitting(false);
          
              setUerror(err);
              setOpen(true);
          
              setState({
                severity: 'error',
                message: 'Failed to create user',
                open: true,
              });
            } 
            finally {
              setCirc(false);
            }
          },
    });
    useEffect(() => {
        const getStateAndCity = async (pincode) => {
            try {

                const response = await normalaxios.get(
                    `https://api.postalpincode.in/pincode/${pincode}`
                );

                if (response.data && response.data.length > 0) {
                    const data = response.data[0];
                    setState({ severity: 'success', message: 'Fetched State and District', open: true })
                    if (data.Status === "Success") {
                        const location = data.PostOffice[0];
                        const state = location.State;
                        const city = location.District;
                        console.log(`State: ${state}, District: ${city}`);
                        formik.setFieldValue("state", state);
                        formik.setFieldValue("district", city);
                        setState({ severity: 'success', message: 'Fetched State and District', open: true })
                        setSCirc(false)
                    } else {
                        console.log("Invalid pincode");
                        formik.setFieldError("pincode", "Invalid pincode");
                        setState({ severity: 'error', message: 'Invalid Pincode', open: true })
                        setSCirc(false)
                    }
                } else {
                    console.log("No data found for the given pincode");
                    setState({ severity: 'error', message: 'No data found for the given pincode', open: true })
                    setSCirc(false)
                    formik.setFieldError(
                        "pincode",
                        "No data found for the given pincode"
                    );
                }
            } catch (error) {
                console.error("Error fetching data:", error.message);
                formik.setFieldError("pincode", "error while fetching data");
                setState({ severity: 'error', message: 'error while fetching data', open: true })

            }
        };
        console.log("trigger");
        if (formik.values.pincode.length == 6
            // && (
            // formik.values.state != '' || formik.values.district != '')
        ) {
            getStateAndCity(formik.values.pincode);
        } else {
            formik.setFieldValue("state", "");
            formik.setFieldValue("district", "");
        }
    }, [formik.values.pincode]);
    const handleFileChange = (event) => {
        setIsUploading(true);
        const file = event.target.files[0];
    
        if (file) {
            // Check if the file is an image
            const allowedTypes = ["image/jpeg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                setState({ severity: 'error', message: 'Please upload a valid image file (JPEG, PNG).', open: true })
                
                setIsUploading(false);
               
                return;
            }
    
            setSelectedFile(file);
    
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result); // Set the image data URL for preview
            };
            reader.readAsDataURL(file);
        }
    };
     const handleRemovePhoto = ()=> {
        setSelectedFile(null);
        setPreview(null)
     }
    return (
        <>
            {/* <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                open={snakc}
                onClose={handleSClose}
                key={"top" + "center"}
                autoHideDuration={6000}
            >
                <Alert
                    severity="success"
                    sx={{ width: "100%", backgroundColor: "success.dark", color: "white", height: "4em" }}
                >
                    <Typography variant="h6">The reset password link is sent to your email</Typography>
                </Alert>
            </Snackbar> */}
            {/* <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                open={open}
                onClose={handleSClose}
                key={"top" + "center" + "2"}
                autoHideDuration={6000}
            >
                <Alert
                    severity="error"
                    sx={{ width: "100%", backgroundColor: "error.dark", color: "white", height: "4em" }}
                >
                    <Typography variant="h6">{uError}</Typography>
                </Alert>
            </Snackbar> */}
            <Snackbar
                open={state.open}
                autoHideDuration={2000} // Adjust the duration as needed
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

            {
                <Dialog
                    open={Ropen}
                    keepMounted
                    onClose={handleRClose}
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle>{"Registration Done"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            Please check your Email for verification
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>

                        <Button onClick={handleRClose}>Okay</Button>
                    </DialogActions>
                </Dialog>
            }

            <Head>
                <title>Sign Up</title>
            </Head>

            <Box
                sx={{
                    flex: '1 1 auto',
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    px: 3
                }}
            >
                <Grid container justifyContent="center">
                   
                    <Grid item xs={8} >
                        <form onSubmit={formik.handleSubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                {!webCam && (
  <Button
    variant="contained"
    component="label"
    sx={{ mb: 2 }}
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
{preview && (
  <div style={{ position: "relative", marginTop: "20px", display: "inline-block" }}>
    {/* Image preview */}
    <img
      src={preview}
      alt="Preview"
      style={{ maxWidth: "300px", maxHeight: "300px", borderRadius: "8px" }}
    />

    {/* Remove button */}
    <button
      onClick={handleRemovePhoto}
      style={{
        position: "absolute",
        top: "5px",
        right: "5px",
        background: "rgba(255, 0, 0, 0.8)",
        color: "white",
        border: "none",
        borderRadius: "50%",
        width: "25px",
        height: "25px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
      }}
    >
      X
    </button>
  </div>
)}
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        name="firstName"
                                        label="First Name"
                                        autoComplete="off"
                                        fullWidth
                                        required
                                        {...formik.getFieldProps('firstName')}
                                        error={formik.touched.firstName && formik.errors.firstName}
                                        helperText={formik.touched.firstName && formik.errors.firstName}
                                    />

                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        name="lastName"
                                        label="Last Name"
                                        autoComplete="off"
                                        fullWidth
                                        required
                                        {...formik.getFieldProps('lastName')}
                                        error={formik.touched.lastName && formik.errors.lastName}
                                        helperText={formik.touched.lastName && formik.errors.lastName}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormControl fullWidth required error={formik.touched.gender && formik.errors.gender}>
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
                                        {formik.touched.gender && formik.errors.gender && <Typography variant="body2" color="error">{formik.errors.gender}</Typography>}
                                    </FormControl>
                                </Grid>
                                {/* <Grid item xs={6}>
                                    <TextField
                                        type="date"
                                        name="DOB"
                                        label="Date Of Birth"
                                        fullWidth
                                        required
                                        {...formik.getFieldProps('DOB')}
                                        error={formik.touched.DOB && formik.errors.DOB}
                                        helperText={formik.touched.DOB && formik.errors.DOB}
                                    />
                                </Grid> */}
                                <Grid item xs={12}>
                                    <TextField
                                        type="email"
                                        name="email"
                                        label="Email"
                                        autoComplete="off"
                                        fullWidth
                                        required
                                        {...formik.getFieldProps('email')}
                                        error={formik.touched.email && formik.errors.email}
                                        helperText={formik.touched.email && formik.errors.email}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        name="mobileNo"
                                        label="Mobile Number"
                                        autoComplete="off"
                                        fullWidth
                                        required
                                        {...formik.getFieldProps('mobileNo')}
                                        error={formik.touched.mobileNo && formik.errors.mobileNo}
                                        helperText={formik.touched.mobileNo && formik.errors.mobileNo}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="address"
                                        label="Address"
                                        autoComplete="off"
                                        fullWidth
                                        required
                                        {...formik.getFieldProps('address')}
                                        error={formik.touched.address && formik.errors.address}
                                        helperText={formik.touched.address && formik.errors.address}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        name="pincode"
                                        label="Pincode"
                                        autoComplete="off"
                                        fullWidth
                                        required
                                        {...formik.getFieldProps('pincode')}
                                        error={formik.touched.pincode && formik.errors.pincode}
                                        helperText={formik.touched.pincode && formik.errors.pincode}
                                        onChange={(e) => {
                                            const newValue = e.target.value.replace(/\D/g, "").slice(0, 6);
  
                                            formik.setFieldValue('pincode',newValue);
                                            setSCirc(true)
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField

                                        name="state"
                                        label="State"
                                        autoComplete="off"
                                        fullWidth
                                        required
                                        {...formik.getFieldProps('state')}
                                        error={formik.touched.state && formik.errors.state}
                                        helperText={formik.touched.state && formik.errors.state}
                                    />
                                    {(sCirc && formik.values.pincode.length != 0) && <LinearProgress />}
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField

                                        name="district"
                                        label="District"
                                        autoComplete="off"
                                        fullWidth
                                        required
                                        {...formik.getFieldProps('district')}
                                        error={formik.touched.district && formik.errors.district}
                                        helperText={formik.touched.district && formik.errors.district}
                                    />
                                    {(sCirc && formik.values.pincode.length != 0) && <LinearProgress />}
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="organisation"
                                        label="Your Organisation"
                                        autoComplete="off"
                                        fullWidth
                                        required
                                        {...formik.getFieldProps('organisation')}
                                        error={formik.touched.organisation && formik.errors.organisation}
                                        helperText={formik.touched.organisation && formik.errors.organisation}
                                    />

                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        name="password"
                                        label="Password"
                                        fullWidth
                                        required
                                        type='password'
                                        autoComplete="new-password" // prevents browser autofill leaks
                                        {...formik.getFieldProps('password')}
                                        error={formik.touched.password && formik.errors.password}
                                        helperText={formik.touched.password && formik.errors.password}
                                    />

                                </Grid>
                                <Grid item xs={12} justifyContent="center">
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            cursor: 'unset',
                                            mt: 2,
                                            mx: 20,
                                            borderColor: `${theme.palette.grey[50]} !important`,
                                            color: `${theme.palette.grey[900]}!important`,
                                            fontWeight: 500,
                                            borderRadius: 5,
                                            backgroundColor: '#aaaa',


                                        }}
                                        disableRipple
                                        disabled
                                    >
                                        Details of Referred Employee
                                    </Button>
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        name="referenceEmail"
                                        label="Employee Email"
                                        autoComplete="off"
                                        fullWidth
                                        required
                                        type="email"
                                        {...formik.getFieldProps('referenceEmail')}
                                        error={formik.touched.referenceEmail && formik.errors.referenceEmail}
                                        helperText={formik.touched.referenceEmail && formik.errors.referenceEmail}
                                    />

                                </Grid>



                            </Grid>
                            
                               <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                <AlphaNumericCaptcha  key={captchaKey} onCaptchaSolved={setCaptchaOk} />
                                </Box>      
                                                             
                            {formik.errors.submit && (
                                <Typography
                                    color="error"
                                    sx={{ mt: 3 }}
                                    variant="body2"
                                >
                                    {formik.errors.submit}
                                </Typography>
                            )}
                            <br />
                            <Button type="submit" variant="contained" color="primary" 
                            onClick={console.log(formik.values)}
                            sx={{backgroundColor : "success.main"}}
                            >
                                Register {circ && <CircularProgress  />}
                            </Button>
                        </form>
                    </Grid>
                </Grid>

            </Box>

        </>
    );
}

export default StandardSignUp