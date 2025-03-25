'use client';

import React from 'react';
import { Box, Container, Typography, Grid, Paper, Avatar } from '@mui/material';

interface TestimonialProps {
  quote: string;
  name: string;
  title: string;
  image?: string;
}

const TestimonialCard = ({ quote, name, title, image }: TestimonialProps) => {
  // Extract initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 2,
      }}
    >
      <Avatar
        src={image}
        alt={name}
        sx={{
          width: 80,
          height: 80,
          mb: 2,
          border: '2px solid #e0e0e0',
          backgroundColor: image ? 'transparent' : '#0046BE',
          color: 'white',
          fontSize: '1.5rem',
          fontWeight: 'bold',
        }}
      >
        {getInitials(name)}
      </Avatar>
      <Typography
        variant="body1"
        align="center"
        sx={{
          fontStyle: 'italic',
          mb: 3,
          fontSize: '1.1rem',
          lineHeight: 1.6,
        }}
      >
        "{quote}"
      </Typography>
      <Box mt="auto">
        <Typography
          variant="h6"
          align="center"
          sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}
        >
          {name}
        </Typography>
        <Typography
          variant="body2"
          align="center"
          sx={{ color: 'text.secondary', fontSize: '1rem' }}
        >
          {title}
        </Typography>
      </Box>
    </Paper>
  );
};

const Testimonials = () => {
  return (
    <Box sx={{ py: 8, backgroundColor: 'white' }}>
      <Container maxWidth="lg">
        <Typography
          variant="h2"
          align="center"
          sx={{ 
            mb: 6, 
            fontWeight: 'bold',
            color: '#333333',
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}
        >
          What People Say
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <TestimonialCard
              quote="I believe in building a society where people with disabilities are potential tax-payers but not dole recipients."
              name="Dr. Mahantesh G Kivadasannavar"
              title="Founder Chairman - Samarthanam International"
              image="/images/founder.jpg"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TestimonialCard
              quote="Samarthanam has provided me opportunities to gain new skills that have transformed my life. I'm now more confident and independent."
              name="Sai Prasanna"
              title="Program Beneficiary"
              image="/images/sports.jpg" // Using an existing image as placeholder
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Testimonials; 