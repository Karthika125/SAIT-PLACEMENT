// Load PDF.js from CDN
let pdfjsLib = null;
const pdfjsWorkerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Function to load PDF.js script
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (pdfjsLib) {
      console.log('PDF.js already loaded');
      resolve(pdfjsLib);
      return;
    }

    console.log('Loading PDF.js library...');
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      console.log('PDF.js library loaded successfully');
      pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
      resolve(pdfjsLib);
    };
    script.onerror = (error) => {
      console.error('Failed to load PDF.js:', error);
      reject(new Error('Failed to load PDF processing library. Please try again.'));
    };
    document.head.appendChild(script);
  });
};

export const extractTextFromPDF = async (file) => {
  try {
    console.log('Starting PDF text extraction...');
    
    // Ensure PDF.js is loaded
    console.log('Loading PDF.js...');
    const pdfjs = await loadPdfJs();
    console.log('PDF.js loaded successfully');
    
    console.log('Reading file contents...');
    const arrayBuffer = await file.arrayBuffer();
    console.log('File contents read successfully, size:', arrayBuffer.byteLength);
    
    console.log('Loading PDF document...');
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    console.log('PDF document loaded successfully, pages:', pdf.numPages);
    
    let fullText = '';
    
    console.log('Extracting text from pages...');
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i}/${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      console.log(`Page ${i} text length:`, pageText.length);
      fullText += pageText + ' ';
    }
    
    if (!fullText || fullText.trim().length === 0) {
      throw new Error('No text content found in the PDF. Please ensure the PDF contains selectable text.');
    }
    
    console.log('Text extraction completed successfully');
    console.log('Total extracted text length:', fullText.length);
    console.log('Sample of extracted text:', fullText.substring(0, 100) + '...');
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    if (error.message.includes('Invalid PDF structure')) {
      throw new Error('The PDF file appears to be corrupted. Please try with a different PDF.');
    } else if (error.name === 'PasswordException') {
      throw new Error('The PDF is password protected. Please remove the password protection and try again.');
    } else {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }
};

export const validatePDFFile = (file) => {
  console.log('Validating PDF file...');
  console.log('File details:', {
    name: file.name,
    type: file.type,
    size: file.size,
    lastModified: new Date(file.lastModified).toISOString()
  });
  
  if (!file) {
    throw new Error('No file selected');
  }
  
  if (file.type !== 'application/pdf') {
    throw new Error('Please upload a PDF file. Other file formats are not supported at the moment.');
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('File size too large. Please upload a PDF smaller than 10MB.');
  }
  
  console.log('PDF file validation successful');
  return true;
}; 