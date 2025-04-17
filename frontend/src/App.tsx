import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import SurveyList from './pages/surveys/SurveyList';
import SurveyCreate from './pages/surveys/SurveyCreate';
import SurveyEdit from './pages/surveys/SurveyEdit';
import SurveyAnalytics from './pages/surveys/SurveyAnalytics';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<SurveyList />} />
            <Route path="surveys/create" element={<SurveyCreate />} />
            <Route path="surveys/:id/edit" element={<SurveyEdit />} />
            <Route path="surveys/analytics" element={<SurveyAnalytics />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
