import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useRouter as QRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";
// import Google from "public/assets/logos/social-google.svg";
import MessageIcon from "@mui/icons-material/Message";
import FacebookIcon from "@mui/icons-material/Facebook";
import MathCaptcha from "../../components/MatchCaptcha";
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
const Page = () => {
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

  const [captchaOk, setCaptchaOk] = useState(false);
  
  const vertical = "top";
  const horizontal = "center";
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
      setVerror(e.response.data.messages[0]);
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
      username: Yup.string().max(255).required("Email or Username is required"),
      password: Yup.string().max(255).required("Password is required"),
    }),
    onSubmit: async (values, helpers) => {
      let result;
      setUerror("");
      try {
        result = await auth.signIn(values.username, values.password);
        if (result == true) {
          router.push("/");
          console.log("result", result);
        } else {
          console.log("result", result);
          setUerror(result.message);
          setTimeout(() => {
            setUerror(false);
          }, 3000);
          helpers.setErrors({ submit: result.response.data.errors[0] });
        }


      } catch (err) {
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
  // useEffect(() => {
  //   //   if(qrouter.isReady && !!uerror){
  //   //     console.log('user ready',uerror)
  //   //   setUerror(true)
  //   //   setTimeout(()=>{
  //   //     setUerror(false);
  //   //     router.push("/auth/login")
  //   //   },6000)
  //   // }
  // }, [qrouter.isReady]);
  // const googleHandle = () => {
  //   window.sessionStorage.setItem("provider", "google");
  //   window.location.replace("https://localhost:5000/api/v1/auth/google");
  // };
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
          <Typography variant="h5">Send Reset Link to Email</Typography>
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
            py: "100px",
            width: "100%",
          }}
        >
          <div>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="h4">Login</Typography>
              <Typography color="text.secondary" variant="body2">
                Don&apos;t have an account? &nbsp;
                <Link
                  component={NextLink}
                  href="/auth/register"
                  underline="hover"
                  variant="subtitle2"
                >
                  Register
                </Link>
              </Typography>
            </Stack>
            <Tabs onChange={handleMethodChange} sx={{ mb: 3 }} value={method}>
              <Tab label="Email/Username" value="email" />
            </Tabs>
            {method === "email" && (
              <>
                <form noValidate onSubmit={formik.handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      error={!!(formik.touched.username && formik.errors.username)}
                      fullWidth
                      helperText={formik.touched.username && formik.errors.username}
                      label="Email/Username"
                      name="username"
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
                  <Button fullWidth size="large" sx={{ mt: 3 }} type="submit" variant="contained">
                    Continue
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
            )}

          </div>
        </Box>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;
