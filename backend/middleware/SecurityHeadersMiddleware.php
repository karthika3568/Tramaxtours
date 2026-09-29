<?php

namespace App\Middleware;

class SecurityHeadersMiddleware
{
    /**
     * Set essential HTTP security headers on all API responses.
     *
     * @return void
     */
    public function handle(): void
    {
        if (!headers_sent()) {
            header('X-Content-Type-Options: nosniff');
            header('X-Frame-Options: SAMEORIGIN');
            header('X-XSS-Protection: 1; mode=block');
            header('Referrer-Policy: strict-origin-when-cross-origin');
            header('X-Permitted-Cross-Domain-Policies: none');
        }
    }
}
