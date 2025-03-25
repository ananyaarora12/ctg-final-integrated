'use client';

import React, { useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { format } from 'date-fns';
import { THEME_COLORS } from '../layout/Layout';

interface VolunteerCertificateProps {
  open: boolean;
  onClose: () => void;
  eventData: {
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    organizerName: string;
    category: string;
    id: string;
  };
  userData: {
    name: string;
    email: string;
    volunteerHours?: number;
  };
  certificateType: 'volunteer' | 'participant';
}

const VolunteerCertificate: React.FC<VolunteerCertificateProps> = ({
  open,
  onClose,
  eventData,
  userData,
  certificateType,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = React.useState(false);
  const [emailSending, setEmailSending] = React.useState(false);
  const [emailSuccess, setEmailSuccess] = React.useState(false);

  const startDate = eventData.startDate ? new Date(eventData.startDate) : new Date();
  const formattedStartDate = format(startDate, 'MMMM d, yyyy');

  // Calculate volunteer hours if not provided directly
  const volunteerHours = userData.volunteerHours || 
    (eventData.startDate && eventData.endDate 
      ? Math.ceil((new Date(eventData.endDate).getTime() - new Date(eventData.startDate).getTime()) / (1000 * 60 * 60))
      : 4);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    setDownloading(true);
    
    try {
      // In a real implementation, we would use html2canvas and jsPDF
      // For now, we'll just simulate the download
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Certificate downloaded:', {
        eventData,
        userData,
        certificateType,
      });
      
      // Mock download
      const fileName = `${certificateType}_certificate_${eventData.title.replace(/\s+/g, '_')}.pdf`;
      console.log('File would be saved as:', fileName);
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
    } finally {
      setDownloading(false);
    }
  };

  const handleSendByEmail = async () => {
    setEmailSending(true);
    
    // Simulate API call to send email
    try {
      // In a real app, this would be an API call to send the certificate by email
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Certificate email sent to:', userData.email, {
        eventData,
        userData,
        certificateType
      });
      
      setEmailSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setEmailSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending certificate by email:', error);
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="certificate-dialog-title"
    >
      <DialogTitle id="certificate-dialog-title" sx={{ m: 0, p: 2 }}>
        {certificateType === 'volunteer' ? 'Volunteer Certificate' : 'Participation Certificate'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ width: '100%', mb: 2 }}>
          <Paper 
            elevation={3}
            ref={certificateRef}
            sx={{
              width: '100%',
              aspectRatio: '1.414 / 1', // A4 ratio in landscape
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.95)),
                url('/images/certificate-bg.png')
              `, // You'll need to create this background image
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `
                  radial-gradient(circle at 10% 10%, ${THEME_COLORS.orange}15, transparent 30%),
                  radial-gradient(circle at 90% 90%, ${THEME_COLORS.orange}15, transparent 30%)
                `,
                pointerEvents: 'none',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
                border: `2px solid ${THEME_COLORS.orange}30`,
                borderRadius: 1,
                pointerEvents: 'none',
              },
            }}
          >
            <Box 
              component="img" 
              src="/images/samarthanam-logo.png" 
              alt="Samarthanam Logo"
              sx={{ 
                width: 180, 
                height: 'auto', 
                alignSelf: 'center',
                mb: 3,
                mt: 2,
              }}
            />
            
            <Typography 
              variant="h4" 
              component="h2" 
              align="center" 
              gutterBottom 
              sx={{ 
                color: THEME_COLORS.offBlack,
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: 2,
              }}
            >
              {certificateType === 'volunteer' ? 'Certificate of Volunteering' : 'Certificate of Participation'}
            </Typography>
            
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ 
                mb: 4,
                fontStyle: 'italic',
                color: 'text.secondary',
              }}
            >
              This is to certify that
            </Typography>
            
            <Typography 
              variant="h3" 
              align="center" 
              sx={{ 
                fontFamily: 'cursive',
                color: THEME_COLORS.orange,
                mb: 4,
              }}
            >
              {userData.name}
            </Typography>
            
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ mb: 3, maxWidth: '80%', mx: 'auto' }}
            >
              has {certificateType === 'volunteer' ? 'volunteered' : 'participated'} at the event
              "<strong>{eventData.title}</strong>" organized by Samarthanam Trust for the Disabled
              {certificateType === 'volunteer' ? ` and contributed ${volunteerHours} hours of service` : ''}.
            </Typography>
            
            <Typography variant="body2" align="center" sx={{ mb: 1 }}>
              Event Date: {formattedStartDate}
            </Typography>
            
            <Typography variant="body2" align="center" sx={{ mb: 3 }}>
              Location: {eventData.location}
            </Typography>
            
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', pt: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Box 
                  component="img" 
                  src="/images/signature.png" 
                  alt="Signature"
                  sx={{ 
                    width: 120, 
                    height: 'auto', 
                    mb: 1,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Event Organizer
                </Typography>
                <Typography variant="body2">
                  {eventData.organizerName || 'Samarthanam Trust'}
                </Typography>
              </Box>
              
              <Box 
                component="img" 
                src="/images/certificate-seal.png" 
                alt="Official Seal"
                sx={{ 
                  width: 100, 
                  height: 100,
                  objectFit: 'contain',
                }}
              />
              
              <Box sx={{ textAlign: 'center' }}>
                <Box 
                  component="img" 
                  src="/images/director-signature.png" 
                  alt="Director Signature"
                  sx={{ 
                    width: 120, 
                    height: 'auto', 
                    mb: 1,
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  Director
                </Typography>
                <Typography variant="body2">
                  Samarthanam Trust
                </Typography>
              </Box>
            </Box>
            
            {/* Certificate ID for verification */}
            <Typography 
              variant="caption" 
              align="center" 
              sx={{ 
                mt: 4,
                color: 'text.secondary',
              }}
            >
              Certificate ID: {eventData.id}-{certificateType}-{userData.name.replace(/\s+/g, '-').toLowerCase()}
            </Typography>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={downloading}
          sx={{ 
            mr: 2,
            bgcolor: THEME_COLORS.orange,
            '&:hover': {
              bgcolor: THEME_COLORS.offBlack,
            }
          }}
        >
          {downloading ? <CircularProgress size={24} /> : 'Download Certificate'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<EmailIcon />}
          onClick={handleSendByEmail}
          disabled={emailSending}
          sx={{ 
            borderColor: THEME_COLORS.orange,
            color: THEME_COLORS.orange,
            '&:hover': {
              borderColor: THEME_COLORS.offBlack,
              color: THEME_COLORS.offBlack,
            }
          }}
        >
          {emailSending ? (
            <CircularProgress size={24} />
          ) : emailSuccess ? (
            'Email Sent!'
          ) : (
            'Send to Email'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VolunteerCertificate; 