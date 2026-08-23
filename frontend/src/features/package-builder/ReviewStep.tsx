import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { Box, Card, Chip, Divider, Stack, Typography } from '@mui/material';
import type { PackageData } from '../../types/package';
import { formatDateRange, formatMoney } from '../../utils/format';

interface ReviewStepProps {
  draft: PackageData;
  published?: boolean;
}

export function ReviewStep({ draft, published = false }: ReviewStepProps) {
  return (
    <Stack spacing={3}>
      <Box>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              {published ? 'Published package' : 'Review your package'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {published
                ? 'This package is final and available as a read-only record.'
                : 'Everything look right? Publishing makes this package final.'}
            </Typography>
          </Box>
          {published && <Chip color="success" label="Published" />}
        </Stack>
      </Box>
      <Card sx={{ overflow: 'hidden' }}>
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            color: 'common.white',
            background: 'linear-gradient(135deg, #173f35 0%, #2f6556 100%)',
          }}
        >
          <Typography variant="overline" sx={{ color: '#f0ae91', fontWeight: 900, letterSpacing: '.13em' }}>
            Vacation package
          </Typography>
          <Typography variant="h3" sx={{ mt: 1, maxWidth: 650 }}>
            {draft.title || 'Untitled package'}
          </Typography>
          {draft.description && (
            <Typography sx={{ mt: 2, maxWidth: 700, color: 'rgba(255,255,255,.72)', whiteSpace: 'pre-line' }}>
              {draft.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            <Stack direction="row" spacing={1.25}>
              <LocationOnOutlinedIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  PROPERTY
                </Typography>
                <Typography sx={{ fontWeight: 800 }}>{draft.property?.name ?? 'Not selected'}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {draft.property?.location ?? '—'}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.25}>
              <CalendarMonthOutlinedIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  TRAVEL DATES
                </Typography>
                <Typography sx={{ fontWeight: 800 }}>
                  {formatDateRange(draft.travel_start_date, draft.travel_end_date)}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.25}>
              <PaymentsOutlinedIcon color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  PACKAGE PRICE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  {formatMoney(draft.price)}
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Divider sx={{ my: 3.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Included experiences
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
            {draft.inclusions.map((inclusion) => (
              <Stack key={inclusion.id} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <CheckCircleOutlineRoundedIcon color="success" fontSize="small" />
                <Typography>{inclusion.name}</Typography>
              </Stack>
            ))}
          </Box>
        </Box>
      </Card>
    </Stack>
  );
}
