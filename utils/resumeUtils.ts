/**
 * Utility functions for handling resume generation and download
 */

/**
 * Download LaTeX content as a .tex file
 */
export const downloadLatexFile = (latexContent: string, filename: string = 'tailored_resume.tex') => {
  const blob = new Blob([latexContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Copy LaTeX content to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Format the API response for user display
 */
export const formatResumeResponse = (response: any) => {
  return {
    success: response.success || false,
    message: response.message || 'Unknown response',
    resume: response.resume || '',
    email: response.email || '',
    error: response.error || null
  };
}; 