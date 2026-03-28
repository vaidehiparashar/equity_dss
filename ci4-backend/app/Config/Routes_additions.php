<?php

// ================================================================
//  app/Config/Routes.php  –  ADD these lines to your existing file
//  Place AFTER the default CI4 route declarations.
// ================================================================

// ── Public routes (no token needed) ─────────────────────────────
$routes->post('api/register', 'Api\AuthController::register');
$routes->post('api/login',    'Api\AuthController::login');
$routes->get('api/users', 'Api\UserController::index');

// ── Protected routes (AuthFilter validates Bearer token) ─────────
$routes->group('api', ['filter' => 'auth'], function ($routes) {

    // Auth
    $routes->post('logout', 'Api\AuthController::logout');

    // Users
   
    $routes->delete('users/(:num)', 'Api\UserController::deleteUser/$1');

    // Teachers
    $routes->get   ('teachers',           'Api\UserController::teachers');
    $routes->delete('teachers/(:num)',    'Api\UserController::deleteTeacher/$1');
});
