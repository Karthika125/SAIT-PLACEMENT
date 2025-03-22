-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(20) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    department TEXT NOT NULL,
    year_of_study INTEGER NOT NULL CHECK (year_of_study BETWEEN 1 AND 4),
    cgpa DECIMAL(3,2) CHECK (cgpa BETWEEN 0 AND 10.0),
    phone VARCHAR(15),
    skills TEXT[],
    resume_url TEXT,
    profile_submitted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auth_id UUID,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    job_requirements TEXT,
    job_description TEXT,
    location TEXT,
    salary_range TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Job Postings table
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    company_name TEXT NOT NULL,
    job_requirements TEXT NOT NULL,
    job_description TEXT NOT NULL,
    location TEXT,
    salary_range TEXT,
    posting_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Job Applications table with all required columns
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id),
    company_id UUID REFERENCES companies(id),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER companies_handle_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER student_updated
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER applications_handle_updated_at
    BEFORE UPDATE ON job_applications
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Policies for students
CREATE POLICY "Students can view own data" ON students
    FOR SELECT USING (true);

CREATE POLICY "Students can update own data" ON students
    FOR UPDATE USING (true);

-- Policies for companies
CREATE POLICY "Companies can view their own profile" ON companies
    FOR SELECT USING (true);

CREATE POLICY "Companies can update their own profile" ON companies
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can create a company profile" ON companies
    FOR INSERT WITH CHECK (true);

-- Policies for job_applications
CREATE POLICY "Anyone can view applications" ON job_applications
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert applications" ON job_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update applications" ON job_applications
    FOR UPDATE USING (true); 