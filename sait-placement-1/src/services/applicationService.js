import { supabase } from '../config/supabaseClient';

export const applyToJob = async (companyId) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    // Check if student profile exists and is submitted
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('student_id, profile_submitted')
      .eq('email', user.email)
      .single();

    if (studentError) throw studentError;
    if (!student) throw new Error('Student profile not found');
    if (!student.profile_submitted) throw new Error('Please submit your profile before applying');

    // Check if already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('student_id', student.student_id)
      .eq('company_id', companyId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    if (existingApplication) throw new Error('You have already applied to this company');

    // Insert application
    const { error: insertError } = await supabase
      .from('job_applications')
      .insert({
        student_id: student.student_id,
        company_id: companyId,
        status: 'pending'
      });

    if (insertError) throw insertError;

    return { success: true };
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
