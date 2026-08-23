<?php

namespace App\Models;

use App\Enums\PackageStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class VacationPackage extends Model
{
    protected $table = 'packages';

    protected $fillable = [
        'property_id',
        'status',
        'title',
        'description',
        'price',
        'travel_start_date',
        'travel_end_date',
        'current_step',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => PackageStatus::class,
            'price' => 'decimal:2',
            'travel_start_date' => 'date:Y-m-d',
            'travel_end_date' => 'date:Y-m-d',
            'published_at' => 'datetime',
        ];
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function inclusions(): BelongsToMany
    {
        return $this->belongsToMany(Inclusion::class, 'inclusion_package', 'package_id', 'inclusion_id');
    }

    public function isPublished(): bool
    {
        return $this->status === PackageStatus::Published;
    }
}
