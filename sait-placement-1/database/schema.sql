-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create students table
CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year_of_study INTEGER NOT NULL CHECK (year_of_study BETWEEN 1 AND 4),
    cgpa DECIMAL(3,2) CHECK (cgpa BETWEEN 0 AND 10.0),
    phone VARCHAR(15),
    skills TEXT[],
    resume_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    job_requirements TEXT NOT NULL,
    job_description TEXT NOT NULL,
    location TEXT NOT NULL,
    salary_range TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read companies data
CREATE POLICY "Allow public read access" ON companies
  FOR SELECT USING (true);

-- Create a policy that allows authenticated users to insert companies data
CREATE POLICY "Allow authenticated users to insert" ON companies
  FOR INSERT WITH CHECK (true);

-- Create a text search index for job requirements
CREATE INDEX companies_job_requirements_idx ON companies USING GIN(to_tsvector('english', job_requirements));

-- Create RLS policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Policy for students to view and edit their own data
CREATE POLICY "Students can view own data" ON students
    FOR SELECT USING (auth.uid()::text = student_id);

CREATE POLICY "Students can update own data" ON students
    FOR UPDATE USING (auth.uid()::text = student_id);

-- Function to handle student updates
CREATE OR REPLACE FUNCTION handle_student_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating timestamp
CREATE TRIGGER student_updated
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION handle_student_update();
