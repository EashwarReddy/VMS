import Link from "next/link";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";
import { Box, Drawer, Stack, Typography, useMediaQuery } from "@mui/material";
import { Building2, MapPin, ArrowUpRight } from "lucide-react";
import { Scrollbar } from "src/components/scrollbar";
import { SideNavItem } from "./side-nav-item";

export const SideNav = ({ open, onClose, items }) => {
  const pathname = usePathname();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up("lg"));
  const content = (
    <Scrollbar sx={{ height: "100%" }}>
      <Box
        sx={{
          p: 3,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component={Link}
          href="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            textDecoration: "none",
            color: "#344D3C",
            mb: 4,
          }}
        >
          <Box
            sx={{
              p: 1.2,
              bgcolor: "#EAF1E5",
              borderRadius: 2,
              display: "flex",
            }}
          >
            <Building2 size={26} />
          </Box>
          <Box>
            <Typography
              sx={{ fontSize: 24, fontWeight: 700, letterSpacing: "-1px" }}
            >
              C-DAC
            </Typography>
            <Typography
              sx={{ fontSize: 8, letterSpacing: "1.5px", color: "#86957D" }}
            >
              VISITOR WORKSPACE
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            border: "1px solid #E5EADC",
            borderRadius: 2,
            p: 1.5,
            mb: 4,
            color: "#849476",
            fontSize: 11,
          }}
        >
          <MapPin size={15} />
          Hyderabad campus
        </Box>
        <Typography
          sx={{
            fontSize: 9,
            color: "#9BA68F",
            letterSpacing: "1.5px",
            mb: 2,
            px: 1,
          }}
        >
          WORKSPACE
        </Typography>
        <Stack component="nav" aria-label="Account navigation">
          <Stack
            component="ul"
            spacing={0.6}
            sx={{ listStyle: "none", p: 0, m: 0 }}
          >
            {items
              ?.filter((item) => item && typeof item === "object")
              .map((item) => (
                <SideNavItem
                  key={item.path}
                  active={pathname === item.path}
                  {...item}
                />
              ))}
          </Stack>
        </Stack>
        <Box sx={{ mt: "auto", pt: 5 }}>
          <Box
            component={Link}
            href="/workspace"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: 2,
              bgcolor: "#F3F6ED",
              borderRadius: 2,
              textDecoration: "none",
              color: "#668254",
              fontSize: 12,
            }}
          >
            Explore the new workspace
            <ArrowUpRight size={16} />
          </Box>
          <Typography
            sx={{ fontSize: 10, color: "#A0AB95", mt: 2, textAlign: "center" }}
          >
            Thoughtful visits. A safer campus.
          </Typography>
        </Box>
      </Box>
    </Scrollbar>
  );
  return (
    <Drawer
      anchor="left"
      open={lgUp || open}
      onClose={onClose}
      variant={lgUp ? "permanent" : "temporary"}
      PaperProps={{
        sx: {
          width: 280,
          background: "#FFF",
          borderRight: "1px solid #E7EBE0",
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
    >
      {content}
    </Drawer>
  );
};
SideNav.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  items: PropTypes.array,
};
