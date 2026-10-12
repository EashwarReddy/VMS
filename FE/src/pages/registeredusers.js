import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import axios from 'src/api/axios';
import React, { useEffect, useState } from 'react';
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import Head from "next/head";
import { Container, Grid, TextField, Button, Stack, Divider, TablePagination, Chip, Tooltip, Snackbar, Alert } from "@mui/material";
import { blue, indigo } from "@mui/material/colors";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowBack, ArrowRight, Edit, RemoveRedEye } from '@mui/icons-material';
import { motion } from 'framer-motion';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import HotelIcon from '@mui/icons-material/Hotel';
import Modal from '@mui/material/Modal';
import DeleteIcon from '@mui/icons-material/Delete';

import CloseIcon from '@mui/icons-material/Close';
import IndividualRegistrations from '../components/IndividualRegistrations'

import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import OrganizationRegistrations from 'src/components/OraganizationRegistrations';
import { useAuth } from 'src/hooks/use-auth';
import { Roles } from 'src/components/roles';


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
        <Box sx={{ p: 3, height: '100%' }}>
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
  const auth = useAuth();
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  if (auth?.user?.roles === Roles["Admin"] || auth?.user?.roles === Roles["Planner"]) {
  return  <Box sx={{ width: '100%', backgroundColor : '#280C58' , height : '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor : indigo[50] }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Individual" {...a11yProps(0)} />
          {/* <Tab label="Organization" {...a11yProps(1)} /> */}
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <IndividualRegistrations />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <OrganizationRegistrations />
      </CustomTabPanel>
    </Box>
  }else {
    return (
        <>
            <h1>Not Authorized</h1>
        </>
    )
  }

};
Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
