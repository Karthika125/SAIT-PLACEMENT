-- Add policies for job_applications table

-- Policy for viewing applications (allows anyone to view applications)
CREATE POLICY IF NOT EXISTS "Anyone can view applications" 
ON job_applications 
FOR SELECT USING (true);

-- Policy for inserting applications (allows anyone to insert applications)
CREATE POLICY IF NOT EXISTS "Anyone can insert applications" 
ON job_applications 
FOR INSERT WITH CHECK (true);

-- Policy for updating applications (allows anyone to update applications)
CREATE POLICY IF NOT EXISTS "Anyone can update applications" 
ON job_applications 
FOR UPDATE USING (true);

-- Make sure RLS is enabled on job_applications table
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY; 