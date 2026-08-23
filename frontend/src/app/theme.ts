import { alpha, createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#173f35',
      light: '#37665a',
      dark: '#0d2b24',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#d96f55',
      dark: '#b9513c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f3ed',
      paper: '#ffffff',
    },
    text: {
      primary: '#17312b',
      secondary: '#66736f',
    },
    divider: '#dfe4df',
    success: {
      main: '#397a62',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
      lineHeight: 1.05,
      fontWeight: 500,
      letterSpacing: '-0.035em',
    },
    h2: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 500,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, minHeight: 42, paddingInline: 18 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid #e4e8e3',
          boxShadow: '0 16px 45px rgba(26, 50, 43, 0.07)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': { borderBottom: 0 },
          '&:hover': { backgroundColor: alpha('#173f35', 0.025) },
        },
      },
    },
  },
});
