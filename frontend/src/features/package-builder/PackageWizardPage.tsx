import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import PublishRoundedIcon from '@mui/icons-material/PublishRounded';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Card,
  Chip,
  Container,
  Snackbar,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ApiError,
  getPackage,
  listInclusions,
  publishPackage,
  updateDraft,
} from '../../api/client';
import { ErrorState, PageLoader } from '../../components/QueryState';
import type { DraftPayload, Inclusion, PackageData, Property } from '../../types/package';
import { DetailsStep } from './DetailsStep';
import { InclusionsStep } from './InclusionsStep';
import { PropertyStep } from './PropertyStep';
import { ReviewStep } from './ReviewStep';
import { getStepErrors, type StepErrors } from './validation';

const steps = ['Property', 'Inclusions', 'Details', 'Review & publish'];
const noInclusions: Inclusion[] = [];

function toDraftPayload(draft: PackageData, currentStep: number): DraftPayload {
  return {
    property_id: draft.property_id,
    inclusion_ids: draft.inclusion_ids,
    title: draft.title,
    description: draft.description,
    price: draft.price,
    travel_start_date: draft.travel_start_date,
    travel_end_date: draft.travel_end_date,
    current_step: currentStep,
  };
}

function apiErrors(error: unknown): StepErrors {
  return error instanceof ApiError ? error.errors : {};
}

export function PackageWizardPage() {
  const { packageId } = useParams();
  const id = Number(packageId);
  const validId = Number.isInteger(id) && id > 0;
  const packageQuery = useQuery({
    queryKey: ['package', id],
    queryFn: () => getPackage(id),
    enabled: validId,
  });
  const inclusionsQuery = useQuery({ queryKey: ['inclusions'], queryFn: listInclusions });

  if (!validId) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <ErrorState message="That package id is not valid." />
      </Container>
    );
  }

  if (packageQuery.isPending) return <PageLoader label="Opening package…" />;

  if (packageQuery.isError) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <ErrorState message="This package could not be loaded." onRetry={() => packageQuery.refetch()} />
      </Container>
    );
  }

  return (
    <PackageWizardEditor
      initialPackage={packageQuery.data}
      allInclusions={inclusionsQuery.data ?? noInclusions}
      inclusionsLoading={inclusionsQuery.isPending}
    />
  );
}

interface PackageWizardEditorProps {
  initialPackage: PackageData;
  allInclusions: Inclusion[];
  inclusionsLoading: boolean;
}

function PackageWizardEditor({
  initialPackage,
  allInclusions,
  inclusionsLoading,
}: PackageWizardEditorProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const openedForEditing = location.pathname.endsWith('/edit');
  const initialStep =
    initialPackage.status === 'published'
      ? 3
      : Math.min(Math.max(initialPackage.current_step - 1, 0), 3);
  const [draft, setDraft] = useState(initialPackage);
  const [activeStep, setActiveStep] = useState(initialStep);
  const [furthestStep, setFurthestStep] = useState(initialStep);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<StepErrors>({});
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (initialPackage.status === 'draft' && !openedForEditing) {
      navigate(`/packages/${initialPackage.id}/edit`, { replace: true });
    }
  }, [initialPackage.id, initialPackage.status, navigate, openedForEditing]);

  const saveMutation = useMutation({
    mutationFn: ({ data, step }: { data: PackageData; step: number }) =>
      updateDraft(data.id, toDraftPayload(data, step)),
    onSuccess: (saved) => {
      setDraft(saved);
      setDirty(false);
      setErrors({});
      setSavedNotice(true);
      queryClient.setQueryData(['package', saved.id], saved);
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error) => setErrors(apiErrors(error)),
  });

  const publishMutation = useMutation({
    mutationFn: async (data: PackageData) => {
      const saved = await updateDraft(data.id, toDraftPayload(data, 4));
      return publishPackage(saved.id);
    },
    onSuccess: (published) => {
      setDirty(false);
      queryClient.setQueryData(['package', published.id], published);
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      navigate('/', { replace: true, state: { published: true } });
    },
    onError: (error) => setErrors(apiErrors(error)),
  });

  useEffect(() => {
    if (!dirty) return undefined;

    const beforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  const updateWorkingDraft = (changes: Partial<PackageData>) => {
    setDraft((current) => (current ? { ...current, ...changes } : current));
    setDirty(true);
    setErrors((current) => {
      const next = { ...current };
      Object.keys(changes).forEach((field) => delete next[field]);
      return next;
    });
  };

  const workingDraft = useMemo(() => {
    return {
      ...draft,
      inclusions: allInclusions.filter((item) => draft.inclusion_ids.includes(item.id)),
    };
  }, [allInclusions, draft]);

  const readOnly = workingDraft.status === 'published';
  const pending = saveMutation.isPending || publishMutation.isPending;
  const requestError = saveMutation.error ?? publishMutation.error;
  const requestMessage = requestError instanceof ApiError ? requestError.message : null;

  const selectProperty = (property: Property) => {
    updateWorkingDraft({ property_id: property.id, property });
  };

  const toggleInclusion = (inclusionId: number) => {
    const selected = workingDraft.inclusion_ids.includes(inclusionId)
      ? workingDraft.inclusion_ids.filter((idValue) => idValue !== inclusionId)
      : [...workingDraft.inclusion_ids, inclusionId];
    updateWorkingDraft({ inclusion_ids: selected });
  };

  const handleNext = async () => {
    const stepErrors = getStepErrors(activeStep, workingDraft);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;

    const nextStep = Math.min(activeStep + 1, 3);
    try {
      const saved = await saveMutation.mutateAsync({ data: workingDraft, step: nextStep + 1 });
      setDraft(saved);
      setActiveStep(nextStep);
      setFurthestStep((current) => Math.max(current, nextStep));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      // Mutation callbacks surface structured API errors in the page.
    }
  };

  const handleSave = () => saveMutation.mutate({ data: workingDraft, step: activeStep + 1 });

  const goToCompletedStep = (targetStep: number) => {
    if (targetStep > activeStep) {
      for (let step = activeStep; step < targetStep; step += 1) {
        const stepErrors = getStepErrors(step, workingDraft);
        if (Object.keys(stepErrors).length > 0) {
          setActiveStep(step);
          setErrors(stepErrors);
          return;
        }
      }
    }

    setActiveStep(targetStep);
    setErrors({});
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, pb: 10 }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}
        >
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/')}>
            Back to packages
          </Button>
          {!readOnly && (
            <Chip
              icon={<CloudDoneOutlinedIcon />}
              label={dirty ? 'Unsaved changes' : 'Draft saved'}
              color={dirty ? 'warning' : 'default'}
              variant="outlined"
            />
          )}
        </Stack>

        {requestMessage && <Alert severity="error">{requestMessage}</Alert>}

        {!readOnly && (
          <Card sx={{ px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 3 } }}>
            <Stepper activeStep={activeStep} nonLinear alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label} completed={index < activeStep || index < furthestStep}>
                  <StepButton
                    disabled={index > furthestStep}
                    onClick={() => index <= furthestStep && goToCompletedStep(index)}
                  >
                    <StepLabel>{label}</StepLabel>
                  </StepButton>
                </Step>
              ))}
            </Stepper>
          </Card>
        )}

        <Card sx={{ p: { xs: 2.5, md: 4.5 }, minHeight: 480 }}>
          {readOnly || activeStep === 3 ? (
            <ReviewStep draft={workingDraft} published={readOnly} />
          ) : activeStep === 0 ? (
            <PropertyStep
              selectedId={workingDraft.property_id}
              error={errors.property_id?.[0]}
              onSelect={selectProperty}
            />
          ) : activeStep === 1 ? (
            <InclusionsStep
              inclusions={allInclusions}
              selectedIds={workingDraft.inclusion_ids}
              isLoading={inclusionsLoading}
              error={errors.inclusion_ids?.[0]}
              onToggle={toggleInclusion}
            />
          ) : (
            <DetailsStep draft={workingDraft} errors={errors} onChange={updateWorkingDraft} />
          )}
        </Card>

        {!readOnly && (
          <Card
            sx={{
              p: 2,
              position: 'sticky',
              bottom: 16,
              zIndex: 2,
              boxShadow: '0 18px 50px rgba(23,49,43,.16)',
            }}
          >
            <Stack
              direction={{ xs: 'column-reverse', sm: 'row' }}
              sx={{ justifyContent: 'space-between', gap: 1.5 }}
            >
              <Button variant="text" disabled={pending} onClick={handleSave}>
                {saveMutation.isPending ? 'Saving…' : 'Save draft'}
              </Button>
              <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
                {activeStep > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackRoundedIcon />}
                    disabled={pending}
                    onClick={() => {
                      setActiveStep((current) => current - 1);
                      setErrors({});
                    }}
                  >
                    Back
                  </Button>
                )}
                {activeStep < 3 ? (
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardRoundedIcon />}
                    disabled={pending}
                    onClick={handleNext}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={publishMutation.isPending ? <CheckRoundedIcon /> : <PublishRoundedIcon />}
                    disabled={pending}
                    onClick={() => publishMutation.mutate(workingDraft)}
                  >
                    {publishMutation.isPending ? 'Publishing…' : 'Publish package'}
                  </Button>
                )}
              </Stack>
            </Stack>
          </Card>
        )}
      </Stack>
      <Snackbar
        open={savedNotice}
        autoHideDuration={2600}
        onClose={() => setSavedNotice(false)}
        message="Draft saved"
      />
    </Container>
  );
}
