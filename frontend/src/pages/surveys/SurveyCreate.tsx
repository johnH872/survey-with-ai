import { useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Survey from '../../components/Survey';
import { surveyApi } from '../../services/api';

interface FormModel {
  issueTitle: string;
  issueDescription: string;
}

export default function SurveyCreate() {
  const navigate = useNavigate();

  const handleSurveyComplete = async (responseData: FormModel) => {
    try {
      // Save the user's response data for analytics
      await surveyApi.create({
        title: responseData.issueTitle,
        description: responseData.issueDescription,
        timestamp: new Date().toISOString(),
        type: "issue_report"
      });
    } catch (error) {
      console.error('Error saving survey response:', error);
    }
  };

  return (
    <div>
      <Box sx={{
        p: 1,
        bgcolor: 'primary.main',
        display: 'flex',
        alignItems: 'center',
        height: '60px'
      }}>
        <Tooltip title="Back to Surveys">
          <IconButton
            onClick={() => navigate('/')}
            sx={{ color: 'white' }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: 2,
        overflow: 'auto'
      }}>
        <Survey
          onComplete={handleSurveyComplete}
        />
      </Box>
    </div>
  );
} 