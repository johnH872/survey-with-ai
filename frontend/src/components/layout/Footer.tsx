import { Box, Typography, } from '@mui/material';
import './Footer.scss';

export default function Footer() {
  // const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[200],
      }}
    >
      <Typography variant="body2" color="text.secondary" align="center">
        © {new Date().getFullYear()} Survey App. All rights reserved.
      </Typography>
    </Box>
  );
} 