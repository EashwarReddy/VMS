export const STORAGE_KEY = "cdac-vms-workspace-v1";
export const ROLES = ["Admin", "Host", "Planner", "Security", "Visitor"];
export const DEPARTMENTS = [
  "Advanced Computing",
  "Cyber Security",
  "AI & Data Science",
  "Embedded Systems",
  "Administration",
];
export const STATUS = [
  "Pending approval",
  "Approved",
  "Checked in",
  "Completed",
  "Declined",
  "Cancelled",
  "Draft",
];

export function localDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function seedVisits() {
  const today = localDate();
  return [
    {
      id: "DEMO-1042",
      name: "Ananya Sharma",
      email: "ananya@example.com",
      organization: "Tech Mahindra",
      host: "Dr. Ravi Kumar",
      hostEmail: "ravi@example.com",
      department: "Advanced Computing",
      purpose: "Research collaboration",
      date: today,
      time: "10:00",
      endTime: "11:30",
      status: "Checked in",
      transport: false,
      accommodation: false,
      logs: [
        {
          in: new Date().toISOString(),
          out: null,
          assets: "Laptop · DEMO-001",
        },
      ],
    },
    {
      id: "DEMO-1043",
      name: "Rahul Verma",
      email: "rahul@example.com",
      organization: "IIIT Hyderabad",
      host: "Dr. Meera Reddy",
      hostEmail: "meera@example.com",
      department: "AI & Data Science",
      purpose: "Project discussion",
      date: today,
      time: "11:00",
      endTime: "12:30",
      status: "Approved",
      transport: true,
      accommodation: true,
      pickup: "Hyderabad Airport",
      plan: {
        vehicle: "Campus shuttle",
        pickup: "Hyderabad Airport · 09:00",
        stay: "Guest House · Room 204",
      },
      logs: [],
    },
    {
      id: "DEMO-1044",
      name: "Priya Nair",
      email: "priya@example.com",
      organization: "Infosys",
      host: "Arjun Patel",
      hostEmail: "arjun@example.com",
      department: "Cyber Security",
      purpose: "Technical review",
      date: today,
      time: "12:00",
      endTime: "13:00",
      status: "Pending approval",
      transport: false,
      accommodation: false,
      logs: [],
    },
    {
      id: "DEMO-1045",
      name: "Vikram Rao",
      email: "vikram@example.com",
      organization: "T-Hub",
      host: "Dr. Ravi Kumar",
      hostEmail: "ravi@example.com",
      department: "Advanced Computing",
      purpose: "Innovation workshop",
      date: today,
      time: "14:00",
      endTime: "16:00",
      status: "Pending approval",
      transport: true,
      accommodation: false,
      pickup: "T-Hub, Hyderabad",
      logs: [],
    },
    {
      id: "DEMO-1046",
      name: "Sneha Iyer",
      email: "sneha@example.com",
      organization: "BITS Pilani",
      host: "Neha Joshi",
      hostEmail: "neha@example.com",
      department: "Embedded Systems",
      purpose: "Lab visit",
      date: today,
      time: "09:00",
      endTime: "10:00",
      status: "Completed",
      transport: false,
      accommodation: false,
      logs: [
        {
          in: new Date().toISOString(),
          out: new Date().toISOString(),
          assets: "No assets",
        },
      ],
    },
    {
      id: "DEMO-1047",
      name: "Aditya Menon",
      email: "aditya@example.com",
      organization: "Wipro",
      host: "Arjun Patel",
      hostEmail: "arjun@example.com",
      department: "Cyber Security",
      purpose: "Partner meeting",
      date: today,
      time: "15:00",
      endTime: "16:00",
      status: "Approved",
      transport: false,
      accommodation: false,
      logs: [],
    },
  ];
}

export function newVisit(spot = false) {
  return {
    name: "",
    email: "",
    organization: "",
    host: "",
    hostEmail: "",
    department: DEPARTMENTS[0],
    purpose: "",
    date: localDate(),
    time: "10:00",
    endTime: spot ? "23:59" : "11:00",
    transport: false,
    accommodation: false,
    pickup: "",
    spot,
    logs: [],
  };
}

export function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function timeLabel(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}
