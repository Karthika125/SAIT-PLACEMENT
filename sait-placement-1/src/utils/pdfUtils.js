import { normalizeText } from './textUtils';
import * as pdfjsLib from 'pdfjs-dist';

// Use unpkg as a fallback if cdnjs fails
const PDFJS_CDN = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_CDN;

// Ensure PDF.js is loaded
const ensurePDFJS = async () => {
  if (!pdfjsLib.getDocument) {
    throw new Error('PDF.js library not loaded properly');
  }

  // Test if worker is available
  try {
    await pdfjsLib.getDocument(new Uint8Array([37, 80, 68, 70])).promise;
  } catch (error) {
    if (error.message.includes('worker')) {
      // Try loading from cdnjs as fallback
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
      try {
        await pdfjsLib.getDocument(new Uint8Array([37, 80, 68, 70])).promise;
      } catch (error) {
        throw new Error('Failed to load PDF.js worker. Please try refreshing the page.');
      }
    }
  }
};

// Function to clean and normalize sections
const normalizeSections = (sections) => {
  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [key, normalizeText(value)])
  );
};

// Common PDF MIME types
const PDF_MIME_TYPES = [
  'application/pdf',
  'application/x-pdf',
  'application/acrobat',
  'application/vnd.pdf',
  'text/pdf',
  'text/x-pdf'
];

export const validatePDFFile = (file) => {
  if (!file) {
    throw new Error('No file selected. Please select a PDF file.');
  }

  console.log('File info:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString()
  });

  // More lenient MIME type checking
  const isPDFType = PDF_MIME_TYPES.includes(file.type) || file.type === '';
  const hasPDFExtension = file.name.toLowerCase().endsWith('.pdf');
  
  if (!hasPDFExtension) {
    throw new Error('File must have a .pdf extension');
  }

  // If MIME type is present but not PDF, warn but don't block
  if (file.type && !isPDFType) {
    console.warn('File MIME type is not PDF, but allowing based on extension:', file.type);
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 10MB');
  }

  // Check if file is empty
  if (file.size === 0) {
    throw new Error('The PDF file appears to be empty. Please check the file.');
  }
};

export const extractTextFromPDF = async (file) => {
  try {
    // Ensure PDF.js is loaded properly
    await ensurePDFJS();

    // Validate file first
    validatePDFFile(file);

    const sections = {
      education: '',
      experience: '',
      skills: '',
      projects: '',
      other: ''
    };

    const result = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error('Failed to read the PDF file. The file might be corrupted.'));
      };

      reader.onload = async (e) => {
        try {
          console.log('File loaded successfully, size:', e.target.result.byteLength);
          const typedarray = new Uint8Array(e.target.result);
          
          if (typedarray.length === 0) {
            throw new Error('The PDF file is empty.');
          }

          // Check PDF signature
          const pdfSignature = '%PDF-';
          const fileStart = new TextDecoder().decode(typedarray.slice(0, 5));
          if (!fileStart.startsWith(pdfSignature)) {
            throw new Error('Invalid PDF file format. File does not start with %PDF-');
          }

          // Create loading task with more options
          const loadingTask = pdfjsLib.getDocument({
            data: typedarray,
            verbosity: 1,
            cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
            cMapPacked: true,
            standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
            disableFontFace: false,
            useSystemFonts: true
          });

          loadingTask.onProgress = (progress) => {
            console.log('Loading progress:', Math.round(progress.loaded / progress.total * 100) + '%');
          };
          
          const pdf = await loadingTask.promise;
          console.log('PDF loaded successfully, pages:', pdf.numPages);

          let fullText = '';
          let hasExtractedText = false;

          for (let i = 1; i <= pdf.numPages; i++) {
            try {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent({
                normalizeWhitespace: true,
                disableCombineTextItems: false
              });
              
              if (content?.items?.length > 0) {
                hasExtractedText = true;
                const pageText = content.items
                  .map(item => item.str)
                  .join(' ')
                  .replace(/\s+/g, ' ')
                  .trim();

                if (pageText) {
                  fullText += pageText + ' ';
                  const normalizedText = pageText.toLowerCase();
                  
                  // Categorize text into sections
                  if (normalizedText.includes('education') || normalizedText.includes('academic')) {
                    sections.education += pageText + ' ';
                  } else if (normalizedText.includes('experience') || normalizedText.includes('work')) {
                    sections.experience += pageText + ' ';
                  } else if (normalizedText.includes('skill') || normalizedText.includes('technical')) {
                    sections.skills += pageText + ' ';
                  } else if (normalizedText.includes('project')) {
                    sections.projects += pageText + ' ';
                  } else {
                    sections.other += pageText + ' ';
                  }
                }
              }
            } catch (pageError) {
              console.warn(`Error extracting text from page ${i}:`, pageError);
            }
          }

          if (!hasExtractedText) {
            throw new Error('No text could be extracted from the PDF. Please ensure the PDF contains selectable text.');
          }

          // Return both fullText and sections
          resolve({
            fullText: normalizeText(fullText),
            sections: normalizeSections(sections)
          });
        } catch (error) {
          console.error('PDF processing error:', error);
          reject(error);
        }
      };

      reader.readAsArrayBuffer(file);
    });

    return result;
  } catch (error) {
    console.error('PDF extraction error:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    throw new Error(error.message || 'Failed to extract text from the PDF. Please try a different PDF file.');
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