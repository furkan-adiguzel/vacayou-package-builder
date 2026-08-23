<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'location', 'nightly_rate'];

    protected function casts(): array
    {
        return ['nightly_rate' => 'decimal:2'];
    }

    public function packages(): HasMany
    {
        return $this->hasMany(VacationPackage::class, 'property_id');
    }
}
