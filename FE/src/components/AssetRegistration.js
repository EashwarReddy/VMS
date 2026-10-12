import React, { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import { indigo } from '@mui/material/colors';
import axios from 'src/api/axios';
import { API } from 'src/api';


const AssetRegistration = ({ setAssets }) => {
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [serialNo, setSerialNo] = useState('');

  const [type, setType] = useState('');
  const [editIndex, setEditIndex] = useState(-1);
  const [editDevice, setEditDevice] = useState({ serialNo: '', modelName: '', type: '' });

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddAsset = () => {
    const newDevice = { serialNo, type };
    setDevices([...devices, newDevice]);
    setSerialNo('');
    setType('');
    handleClose();
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditDevice(devices[index]);
  };

  const handleEditChange = (e) => {
    const { id, value } = e.target;
    setEditDevice({ ...editDevice, [id]: value });
  };

  const handleEditSave = () => {
    const updatedDevices = devices.map((device, index) =>
      index === editIndex ? editDevice : device
    );
    setDevices(updatedDevices);
    setEditIndex(-1);
  };

  const handleEditCancel = () => {
    setEditIndex(-1);
  };

  const handleDelete = (index) => {
    setDevices(devices.filter((_, i) => i !== index));
  };
const sendAssetDetails = async () =>{
  try {
    setAssets(devices)
console.log('assets',devices)
  } catch (error) {
    console.log('error', error)
  }
}
  return (
    <div>
      
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Device</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="serialNo"
            label="Serial No./ Model Name"
            type="text"
            fullWidth
            variant="standard"
            value={serialNo}
            onChange={(e) => setSerialNo(e.target.value)}
          />
        
          <FormControl fullWidth variant="standard" margin="dense">
            <InputLabel id="type-label">Type of Device</InputLabel>
            <Select
              labelId="type-label"
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              label="Type of Device"
            >
              <MenuItem value="Laptop">Laptop</MenuItem>
              <MenuItem value="Mobile">Mobile</MenuItem>
              <MenuItem value="Others">Others</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAddAsset}
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Add
          </Button>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Serial No.</TableCell>
              <TableCell>Type of Device</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device, index) => (
              <TableRow key={index}>
                <TableCell>
                  {editIndex === index ? (
                    <TextField
                      id="serialNo"
                      value={editDevice.serialNo}
                      onChange={handleEditChange}
                    />
                  ) : (
                    device.serialNo
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <FormControl fullWidth variant="standard">
                      <Select
                        id="type"
                        value={editDevice.type}
                        onChange={handleEditChange}
                      >
                        <MenuItem value="Laptop">Laptop</MenuItem>
                        <MenuItem value="Mobile">Mobile</MenuItem>
                        <MenuItem value="Others">Others</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    device.type
                  )}
                </TableCell>
                <TableCell>
                  {editIndex === index ? (
                    <>
                      <IconButton
                        onClick={handleEditSave}
                        color="primary"
                        style={{
                            marginRight: 8,
                            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.2)',
                            borderRadius: '50%',
                            backgroundColor : indigo[50]
                          }}
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton onClick={handleEditCancel} color="secondary">
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        onClick={() => handleEditClick(index)}
                        color="primary"
                        style={{
                            marginRight: 8,
                            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.2)',
                            borderRadius: '50%',
                            backgroundColor : indigo[50]
                          }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDelete(index)}
                        color="error"
                        style={{
                            marginRight: 8,
                            boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.2)',
                            borderRadius: '50%',
                            backgroundColor : indigo[50]
                          }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <br/>AssetRegistration
      <Stack direction={'row'} spacing={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleClickOpen}
        startIcon={<AddIcon />}
      >
        Add Asset
      </Button>
      <Button variant='contained' onClick={()=>{
        sendAssetDetails()
      }}
      sx={{backgroundColor : "success.main"}}
      > Submit Assets</Button>
      
      </Stack>
     

    </div>
  );
};

export default AssetRegistration;
