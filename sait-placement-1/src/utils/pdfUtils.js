// Load PDF.js from CDN
let pdfjsLib = null;
const pdfjsWorkerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// Function to load PDF.js script
const loadPdfJs = () => {
  return new Promise((resolve, reject) => {
    if (pdfjsLib) {
      resolve(pdfjsLib);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;
      resolve(pdfjsLib);
    };
    script.onerror = () => {
      reject(new Error('Failed to load PDF.js'));
    };
    document.head.appendChild(script);
  });
};

export const extractTextFromPDF = async (file) => {
  try {
    // Ensure PDF.js is loaded
    const pdfjs = await loadPdfJs();
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + ' ';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF. Please make sure the file is not corrupted and try again.');
  }
};

export const validatePDFFile = (file) => {
  if (!file) {
    throw new Error('No file selected');
  }
  
  if (file.type !== 'application/pdf') {
    throw new Error('Please upload a PDF file. Other file formats are not supported at the moment.');
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('File size too large. Please upload a PDF smaller than 10MB.');
  }
  
  return true;
}; 