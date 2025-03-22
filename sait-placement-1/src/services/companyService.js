import { supabase } from '../config/supabaseClient';

export const registerCompany = async (companyData) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([{
        company_name: companyData.name,
        industry: companyData.industry,
        job_requirements: companyData.requirements,
        job_description: companyData.description,
        location: companyData.location,
        salary_range: companyData.salaryRange,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const searchJobs = async (searchCriteria) => {
  try {
    let query = supabase
      .from('companies')
      .select('*');

    // If search criteria is provided, filter by requirements
    if (searchCriteria) {
      const searchTerms = searchCriteria
        .split(',')
        .map(term => term.trim().toLowerCase())
        .filter(term => term.length > 0);

      // Create OR conditions for each search term
      if (searchTerms.length > 0) {
        const orConditions = searchTerms.map(term => 
          `job_requirements.ilike.%${term}%`
        );
        query = query.or(orConditions.join(','));
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    
    // If no search criteria, return all jobs
    if (!searchCriteria) {
      return { data, error: null };
    }

    // For search with criteria, filter and rank results
    const searchTerms = searchCriteria
      .split(',')
      .map(term => term.trim().toLowerCase())
      .filter(term => term.length > 0);

    const rankedData = data.map(job => {
      const requirements = (job.job_requirements || '').toLowerCase();
      const matchCount = searchTerms.filter(term => requirements.includes(term)).length;
      const matchScore = (matchCount / searchTerms.length) * 100;
      return { ...job, matchScore };
    }).filter(job => job.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    return { data: rankedData, error: null };
  } catch (error) {
    console.error('Error searching jobs:', error);
    return { data: null, error };
  }
};
