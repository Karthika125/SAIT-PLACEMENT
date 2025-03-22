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
import { getCompanyApplications, updateApplicationStatus } from '../../services/applicationService';

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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  const [newPosting, setNewPosting] = useState({
    job_requirements: '',
    job_description: '',
    location: '',
    salary_range: ''
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

        if (error) {
          console.error('Error fetching company profile:', error);
          throw error;
        }
        
        if (!company) {
          console.error('Company not found:', companyData.company_name);
          throw new Error('Company profile not found');
        }
        
        console.log('Company data loaded:', company);
        setCompanyProfile(company);
        setEditedProfile(company);

        try {
          // Get job postings - in a separate try/catch to prevent it from affecting other operations
          console.log('Fetching job postings for company:', company.company_name);
          const { data: jobs, error: jobsError } = await supabase
            .from('job_postings')
            .select('*')
            .eq('company_name', company.company_name);

          if (jobsError) {
            console.error('Error fetching job postings:', jobsError);
            // Don't throw, just log and continue with empty jobs
            setJobPostings([]);
          } else {
            console.log('Job postings loaded:', jobs);
            setJobPostings(jobs || []);
          }
        } catch (jobError) {
          console.error('Exception in job postings fetch:', jobError);
          setJobPostings([]);
        }

        try {
          // Get applications using the applicationService - in a separate try/catch
          console.log('Fetching applications for company ID:', company.id);
          const applications = await getCompanyApplications(company.id);
          console.log('Applications fetched:', applications);
          setApplications(applications || []);
        } catch (appError) {
          console.error('Exception in applications fetch:', appError);
          setApplications([]);
          // Show notification for this specific error
          setNotification({
            open: true,
            message: 'Error loading applications: ' + appError.message,
            severity: 'error'
          });
        }
      } catch (error) {
        console.error('Error in loadCompanyData:', error);
        setNotification({
          open: true,
          message: 'Error loading company data: ' + (error.message || 'Unknown error'),
          severity: 'error'
        });
      }
    };

    loadCompanyData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('companyData');
    navigate('/');
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

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);

      // Update local state
      const updatedApplications = applications.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApplications);

      setNotification({
        open: true,
        message: `Application ${newStatus}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      setNotification({
        open: true,
        message: 'Error updating application status',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar sx={{ flexDirection: isMobile ? 'column' : 'row', py: isMobile ? 1 : 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: isMobile ? '100%' : 'auto' }}>
            <BusinessIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {companyProfile?.company_name || 'Company Dashboard'}
            </Typography>
          </Box>
          <IconButton 
            color="inherit" 
            onClick={handleLogout}
            sx={{ mt: isMobile ? 1 : 0 }}
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container 
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 4, 
          flexGrow: 1,
          px: { xs: 1, sm: 2, md: 3 }
        }}
      >
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          centered
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            '& .MuiTab-root': {
              minWidth: isMobile ? '0' : '90px',
              px: isMobile ? 1 : 2
            }
          }}
        >
          <Tab icon={<BusinessIcon />} label={isMobile ? "" : "Company Profile"} aria-label="Company Profile" />
          <Tab icon={<WorkIcon />} label={isMobile ? "" : "Job Postings"} aria-label="Job Postings" />
          <Tab icon={<AccountCircleIcon />} label={isMobile ? "" : "Applications"} aria-label="Applications" />
        </Tabs>

        {/* Company Profile Tab */}
        {activeTab === 0 && (
          <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between', 
              mb: 2,
              gap: 1
            }}>
              <Typography variant="h5">Company Profile</Typography>
              <Button
                variant="outlined"
                onClick={() => isEditMode ? handleUpdateProfile() : setIsEditMode(true)}
                fullWidth={isMobile}
              >
                {isEditMode ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={isEditMode ? editedProfile.company_name : companyProfile?.company_name}
                  onChange={(e) => setEditedProfile({ ...editedProfile, company_name: e.target.value })}
                  disabled={!isEditMode}
                  margin="normal"
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  label="Industry"
                  value={isEditMode ? editedProfile.industry : companyProfile?.industry}
                  onChange={(e) => setEditedProfile({ ...editedProfile, industry: e.target.value })}
                  disabled={!isEditMode}
                  margin="normal"
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  label="Salary Range"
                  value={isEditMode ? editedProfile.salary_range : companyProfile?.salary_range}
                  onChange={(e) => setEditedProfile({ ...editedProfile, salary_range: e.target.value })}
                  disabled={!isEditMode}
                  margin="normal"
                  size={isMobile ? "small" : "medium"}
                />
              </Grid>
            </Grid>
          </Paper>
        )}

        {/* Job Postings Tab */}
        {activeTab === 1 && (
          <Box sx={{ mt: 3 }}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>
              <Typography variant="h5" gutterBottom>Create New Job Posting</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Description"
                    multiline
                    rows={isMobile ? 3 : 4}
                    value={newPosting.job_description}
                    onChange={(e) => setNewPosting({ ...newPosting, job_description: e.target.value })}
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Job Requirements (comma separated skills)"
                    multiline
                    rows={isMobile ? 3 : 4}
                    value={newPosting.job_requirements}
                    onChange={(e) => setNewPosting({ ...newPosting, job_requirements: e.target.value })}
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={newPosting.location}
                    onChange={(e) => setNewPosting({ ...newPosting, location: e.target.value })}
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Salary Range"
                    value={newPosting.salary_range}
                    onChange={(e) => setNewPosting({ ...newPosting, salary_range: e.target.value })}
                    margin="normal"
                    size={isMobile ? "small" : "medium"}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateJob}
                    disabled={!newPosting.job_description || !newPosting.job_requirements}
                    fullWidth={isMobile}
                    size={isMobile ? "small" : "medium"}
                  >
                    Post Job
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            <Typography variant="h5" gutterBottom>Current Job Postings</Typography>
            <Grid container spacing={2}>
              {jobPostings.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                    <Typography variant="body1">No job postings yet. Create your first job posting above.</Typography>
                  </Paper>
                </Grid>
              ) : (
                jobPostings.map((job, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={index}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>{job.job_description}</Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Posted: {new Date(job.posting_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          <strong>Location:</strong> {job.location}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          <strong>Salary Range:</strong> {job.salary_range}
                        </Typography>
                        <Typography variant="body1" paragraph>
                          <strong>Requirements:</strong>
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {job.job_requirements.split(',').map((skill, idx) => (
                            <Chip key={idx} label={skill.trim()} size="small" />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        )}

        {/* Applications Tab */}
        {activeTab === 2 && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'stretch' : 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2
            }}>
              <Typography variant="h5">Student Applications</Typography>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => loadCompanyData()}
                fullWidth={isMobile}
                size={isMobile ? "small" : "medium"}
              >
                Refresh Applications
              </Button>
            </Box>
            <Grid container spacing={2}>
              {applications.length === 0 ? (
                <Grid item xs={12}>
                  <Paper sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                    <Typography variant="body1">No applications yet.</Typography>
                  </Paper>
                </Grid>
              ) : (
                applications.map((application, index) => (
                  <Grid item xs={12} key={application.id || index}>
                    <Card>
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={8}>
                            <Typography variant={isMobile ? "subtitle1" : "h6"}>
                              {application.students?.full_name || "Student Name Not Available"}
                              {" "}
                              <Chip 
                                label={application.status} 
                                color={
                                  application.status === 'accepted' ? 'success' :
                                  application.status === 'rejected' ? 'error' : 'default'
                                }
                                size="small"
                              />
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              Student ID: {application.student_id}
                            </Typography>
                            {application.students ? (
                              <>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                  Department: {application.students.department || "Unknown"}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                  CGPA: {application.students.cgpa || "N/A"}
                                </Typography>
                                {application.students.skills && (
                                  <Box sx={{ mt: 1 }}>
                                    <Typography variant="body2">Skills:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                      {application.students.skills.map((skill, idx) => (
                                        <Chip key={idx} label={skill} size="small" />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </>
                            ) : (
                              <Typography variant="body2" color="error">
                                Student profile information is not available
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} md={4} sx={{ 
                            display: 'flex', 
                            flexDirection: isMobile ? 'row' : 'column', 
                            flexWrap: isMobile ? 'wrap' : 'nowrap',
                            gap: 1, 
                            justifyContent: 'center',
                            alignItems: isMobile ? 'center' : 'flex-start' 
                          }}>
                            {application.students && (
                              <Button 
                                variant="outlined" 
                                onClick={() => handleViewStudentProfile(application.students)}
                                size={isMobile ? "small" : "medium"}
                                sx={{ width: isMobile ? 'auto' : '100%' }}
                              >
                                View Profile
                              </Button>
                            )}
                            {application.status === 'pending' && (
                              <>
                                <Button 
                                  variant="contained" 
                                  color="success"
                                  onClick={() => handleUpdateApplicationStatus(application.id, 'accepted')}
                                  size={isMobile ? "small" : "medium"}
                                  sx={{ width: isMobile ? 'auto' : '100%' }}
                                >
                                  Accept
                                </Button>
                                <Button 
                                  variant="contained" 
                                  color="error"
                                  onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                                  size={isMobile ? "small" : "medium"}
                                  sx={{ width: isMobile ? 'auto' : '100%' }}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>
          </Box>
        )}
      </Container>

      {/* Student Profile Dialog - Make responsive */}
      <Dialog 
        open={viewProfileDialog} 
        onClose={() => setViewProfileDialog(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Student Profile</DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">{selectedStudent.full_name}</Typography>
                <Typography variant="body1">Department: {selectedStudent.department}</Typography>
                <Typography variant="body1">Year of Study: {selectedStudent.year_of_study}</Typography>
                <Typography variant="body1">CGPA: {selectedStudent.cgpa}</Typography>
                <Typography variant="body1">Email: {selectedStudent.email}</Typography>
                <Typography variant="body1">Phone: {selectedStudent.phone}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Skills</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {selectedStudent.skills && selectedStudent.skills.map((skill, idx) => (
                    <Chip key={idx} label={skill} />
                  ))}
                </Box>
              </Grid>
              {selectedStudent.resume_url && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    href={selectedStudent.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth={isMobile}
                  >
                    View Resume
                  </Button>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setViewProfileDialog(false)}
            variant="outlined"
            fullWidth={isMobile}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: isMobile ? 'center' : 'right' }}
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
