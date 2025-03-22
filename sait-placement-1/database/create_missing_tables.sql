-- Create job_postings table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_name TEXT NOT NULL,
    job_requirements TEXT NOT NULL,
    job_description TEXT NOT NULL,
    location TEXT,
    salary_range TEXT,
    posting_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create job_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id),
    company_id UUID REFERENCES companies(id),
    status TEXT DEFAULT 'pending'
);

-- Enable Row Level Security on job_applications (if not already enabled)
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Ensure we have the necessary RLS policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    BEGIN
        DROP POLICY IF EXISTS "Anyone can view applications" ON job_applications;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, ignore error
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Anyone can insert applications" ON job_applications;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, ignore error
    END;
    
    BEGIN
        DROP POLICY IF EXISTS "Anyone can update applications" ON job_applications;
    EXCEPTION WHEN OTHERS THEN
        -- Policy doesn't exist, ignore error
    END;
END
$$;

-- Create the policies
CREATE POLICY "Anyone can view applications" 
ON job_applications 
FOR SELECT USING (true);

CREATE POLICY "Anyone can insert applications" 
ON job_applications 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update applications" 
ON job_applications 
FOR UPDATE USING (true);

-- Add some test data if tables are empty
DO $$
DECLARE
    company_count INTEGER;
    job_count INTEGER;
    app_count INTEGER;
    company_id UUID;
    student_id VARCHAR(20);
BEGIN
    -- Check if we need to add test data
    SELECT COUNT(*) INTO company_count FROM companies;
    SELECT COUNT(*) INTO job_count FROM job_postings;
    SELECT COUNT(*) INTO app_count FROM job_applications;
    
    -- If we have companies but no job postings, add some
    IF company_count > 0 AND job_count = 0 THEN
        -- Get a company ID to use
        SELECT id INTO company_id FROM companies LIMIT 1;
        
        -- Add a test job posting for this company
        INSERT INTO job_postings (company_name, job_requirements, job_description, location, salary_range)
        SELECT company_name, 'JavaScript, React, Node.js', 'Frontend Developer Position', 'Remote', '$80K-$100K'
        FROM companies
        WHERE id = company_id;
    END IF;
    
    -- If we have companies and students but no applications, add a test application
    IF company_count > 0 AND app_count = 0 THEN
        -- Get a company ID and student ID to use
        SELECT id INTO company_id FROM companies LIMIT 1;
        SELECT student_id INTO student_id FROM students LIMIT 1;
        
        IF company_id IS NOT NULL AND student_id IS NOT NULL THEN
            -- Add a test application
            INSERT INTO job_applications (student_id, company_id, status)
            VALUES (student_id, company_id, 'pending');
        END IF;
    END IF;
END
$$; 