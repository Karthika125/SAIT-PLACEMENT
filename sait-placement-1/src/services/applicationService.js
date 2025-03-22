import { supabase } from '../config/supabaseClient';

export const applyToJob = async (companyId) => {
  try {
    console.log(`Attempting to apply to job with company ID: ${companyId}`);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    console.log(`Current user email: ${user.email}`);

    // Check if student profile exists and is submitted
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*') // Select all fields to check completeness
      .eq('email', user.email)
      .single();

    if (studentError) {
      console.error('Error fetching student profile:', studentError);
      throw studentError;
    }
    if (!student) throw new Error('Student profile not found');
    console.log(`Student ID: ${student.student_id}, Profile submitted: ${student.profile_submitted}`);
    
    // Check if profile is complete, even if profile_submitted flag is not set
    const isProfileComplete = student && student.full_name && student.email && 
                            student.department && student.phone && 
                            student.skills && student.skills.length > 0;
    
    if (!student.profile_submitted && !isProfileComplete) {
      throw new Error('Please submit your profile before applying');
    }
    
    // If profile is complete but profile_submitted flag is not set, update it
    if (isProfileComplete && !student.profile_submitted) {
      console.log('Profile is complete but flag not set, updating profile_submitted flag');
      const { error: updateError } = await supabase
        .from('students')
        .update({ profile_submitted: true })
        .eq('student_id', student.student_id);
        
      if (updateError) {
        console.error('Error updating profile_submitted flag:', updateError);
        // Continue anyway since profile is complete
      }
    }

    // Check if already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('student_id', student.student_id)
      .eq('company_id', companyId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing application:', checkError);
      throw checkError;
    }
    if (existingApplication) {
      console.log(`Already applied with application ID: ${existingApplication.id}`);
      throw new Error('You have already applied to this company');
    }

    // Insert application
    console.log(`Inserting new application for student ${student.student_id} to company ${companyId}`);
    const { data: newApplication, error: insertError } = await supabase
      .from('job_applications')
      .insert({
        student_id: student.student_id,
        company_id: companyId,
        status: 'pending'
      })
      .select();

    if (insertError) {
      console.error('Error inserting application:', insertError);
      throw insertError;
    }
    
    console.log(`Successfully applied with application ID: ${newApplication?.[0]?.id}`);
    return { success: true, applicationId: newApplication?.[0]?.id };
  } catch (error) {
    console.error('Error in applyToJob:', error);
    throw error;
  }
};

export const getApplicationStatus = async (companyId) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Get student ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('student_id')
      .eq('email', user.email)
      .single();

    if (studentError) throw studentError;
    if (!student) throw new Error('Student profile not found');

    // Get application status
    const { data, error } = await supabase
      .from('job_applications')
      .select('status')
      .eq('student_id', student.student_id)
      .eq('company_id', companyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? data.status : null;
  } catch (error) {
    console.error('Error in getApplicationStatus:', error);
    throw error;
  }
};

// Get all applications for a student
export const getStudentApplications = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Get student ID
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('student_id')
      .eq('email', user.email)
      .single();

    if (studentError) throw studentError;
    if (!student) throw new Error('Student profile not found');

    // Get all applications with company details
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        id,
        status,
        companies(*)
      `)
      .eq('student_id', student.student_id);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in getStudentApplications:', error);
    throw error;
  }
};

// Get all applications for a company
export const getCompanyApplications = async (companyId) => {
  try {
    console.log('Getting applications for company ID:', companyId);
    
    if (!companyId) {
      console.error('No company ID provided to getCompanyApplications');
      return [];
    }
    
    // Check if job_applications table exists by making a small test query
    try {
      const { count, error: testError } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .limit(1);
        
      if (testError) {
        console.error('Error testing job_applications table:', testError);
        // If the table doesn't exist, return empty array instead of throwing
        if (testError.code === '42P01') { // PostgreSQL code for undefined_table
          console.warn('job_applications table does not exist');
          return [];
        }
      }
    } catch (testErr) {
      console.error('Exception testing job_applications table:', testErr);
      // Continue anyway - we'll handle errors in the main query
    }
    
    // First, get all applications for this company
    const { data: applications, error: appError } = await supabase
      .from('job_applications')
      .select('id, student_id, status')
      .eq('company_id', companyId);
    
    if (appError) {
      console.error('Error fetching applications:', appError);
      // If the table doesn't exist, return empty array instead of throwing
      if (appError.code === '42P01') { // PostgreSQL code for undefined_table
        return [];
      }
      throw appError;
    }
    
    console.log(`Found ${applications?.length || 0} applications`);
    
    if (!applications || applications.length === 0) {
      return [];
    }
    
    // Now fetch student details for each application
    const applicationsWithStudents = [];
    
    for (const app of applications) {
      try {
        const { data: student, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('student_id', app.student_id)
          .single();
        
        if (studentError) {
          console.error(`Error fetching student ${app.student_id}:`, studentError);
          // Continue with the next application
          applicationsWithStudents.push({
            ...app,
            students: null
          });
        } else {
          // Add student data to application
          applicationsWithStudents.push({
            ...app,
            students: student
          });
        }
      } catch (studentFetchErr) {
        console.error(`Exception fetching student ${app.student_id}:`, studentFetchErr);
        applicationsWithStudents.push({
          ...app,
          students: null
        });
      }
    }
    
    console.log('Processed applications with student data:', applicationsWithStudents);
    return applicationsWithStudents;
  } catch (error) {
    console.error('Error in getCompanyApplications:', error);
    // Return empty array instead of throwing to prevent component crashes
    return [];
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const { error } = await supabase
      .from('job_applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error);
    throw error;
  }
};
