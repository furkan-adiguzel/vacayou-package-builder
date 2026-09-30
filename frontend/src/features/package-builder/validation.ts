import { z } from 'zod';
import type { PackageData } from '../../types/package';

export type StepErrors = Record<string, string[]>;

export function todayAsIso(now = new Date()): string {
  const localTime = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 10);
}

function detailsSchema(today: string) {
  return z
    .object({
      title: z
        .string({
          required_error: 'Enter a package title.',
          invalid_type_error: 'Enter a package title.',
        })
        .trim()
        .min(5, 'Use at least 5 characters.')
        .max(100, 'Keep the title to 100 characters or fewer.'),
      subtitle: z.string().trim().max(100, 'Keep the subtitle to 100 characters or fewer.').nullable(),
      description: z.string().nullable(),
      price: z
        .number({ required_error: 'Enter a package price.', invalid_type_error: 'Enter a package price.' })
        .positive('Price must be greater than zero.'),
      travel_start_date: z.string().min(1, 'Choose a start date.'),
      travel_end_date: z.string().min(1, 'Choose an end date.'),
    })
    .superRefine((details, context) => {
      if (details.travel_start_date && details.travel_start_date < today) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['travel_start_date'],
          message: 'Start date cannot be in the past.',
        });
      }

      if (
        details.travel_start_date &&
        details.travel_end_date &&
        details.travel_end_date <= details.travel_start_date
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['travel_end_date'],
          message: 'End date must be after the start date.',
        });
      }
    });
}

export function getStepErrors(step: number, draft: PackageData, today = todayAsIso()): StepErrors {
  if (step === 0) {
    return draft.property_id === null ? { property_id: ['Select one property to continue.'] } : {};
  }

  if (step === 1) {
    return draft.inclusion_ids.length === 0
      ? { inclusion_ids: ['Add at least one inclusion to continue.'] }
      : {};
  }

  if (step !== 2) return {};

  const result = detailsSchema(today).safeParse({
    title: draft.title,
    subtitle: draft.subtitle,
    description: draft.description,
    price: draft.price,
    travel_start_date: draft.travel_start_date ?? '',
    travel_end_date: draft.travel_end_date ?? '',
  });

  if (result.success) return {};

  return result.error.issues.reduce<StepErrors>((errors, issue) => {
    const field = String(issue.path[0] ?? 'details');
    errors[field] = [...(errors[field] ?? []), issue.message];
    return errors;
  }, {});
}

export function canProceedFromStep(step: number, draft: PackageData, today?: string): boolean {
  return Object.keys(getStepErrors(step, draft, today)).length === 0;
}
