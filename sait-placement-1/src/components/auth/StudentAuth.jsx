import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { registerStudent, loginStudent } from '../../services/studentService';
import { useNavigate } from 'react-router-dom';

const StudentAuth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    student_id: '',
    email: '',
    password: '',
    full_name: '',
    department: '',
    year_of_study: '',
    cgpa: '',
    phone: ''
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical'
  ];

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!registerForm.student_id || !registerForm.email || !registerForm.password) {
        throw new Error('Please fill in all required fields');
      }

      if (registerForm.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('Registering student:', registerForm); // Debug log
      const { data, error } = await registerStudent(registerForm);
      console.log('Registration response:', { data, error }); // Debug log

      if (error) throw error;

      // Registration successful
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Registration error:', error); // Debug log
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Logging in with:', loginForm); // Debug log
      const { data, error } = await loginStudent(loginForm.email, loginForm.password);
      console.log('Login response:', { data, error }); // Debug log

      if (error) throw error;

      // Login successful
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Login error:', error); // Debug log
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%', m: 2 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Student Portal
          </Typography>

          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            centered
            sx={{ mb: 3 }}
          >
            <Tab label="Login" />
            <Tab label="Register" />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          {activeTab === 0 && (
            <form onSubmit={handleLoginSubmit}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
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
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Login'}
              </Button>
            </form>
          )}

          {/* Registration Form */}
          {activeTab === 1 && (
            <form onSubmit={handleRegisterSubmit}>
              <TextField
                label="Student ID"
                fullWidth
                margin="normal"
                value={registerForm.student_id}
                onChange={(e) => setRegisterForm({ ...registerForm, student_id: e.target.value })}
                required
                helperText="Enter your SAIT student ID"
              />
              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                value={registerForm.full_name}
                onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                required
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
                helperText="Minimum 6 characters"
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
              <FormControl fullWidth margin="normal">
                <InputLabel>Department</InputLabel>
                <Select
                  value={registerForm.department}
                  onChange={(e) => setRegisterForm({ ...registerForm, department: e.target.value })}
                  required
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                <InputLabel>Year of Study</InputLabel>
                <Select
                  value={registerForm.year_of_study}
                  onChange={(e) => setRegisterForm({ ...registerForm, year_of_study: e.target.value })}
                  required
                >
                  {[1, 2, 3, 4].map((year) => (
                    <MenuItem key={year} value={year}>
                      Year {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="CGPA"
                type="number"
                fullWidth
                margin="normal"
                value={registerForm.cgpa}
                onChange={(e) => setRegisterForm({ ...registerForm, cgpa: e.target.value })}
                required
                inputProps={{ step: "0.01", min: "0", max: "10" }}
              />
              <TextField
                label="Phone Number"
                fullWidth
                margin="normal"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                required
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StudentAuth;
