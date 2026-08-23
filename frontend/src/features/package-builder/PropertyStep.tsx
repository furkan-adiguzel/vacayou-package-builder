import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { listProperties } from '../../api/client';
import type { Property } from '../../types/package';
import { formatMoney } from '../../utils/format';
import { useDebouncedValue } from './useDebouncedValue';

interface PropertyStepProps {
  selectedId: number | null;
  error?: string;
  onSelect: (property: Property) => void;
}

export function PropertyStep({ selectedId, error, onSelect }: PropertyStepProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const propertiesQuery = useQuery({
    queryKey: ['properties', debouncedSearch],
    queryFn: () => listProperties(debouncedSearch),
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Choose a property
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          Select exactly one place for this package. Search checks both property name and location.
        </Typography>
      </Box>
      <TextField
        fullWidth
        label="Search properties"
        placeholder="Try Bodrum, Kyoto, or a hotel name"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      {error && <Alert severity="warning">{error}</Alert>}
      {propertiesQuery.isPending ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : propertiesQuery.isError ? (
        <Alert severity="error">Properties could not be loaded. Please try again.</Alert>
      ) : propertiesQuery.data.length === 0 ? (
        <Alert severity="info">No properties match “{debouncedSearch}”.</Alert>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          {propertiesQuery.data.map((property) => {
            const selected = property.id === selectedId;
            return (
              <Card
                key={property.id}
                variant="outlined"
                sx={{
                  position: 'relative',
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? 'primary.main' : 'divider',
                  boxShadow: selected ? '0 10px 30px rgba(23,63,53,.11)' : 'none',
                }}
              >
                <CardActionArea onClick={() => onSelect(property)} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {property.name}
                        </Typography>
                        <Stack direction="row" spacing={0.5} sx={{ mt: 1, alignItems: 'center' }}>
                          <LocationOnOutlinedIcon fontSize="small" color="action" />
                          <Typography color="text.secondary" variant="body2">
                            {property.location}
                          </Typography>
                        </Stack>
                        <Typography sx={{ mt: 2, fontWeight: 800, color: 'primary.main' }}>
                          {formatMoney(property.nightly_rate)}{' '}
                          <Typography component="span" variant="body2" color="text.secondary">
                            / night
                          </Typography>
                        </Typography>
                      </Box>
                      {selected && <CheckCircleRoundedIcon color="primary" />}
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      )}
    </Stack>
  );
}
