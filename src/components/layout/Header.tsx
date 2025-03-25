'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Container,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { RootState } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import { THEME_COLORS } from './Layout';
import { useRouter } from 'next/navigation';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Events', path: '/events' },
  { name: 'Calendar', path: '/calendar' },
  { name: 'Leaderboard', path: '/leaderboard' },
  { name: 'Donate', path: '/donate' },
];

const Header = () => {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  
  const isOrganizer = user?.role === 'admin';
  
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };
  
  const handleLogout = () => {
    const logoutUser = async () => {
      try {
        const apiClient = (await import('../../utils/api')).default;
        await apiClient.auth.logout();
        
        // Dispatch logout action to Redux
        dispatch(logout());
        
        handleUserMenuClose();
        handleProfileMenuClose();
        
        // Redirect to login page
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };
    
    logoutUser();
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
        <img 
          src="/images/samarthanam-logo.png" 
          alt="Samarthanam Logo" 
          style={{ width: '180px', height: '60px', objectFit: 'contain' }}
        />
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} disablePadding>
            <ListItemButton
              component={Link}
              href={item.path}
              selected={pathname === item.path}
              sx={{
                textAlign: 'center',
                color: pathname === item.path ? THEME_COLORS.orange : THEME_COLORS.offBlack,
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: THEME_COLORS.orange,
                  backgroundColor: `${THEME_COLORS.offWhiteGrey}`,
                },
              }}
            >
              <ListItemText primary={item.name} />
            </ListItemButton>
          </ListItem>
        ))}
        
        {isAuthenticated ? (
          <>
            {isOrganizer && (
              <ListItem disablePadding>
                <ListItemButton 
                  component={Link} 
                  href="/events/create"
                  sx={{ 
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: THEME_COLORS.orange,
                      backgroundColor: `${THEME_COLORS.offWhiteGrey}`,
                    },
                  }}
                >
                  <ListItemText primary="Create Event" />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem disablePadding>
              <ListItemButton 
                component={Link} 
                href={user?.role === 'admin' ? '/admin' : user?.role === 'volunteer' ? '/volunteer' : '/profile'}
                sx={{ 
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: THEME_COLORS.orange,
                    backgroundColor: `${THEME_COLORS.offWhiteGrey}`,
                  },
                }}
              >
                <ListItemText primary={user?.role === 'admin' ? "Admin Dashboard" : "My Profile"} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={handleLogout}
                sx={{ 
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: THEME_COLORS.orange,
                    backgroundColor: `${THEME_COLORS.offWhiteGrey}`,
                  },
                }}
              >
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              href="/login"
              sx={{ 
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  color: THEME_COLORS.orange,
                  backgroundColor: `${THEME_COLORS.offWhiteGrey}`,
                },
              }}
            >
              <ListItemText primary="Login" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="sticky" elevation={1} sx={{ 
        backgroundColor: THEME_COLORS.white, 
        color: THEME_COLORS.offBlack,
        borderBottom: `1px solid ${THEME_COLORS.offWhiteGrey}`
      }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ display: { sm: 'none' }, color: THEME_COLORS.offBlack }}
            >
              <MenuIcon />
            </IconButton>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                  <img 
                    src="/images/samarthanam-logo.png" 
                    alt="Samarthanam Logo" 
                    style={{ width: '140px', height: '50px', objectFit: 'contain' }}
                  />
                </Link>
              </Box>
              
              <Typography
                variant="h6"
                noWrap
                component={Link}
                href="/"
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  fontWeight: 700,
                  color: THEME_COLORS.offBlack,
                  textDecoration: 'none',
                }}
              >
                SAMARTHANAM
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                {navItems.map((item) => (
                  <Button 
                    key={item.name} 
                    component={Link}
                    href={item.path}
                    sx={{ 
                      color: THEME_COLORS.offBlack,
                      mx: 1,
                      position: 'relative',
                      fontWeight: 500,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        color: THEME_COLORS.orange,
                        backgroundColor: 'transparent',
                      },
                      '&::after': pathname === item.path ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '50%',
                        height: '2px',
                        backgroundColor: THEME_COLORS.orange,
                      } : {}
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
                
                {isAuthenticated && isOrganizer && (
                  <Button 
                    component={Link}
                    href="/events/create"
                    variant="contained"
                    sx={{
                      backgroundColor: THEME_COLORS.orange,
                      color: THEME_COLORS.white,
                      borderRadius: '4px',
                      mr: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: '#e66000',
                      },
                    }}
                    startIcon={<AddCircleOutlineIcon />}
                  >
                    Create Event
                  </Button>
                )}
                
                {!isAuthenticated && (
                  <Button 
                    component={Link}
                    href="/login"
                    variant="contained"
                    sx={{ 
                      backgroundColor: THEME_COLORS.offBlack,
                      color: THEME_COLORS.orange,
                      ml: 2,
                      fontWeight: 600,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: THEME_COLORS.orange,
                        color: THEME_COLORS.white,
                      }
                    }}
                  >
                    Login
                  </Button>
                )}

                {isAuthenticated && (
                  <Button
                    component={Link}
                    href={user?.role === 'admin' ? '/admin' : user?.role === 'volunteer' ? '/volunteer' : '/profile'}
                    variant="outlined"
                    sx={{
                      color: THEME_COLORS.offBlack,
                      borderColor: THEME_COLORS.offWhiteGrey,
                      borderRadius: '4px',
                      textTransform: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: THEME_COLORS.offWhiteGrey,
                        borderColor: THEME_COLORS.offBlack,
                      },
                    }}
                  >
                    {user?.role === 'admin' ? "Admin Dashboard" : "My Profile"}
                  </Button>
                )}
              </Box>
              
              {isAuthenticated ? (
                <>
                  <Menu
                    anchorEl={profileMenuAnchor}
                    open={Boolean(profileMenuAnchor)}
                    onClose={handleProfileMenuClose}
                  >
                    <MenuItem onClick={() => {
                      handleProfileMenuClose();
                      router.push(user?.role === 'admin' ? '/admin' : user?.role === 'volunteer' ? '/volunteer' : '/profile');
                    }}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>My Profile</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => {
                      handleProfileMenuClose();
                      handleLogout();
                    }}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              ) : null}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
};

export default Header; 