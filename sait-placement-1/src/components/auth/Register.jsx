import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Grid
} from '@mui/material';
import { supabase } from '../../config/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    student_id: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    department: '',
    year_of_study: '',
    cgpa: '',
    phone: '',
    skills: '',
    resume_url: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.student_id || !formData.email || !formData.password || 
        !formData.full_name || !formData.department || !formData.year_of_study) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (formData.cgpa && (parseFloat(formData.cgpa) < 0 || parseFloat(formData.cgpa) > 10)) {
      setError('CGPA must be between 0 and 10');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // 1. Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (signUpError) {
        if (signUpError.message.includes('security purposes')) {
          throw new Error('Please wait a minute before trying to register again');
        }
        throw signUpError;
      }

      // Convert skills string to array format for PostgreSQL
      const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()) : [];

      // 2. Create student profile
      const { error: profileError } = await supabase
        .from('students')
        .insert({
          student_id: formData.student_id,
          email: formData.email,
          full_name: formData.full_name,
          department: formData.department,
          year_of_study: parseInt(formData.year_of_study),
          cgpa: parseFloat(formData.cgpa) || null,
          phone: formData.phone,
          skills: skillsArray,
          resume_url: formData.resume_url,
          profile_submitted: false
        });

      if (profileError) throw profileError;

      alert('Registration successful! Please check your email to verify your account.');
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
      // Keep button disabled for 60 seconds after a rate limit error
      if (error.message.includes('wait')) {
        setTimeout(() => setLoading(false), 60000);
      } else {
        setLoading(false);
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', bgcolor: 'background.default' }}>
      <Container component="main" maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Button
              component={Link}
              to="/auth"
              startIcon={<ArrowBackIcon />}
              sx={{ color: 'text.secondary' }}
            >
              Back
            </Button>
            <Typography component="h1" variant="h5">
              Student Registration
            </Typography>
            <Box sx={{ width: 40 }} /> {/* Empty box for alignment */}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <Grid container spacing={2}>
              {/* Required Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Required Information</Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Student ID"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Year of Study"
                  name="year_of_study"
                  type="number"
                  value={formData.year_of_study}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 4 }}
                />
              </Grid>

              {/* Optional Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Optional Information</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="CGPA"
                  name="cgpa"
                  type="number"
                  value={formData.cgpa}
                  onChange={handleChange}
                  inputProps={{ step: 0.01, min: 0, max: 10 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  multiline
                  rows={2}
                  helperText="Enter your skills separated by commas (e.g., JavaScript, React, Node.js)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Resume URL"
                  name="resume_url"
                  value={formData.resume_url}
                  onChange={handleChange}
                  helperText="Link to your resume (Google Drive, Dropbox, etc.)"
                />
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
