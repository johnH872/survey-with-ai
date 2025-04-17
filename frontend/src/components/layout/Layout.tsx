import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, CssBaseline } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        bgcolor: 'background.default',
      }}
    >
      <CssBaseline />
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          py: 3,
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth={false}>
          {children || <Outlet />}
        </Container>
      </Box>
      <Footer />
    </Box>
  );
} 