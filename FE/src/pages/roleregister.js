import React, { useEffect, useState } from 'react'
import Head from 'next/head';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Grid, LinearProgress, Link, Snackbar, Stack, TextField, Typography, FormHelperText } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { Layout as AuthLayout } from 'src/layouts/auth/layout';
import { Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from '@mui/material';
import { Container } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import MuiAlert from "@mui/material/Alert";
import axios from 'src/api/axios';
import { normalaxios } from 'src/api/axios';
import { red } from '@mui/material/colors';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { Roles } from 'src/components/roles';
import { FileUpload } from '@mui/icons-material';
import { encryptPassword } from 'src/utils/encryptPassword';
import { LoadingButton } from "@mui/lab";

// Helper: roles that REQUIRE @cdac.in
const cdacRoleIds = [Roles.Admin, Roles.Host, Roles.Planner, Roles.SecurityGuard];

const RegisterSchema = Yup.object().shape({
  firstName: Yup.string().required('First Name is required'),
  lastName: Yup.string().required('Last Name is required'),
  gender: Yup.string().required('Gender is required'),
  DOB: Yup.string().required('Date of Birth is required'),

  mobileNo: Yup.string()
    .matches(/^[0-9]*$/, 'Phone number must contain only digits')
    .matches(/^\d{10}$/, 'Phone number must contain 10 digits')
    .required('Phone number is required'),

  address: Yup.string().required('Address is required'),
  pincode: Yup.string().required('Pincode is required'),
  state: Yup.string().required('State is required'),
  district: Yup.string().required('District is required'),

  referenceEmail: Yup.string()
    .required('Please mention the Employee Email who referred you')
    .email('Should be an email')
    .matches(/@cdac\.in$/i, 'Must be a CDAC employee Mail'), // FIX: proper regex

  organisation: Yup.string().required('Please mention your Organisation, type n/a if not applicable'),
  password: Yup.string()
  .required('Please enter a password')
  .min(8, 'Password must be at least 8 characters long')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/\d/, 'Password must contain at least one number')
  .matches(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),

  role: Yup.string().required('Role is required'),

  email: Yup.string()
  .email('Invalid email format')
  .required('Email is required')
  .when('role', {
    is: (role) => cdacRoleIds.includes(role),
    then: (schema) =>
      schema.matches(/^[A-Za-z0-9._%+-]+@cdac\.in$/i, 'Email must be @cdac.in for roles Admin,Host,Planner,SecurityGuard'),
    otherwise: (schema) => schema,
  }),


});

function Page() {
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

  const handleCloseSnackbar = () => { setState({ ...state, open: false }) };
  const handleRClose = () => { setRopen(false); };
  const handleSClose = () => { setSnakc(false); };

  const handleFileChange = (event) => {
    setIsUploading(true);
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        setState({ severity: 'error', message: 'Please upload a valid image file (JPEG, PNG).', open: true })
        setIsUploading(false);
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => { setPreview(e.target.result); };
      reader.readAsDataURL(file);
    }
  };
  const handleRemovePhoto = ()=> { setSelectedFile(null); setPreview(null) };


  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: ""
  });

  const showSnackbar = (severity, message) => {
    setSnackbar({ open: true, severity, message });
  };

  
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      DOB: '',
      gender: '',
      email: '',
      referenceEmail: '',
      mobileNo: '',
      address: '',
      pincode: '',
      state: '',
      district: '',
      organisation: '',
      password: '',
      role: '',
    },
    validationSchema: RegisterSchema,
    onSubmit: async (values, helpers) => {
      let result;
      setCirc(true);
      helpers.setErrors({});
      helpers.setStatus(null);
      setUerror(null);
      try {
        console.log("Values Received are ", values);
         // 🔐 Encrypt password before sending to backend
    const encryptedPassword = encryptPassword(
      values.password,
      process.env.NEXT_PUBLIC_IV,
      process.env.NEXT_PUBLIC_SecretKey
    );

    // Replace plain password with encrypted one
    const secureValues = {
      ...values,
      password: encryptedPassword,
    };
        result = await auth.roleSignUp(secureValues, selectedFile);
        
          setUerror(result.data.data);
          setGotUser(true);
          setSnakc(true)
          setRopen(true);
          setOpen(true)
          formik.resetForm()
          setState({ severity: 'success', message: 'User Created Successfully', open: true })
        setCirc(false);
      }  catch (err) {
        const message =
          result?.response?.data?.errors?.[0] ||
          result?.response?.data?.message ||
          'Failed to create user';
    
        helpers.setErrors({ submit: message });
        helpers.setSubmitting(false);
        // setUerror(message);
        setOpen(true);
        setState({
          severity: 'error',
          message,
          open: true
        });
      } finally {
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
            formik.setFieldError("pincode", "Invalid pincode");
            setState({ severity: 'error', message: 'Invalid Pincode', open: true })
            setSCirc(false)
          }
        } else {
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
    if (formik.values.pincode.length == 6) {
      getStateAndCity(formik.values.pincode);
    } else {
      formik.setFieldValue("state", "");
      formik.setFieldValue("district", "");
    }
  }, [formik.values.pincode]);

  // NOTE: this check remains as in your original; ensure roles in auth.user are comparable to Roles.Admin
  if (auth?.user?.roles === Roles["Admin"]) {
    return (
      <>
        <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={snakc}
          onClose={handleSClose}
          key={"top" + "center"}
          autoHideDuration={2000}
        >
          <Alert
            severity="success"
            sx={{ width: "100%", backgroundColor: "success.dark", color: "white", height: "4em" }}
          >
            <Typography variant="h6">The reset password link is sent to your email</Typography>
          </Alert>
        </Snackbar>
        {/* <Snackbar
          anchorOrigin={{ vertical, horizontal }}
          open={open}
          onClose={handleSClose}
          key={"top" + "center" + "2"}
          autoHideDuration={2000}
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
          autoHideDuration={2000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity={state.severity}>
            {state.message}
          </MuiAlert>
        </Snackbar>

        <Dialog open={Ropen} keepMounted onClose={handleRClose} aria-describedby="alert-dialog-slide-description">
          <DialogTitle>{"Registration Done"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">Please check your Email for verification</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRClose}>Okay</Button>
          </DialogActions>
        </Dialog>

        <Head>
          <title>Sign Up</title>
        </Head>

        <Box sx={{ flex: '1 1 auto', alignItems: 'center', display: 'flex', justifyContent: 'center', py: 5, px: 2 }}>
          <Grid container spacing={2} maxWidth="md" sx={{ width: '100%' }} justifyContent="center">
            <Grid item xs={12}>
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    {!webCam && (
                      <Button variant="contained" component="label" sx={{ mb: 2 }} startIcon={<FileUpload />}> 
                        Upload Photo
                        <input type="file" accept="image/*" hidden onChange={handleFileChange} />
                      </Button>
                    )}
                    {preview && (
                      <div style={{ position: "relative", marginTop: "20px", display: "inline-block" }}>
                        <img src={preview} alt="Preview" style={{ maxWidth: "300px", maxHeight: "300px", borderRadius: "8px" }} />
                        <button onClick={handleRemovePhoto} style={{ position: "absolute", top: "5px", right: "5px", background: "rgba(255, 0, 0, 0.8)", color: "white", border: "none", borderRadius: "50%", width: "25px", height: "25px", display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>X</button>
                      </div>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField name="firstName" label="First Name" autoComplete="off" fullWidth required {...formik.getFieldProps('firstName')} error={formik.touched.firstName && Boolean(formik.errors.firstName)} helperText={formik.touched.firstName && formik.errors.firstName} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField name="lastName" label="Last Name" autoComplete="off" fullWidth required {...formik.getFieldProps('lastName')} error={formik.touched.lastName && Boolean(formik.errors.lastName)} helperText={formik.touched.lastName && formik.errors.lastName} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={formik.touched.gender && Boolean(formik.errors.gender)}>
                      <InputLabel>Gender</InputLabel>
                      <Select name="gender" value={formik.values.gender} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                      {formik.touched.gender && formik.errors.gender && (
                        <Typography variant="body2" color="error">{formik.errors.gender}</Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField type="date" name="DOB" label="Date Of Birth" fullWidth required InputLabelProps={{ shrink: true }} {...formik.getFieldProps('DOB')} error={formik.touched.DOB && Boolean(formik.errors.DOB)} helperText={formik.touched.DOB && formik.errors.DOB} />
                  </Grid>

                  <Grid item xs={12}>
                  <TextField
  fullWidth
  id="email"
  name="email"
  label="Email"
   autoComplete="off"
  value={formik.values.email}
  onChange={formik.handleChange}
  onBlur={formik.handleBlur}
  error={formik.touched.email && Boolean(formik.errors.email)}
  helperText={
    (formik.touched.email && formik.errors.email) ||
    (cdacRoleIds.includes(formik.values.role) &&
      "Email must end with @cdac.in")
  }
/>

                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField name="mobileNo" label="Mobile Number" autoComplete="off" fullWidth required {...formik.getFieldProps('mobileNo')} error={formik.touched.mobileNo && Boolean(formik.errors.mobileNo)} helperText={formik.touched.mobileNo && formik.errors.mobileNo} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField name="address" label="Address" autoComplete="off" fullWidth required {...formik.getFieldProps('address')} error={formik.touched.address && Boolean(formik.errors.address)} helperText={formik.touched.address && formik.errors.address} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField name="pincode" label="Pincode" autoComplete="off" fullWidth required {...formik.getFieldProps('pincode')} error={formik.touched.pincode && Boolean(formik.errors.pincode)} helperText={formik.touched.pincode && formik.errors.pincode} onChange={(e) => { formik.setFieldValue('pincode', e.target.value); setSCirc(true); }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField name="state" label="State" fullWidth required {...formik.getFieldProps('state')} error={formik.touched.state && Boolean(formik.errors.state)} helperText={formik.touched.state && formik.errors.state} />
                    {sCirc && !!formik.values.pincode && <LinearProgress />}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField name="district" label="District" fullWidth required {...formik.getFieldProps('district')} error={formik.touched.district && Boolean(formik.errors.district)} helperText={formik.touched.district && formik.errors.district} />
                    {sCirc && !!formik.values.pincode && <LinearProgress />}
                  </Grid>

                  <Grid item xs={12}>
                    <TextField name="organisation" label="Your Organisation" autoComplete="off" fullWidth required {...formik.getFieldProps('organisation')} error={formik.touched.organisation && Boolean(formik.errors.organisation)} helperText={formik.touched.organisation && formik.errors.organisation} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField name="password" label="Password" autoComplete="off" fullWidth required type="password" {...formik.getFieldProps('password')} error={formik.touched.password && Boolean(formik.errors.password)} helperText={formik.touched.password && formik.errors.password} />
                  </Grid>

                  <Grid item xs={12}>
                    <Button variant="outlined" sx={{ cursor: 'unset', mt: 2, borderRadius: 3, backgroundColor: '#eee', color: '#333', fontWeight: 500, }} disableRipple disabled fullWidth>
                      Details of Referred Employee
                    </Button>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField name="referenceEmail" label="Employee Email" autoComplete="off" fullWidth required type="email" {...formik.getFieldProps('referenceEmail')} error={formik.touched.referenceEmail && Boolean(formik.errors.referenceEmail)} helperText={formik.touched.referenceEmail && formik.errors.referenceEmail} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={formik.touched.role && Boolean(formik.errors.role)}>
                      <InputLabel id="role-label">Roles</InputLabel>
                      <Select labelId="role-label" id="role" name="role" value={formik.values.role} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                        <MenuItem value={Roles.Admin}>Admin</MenuItem>
                        <MenuItem value={Roles.Visitor}>Visitor</MenuItem>
                        <MenuItem value={Roles.Host}>Host</MenuItem>
                        <MenuItem value={Roles.Planner}>Planner</MenuItem>
                        <MenuItem value={Roles.SecurityGuard}>Security Guard</MenuItem>
                      </Select>
                      {formik.touched.role && formik.errors.role && (
                        <FormHelperText error>{formik.errors.role}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  {/* <Grid item xs={12}>
                    <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                      Register {circ && <CircularProgress size={20} sx={{ ml: 2 }} />}
                    </Button>
                  </Grid> */}
                  <Grid item xs={12}>
  <LoadingButton
    type="submit"
    variant="contained"
    color="primary"
    fullWidth
    loading={circ}
    loadingPosition="end"
    sx={{ mt: 2 }}
  >
    Register
  </LoadingButton>
</Grid>

                  {formik.errors.submit && (
                    <Grid item xs={12}>
                      <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                        {formik.errors.submit}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </form>
            </Grid>
          </Grid>
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
