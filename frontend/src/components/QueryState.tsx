import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 320 }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress size={30} />
        <Typography color="text.secondary">{label}</Typography>
      </Stack>
    </Box>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'We could not load this page.', onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      icon={<ErrorOutlineRoundedIcon />}
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    >
      {message}
    </Alert>
  );
}
