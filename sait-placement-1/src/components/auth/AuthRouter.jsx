import React from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AuthRouter = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#f5f5f5'
      }}
    >
      <Container 
        maxWidth="md" 
        sx={{ 
          py: 4, 
          display: 'flex', 
          flexDirection: 'column',
          flexGrow: 1, 
          alignItems: 'center', 
          justifyContent: 'center'
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, md: 5 }, 
            width: '100%', 
            maxWidth: 800,
            borderRadius: 2
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 4
            }}
          >
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              sx={{ fontWeight: 'bold' }}
            >
              Welcome to SAIT Placement
            </Typography>
            <Button 
              component={Link} 
              to="/" 
              startIcon={<ArrowBackIcon />}
              sx={{ color: 'text.secondary' }}
            >
              Back
            </Button>
          </Box>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4 }}
          >
            Please select how you would like to proceed:
          </Typography>

          <Grid container spacing={3}>
            {/* Student Login Card */}
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  },
                  border: `1px solid ${theme.palette.primary.light}`,
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      color: 'primary.main'
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 40, mr: 1 }} />
                    <Typography variant="h5" component="h2">
                      Student
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" paragraph>
                    Login or register as a student to:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 3, flexGrow: 1 }}>
                    <li>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Create and manage your academic profile
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Upload and analyze your resume
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Find job opportunities matching your skills
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Apply to companies and track your applications
                      </Typography>
                    </li>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth
                      component={Link}
                      to="/student-auth"
                      size={isMobile ? "small" : "medium"}
                    >
                      Student Login
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      fullWidth
                      component={Link}
                      to="/register"
                      size={isMobile ? "small" : "medium"}
                    >
                      Register as Student
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Company Login Card */}
            <Grid item xs={12} md={6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  },
                  border: `1px solid ${theme.palette.secondary.light}`,
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      color: 'secondary.main'
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: 40, mr: 1 }} />
                    <Typography variant="h5" component="h2">
                      Company
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1" paragraph>
                    Login or register as a company to:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 3, flexGrow: 1 }}>
                    <li>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Create and manage your company profile
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Post job openings and requirements
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Review applications from qualified students
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        Manage the hiring process through our platform
                      </Typography>
                    </li>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 'auto' }}>
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      fullWidth
                      component={Link}
                      to="/company/auth"
                      size={isMobile ? "small" : "medium"}
                    >
                      Company Login
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="secondary" 
                      fullWidth
                      component={Link}
                      to="/company/auth"
                      size={isMobile ? "small" : "medium"}
                    >
                      Register as Company
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthRouter; 