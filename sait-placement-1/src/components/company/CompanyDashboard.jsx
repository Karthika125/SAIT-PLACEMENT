import React, { useState, useEffect } from 'react';
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
  Snackbar,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { dashboardStyles } from '../../styles/dashboardStyles';
import { supabase } from '../../config/supabaseClient';

const CompanyDashboard = () => {
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewProfileDialog, setViewProfileDialog] = useState(false);

  const [newPosting, setNewPosting] = useState({
    company_name: '',
    industry: '',
    job_requirements: '',
    job_description: '',
    location: '',
    salary_range: ''
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load company profile
      const { data: company } = await supabase
        .from('companies')
        .select('company_name, industry, auth_id, verified, created_at')
        .eq('auth_id', user.id)
        .single();

      setCompanyProfile(company);

      if (company) {
        // Load job postings
        const { data: jobs } = await supabase
          .from('companies')
          .select('company_name, industry, job_requirements, job_description, location, salary_range, created_at')
          .eq('auth_id', user.id);
        setJobPostings(jobs || []);

        // Load applications
        const { data: apps } = await supabase
          .from('job_applications')
          .select(`
            id,
            status,
            applied_at,
            students (
              student_id,
              full_name,
              email,
              department,
              year_of_study,
              cgpa,
              skills,
              resume_url
            )
          `)
          .eq('company_id', company.id);
        setApplications(apps || []);
      }
    } catch (error) {
      console.error('Error loading company data:', error);
      setNotification({
        open: true,
        message: 'Failed to load company data',
        severity: 'error'
      });
    }
  };

  const handleNewPosting = (e) => {
    setNewPosting({
      ...newPosting,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitPosting = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('companies')
        .insert({
          ...newPosting,
          auth_id: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setJobPostings([...jobPostings, data]);
      setNewPosting({
        company_name: '',
        industry: '',
        job_requirements: '',
        job_description: '',
        location: '',
        salary_range: ''
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

  const handleViewProfile = (student) => {
    setSelectedStudent(student);
    setViewProfileDialog(true);
  };

  const handleUpdateStatus = async (applicationId, newStatus) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ status: newStatus })
        .eq('id', applicationId);

      if (error) throw error;

      setApplications(applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));

      setNotification({
        open: true,
        message: 'Application status updated successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: 'Failed to update application status',
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
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
          <Tab label="Job Postings" />
          <Tab label="Applications" />
        </Tabs>

        {activeTab === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Post New Job
                </Typography>
                <form onSubmit={handleSubmitPosting}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Company Name"
                        name="company_name"
                        value={newPosting.company_name}
                        onChange={handleNewPosting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Industry"
                        name="industry"
                        value={newPosting.industry}
                        onChange={handleNewPosting}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        multiline
                        rows={3}
                        label="Job Requirements"
                        name="job_requirements"
                        value={newPosting.job_requirements}
                        onChange={handleNewPosting}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        multiline
                        rows={3}
                        label="Job Description"
                        name="job_description"
                        value={newPosting.job_description}
                        onChange={handleNewPosting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Location"
                        name="location"
                        value={newPosting.location}
                        onChange={handleNewPosting}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Salary Range"
                        name="salary_range"
                        value={newPosting.salary_range}
                        onChange={handleNewPosting}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<AddIcon />}
                      >
                        Post Job
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Your Job Postings
              </Typography>
              <Grid container spacing={2}>
                {jobPostings.map((job) => (
                  <Grid item xs={12} md={6} key={job.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{job.company_name}</Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {job.industry}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>Requirements:</strong> {job.job_requirements}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>Description:</strong> {job.job_description}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Location:</strong> {job.location}
                        </Typography>
                        <Typography variant="body2">
                          <strong>Salary Range:</strong> {job.salary_range}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Applications Received
              </Typography>
              <Grid container spacing={2}>
                {applications.map((application) => (
                  <Grid item xs={12} md={6} key={application.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">
                          {application.students.full_name}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {application.students.department} - Year {application.students.year_of_study}
                        </Typography>
                        <Typography variant="body2">
                          CGPA: {application.students.cgpa}
                        </Typography>
                        <Box sx={{ mt: 1, mb: 2 }}>
                          {application.students.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                          <Button
                            variant="outlined"
                            onClick={() => handleViewProfile(application.students)}
                          >
                            View Full Profile
                          </Button>
                          <Box>
                            <Button
                              color="success"
                              variant={application.status === 'accepted' ? 'contained' : 'outlined'}
                              onClick={() => handleUpdateStatus(application.id, 'accepted')}
                              sx={{ mr: 1 }}
                            >
                              Accept
                            </Button>
                            <Button
                              color="error"
                              variant={application.status === 'rejected' ? 'contained' : 'outlined'}
                              onClick={() => handleUpdateStatus(application.id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        )}
      </Container>

      <Dialog
        open={viewProfileDialog}
        onClose={() => setViewProfileDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Student Profile</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{selectedStudent.full_name}</Typography>
                <Typography color="textSecondary">{selectedStudent.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Department:</strong> {selectedStudent.department}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Year:</strong> {selectedStudent.year_of_study}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>CGPA:</strong> {selectedStudent.cgpa}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Skills:</strong></Typography>
                <Box sx={{ mt: 1 }}>
                  {selectedStudent.skills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              </Grid>
              {selectedStudent.resume_url && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    href={selectedStudent.resume_url}
                    target="_blank"
                  >
                    View Resume
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewProfileDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CompanyDashboard;
