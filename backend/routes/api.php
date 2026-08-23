<?php

use App\Http\Controllers\InclusionController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PropertyController;
use Illuminate\Support\Facades\Route;

Route::get('/properties', [PropertyController::class, 'index']);
Route::get('/inclusions', [InclusionController::class, 'index']);

Route::get('/packages', [PackageController::class, 'index']);
Route::post('/packages', [PackageController::class, 'store']);
Route::get('/packages/{package}', [PackageController::class, 'show']);
Route::patch('/packages/{package}', [PackageController::class, 'update']);
