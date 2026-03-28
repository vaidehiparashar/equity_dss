<?php

namespace App\Filters;

use App\Models\TokenModel;
use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * AuthFilter – validates Bearer tokens on protected routes.
 *
 * Usage in app/Config/Filters.php:
 *   $aliases = ['auth' => \App\Filters\AuthFilter::class];
 *
 * Usage in app/Config/Routes.php:
 *   $routes->group('api', ['filter' => 'auth'], function ($routes) { ... });
 */
class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        // Handle CORS preflight requests without token check
        if ($request->getMethod() === 'options') {
            return;
        }

        $authHeader = $request->getHeaderLine('Authorization');

        if (empty($authHeader) || ! str_starts_with($authHeader, 'Bearer ')) {
            return response()->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Authentication token is missing or malformed.',
            ]);
        }

        $token = trim(str_replace('Bearer', '', $authHeader));

        $tokenModel = new TokenModel();
        $userId     = $tokenModel->getUserIdByToken($token);

        if (! $userId) {
            return response()->setStatusCode(401)->setJSON([
                'status'  => false,
                'message' => 'Token is invalid or has expired. Please log in again.',
            ]);
        }

        // Attach user_id to the request for downstream use
        $request->userId = $userId;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Add CORS headers to every response
        return $response
            ->setHeader('Access-Control-Allow-Origin',  '*')
            ->setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}
