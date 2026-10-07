<?php

namespace App\Services;

class GeocodingService
{
    private const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
    private const USER_AGENT = 'WandererSouthIndia/1.0 (info@wanderersouthindia.com)';
    private static array $memoryCache = [];

    /**
     * Geocode a place name into [latitude, longitude].
     * Returns [float, float] or null if not found.
     *
     * @param string $placeName
     * @param string|null $destinationContext
     * @return array{0: float, 1: float}|null
     */
    public static function geocode(string $placeName, ?string $destinationContext = null): ?array
    {
        $name = trim($placeName);
        if (empty($name)) return null;

        $cacheKey = strtolower($name . '|' . ($destinationContext ?? ''));
        if (isset(self::$memoryCache[$cacheKey])) {
            return self::$memoryCache[$cacheKey];
        }

        // Try with destination context first (e.g. "Shore Temple, Mahabalipuram, Tamil Nadu, India")
        $queries = [];
        if ($destinationContext && !empty(trim($destinationContext))) {
            $queries[] = $name . ', ' . trim($destinationContext) . ', India';
        }
        $queries[] = $name . ', South India';
        $queries[] = $name . ', India';
        $queries[] = $name;

        foreach ($queries as $query) {
            $coords = self::queryNominatim($query);
            if ($coords !== null) {
                self::$memoryCache[$cacheKey] = $coords;
                return $coords;
            }
        }

        self::$memoryCache[$cacheKey] = null;
        return null;
    }

    /**
     * Execute a single Nominatim HTTP request with rate compliance.
     */
    private static function queryNominatim(string $query): ?array
    {
        $params = http_build_query([
            'q' => $query,
            'format' => 'json',
            'limit' => 1,
            'addressdetails' => 0,
        ]);

        $url = self::NOMINATIM_URL . '?' . $params;

        $options = [
            'http' => [
                'method' => 'GET',
                'header' => "User-Agent: " . self::USER_AGENT . "\r\n" .
                            "Accept: application/json\r\n",
                'timeout' => 4,
                'ignore_errors' => true,
            ],
        ];

        $context = stream_context_create($options);

        try {
            $response = @file_get_contents($url, false, $context);
            if ($response === false) {
                return null;
            }

            $data = json_decode($response, true);
            if (!empty($data) && is_array($data) && isset($data[0]['lat'], $data[0]['lon'])) {
                return [
                    (float) $data[0]['lat'],
                    (float) $data[0]['lon'],
                ];
            }
        } catch (\Throwable $e) {
            error_log('[GeocodingService] Error geocoding query "' . $query . '": ' . $e->getMessage());
        }

        return null;
    }
}
