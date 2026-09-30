<?php

namespace App\Actions;

use App\Enums\PackageStatus;
use App\Models\VacationPackage;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PublishPackage
{
    public function execute(VacationPackage $package): VacationPackage
    {
        return DB::transaction(function () use ($package) {
            $package = VacationPackage::query()
                ->with('inclusions')
                ->lockForUpdate()
                ->findOrFail($package->id);

            if ($package->isPublished()) {
                throw new HttpResponseException(response()->json([
                    'message' => 'Published packages cannot be published again.',
                ], 409));
            }

            $validator = Validator::make(
                [
                    'property_id' => $package->property_id,
                    'inclusion_ids' => $package->inclusions->pluck('id')->all(),
                    'title' => $package->title,
                    'subtitle' => $package->subtitle,
                    'price' => $package->price,
                    'travel_start_date' => $package->travel_start_date?->format('Y-m-d'),
                    'travel_end_date' => $package->travel_end_date?->format('Y-m-d'),
                ],
                [
                    'property_id' => ['required', 'integer', 'exists:properties,id'],
                    'inclusion_ids' => ['required', 'array', 'min:1'],
                    'title' => ['required', 'string', 'min:5', 'max:100'],
                    'subtitle' => ['nullable', 'string', 'max:100'],
                    'price' => ['required', 'numeric', 'gt:0'],
                    'travel_start_date' => ['required', 'date_format:Y-m-d', 'after_or_equal:today'],
                    'travel_end_date' => ['required', 'date_format:Y-m-d', 'after:travel_start_date'],
                ],
                [
                    'property_id.required' => 'A property must be selected.',
                    'inclusion_ids.required' => 'At least one inclusion is required.',
                    'inclusion_ids.min' => 'At least one inclusion is required.',
                    'title.required' => 'A package title is required.',
                    'title.min' => 'The package title must be at least 5 characters.',
                    'title.max' => 'The package title may not be greater than 100 characters.',
                    'subtitle.max' => 'The package subtitle may not be greater than 100 characters.',
                    'price.required' => 'A package price is required.',
                    'price.gt' => 'The package price must be greater than zero.',
                    'travel_start_date.required' => 'A travel start date is required.',
                    'travel_start_date.after_or_equal' => 'The travel start date may not be in the past.',
                    'travel_end_date.required' => 'A travel end date is required.',
                    'travel_end_date.after' => 'The travel end date must be after the start date.',
                ],
            );

            if ($validator->fails()) {
                throw new ValidationException(
                    $validator,
                    response()->json([
                        'message' => 'Package cannot be published.',
                        'errors' => $validator->errors(),
                    ], 422),
                );
            }

            $package->update([
                'status' => PackageStatus::Published,
                'published_at' => now(),
                'current_step' => 4,
            ]);

            return $package->refresh()->load(['property', 'inclusions']);
        });
    }
}
