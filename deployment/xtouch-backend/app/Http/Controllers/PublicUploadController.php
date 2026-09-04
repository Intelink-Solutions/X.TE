<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class PublicUploadController extends Controller
{
    public function show(Request $request, string $path): BinaryFileResponse|StreamedResponse
    {
        abort_if($this->hasUnsafeSegments($path), 404);

        foreach (['public', 'legacy-public'] as $diskName) {
            try {
                $disk = Storage::disk($diskName);

                if ($disk->exists($path)) {
                    return $disk->response($path, null, $this->cacheHeaders());
                }
            } catch (Throwable $exception) {
                report($exception);
            }
        }

        // Check every public upload location used by the old and corrected
        // cPanel layouts, independent of stale cached filesystem config.
        $documentRoot = (string) $request->server('DOCUMENT_ROOT', '');
        $roots = array_filter(array_unique([
            storage_path('app/public'),
            base_path('public/storage'),
            public_path('storage'),
            $documentRoot !== '' ? rtrim($documentRoot, '/\\').DIRECTORY_SEPARATOR.'storage' : null,
        ]));

        foreach ($roots as $root) {
            $file = $this->fileInsideRoot((string) $root, $path);

            if ($file !== null) {
                return response()->file($file, $this->cacheHeaders());
            }
        }

        abort(404);
    }

    private function hasUnsafeSegments(string $path): bool
    {
        if ($path === '' || str_contains($path, "\0") || str_contains($path, '\\')) {
            return true;
        }

        return collect(explode('/', $path))->contains(
            fn (string $segment) => $segment === '' || $segment === '.' || $segment === '..',
        );
    }

    private function fileInsideRoot(string $root, string $path): ?string
    {
        $realRoot = realpath($root);

        if ($realRoot === false || ! is_dir($realRoot)) {
            return null;
        }

        $candidate = realpath($realRoot.DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $path));

        if ($candidate === false || ! is_file($candidate)) {
            return null;
        }

        $rootPrefix = rtrim($realRoot, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR;

        return str_starts_with($candidate, $rootPrefix) ? $candidate : null;
    }

    private function cacheHeaders(): array
    {
        return [
            'Cache-Control' => 'public, max-age=31536000, immutable',
            'X-Content-Type-Options' => 'nosniff',
        ];
    }
}
