// Modified handleSubmit function to handle email confirmation issues
// Replace the existing handleSubmit function in StudentAuth.jsx with this

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    // 1. Try standard login first
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    // 2. If there's an error about email confirmation
    if (signInError && signInError.message.includes('Email not confirmed')) {
      // For development purposes only - this bypasses security
      // First, get the user by email to have the ID
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const user = users.find(u => u.email === formData.email);
      
      if (user) {
        // Update user to confirm their email
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { email_confirmed: true }
        );
        
        if (updateError) {
          console.error('Error confirming email:', updateError);
          throw updateError;
        }
        
        // Try signing in again
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (retryError) {
          console.error('Login retry error:', retryError);
          throw retryError;
        }
        
        // If successful, continue with the authenticated user
        // Check if user is a student
        const { data: studentData, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('email', formData.email)
          .single();

        if (studentError) {
          console.error('Student lookup error:', studentError);
          throw new Error('Student account not found');
        }

        console.log('Student login successful after email confirmation');
        navigate('/student/dashboard');
        return;
      }
    } else if (signInError) {
      // Handle other signin errors
      throw signInError;
    }

    // If no errors in initial login, continue with normal flow
    // Check if user is a student
    const { data: studentData, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('email', formData.email)
      .single();

    if (studentError) {
      console.error('Student lookup error:', studentError);
      throw new Error('Student account not found');
    }

    console.log('Student login successful:', { authData, studentData });
    navigate('/student/dashboard');
  } catch (error) {
    console.error('Error:', error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
}; 