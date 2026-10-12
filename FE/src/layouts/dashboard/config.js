import ChartBarIcon from "@heroicons/react/24/solid/ChartBarIcon";
import CogIcon from "@heroicons/react/24/solid/CogIcon";
import LockClosedIcon from "@heroicons/react/24/solid/LockClosedIcon";
import ShoppingBagIcon from "@heroicons/react/24/solid/ShoppingBagIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
import UserPlusIcon from "@heroicons/react/24/solid/UserPlusIcon";
import UsersIcon from "@heroicons/react/24/solid/UsersIcon";
import XCircleIcon from "@heroicons/react/24/solid/XCircleIcon";
import InformationCircleIcon from "@heroicons/react/24/solid/InformationCircleIcon";
import { SvgIcon } from "@mui/material";
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { Person } from "@mui/icons-material";
import { ConnectingAirports } from "@mui/icons-material";
import DescriptionIcon from '@mui/icons-material/Description';
import HotelIcon from '@mui/icons-material/Hotel';
import { Hotel } from "@mui/icons-material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import GroupsIcon from "@mui/icons-material/Groups";
import GradingIcon from "@mui/icons-material/Grading";
import FlakyIcon from '@mui/icons-material/Flaky';
import TaskIcon from "@mui/icons-material/Task";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import EmailIcon from '@mui/icons-material/Email';
import ScannerIcon from '@mui/icons-material/Scanner';
import LuggageIcon from '@mui/icons-material/Luggage';
import NotesIcon from '@mui/icons-material/Notes';
import HistoryIcon from '@mui/icons-material/History';
import ListAltIcon from '@mui/icons-material/ListAlt';
import StarIcon from '@mui/icons-material/Star';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoodIcon from '@mui/icons-material/Mood';
export const useritems = [
  {
    title: "Visit Form",
    path: "/standard",
    icon: (
      <SvgIcon fontSize="large">
        <Person />
      </SvgIcon>
    ),
  },

  {
    title: "My Registration Details",
    path: "/myregistrationdetails",
    icon: (
      <SvgIcon fontSize="large">
        <FormatListBulletedIcon />
      </SvgIcon>
    ),
  },
  // {
  //   title: "Feedback",
  //   path: "/FeedbackForm",
  //   icon: (
  //     <SvgIcon fontSize="large">
  //       <ChatBubbleIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: "Contact Us",
  //   path: "/ContactUsPage",
  //   icon: (
  //     <SvgIcon fontSize="large">
  //       <EmailIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: "QR Code",
  //   path: "/CreateQRPage",
  //   icon: (
  //     <SvgIcon fontSize="large">
  //       <ScannerIcon />

  //     </SvgIcon>
  //   ),
  // },
];
export const planneritems = [
  {
    title: "Dashboard",
    path: "/dashboardplanner",
    icon: (
      <SvgIcon fontSize="large">
        <ChartBarIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Planning Page",
    path: "/registeredusers",
    icon: (
      <SvgIcon fontSize="large">
        <GroupsIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Planned Past Visits Users",
    path: "/PastVisitsPlanner",
    icon: (
      <SvgIcon fontSize="large">
        <HistoryIcon />
      </SvgIcon>
    ),
  },
  // {
  //   title: "Feedback Details",
  //   path: "/feedbacktable",
  //   icon: (
  //     <SvgIcon fontSize="large">
  //       <StarIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: "Monitor Users",
  //   path: "/monitorusers",
  //   icon: (
  //     <SvgIcon fontSize="large">
  //       <GroupsIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: "Accomodation Section",
  //   path: "/accomodationsection",
  //   icon: (
  //     <SvgIcon fontSize="large">
  //       <HotelIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: "Travel Section",
  //   path: "/travelsection",
  //   icon: (
  //     <SvgIcon fontSize="large">
  //       <LuggageIcon />
  //     </SvgIcon>
  //   ),
  // },

];
export const adminitems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: (
      <SvgIcon fontSize="large">
        <ChartBarIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Users",
    path: "/newusers",
    icon: (
      <SvgIcon fontSize="large">
        <PersonAddIcon />
      </SvgIcon>
    ),
  },
  {
    title: "User Management",
    path: "/roleregister",
    icon: (
      <SvgIcon fontSize="large">
        <GroupsIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Planning Staff",
    path: "/registeredusers",
    icon: (
      <SvgIcon fontSize="large">
        <NotesIcon />
      </SvgIcon>
    ),
  },
  {
    title: " Past Visits",
    path: "/PastVisitsPlanner",
    icon: (
      <SvgIcon fontSize="large">
        <HistoryIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Visitor Logs",
    path: "/visitorlogs",
    icon: (
      <SvgIcon fontSize="large">
        <ListAltIcon />
      </SvgIcon>
    ),
  },

  // {
  //   title: "Feedback review",
  //   path: "/feedbacktable",
  //   icon: (
  //     <SvgIcon fontSize="large">
  //       <StarIcon />
  //     </SvgIcon>
  //   ),
  // },


  // {
  //   title: "Role Register",
  //   path: "/auth/roleregister",
  //   icon: (
  //     <SvgIcon fontSize="large">
  //       <AdminPanelSettingsIcon />
  //     </SvgIcon>
  //   ),
  // },
];
export const hostitems = [
  {
    title: "Visit Form",
    path: "/standard",
    icon: (
      <SvgIcon fontSize="large">
        <Person />
      </SvgIcon>
    ),
  },
  {
    title: "Visitor Approvals",
    path: "/ApprovalVistis",
    icon: (
      <SvgIcon fontSize="large">
        <FlakyIcon />
      </SvgIcon>
    ),
  },
  {
    title: "My Registration Details",
    path: "/myregistrationdetails",
    icon: (
      <SvgIcon fontSize="large">
        <FormatListBulletedIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Register Visitor",
    path: "/visitorstandard",
    icon: (
      <SvgIcon fontSize="large">
        <HistoryIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Past Visits",
    path: "/PastVisitsHost",
    icon: (
      <SvgIcon fontSize="large">
        <HistoryIcon />
      </SvgIcon>
    ),
  },
 
];
//   {
//     title: "Home",
//     path: "/",
//     icon: (
//       <SvgIcon fontSize="large">
//         <HomeWorkIcon />
//       </SvgIcon>
//     ),
//   },
//   {
//     title: "Dashboard",
//     path: "/dashboard",
//     icon: (
//       <SvgIcon fontSize="large">
//         <ChartBarIcon />
//       </SvgIcon>
//     ),
//   },

//   {
//     title: "Registered Users",
//     path: "/prefecttable1",
//     icon: (
//       <SvgIcon fontSize="large">
//         <GroupsIcon />
//       </SvgIcon>
//     ),
//   },
//   {
//     title: "Registration approval",
//     path: "/prefectapproval",
//     icon: (
//       <SvgIcon fontSize="large">
//         <AdminPanelSettingsIcon />
//       </SvgIcon>
//     ),
//   },
//   {
//     title: "User Uploaded Documents",
//     path: "/upload",
//     icon: (
//       <SvgIcon fontSize="large">
//         <DescriptionIcon />
//       </SvgIcon>
//     ),
//   },
//   {
//     title: "Doc Verification by CID",
//     path: "/verify",
//     icon: (
//       <SvgIcon fontSize="large">
//         <GradingIcon />
//       </SvgIcon>
//     ),
//   },
//   {
//     title: "Doc Verification by File",
//     path: "/fileverify",
//     icon: (
//       <SvgIcon fontSize="large">
//         <TaskIcon />
//       </SvgIcon>
//     ),
//   },
// ];

// export const ccitems = [
//   {
//     title: "Home",
//     path: "/",
//     icon: (
//       <SvgIcon fontSize="large">
//         <HomeWorkIcon />
//       </SvgIcon>
//     ),
//   },
//   {
//     title: "Dashboard",
//     path: "/dashboard",
//     icon: (
//       <SvgIcon fontSize="large">
//         <ChartBarIcon />
//       </SvgIcon>
//     ),
//   },

//   {
//     title: "Registered Users",
//     path: "/prefecttable1",
//     icon: (
//       <SvgIcon fontSize="large">
//         <GroupsIcon />
//       </SvgIcon>
//     ),
//   },
// ];

// export const frontdeskitems = [
//   {
//     title: "Home",
//     path: "/",
//     icon: (
//       <SvgIcon fontSize="large">
//         <HomeWorkIcon />
//       </SvgIcon>
//     ),
//   },
//   {
//     title: "Dashboard",
//     path: "/dashboard",
//     icon: (
//       <SvgIcon fontSize="large">
//         <ChartBarIcon />
//       </SvgIcon>
//     ),
//   },


//   {
//     title: "Registered Users",
//     path: "/prefecttable1",
//     icon: (
//       <SvgIcon fontSize="large">
//         <GroupsIcon />
//       </SvgIcon>
//     ),
//   },
//   {
//     title: "Dorm Registration approval",
//     path: "/frontdeskapproval",
//     icon: (
//       <SvgIcon fontSize="large">
//         <AdminPanelSettingsIcon />
//       </SvgIcon>
//     ),
//   },
// ];
export const general = [
  {
    title: "Home",
    path: "/",
    icon: (
      <SvgIcon fontSize="large">
        <HomeWorkIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Login",
    path: "/auth/signin",
    icon: (
      <SvgIcon fontSize="large">
        <LockClosedIcon />
      </SvgIcon>
    ),
  },

];

export const securityguarditems = [
  {
    title: "Spot Registration",
    path: "/spotRegistration",
    icon: (
      <SvgIcon fontSize="large">
        <Person />
      </SvgIcon>
    ),
  },
  {
    title: "Registration Details",
    path: "/securityRegistration",
    icon: (
      <SvgIcon fontSize="large">
        <FormatListBulletedIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Visitor Logs",
    path: "/visitorlogs",
    icon: (
      <SvgIcon fontSize="large">
        <ListAltIcon />
      </SvgIcon>
    ),
  },
  // {
  //   title: "Vistors",
  //   path: "/verifyPNR",
  //   icon: (
  //     <SvgIcon fontSize="large">
  //       <MoodIcon />
  //     </SvgIcon>
  //   ),
  // },

]
