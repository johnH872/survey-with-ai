import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Checkbox,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
} from '@mui/material';
import { surveyApi } from '../../services/api';
import { Refresh as RefreshIcon, Download as DownloadIcon } from '@mui/icons-material';
import { exportToDocx } from '../../components/ExportAnalytics';

const ITEMS_PER_PAGE = 10;

export default function SurveyAnalytics() {
  const [surveys, setSurveys] = useState<any[]>([]);
  const [selectedSurveys, setSelectedSurveys] = useState<string[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await surveyApi.getAll();
      setSurveys(response.data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setError('Failed to load surveys. Please try again later.');
    }
  };

  const handleSurveySelect = (surveyId: string) => {
    setSelectedSurveys(prev => {
      if (prev.includes(surveyId)) {
        return prev.filter(id => id !== surveyId);
      } else {
        return [...prev, surveyId];
      }
    });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = surveys
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(survey => survey.id);
      setSelectedSurveys(prev => [...new Set([...prev, ...newSelected])]);
    } else {
      const currentPageIds = surveys
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map(survey => survey.id);
      setSelectedSurveys(prev => prev.filter(id => !currentPageIds.includes(id)));
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const generateReport = async () => {
    if (selectedSurveys.length === 0) {
      setError('Please select at least one survey to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await surveyApi.getAnalyticsReport(selectedSurveys);
      setReport(response.data.report);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) return;

    // Parse the report into sections
    const sections = report.split('\n\n').map(section => {
      const [title, ...content] = section.split('\n');
      return {
        title: title.trim(),
        content: content.join('\n').trim(),
      };
    });

    const analyticsData = {
      title: 'Survey Analytics Report',
      content: `Generated on ${new Date().toLocaleDateString()}\n\nAnalyzed ${selectedSurveys.length} survey(s)`,
      sections: sections,
    };

    exportToDocx(analyticsData);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Survey Analytics
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Select surveys to generate a comprehensive analytics report
        </Typography>

        <Box sx={{ mb: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={surveys
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .every(survey => selectedSurveys.includes(survey.id))}
                      indeterminate={
                        surveys
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .some(survey => selectedSurveys.includes(survey.id)) &&
                        !surveys
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .every(survey => selectedSurveys.includes(survey.id))
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {surveys
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedSurveys.includes(survey.id)}
                          onChange={() => handleSurveySelect(survey.id)}
                        />
                      </TableCell>
                      <TableCell>{survey.title}</TableCell>
                      <TableCell>
                        <Tooltip title={survey.description || ''}>
                          <Box
                            sx={{
                              maxWidth: 700,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block'
                            }}
                          >
                            {survey.description || ''}
                          </Box>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={surveys.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="contained"
            onClick={generateReport}
            disabled={loading || selectedSurveys.length === 0}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          >
            {loading ? 'Generating Report...' : 'Generate Report'}
          </Button>

          {report && (
            <Button
              variant="outlined"
              onClick={handleExport}
              startIcon={<DownloadIcon />}
            >
              Export to Word
            </Button>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {report && (
          <Box>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h5" gutterBottom>
              Analytics Report
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ 
                p: 3, 
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                backgroundColor: '#f5f5f5'
              }}
            >
              {report}
            </Paper>
          </Box>
        )}
      </Paper>
    </Container>
  );
} 