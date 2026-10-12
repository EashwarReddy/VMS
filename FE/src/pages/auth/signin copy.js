import { useAuth } from "src/hooks/use-auth";
import { Layout as AuthLayout } from "src/layouts/auth/layout";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useRouter as QRouter } from "next/router";
import { useFormik } from "formik";
import * as Yup from "yup";
import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Stack } from "@mui/system";
import Login from "src/components/auth/login";
import { blue, indigo } from "@mui/material/colors";
import LDAP from "src/components/auth/LDAP";

import Link from '@mui/material/Link';
import StandardSignUp from "src/components/auth/StandardSingUp";
import { Divider } from "@mui/material";
import ReCAPTCHA from "react-google-recaptcha";
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
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}
CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}
const Page = () => {
    const [value, setValue] = React.useState(0);
    const [sValue, setSValue] = React.useState(false)
    const handleChange = (event, newValue) => {
        setValue(newValue);
        setSValue(false);
    };


    return (
        <Box
            sx={{
                mt: 15
            }}>
            <Box sx={{
                backgroundColor: "background.paper",
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                flexDirection: 'column'
            }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs sx={{
                        backgroundColor: indigo[50],
                        p: 2,
                        borderRadius: 5,
                        width: 260,
                    }}
                        value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="CDAC" sx={{ fontWeight: 600, fontSize: 20, mx: 2, borderRadius: 2, px: 2 }} {...a11yProps(0)} />

                        <Tab label="Visitor" sx={{ fontWeight: 600, fontSize: 20, borderRadius: 2, px: 2 }} {...a11yProps(1)} />
                    </Tabs>
                </Box>

                <Box>

                    <CustomTabPanel value={value} index={0}>
                        <LDAP />
                    </CustomTabPanel>
                    <CustomTabPanel value={value} index={1}>
                        <Box sx={{
                            alignItems: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            flexDirection: 'column'
                        }}>
                            {!sValue && <>
                                <Stack spacing={1}>
                                    <Typography variant="h4">Login</Typography>
                                    <Typography color="text.secondary" variant="body2">
                                        Don&apos;t have an account? &nbsp;
                                        <Link
                                            href="#"
                                            onClick={() => { setSValue(true) }}
                                        >
                                            Register
                                        </Link>
                                        {/* <Typography
                                            sx={{
                                                textDecoration: 'underline',
                                                color: indigo[600]
                                            }}
                                          

                                            variant="subtitle2"
                                        >

                                        </Typography> */}
                                    </Typography>
                                </Stack>
                                <br />
                                <Login />
                            </>}
                            {sValue && <><Stack
                                spacing={1}
                            >
                                <Typography variant="h4">
                                    Register
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    variant="body2"
                                >
                                    Already have an account?
                                    &nbsp;
                                    <Link
                                        href="#"
                                        onClick={() => { setSValue(false) }}
                                    >
                                        Login
                                    </Link>

                                </Typography>
                               
                            </Stack>
                                <br />
                                <StandardSignUp />
                            </>}
                        </Box>
                    </CustomTabPanel>
                </Box>
            </Box>
        </Box>
    );
}
Page.getLayout = (page) => <AuthLayout>{page}</AuthLayout>;

export default Page;