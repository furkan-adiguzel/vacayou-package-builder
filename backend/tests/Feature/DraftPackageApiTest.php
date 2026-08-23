<?php

namespace Tests\Feature;

use App\Enums\PackageStatus;
use App\Models\VacationPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DraftPackageApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    public function test_properties_can_be_searched_by_name_or_location(): void
    {
        $this->getJson('/api/properties?search=bodrum')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Azure Cove Resort & Spa');

        $this->getJson('/api/properties?search=Japan')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Kyoto Zen Garden Hotel');
    }

    public function test_an_empty_draft_can_be_created_and_incomplete_values_can_be_saved(): void
    {
        $packageId = $this->postJson('/api/packages', [])
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.current_step', 1)
            ->json('data.id');

        $longTitle = str_repeat('a', 120);

        $this->patchJson("/api/packages/{$packageId}", [
            'property_id' => 1,
            'inclusion_ids' => [1, 12],
            'title' => $longTitle,
            'price' => -15,
            'travel_start_date' => '2020-01-01',
            'current_step' => 2,
        ])
            ->assertOk()
            ->assertJsonPath('data.title', $longTitle)
            ->assertJsonPath('data.price', -15)
            ->assertJsonPath('data.inclusion_ids', [1, 12]);

        $this->assertDatabaseHas('packages', [
            'id' => $packageId,
            'status' => PackageStatus::Draft->value,
            'price' => -15,
        ]);
        $this->assertDatabaseCount('inclusion_package', 2);
    }

    public function test_draft_references_must_exist(): void
    {
        $package = VacationPackage::query()->create();

        $this->patchJson("/api/packages/{$package->id}", [
            'property_id' => 999,
            'inclusion_ids' => [1, 999],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['property_id', 'inclusion_ids.1']);
    }

    public function test_a_published_package_cannot_be_updated(): void
    {
        $package = VacationPackage::query()->create([
            'status' => PackageStatus::Published,
            'published_at' => now(),
        ]);

        $this->patchJson("/api/packages/{$package->id}", ['title' => 'A changed title'])
            ->assertConflict()
            ->assertExactJson(['message' => 'Published packages cannot be modified.']);
    }
}
