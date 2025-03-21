import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Container, Paper, FormControl, InputLabel, Select, MenuItem, Avatar, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { authStyles } from '../../styles/authStyles';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'student',
    companyDetails: {
      companyName: '',
      industry: '',
      website: ''
    }
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('company.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        companyDetails: {
          ...prev.companyDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // TODO: Implement registration logic
    const dashboardPath = formData.userType === 'company' ? '/company/dashboard' : '/student/dashboard';
    navigate(dashboardPath);
  };

  return (
    <Box sx={authStyles.container}>
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={authStyles.paper}>
          <Box sx={authStyles.logo}>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56 }}>
              <PersonAddIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h4" sx={authStyles.title}>
              Create Account
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} sx={authStyles.form}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="user-type-label">I am a</InputLabel>
              <Select
                labelId="user-type-label"
                id="userType"
                name="userType"
                value={formData.userType}
                label="I am a"
                onChange={handleChange}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="company">Company</MenuItem>
              </Select>
            </FormControl>

            {formData.userType === 'company' ? (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="company.companyName"
                  label="Company Name"
                  value={formData.companyDetails.companyName}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="company.industry"
                  label="Industry"
                  value={formData.companyDetails.industry}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  name="company.website"
                  label="Company Website"
                  value={formData.companyDetails.website}
                  onChange={handleChange}
                />
              </>
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                name="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              name="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={authStyles.submitButton}
            >
              Sign Up
            </Button>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link to="/login" style={authStyles.link}>
                Already have an account? Sign In
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
