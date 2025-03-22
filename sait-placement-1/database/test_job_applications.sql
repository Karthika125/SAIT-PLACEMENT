-- Diagnostic queries for job applications

-- Check if job_applications table exists
SELECT EXISTS (
    SELECT FROM pg_tables
    WHERE tablename = 'job_applications'
) AS job_applications_table_exists;

-- Check RLS policies for job_applications table
SELECT tablename, policyname, permissive, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'job_applications';

-- Count of job applications in the table
SELECT COUNT(*) AS application_count FROM job_applications;

-- Sample of job applications with student and company information
SELECT ja.id, ja.student_id, ja.company_id, ja.status, ja.created_at,
       s.full_name AS student_name,
       c.company_name
FROM job_applications ja
LEFT JOIN students s ON ja.student_id = s.student_id
LEFT JOIN companies c ON ja.company_id = c.id
LIMIT 10;

-- Check for company access to their applications
-- This query simulates what a company would see
WITH sample_company AS (
    SELECT id FROM companies LIMIT 1
)
SELECT ja.id, ja.student_id, ja.status, ja.created_at,
       s.full_name AS student_name
FROM job_applications ja
JOIN sample_company sc ON ja.company_id = sc.id
LEFT JOIN students s ON ja.student_id = s.student_id;

-- Check for any issues with indexes or constraints
SELECT
    relname AS table_name,
    indisunique AS is_unique,
    indisprimary AS is_primary,
    pg_get_indexdef(indexrelid) AS index_definition
FROM pg_index
JOIN pg_class ON pg_class.oid = pg_index.indrelid
WHERE pg_class.relname = 'job_applications'; 