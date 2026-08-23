import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import { Alert, Box, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import type { PackageData } from '../../types/package';
import type { StepErrors } from './validation';

interface DetailsStepProps {
  draft: PackageData;
  errors: StepErrors;
  onChange: (changes: Partial<PackageData>) => void;
}

export function DetailsStep({ draft, errors, onChange }: DetailsStepProps) {
  const errorFor = (field: string) => errors[field]?.[0];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Package details
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Set the guest-facing story, commercial price, and valid travel window.
        </Typography>
      </Box>
      {Object.keys(errors).length > 0 && (
        <Alert severity="warning">Review the highlighted fields before continuing.</Alert>
      )}
      <TextField
        fullWidth
        required
        label="Package title"
        value={draft.title ?? ''}
        onChange={(event) => onChange({ title: event.target.value })}
        error={Boolean(errorFor('title'))}
        helperText={errorFor('title') ?? `${draft.title?.length ?? 0}/100 characters`}
        slotProps={{ htmlInput: { maxLength: 120 } }}
      />
      <TextField
        fullWidth
        multiline
        minRows={4}
        label="Description"
        value={draft.description ?? ''}
        onChange={(event) => onChange({ description: event.target.value })}
        helperText="Optional — add context that helps operators understand the package."
      />
      <TextField
        fullWidth
        required
        type="number"
        label="Package price"
        value={draft.price ?? ''}
        onChange={(event) =>
          onChange({ price: event.target.value === '' ? null : Number(event.target.value) })
        }
        error={Boolean(errorFor('price'))}
        helperText={errorFor('price') ?? 'Total package price in USD.'}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <PaymentsOutlinedIcon fontSize="small" />
                <Typography sx={{ ml: 0.75 }}>$</Typography>
              </InputAdornment>
            ),
          },
          htmlInput: { min: 0, step: '0.01' },
        }}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <TextField
          fullWidth
          required
          type="date"
          label="Start date"
          value={draft.travel_start_date ?? ''}
          onChange={(event) => onChange({ travel_start_date: event.target.value || null })}
          error={Boolean(errorFor('travel_start_date'))}
          helperText={errorFor('travel_start_date')}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarMonthOutlinedIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          fullWidth
          required
          type="date"
          label="End date"
          value={draft.travel_end_date ?? ''}
          onChange={(event) => onChange({ travel_end_date: event.target.value || null })}
          error={Boolean(errorFor('travel_end_date'))}
          helperText={errorFor('travel_end_date')}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>
    </Stack>
  );
}
