-- Create companies table
create table companies (
  id uuid default gen_random_uuid() primary key,
  company_name text not null,
  industry text not null,
  job_requirements text not null,
  job_description text not null,
  location text not null,
  salary_range text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table companies enable row level security;

-- Create a policy that allows anyone to read companies data
create policy "Allow public read access" on companies
  for select using (true);

-- Create a policy that allows authenticated users to insert companies data
create policy "Allow authenticated users to insert" on companies
  for insert with check (true);

-- Create a text search index for job requirements
create index companies_job_requirements_idx on companies using gin(to_tsvector('english', job_requirements));
