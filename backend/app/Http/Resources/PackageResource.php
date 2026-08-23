<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status->value,
            'property_id' => $this->property_id,
            'property' => PropertyResource::make($this->whenLoaded('property')),
            'inclusion_ids' => $this->whenLoaded(
                'inclusions',
                fn () => $this->inclusions->pluck('id')->values(),
            ),
            'inclusions' => InclusionResource::collection($this->whenLoaded('inclusions')),
            'title' => $this->title,
            'description' => $this->description,
            'price' => $this->price === null ? null : (float) $this->price,
            'travel_start_date' => $this->travel_start_date?->format('Y-m-d'),
            'travel_end_date' => $this->travel_end_date?->format('Y-m-d'),
            'current_step' => $this->current_step,
            'published_at' => $this->published_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
