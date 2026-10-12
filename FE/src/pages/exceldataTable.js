import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Container, TablePagination, TextField } from "@mui/material";
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
import Head from "next/head";
import React, { forwardRef, useEffect, useImperativeHandle, useState, useCallback } from 'react';

import CheckIcon from '@mui/icons-material/Check'; // Import CheckIcon
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function createData(firstName, lastName, email, state, district, address, pincode, contact, govtIdType, govtIdNumber, age, gender, organization) {
  return {
    firstName,
    lastName,
    email,
    state,
    district,
    address,
    pincode,
    contact,
    govtIdType,
    govtIdNumber,
    age,
    gender,
    organization,
  };
}

function Row({ row, index, onEdit, onDelete }) {
  const [open, setOpen] = React.useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({ ...row });

  const handleSave = () => {

    onEdit(index, editedData);
    setEditMode(false);
  };

  const handleCancel = () => {

    setEditedData({ ...row });
    setEditMode(false);
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell component="th" scope="row">
          {row.firstName}
        </TableCell>
        <TableCell>{row.lastName}</TableCell>
        <TableCell>{row.email}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Other Details
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell >State</TableCell>
                    <TableCell >District</TableCell>
                    <TableCell >Address</TableCell>
                    <TableCell >Pin Code</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>

                  <TableRow key={row.date}>
                    <TableCell >{row.state}</TableCell>
                    <TableCell >{row.district}</TableCell>
                    <TableCell >{row.address}</TableCell>
                    <TableCell >{row.pincode}</TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

    </React.Fragment>
  );
}

const ExcelDataTable = forwardRef(({ jsonData, setData1 }, ref) => {
  const [dummy, setDummy] = useState(true);
  console.log("Data from ExcelDataTable Page:", jsonData)

  const [data, setData] = useState([]);
  // Memoize the setData1 function using useCallback
  const memoizedSetData1 = useCallback(setData1, [setData1]);

  useEffect(() => {
    if (jsonData && jsonData.length > 0) {
      const newData = jsonData.map((visitor) => createData(
        visitor.firstName,
        visitor.lastName,
        visitor.email,
        visitor.state,
        visitor.district,
        visitor.address,
        visitor.pincode,
        visitor.contact,
        visitor.govtIdType,
        visitor.govtIdNumber,
        visitor.age,
        visitor.gender,
        visitor.organization
      ));

      // Check if the data has changed before updating the state
      if (JSON.stringify(data) !== JSON.stringify(newData)) {
        setData(newData);
        setData1(newData);
      }
    } else {
      // Check if the data has changed before updating the state
      if (JSON.stringify(data) !== JSON.stringify([])) {
        setData([]);
        setData1([]);
      }
    }
  }, [jsonData, data, setData1]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5); // You can adjust the number of rows per page

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const slicedData = data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useImperativeHandle(ref, () => ({
    handleAddNewRecord: (newRecord) => {
      // Your logic to add a new record to the data
      // ...
      const newData = [...data, newRecord];
      setData(newData);
      setData1(newData);
    },
  }), [setData1, data]);

  const handleEdit = (index, editedData) => {
    // Update the data with the edited data
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      ...editedData,
    };
    setData(newData);
    setData1(newData);

  };

  const handleDelete = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
    console.log("newData::", newData)
    setData1(newData);
    alert("Are you confirm to delete?")
    // localStorage.setItem('jsonData', newData);

  };
  useEffect(() => {
    // Update jsonData whenever data changes
    setData1(data);

  }, [data]);

  useEffect(() => {
    // Update jsonData whenever data changes
    setDummy(!dummy)

  }, [data]);
  console.log("Data after went to excel componentdata::", data)
  return (
    <>
      <Head>
        <title>Standard user Form</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container>
          <TableContainer component={Paper}>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  {/* <TableCell>Action</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {slicedData?.map((row, index) => (
                  <Row row={row} index={index} onEdit={handleEdit} onDelete={handleDelete} key={index} />
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20]} // You can customize the available options
              component="div"
              count={data?.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        </Container>
      </Box>

    </>

  );
});
// Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default ExcelDataTable;
