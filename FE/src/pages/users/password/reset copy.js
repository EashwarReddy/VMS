import { CircularProgress, Typography, Box, Button, TextField, Paper, Snackbar, Alert } from "@mui/material";
import { Stack } from "@mui/system";
import { API, Frontend_API } from "src/api";
import axios from "axios";
import React, { useEffect, useState } from "react";
//import { useSearchParams } from "react-router-dom";
import { useSearchParams } from "next/navigation";
import * as Yup from "yup";
import { Formik, useFormik } from "formik";
import { useRouter } from "next/router";
import { Layout as AuthLayout } from "src/layouts/auth/layout";
import { encryptPassword } from "src/utils/encryptPassword";
function Page() {
  const router = useRouter();
  const vertical ='top'
  const horizontal = 'center'
  const [message,setMessage] = useState(false)
  const [status, setStatus] = useState(0);
  const [circ,setCirc] = useState(false)
  const [searchParams] = useSearchParams();
  const validationSchema = Yup.object({
    newPassword: Yup.string()
      .required('New Password is required')
      .min(8, 'Password must be at least 8 characters long')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/\d/, 'Password must contain at least one number')
      .matches(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
      
    retypePassword: Yup.string()
      .required("Retype Password is required")
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match"),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialValues = {
    newPassword: "",
    retypePassword: "",
  };
  const resetId = router.query.resetId;
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      setCirc(true)
      console.log(values, resetId);
      const encryptedPassword1 = encryptPassword( values.newPassword,process.env.NEXT_PUBLIC_IV,process.env.NEXT_PUBLIC_SecretKey);
      console.log("encryptedPassword::",encryptedPassword1)
      try {
        const response = await axios.post(`${API}/users/password/reset`, {
          resetId,
          password: encryptedPassword1
        });
        console.log(response);
        setStatus(1);
        setTimeout(()=>{ router.push(`${Frontend_API}/auth/signin`)},5000)
       
      } catch (error) {
        console.log(error);
        setMessage(error.response.data.errors[0])
        setStatus(-1);
        setCirc(false)
      }
      helpers.resetForm();
    },
  });
const handleSClose =  () =>{
  setMessage(false)
}
  return (
    <>
    <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={!!message}
        onClose={handleSClose}
        key={"top" + "center" + "2"}
        autoHideDuration={6000}
        sx={{height : '3em'}}
      >
        <Alert
          severity="error"
          sx={{ width: "100%", backgroundColor: "error.dark", color: "white", height: "6em" }}
        >
          <Typography variant="h6">{message}</Typography>
        </Alert>
      </Snackbar>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Stack
          sx={{ width: "50%", display: "flex", justifyContent: "center", alignItems: "center" }}
        >
    
            <>
              
               
               { status===0 || status===-1 ?( <> <Paper elevation={5} sx={{ p: 5, width: "700px", m: 2 }}><Typography variant="h4" sx={{ m: 1 }}>
                  Reset your password
                </Typography><form noValidate onSubmit={formik.handleSubmit}>
                  <div>
                    <TextField
                      fullWidth
                      id="newPassword"
                      name="newPassword"
                      label="New Password"
                      type="password"
                      value={formik.values.newPassword}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                      helperText={formik.touched.newPassword && formik.errors.newPassword}
                      sx={{ m: 1 }}
                    />
                  </div>
                  <div>
                    <TextField
                      sx={{ m: 1 }}
                      fullWidth
                      id="retypePassword"
                      name="retypePassword"
                      label="Retype Password"
                      type="password"
                      value={formik.values.retypePassword}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      error={formik.touched.retypePassword && Boolean(formik.errors.retypePassword)}
                      helperText={formik.touched.retypePassword && formik.errors.retypePassword}
                    />
                  </div>
                  <div>
                    {formik.errors.submit && (
                      <Box sx={{ mt: 3 }}>
                        <Stack
                          direction="column"
                          spacing={2}
                          alignItems="center"
                          justifyContent="center"
                          sx={{ height: "4em", backgroundColor: "red", padding: 1 }}
                        >
                          <Typography sx={{ color: "white" }}>{formik.errors.submit}</Typography>
                        </Stack>
                      </Box>
                    )}
                    <Button sx={{ m: 2 }} type="submit" variant="contained" color="primary">
                      Submit
                    </Button>
                  </div>
                </form> </Paper></>) : "" }
               
              
            </>
    

          {status === 0 ? (
            ""
          ) : status === 1 ? (
            <Paper elevation={5} sx={{ p: 5, width: "700px", m: 2 }}>
              <Stack>
                <Typography variant="h3" sx={{ color: "success.main", mx: 3 }}>
                  Password Reset Successful
                </Typography>
                {circ && <CircularProgress/>}
                <Typography variant="h6"> Redirecting to Login</Typography>
                {/* <Button
                  variant="contained"
                  color="primary"
                  href="/"
                  sx={{ width: "50%", m: 2, mx: 12 }}
                >
                  Go back to home
                </Button> */}
              </Stack>
            </Paper>
          ) : (""
            // <Paper elevation={5} sx={{ p: 5, m: 2 }}>
            //   <Stack>
            //     <Typography variant="h3" sx={{ color: "error.main" }}>
            //       Password reset is Unsuccessful, Please try again
            //     </Typography>
            //     {/* <Button
            //       variant="contained"
            //       color="primary"
            //       href="/"
            //       sx={{ width: "50%", m: 2, mx: 12 }}
            //     >
            //       Go back to home
            //     </Button> */}
            //   </Stack>
            // </Paper>
          )}
        </Stack>
      </Box>
    </>
  );
}
Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;

