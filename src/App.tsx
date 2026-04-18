import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, AppBar, Toolbar } from '@mui/material';
import { EventList } from 'src/components/EventList';
import { sampleEvents } from 'src/data/sampleEvents';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                📋 Community Events
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.95 }}>
                Discover upcoming events, past sessions, and archived content
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        <Box component="main" sx={{ flex: 1, py: 6 }}>
          <EventList events={sampleEvents} />
        </Box>

        <Box
          component="footer"
          sx={{
            backgroundColor: '#2c3e50',
            color: 'white',
            textAlign: 'center',
            py: 3,
            mt: 'auto',
          }}
        >
          <Typography variant="body2">
            &copy; 2026 IMS Community. All events rights reserved.
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
