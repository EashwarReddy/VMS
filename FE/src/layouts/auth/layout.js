import Link from "next/link";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";
import { ArrowLeft, Building2, Check, ShieldCheck } from "lucide-react";

export const Layout = ({ children }) => (
  <Box
    component="main"
    sx={{
      minHeight: "100vh",
      display: "grid",
      gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
      background: "#F9FAF7",
    }}
  >
    <Box
      sx={{
        position: "relative",
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        bgcolor: "white",
      }}
    >
      <Box
        component={Link}
        href="/"
        sx={{
          display: "inline-flex",
          gap: 1,
          alignItems: "center",
          color: "#7B8D6C",
          position: "absolute",
          top: 28,
          left: 32,
          textDecoration: "none",
          fontSize: 12,
          zIndex: 1,
        }}
      >
        <ArrowLeft size={16} />
        Back to workspace
      </Box>
      {children}
    </Box>
    <Box
      sx={{
        display: { xs: "none", lg: "flex" },
        flexDirection: "column",
        justifyContent: "center",
        p: 9,
        background: "#EAF0E3",
        color: "#345540",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          right: -170,
          bottom: -160,
          width: 550,
          height: 550,
          borderRadius: "50%",
          border: "1px solid #D7E1CB",
          boxShadow:
            "0 0 0 50px #E5ECDD, 0 0 0 51px #D9E3CF, 0 0 0 100px #E7EEDE",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 7 }}>
          <Building2 size={35} />
          <Box>
            <Typography sx={{ fontSize: 28, fontWeight: 700 }}>
              C-DAC
            </Typography>
            <Typography
              sx={{ fontSize: 9, letterSpacing: 2, color: "#839477" }}
            >
              HYDERABAD CAMPUS
            </Typography>
          </Box>
        </Box>
        <Typography
          sx={{ fontSize: 10, letterSpacing: 2, color: "#80936F", mb: 2 }}
        >
          A CONNECTED CAMPUS EXPERIENCE
        </Typography>
        <Typography
          component="h2"
          sx={{
            fontSize: 46,
            lineHeight: 1.2,
            letterSpacing: -2,
            fontWeight: 550,
            mb: 3,
          }}
        >
          Every visit starts
          <br />
          with a welcome.
        </Typography>
        <Typography
          sx={{
            color: "#86977A",
            maxWidth: 340,
            fontSize: 14,
            lineHeight: 1.8,
            mb: 5,
          }}
        >
          One workspace for visitors, hosts, planners, and security. A smoother
          journey for everyone.
        </Typography>
        {[
          "Plan your visit with confidence",
          "Stay informed at every step",
          "Arrive with a secure visitor pass",
        ].map((text) => (
          <Box
            key={text}
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              mb: 2,
              color: "#6E865D",
              fontSize: 13,
            }}
          >
            <Check size={16} />
            {text}
          </Box>
        ))}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mt: 8,
            color: "#8C9F7D",
            fontSize: 11,
          }}
        >
          <ShieldCheck size={16} />
          Thoughtful visits. A safer campus.
        </Box>
      </Box>
    </Box>
  </Box>
);
Layout.propTypes = { children: PropTypes.node };
