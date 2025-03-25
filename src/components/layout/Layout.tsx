'use client';

import React from 'react';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import Testimonials from '../testimonials/Testimonials';
import AccessibilityWidget from '../accessibility/AccessibilityWidget';

// Theme colors for consistent application design
export const THEME_COLORS = {
  white: '#FFFFFF',
  offBlack: '#333333',
  orange: '#FF7A30',
  offWhiteGrey: '#F5F5F5'
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <Header />
      <Box component="main" id="main-content" sx={{ flexGrow: 1 }}>
        {children}
      </Box>
      {isHomePage && <Testimonials />}
      <Footer />
      
      {/* Accessibility Widget */}
      <AccessibilityWidget />
    </Box>
  );
};

export default Layout; 