import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper, 
    Box, 
    Grid, 
    Typography, 
    IconButton, 
    Collapse, 
    Stack, 
    Button, 
    Chip,
    TablePagination,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    Hidden
} from "@mui/material";
import { indigo } from "@mui/material/colors";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import axios from 'axios';
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { Link, Refresh } from "@mui/icons-material";
import { useAuth } from "src/hooks/use-auth";
import { Roles } from "src/components/roles";
import { API } from "src/api";
import { useVisitor } from "src/contexts/visitorContext";
import { useRouter } from "next/router";

const statusColors = {
    "In Campus": "success.main",
    "Exited": "warning.main",
    "Pending": "info.main",
    "Blocked": "error.main",
}

const visitStatusColors = {
    'Failed': "lightgray",
    'Planned': "info.main",
    'Pending': 'warning.main',
    'Completed': 'success.main',
    'Cancelled': 'error.main',
    'Ongoing': 'primary.light'
}

// Mobile Card Component for better mobile experience
const MobileVisitorCard = ({ row, index }) => {
    const [open, setOpen] = useState(false);
    const visitor = useVisitor();
    const router = useRouter();

    return (
        <Card key={index} sx={{ mb: 2, mx: 1 }}>
            <CardContent>
                <Stack spacing={2}>
                    {/* Header Row */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="h6" color="primary">
                            PNR: {row.pnr}
                        </Typography>
                        <IconButton
                            size="small"
                            onClick={() => setOpen(!open)}
                        >
                            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </Stack>

                    {/* Main Info */}
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="textSecondary" sx={{ minWidth: '80px' }}>
                                Visitor:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {row.visitorName}
                            </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="textSecondary" sx={{ minWidth: '80px' }}>
                                Host:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {row.hostName}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="textSecondary" sx={{ minWidth: '80px' }}>
                                Purpose:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {row.purpose}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2" color="textSecondary" sx={{ minWidth: '80px' }}>
                                Type:
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {row.visitType}
                            </Typography>
                        </Stack>
                    </Stack>

                    {/* Status Chips */}
                    {!row.draft && (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip 
                                label={row.status} 
                                size="small"
                                sx={{ 
                                    backgroundColor: statusColors[row.status], 
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                }} 
                            />
                            <Chip 
                                label={row.visitStatus} 
                                size="small"
                                sx={{ 
                                    backgroundColor: visitStatusColors[row.visitStatus], 
                                    fontWeight: 600,
                                    fontSize: '0.75rem'
                                }} 
                            />
                        </Stack>
                    )}

                    {/* Visit Link Button */}
                    <Button 
                        startIcon={<Link/>} 
                        variant="outlined"
                        size="small"
                        onClick={() => {
                            console.log('pnr', row.pnr);
                            visitor.newVisitor(row, true);
                            router.push('/verifyPNR');
                        }}
                        sx={{ alignSelf: 'flex-start' }}
                    >
                        Visit Link
                    </Button>

                    {/* Collapsible Visit Timings */}
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ mt: 2, p: 2, backgroundColor: indigo[50], borderRadius: 1 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Visit Timings
                            </Typography>
                            {row.movements.map((movement, movementIndex) => (
                                <Stack 
                                    key={movementIndex} 
                                    direction="row" 
                                    justifyContent="space-between" 
                                    sx={{ py: 1 }}
                                >
                                    <Stack>
                                        <Typography variant="caption" color="textSecondary">
                                            IN Time
                                        </Typography>
                                        <Typography variant="body2">
                                            {movement.visitInTime}
                                        </Typography>
                                    </Stack>
                                    <Stack>
                                        <Typography variant="caption" color="textSecondary">
                                            OUT Time
                                        </Typography>
                                        <Typography variant="body2">
                                            {movement.visitOutTime}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            ))}
                        </Box>
                    </Collapse>
                </Stack>
            </CardContent>
        </Card>
    );
};

// Desktop Row Component
const DesktopRow = ({ row, index }) => {
    const [open, setOpen] = useState(false);
    const visitor = useVisitor();
    const router = useRouter();
    
    return (
        <React.Fragment key={index}>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">{row.pnr}</TableCell>
                <TableCell>{row.visitorName}</TableCell>
                <TableCell>{row.hostName}</TableCell>
                <TableCell>{row.purpose}</TableCell>
                <TableCell>{row.visitType}</TableCell>
                <TableCell>
                    <Button 
                        startIcon={<Link/>} 
                        size="small"
                        onClick={() => {
                            console.log('pnr', row.pnr);
                            visitor.newVisitor(row, true);
                            router.push('/verifyPNR');
                        }}
                    />
                </TableCell>
                {!row.draft && (
                    <TableCell align='left'>
                        <Chip 
                            label={row.status} 
                            sx={{ 
                                backgroundColor: statusColors[row.status], 
                                p: 2, 
                                fontWeight: 600, 
                                fontSize: '1em' 
                            }} 
                        />
                    </TableCell>
                )}
                {!row.draft && (
                    <TableCell align='left'>
                        <Chip 
                            label={row.visitStatus} 
                            sx={{ 
                                backgroundColor: visitStatusColors[row.visitStatus], 
                                p: 2, 
                                fontWeight: 600, 
                                fontSize: '1em' 
                            }} 
                        />
                    </TableCell>
                )}
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, backgroundColor: indigo[100], p: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Visit Timings
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>IN Time</TableCell>
                                        <TableCell>Out Time</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.movements.map((movement, movementIndex) => (
                                        <TableRow key={movementIndex}>
                                            <TableCell>{movement.visitInTime}</TableCell>
                                            <TableCell>{movement.visitOutTime}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const Page = () => {
    const [accommodationDetails, setAccommodationDetails] = useState([]);
    const [dummy, setDummy] = useState(false);
    const auth = useAuth();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
  
    const paginatedData = accommodationDetails.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );
  
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API}/movement/getAllVisitorMovement`, {
                    headers: {
                        Authorization: `Bearer ${auth?.user?.accessToken}`
                    }
                });
                console.log("response:", response.data.data);
                setAccommodationDetails((response.data.data?.reverse()));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [dummy, auth?.user?.accessToken]);

    if (auth?.user?.roles === Roles["Admin"] || auth?.user?.roles === Roles["Planner"] || auth?.user?.roles === Roles["SecurityGuard"]) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    p: { xs: 1, sm: 2, md: 3 }, // Responsive padding
                }}
            >
                <Grid 
                    container 
                    spacing={2} 
                    component={Paper} 
                    elevation={5} 
                    sx={{ 
                        mx: { xs: 0, sm: 1, md: 3 }, 
                        px: { xs: 1, sm: 2 }, 
                        py: 1, 
                        backgroundColor: indigo[50],
                        maxWidth: '100%'
                    }}
                >
                    {/* Header */}
                    <Grid item xs={12} sx={{ backgroundColor: 'white', borderRadius: 5, p: 2 }}>
                        <Stack 
                            direction={{ xs: 'column', sm: 'row' }} 
                            display={'flex'} 
                            justifyContent={'center'} 
                            alignItems={'center'} 
                            spacing={2}
                        >
                            <img 
                                src='/assets/800px-CDAC_LOGO_crop.png' 
                                style={{ height: isMobile ? 50 : 75 }} 
                                alt="CDAC Logo" 
                            />
                            <Typography 
                                variant={isMobile ? "h5" : "h4"} 
                                align="center"
                            >
                                Visitor Logs
                            </Typography>
                        </Stack>
                    </Grid>

                    {/* Content */}
                    <Grid item xs={12}>
                        <Stack 
                            direction={'row'} 
                            display={'flex'} 
                            alignItems={'center'} 
                            spacing={2} 
                            sx={{ m: 1 }}
                        >
                            <Typography variant={isMobile ? "h6" : "h5"}>
                                Visitor Logs
                            </Typography>
                        </Stack>

                        {/* Mobile View */}
                        {isMobile ? (
                            <Box>
                                {paginatedData.map((row, index) => (
                                    <MobileVisitorCard key={index} row={row} index={index} />
                                ))}
                                
                                {/* Pagination for Mobile */}
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        component="div"
                                        count={accommodationDetails.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        sx={{
                                            '& .MuiTablePagination-toolbar': {
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                gap: 1
                                            },
                                            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                                                fontSize: '0.875rem'
                                            }
                                        }}
                                    />
                                </Box>
                            </Box>
                        ) : (
                            /* Desktop View */
                            <TableContainer 
                                component={Paper} 
                                sx={{ 
                                    maxWidth: '100%',
                                    overflowX: 'auto'
                                }}
                            >
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell />
                                            <TableCell>PNR</TableCell>
                                            <TableCell>Visitor Name</TableCell>
                                            <TableCell>Host Name</TableCell>
                                            <TableCell>Purpose</TableCell>
                                            <TableCell>Type</TableCell>
                                            <TableCell>Visit Link</TableCell>
                                            <TableCell>Movement Status</TableCell>
                                            <TableCell>Visit Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {paginatedData.map((row, index) => (
                                            <DesktopRow key={index} row={row} index={index} />
                                        ))}
                                    </TableBody>
                                </Table>

                                <TablePagination
                                    rowsPerPageOptions={[5, 10, 25]}
                                    component="div"
                                    count={accommodationDetails.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </TableContainer>
                        )}

                        {accommodationDetails.length === 0 && (
                            <Typography 
                                variant={isMobile ? 'h6' : 'h4'} 
                                align='center' 
                                color={'grey'}
                                sx={{ mt: 4 }}
                            >
                                No Data
                            </Typography>
                        )}

                        <Box
                            component="hr"
                            sx={{
                                border: 0,
                                height: '0.2em',
                                backgroundColor: indigo[200],
                                width: '100%',
                                mt: 5,
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    } else {
        return (
            <Box 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '100vh',
                    p: 2
                }}
            >
                <Typography variant="h4" color="error">
                    Not Authorized
                </Typography>
            </Box>
        );
    }
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;