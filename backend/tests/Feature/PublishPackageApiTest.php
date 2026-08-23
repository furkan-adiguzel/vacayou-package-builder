<?php

namespace Tests\Feature;

use App\Enums\PackageStatus;
use App\Models\VacationPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class PublishPackageApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2027-06-10 10:00:00');
        $this->seed();
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();

        parent::tearDown();
    }

    public function test_publish_reports_every_missing_business_rule(): void
    {
        $package = VacationPackage::query()->create();

        $this->postJson("/api/packages/{$package->id}/publish")
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Package cannot be published.')
            ->assertJsonValidationErrors([
                'property_id',
                'inclusion_ids',
                'title',
                'price',
                'travel_start_date',
                'travel_end_date',
            ]);

        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'status' => PackageStatus::Draft->value,
            'published_at' => null,
        ]);
    }

    public function test_publish_rejects_invalid_title_price_and_dates_together(): void
    {
        $package = VacationPackage::query()->create([
            'property_id' => 1,
            'title' => 'Trip',
            'price' => 0,
            'travel_start_date' => '2027-06-09',
            'travel_end_date' => '2027-06-09',
        ]);
        $package->inclusions()->sync([1]);

        $this->postJson("/api/packages/{$package->id}/publish")
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'title',
                'price',
                'travel_start_date',
                'travel_end_date',
            ])
            ->assertJsonPath('errors.title.0', 'The package title must be at least 5 characters.')
            ->assertJsonPath('errors.price.0', 'The package price must be greater than zero.')
            ->assertJsonPath('errors.travel_start_date.0', 'The travel start date may not be in the past.')
            ->assertJsonPath('errors.travel_end_date.0', 'The travel end date must be after the start date.');
    }

    public function test_a_valid_draft_can_be_published(): void
    {
        $package = VacationPackage::query()->create([
            'property_id' => 1,
            'title' => 'Bodrum Wellness Escape',
            'description' => 'Five restful days by the Aegean.',
            'price' => 850,
            'travel_start_date' => '2027-06-10',
            'travel_end_date' => '2027-06-15',
            'current_step' => 3,
        ]);
        $package->inclusions()->sync([1, 12]);

        $this->postJson("/api/packages/{$package->id}/publish")
            ->assertOk()
            ->assertJsonPath('data.status', 'published')
            ->assertJsonPath('data.current_step', 4)
            ->assertJsonPath('data.inclusion_ids', [1, 12])
            ->assertJsonPath('data.published_at', '2027-06-10T10:00:00+00:00');

        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'status' => PackageStatus::Published->value,
            'published_at' => '2027-06-10 10:00:00',
        ]);
    }

    public function test_a_published_package_cannot_be_published_again(): void
    {
        $package = VacationPackage::query()->create([
            'status' => PackageStatus::Published,
            'published_at' => now(),
        ]);

        $this->postJson("/api/packages/{$package->id}/publish")
            ->assertConflict()
            ->assertExactJson([
                'message' => 'Published packages cannot be published again.',
            ]);
    }
}
