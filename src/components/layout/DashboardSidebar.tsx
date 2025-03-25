import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  People as PeopleIcon,
  Message as MessageIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';

interface DashboardSidebarProps {
  open: boolean;
  onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ open, onClose }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    const logoutUser = async () => {
      try {
        const apiClient = (await import('../../utils/api')).default;
        await apiClient.auth.logout();
        
        // Dispatch logout action to Redux
        dispatch(logout());
        
        // Redirect to login page
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
    
    logoutUser();
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
          { text: 'Events', icon: <EventIcon />, path: '/admin/events' },
          { text: 'Volunteers', icon: <PeopleIcon />, path: '/admin/volunteers' },
          { text: 'Donations', icon: <AssessmentIcon />, path: '/admin/donations' },
          { text: 'Messages', icon: <MessageIcon />, path: '/admin/messaging' },
          { text: 'Reports', icon: <AssessmentIcon />, path: '/admin/reports' },
        ];
      case 'volunteer':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/volunteer' },
          { text: 'My Events', icon: <EventIcon />, path: '/volunteer/events' },
          { text: 'My Profile', icon: <PersonIcon />, path: '/volunteer/profile' },
          { text: 'Messages', icon: <MessageIcon />, path: '/volunteer/messages' },
        ];
      case 'participant':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/participant' },
          { text: 'My Events', icon: <EventIcon />, path: '/participant/events' },
          { text: 'My Profile', icon: <PersonIcon />, path: '/participant/profile' },
          { text: 'Messages', icon: <MessageIcon />, path: '/participant/messages' },
        ];
      default:
        return [];
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 220,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 220,
          boxSizing: 'border-box',
          bgcolor: '#f5f5f5',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          pt: '64px', // Height of the AppBar
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" noWrap>
          {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)} Dashboard
        </Typography>
      </Box>
      <List>
        {getMenuItems().map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => router.push(item.path)}
              sx={{
                minHeight: 44,
                '&:hover': {
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontSize: '0.9rem',
                  fontWeight: 500
                }} 
              />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton 
            onClick={handleLogout}
            sx={{
              minHeight: 44,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                fontSize: '0.9rem',
                fontWeight: 500
              }} 
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default DashboardSidebar; 