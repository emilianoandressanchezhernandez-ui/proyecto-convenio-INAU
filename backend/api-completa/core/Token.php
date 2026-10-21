<?php

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Token
{
    private const ALGORITHM = 'HS256';
    private const COOKIE_NAME = 'access_token';

    public static function create(User $user): string
    {
        $payload = [
            'id' => $user->getId(),
            'nombre' => $user->getName(),
            'rol' => $user->getRole(),
            'iat' => time(),
            'exp' => time() + TOKEN_LIFETIME,
        ];

        return JWT::encode(
            $payload,
            SECRET_KEY,
            self::ALGORITHM
        );
    }

    public static function sendCookie(string $token): void
    {
        setcookie(self::COOKIE_NAME, $token, [
            'expires' => time() + TOKEN_LIFETIME,
            'path' => '/',
            'secure' => self::isHttps(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
    }

    public static function clearCookie(): void
    {
        setcookie(self::COOKIE_NAME, '', [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => self::isHttps(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);

        unset($_COOKIE[self::COOKIE_NAME]);
    }

    public static function read(): ?array
    {
        $token = $_COOKIE[self::COOKIE_NAME] ?? null;

        if ($token === null) {
            return null;
        }

        try {
            $payload = JWT::decode(
                $token,
                new Key(SECRET_KEY, self::ALGORITHM)
            );

            return (array) $payload;
        } catch (Exception $e) {
            return null;
        }
    }

    private static function isHttps(): bool
    {
        return isset($_SERVER['HTTPS'])
            && strtolower($_SERVER['HTTPS']) !== 'off';
    }
}
