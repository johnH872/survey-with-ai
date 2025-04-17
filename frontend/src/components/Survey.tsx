'use client'
import 'survey-core/survey-core.css';
import { Model } from 'survey-core'
import { Survey as SurveyReactUI } from 'survey-react-ui'
import { useCallback } from 'react';

interface SurveyProps {
  onComplete?: (data: any) => void;
}

const surveyJson = {
  elements: [
    {
      type: "text",
      name: "issueTitle",
      title: "Issue Title",
      isRequired: true,
      placeholder: "Enter a brief title for your issue"
    },
    {
      type: "comment",
      name: "issueDescription",
      title: "Issue Description",
      isRequired: true,
      placeholder: "Please describe the issue in detail"
    }
  ]
}

export default function CustomSurvey({ onComplete }: SurveyProps) {
  // Initialize survey model immediately
  const survey = new Model(surveyJson);
  const alertResults = useCallback((survey: Model) => {
    const results = survey.data;
    if (onComplete) {
      onComplete(results);
    }
  }, [onComplete]);

  survey.onComplete.add(alertResults);

  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <SurveyReactUI
        model={survey}
      />
    </div>
  );
}