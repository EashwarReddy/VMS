import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { styled } from "@mui/material/styles";
import { withAuthGuard } from "src/hocs/with-auth-guard";
import { SideNav } from "./side-nav";
import { TopNav } from "./top-nav";
import { useAuth } from "src/hooks/use-auth";
import axios, { axiosPrivate } from "src/api/axios";
import { API } from "src/api";
//import { BsCartCheck } from "react-icons/bs";
import { useritems, adminitems, general, hostitems, planneritems, securityGuard, securityguarditems } from "./config";
import { useRouter } from "next/router";
const SIDE_NAV_WIDTH = 280;
import { Roles } from "src/components/roles";
//import { CircularProgress } from "@mui/material";
import { useContext } from "react";
import { Typography } from "@mui/material";
import { io } from "socket.io-client";
import { useVisitor } from "src/contexts/visitorContext";
import SessionExpiredModal from "src/components/SessionExpiredModal";
import { useRegister } from "src/contexts/registerContext";

const LayoutRoot = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  [theme.breakpoints.up("lg")]: {
    paddingLeft: SIDE_NAV_WIDTH,
  },
}));

const LayoutContainer = styled("div")({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  width: "100%",
});

export const Layout = withAuthGuard((props) => {
  const { children } = props;
  const pathname = usePathname();
  const [openNav, setOpenNav] = useState(false);
  const [socket,setSocket] = useState('')
  const auth = useAuth();
  const router = useRouter();
const visitor = useVisitor();
const register = useRegister();
const [isLogged,setIsLogged] = useState(true);
const [open, setOpen] = useState(true); // Set to true for demonstration

const handleClose = () => {
  setOpen(false);
  // Add logout or redirect logic here if needed
};
  let items = null;

  if (auth?.user?.roles == Roles["Admin"]) {
    items = adminitems;
  }
  else if (auth?.user?.roles == (Roles["Visitor"])) {
    items = useritems;
  } else if (auth?.user?.roles == (Roles["Host"])) {
    items = hostitems
  } else if (auth?.user?.roles == (Roles["Planner"])) {
    items = planneritems;
  } else if (auth?.user?.roles == (Roles["SecurityGuard"])){
    items = securityguarditems;
  }
  else {
    items = general
  }
  const { asPath } = useRouter()

  const handlePathnameChange = useCallback(() => {
    if (openNav) {
      setOpenNav(false);
    }
  }, [openNav]);
  useEffect(()=>{
    console.log('the current path is ', asPath,pathname, register)
    register.newRegister(null,null)

  },[asPath,pathname])
  useEffect(
    () => {
      // console.log('the path', asPath,'items', items, items.some(item => item['path'] == asPath))
      const verifyingUser = async () => {
        // console.log('verifying user',auth)
        const isOk = await auth?.verifyUser(auth?.user?.accessToken);
        console.log(isOk)
        if (isOk.result == false) {
          console.log(isOk.message)
          router.push('/auth/signin')
          auth?.signOut(auth?.user?.accessToken)
          localStorage.removeItem('userContext')
        }
      }
      handlePathnameChange();
      if (router.isReady) {
        // if (auth.user === null && window.sessionStorage.getItem('provider') == 'google') {
        //   try {
        //     auth.googleUser();
        //   } catch (e) {
        //     //console.log(e);
        //   }
        // }

        verifyingUser()

        //dispatch({type : "REMOVE_USER"})
        // const routes = items?.map(r => r.path)
        // // //console.log(auth?.user?.role,'there')
        // if (routes?.includes(asPath) || localStorage.getItem('userContext') != null) {
        //   if (!auth.isAuthenticated & localStorage.getItem('userContext') != null) {
        //     const liveuser = JSON.parse(localStorage.getItem('userContext'))
        //     console.log("🚀 ~ file: layout.js:85 ~ Layout ~ liveuser:", liveuser)
        //     auth.persist(liveuser)
        //   }
        //   // console.log("the path pwd", asPath, "items", items)
        //   // console.log(routes,"routes")
        //   // console.log(auth?.user?.role)
        //   // console.log(auth?.user)
        //   // console.log('role OK')    
        // } else {
        //   // console.log(auth?.user?.role)
        //   // console.log(asPath,"asPath")
        //   // console.log( routes.includes(asPath) )
        //   // console.log("-->", asPath, "-->", items)
        //   // console.log(routes,"routes")
        //   // console.log('role not OK')
        //   router.replace('/auth/login')
        //   auth?.signOut(auth?.user?.accessToken)
        //   localStorage.removeItem('userContext')
        // }
        // // if (!!auth.user?.mobile) {
        // //   auth?.verifyMUser(auth.user.accessToken, auth.user.id);
        // // }

      }
    },

    [pathname, router.isReady]
  );

  const updateSocket = async(socketID)=> {
    try {
      const response =  await axios.post(`${API}/facerecognition/updateSocketID`,{
        userID : auth?.user?.id,
        socketID 
      })
    } catch (error) {
      console.log('failed to update socketID', error)
    }
  } 
  // console.log("layout ~ user context", auth?.user)
      useEffect(() => {
        const newSocket = io("https://10.244.3.201:8000", {
            secure: true,
            rejectUnauthorized: false, // Crucial for self-signed certificates
            transports: ["websocket", "polling"],
        });
    
        newSocket.on("connect", () => {
            console.log("✅ Connected to WebSocket:", newSocket.id);
            setSocket(newSocket);
            updateSocket(newSocket.id)
          
            
        });
    
        // Listen for sample data from backend
        newSocket.on("sampleData", (data) => {
            console.log("📦 Received sample data:", data);
            // setSampleMessage(data.message);  // Set sample message received from server
        });
        newSocket.on('file-upload-success', (data) => {
          console.log('File Upload Success:', data);
          console.log('current path ', items,'as path', asPath)
          if (data.link) {
            // window.open(data.link, '_blank');
            if(auth?.user?.roles == Roles["SecurityGuard"]){
              visitor.newVisitor(data.data,true)
              router.push('/verifyPNR')
            console.log('data', data.data)
            }


          }
        });
        let logoutTimeout; // Declare timeout variable
        newSocket.on("logout", (data) => {
          console.log("Received logout message:", data.message);
          setIsLogged(false);
          logoutTimeout = setTimeout(() => {
            //  auth.signOut(auth.user.accessToken);
            auth?.verifyUser(auth?.user?.accessToken, auth?.user?.id);
            router.push('/auth/signin')
             sessionStorage.removeItem('provider');
      localStorage.removeItem('userContext');
          }, 5000);
          // Clear localStorage/sessionStorage or authentication token
          // localStorage.removeItem("authToken");
          // sessionStorage.removeItem("authToken");

          // Redirect to login page
          // navigate("/login");
      });
      return () => {
        // Cleanup on component unmount
        newSocket.off("logout");
        newSocket.disconnect();
    };
    }, [auth?.user?.id]);
   



  return (
    <>
      <TopNav onNavOpen={() => setOpenNav(true)} />
      <SideNav onClose={() => setOpenNav(false)} open={openNav} items={items} />
      <LayoutRoot>
        <LayoutContainer>
        <LayoutContainer>{auth?.user?.roles == Roles["SecurityGuard"] ? children : items.some(item => item['path'] == asPath) ? children : <Typography> Not Authorized </Typography>}</LayoutContainer>
         {!isLogged && <SessionExpiredModal open={open} onClose={handleClose} />}
          </LayoutContainer>
      </LayoutRoot>
    </>
  );
});
