<?php

namespace App\Http\Controllers;

use App\Actions\PublishPackage;
use App\Enums\PackageStatus;
use App\Http\Requests\SaveDraftPackageRequest;
use App\Http\Resources\PackageResource;
use App\Models\VacationPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class PackageController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $packages = VacationPackage::query()
            ->with(['property', 'inclusions'])
            ->latest('updated_at')
            ->get();

        return PackageResource::collection($packages);
    }

    public function store(SaveDraftPackageRequest $request): JsonResponse
    {
        $package = DB::transaction(function () use ($request) {
            $validated = $request->validated();
            $inclusionIds = Arr::pull($validated, 'inclusion_ids', []);

            $package = VacationPackage::query()->create([
                ...$validated,
                'status' => PackageStatus::Draft,
            ]);
            $package->inclusions()->sync($inclusionIds);

            return $package;
        });

        return PackageResource::make($package->refresh()->load(['property', 'inclusions']))
            ->response()
            ->setStatusCode(201);
    }

    public function show(VacationPackage $package): PackageResource
    {
        return PackageResource::make($package->load(['property', 'inclusions']));
    }

    public function update(SaveDraftPackageRequest $request, VacationPackage $package): PackageResource
    {
        DB::transaction(function () use ($request, $package) {
            $validated = $request->validated();
            $hasInclusions = array_key_exists('inclusion_ids', $validated);
            $inclusionIds = Arr::pull($validated, 'inclusion_ids', []);

            $package->update($validated);

            if ($hasInclusions) {
                $package->inclusions()->sync($inclusionIds);
            }
        });

        return PackageResource::make($package->refresh()->load(['property', 'inclusions']));
    }

    public function publish(VacationPackage $package, PublishPackage $publishPackage): PackageResource
    {
        return PackageResource::make($publishPackage->execute($package));
    }
}
