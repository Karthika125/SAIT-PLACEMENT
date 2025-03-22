import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  List,
  ListItem,
  Divider,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { dashboardStyles } from '../../styles/dashboardStyles';
import { registerCompany } from '../../services/companyService';

const CompanyDashboard = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const [newPosting, setNewPosting] = useState({
    name: '',
    industry: '',
    requirements: '',
    description: '',
    location: '',
    salaryRange: ''
  });

  const handleNewPosting = (e) => {
    setNewPosting({
      ...newPosting,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitPosting = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await registerCompany(newPosting);
      
      if (error) throw error;
      
      setJobPostings([...jobPostings, data[0]]);
      setNewPosting({
        name: '',
        industry: '',
        requirements: '',
        description: '',
        location: '',
        salaryRange: ''
      });
      
      setNotification({
        open: true,
        message: 'Job posting created successfully!',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Failed to create job posting',
        severity: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box sx={dashboardStyles.root}>
      <AppBar position="static" color="default" sx={dashboardStyles.header}>
        <Toolbar>
          <BusinessIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Company Dashboard
          </Typography>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={dashboardStyles.mainContent}>
        <Grid container spacing={3}>
          {/* Company Profile Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Company Profile
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Manage your company profile and job postings here.
              </Typography>
            </Paper>
          </Grid>

          {/* New Job Posting Form */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Create New Job Posting
              </Typography>
              <form onSubmit={handleSubmitPosting}>
                <TextField
                  fullWidth
                  label="Company Name"
                  name="name"
                  value={newPosting.name}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Industry"
                  name="industry"
                  value={newPosting.industry}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Job Requirements"
                  name="requirements"
                  value={newPosting.requirements}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                  multiline
                  rows={3}
                  helperText="Enter requirements separated by commas"
                />
                <TextField
                  fullWidth
                  label="Job Description"
                  name="description"
                  value={newPosting.description}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                  multiline
                  rows={4}
                />
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={newPosting.location}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Salary Range"
                  name="salaryRange"
                  value={newPosting.salaryRange}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  fullWidth
                >
                  Create Job Posting
                </Button>
              </form>
            </Paper>
          </Grid>

          {/* Current Job Postings */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Current Job Postings
                </Typography>
              </Box>
              <List>
                {jobPostings.map((posting, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0 }}>
                      <Card sx={{ width: '100%', ...dashboardStyles.card }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {posting.company_name}
                          </Typography>
                          <Typography color="text.secondary" gutterBottom>
                            {posting.location} • {posting.industry}
                          </Typography>
                          <Box sx={dashboardStyles.chipArray}>
                            {posting.job_requirements.split(',').map((req, i) => (
                              <Chip
                                key={i}
                                label={req.trim()}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                          <Typography variant="body2" sx={{ mt: 2 }}>
                            {posting.job_description}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Salary Range: {posting.salary_range}
                          </Typography>
                        </CardContent>
                      </Card>
                    </ListItem>
                    {index < jobPostings.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyDashboard;
