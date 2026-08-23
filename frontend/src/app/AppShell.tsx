import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import { AppBar, Box, Container, Stack, Toolbar, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: 'primary.dark', borderBottom: '1px solid rgba(255,255,255,.12)' }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 66, md: 76 } }}>
            <Stack
              component={RouterLink}
              to="/"
              direction="row"
              spacing={1.25}
              sx={{ alignItems: 'center', color: 'common.white', textDecoration: 'none' }}
            >
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  bgcolor: 'secondary.main',
                }}
              >
                <FlightTakeoffRoundedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                  Vacayou
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.68)' }}>
                  Package Studio
                </Typography>
              </Box>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
      {children}
    </Box>
  );
}
