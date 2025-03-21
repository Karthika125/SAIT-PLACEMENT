import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { dashboardStyles } from '../../styles/dashboardStyles';

const StudentDashboard = () => {
  const [resume, setResume] = useState(null);
  const [matchedCompanies, setMatchedCompanies] = useState([
    {
      name: 'Tech Corp',
      match: 95,
      position: 'Software Developer',
      requirements: ['React', 'Node.js', 'AWS'],
      description: 'Leading tech company seeking talented developers.'
    },
    {
      name: 'Innovation Labs',
      match: 85,
      position: 'Frontend Developer',
      requirements: ['React', 'TypeScript'],
      description: 'Fast-growing startup with exciting projects.'
    },
    {
      name: 'Digital Solutions',
      match: 75,
      position: 'Full Stack Developer',
      requirements: ['React', 'Python', 'MongoDB'],
      description: 'Global tech company with remote opportunities.'
    }
  ]);

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setResume(file);
      // TODO: Implement resume parsing and company matching logic
    }
  };

  const handleCustomizeResume = (company) => {
    // TODO: Implement resume customization logic
    console.log('Customizing resume for:', company.name);
  };

  const handleTakeMockTest = (category) => {
    // TODO: Implement mock test logic
    console.log('Taking mock test for:', category);
  };

  return (
    <Box sx={dashboardStyles.root}>
      <AppBar position="static" color="default" sx={dashboardStyles.header}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Dashboard
          </Typography>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={dashboardStyles.mainContent}>
        <Grid container spacing={3}>
          {/* Resume Upload Section */}
          <Grid item xs={12}>
            <Paper sx={dashboardStyles.uploadSection}>
              <Box sx={{ mb: 2 }}>
                <UploadFileIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Resume Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload your resume to get matched with the best opportunities
                </Typography>
              </Box>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={dashboardStyles.actionButton}
              >
                Upload Resume
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                />
              </Button>
              {resume && (
                <Typography variant="body2" sx={{ mt: 2, color: 'success.main' }}>
                  Current Resume: {resume.name}
                </Typography>
              )}
            </Paper>
          </Grid>

          {/* Matched Companies Section */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Matched Companies
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {matchedCompanies.map((company, index) => (
                  <Grid item xs={12} key={index}>
                    <Card sx={dashboardStyles.companyCard}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {company.name}
                        </Typography>
                        <Typography color="text.secondary" gutterBottom>
                          {company.position}
                        </Typography>
                        <Box sx={dashboardStyles.matchScore}>
                          <Typography variant="body2">Match:</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={company.match}
                            sx={dashboardStyles.progressBar}
                          />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            {company.match}%
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {company.description}
                        </Typography>
                        <Box sx={dashboardStyles.chipArray}>
                          {company.requirements.map((req, i) => (
                            <Chip
                              key={i}
                              label={req}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                        <Button
                          variant="outlined"
                          onClick={() => handleCustomizeResume(company)}
                          sx={dashboardStyles.actionButton}
                          fullWidth
                        >
                          Customize Resume
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Mock Tests Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AssignmentIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Mock Tests
                </Typography>
              </Box>
              <List>
                {['Frontend Development', 'Backend Development', 'Full Stack Development', 'DevOps'].map((category, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleTakeMockTest(category)}
                      sx={{ textTransform: 'none' }}
                    >
                      {category}
                    </Button>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
