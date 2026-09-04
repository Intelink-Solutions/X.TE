<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteContent;
use Illuminate\Http\Request;

class SiteContentController extends Controller
{
    public function index()
    {
        return response()->json(SiteContent::where('is_active', true)->get());
    }

    public function show($page)
    {
        return response()->json(
            SiteContent::where('page', $page)->where('is_active', true)->get()
        );
    }
}
