import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Paper, Grid, Divider } from '@mui/material';
import { supabase } from '../../config/supabaseClient';

// This is a debugging component to view raw data from the database
// Include this in your CompanyDashboard temporarily to debug the issue

const DebugApplicationsData = ({ companyId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Direct query to get applications
        console.log('Fetching applications for company ID:', companyId);
        
        const { data: directApplications, error: directError } = await supabase
          .from('job_applications')
          .select('*')
          .eq('company_id', companyId);
          
        if (directError) throw directError;
        
        // Get student details for each application
        const applicationsWithStudents = [];
        
        for (const app of directApplications) {
          const { data: student, error: studentError } = await supabase
            .from('students')
            .select('*')
            .eq('student_id', app.student_id)
            .single();
            
          if (studentError && studentError.code !== 'PGRST116') {
            console.error('Error fetching student:', studentError);
          }
          
          applicationsWithStudents.push({
            ...app,
            student: student || null
          });
        }
        
        setApplications(applicationsWithStudents);
        
        // Get debug info
        const { data: policiesData } = await supabase
          .rpc('get_policies_info', { table_name: 'job_applications' })
          .catch(() => ({ data: null }));
          
        // Get count of applications
        const { count, error: countError } = await supabase
          .from('job_applications')
          .select('*', { count: 'exact', head: true });
          
        setDebugInfo({
          totalApplications: count,
          policies: policiesData,
          companyApplicationsCount: directApplications.length,
        });
        
      } catch (err) {
        console.error('Error in debug component:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const refreshData = () => {
    if (companyId) {
      window.location.reload(); // Simple reload to refresh data
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5">Applications Debug Data</Typography>
        <Button 
          variant="contained" 
          onClick={refreshData}
          sx={{ mt: 1, mb: 2 }}
        >
          Refresh Data
        </Button>
        
        {loading ? (
          <Typography>Loading debug data...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6">Debug Info</Typography>
                <Typography>Company ID: {companyId}</Typography>
                <Typography>Total Applications: {debugInfo.totalApplicationsCount || 0}</Typography>
                <Typography>Company Applications: {debugInfo.companyApplicationsCount || 0}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6">Raw Applications Data ({applications.length})</Typography>
                {applications.length === 0 ? (
                  <Typography>No applications found</Typography>
                ) : (
                  applications.map((app, index) => (
                    <Paper 
                      key={app.id || index} 
                      sx={{ p: 2, my: 1, backgroundColor: '#f5f5f5' }}
                    >
                      <Typography variant="subtitle1">Application ID: {app.id}</Typography>
                      <Typography>Student ID: {app.student_id}</Typography>
                      <Typography>Status: {app.status}</Typography>
                      <Typography>Created: {app.created_at}</Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="subtitle2">Student Data:</Typography>
                      {app.student ? (
                        <>
                          <Typography>Name: {app.student.full_name}</Typography>
                          <Typography>Email: {app.student.email}</Typography>
                          <Typography>Department: {app.student.department}</Typography>
                        </>
                      ) : (
                        <Typography color="error">No student data found</Typography>
                      )}
                    </Paper>
                  ))
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default DebugApplicationsData; 