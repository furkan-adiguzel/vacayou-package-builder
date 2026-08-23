import { describe, expect, it } from 'vitest';
import type { PackageData } from '../../types/package';
import { canProceedFromStep, getStepErrors } from './validation';

const validDraft: PackageData = {
  id: 1,
  status: 'draft',
  property_id: 1,
  property: null,
  inclusion_ids: [1],
  inclusions: [],
  title: 'Bodrum Wellness Escape',
  description: null,
  price: 850,
  travel_start_date: '2027-06-10',
  travel_end_date: '2027-06-15',
  current_step: 1,
  published_at: null,
  created_at: '2026-08-23T10:00:00Z',
  updated_at: '2026-08-23T10:00:00Z',
};

describe('wizard step gating', () => {
  it('requires exactly one selected property before leaving step one', () => {
    expect(canProceedFromStep(0, { ...validDraft, property_id: null })).toBe(false);
    expect(canProceedFromStep(0, validDraft)).toBe(true);
  });

  it('requires at least one inclusion before leaving step two', () => {
    expect(canProceedFromStep(1, { ...validDraft, inclusion_ids: [] })).toBe(false);
    expect(canProceedFromStep(1, validDraft)).toBe(true);
  });

  it('reports all invalid commercial details in one pass', () => {
    const errors = getStepErrors(
      2,
      {
        ...validDraft,
        title: 'Trip',
        price: 0,
        travel_start_date: '2026-08-22',
        travel_end_date: '2026-08-22',
      },
      '2026-08-23',
    );

    expect(errors).toMatchObject({
      title: ['Use at least 5 characters.'],
      price: ['Price must be greater than zero.'],
      travel_start_date: ['Start date cannot be in the past.'],
      travel_end_date: ['End date must be after the start date.'],
    });
  });

  it('allows a start date of today when the end date is later', () => {
    expect(
      canProceedFromStep(
        2,
        {
          ...validDraft,
          travel_start_date: '2026-08-23',
          travel_end_date: '2026-08-24',
        },
        '2026-08-23',
      ),
    ).toBe(true);
  });

  it('rejects an end date equal to the start date', () => {
    expect(
      canProceedFromStep(
        2,
        {
          ...validDraft,
          travel_start_date: '2027-06-10',
          travel_end_date: '2027-06-10',
        },
        '2026-08-23',
      ),
    ).toBe(false);
  });
});
