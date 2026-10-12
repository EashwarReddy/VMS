import React, { useState, useEffect } from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';
import moment from 'moment-timezone'; // Import moment-timezone
import { useRouter } from 'next/router';
import { ArrowLeft } from '@mui/icons-material';

const TimeCheckModal = ({ data, before, after }) => {
  const [message, setMessage] = useState('');
  const [isEarly, setIsEarly] = useState(false); // Flag for early arrival
  const [isLate, setIsLate] = useState(false);  // Flag for expired visit
  const [openModal, setOpenModal] = useState(false);
const [wrong,setWrong] = useState(false);
const router = useRouter();
const [isSameDayAsInTime, setIsDameDayAsInTime] = useState(false)
const [isSameDayAsOutTime , setIsSameDayAsOutTime] = useState(false);
  
  // console.log("formattedToday::", formattedToday);
  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    // Get current time in IST (India Standard Time)
    const currentTime = moment().tz('Asia/Kolkata'); // Current time in IST

    // Convert inTime and outTime to IST
    const inTime = moment(data.inTime).tz('Asia/Kolkata'); // Convert inTime to IST
    const outTime = moment(data.outTime).tz('Asia/Kolkata'); // Convert outTime to IST
// console.log('current',currentTime._d,'intime', inTime._d, 'outTime', outTime._d)
    // Compare the times
    setIsDameDayAsInTime(currentTime.isSame(inTime, 'day'));
    setIsSameDayAsOutTime(currentTime.isSame(outTime, 'day'));
    console.log('is', isSameDayAsInTime, isSameDayAsOutTime)
    // if (currentTime.isBefore(inTime)) {
    //   setMessage('Sorry you arrived earlier');
    //   setIsEarly(true);
    //   setIsLate(false);
    //   handleOpenModal();
    // } else 
    if (currentTime.isAfter(outTime)) {
      setMessage('Sorry your visit has expired');
      setIsLate(true);
      setIsEarly(false);
      handleOpenModal();
    } else {
      setMessage('Data is invalid');
      setWrong(true)
      setIsEarly(false);
      setIsLate(false);
    }
    // console.log('compare',currentTime.isBefore(inTime),currentTime.isAfter(outTime))
  }, [data]);

  const handleAllowForTheDay = () => {
    console.log('Allow for the day');
    handleCloseModal();
  };

  const handleCancel = () => {
    console.log('Cancelled');
    handleCloseModal();
  };
console.log('fase true',isSameDayAsInTime, isSameDayAsOutTime)
  return (
    <Modal open={openModal} >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: 4,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2, backgroundColor : "error.main", padding : 4, color : 'white', borderRadius : 2 }}>
          {message}
        </Typography>
         {(!wrong && (isSameDayAsInTime && isSameDayAsOutTime)) && <> <Button
          variant="contained"
          onClick={handleAllowForTheDay}
          sx={{ marginRight: 2 }}
      disabled={!isSameDayAsInTime || !isSameDayAsOutTime}
        >
          Allow for the day
        </Button>
        <Button variant="outlined" onClick={handleCancel}
      disabled={!isSameDayAsInTime || !isSameDayAsOutTime}
        
        >
          Cancel
        </Button> </> }
        {(wrong || !isSameDayAsInTime || !isSameDayAsOutTime) && <Button
          variant="contained"
          onClick={()=>{
            router.push('/visitorlogs')
          }}
          sx={{ marginRight: 2 }}
      startIcon={<ArrowLeft/>}
        >
          Go back 
        </Button>}
      </Box>
    </Modal>
  );
};

export default TimeCheckModal;
