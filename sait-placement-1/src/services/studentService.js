import { supabase } from '../config/supabaseClient';

export const registerStudent = async (studentData) => {
  try {
    // First, create auth user with student ID as the user ID
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: studentData.email,
      password: studentData.password,
      options: {
        data: {
          student_id: studentData.student_id,
          full_name: studentData.full_name
        }
      }
    });

    if (authError) throw authError;

    // Then, create student profile
    const { data: profileData, error: profileError } = await supabase
      .from('students')
      .insert([{
        student_id: studentData.student_id,
        email: studentData.email,
        full_name: studentData.full_name,
        department: studentData.department,
        year_of_study: studentData.year_of_study,
        cgpa: studentData.cgpa,
        phone: studentData.phone,
        skills: studentData.skills || []
      }])
      .select()
      .single();

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    return { data: profileData, error: null };
  } catch (error) {
    console.error('Error in registerStudent:', error);
    return { data: null, error };
  }
};

export const loginStudent = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    // Fetch student profile
    const { data: profileData, error: profileError } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', data.user.user_metadata.student_id)
      .single();

    if (profileError) throw profileError;

    return { data: { ...data, profile: profileData }, error: null };
  } catch (error) {
    console.error('Error in loginStudent:', error);
    return { data: null, error };
  }
};

export const updateStudentProfile = async (studentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in updateStudentProfile:', error);
    return { data: null, error };
  }
};

export const getStudentProfile = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error in getStudentProfile:', error);
    return { data: null, error };
  }
};

export const logoutStudent = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error in logoutStudent:', error);
    return { error };
  }
};
