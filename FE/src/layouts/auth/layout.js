import PropTypes from 'prop-types';
import NextLink from 'next/link';
import { Avatar, Box, Stack, Typography, Unstable_Grid2 as Grid } from '@mui/material';
import { motion } from 'framer-motion';

// TODO: Change subtitle text

export const Layout = (props) => {
  const { children } = props;

  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flex: '1 1 auto'
      }}
    >
      <Grid
        container
        sx={{ flex: '1 1 auto' }}
        xs={12}

      >
        <Grid
          xs={12}
          lg={6}
          sm={12}
          sx={{
            backgroundColor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          <Box
            component="header"
            sx={{
              left: 0,
              py: 3,
              position: 'fixed',
              top: 0,
              width: '100%',
              // backgroundColor : "red"
            }}
          >
            <Box
              component={NextLink}
              href="/auth/signin"
              sx={{
                display: 'inline-flex',
                height: 84,
                width: 120,
                // backgroundColor : "red",
                pl: 1
              }}
            >
              <Avatar
                variant="square"
                sx={{ width: '9em', height: '6em' }}
                src="/assets/800px-CDAC_LOGO_crop.png" />

            </Box>
          </Box>
          {children}
        </Grid>
        <Grid
          xs={12}
          lg={6}
          sx={{
            alignItems: 'center',
            background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            '& img': {
              maxWidth: '100%'
            }
          }}
        >
          {/* <motion.div
            style={{
              width: '100%',
              height: '100%',
              background: 'radial-gradient(50% 50% at 50% 50%, #122647 0%, #090E23 100%)',
              display : 'flex',
              justifyContent : 'center',
              alignItems : 'center'
            }}
            animate={{
              background: [
                'radial-gradient(50% 50% at 50% 50%, #122647 60%, #090E23 100%)',
                'radial-gradient(50% 50% at 50% 50%, #122647 30%, #090E23 100%)',
                // 'radial-gradient(10% 10% at 50% 50%, #122647 50%, #1C304D 100%)', // Subtle color based on existing colors
              ],
            }}
            transition={{
              duration: 1, // Duration of each blink
              repeat: Infinity, // Repeat the animation infinitely
              repeatType: 'reverse', // Reverse between the two gradient states
            }}
          > */}
            <Stack direction="column">
              <Box sx={{ py: 3, px: 6 }}>


                <img
                  alt=""
                  src="/assets/cdac-new.png"
                />
              </Box>
              <Typography variant='h6'>Centre for Development of Advanced Computing</Typography>
            </Stack>
          {/* </motion.div> */}
        </Grid>
      </Grid>
    </Box >
  );
};

Layout.prototypes = {
  children: PropTypes.node
};