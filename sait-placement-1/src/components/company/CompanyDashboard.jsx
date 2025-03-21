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
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { dashboardStyles } from '../../styles/dashboardStyles';

const CompanyDashboard = () => {
  const [jobPostings, setJobPostings] = useState([
    {
      title: 'Senior Software Engineer',
      requirements: ['React', 'Node.js', 'AWS', '5+ years experience'],
      description: 'Looking for an experienced software engineer to join our team.',
      location: 'Remote',
      type: 'Full-time'
    }
  ]);

  const [newPosting, setNewPosting] = useState({
    title: '',
    requirements: '',
    description: '',
    location: '',
    type: ''
  });

  const handleNewPosting = (e) => {
    setNewPosting({
      ...newPosting,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitPosting = (e) => {
    e.preventDefault();
    const requirements = newPosting.requirements.split(',').map(req => req.trim());
    setJobPostings([...jobPostings, { ...newPosting, requirements }]);
    setNewPosting({
      title: '',
      requirements: '',
      description: '',
      location: '',
      type: ''
    });
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AddIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Create New Job Posting
                </Typography>
              </Box>
              <Box component="form" onSubmit={handleSubmitPosting}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="title"
                  value={newPosting.title}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Requirements (comma-separated)"
                  name="requirements"
                  value={newPosting.requirements}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                  helperText="Enter requirements separated by commas"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={newPosting.description}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                  multiline
                  rows={4}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={newPosting.location}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Employment Type"
                  name="type"
                  value={newPosting.type}
                  onChange={handleNewPosting}
                  margin="normal"
                  required
                  sx={{ mb: 3 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ ...dashboardStyles.actionButton, width: '100%' }}
                >
                  Post Job
                </Button>
              </Box>
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
                            {posting.title}
                          </Typography>
                          <Typography color="text.secondary" gutterBottom>
                            {posting.location} • {posting.type}
                          </Typography>
                          <Box sx={dashboardStyles.chipArray}>
                            {posting.requirements.map((req, i) => (
                              <Chip
                                key={i}
                                label={req}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                          <Typography variant="body2" sx={{ mt: 2 }}>
                            {posting.description}
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
    </Box>
  );
};

export default CompanyDashboard;
