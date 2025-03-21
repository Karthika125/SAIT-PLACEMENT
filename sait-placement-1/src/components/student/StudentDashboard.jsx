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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { dashboardStyles } from '../../styles/dashboardStyles';
import { extractTextFromPDF, validatePDFFile } from '../../utils/pdfUtils';

const StudentDashboard = () => {
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [openCustomizeDialog, setOpenCustomizeDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [matchedCompanies, setMatchedCompanies] = useState([]);

  // Company database with required skills and weightage
  const companyDatabase = [
    {
      name: 'Tech Corp',
      position: 'Software Developer',
      requirements: {
        'React': 0.8,
        'Node.js': 0.7,
        'AWS': 0.6,
        'TypeScript': 0.5,
        'CI/CD': 0.4,
        'Docker': 0.4
      },
      description: 'Leading tech company seeking talented developers.',
      location: 'Remote',
      salary: '$80,000 - $120,000'
    },
    {
      name: 'Innovation Labs',
      position: 'Frontend Developer',
      requirements: {
        'React': 0.9,
        'TypeScript': 0.8,
        'Redux': 0.7,
        'Material-UI': 0.6,
        'Jest': 0.5,
        'HTML': 0.4,
        'CSS': 0.4
      },
      description: 'Fast-growing startup with exciting projects.',
      location: 'New York',
      salary: '$90,000 - $130,000'
    },
    {
      name: 'Digital Solutions',
      position: 'Full Stack Developer',
      requirements: {
        'React': 0.7,
        'Python': 0.8,
        'MongoDB': 0.6,
        'FastAPI': 0.5,
        'AWS': 0.4,
        'Docker': 0.4
      },
      description: 'Global tech company with remote opportunities.',
      location: 'San Francisco',
      salary: '$100,000 - $150,000'
    }
  ];

  // Extract skills from resume text
  const extractSkills = (text) => {
    // Common technical skills to look for
    const skillsDatabase = {
      languages: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Ruby', 'PHP', 'Swift', 'Kotlin'],
      frameworks: ['React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Flask', 'Spring', 'Express'],
      databases: ['MongoDB', 'MySQL', 'PostgreSQL', 'Oracle', 'SQL Server', 'Redis'],
      cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD'],
      tools: ['Git', 'Jenkins', 'JIRA', 'Confluence', 'Maven', 'Gradle'],
      testing: ['Jest', 'Mocha', 'Selenium', 'JUnit', 'TestNG'],
      concepts: ['REST API', 'GraphQL', 'Microservices', 'DevOps', 'Agile', 'Scrum']
    };

    const foundSkills = new Set();
    const text_lower = text.toLowerCase();

    Object.values(skillsDatabase).flat().forEach(skill => {
      if (text_lower.includes(skill.toLowerCase())) {
        foundSkills.add(skill);
      }
    });

    return Array.from(foundSkills);
  };

  // Calculate match score for a company
  const calculateMatchScore = (skills, companyRequirements) => {
    let totalScore = 0;
    let totalWeight = 0;
    const matchedSkills = [];
    const missingSkills = [];

    Object.entries(companyRequirements).forEach(([skill, weight]) => {
      totalWeight += weight;
      if (skills.includes(skill)) {
        totalScore += weight;
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    });

    const matchPercentage = Math.round((totalScore / totalWeight) * 100);
    return {
      score: matchPercentage,
      matchedSkills,
      missingSkills
    };
  };

  // Analyze resume and match with companies
  const analyzeResume = async (file) => {
    setIsAnalyzing(true);
    try {
      validatePDFFile(file);
      const text = await extractTextFromPDF(file);
      setResumeText(text);
      const detectedSkills = extractSkills(text);

      // Match with companies
      const matches = companyDatabase.map(company => {
        const matchResult = calculateMatchScore(detectedSkills, company.requirements);
        return {
          ...company,
          match: matchResult.score,
          matchedSkills: matchResult.matchedSkills,
          missingSkills: matchResult.missingSkills,
          desiredSkills: Object.keys(company.requirements)
        };
      }).sort((a, b) => b.match - a.match)
      .filter(company => company.match > 30); // Only show companies with at least 30% match

      // Calculate overall analysis
      const analysis = {
        skills: detectedSkills,
        missingSkills: Array.from(new Set(matches.flatMap(m => m.missingSkills))),
        strengthAreas: detectedSkills.slice(0, 3), // Top 3 skills
        improvementAreas: Array.from(new Set(matches.flatMap(m => m.missingSkills))).slice(0, 3), // Top 3 missing skills
        score: Math.round(matches.reduce((acc, curr) => acc + curr.match, 0) / matches.length)
      };

      setResumeAnalysis(analysis);
      setMatchedCompanies(matches);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert(error.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      validatePDFFile(file);
      setResume(file);
      await analyzeResume(file);
    } catch (error) {
      console.error('Error handling resume upload:', error);
      alert(error.message || 'Failed to process resume. Please try again.');
    }
  };

  const handleCustomizeResume = (company) => {
    setSelectedCompany(company);
    setOpenCustomizeDialog(true);
  };

  const handleCloseCustomizeDialog = () => {
    setOpenCustomizeDialog(false);
    setSelectedCompany(null);
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
          {/* Resume Upload and Analysis Section */}
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
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Upload Resume (PDF only)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={isAnalyzing}
                />
              </Button>
              {resume && (
                <Typography variant="body2" sx={{ mt: 2, color: 'success.main' }}>
                  Current Resume: {resume.name}
                </Typography>
              )}
              
              {isAnalyzing && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2">Analyzing your resume...</Typography>
                </Box>
              )}

              {resumeAnalysis && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>Resume Analysis</Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="primary">Skills Detected:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 1 }}>
                        {resumeAnalysis.skills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" />
                        ))}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="error">Missing In-Demand Skills:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 1 }}>
                        {resumeAnalysis.missingSkills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" color="error" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="primary">Strength Areas:</Typography>
                      <Typography variant="body2">{resumeAnalysis.strengthAreas.join(', ')}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="primary">Areas for Improvement:</Typography>
                      <Typography variant="body2">{resumeAnalysis.improvementAreas.join(', ')}</Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="subtitle2" color="primary">Overall Score:</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={resumeAnalysis.score}
                          sx={{ mx: 2, flexGrow: 1 }}
                        />
                        <Typography variant="body2">{resumeAnalysis.score}%</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Matched Companies Section - Only show after resume analysis */}
          {resumeAnalysis && (
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <WorkIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    Matched Companies
                  </Typography>
                </Box>
                {matchedCompanies.length > 0 ? (
                  <Grid container spacing={2}>
                    {matchedCompanies.map((company, index) => (
                      <Grid item xs={12} key={index}>
                        <Card sx={dashboardStyles.companyCard}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {company.name}
                            </Typography>
                            <Typography color="text.secondary" gutterBottom>
                              {company.position} | {company.location}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {company.salary}
                            </Typography>
                            <Box sx={dashboardStyles.matchScore}>
                              <Typography variant="body2">Match:</Typography>
                              <LinearProgress
                                variant="determinate"
                                value={company.match}
                                sx={dashboardStyles.progressBar}
                                color={company.match > 70 ? "success" : company.match > 50 ? "warning" : "error"}
                              />
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {company.match}%
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              {company.description}
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" color="primary" gutterBottom>
                                Required Skills:
                              </Typography>
                              <Box sx={dashboardStyles.chipArray}>
                                {company.desiredSkills.map((skill, i) => (
                                  <Chip
                                    key={i}
                                    label={skill}
                                    size="small"
                                    color={company.matchedSkills.includes(skill) ? "success" : "error"}
                                    variant={company.matchedSkills.includes(skill) ? "filled" : "outlined"}
                                  />
                                ))}
                              </Box>
                            </Box>
                            <Button
                              variant="outlined"
                              onClick={() => handleCustomizeResume(company)}
                              sx={{ ...dashboardStyles.actionButton, mt: 2 }}
                              fullWidth
                            >
                              Customize Resume
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info">
                    No matching companies found. Try updating your resume with more relevant skills.
                  </Alert>
                )}
              </Paper>
            </Grid>
          )}

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

          {/* Resume Customization Dialog */}
          <Dialog
            open={openCustomizeDialog}
            onClose={handleCloseCustomizeDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              Customize Resume for {selectedCompany?.name}
            </DialogTitle>
            <DialogContent>
              {selectedCompany && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    Job Requirements Analysis
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="primary">Required Skills:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, my: 1 }}>
                      {selectedCompany.desiredSkills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          color={resumeAnalysis?.skills.includes(skill) ? "success" : "error"}
                          variant={resumeAnalysis?.skills.includes(skill) ? "filled" : "outlined"}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Typography variant="subtitle1" gutterBottom>
                    Recommendations:
                  </Typography>
                  
                  <List>
                    {selectedCompany.desiredSkills
                      .filter(skill => !resumeAnalysis?.skills.includes(skill))
                      .map((skill, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`Add or highlight your ${skill} experience`}
                            secondary="Consider adding specific projects or certifications related to this skill"
                          />
                        </ListItem>
                      ))}
                  </List>

                  <Alert severity="info" sx={{ mt: 2 }}>
                    Pro Tip: Tailor your resume to highlight experiences that match {selectedCompany.name}'s requirements.
                    Focus on quantifiable achievements related to their desired skills.
                  </Alert>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCustomizeDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentDashboard;
