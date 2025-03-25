'use client';

import React from 'react';
import { Box } from '@mui/material';
import DashboardSidebar from '../../components/layout/DashboardSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <DashboardSidebar open={true} onClose={() => {}} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflowY: 'auto',
          height: '100vh',
          pt: '64px', // Account for the main navbar height
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 