'use client';

import React from 'react';
import { Box } from '@mui/material';

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );
} 