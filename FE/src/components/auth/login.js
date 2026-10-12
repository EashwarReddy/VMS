import React from 'react'
import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useRouter as QRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";
import CryptoJS from "crypto-js";
// import Google from "public/assets/logos/social-google.svg";
import MessageIcon from "@mui/icons-material/Message";
import FacebookIcon from "@mui/icons-material/Facebook";
import {
    Alert,
    Box,
    Button,
    FormHelperText,
    Link,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    AnimateButton,
    SvgIcon,
    Divider,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    DialogContentText,
    CircularProgress,
    Snackbar,
    Paper,
} from "@mui/material";
import { useAuth } from "src/hooks/use-auth";
import { Layout as AuthLayout } from "src/layouts/auth/layout";
import { Roles } from "src/components/roles";
import { API } from "src/api";
import axios from "src/api/axios";
import ReCAPTCHA from 'react-google-recaptcha';
import { encryptPassword } from 'src/utils/encryptPassword';
// import MatchCaptcha from "src/components/MatchCaptcha";
import AlphaNumericCaptcha from "src/components/AlphaNumericCaptcha";
function Login() {
    const router = useRouter();
    const qrouter = QRouter();
    const auth = useAuth();
    const { uerror } = qrouter.query;
    const [uError, setUerror] = useState(false);
    const [method, setMethod] = useState("email");
    const [userEmail, setUserEmail] = useState("");
    const [circ, setCirc] = useState(false);
    const [verror, setVerror] = useState("");
    const [pass, setPass] = useState(false);
    const [snakc, setSnakc] = useState(false);
    const vertical = "top";
    const horizontal = "center";
    // const [reCaptchaValue,setReCaptachValue] = useState('');
    const [captcha,setCaptcha] = useState('')
    const [token,setToken] = useState(null);
    const [captchaToken,setCaptchaToken] = useState(null);
    const [captchaExpression,setCaptchaExpression] = useState('null');
    const [loading,setLoading] = useState(false)

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
      });

    const [captchaOk, setCaptchaOk] = useState(false);
    const [refreshCaptchaFlag, setRefreshCaptchaFlag] = useState(false);


    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
      };
    


    const sendVerify = async (email) => {
        try {
            setCirc(true);
            const response = await axios.post(`${API}/users/password/reset/sendEmail`, {
                email,
            });
            console.log(response.data);
            setPass(false);
            setCirc(false);
            setUserEmail("");
            setSnakc(true);
        } catch (e) {
            console.log(e);
            setVerror(e.response.data.errors[0]);
            setCirc(false);
        }
    };

    const handleFClose = () => {
        setPass(false);
        setCirc(false);
        setUserEmail("");
    };

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
            submit: null,
        },
        validationSchema: Yup.object({
            username: Yup.string().max(255).required("Email or Username is required").test('not-cdac', 'Email cannot be from @cdac.in', value => {
                // Check if the email ends with @amazon.in
                return !value || !value.endsWith('@cdac.in');
              }),
            password: Yup.string().max(255).required("Password is required"),
        }),
        onSubmit: async (values, helpers) => {
            let result;
            setUerror("");

            if (!captchaOk) {
                setSnackbar({
                  open: true,
                  message: "Please verify captcha",
                  severity: "error",
                });
                return;
              }
              const SECRET_KEY = process.env.NEXT_PUBLIC_SecretKey;
            try {
                // const encryptedPassword1 = encryptPassword( values.password,process.env.NEXT_PUBLIC_IV,process.env.NEXT_PUBLIC_SecretKey);
                const encryptedPassword1 = CryptoJS.AES.encrypt(
                                   values.password,
                                       SECRET_KEY
                                        ).toString();
                console.log("encryptedPassword::",encryptedPassword1)
                result = await auth.signIn(values.username, encryptedPassword1);
                if (result?.result == true) {
                    if (result.role == Roles['Admin']) {
                        router.push("/dashboard");
                    }else if( result.role == Roles['Planner']){
                        router.push("/dashboardplanner");
                    }
                    else if (result.role == Roles['Visitor']) {
                        router.push("/standard")
                    } else if ( result.role == Roles['Host']){
                        router.push("/standard")
                    }else if ( result.role == Roles['SecurityGuard']){
                        router.push("/spotRegistration")
                    }
                    else {
                        // console.log("result.role",result.role ,"Roles",Roles)
                        router.push("/")
                       
                    }
                    console.log("result", result);
                } else {
                    const errorMsg = result?.response?.data?.errors?.[0] || "Login failed";

                    setUerror(errorMsg);
                
                    // 🔄 Reset captcha + form on failure
                    setCaptchaOk(false);
                    setRefreshCaptchaFlag(prev => !prev);
                    formik.setFieldValue("password", "");
                
                    setTimeout(() => {
                        setUerror(false);
                    }, 3000);
                
                    helpers.setErrors({ submit: errorMsg });
                }
             

            } catch (err) {
                setCaptchaOk(false);
                setRefreshCaptchaFlag(prev => !prev);
            formik.setFieldValue("password", "");

            helpers.setStatus({ success: false });
            helpers.setSubmitting(false);
            }
        },
    });

   
      

    const handleMethodChange = useCallback((event, value) => {
        setMethod(value);
    }, []);

    const handleSClose = () => {
        setSnakc(false);
    };



    return (
        <>
         {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
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
            <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                open={uError}
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
            </Snackbar>
            <Dialog open={pass} onClose={handleFClose}>
                <DialogTitle>
                    <Typography variant="h5">Send OTP to Email</Typography>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Once you recieve mail click on link to reset password.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Email"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={userEmail}
                        onChange={(e) => {
                            setUserEmail(e.target.value);
                            setVerror(false);
                        }}
                    />
                </DialogContent>
                {circ ? (
                    <CircularProgress sx={{ m: 2 }} />
                ) : (
                    <DialogActions>
                        <Button
                            onClick={() => {
                                sendVerify(userEmail);
                            }}
                        >
                            Send Link
                        </Button>
                    </DialogActions>
                )}
                {verror && (
                    <DialogContent>
                        <DialogContentText sx={{ color: "error.main" }}>{verror}</DialogContentText>
                    </DialogContent>
                )}
            </Dialog>
            <Head>
                <title>Login</title>
            </Head>
            <Box
                sx={{
                    backgroundColor: "background.paper",
                    flex: "1 1 auto",
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Box
                    sx={{
                        maxWidth: 550,
                        px: 3,
                        width: "100%",
                    }}
                >
                    <div>
                        <>
                            <form noValidate onSubmit={formik.handleSubmit}>
                                <Stack spacing={3}>
                                    <TextField
                                        error={!!(formik.touched.username && formik.errors.username)}
                                        fullWidth
                                        helperText={formik.touched.username && formik.errors.username}
                                        label="Email/Username"
                                        name="username"
                                        autoComplete="off"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        type="text"
                                        value={formik.values.username}
                                    />
                                    <TextField
                                        error={!!(formik.touched.password && formik.errors.password)}
                                        fullWidth
                                        helperText={formik.touched.password && formik.errors.password}
                                        label="Password"
                                        name="password"
                                        autoComplete="new-password"
                                        onBlur={formik.handleBlur}
                                        onChange={formik.handleChange}
                                        type="password"
                                        value={formik.values.password}
                                    />
                                </Stack>

                                {formik.errors.submit && (
                                    <Paper sx={{ backgroundColor: "error.main" }}>
                                        <Typography color="white" sx={{ mt: 3, p: 2 }} variant="h6">
                                            {formik.errors.submit}
                                        </Typography>
                                    </Paper>
                                )}
                                <br/>
                                {/* <ReCAPTCHA
    sitekey={process.env.NEXT_PUBLIC_SITE_KEY}
    onChange={(value)=>{setReCaptachValue(value); console.log('value', value)}}
  /> */}
  {/* <Stack spacing={2} sx={{ width: '100%',margin: 'auto', textAlign: 'center' }}>

        <Box 
          sx={{ 
            padding: 2, 
            border: '2px dashed green', 
            backgroundColor: 'whitesmoke', 
            borderRadius: 2 ,
  
          }}
        >
          <Typography variant="h6">Solve {captchaExpression}</Typography>
        </Box>
  

        <TextField 
          type="number"
          placeholder="Type your answer here"
          variant="outlined"
          fullWidth
        />
      </Stack> */}
     {/* Captcha */}
     <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <AlphaNumericCaptcha onCaptchaSolved={setCaptchaOk} shouldRefresh={refreshCaptchaFlag} />
                </Box>

                                <Button fullWidth size="large" sx={{ mt: 3 }} type="submit" variant="contained">
                                    Login
                                </Button>
                                <Button

                                    size="medium"
                                    sx={{ mt: 1, ml: 43 }}
                                    onClick={() => {
                                        setPass(true);
                                    }}
                                >
                                    Forgot Password
                                </Button>
                            </form>
                            <hr />
                            {/* <Stack sx={{ py: 1 }}>
                   
                    <Button
                      fullWidth
                      size="medium"
                      variant="contained"
                      sx={{
                        color: "white",
                        mt: 3,
                      }}
                      onClick={() => {
                        googleHandle();
                      }}
                    >
                      <Box sx={{ mr: 2, width: 20 }}>
                        <img
                          src="/assets/logos/icons8-google.svg"
                          alt="google"
                          width={30}
                          height={30}
                          style={{
                            backgroundColor: "white",
                            borderRadius: "50%",
                            padding: "10%",
                            marginTop: "10%",
                          }}
                        />
                      </Box>
                      Sign in with Google
                    </Button>
                    <Button
                      fullWidth
                      size="medium"
                      variant="contained"
                      sx={{
                        color: "white",
                        mt: 3,
                      }}
                    >
                      <Box sx={{ mr: 5, width: 10 }}>
                        <FacebookIcon sx={{ width: "2em", height: "1.4em" }} />
                      </Box>
                      Sign in with Facebook
                    </Button>
                    <Button
                      fullWidth
                      size="medium"
                      variant="contained"
                      sx={{
                        color: "white",
                        mt: 3,
                      }}
                      onClick={() => {
                        router.push("/otppage");
                      }}
                    >
                      <Box sx={{ mr: 3, width: 10 }}>
                        <MessageIcon
                          sx={{
                            mt: 1.5,
                            height: "1em",
                          }}
                        />
                      </Box>
                      Sign in with OTP
                    </Button>
                  </Stack> */}
                        </>


                    </div>
                </Box>
            </Box>
        </>
    )
}

export default Login