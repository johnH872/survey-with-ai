import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  FormControlLabel,
  Switch,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { surveyApi } from '../../services/api';

interface Survey {
  id: string;
  title: string;
  description: string;
  isActive: boolean;
}

export default function SurveyEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await surveyApi.getById(id!);
        setSurvey(response.data);
      } catch (error) {
        console.error('Error fetching survey:', error);
        setError('Failed to load survey. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  const handleChange = (field: keyof Survey) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (survey) {
      setSurvey({
        ...survey,
        [field]: field === 'isActive' ? event.target.checked : event.target.value,
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!survey) return;

    setSaving(true);
    setError(null);
    try {
      await surveyApi.update(id!, survey);
      navigate('/');
    } catch (error) {
      console.error('Error updating survey:', error);
      setError('Failed to update survey. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!survey) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="info">Survey not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          sx={{ mr: 2 }}
        >
          Back to Surveys
        </Button>
        <Typography variant="h4">Edit Survey</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Title"
            value={survey.title}
            onChange={handleChange('title')}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={survey.description}
            onChange={handleChange('description')}
            margin="normal"
            multiline
            rows={6}
            sx={{
              '& .MuiInputBase-root': {
                minHeight: '150px',
              },
              '& .MuiInputBase-input': {
                padding: '12px',
              }
            }}
          />
          <Divider sx={{ my: 2 }} />
          <FormControlLabel
            control={
              <Switch
                checked={survey.isActive}
                onChange={handleChange('isActive')}
              />
            }
            label="Active"
          />
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
} 