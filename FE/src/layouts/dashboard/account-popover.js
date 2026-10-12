import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import { Box, Divider, MenuItem, MenuList, Popover, Typography, Stack, Button, Avatar } from '@mui/material';
import { useAuth } from 'src/hooks/use-auth';
import { Roles } from 'src/components/roles';
import axios from 'src/api/axios';
export const AccountPopover = (props) => {
  const { anchorEl, onClose, open } = props;
  const router = useRouter();
  const auth = useAuth();
    const [imageSrc, setImageSrc] = useState(null);
  // console.log(Roles)

  const handleSignOut = useCallback(
    async () => {
      onClose?.();
      await auth.signOut(auth.user.accessToken);
      console.log("after logout", auth?.user)
      sessionStorage.removeItem('provider')
      localStorage.removeItem('userContext')
      router.push('/auth/signin');
    },
    [onClose, auth, router]
  );
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
    // console.log('auth user',auth.user)
    // },[auth?.user?.roles]);
  
    useEffect(() => {
      const getProfilePhoto = async () => {
        // Add these guards FIRST
        if (!auth?.user?.id || !auth?.user?.accessToken) {
          console.log('Skipping photo load - missing user ID or token');
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
          console.log('Error fetching profile photo:', error.response?.status, error.message);
          // Don't set imageSrc on error - Avatar will use fallback
        }
      };
    
      getProfilePhoto();
    }, [auth?.user?.id, auth?.user?.accessToken]); // Depend on ID & token, not roles
    
    // Cleanup object URLs on unmount
    useEffect(() => {
      return () => {
        if (imageSrc) {
          URL.revokeObjectURL(imageSrc);
        }
      };
    }, [imageSrc]);
    
    const date = new Date(auth?.user?.lastLogin);
  const formattedDate = !isNaN(date.getTime()) ? date.toLocaleString() : "";
  function findKeyByValue(obj, value) {
    //console.log('R value',value)
    for (let key in obj) {

      if (obj[key] == value) {

        return key;
      }
    }
    return null;
  }


  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'left',
        vertical: 'bottom'
      }}
      onClose={onClose}
      open={open}
      PaperProps={{ sx: { width: 400 } }}
    >
      <Stack direction={'row'}  display={'flex'} justifyContent={'center'} alignItems={'center'} padding={1}>
      <Box
        sx={{
          py: 1.5,
          px: 2
        }}
      >
        <Typography variant="overline">
          Profile
        </Typography>
        {/* {auth?.user?.id && <Typography
          color="text.secondary"
          variant="subtitle1"
          fontWeight="bold" fontStyle="italic"
        >
          User ID : {auth?.user?.id || "Please Register first"}
        </Typography>} */}
        {/* <Typography
          color="text.secondary"
          variant="body1"
          fontWeight="bold" fontStyle="italic"
        >
        user ID : {auth?.user?.name || "Please login or Signup"}
        </Typography> */}
        <Typography
          color="text.secondary"
          variant="body1"
        >
          Name :  {auth?.user?.firstName + " " + auth?.user?.lastName}
        </Typography>
        <Typography
          color="text.secondary"
          variant="body1"
        >
          Account :  {auth?.user?.email || auth?.user?.mobile}
        </Typography>
        <Typography variant="body1">
          Last Login : {formattedDate}
        </Typography>
        <Typography variant="h2">
          <Stack direction="column">

            <Typography variant="h5" color="secondary" >
              {findKeyByValue(Roles, auth?.user?.roles)}
            </Typography>
          </Stack>
        </Typography>
      </Box>
      <Box sx={{
        width: 150, 
        height: 150, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        border: '1px solid #ddd', 
        borderRadius: 2
      }}>
       <Avatar
          sx={{ width: '100%', height: '100%', borderRadius: 0 }}
              src={imageSrc}
            />
      </Box>
  
      </Stack>
   
      <Divider />
      <MenuList
        disablePadding
        dense
        sx={{
          p: '8px',
          '& > *': {
            borderRadius: 1
          }
        }}
      >
        {auth.isAuthenticated ? <Button variant="contained" onClick={handleSignOut} >
          Sign out
        </Button> : ""}
      </MenuList>
    </Popover>
  );
};

AccountPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool.isRequired
};
