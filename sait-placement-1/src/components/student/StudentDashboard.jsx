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
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WorkIcon from '@mui/icons-material/Work';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { dashboardStyles } from '../../styles/dashboardStyles';
import { extractTextFromPDF, validatePDFFile } from '../../utils/pdfUtils';

const StudentDashboard = () => {
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchedCompanies, setMatchedCompanies] = useState([]);
  const [selectedField, setSelectedField] = useState('Software Development');
  const [openCustomizeDialog, setOpenCustomizeDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Available fields for job search
  const availableFields = [
    'Software Development',
    'Data Science',
    'Frontend Development',
    'Backend Development',
    'DevOps Engineering',
    'Mobile Development'
  ];

  // Comprehensive skills database with variations and categories
  const skillsDatabase = {
    'Software Development': {
      core: {
        'JavaScript': ['javascript', 'js', 'es6', 'es2015', 'ecmascript', 'vanilla js', 'typescript', 'ts'],
        'Python': ['python', 'py', 'python3', 'django', 'flask', 'fastapi'],
        'Java': ['java', 'java8', 'java11', 'java17', 'spring', 'spring boot', 'hibernate'],
        'C++': ['c++', 'cpp', 'c plus plus', 'stl', 'boost'],
        'C#': ['c#', 'csharp', '.net', 'dotnet', 'asp.net', '.net core']
      },
      web: {
        'HTML': ['html', 'html5', 'semantic html', 'web development'],
        'CSS': ['css', 'css3', 'scss', 'sass', 'less', 'styled-components', 'tailwind'],
        'React': ['react', 'reactjs', 'react.js', 'react native', 'redux', 'hooks'],
        'Angular': ['angular', 'angularjs', 'angular2+', 'ng', 'typescript'],
        'Vue.js': ['vue', 'vuejs', 'vue.js', 'vuex', 'nuxt'],
        'Node.js': ['node', 'nodejs', 'node.js', 'express', 'nestjs', 'deno']
      },
      database: {
        'SQL': ['sql', 'mysql', 'postgresql', 'database', 'rdbms', 'oracle'],
        'MongoDB': ['mongodb', 'mongo', 'nosql', 'mongoose', 'document db'],
        'Redis': ['redis', 'caching', 'in-memory', 'key-value'],
        'PostgreSQL': ['postgresql', 'postgres', 'psql']
      },
      tools: {
        'Git': ['git', 'github', 'gitlab', 'bitbucket', 'version control'],
        'Docker': ['docker', 'containerization', 'kubernetes', 'k8s', 'container'],
        'AWS': ['aws', 'amazon web services', 'cloud', 'ec2', 's3', 'lambda'],
        'Linux': ['linux', 'unix', 'bash', 'shell scripting', 'command line']
      }
    },
    'Frontend Development': {
      core: {
        'JavaScript': ['javascript', 'js', 'es6', 'es2015', 'typescript', 'ts'],
        'HTML': ['html', 'html5', 'semantic html', 'accessibility', 'a11y'],
        'CSS': ['css', 'css3', 'scss', 'sass', 'less', 'styled-components', 'tailwind']
      },
      frameworks: {
        'React': ['react', 'reactjs', 'react.js', 'hooks', 'redux', 'context api'],
        'Vue.js': ['vue', 'vuejs', 'vue.js', 'vuex', 'composition api'],
        'Angular': ['angular', 'angularjs', 'angular2+', 'rxjs', 'ngrx'],
        'Next.js': ['next', 'nextjs', 'next.js', 'ssr', 'static site'],
        'Svelte': ['svelte', 'sveltekit', 'reactive']
      },
      tools: {
        'Webpack': ['webpack', 'bundler', 'module bundler'],
        'Jest': ['jest', 'testing', 'unit test', 'react testing library'],
        'TypeScript': ['typescript', 'ts', 'type safety'],
        'GraphQL': ['graphql', 'apollo', 'relay']
      },
      design: {
        'UI/UX': ['ui design', 'ux design', 'user interface', 'user experience', 'figma', 'sketch'],
        'Responsive Design': ['responsive', 'mobile first', 'media queries'],
        'CSS Frameworks': ['bootstrap', 'material ui', 'tailwind', 'chakra ui']
      }
    },
    'Backend Development': {
      core: {
        'Node.js': ['node', 'nodejs', 'express', 'nestjs', 'fastify'],
        'Python': ['python', 'django', 'flask', 'fastapi', 'sqlalchemy'],
        'Java': ['java', 'spring', 'spring boot', 'hibernate', 'jakarta ee'],
        'Go': ['golang', 'go lang', 'goroutines', 'gin'],
        'PHP': ['php', 'laravel', 'symfony', 'composer']
      },
      database: {
        'SQL': ['sql', 'mysql', 'postgresql', 'oracle', 'sql server'],
        'NoSQL': ['mongodb', 'dynamodb', 'cassandra', 'couchbase'],
        'GraphQL': ['graphql', 'apollo server', 'prisma'],
        'Redis': ['redis', 'caching', 'pub/sub', 'session store']
      },
      architecture: {
        'Microservices': ['microservices', 'service mesh', 'api gateway'],
        'REST': ['rest', 'restful', 'api design', 'swagger', 'openapi'],
        'Message Queues': ['rabbitmq', 'kafka', 'redis pub/sub', 'sqs']
      },
      devops: {
        'Docker': ['docker', 'containerization', 'docker-compose'],
        'Kubernetes': ['kubernetes', 'k8s', 'container orchestration'],
        'CI/CD': ['jenkins', 'github actions', 'gitlab ci', 'travis']
      }
    },
    'Data Science': {
      core: {
        'Python': ['python', 'py', 'python3', 'numpy', 'pandas'],
        'R': ['r programming', 'r language', 'rstudio', 'tidyverse'],
        'SQL': ['sql', 'mysql', 'postgresql', 'database querying'],
        'Statistics': ['statistics', 'statistical analysis', 'hypothesis testing', 'probability'],
        'Machine Learning': ['machine learning', 'ml', 'deep learning', 'neural networks', 'ai']
      },
      libraries: {
        'TensorFlow': ['tensorflow', 'tf', 'keras', 'deep learning'],
        'PyTorch': ['pytorch', 'torch', 'neural networks'],
        'Scikit-learn': ['scikit-learn', 'sklearn', 'machine learning'],
        'Pandas': ['pandas', 'pd', 'data manipulation'],
        'NumPy': ['numpy', 'np', 'numerical computing'],
        'SciPy': ['scipy', 'scientific computing'],
        'Matplotlib': ['matplotlib', 'plt', 'data visualization'],
        'Seaborn': ['seaborn', 'sns', 'statistical visualization']
      },
      tools: {
        'Jupyter': ['jupyter', 'jupyter notebook', 'jupyter lab', 'colab'],
        'Git': ['git', 'github', 'version control'],
        'Docker': ['docker', 'containerization'],
        'Spark': ['spark', 'pyspark', 'apache spark', 'big data'],
        'Hadoop': ['hadoop', 'hdfs', 'mapreduce', 'big data']
      },
      concepts: {
        'Data Visualization': ['visualization', 'dashboards', 'tableau', 'power bi'],
        'Big Data': ['big data', 'hadoop', 'spark', 'distributed computing'],
        'NLP': ['natural language processing', 'nlp', 'text analysis', 'bert']
      }
    }
  };

  // Enhanced company database with weighted requirements
  const companyDatabase = [
    {
      name: 'Tech Solutions Inc',
      position: 'Full Stack Developer',
      fields: ['Software Development', 'Frontend Development', 'Backend Development'],
      requirements: {
        'JavaScript': 0.9,
        'React': 0.8,
        'Node.js': 0.8,
        'SQL': 0.7,
        'Git': 0.6,
        'AWS': 0.5
      },
      description: 'Leading tech company specializing in web applications',
      location: 'Remote',
      salary: '$90,000 - $130,000'
    },
    {
      name: 'Data Insights AI',
      position: 'Data Scientist',
      fields: ['Data Science'],
      requirements: {
        'Python': 0.9,
        'Machine Learning': 0.9,
        'Statistics': 0.8,
        'SQL': 0.7,
        'TensorFlow': 0.6,
        'Pandas': 0.6,
        'Scikit-learn': 0.5
      },
      description: 'AI research and development company focused on machine learning solutions',
      location: 'New York',
      salary: '$100,000 - $150,000'
    },
    {
      name: 'Frontend Masters',
      position: 'Senior Frontend Developer',
      fields: ['Frontend Development', 'Software Development'],
      requirements: {
        'JavaScript': 0.9,
        'React': 0.9,
        'TypeScript': 0.8,
        'CSS': 0.8,
        'HTML': 0.7,
        'Vue.js': 0.6
      },
      description: 'Leading e-commerce platform focusing on user experience',
      location: 'San Francisco',
      salary: '$120,000 - $160,000'
    },
    {
      name: 'Cloud Systems Pro',
      position: 'Backend Engineer',
      fields: ['Backend Development', 'Software Development'],
      requirements: {
        'Java': 0.9,
        'Spring Boot': 0.8,
        'SQL': 0.8,
        'Microservices': 0.7,
        'Docker': 0.7,
        'Kubernetes': 0.6
      },
      description: 'Enterprise cloud solutions provider',
      location: 'Austin',
      salary: '$95,000 - $140,000'
    },
    {
      name: 'AI Research Labs',
      position: 'Machine Learning Engineer',
      fields: ['Data Science', 'Software Development'],
      requirements: {
        'Python': 0.9,
        'TensorFlow': 0.9,
        'Machine Learning': 0.8,
        'Deep Learning': 0.8,
        'NLP': 0.7,
        'SQL': 0.6
      },
      description: 'Cutting-edge AI research company',
      location: 'Boston',
      salary: '$130,000 - $180,000'
    },
    {
      name: 'Innovative Web Solutions',
      position: 'Frontend Developer',
      fields: ['Frontend Development'],
      requirements: {
        'React': 0.9,
        'TypeScript': 0.8,
        'CSS': 0.8,
        'HTML': 0.7,
        'Jest': 0.6,
        'GraphQL': 0.5
      },
      description: 'Digital agency specializing in modern web applications',
      location: 'Chicago',
      salary: '$85,000 - $120,000'
    }
  ];

  // Enhanced skill extraction with better pattern matching
  const extractSkills = (text, field) => {
    const foundSkills = new Set();
    const text_lower = text.toLowerCase();
    
    console.log('Analyzing text:', text_lower.substring(0, 100) + '...'); // Debug log
    
    // Helper function to check if any variation of a skill exists in the text
    const hasSkill = (variations, mainSkill) => {
      for (const variation of variations) {
        // Split the variation into words to handle multi-word skills
        const words = variation.toLowerCase().split(' ');
        const allWordsPresent = words.every(word => {
          // Escape special regex characters
          const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const pattern = new RegExp(`\\b${escaped}\\b`);
          return pattern.test(text_lower);
        });
        
        if (allWordsPresent) {
          console.log(`Found skill: ${mainSkill} (matched: ${variation})`); // Debug log
          return true;
        }
      }
      return false;
    };

    try {
      // Get relevant skill categories based on field
      let relevantSkills = skillsDatabase[field];
      
      if (!relevantSkills) {
        console.warn(`No skills defined for field: ${field}, defaulting to Software Development`);
        relevantSkills = skillsDatabase['Software Development'];
      }
      
      console.log('Searching in field:', field); // Debug log
      
      // Process each category in the relevant field
      Object.entries(relevantSkills).forEach(([category, skills]) => {
        console.log(`Checking category: ${category}`); // Debug log
        Object.entries(skills).forEach(([mainSkill, variations]) => {
          if (hasSkill(variations, mainSkill)) {
            foundSkills.add(mainSkill);
          }
        });
      });

      // Look for related skills in other relevant fields
      const relatedFields = companyDatabase
        .filter(company => company.fields.includes(field))
        .flatMap(company => company.fields)
        .filter(f => f !== field);

      console.log('Related fields:', relatedFields); // Debug log

      // Add skills from related fields if they're mentioned
      relatedFields.forEach(relatedField => {
        if (skillsDatabase[relatedField]) {
          Object.values(skillsDatabase[relatedField]).forEach(categorySkills => {
            Object.entries(categorySkills).forEach(([mainSkill, variations]) => {
              if (hasSkill(variations, mainSkill)) {
                foundSkills.add(mainSkill);
              }
            });
          });
        }
      });

    } catch (error) {
      console.error('Error extracting skills:', error);
      return [];
    }

    const result = Array.from(foundSkills);
    console.log('Final detected skills:', result); // Debug log
    return result;
  };

  // Enhanced match score calculation with weightage
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

  // Analyze resume with enhanced logic
  const analyzeResume = async (file) => {
    console.log('Starting resume analysis...');
    setIsAnalyzing(true);
    
    try {
      let textToAnalyze = resumeText;
      
      // Extract text if needed
      if (!textToAnalyze) {
        console.log('No existing resume text, starting extraction...');
        validatePDFFile(file);
        textToAnalyze = await extractTextFromPDF(file);
        
        if (!textToAnalyze || textToAnalyze.trim().length === 0) {
          throw new Error('No text could be extracted from the PDF. Please ensure the PDF contains selectable text.');
        }
        
        setResumeText(textToAnalyze);
      }
      
      console.log('Starting skill extraction for field:', selectedField);
      
      const detectedSkills = extractSkills(textToAnalyze, selectedField);
      console.log('Detected skills:', detectedSkills);

      // Match with companies using weighted requirements
      const matches = companyDatabase
        .filter(company => company.fields.includes(selectedField))
        .map(company => {
          const matchResult = calculateMatchScore(detectedSkills, company.requirements);
          return {
            ...company,
            match: matchResult.score,
            matchedSkills: matchResult.matchedSkills,
            missingSkills: matchResult.missingSkills,
            desiredSkills: Object.keys(company.requirements)
          };
        })
        .filter(company => company.match > 30)
        .sort((a, b) => b.match - a.match);

      const analysis = {
        skills: detectedSkills,
        missingSkills: Array.from(new Set(matches.flatMap(m => m.missingSkills))),
        strengthAreas: detectedSkills.slice(0, 3),
        improvementAreas: Array.from(new Set(matches.flatMap(m => m.missingSkills))).slice(0, 3),
        score: matches.length > 0 ? Math.round(matches.reduce((acc, curr) => acc + curr.match, 0) / matches.length) : 0
      };

      setResumeAnalysis(analysis);
      setMatchedCompanies(matches);
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert(error.message || 'Failed to analyze resume. Please try again.');
      // Reset states on error
      setResumeText('');
      setResumeAnalysis(null);
      setMatchedCompanies([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toISOString()
    });
    
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    
    try {
      setResume(file);
      // Reset previous analysis
      setResumeAnalysis(null);
      setMatchedCompanies([]);
      
      // Start PDF processing
      console.log('Starting PDF processing...');
      setIsAnalyzing(true);
      
      // Validate PDF first
      console.log('Validating PDF...');
      validatePDFFile(file);
      
      // Extract text
      console.log('Extracting text from PDF...');
      const text = await extractTextFromPDF(file);
      
      console.log('Text extraction result:', {
        success: !!text,
        textLength: text ? text.length : 0,
        sampleText: text ? text.substring(0, 100) + '...' : 'No text extracted'
      });
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF. Please ensure the PDF contains selectable text.');
      }
      
      // Set the extracted text and analyze it
      console.log('Setting resume text and analyzing...');
      setResumeText(text);
      
      // Process the extracted text directly instead of relying on state
      const detectedSkills = extractSkills(text, selectedField);
      console.log('Detected skills:', detectedSkills);

      // Match with companies using weighted requirements
      const matches = companyDatabase
        .filter(company => company.fields.includes(selectedField))
        .map(company => {
          const matchResult = calculateMatchScore(detectedSkills, company.requirements);
          return {
            ...company,
            match: matchResult.score,
            matchedSkills: matchResult.matchedSkills,
            missingSkills: matchResult.missingSkills,
            desiredSkills: Object.keys(company.requirements)
          };
        })
        .filter(company => company.match > 30)
        .sort((a, b) => b.match - a.match);

      console.log('Matched companies:', matches.length);

      // Set analysis results
      const analysis = {
        skills: detectedSkills,
        missingSkills: Array.from(new Set(matches.flatMap(m => m.missingSkills))),
        strengthAreas: detectedSkills.slice(0, 3),
        improvementAreas: Array.from(new Set(matches.flatMap(m => m.missingSkills))).slice(0, 3),
        score: matches.length > 0 ? Math.round(matches.reduce((acc, curr) => acc + curr.match, 0) / matches.length) : 0
      };

      setResumeAnalysis(analysis);
      setMatchedCompanies(matches);
      
    } catch (error) {
      console.error('Error in resume upload process:', error);
      alert(error.message || 'Failed to process resume. Please ensure the PDF contains selectable text and try again.');
      // Reset states on error
      setResume(null);
      setResumeText('');
      setResumeAnalysis(null);
      setMatchedCompanies([]);
    } finally {
      setIsAnalyzing(false);
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
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Dashboard
          </Typography>
          <IconButton color="inherit">
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Field Selection */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Field</InputLabel>
              <Select
                value={selectedField}
                label="Field"
                onChange={(e) => {
                  setSelectedField(e.target.value);
                  if (resume && resumeText) {
                    analyzeResume(resume);
                  }
                }}
              >
                {availableFields.map((field) => (
                  <MenuItem key={field} value={field}>
                    {field}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Resume Upload Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Resume Upload
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? 'Analyzing...' : 'Upload Resume (PDF)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleResumeUpload}
                  disabled={isAnalyzing}
                />
              </Button>

              {isAnalyzing && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography>Analyzing resume...</Typography>
                </Box>
              )}

              {resumeAnalysis && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Analysis Results</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Detected Skills:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                        {resumeAnalysis.skills.map((skill, index) => (
                          <Chip key={index} label={skill} />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Missing Skills:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
                        {resumeAnalysis.missingSkills.map((skill, index) => (
                          <Chip key={index} label={skill} color="error" variant="outlined" />
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Overall Match Score:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={resumeAnalysis.score} 
                        sx={{ mt: 1 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {resumeAnalysis.score}%
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Matched Companies Section */}
          {matchedCompanies.length > 0 && (
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <WorkIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    Matched Companies
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {matchedCompanies.map((company, index) => (
                    <Grid item xs={12} key={index}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {company.name}
                          </Typography>
                          <Typography color="textSecondary" gutterBottom>
                            {company.position} | {company.location}
                          </Typography>
                          <Box sx={{ mt: 2, mb: 1 }}>
                            <Typography variant="subtitle2">Match Score:</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={company.match}
                              color={company.match > 70 ? "success" : "warning"}
                            />
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {company.match}%
                            </Typography>
                          </Box>
                          <Typography variant="subtitle2">Required Skills:</Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
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
                          <Button
                            variant="outlined"
                            onClick={() => handleCustomizeResume(company)}
                            sx={{ mt: 2 }}
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
          )}

          {/* Mock Tests Section */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AssignmentIcon sx={{ mr: 1 }} />
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
