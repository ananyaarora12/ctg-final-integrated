'use client';

import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout/Layout';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import Link from 'next/link';

export default function AdminRegistrationPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [accessCode, setAccessCode] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate admin access code (for demo, we're using "admin123")
    if (accessCode !== 'admin123') {
      setError('Invalid admin access code');
      return;
    }
    
    setLoading(true);
    
    try {
      // For demo purposes, simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create admin user data
      const userData = {
        role: 'admin',
        name,
        email,
        password,
        department,
        position,
        accessCode
      };
      
      console.log('Admin Registration data:', userData);
      
      // If registration is successful, show success message
      setRegisterSuccess(true);
      
      // Optional: Auto-login after successful registration
      // dispatch(login({
      //   uid: '123456',
      //   email,
      //   displayName: name,
      //   role: 'admin',
      //   photoURL: ''
      // }));
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setDepartment('');
      setPosition('');
      setAccessCode('');
      
      // In a real app, you might redirect to the admin dashboard after a delay
      // setTimeout(() => router.push('/admin'), 2000);
      
    } catch (err) {
      setError('Failed to create admin account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3 }}>
            <Typography variant="h5" component="h1" align="center">
              Admin Registration
            </Typography>
          </Box>
          
          <Box sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {registerSuccess && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Admin registration successful! Please wait for account verification.
              </Alert>
            )}
            
            <Typography variant="body1" color="text.secondary" paragraph align="center">
              Create an administrator account with appropriate permissions.
              This requires a special access code provided by system owners.
            </Typography>
            
            <form onSubmit={handleRegister}>
              <TextField
                label="Full Name"
                type="text"
                fullWidth
                margin="normal"
                variant="outlined"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                margin="normal"
                variant="outlined"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Administrator Information
                </Typography>
              </Divider>
              
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  label="Department"
                  required
                >
                  <MenuItem value="operations">Operations</MenuItem>
                  <MenuItem value="it">Information Technology</MenuItem>
                  <MenuItem value="events">Event Management</MenuItem>
                  <MenuItem value="volunteer">Volunteer Coordination</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="communications">Communications</MenuItem>
                </Select>
                <FormHelperText>Select your department</FormHelperText>
              </FormControl>
              
              <TextField
                label="Position/Title"
                type="text"
                fullWidth
                margin="normal"
                variant="outlined"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Program Manager, IT Director"
              />
              
              <TextField
                label="Admin Access Code"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                variant="outlined"
                required
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                helperText="Enter the special code provided by system administrators"
              />
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
                Admin accounts require approval. You may need to wait for verification
                before accessing admin features.
              </Typography>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ mb: 2 }}
              >
                {loading ? 'Creating account...' : 'Register as Administrator'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2">
                  Already have an account?{' '}
                  <Link href="/login">
                    Login here
                  </Link>
                </Typography>
              </Box>
            </form>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
} 