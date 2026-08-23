import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import {
  Alert,
  Box,
  Card,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material';
import type { Inclusion, InclusionCategory } from '../../types/package';
import { formatMoney } from '../../utils/format';

const categories: Array<{ value: InclusionCategory; label: string }> = [
  { value: 'spa', label: 'Spa & wellness' },
  { value: 'activity', label: 'Activities' },
  { value: 'dining', label: 'Dining' },
  { value: 'transfer', label: 'Transfers' },
];

interface InclusionsStepProps {
  inclusions: Inclusion[];
  selectedIds: number[];
  isLoading: boolean;
  error?: string;
  onToggle: (inclusionId: number) => void;
}

export function InclusionsStep({ inclusions, selectedIds, isLoading, error, onToggle }: InclusionsStepProps) {
  if (isLoading) return <Typography color="text.secondary">Loading inclusions…</Typography>;

  return (
    <Stack spacing={3}>
      <Box>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Add inclusions
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Bundle at least one memorable extra with the stay.
            </Typography>
          </Box>
          <Chip
            icon={<CheckCircleRoundedIcon />}
            label={`${selectedIds.length} selected`}
            color={selectedIds.length > 0 ? 'primary' : 'default'}
          />
        </Stack>
      </Box>
      {error && <Alert severity="warning">{error}</Alert>}
      {categories.map((category) => {
        const group = inclusions.filter((item) => item.category === category.value);
        if (group.length === 0) return null;
        return (
          <Box key={category.value}>
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '.12em' }}>
              {category.label}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
                gap: 1.5,
                mt: 1,
              }}
            >
              {group.map((inclusion) => {
                const selected = selectedIds.includes(inclusion.id);
                return (
                  <Card
                    key={inclusion.id}
                    variant="outlined"
                    sx={{
                      px: 1.5,
                      py: 0.75,
                      boxShadow: 'none',
                      borderColor: selected ? 'primary.main' : 'divider',
                      bgcolor: selected ? 'rgba(23,63,53,.035)' : 'background.paper',
                    }}
                  >
                    <FormControlLabel
                      sx={{ m: 0, width: '100%', alignItems: 'center' }}
                      control={
                        <Checkbox
                          checked={selected}
                          onChange={() => onToggle(inclusion.id)}
                          icon={<AddCircleOutlineRoundedIcon />}
                          checkedIcon={<CheckCircleRoundedIcon />}
                        />
                      }
                      label={
                        <Stack
                          direction="row"
                          sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                          <Typography sx={{ fontWeight: 700 }}>{inclusion.name}</Typography>
                          <Typography color="text.secondary" variant="body2" sx={{ ml: 2, whiteSpace: 'nowrap' }}>
                            {formatMoney(inclusion.price)}
                          </Typography>
                        </Stack>
                      }
                    />
                  </Card>
                );
              })}
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
