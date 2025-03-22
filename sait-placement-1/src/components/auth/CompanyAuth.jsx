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
  Link
} from '@mui/material';
import { supabase } from '../../config/supabaseClient';
import { useNavigate } from 'react-router-dom';

const CompanyAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    companyName: '',
    password: '',
    industry: '',
    jobRequirements: 'Not specified',
    jobDescription: 'Not specified',
    location: 'Not specified',
    salaryRange: 'Not specified'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login - first find the company
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('company_name', formData.companyName)
          .single();

        if (companyError) {
          console.error('Company lookup error:', companyError);
          throw new Error('Company not found. Please check your company name.');
        }

        // Check password (you'll need to implement proper password hashing in production)
        if (formData.password !== companyData.password) {
          throw new Error('Invalid password');
        }

        navigate('/company/dashboard');
      } else {
        // Register
        console.log('Starting company registration...');
        
        // Check if company already exists
        const { data: existingCompany, error: checkError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('company_name', formData.companyName)
          .single();

        if (existingCompany) {
          throw new Error('Company already registered');
        }

        // Create new company
        const { error: insertError } = await supabase
          .from('companies')
          .insert([{
            company_name: formData.companyName,
            password: formData.password, // In production, hash this password
            industry: formData.industry,
            job_requirements: formData.jobRequirements,
            job_description: formData.jobDescription,
            location: formData.location,
            salary_range: formData.salaryRange,
            verified: false
          }]);

        if (insertError) {
          console.error('Company creation error:', insertError);
          throw insertError;
        }

        alert('Registration successful! Please wait for admin verification.');
        setIsLogin(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            {isLogin ? 'Company Login' : 'Company Registration'}
          </Typography>

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
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  helperText="Enter your registered company name"
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
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Job Requirements"
                      name="jobRequirements"
                      value={formData.jobRequirements}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Job Description"
                      name="jobDescription"
                      value={formData.jobDescription}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      label="Salary Range"
                      name="salaryRange"
                      value={formData.salaryRange}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Register')}
                </Button>
              </Grid>
            </Grid>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              color="primary"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </Button>
            <Box sx={{ mt: 1 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/')}
              >
                Back to Student Login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CompanyAuth;
