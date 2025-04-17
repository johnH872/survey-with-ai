import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { surveyApi } from '../../services/api';
import './SurveyList.scss';

interface Survey {
  id: string;
  title: string;
  isActive: boolean;
  responseCount: number;
  createdAt: string;
  description?: string;
}

export default function SurveyList() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await surveyApi.getAll();
        setSurveys(response.data);
      } catch (error) {
        console.error('Error fetching surveys:', error);
        setError('Failed to load surveys. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  const handleDeleteClick = (id: string) => {
    setSurveyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (surveyToDelete) {
      try {
        await surveyApi.delete(surveyToDelete);
        setSurveys(surveys.filter(survey => survey.id !== surveyToDelete));
      } catch (error) {
        console.error('Error deleting survey:', error);
      }
    }
    setDeleteDialogOpen(false);
    setSurveyToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSurveyToDelete(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Title',
      flex: 1,
      minWidth: 200,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
          sx={{
            fontWeight: 500,
            '& .MuiChip-label': {
              px: 1,
            },
          }}
        />
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      minWidth: 200,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Tooltip title={params.value || ''}>
          <Box
            sx={{
              maxWidth: 200,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'block'
            }}
          >
            {params.value || ''}
          </Box>
        </Tooltip>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      valueFormatter: (params) => {
        try {
          if (!params) return 'N/A';
          const date = new Date(params);
          if (isNaN(date.getTime())) return 'Invalid Date';
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
        } catch (error) {
          console.error('Error formatting date:', error);
          return 'Invalid Date';
        }
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Tooltip title="View Analytics">
            <IconButton
              size="small"
              onClick={() => navigate('/surveys/analytics')}
              sx={{ 
                mr: 1,
                height: '36px',
                width: '36px',
                my: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& .MuiSvgIcon-root': {
                  fontSize: '1.2rem'
                }
              }}
            >
              <AssessmentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/surveys/${params.row.id}/edit`)}
              sx={{ mr: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row.id)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="md" className="survey-list-container">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header Section */}
        <Box className="survey-header">
          <Typography variant="h4" component="h1" className="survey-title">
            My Surveys
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/surveys/create')}
            className="create-button"
            startIcon={<AddIcon />}
          >
            Create Survey
          </Button>
        </Box>

        {/* Survey Table */}
        <Paper elevation={3} sx={{ mt: 3, borderRadius: 2, overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
          ) : surveys.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6">No surveys found</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Create your first survey to get started
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/surveys/create')}
                sx={{ mt: 2 }}
                startIcon={<AddIcon />}
              >
                Create Survey
              </Button>
            </Box>
          ) : (
            <Box sx={{ height: 400, width: '100%' }}>
              <DataGrid
                rows={surveys}
                columns={columns}
                initialState={{
                  pagination: { paginationModel: { pageSize: 5 } },
                }}
                pageSizeOptions={[5, 10, 25]}
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                  '& .MuiDataGrid-cell': {
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  '& .MuiDataGrid-columnHeader': {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                  },
                }}
              />
            </Box>
          )}
        </Paper>
      </Box>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Survey</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this survey?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 