import PropTypes from 'prop-types';
import BellIcon from '@heroicons/react/24/solid/BellIcon';
import UsersIcon from '@heroicons/react/24/solid/UsersIcon';
import Bars3Icon from '@heroicons/react/24/solid/Bars3Icon';
import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Grid,
  IconButton,
  Modal,
  Snackbar,
  Stack,
  SvgIcon,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { usePopover } from 'src/hooks/use-popover';
import { AccountPopover } from './account-popover';
import { indigo } from '@mui/material/colors';
import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'src/api/axios';
import { useAuth } from 'src/hooks/use-auth';
const SIDE_NAV_WIDTH = 280;
const TOP_NAV_HEIGHT = 64;

export const TopNav = (props) => {
  const { onNavOpen } = props;
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const accountPopover = usePopover();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [refresh,setRefresh] = useState(false)
  const auth = useAuth()
  const [snack, setSnack] = useState({ open: false, severity: 'info', message: '' });

    const vertical = 'top'
    const horizontal = 'center'
const handleSnackClose = (event, reason) => {
  if (reason === 'clickaway') {
      return;
  }
  setSnack((prev) => { return { ...prev, open: false } })
  setSnack((prev) => { return { ...prev, openCancel: false, openApprove: false } })
  setSnack(false);
}
const { getRootProps, getInputProps } = useDropzone({
  accept: { 'image/*': [] }, // Ensures only images are accepted
  onDrop: (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSnack({ severity: 'error', message: 'Only Images are allowed', open: true })

    }
  },
});
  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);
  // Handle the drop event
  const handleDrop = (files) => {
    const file = files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle the submit action
  const handleSubmit = async () => {
    if (!imageFile) {
      // alert('No image selected');
      setSnack({ severity: 'error', message: 'No Image is selected', open: true })

      return;
    }

    // setLoading(true);
    const formData = new FormData();
    formData.append('profilePhoto', imageFile);

    try {
      const response = await axios.post(`/users/profilePhoto/${auth?.user?.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Ensure the header is set for file uploads
          'Authorization' : `Bearer ${auth?.user?.accessToken}`
        },
      });
      console.log('Image uploaded successfully:', response.data);
      handleClose();

      setRefresh(!refresh)
      setImagePreview(null)
    } catch (error) {
      console.error('Error uploading image:', error);
      setSnack({ severity: 'error', message: error.response.data.message || '', open: true })
      
    }

  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
  };

    // useEffect(()=>{
    // const getProfilePhoto = async ()=>{
    //   try {
    //     const response = await axios.get(`/users/profilePhoto/${auth?.user?.id}`,{
    //       headers : {
    //         'Authorization' :`Bearer ${auth?.user?.accessToken}`
    //       },
    //       responseType: 'blob',
    //     });
  
        
    //     const imageUrl = URL.createObjectURL(response.data); // Create an object URL for the blob
    //     setImageSrc(imageUrl);
    //     console.log('response', response)
    //     // setSnack({ open: true, severity: 'error', message: 'Please check photo is taken' })
    //   } catch (error) {
    //     // setSnack({ open: true, severity: 'error', message: 'Please check photo is taken' })
    //     console.log('error fetching profile photo', error)
    //   }
    // }
    // getProfilePhoto();
    // },[auth?.user?.roles,refresh]);
  
    useEffect(() => {
      const getProfilePhoto = async () => {
        // CRITICAL: Guard against undefined user ID/token
        if (!auth?.user?.id || !auth?.user?.accessToken || !auth.isAuthenticated) {
          console.log('Skipping photo load - user not ready:', { 
            id: auth?.user?.id, 
            hasToken: !!auth?.user?.accessToken 
          });
          setImageSrc(null); // Clear any stale image
          return;
        }
    
        try {
          const response = await axios.get(`/users/profilePhoto/${auth.user.id}`, {
            headers: {
              'Authorization': `Bearer ${auth.user.accessToken}`
            },
            responseType: 'blob',
          });
    
          const imageUrl = URL.createObjectURL(response.data);
          setImageSrc(imageUrl);
        } catch (error) {
          console.log('Photo fetch failed (expected if no photo):', error.response?.status);
          setImageSrc(null); // Let Avatar use fallback
        }
      };
    
      getProfilePhoto();
    }, [auth?.user?.id, auth?.user?.accessToken, refresh]); // Better deps: ID + token + refresh

    
    useEffect(() => {
      return () => {
        if (imageSrc) {
          URL.revokeObjectURL(imageSrc);
        }
      };
    }, [imageSrc]);

    

  return (
    <>
   <Snackbar open={snack.open} autoHideDuration={2000} onClose={handleSnackClose} anchorOrigin={{ vertical, horizontal }}>
                  <Alert
                      onClose={handleClose}
                      severity={snack.severity}
                      variant="filled"
                      sx={{ width: '100%' }}
                  >
                      {snack.message}
                  </Alert>
              </Snackbar>
      <Box
        component="header"
        sx={{
          backdropFilter: 'blur(6px)',
          backgroundColor: (theme) => alpha(indigo[200], 0.6),
          position: 'sticky',
          left: {
            lg: `${SIDE_NAV_WIDTH}px`
          },
          top: 0,
          width: {
            lg: `calc(100% - ${SIDE_NAV_WIDTH}px)`
          },
          zIndex: (theme) => theme.zIndex.appBar
        }}
      >
        <Stack
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{
            minHeight: TOP_NAV_HEIGHT,
            px: 2
          }}
        >
          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
          >
            {!lgUp && (
              <IconButton onClick={onNavOpen}>
                <SvgIcon fontSize="small">
                  <Bars3Icon />
                </SvgIcon>
              </IconButton>
            )}
            {/* <Tooltip title="Search">
              <IconButton>
                <SvgIcon fontSize="small">
                  <MagnifyingGlassIcon />
                </SvgIcon>
              </IconButton>
            </Tooltip> */}
          </Stack>
          <Stack
            alignItems="center"
            direction="row"
            spacing={2}
          >
         <Button startIcon={<AddPhotoAlternateIcon />} variant='outlined' onClick={() => handleOpen()} >
          upload Profile pic
         </Button>
           <Avatar
  onClick={accountPopover.handleOpen}
  ref={accountPopover.anchorRef}
  sx={{
    cursor: 'pointer',
    height: 40,
    width: 40
  }}
  src={imageSrc || undefined}
  alt={`${auth?.user?.firstName || ''} ${auth?.user?.lastName || ''}`}
/>

   
          </Stack>
        </Stack>
      </Box>
      <AccountPopover
        anchorEl={accountPopover.anchorRef.current}
        open={accountPopover.open}
        onClose={accountPopover.handleClose}
      />
  <Modal open={openModal} onClose={handleClose}>
      <Box sx={styles.modalBox}>
        <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
          Upload Image
        </Typography>
        <div
          {...getRootProps()}
          style={{
            border: '2px dashed #cccccc',
            borderRadius: '8px',
            padding: '20px',
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          <input {...getInputProps()} />
          <Typography>Drag and drop an image here or click to select</Typography>
        </div>
        {imagePreview && (
          <Grid container justifyContent="center" sx={{ mt: 2, position: 'relative' }}>
            <div style={{ position: 'relative' }}>
            <div style={styles.overlay}>
                <IconButton
                  onClick={handleRemoveImage}
                  style={styles.removeIcon}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <img
                src={imagePreview}
                alt="Image Preview"
                style={styles.imagePreview}
              />
             
            </div>
          </Grid>
        )}
        <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
          <Grid item>
            <Button onClick={handleSubmit} variant="contained" color="primary">
              Submit
            </Button>
          </Grid>
          <Grid item>
            <Button onClick={handleClose} variant="outlined" color="secondary">
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Modal>
    </>
  );
};
const styles = {
  modalBox: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 3,
    boxShadow: 24,
  },
  imagePreview: {
    width: 300,
    height: 400,
    objectFit: 'crop',
  },
  removeIcon: {
    color: 'black',
    backgroundColor : 'lightred'
  },
};

TopNav.propTypes = {
  onNavOpen: PropTypes.func
};
