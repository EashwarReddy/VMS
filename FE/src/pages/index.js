import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import { Box, Container, Unstable_Grid2 as Grid, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { useEffect } from 'react';
import { useAuth } from 'src/hooks/use-auth';
import { Roles } from 'src/components/roles';
import { useRouter } from 'next/router';


const now = new Date();

const Page = () => {
  const auth = useAuth();
  console.log("auth from home page::",auth)
  const router = useRouter();
  useEffect(() => {
    if (auth?.user?.roles == Roles['Admin']) {
      router.push("/dashboard");
    }
    else if (auth?.user?.roles == Roles['Visitor']) {
      router.push("/standard")
    }
    else if (auth?.user?.roles == Roles['Planner']) {
      router.push("/dashboardplanner");
    }
    else if (auth?.user?.roles == Roles['Host']) {
      router.push("/standard")
    }
    else {
      router.push("/")
      console.log(auth, "auth")
    }
  }, [])


  return (
    <>
      <Head>
        <title>
          Visitor Management System
        </title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Container maxWidth="xl">
          <Typography variant='h1'>Home Page</Typography>
        </Container>
      </Box>
    </>
  )
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
