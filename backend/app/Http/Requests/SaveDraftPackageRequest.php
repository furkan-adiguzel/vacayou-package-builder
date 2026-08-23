<?php

namespace App\Http\Requests;

use App\Models\VacationPackage;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class SaveDraftPackageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $package = $this->route('package');

        if ($package instanceof VacationPackage && $package->isPublished()) {
            throw new HttpResponseException(response()->json([
                'message' => 'Published packages cannot be modified.',
            ], 409));
        }

        return true;
    }

    /**
     * Drafts deliberately enforce shape and referential integrity only.
     * Publishability is a separate concern handled by the publish action.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'property_id' => ['sometimes', 'nullable', 'integer', 'exists:properties,id'],
            'inclusion_ids' => ['sometimes', 'array'],
            'inclusion_ids.*' => ['integer', 'distinct', 'exists:inclusions,id'],
            'title' => ['sometimes', 'nullable', 'string'],
            'description' => ['sometimes', 'nullable', 'string'],
            'price' => ['sometimes', 'nullable', 'numeric'],
            'travel_start_date' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'travel_end_date' => ['sometimes', 'nullable', 'date_format:Y-m-d'],
            'current_step' => ['sometimes', 'integer', 'between:1,4'],
        ];
    }
}
