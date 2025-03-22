import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';
import { supabase } from './config/supabaseClient';
import StudentAuth from './components/auth/StudentAuth';
import StudentDashboard from './components/student/StudentDashboard';
import CompanyDashboard from './components/company/CompanyDashboard';
import StudentProfile from './components/student/StudentProfile';
import CompanyAuth from './components/auth/CompanyAuth';

const theme = createTheme({
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
});

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

const StudentRoute = ({ children }) => {
  const [isStudent, setIsStudent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStudent = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { data } = await supabase
          .from('students')
          .select('*')
          .eq('email', session.user.email)
          .single();
        setIsStudent(!!data);
      }
      setLoading(false);
    };
    checkStudent();
  }, []);

  if (loading) return null;
  if (!isStudent) return <Navigate to="/" replace />;
  return children;
};

const CompanyRoute = ({ children }) => {
  const [isCompany, setIsCompany] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCompany = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const { data } = await supabase
          .from('companies')
          .select('*')
          .eq('email', session.user.email)
          .single();
        setIsCompany(!!data);
      }
      setLoading(false);
    };
    checkCompany();
  }, []);

  if (loading) return null;
  if (!isCompany) return <Navigate to="/" replace />;
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <StudentAuth />,
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
          <PrivateRoute>
            <CompanyRoute>
              <CompanyDashboard />
            </CompanyRoute>
          </PrivateRoute>
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
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <RouterProvider router={router} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
