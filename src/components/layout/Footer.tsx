'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Box, 
  Container, 
  Typography, 
  Stack,
  IconButton,
  Divider,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { THEME_COLORS } from './Layout';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        backgroundColor: THEME_COLORS.offBlack,
        color: THEME_COLORS.white,
      }}
    >
      {/* Main navigation */}
      <Container maxWidth={false}>
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 3,
          }}
        >
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 2, md: 4 }}
            alignItems="center"
          >
            <Link href="/about" passHref>
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: THEME_COLORS.orange,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                About Us
              </Typography>
            </Link>
            <Link href="/initiatives" passHref>
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: THEME_COLORS.orange,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                Our Initiatives
              </Typography>
            </Link>
            <Link href="/events" passHref>
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: THEME_COLORS.orange,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                Events
              </Typography>
            </Link>
            <Link href="/volunteer" passHref>
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: THEME_COLORS.orange,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                Volunteer
              </Typography>
            </Link>
            <Link href="/donate" passHref>
              <Typography 
                component="span" 
                sx={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    color: THEME_COLORS.orange,
                    transform: 'scale(1.1)',
                  },
                }}
              >
                Donate
              </Typography>
            </Link>
          </Stack>
        </Box>
        
        {/* Contact information */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'center', alignItems: 'center', gap: { xs: 2, md: 6 }, py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ color: THEME_COLORS.orange, fontSize: '1.5rem' }} />
            <Link href="mailto:info@samarthanam.org" passHref>
              <Typography
                component="span"
                sx={{
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    textDecoration: 'underline',
                    color: THEME_COLORS.orange,
                    transform: 'scale(1.05)',
                  },
                }}
              >
                info@samarthanam.org
              </Typography>
            </Link>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneIcon sx={{ color: THEME_COLORS.orange, fontSize: '1.5rem' }} />
            <Link href="tel:+918023545555" passHref>
              <Typography
                component="span"
                sx={{
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    textDecoration: 'underline',
                    color: THEME_COLORS.orange,
                    transform: 'scale(1.05)',
                  },
                }}
              >
                +91 80 2354 5555
              </Typography>
            </Link>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOnIcon sx={{ color: THEME_COLORS.orange, fontSize: '1.5rem' }} />
            <Link 
              href="https://maps.google.com/?q=CA: 39, 16th Main Road, 15th Cross Rd, Sector 4, HSR Layout, Bengaluru" 
              target="_blank"
              passHref
            >
              <Typography
                component="span"
                sx={{
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    textDecoration: 'underline',
                    color: THEME_COLORS.orange,
                    transform: 'scale(1.05)',
                  },
                }}
              >
                CA: 39, 16th Main Road, 15th Cross Rd, Sector 4, HSR Layout, Bengaluru
              </Typography>
            </Link>
          </Box>
        </Box>
        
        {/* Social media */}
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <Link href="https://facebook.com/samarthanamtrust" target="_blank" passHref>
            <IconButton 
              sx={{ 
                color: THEME_COLORS.white, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                mx: 1,
                fontSize: '1.5rem',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  bgcolor: THEME_COLORS.orange,
                  transform: 'scale(1.15)',
                }
              }}
              aria-label="Facebook"
            >
              <FacebookIcon fontSize="inherit" />
            </IconButton>
          </Link>
          
          <Link href="https://twitter.com/samarthanamtrust" target="_blank" passHref>
            <IconButton 
              sx={{ 
                color: THEME_COLORS.white, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                mx: 1,
                fontSize: '1.5rem',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  bgcolor: THEME_COLORS.orange,
                  transform: 'scale(1.15)',
                }
              }}
              aria-label="Twitter"
            >
              <TwitterIcon fontSize="inherit" />
            </IconButton>
          </Link>
          
          <Link href="https://instagram.com/samarthanamtrust" target="_blank" passHref>
            <IconButton 
              sx={{ 
                color: THEME_COLORS.white, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                mx: 1,
                fontSize: '1.5rem',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  bgcolor: THEME_COLORS.orange,
                  transform: 'scale(1.15)',
                }
              }}
              aria-label="Instagram"
            >
              <InstagramIcon fontSize="inherit" />
            </IconButton>
          </Link>
          
          <Link href="https://linkedin.com/company/samarthanam-trust-for-the-disabled" target="_blank" passHref>
            <IconButton 
              sx={{ 
                color: THEME_COLORS.white, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                mx: 1,
                fontSize: '1.5rem',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  bgcolor: THEME_COLORS.orange,
                  transform: 'scale(1.15)',
                }
              }}
              aria-label="LinkedIn"
            >
              <LinkedInIcon fontSize="inherit" />
            </IconButton>
          </Link>
          
          <Link href="https://youtube.com/user/samarthanamtrust" target="_blank" passHref>
            <IconButton 
              sx={{ 
                color: THEME_COLORS.white, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                mx: 1,
                fontSize: '1.5rem',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  bgcolor: THEME_COLORS.orange,
                  transform: 'scale(1.15)',
                }
              }}
              aria-label="YouTube"
            >
              <YouTubeIcon fontSize="inherit" />
            </IconButton>
          </Link>
        </Box>
        
        <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        {/* Copyright */}
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" sx={{ fontSize: '1rem', color: THEME_COLORS.offWhiteGrey }}>
            © 2025 Samarthanam Trust for the Disabled
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 