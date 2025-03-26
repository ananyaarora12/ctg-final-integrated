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
  Link as MuiLink,
  Alert,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Google, Facebook } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Layout from '../../components/layout/Layout';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/slices/authSlice';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [role, setRole] = useState('participant');
  
  // Additional fields for volunteer
  const [skills, setSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');
  const [bio, setBio] = useState('');
  
  // Additional fields for participant
  const [age, setAge] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Registration tab selection
  const [registrationTabValue, setRegistrationTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setRegisterSuccess(false);
  };
  
  const handleRegistrationTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setRegistrationTabValue(newValue);
    setError(null);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    axios.post("http://localhost:5000/auth/login", {
      email : "arora.anaya05@gmail.com" }
    )
    
    try {
      const apiClient = (await import('../../utils/api')).default;
      
      // Call the actual login API endpoint
      const response = await apiClient.auth.login({
        email,
        password
      });
      
      const { user, token } = response.data;
      
      // Save the token to localStorage
      localStorage.setItem('token', token);
      
      // Update Redux state
      dispatch(login({
        uid: user.id,
        email: user.email,
        displayName: user.name,
        role: user.role as 'participant' | 'volunteer' | 'admin',
        profileImage: user.profile?.photo_url || ''
      }));
      
      // Redirect based on role
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'volunteer') {
        router.push('/volunteer');
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Check for specific error responses
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    axios.post("http://localhost:5000/auth/login", {
      email : "arora.anaya05@gmail.com" }
    )
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const apiClient = (await import('../../utils/api')).default;
      
      // Create user data based on selected role
      const userData = {
        name,
        email,
        password,
        role,
      };
      
      // Call the actual registration API endpoint
      const response = await apiClient.auth.register(userData);
      
      const { user, token } = response.data;
      
      // Save the token to localStorage
      localStorage.setItem('token', token);
      
      // Show success message
      setRegisterSuccess(true);
      
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('participant');
      
      // Switch to login tab after successful registration
      setTimeout(() => {
        setTabValue(0);
      }, 3000);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      // Check for specific error responses
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleGoogleLogin = () => {
    // In a real app, you would implement OAuth login with Google
    console.log('Google login');
  };
  
  const handleFacebookLogin = () => {
    // In a real app, you would implement OAuth login with Facebook
    console.log('Facebook login');
  };
  
  return (
    <Layout>
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>
          
          <Box sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {registerSuccess && tabValue === 1 && (
              <Alert severity="success" sx={{ mb: 3 }}>
                Registration successful! Please check your email to verify your account.
              </Alert>
            )}
            
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h5" component="h1" gutterBottom align="center">
                Welcome Back
              </Typography>
              
              <form onSubmit={handleLogin}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  variant="outlined"
                />
                
                <TextField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  variant="outlined"
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
                    )
                  }}
                />
                
                {/* Role selector for demo purposes */}
                <FormControl fullWidth margin="normal">
                  <InputLabel id="role-select-label">Login As (Demo)</InputLabel>
                  <Select
                    labelId="role-select-label"
                    id="role-select"
                    value={role}
                    label="Login As (Demo)"
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <MenuItem value="participant">Participant</MenuItem>
                    <MenuItem value="volunteer">Volunteer</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                  <FormHelperText>For demonstration purposes only</FormHelperText>
                </FormControl>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <MuiLink component="button" variant="body2" onClick={() => {}}>
                    Forgot password?
                  </MuiLink>
                </Box>
              </form>
              
              <Divider sx={{ my: 3 }}>OR</Divider>
              
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<Google />}
                onClick={handleGoogleLogin}
                sx={{ mb: 2 }}
              >
                Continue with Google
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<Facebook />}
                onClick={handleFacebookLogin}
              >
                Continue with Facebook
              </Button>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Tabs
                value={registrationTabValue}
                onChange={handleRegistrationTabChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label="Register as Participant" />
                <Tab label="Register as Volunteer" />
              </Tabs>
              
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Looking to register as an administrator?{' '}
                  <Link href="/admin-register" style={{ textDecoration: 'none' }}>
                    <Typography component="span" color="primary" sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
                      Admin Registration
                    </Typography>
                  </Link>
                </Typography>
              </Box>

              <TabPanel value={registrationTabValue} index={0}>
                <Typography variant="h5" component="h1" gutterBottom align="center">
                  Participant Registration
                </Typography>
                
                <Box component="form" onSubmit={handleRegister} sx={{ mt: 3 }}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={role}
                      label="Role"
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <MenuItem value="participant">Participant</MenuItem>
                      <MenuItem value="volunteer">Volunteer</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
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
                    margin="normal"
                    required
                    fullWidth
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Register'}
                  </Button>
                </Box>
              </TabPanel>
              
              <TabPanel value={registrationTabValue} index={1}>
                <Typography variant="h5" component="h1" gutterBottom align="center">
                  Volunteer Registration
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
                      Volunteer Information
                    </Typography>
                  </Divider>
                  
                  <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel id="skills-label">Select Skills</InputLabel>
                    <Select
                      labelId="skills-label"
                      multiple
                      value={skills}
                      onChange={(e) => setSkills(typeof e.target.value === 'string' ? [e.target.value] : e.target.value)}
                      label="Select Skills"
                      renderValue={(selected) => (selected as string[]).join(', ')}
                    >
                      <MenuItem value="teaching">Teaching</MenuItem>
                      <MenuItem value="event_planning">Event Planning</MenuItem>
                      <MenuItem value="first_aid">First Aid</MenuItem>
                      <MenuItem value="fundraising">Fundraising</MenuItem>
                      <MenuItem value="translation">Translation</MenuItem>
                      <MenuItem value="tech_support">Tech Support</MenuItem>
                      <MenuItem value="counseling">Counseling</MenuItem>
                      <MenuItem value="photography">Photography</MenuItem>
                    </Select>
                    <FormHelperText>Select the skills you can offer</FormHelperText>
                  </FormControl>
                  
                  <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel id="availability-label">Availability</InputLabel>
                    <Select
                      labelId="availability-label"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      label="Availability"
                    >
                      <MenuItem value="weekends">Weekends Only</MenuItem>
                      <MenuItem value="weekdays">Weekdays Only</MenuItem>
                      <MenuItem value="evenings">Evenings Only</MenuItem>
                      <MenuItem value="flexible">Flexible</MenuItem>
                    </Select>
                    <FormHelperText>When are you available to volunteer?</FormHelperText>
                  </FormControl>
                  
                  <TextField
                    label="Short Bio"
                    multiline
                    rows={3}
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us a little about yourself and why you want to volunteer"
                  />
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
                    By registering, you agree to our{' '}
                    <MuiLink component={Link} href="/terms">
                      Terms of Service
                    </MuiLink>{' '}
                    and{' '}
                    <MuiLink component={Link} href="/privacy">
                      Privacy Policy
                    </MuiLink>
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
                    {loading ? 'Creating account...' : 'Register as Volunteer'}
                  </Button>
                </form>
              </TabPanel>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<Google />}
                  onClick={handleGoogleLogin}
                >
                  Continue with Google
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<Facebook />}
                  onClick={handleFacebookLogin}
                >
                  Continue with Facebook
                </Button>
              </Box>
            </TabPanel>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
} 