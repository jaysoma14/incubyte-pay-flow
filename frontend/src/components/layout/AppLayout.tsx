import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar, Avatar, Box, Button, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Tooltip, Typography,
} from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { useLogoutMutation } from "../../api/authApi";
import { useNotify } from "../feedback/useNotify";

const drawerWidth = 250;
const navigation = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon /> },
  { label: "Employees", path: "/employees", icon: <GroupsOutlinedIcon /> },
  { label: "Salary management", path: "/salaries", icon: <PaymentsOutlinedIcon /> },
  { label: "Reports", path: "/reports", icon: <AssessmentOutlinedIcon /> },
  { label: "Audit logs", path: "/audit-logs", icon: <HistoryOutlinedIcon /> },
];

export default function AppLayout({ email }: { email: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [logout, { isLoading }] = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();

  const signOut = async () => {
    try {
      await logout().unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      notify({ severity: "error", message: "Could not sign out. Please try again." });
      console.error("Logout failed", error);
    }
  };

  const drawer = (
    <Box className="sidebar-content">
      <Box className="brand">
        <Box className="brand-mark">P</Box>
        <Box><Typography sx={{ fontWeight: 800, letterSpacing: -0.5 }}>PayFlow</Typography><Typography variant="caption" color="text.secondary">PEOPLE & PAYROLL</Typography></Box>
      </Box>
      <Typography className="nav-caption">WORKSPACE</Typography>
      <List className="nav-list">
        {navigation.map((item) => (
          <ListItemButton
            component={NavLink}
            to={item.path}
            key={item.path}
            onClick={() => setMobileOpen(false)}
            className={`nav-item${location.pathname === item.path || location.pathname.startsWith(`${item.path}/`) ? " active" : ""}`}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box className="sidebar-footer">
        <Divider sx={{ mb: 2 }} />
        <Typography variant="caption" color="text.secondary">PAYFLOW HR PORTAL</Typography>
        <Typography component="span" variant="caption" color="text.secondary" sx={{ display: "block" }}>Secure workforce management</Typography>
      </Box>
    </Box>
  );

  return (
    <Box className="app-shell">
      <AppBar position="fixed" elevation={0} className="topbar">
        <Toolbar className="topbar-toolbar">
          <IconButton className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><MenuOutlinedIcon /></IconButton>
          <Box sx={{ flex: 1 }} />
          <Tooltip title={email}>
            <Button className="account-button" onClick={(event) => setMenuAnchor(event.currentTarget)} startIcon={<Avatar className="account-avatar">{email.slice(0, 1).toUpperCase()}</Avatar>} endIcon={<AccountCircleOutlinedIcon />}>
              <span className="account-email">{email}</span>
            </Button>
          </Tooltip>
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
            <MenuItem onClick={() => { setMenuAnchor(null); void signOut(); }} disabled={isLoading}><LogoutOutlinedIcon fontSize="small" sx={{ mr: 1 }} />Log out</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" className="desktop-nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { width: drawerWidth } }}>{drawer}</Drawer>
        <Drawer variant="permanent" open sx={{ display: { xs: "none", md: "block" }, "& .MuiDrawer-paper": { width: drawerWidth } }}>{drawer}</Drawer>
      </Box>
      <Box component="main" className="main-content">
        <Toolbar className="main-toolbar-spacer" />
        <Box className="page-content"><Outlet /></Box>
      </Box>
    </Box>
  );
}
