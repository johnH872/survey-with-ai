import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Divider,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import {
  GoogleOAuthProvider,
  GoogleLogin,
} from "@react-oauth/google";
import './Login.scss';
import { GOOGLE_CLIENT_ID } from '../../config';
import { authApi } from '../../services/api';

export default function Login() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    // Check for token in URL (from OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      login(token);
    }
  }, [login]);

  const onSuccessResponse = async (response: any) => {
    try {
      const result = await authApi.googleAuth(response.credential);
      const { access_token, user } = result.data;
      await login(access_token, user);
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="login-container">
      <div className="background-gradient">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
      
      <Container component="main" maxWidth="sm">
        <Paper className="login-card" elevation={6}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Typography 
              component="h1" 
              variant="h4" 
              className="login-title"
            >
              Survey Platform
            </Typography>
            
            <Typography 
              variant="body1" 
              className="login-subtitle"
            >
              Create, manage, and analyze surveys with ease
            </Typography>
            
            <Divider className="login-divider">
              <Typography variant="body2" className="divider-text">
                Sign in to continue
              </Typography>
            </Divider>
            
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box className="google-oauth-container">
                <GoogleOAuthProvider
                  clientId={GOOGLE_CLIENT_ID}
                >
                  <GoogleLogin
                    onSuccess={onSuccessResponse}
                    onError={() => {
                      console.log("Login With Google Failed");
                    }}
                    useOneTap
                    theme="filled_blue"
                    size="large"
                    width="100%"
                    text="signin_with"
                    shape="rectangular"
                    logo_alignment="left"
                  />
                </GoogleOAuthProvider>
              </Box>
            </Box>
            
            <Typography 
              variant="body2" 
              className="terms-text"
            >
              By signing in, you agree to our Terms of Service and Privacy Policy
            </Typography>
          </Box>
        </Paper>
      </Container>
    </div>
  );
} 