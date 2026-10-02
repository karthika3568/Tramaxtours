<?php

namespace App\Utils;

use Exception;
use RuntimeException;

class JWT
{
    /**
     * Encode payload into a signed JSON Web Token (HS256).
     *
     * @param array $payload
     * @param string|null $secret
     * @param int|null $expiresIn
     * @return string
     */
    public static function encode(array $payload, ?string $secret = null, ?int $expiresIn = null): string
    {
        $config = self::getConfig();
        $secret = $secret ?? $config['secret'];
        $expiresIn = $expiresIn ?? $config['expiration'];
        $issuer = $config['issuer'];

        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256',
        ];

        $currentTime = time();
        $defaultClaims = [
            'iss' => $issuer,
            'iat' => $currentTime,
            'nbf' => $currentTime,
            'exp' => $currentTime + $expiresIn,
        ];

        $finalPayload = array_merge($defaultClaims, $payload);

        $base64Header = self::base64UrlEncode((string) json_encode($header));
        $base64Payload = self::base64UrlEncode((string) json_encode($finalPayload));

        $signature = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", $secret, true);
        $base64Signature = self::base64UrlEncode($signature);

        return "{$base64Header}.{$base64Payload}.{$base64Signature}";
    }

    /**
     * Decode and verify a JSON Web Token.
     *
     * @param string $token
     * @param string|null $secret
     * @return array
     * @throws RuntimeException
     */
    public static function decode(string $token, ?string $secret = null): array
    {
        $config = self::getConfig();
        $secret = $secret ?? $config['secret'];

        $parts = explode('.', trim($token));
        if (count($parts) !== 3) {
            throw new RuntimeException('Malformed JWT token structure.', 401);
        }

        [$base64Header, $base64Payload, $base64Signature] = $parts;

        $headerJson = self::base64UrlDecode($base64Header);
        $header = json_decode($headerJson, true);
        if (!is_array($header) || ($header['alg'] ?? '') !== 'HS256') {
            throw new RuntimeException('Unsupported or invalid JWT algorithm.', 401);
        }

        // Verify cryptographic signature (timing-safe)
        $expectedSignature = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", $secret, true);
        $actualSignature = self::base64UrlDecode($base64Signature);

        if (!hash_equals($expectedSignature, $actualSignature)) {
            throw new RuntimeException('Invalid JWT signature.', 401);
        }

        $payloadJson = self::base64UrlDecode($base64Payload);
        $payload = json_decode($payloadJson, true);
        if (!is_array($payload)) {
            throw new RuntimeException('Invalid JWT payload format.', 401);
        }

        $currentTime = time();

        // Check expiration (exp)
        if (isset($payload['exp']) && $payload['exp'] < $currentTime) {
            throw new RuntimeException('JWT token has expired.', 401);
        }

        // Check Not Before (nbf)
        if (isset($payload['nbf']) && $payload['nbf'] > $currentTime) {
            throw new RuntimeException('JWT token is not yet valid.', 401);
        }

        return $payload;
    }

    /**
     * Encode string to Base64Url (RFC 7515).
     *
     * @param string $data
     * @return string
     */
    public static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Decode Base64Url string (RFC 7515).
     *
     * @param string $data
     * @return string
     */
    public static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $padLen = 4 - $remainder;
            $data .= str_repeat('=', $padLen);
        }
        return (string) base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Load JWT configuration.
     *
     * @return array
     */
    private static function getConfig(): array
    {
        $configPath = dirname(__DIR__) . '/config/jwt.php';
        if (file_exists($configPath)) {
            return require $configPath;
        }

        return [
            'secret' => Env::get('JWT_SECRET', 'wanderer_default_secret_key'),
            'expiration' => (int) Env::get('JWT_EXPIRATION', 86400),
            'issuer' => Env::get('JWT_ISSUER', 'WandererSouthIndiaAPI'),
            'algorithm' => 'HS256',
        ];
    }
}
