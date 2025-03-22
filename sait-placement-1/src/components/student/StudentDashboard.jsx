import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Divider,
  Snackbar,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import WorkIcon from '@mui/icons-material/Work';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { getStudentProfile } from '../../services/studentService';
import { searchJobs } from '../../services/companyService';
import { dashboardStyles } from '../../styles/dashboardStyles';
import { extractTextFromPDF, validatePDFFile, findSkillsInContext } from '../../utils/pdfUtils';
import { Link } from 'react-router-dom';
import { applyToJob, getApplicationStatus, getStudentApplications } from '../../services/applicationService';
import { updateJobApplicationsSchema } from '../../services/updateSchemaService';

const StudentDashboard = () => {
  // State for resume handling
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // State for job matching
  const [matchedCompanies, setMatchedCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [openCustomizeDialog, setOpenCustomizeDialog] = useState(false);

  // State for field analysis
  const [selectedField, setSelectedField] = useState('Software Development');
  const [fieldScores, setFieldScores] = useState({});
  const [allFieldAnalysis, setAllFieldAnalysis] = useState({});

  // State for search
  const [searchSkills, setSearchSkills] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // State for mock test
  const [selectedTest, setSelectedTest] = useState('');
  const [openTestDialog, setOpenTestDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // State for session and profile
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const [applicationStatuses, setApplicationStatuses] = useState({});

  // Add notification state
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Add state for schema update
  const [isSchemaUpdateNeeded, setIsSchemaUpdateNeeded] = useState(false);
  const [isUpdatingSchema, setIsUpdatingSchema] = useState(false);
  
  // Add responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  // Add resize listener for responsive layout
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
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setSession(session);
      
      // Fetch student profile
      getStudentProfile(session.user.user_metadata.student_id)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }
          setProfile(data);
        });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Available fields and their required skills
  const availableFields = [
    'Software Development',
    'Data Science',
    'Frontend Development',
    'Backend Development',
    'DevOps Engineering',
    'Mobile Development'
  ];

  const fieldSkillsMap = {
    'Software Development': {
      essential: ['javascript', 'python', 'git', 'algorithms', 'data structures'],
      frontend: ['html', 'css', 'react', 'vue', 'angular'],
      backend: ['nodejs', 'express', 'django', 'sql', 'mongodb'],
      tools: ['docker', 'aws', 'ci/cd', 'testing']
    },
    'Data Science': {
      essential: ['python', 'statistics', 'sql', 'data analysis'],
      ml: ['machine learning', 'deep learning', 'tensorflow', 'pytorch'],
      analysis: ['pandas', 'numpy', 'scipy', 'matplotlib'],
      tools: ['jupyter', 'scikit-learn', 'tableau', 'power bi']
    },
    'Frontend Development': {
      essential: ['html', 'css', 'javascript', 'responsive design'],
      frameworks: ['react', 'vue', 'angular', 'svelte'],
      styling: ['sass', 'tailwind', 'bootstrap', 'material-ui'],
      tools: ['webpack', 'babel', 'typescript', 'testing']
    },
    'Backend Development': {
      essential: ['apis', 'databases', 'authentication', 'security'],
      languages: ['python', 'java', 'nodejs', 'golang'],
      databases: ['sql', 'mongodb', 'postgresql', 'redis'],
      tools: ['docker', 'kubernetes', 'nginx', 'aws']
    },
    'DevOps Engineering': {
      essential: ['linux', 'networking', 'security', 'scripting'],
      cloud: ['aws', 'azure', 'gcp', 'kubernetes'],
      ci_cd: ['jenkins', 'gitlab', 'github actions', 'travis'],
      monitoring: ['prometheus', 'grafana', 'elk stack', 'nagios']
    },
    'Mobile Development': {
      essential: ['mobile ui', 'apis', 'state management', 'testing'],
      android: ['kotlin', 'java', 'android sdk', 'jetpack'],
      ios: ['swift', 'objective-c', 'xcode', 'cocoa'],
      cross_platform: ['react native', 'flutter', 'ionic', 'xamarin']
    }
  };

  // Mock test data
  const mockTests = {
    'Technical': [
      { id: 1, name: 'Data Structures & Algorithms', duration: '60 mins', questions: 30 },
      { id: 2, name: 'Web Development', duration: '45 mins', questions: 25 },
      { id: 3, name: 'Database Management', duration: '30 mins', questions: 20 }
    ],
    'Aptitude': [
      { id: 4, name: 'Quantitative Aptitude', duration: '30 mins', questions: 25 },
      { id: 5, name: 'Logical Reasoning', duration: '30 mins', questions: 25 },
      { id: 6, name: 'Verbal Ability', duration: '30 mins', questions: 25 }
    ],
    'Domain': [
      { id: 7, name: 'Software Engineering', duration: '45 mins', questions: 30 },
      { id: 8, name: 'Data Science', duration: '45 mins', questions: 30 },
      { id: 9, name: 'Cloud Computing', duration: '45 mins', questions: 30 }
    ]
  };

  const analyzeResumeForAllFields = async (text, sections) => {
    const fieldAnalyses = {};
    const scores = {};

    // Analyze resume for each field
    for (const field of availableFields) {
      const fieldSkills = fieldSkillsMap[field];
      const allFieldSkills = new Set([
        ...fieldSkills.essential,
        ...Object.values(fieldSkills).flat()
      ]);

      // Find skills for this field
      const detectedSkills = new Set();
      for (const [sectionName, sectionText] of Object.entries(sections || {})) {
        if (sectionText) {
          const sectionSkills = findSkillsInContext(sectionText, allFieldSkills);
          sectionSkills.forEach(skill => detectedSkills.add(skill));
        }
      }

      // Calculate field-specific scores
      const analysis = {
        field,
        skills: Array.from(detectedSkills),
        categories: {},
        missingEssential: fieldSkills.essential.filter(skill => !detectedSkills.has(skill))
      };

      // Calculate category scores
      for (const [category, skills] of Object.entries(fieldSkills)) {
        const categorySkills = new Set(skills);
        const detected = Array.from(detectedSkills).filter(skill => categorySkills.has(skill));
        
        analysis.categories[category] = {
          detected,
          missing: skills.filter(skill => !detectedSkills.has(skill)),
          score: (detected.length / skills.length) * 100
        };
      }

      // Calculate overall field score
      const essentialWeight = 0.4;
      const otherCategoriesWeight = 0.6 / (Object.keys(fieldSkills).length - 1);
      
      const fieldScore = (
        (analysis.categories.essential.score * essentialWeight) +
        Object.entries(analysis.categories)
          .filter(([category]) => category !== 'essential')
          .reduce((sum, [_, data]) => sum + (data.score * otherCategoriesWeight), 0)
      );

      fieldAnalyses[field] = analysis;
      scores[field] = fieldScore;
    }

    setAllFieldAnalysis(fieldAnalyses);
    setFieldScores(scores);

    // Set initial selected field to the one with highest score
    const bestField = Object.entries(scores).sort(([,a], [,b]) => b - a)[0][0];
    
    setSelectedField(bestField);
    
    return { fieldAnalyses, scores };
  };

  const handleFieldChange = (newField) => {
    setSelectedField(newField);
    if (allFieldAnalysis[newField]) {
      setResumeAnalysis(allFieldAnalysis[newField]);
      searchJobsForField(newField, allFieldAnalysis[newField].skills);
    }
  };

  const searchJobsForField = async (field, skills) => {
    try {
      setIsSearching(true);
      setSearchError('');
      
      // First try to search with detected skills
      let { data, error } = await searchJobs(Array.from(skills || []).join(', '));
      
      if (error) throw error;

      // If no results with skills, get all companies
      if (!data || data.length === 0) {
        ({ data, error } = await searchJobs(''));
        if (error) throw error;
      }

      if (!data) {
        setMatchedCompanies([]);
        return;
      }

      // Rank jobs based on field relevance and skill match
      const rankedJobs = data.map(job => {
        // Calculate field relevance (higher weight for matching industry)
        const fieldRelevance = job.industry?.toLowerCase().includes(field.toLowerCase()) ? 1.5 : 1.0;
        
        // Calculate skill match score
        const jobSkills = new Set((job.job_requirements || '').toLowerCase().split(',').map(s => s.trim()));
        const matchedSkills = Array.from(skills || []).filter(skill => 
          Array.from(jobSkills).some(jobSkill => jobSkill.includes(skill.toLowerCase()))
        );
        
        // Calculate final score (combine existing matchScore with field relevance)
        const matchScore = (job.matchScore || 0) * fieldRelevance;
        
        return {
          ...job,
          matchScore,
          matchedSkills,
          fieldRelevant: fieldRelevance > 1
        };
      }).sort((a, b) => b.matchScore - a.matchScore);

      setMatchedCompanies(rankedJobs);
    } catch (error) {
      console.error('Error searching jobs:', error);
      setSearchError('Failed to search for jobs');
      setMatchedCompanies([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setResume(file);
      setResumeAnalysis(null);
      setMatchedCompanies([]);
      setIsAnalyzing(true);
      
      validatePDFFile(file);
      const { fullText, sections } = await extractTextFromPDF(file);
      
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF. Please ensure the PDF contains selectable text.');
      }
      
      setResumeText(fullText);
      
      // Analyze for all fields
      const { fieldAnalyses, scores } = await analyzeResumeForAllFields(fullText, sections);
      
      // Get the best matching field
      const bestField = Object.entries(scores).sort(([,a], [,b]) => b - a)[0][0];
      
      // Set analysis for best field
      setResumeAnalysis(fieldAnalyses[bestField]);
      
      // Search jobs based on best field
      await searchJobsForField(bestField, fieldAnalyses[bestField].skills);
      
    } catch (error) {
      console.error('Error in resume upload process:', error);
      alert(error.message || 'Failed to process resume. Please ensure the PDF contains selectable text and try again.');
      setResume(null);
      setResumeText('');
      setResumeAnalysis(null);
      setMatchedCompanies([]);
      setFieldScores({});
      setAllFieldAnalysis({});
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCustomizeResume = (company) => {
    setSelectedCompany(company);
    setOpenCustomizeDialog(true);
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    setOpenTestDialog(true);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUpdateSchema = async () => {
    try {
      setIsUpdatingSchema(true);
      const result = await updateJobApplicationsSchema();
      
      if (result.success) {
        setNotification({
          open: true,
          message: 'Database schema updated successfully. Try applying again.',
          severity: 'success'
        });
        setIsSchemaUpdateNeeded(false);
      } else {
        setNotification({
          open: true,
          message: 'Failed to update database schema. Please contact administrator.',
          severity: 'error'
        });
        console.error('Schema update failed:', result.error);
      }
    } catch (error) {
      console.error('Schema update error:', error);
      setNotification({
        open: true,
        message: 'Error updating database schema',
        severity: 'error'
      });
    } finally {
      setIsUpdatingSchema(false);
    }
  };

  const handleApply = async (companyId, companyName) => {
    try {
      setIsSearching(true);
      
      // Check if already applied
      if (applicationStatuses[companyId]) {
        setNotification({
          open: true,
          message: `You have already applied to ${companyName}`,
          severity: 'info'
        });
        return;
      }
      
      const { success } = await applyToJob(companyId);
      
      // Update application status locally
      const updatedStatuses = { ...applicationStatuses };
      updatedStatuses[companyId] = 'pending';
      setApplicationStatuses(updatedStatuses);
      
      setNotification({
        open: true,
        message: `Successfully applied to ${companyName}!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error applying to job:', error);
      
      // Check if this is a schema error
      if (error.message && error.message.includes('column')) {
        setIsSchemaUpdateNeeded(true);
      }
      
      setNotification({
        open: true,
        message: error.message || 'Error applying to job',
        severity: 'error'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const loadApplicationStatuses = async () => {
    try {
      if (!session) {
        console.log('No active session, cannot load application statuses');
        return;
      }
      
      console.log('Loading application statuses for current student');
      
      // Use the getStudentApplications function to get all applications in one go
      const applications = await getStudentApplications();
      console.log('Fetched applications:', applications);
      
      if (!applications || applications.length === 0) {
        console.log('No applications found for this student');
        return;
      }
      
      const statuses = {};
      applications.forEach(app => {
        if (app.companies && app.companies.id) {
          console.log(`Setting status for company ${app.companies.company_name} (${app.companies.id}): ${app.status}`);
          statuses[app.companies.id] = app.status;
        } else {
          console.warn('Application missing company data:', app);
        }
      });
      
      console.log('Final application statuses:', statuses);
      setApplicationStatuses(statuses);
    } catch (error) {
      console.error('Error loading application statuses:', error);
      setNotification({
        open: true,
        message: 'Failed to load your application statuses',
        severity: 'error'
      });
    }
  };

  // Load application statuses when companies are loaded
  useEffect(() => {
    if (matchedCompanies.length > 0) {
      loadApplicationStatuses();
    }
  }, [matchedCompanies]);

  // Add this before the final return statement to conditionally render the schema update dialog
  if (isSchemaUpdateNeeded) {
    return (
      <Box sx={dashboardStyles.root}>
        <Paper sx={{ p: isMobile ? 2 : 4, maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Database Update Required
          </Typography>
          <Typography variant="body1" paragraph>
            There seems to be an issue with the database schema. This can happen when the application is updated but the database hasn't been migrated yet.
          </Typography>
          <Typography variant="body1" paragraph>
            Click the button below to update the database schema. This will only take a moment.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpdateSchema}
            disabled={isUpdatingSchema}
            sx={{ mt: 2 }}
            fullWidth={isMobile}
          >
            {isUpdatingSchema ? 'Updating Schema...' : 'Update Database Schema'}
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={dashboardStyles.root}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center', 
        mb: 3,
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant={isMobile ? "h5" : "h4"}>Student Dashboard</Typography>
      </Box>

      {/* Main Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)} 
          variant={isMobile ? "fullWidth" : "standard"}
          centered
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '& .MuiTab-root': {
              py: 2
            }
          }}
        >
          <Tab 
            icon={<AssignmentIcon />} 
            label="Resume & Jobs" 
            iconPosition="start"
            sx={{ 
              minWidth: isMobile ? '0' : '160px',
              px: isMobile ? 1 : 2
            }}
          />
          <Tab 
            icon={<QuizIcon />} 
            label="Mock Tests" 
            iconPosition="start"
            sx={{ 
              minWidth: isMobile ? '0' : '160px',
              px: isMobile ? 1 : 2
            }}
          />
          <Tab 
            icon={<AccountCircleIcon />} 
            label="Profile" 
            iconPosition="start"
            sx={{ 
              minWidth: isMobile ? '0' : '160px',
              px: isMobile ? 1 : 2
            }}
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {/* Resume & Jobs Tab */}
        {activeTab === 0 && (
          <Grid container spacing={isMobile ? 2 : 3}>
            {/* Resume Upload Section */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: isMobile ? 2 : 3, height: '100%', mb: isMobile ? 2 : 0 }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2,
                  color: 'primary.main'
                }}>
                  <CloudUploadIcon sx={{ mr: 1 }} /> Resume Upload
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {/* Resume Upload Card */}
                <Box sx={{ mb: 3 }}>
                  <Card sx={{ 
                    p: 2, 
                    border: '2px dashed #ccc',
                    backgroundColor: '#f8f8f8',
                    transition: 'all 0.3s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: '#f0f7ff'
                    }
                  }}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleResumeUpload}
                      style={{ display: 'none' }}
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload">
                      <Button
                        variant="contained"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        fullWidth
                        sx={{ mb: 1 }}
                      >
                        Upload Resume (PDF)
                      </Button>
                    </label>
                    <Typography variant="body2" color="text.secondary" align="center">
                      Max size: 10MB, PDF format only
                    </Typography>
                  </Card>
                </Box>

                {/* Resume File Details */}
                {resume && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Resume: {resume.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Size: {Math.round(resume.size / 1024)} KB
                    </Typography>
                    <LinearProgress 
                      variant={isAnalyzing ? "indeterminate" : "determinate"} 
                      value={100}
                      sx={{ mb: 1 }}
                    />
                    {isAnalyzing && (
                      <Typography variant="body2" align="center">
                        Analyzing resume...
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Field Analysis */}
                {resumeAnalysis && !isAnalyzing && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Career Field Analysis
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel id="field-select-label">Select Field</InputLabel>
                      <Select
                        labelId="field-select-label"
                        value={selectedField}
                        label="Select Field"
                        onChange={(e) => handleFieldChange(e.target.value)}
                      >
                        {availableFields.map((field) => (
                          <MenuItem key={field} value={field}>
                            {field}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Field Scores */}
                    {fieldScores[selectedField] && (
                      <Box>
                        <Typography variant="body2" gutterBottom>
                          Your skills match for {selectedField}:
                        </Typography>
                        {Object.entries(fieldScores[selectedField]?.categories || {}).map(([category, score]) => (
                          <Box key={category} sx={{ mb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="body2">
                                {category.charAt(0).toUpperCase() + category.slice(1)} Skills
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {Math.round(score)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.round(score)}
                              color={
                                score > 75 ? "success" :
                                score > 50 ? "primary" :
                                score > 25 ? "warning" : "error"
                              }
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        ))}
                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => searchJobsForField(selectedField, fieldScores[selectedField]?.skills || [])}
                            fullWidth
                          >
                            Find Matching Jobs
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Job Matches Section */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: isMobile ? 2 : 3, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    color: 'primary.main'
                  }}>
                    <WorkIcon sx={{ mr: 1 }} /> Job Opportunities
                  </Typography>
                  <Tooltip title="Companies are ranked based on skill match and field relevance">
                    <IconButton size="small" sx={{ ml: 1 }}>
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Job Search */}
                <Box sx={{ mb: 3, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 1 }}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Search by Skills</InputLabel>
                    <Select
                      value={searchSkills}
                      onChange={(e) => setSearchSkills(e.target.value)}
                      label="Search by Skills"
                    >
                      <MenuItem value="">All Skills</MenuItem>
                      <MenuItem value="javascript">JavaScript</MenuItem>
                      <MenuItem value="python">Python</MenuItem>
                      <MenuItem value="react">React</MenuItem>
                      <MenuItem value="nodejs">Node.js</MenuItem>
                      <MenuItem value="sql">SQL</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    onClick={() => searchJobsForField(selectedField, [searchSkills])}
                    disabled={isSearching}
                    sx={{ minWidth: isMobile ? '100%' : '120px' }}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </Box>

                {/* List of Matched Companies */}
                {matchedCompanies.length > 0 ? (
                  <Grid container spacing={2}>
                    {matchedCompanies.map((company, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: 3,
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {company.company_name}
                            </Typography>
                            <Box sx={{ mb: 1 }}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Match Score: {company.match_score}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={company.match_score}
                                color={
                                  company.match_score > 75 ? "success" :
                                  company.match_score > 50 ? "primary" :
                                  company.match_score > 25 ? "warning" : "error"
                                }
                                sx={{ height: 6, borderRadius: 3 }}
                              />
                            </Box>
                            <Typography variant="body2" gutterBottom>
                              <strong>Job:</strong> {company.job_title || 'Software Developer'}
                            </Typography>
                            <Typography variant="body2" gutterBottom>
                              {company.job_description?.substring(0, 100)}...
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                              <Button
                                size="small"
                                onClick={() => handleCustomizeResume(company)}
                                sx={{ mr: 1 }}
                                variant="outlined"
                              >
                                Customize Resume
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="primary"
                                onClick={() => handleApply(company.id, company.company_name)}
                                disabled={applicationStatuses[company.id] === 'applied'}
                              >
                                {applicationStatuses[company.id] === 'applied' ? 'Applied' : 'Apply'}
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center">
                    No matching companies found. Try uploading your resume or adjusting your skills.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Mock Tests Tab */}
        {activeTab === 1 && (
          <Paper sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 2,
              color: 'primary.main'
            }}>
              <QuizIcon sx={{ mr: 1 }} /> Available Mock Tests
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              {Object.entries(mockTests).map(([category, tests]) => (
                <Grid item xs={12} key={category}>
                  <Typography variant="subtitle1" color="primary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {category} Tests
                  </Typography>
                  <Grid container spacing={2}>
                    {tests.map((test) => (
                      <Grid item xs={12} sm={6} md={4} key={test.id}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            cursor: 'pointer',
                            '&:hover': { 
                              boxShadow: 3,
                              transform: 'translateY(-2px)',
                              transition: 'all 0.3s'
                            }
                          }}
                          onClick={() => handleTestSelect(test)}
                        >
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {test.name}
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Duration: {test.duration}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Questions: {test.questions}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* Profile Tab */}
        {activeTab === 2 && (
          <Paper sx={{ p: isMobile ? 2 : 3 }}>
            <Typography variant="h6" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              mb: 2,
              color: 'primary.main'
            }}>
              <AccountCircleIcon sx={{ mr: 1 }} /> Student Profile
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {profile ? (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                        Personal Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Name
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {profile.full_name || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Student ID
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {profile.student_id || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {profile.email || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Phone
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {profile.phone || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Address
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {profile.address || 'Not provided'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                        Academic Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Program
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {profile.program || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Year Level
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {profile.year_level || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Skills
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            {(profile.skills || []).length > 0 ? 
                              profile.skills.map((skill, index) => (
                                <Chip 
                                  key={index} 
                                  label={skill} 
                                  size="small" 
                                  sx={{ m: 0.5 }} 
                                  color="primary" 
                                  variant="outlined" 
                                />
                              )) : 
                              <Typography variant="body2" color="text.secondary">
                                No skills added yet
                              </Typography>
                            }
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ color: 'primary.main' }}>
                          Academic Records & Applications
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary"
                          component={Link}
                          to="/student/profile"
                        >
                          Edit Profile
                        </Button>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            GPA
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {profile.gpa || 'Not provided'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Applications
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {Object.keys(applicationStatuses).length || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Resume Uploaded
                          </Typography>
                          <Typography variant="body1" gutterBottom>
                            {resume ? 'Yes' : 'No'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  Loading profile information...
                </Typography>
                <LinearProgress sx={{ mt: 2, mx: 'auto', maxWidth: '60%' }} />
              </Box>
            )}
          </Paper>
        )}
      </Box>

      {/* Customize Resume Dialog */}
      <Dialog open={openCustomizeDialog} onClose={() => setOpenCustomizeDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Customize Resume for {selectedCompany?.company_name}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Here are some suggestions to customize your resume for this position:
          </Typography>
          {selectedCompany?.matchedSkills && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Highlight these matching skills:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {selectedCompany.matchedSkills.map((skill, index) => (
                  <Chip key={index} label={skill} color="success" />
                ))}
              </Box>
            </>
          )}
          {selectedCompany?.job_requirements && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Consider adding experience with:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedCompany.job_requirements
                  .split(',')
                  .filter(req => !selectedCompany.matchedSkills?.includes(req.trim().toLowerCase()))
                  .map((req, index) => (
                    <Chip key={index} label={req.trim()} variant="outlined" />
                  ))}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenCustomizeDialog(false)}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleApply}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mock Test Dialog */}
      <Dialog open={openTestDialog} onClose={() => setOpenTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Start Mock Test</DialogTitle>
        <DialogContent>
          {selectedTest && (
            <>
              <Typography variant="h6" gutterBottom>
                {selectedTest.name}
              </Typography>
              <Typography variant="body1" paragraph>
                This test will help you prepare for technical interviews and assess your knowledge.
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Test Details:
                </Typography>
                <Typography variant="body2">
                  • Duration: {selectedTest.duration}
                </Typography>
                <Typography variant="body2">
                  • Number of Questions: {selectedTest.questions}
                </Typography>
                <Typography variant="body2">
                  • No negative marking
                </Typography>
              </Box>
              <Typography variant="body2" color="warning.main">
                Note: Make sure you have a stable internet connection before starting the test.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenTestDialog(false)}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              // Handle test start
              setOpenTestDialog(false);
            }}
            fullWidth={isMobile}
            size={isMobile ? "small" : "medium"}
          >
            Start Test
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
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

export default StudentDashboard;
