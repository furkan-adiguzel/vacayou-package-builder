<?php

namespace App\Models;

use App\Enums\InclusionCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Inclusion extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'category', 'price'];

    protected function casts(): array
    {
        return [
            'category' => InclusionCategory::class,
            'price' => 'decimal:2',
        ];
    }

    public function packages(): BelongsToMany
    {
        return $this->belongsToMany(VacationPackage::class, 'inclusion_package', 'inclusion_id', 'package_id');
    }
}
