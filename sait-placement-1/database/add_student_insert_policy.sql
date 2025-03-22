-- Add INSERT policy for students table
CREATE POLICY "Anyone can create a student profile" ON students
    FOR INSERT 
    WITH CHECK (true); 