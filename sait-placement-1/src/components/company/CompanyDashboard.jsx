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
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { dashboardStyles } from '../../styles/dashboardStyles';
import { supabase } from '../../config/supabaseClient';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [jobPostings, setJobPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [activeTab, setActiveTab] = useState(0);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewProfileDialog, setViewProfileDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState({});

  const [newPosting, setNewPosting] = useState({
    job_requirements: '',
    job_description: '',
    location: '',
    salary_range: ''
  });

  useEffect(() => {
    const companyData = JSON.parse(localStorage.getItem('companyData'));
    if (!companyData) {
      navigate('/company/auth');
      return;
    }

    const loadCompanyData = async () => {
      try {
        // Get latest company data
        const { data: company, error } = await supabase
          .from('companies')
          .select('*')
          .eq('company_name', companyData.company_name)
          .single();

        if (error) throw error;
        setCompanyProfile(company);
        setEditedProfile(company);

        // Get job postings
        const { data: jobs, error: jobsError } = await supabase
          .from('job_postings')
          .select('*')
          .eq('company_name', company.company_name);

        if (jobsError) throw jobsError;
        setJobPostings(jobs || []);

        // Get applications
        const { data: apps, error: appsError } = await supabase
          .from('applications')
          .select('*, students(*)')
          .eq('company_name', company.company_name);

        if (appsError) throw appsError;
        setApplications(apps || []);
      } catch (error) {
        console.error('Error loading company data:', error);
        setNotification({
          open: true,
          message: 'Error loading company data',
          severity: 'error'
        });
      }
    };

    loadCompanyData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('companyData');
    navigate('/company/auth');
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from('companies')
        .update(editedProfile)
        .eq('company_name', companyProfile.company_name);

      if (error) throw error;

      setCompanyProfile(editedProfile);
      setIsEditMode(false);
      setNotification({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotification({
        open: true,
        message: 'Error updating profile',
        severity: 'error'
      });
    }
  };

  const handleCreateJob = async () => {
    try {
      const { error } = await supabase
        .from('job_postings')
        .insert({
          ...newPosting,
          company_name: companyProfile.company_name,
          posting_date: new Date().toISOString()
        });

      if (error) throw error;

      // Refresh job postings
      const { data: jobs } = await supabase
        .from('job_postings')
        .select('*')
        .eq('company_name', companyProfile.company_name);

      setJobPostings(jobs);
      setNewPosting({
        job_requirements: '',
        job_description: '',
        location: '',
        salary_range: ''
      });

      setNotification({
        open: true,
        message: 'Job posted successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error creating job:', error);
      setNotification({
        open: true,
        message: 'Error creating job posting',
        severity: 'error'
      });
    }
  };

  const handleViewStudentProfile = (student) => {
    setSelectedStudent(student);
    setViewProfileDialog(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <BusinessIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {companyProfile?.company_name || 'Company Dashboard'}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
          <Tab icon={<BusinessIcon />} label="Company Profile" />
          <Tab icon={<WorkIcon />} label="Job Postings" />
          <Tab icon={<AccountCircleIcon />} label="Applications" />
        </Tabs>

        {/* Company Profile Tab */}
        {activeTab === 0 && (
          <Paper sx={{ p: 3, mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Company Profile</Typography>
              <Button
                variant="outlined"
                onClick={() => isEditMode ? handleUpdateProfile() : setIsEditMode(true)}
              >
                {isEditMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={isEditMode ? editedProfile.company_name : companyProfile?.company_name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, company_name: e.target.value })}
                  disabled={!isEditMode}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Industry"
                  value={isEditMode ? editedProfile.industry : companyProfile?.industry}
                  onChange={(e) => setEditedProfile({ ...editedProfile, industry: e.target.value })}
                  disabled={!isEditMode}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={isEditMode ? editedProfile.location : companyProfile?.location}
                  onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                  disabled={!isEditMode}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Salary Range"
                  value={isEditMode ? editedProfile.salary_range : companyProfile?.salary_range}
                  onChange={(e) => setEditedProfile({ ...editedProfile, salary_range: e.target.value })}
                  disabled={!isEditMode}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Job Postings Tab */}
        {activeTab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Create New Job Posting</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Requirements"
                    multiline
                    rows={3}
                    value={newPosting.job_requirements}
                    onChange={(e) => setNewPosting({ ...newPosting, job_requirements: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Job Description"
                    multiline
                    rows={3}
                    value={newPosting.job_description}
                    onChange={(e) => setNewPosting({ ...newPosting, job_description: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={newPosting.location}
                    onChange={(e) => setNewPosting({ ...newPosting, location: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Salary Range"
                    value={newPosting.salary_range}
                    onChange={(e) => setNewPosting({ ...newPosting, salary_range: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateJob}
                    fullWidth
                  >
                    Post Job
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h6" gutterBottom>Current Job Postings</Typography>
            <Grid container spacing={3}>
              {jobPostings.map((job) => (
                <Grid item xs={12} md={6} key={job.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Job Requirements
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {job.job_requirements}
                      </Typography>
                      <Typography variant="h6" gutterBottom>
                        Job Description
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {job.job_description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip label={`Location: ${job.location}`} sx={{ mr: 1 }} />
                        <Chip label={`Salary: ${job.salary_range}`} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Applications Tab */}
        {activeTab === 2 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>Student Applications</Typography>
            <List>
              {applications.map((application) => (
                <React.Fragment key={application.id}>
                  <ListItem>
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="subtitle1">
                        {application.students?.full_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Department: {application.students?.department}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewStudentProfile(application.students)}
                        >
                          View Profile
                        </Button>
                      </Box>
                    </Box>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Box>
        )}
      </Container>

      {/* Student Profile Dialog */}
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
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Department:</strong> {selectedStudent.department}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Year of Study:</strong> {selectedStudent.year_of_study}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography><strong>Skills:</strong></Typography>
                <Box sx={{ mt: 1 }}>
                  {selectedStudent.skills?.map((skill, index) => (
                    <Chip key={index} label={skill} sx={{ m: 0.5 }} />
                  ))}
                </Box>
              </Grid>
              {selectedStudent.resume_url && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    href={selectedStudent.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
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
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
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
