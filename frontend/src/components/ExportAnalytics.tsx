import { saveAs } from 'file-saver';

interface AnalyticsData {
  title: string;
  content: string;
  sections: {
    title: string;
    content: string;
  }[];
}

export const exportToDocx = async (data: AnalyticsData) => {
  try {
    const response = await fetch('/api/surveys/export-docx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to generate DOCX file');
    }

    const blob = await response.blob();
    saveAs(blob, 'analytics-report.docx');
  } catch (error) {
    console.error('Error generating docx:', error);
    throw error;
  }
}; 