import { supabase } from '../config/supabaseClient';

/**
 * Updates the job_applications table by adding the missing columns
 * This is a temporary function to fix schema issues
 */
export const updateJobApplicationsSchema = async () => {
  try {
    console.log("Attempting to update job_applications schema...");
    
    // Check if job_applications table exists
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'job_applications');
    
    if (tablesError) {
      console.error("Error checking table existence:", tablesError);
      return { success: false, error: tablesError };
    }
    
    if (!tables || tables.length === 0) {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS job_applications (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            student_id VARCHAR(20) REFERENCES students(student_id),
            company_id UUID REFERENCES companies(id),
            status TEXT DEFAULT 'pending'
          );
        `
      });
      
      if (createError) {
        console.error("Error creating job_applications table:", createError);
        return { success: false, error: createError };
      }
    }
    
    // Add columns if they don't exist
    const { error: alterError } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE IF EXISTS job_applications 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
      `
    });
    
    if (alterError) {
      console.error("Error adding columns to job_applications:", alterError);
      return { success: false, error: alterError };
    }
    
    // Create trigger for updated_at
    const { error: triggerError } = await supabase.rpc('execute_sql', {
      sql: `
        DROP TRIGGER IF EXISTS applications_handle_updated_at ON job_applications;
        
        CREATE OR REPLACE FUNCTION handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = TIMEZONE('utc'::text, NOW());
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER applications_handle_updated_at
            BEFORE UPDATE ON job_applications
            FOR EACH ROW
            EXECUTE FUNCTION handle_updated_at();
      `
    });
    
    if (triggerError) {
      console.error("Error creating trigger on job_applications:", triggerError);
      return { success: false, error: triggerError };
    }
    
    console.log("Successfully updated job_applications schema");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating schema:", error);
    return { success: false, error };
  }
};

/**
 * Updates the job_postings table by creating it if it doesn't exist
 * This is a temporary function to fix schema issues
 */
export const updateJobPostingsSchema = async () => {
  try {
    console.log("Attempting to update job_postings schema...");
    
    // Check if job_postings table exists
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', 'job_postings');
    
    if (tablesError) {
      console.error("Error checking table existence:", tablesError);
      return { success: false, error: tablesError };
    }
    
    if (!tables || tables.length === 0) {
      // Table doesn't exist, create it
      const { error: createError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS job_postings (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            company_id UUID REFERENCES companies(id),
            company_name TEXT NOT NULL,
            job_description TEXT,
            job_requirements TEXT,
            location TEXT,
            salary_range TEXT,
            posting_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
          );
        `
      });
      
      if (createError) {
        console.error("Error creating job_postings table:", createError);
        return { success: false, error: createError };
      }
    }
    
    // Create trigger for updated_at if it doesn't exist
    const { error: triggerError } = await supabase.rpc('execute_sql', {
      sql: `
        DROP TRIGGER IF EXISTS job_postings_handle_updated_at ON job_postings;
        
        CREATE OR REPLACE FUNCTION handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = TIMEZONE('utc'::text, NOW());
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        CREATE TRIGGER job_postings_handle_updated_at
            BEFORE UPDATE ON job_postings
            FOR EACH ROW
            EXECUTE FUNCTION handle_updated_at();
      `
    });
    
    if (triggerError) {
      console.error("Error creating trigger on job_postings:", triggerError);
      return { success: false, error: triggerError };
    }
    
    console.log("Successfully updated job_postings schema");
    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating job_postings schema:", error);
    return { success: false, error };
  }
}; 