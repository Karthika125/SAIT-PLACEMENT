import React, { useState, useEffect } from 'react';
import { 
  AppBar,
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Toolbar,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  Fab,
  Zoom,
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import SearchIcon from '@mui/icons-material/Search';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMedium = useMediaQuery(theme.breakpoints.down('md'));
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Control visibility of scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        color="default" 
        elevation={0} 
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <SchoolIcon 
              sx={{ 
                mr: 1, 
                color: theme.palette.primary.main
              }} 
            />
            SAIT Placement Portal
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/auth"
            size={isMobile ? "small" : "medium"}
          >
            Log In
          </Button>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed AppBar */}

      {/* Hero Section */}
      <Box 
        sx={{ 
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
          color: 'white',
          pt: { xs: 8, md: 12 },
          pb: { xs: 10, md: 14 }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography 
                variant={isMobile ? "h3" : "h2"} 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                Connect Talents with Opportunities
              </Typography>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                component="p" 
                sx={{ mb: 4, opacity: 0.9 }}
              >
                SAIT Placement Portal bridges the gap between talented students and industry-leading companies. 
                Our platform streamlines the recruitment process, making it easier for students to showcase their 
                skills and for companies to find the perfect match.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large" 
                component={Link} 
                to="/auth"
                sx={{ 
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 14px 0 rgba(0,0,0,0.25)'
                }}
              >
                Get Started
              </Button>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src="https://img.freepik.com/free-vector/business-team-discussing-ideas-startup_74855-4380.jpg"
                alt="Students and companies connecting"
                sx={{
                  width: '100%',
                  borderRadius: 2,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  display: { xs: 'none', md: 'block' }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container>
        <Grid 
          container 
          spacing={3} 
          sx={{ 
            mt: -6,
            mb: 8,
            justifyContent: 'center'
          }}
        >
          {[
            { icon: <SchoolIcon />, label: 'Students', count: '2,500+' },
            { icon: <BusinessIcon />, label: 'Companies', count: '200+' },
            { icon: <WorkIcon />, label: 'Job Postings', count: '750+' },
            { icon: <TrendingUpIcon />, label: 'Placement Rate', count: '95%' }
          ].map((stat, index) => (
            <Grid item xs={6} sm={3} key={index}>
              <Paper
                elevation={3}
                sx={{
                  py: 3,
                  px: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  borderRadius: 2,
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 56,
                    height: 56,
                    mb: 2
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {stat.count}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            align="center" 
            sx={{ 
              mb: 1, 
              fontWeight: 'bold' 
            }}
          >
            Platform Features
          </Typography>
          <Typography 
            variant="h6" 
            component="p" 
            align="center" 
            color="text.secondary" 
            sx={{ mb: 6 }}
          >
            Everything you need for successful career placement
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                title: 'Student Profiles',
                description: 'Create comprehensive profiles showcasing your academic achievements, skills, and experience.',
                icon: <AccountBoxIcon sx={{ fontSize: 40 }} />
              },
              {
                title: 'Company Listings',
                description: 'Browse detailed company profiles to find organizations that match your career goals.',
                icon: <BusinessIcon sx={{ fontSize: 40 }} />
              },
              {
                title: 'Resume Analysis',
                description: 'Get insights on how to improve your resume with our automated analysis tools.',
                icon: <DocumentScannerIcon sx={{ fontSize: 40 }} />
              },
              {
                title: 'Smart Job Matching',
                description: 'Our algorithm matches students with job postings based on skills and preferences.',
                icon: <SearchIcon sx={{ fontSize: 40 }} />
              },
              {
                title: 'Application Tracking',
                description: 'Track all your applications in one place with real-time status updates.',
                icon: <TrackChangesIcon sx={{ fontSize: 40 }} />
              },
              {
                title: 'Networking Opportunities',
                description: 'Connect with alumni, industry professionals, and fellow students.',
                icon: <AlternateEmailIcon sx={{ fontSize: 40 }} />
              }
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        color: theme.palette.primary.main
                      }}
                    >
                      {feature.icon}
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          ml: 1,
                          fontWeight: 'bold'
                        }}
                      >
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            align="center" 
            sx={{ 
              mb: 1, 
              fontWeight: 'bold' 
            }}
          >
            How It Works
          </Typography>
          <Typography 
            variant="h6" 
            component="p" 
            align="center" 
            color="text.secondary" 
            sx={{ mb: 6 }}
          >
            Simple process, powerful results
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.primary.light}`,
                  height: '100%'
                }}
              >
                <Typography 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 'bold',
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <SchoolIcon sx={{ mr: 1 }} /> For Students
                </Typography>
                <Box>
                  {[
                    'Create your academic profile with skills, courses, and experience',
                    'Upload your resume for automated analysis and improvement suggestions',
                    'Browse company profiles and available job postings',
                    'Apply to positions that match your skills and interests',
                    'Track your applications and receive updates from employers'
                  ].map((step, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        mb: 2,
                        alignItems: 'flex-start'
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          width: 30,
                          height: 30,
                          fontSize: '0.875rem',
                          mr: 2,
                          mt: 0.5
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Typography variant="body1">
                        {step}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.secondary.light}`,
                  height: '100%'
                }}
              >
                <Typography 
                  variant="h5" 
                  component="h3" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 'bold',
                    color: theme.palette.secondary.main,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <BusinessIcon sx={{ mr: 1 }} /> For Companies
                </Typography>
                <Box>
                  {[
                    'Create a comprehensive company profile with details about your organization',
                    'Post job openings with specific requirements and qualifications',
                    'Receive applications from qualified students matching your criteria',
                    'Review student profiles, resumes, and academic backgrounds',
                    'Manage the hiring process and communicate with candidates directly'
                  ].map((step, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        mb: 2,
                        alignItems: 'flex-start'
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.secondary.main,
                          width: 30,
                          height: 30,
                          fontSize: '0.875rem',
                          mr: 2,
                          mt: 0.5
                        }}
                      >
                        {index + 1}
                      </Avatar>
                      <Typography variant="body1">
                        {step}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Box 
        sx={{ 
          py: 8, 
          bgcolor: theme.palette.primary.main,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              mb: 3, 
              fontWeight: 'bold' 
            }}
          >
            Ready to Get Started?
          </Typography>
          <Typography 
            variant="h6" 
            component="p" 
            sx={{ 
              mb: 4,
              opacity: 0.9,
              maxWidth: 800,
              mx: 'auto'
            }}
          >
            Join SAIT Placement Portal today and take the next step in your career journey or find the perfect talent for your organization.
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large" 
            component={Link} 
            to="/auth"
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            Join Now
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1c2331', color: 'white', py: 6 }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                SAIT Placement Portal
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.7 }}>
                Connecting talented students with industry-leading companies for successful career placements.
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Quick Links
              </Typography>
              <Box component="ul" sx={{ pl: 0, listStyle: 'none' }}>
                {[
                  { text: 'Student Login', to: '/auth' },
                  { text: 'Company Login', to: '/auth' },
                  { text: 'About SAIT', to: '#' },
                  { text: 'Privacy Policy', to: '#' }
                ].map((link, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Link
                      to={link.to}
                      style={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        textDecoration: 'none',
                        transition: 'color 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.color = 'white'}
                      onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}
                    >
                      {link.text}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Contact
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
                Southern Alberta Institute of Technology
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
                1301 16 Ave NW, Calgary, AB T2M 0L4
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, opacity: 0.7 }}>
                placement@sait.ca
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                (403) 284-7248
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />
          <Typography variant="body2" align="center" sx={{ opacity: 0.6 }}>
            © {new Date().getFullYear()} SAIT Placement Portal. All rights reserved.
          </Typography>
        </Container>
      </Box>

      {/* Scroll to top button */}
      <Zoom in={showScrollTop}>
        <Fab
          color="primary"
          size="small"
          aria-label="scroll back to top"
          onClick={scrollToTop}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <ArrowUpwardIcon />
        </Fab>
      </Zoom>
    </Box>
  );
};

export default LandingPage;
