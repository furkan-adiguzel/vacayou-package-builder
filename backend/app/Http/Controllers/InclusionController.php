<?php

namespace App\Http\Controllers;

use App\Http\Resources\InclusionResource;
use App\Models\Inclusion;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InclusionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $inclusions = Inclusion::query()
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return InclusionResource::collection($inclusions);
    }
}
