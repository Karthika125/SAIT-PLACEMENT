import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, Link, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authStyles } from '../../styles/authStyles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Avatar from '@mui/material/Avatar';

const Login = () => {
  const [credentials, setCredentials] = useState({ 
    email: '', 
    password: '',
    userType: 'student' 
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement authentication logic
    const dashboardPath = credentials.userType === 'company' 
      ? '/company/dashboard' 
      : '/student/dashboard';
    navigate(dashboardPath);
  };

  return (
    <Box sx={authStyles.container}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={authStyles.paper}>
          <Box sx={authStyles.logo}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h4" sx={authStyles.title}>
              Welcome Back
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={authStyles.form}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={handleChange}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="user-type-label">I am a</InputLabel>
              <Select
                labelId="user-type-label"
                id="userType"
                name="userType"
                value={credentials.userType}
                label="I am a"
                onChange={handleChange}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="company">Company</MenuItem>
              </Select>
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={authStyles.submit}
            >
              Sign In
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/register" style={authStyles.link}>
                Don't have an account? Sign Up
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
