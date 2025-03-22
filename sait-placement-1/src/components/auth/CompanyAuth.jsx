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
    company_name: '',
    industry: '',
    job_requirements: '',
    job_description: '',
    location: '',
    salary_range: '',
    email: '',
    phone: ''
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
        // Login - check if company exists
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('company_name', formData.company_name)
          .maybeSingle();

        if (companyError) {
          console.error('Login error:', companyError);
          throw new Error('Error checking company. Please try again.');
        }

        if (!company) {
          throw new Error('Company not found. Please check your company name or register as a new company.');
        }

        // Store company info in localStorage for persistence
        localStorage.setItem('companyData', JSON.stringify(company));
        
        // Force navigation after setting localStorage
        window.location.href = '/company/dashboard';
        return;
      } else {
        // Validate required fields
        if (!formData.company_name || !formData.industry) {
          throw new Error('Company name and industry are required');
        }

        // Register - first check if company already exists
        const { data: existingCompany, error: checkError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('company_name', formData.company_name)
          .maybeSingle();

        if (checkError) {
          console.error('Check error:', checkError);
          throw new Error('Error checking company. Please try again.');
        }

        if (existingCompany) {
          throw new Error('Company already registered. Please use the login option.');
        }

        // Create new company profile
        const { data: newCompany, error: insertError } = await supabase
          .from('companies')
          .insert([{
            company_name: formData.company_name,
            industry: formData.industry,
            job_requirements: formData.job_requirements || null,
            job_description: formData.job_description || null,
            location: formData.location || null,
            salary_range: formData.salary_range || null,
            email: formData.email || null,
            phone: formData.phone || null,
            verified: true
          }])
          .select()
          .single();

        if (insertError) {
          console.error('Company creation error:', insertError);
          throw new Error('Error creating company profile. Please try again.');
        }

        if (!newCompany) {
          throw new Error('Failed to create company profile. Please try again.');
        }

        // Store company info in localStorage
        localStorage.setItem('companyData', JSON.stringify(newCompany));
        navigate('/company/dashboard');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
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
            {isLogin ? 'Company Login' : 'Register Company'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              autoFocus
            />

            {!isLogin && (
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  label="Salary Range"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  multiline
                  rows={3}
                  label="Job Requirements"
                  name="job_requirements"
                  value={formData.job_requirements}
                  onChange={handleChange}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  multiline
                  rows={3}
                  label="Job Description"
                  name="job_description"
                  value={formData.job_description}
                  onChange={handleChange}
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
            </Button>

            <Grid container justifyContent="center">
              <Grid item>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                >
                  {isLogin ? "New company? Register here" : "Already registered? Login"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default CompanyAuth;
