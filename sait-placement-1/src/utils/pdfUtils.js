import { normalizeText } from './textUtils';
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Function to clean and normalize sections
const normalizeSections = (sections) => {
  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [key, normalizeText(value)])
  );
};

export const validatePDFFile = (file) => {
  if (!file || file.type !== 'application/pdf') {
    throw new Error('Please upload a valid PDF file');
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }
};

export const extractTextFromPDF = async (file) => {
  try {
    const sections = {
      education: '',
      experience: '',
      skills: '',
      projects: '',
      other: ''
    };

    const text = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const loadingTask = pdfjsLib.getDocument({ data: typedarray });
          const pdf = await loadingTask.promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map(item => item.str).join(' ');
            fullText += pageText + ' ';

            // Categorize text into sections
            const normalizedText = pageText.toLowerCase();
            if (normalizedText.includes('education') || normalizedText.includes('academic')) {
              sections.education += pageText + ' ';
            } else if (normalizedText.includes('experience') || normalizedText.includes('work history')) {
              sections.experience += pageText + ' ';
            } else if (normalizedText.includes('skills') || normalizedText.includes('technologies')) {
              sections.skills += pageText + ' ';
            } else if (normalizedText.includes('projects') || normalizedText.includes('portfolio')) {
              sections.projects += pageText + ' ';
            } else {
              sections.other += pageText + ' ';
            }
          }

          // Normalize sections before returning
          const normalizedSections = normalizeSections(sections);
          resolve({ fullText: normalizeText(fullText), sections: normalizedSections });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

    return text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please ensure the file is not corrupted.');
  }
};

export const findSkillsInContext = (text, skillSet) => {
  const foundSkills = new Set();
  const sentences = text.split(/[.!?]+/);

  // Common skill variations and related terms
  const skillVariations = {
    'react': ['reactjs', 'react.js', 'jsx'],
    'javascript': ['js', 'es6', 'ecmascript'],
    'typescript': ['ts'],
    'python': ['py', 'python3'],
    'java': ['j2ee', 'jvm'],
    'node': ['nodejs', 'node.js'],
    'express': ['expressjs', 'express.js'],
    'mongodb': ['mongo'],
    'postgresql': ['postgres'],
    'aws': ['amazon web services', 'ec2', 's3', 'lambda'],
    'docker': ['containerization', 'containers'],
    'kubernetes': ['k8s'],
    'machine learning': ['ml', 'deep learning', 'ai'],
    'ci/cd': ['continuous integration', 'continuous deployment', 'jenkins', 'github actions']
  };

  // Check each sentence for skills
  sentences.forEach(sentence => {
    const normalizedSentence = normalizeText(sentence);
    skillSet.forEach(skill => {
      const skillLower = skill.toLowerCase();
      
      // Direct match
      if (normalizedSentence.includes(skillLower)) {
        foundSkills.add(skill);
      }
      
      // Check variations
      const variations = skillVariations[skillLower];
      if (variations) {
        variations.forEach(variation => {
          if (normalizedSentence.includes(variation.toLowerCase())) {
            foundSkills.add(skill);
          }
        });
      }
    });
  });

  return Array.from(foundSkills);
};