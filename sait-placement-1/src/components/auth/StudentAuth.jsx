import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Grid,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { supabase } from '../../config/supabaseClient';
import { useNavigate } from 'react-router-dom';

const StudentAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    studentId: '',
    companyName: '',
    industry: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserTypeChange = (event, newType) => {
    if (newType !== null) {
      setUserType(newType);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        console.log('Attempting login...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error('Login error:', error);
          throw error;
        }

        console.log('Login successful:', data);

        // Check user type in database
        if (userType === 'student') {
          const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('email', formData.email)
            .single();
            
          if (studentError) {
            console.error('Student profile error:', studentError);
            throw new Error('Error accessing student profile');
          }
          
          navigate('/student/dashboard');
        } else {
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('*')
            .eq('email', formData.email)
            .single();
            
          if (companyError) {
            console.error('Company profile error:', companyError);
            throw new Error('Error accessing company profile');
          }
          
          navigate('/company/dashboard');
        }
      } else {
        // Register
        console.log('Attempting registration...');
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (signUpError) {
          console.error('Registration error:', signUpError);
          throw signUpError;
        }

        if (userType === 'student') {
          const { error: profileError } = await supabase
            .from('students')
            .insert({
              student_id: formData.studentId,
              email: formData.email,
              full_name: formData.fullName
            });

          if (profileError) {
            console.error('Student profile creation error:', profileError);
            throw profileError;
          }
          alert('Registration successful! Please verify your email.');
        } else {
          const { error: profileError } = await supabase
            .from('companies')
            .insert({
              email: formData.email,
              company_name: formData.companyName,
              industry: formData.industry,
              verified: false
            });

          if (profileError) {
            console.error('Company profile creation error:', profileError);
            throw profileError;
          }
          alert('Registration successful! Please wait for admin verification.');
        }
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      if (error.message === 'Failed to fetch') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(error.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            SAIT Placement Portal
          </Typography>

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={userType}
              exclusive
              onChange={handleUserTypeChange}
              aria-label="user type"
            >
              <ToggleButton value="student" aria-label="student">
                Student
              </ToggleButton>
              <ToggleButton value="company" aria-label="company">
                Company
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>

              {!isLogin && (
                <>
                  {userType === 'student' ? (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Full Name"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Student ID"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleChange}
                        />
                      </Grid>
                    </>
                  ) : (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Company Name"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          label="Industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                        />
                      </Grid>
                    </>
                  )}
                </>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading
                    ? 'Please wait...'
                    : isLogin
                    ? 'Sign In'
                    : 'Register'}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              color="primary"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin
                ? "Don't have an account? Register"
                : 'Already have an account? Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentAuth;
