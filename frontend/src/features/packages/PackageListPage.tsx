import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiError, createDraft, listPackages } from '../../api/client';
import { ErrorState, PageLoader } from '../../components/QueryState';
import type { PackageData } from '../../types/package';
import { formatDateRange, formatMoney } from '../../utils/format';

interface LocationState {
  published?: boolean;
}

function PackageStatusChip({ status }: Pick<PackageData, 'status'>) {
  const published = status === 'published';
  return (
    <Chip
      size="small"
      label={published ? 'Published' : 'Draft'}
      color={published ? 'success' : 'default'}
      variant={published ? 'filled' : 'outlined'}
      sx={!published ? { bgcolor: '#f7f4ec', borderColor: '#d9d2c4' } : undefined}
    />
  );
}

export function PackageListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const locationState = location.state as LocationState | null;
  const packagesQuery = useQuery({ queryKey: ['packages'], queryFn: listPackages });
  const createMutation = useMutation({
    mutationFn: createDraft,
    onSuccess: (created) => {
      queryClient.setQueryData<PackageData[]>(['packages'], (current = []) => [created, ...current]);
      navigate(`/packages/${created.id}/edit`);
    },
  });

  const packages = packagesQuery.data ?? [];
  const draftCount = packages.filter((item) => item.status === 'draft').length;
  const publishedCount = packages.length - draftCount;
  const createError = createMutation.error instanceof ApiError ? createMutation.error.message : null;

  return (
    <>
      <Box
        sx={{
          bgcolor: 'primary.dark',
          color: 'common.white',
          pb: { xs: 8, md: 11 },
          pt: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' } }}
          >
            <Box sx={{ maxWidth: 680 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2, color: '#f0ae91', alignItems: 'center' }}>
                <AutoAwesomeRoundedIcon fontSize="small" />
                <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: '.14em' }}>
                  Curated travel, made simple
                </Typography>
              </Stack>
              <Typography variant="h1">Build remarkable stays.</Typography>
              <Typography sx={{ mt: 2, maxWidth: 570, color: 'rgba(255,255,255,.7)', fontSize: '1.05rem' }}>
                Assemble properties, experiences, and commercial details into packages your guests will remember.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<AddRoundedIcon />}
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
              sx={{ minWidth: 168 }}
            >
              {createMutation.isPending ? 'Creating…' : 'New package'}
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -5 }, pb: 8, position: 'relative' }}>
        <Stack spacing={3}>
          {locationState?.published && (
            <Alert severity="success" onClose={() => navigate('/', { replace: true })}>
              Package published successfully. It is now locked for editing.
            </Alert>
          )}
          {createError && <Alert severity="error">{createError}</Alert>}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            {[
              ['All packages', packages.length],
              ['Drafts in progress', draftCount],
              ['Published', publishedCount],
            ].map(([label, value]) => (
              <Card key={label} sx={{ p: 2.5 }}>
                <Typography color="text.secondary" variant="body2">
                  {label}
                </Typography>
                <Typography variant="h4" sx={{ mt: 0.5, fontWeight: 800 }}>
                  {value}
                </Typography>
              </Card>
            ))}
          </Box>

          <Card sx={{ overflow: 'hidden' }}>
            <Box sx={{ px: { xs: 2.5, md: 3.5 }, py: 2.75, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Package library
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                Continue a saved draft or review a published package.
              </Typography>
            </Box>

            {packagesQuery.isPending ? (
              <PageLoader label="Loading packages…" />
            ) : packagesQuery.isError ? (
              <Box sx={{ p: 3 }}>
                <ErrorState onRetry={() => packagesQuery.refetch()} />
              </Box>
            ) : packages.length === 0 ? (
              <Stack spacing={1.5} sx={{ px: 3, py: 8, alignItems: 'center', textAlign: 'center' }}>
                <Inventory2OutlinedIcon sx={{ fontSize: 46, color: 'primary.light' }} />
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  Your first package starts here
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
                  Choose a property, add memorable inclusions, and publish when every detail feels right.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => createMutation.mutate()}
                >
                  Create package
                </Button>
              </Stack>
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 820 }}>
                  <TableHead>
                    <TableRow>
                      {['Package', 'Property', 'Travel dates', 'Price', 'Status', ''].map((heading) => (
                        <TableCell key={heading} sx={{ color: 'text.secondary', fontWeight: 800 }}>
                          {heading}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {packages.map((item) => {
                      const published = item.status === 'published';
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Typography sx={{ fontWeight: 800 }}>{item.title || 'Untitled package'}</Typography>
                            {item.subtitle?.trim() && (
                              <Typography variant="body2" color="text.secondary">
                                {item.subtitle}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {item.inclusion_ids.length} inclusion{item.inclusion_ids.length === 1 ? '' : 's'}
                            </Typography>
                          </TableCell>
                          <TableCell>{item.property?.name ?? 'Not selected'}</TableCell>
                          <TableCell>{formatDateRange(item.travel_start_date, item.travel_end_date)}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{formatMoney(item.price)}</TableCell>
                          <TableCell>
                            <PackageStatusChip status={item.status} />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              endIcon={<ArrowForwardRoundedIcon />}
                              onClick={() =>
                                navigate(published ? `/packages/${item.id}` : `/packages/${item.id}/edit`)
                              }
                            >
                              {published ? 'View' : 'Continue'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        </Stack>
      </Container>
    </>
  );
}
