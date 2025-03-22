import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { supabase } from './config/supabaseClient';
import StudentAuth from './components/auth/StudentAuth';
import StudentDashboard from './components/student/StudentDashboard';
import CompanyDashboard from './components/company/CompanyDashboard';
import StudentProfile from './components/student/StudentProfile';
import CompanyAuth from './components/auth/CompanyAuth';
import Register from './components/auth/Register';
import LandingPage from './components/landing/LandingPage';
import AuthRouter from './components/auth/AuthRouter';

// Create a base theme with our palette
let theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  // Add responsive breakpoints
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  // Customize typography for better readability
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Adjust font sizes
    h4: {
      fontSize: '1.75rem',
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h5: {
      fontSize: '1.4rem',
      '@media (max-width:600px)': {
        fontSize: '1.25rem',
      },
    },
    h6: {
      fontSize: '1.25rem',
      '@media (max-width:600px)': {
        fontSize: '1.1rem',
      },
    },
    body1: {
      fontSize: '1rem',
      '@media (max-width:600px)': {
        fontSize: '0.95rem',
      },
    },
  },
  // Add custom component styles
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '12px',
        },
      },
    },
  },
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

// For student routes that require auth
const PrivateRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// For student routes
const StudentRoute = ({ children }) => {
  const [isStudent, setIsStudent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStudent = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('students')
          .select('student_id')
          .eq('email', user.email)
          .single();
        setIsStudent(!!data);
      }
      setLoading(false);
    };

    checkStudent();
  }, []);

  if (loading) return null;

  if (!isStudent) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// For company routes - simplified auth
const CompanyRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const verifyCompany = async () => {
      try {
        // Check if company data exists in localStorage
        const companyData = localStorage.getItem('companyData');
        if (!companyData) {
          setHasAccess(false);
          return;
        }

        const parsedData = JSON.parse(companyData);
        
        // Verify company exists in database
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('company_name', parsedData.company_name)
          .maybeSingle();

        if (error) {
          console.error('Error verifying company:', error);
          setHasAccess(false);
          return;
        }

        if (!data) {
          console.log('Company not found in database');
          localStorage.removeItem('companyData');
          setHasAccess(false);
          return;
        }

        // Update localStorage with latest data
        localStorage.setItem('companyData', JSON.stringify(data));
        setHasAccess(true);
      } catch (error) {
        console.error('Error in company verification:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    verifyCompany();
  }, []);

  if (loading) {
    return null;
  }

  if (!hasAccess) {
    return <Navigate to="/company/auth" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/auth",
    element: <AuthRouter />,
  },
  {
    path: "/student-auth",
    element: <StudentAuth />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/company/auth",
    element: <CompanyAuth />,
  },
  {
    path: "/student",
    children: [
      {
        path: "dashboard",
        element: (
          <PrivateRoute>
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute>
            <StudentRoute>
              <StudentProfile />
            </StudentRoute>
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/company",
    children: [
      {
        path: "dashboard",
        element: (
          <CompanyRoute>
            <CompanyDashboard />
          </CompanyRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh'
      }}>
        <RouterProvider router={router} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
