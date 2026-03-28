<?php

// ================================================================
//  app/Config/Filters.php  –  MODIFY the existing file as shown
// ================================================================
//
// 1. In the $aliases array, ADD:
//
//    'auth' => \App\Filters\AuthFilter::class,
//
// 2. In the $globals array, under 'before', ADD:
//    (this adds CORS support for all OPTIONS preflight requests)
//
//    \App\Filters\AuthFilter::class,     // <-- only do this if you
//                                        //     want CORS on ALL routes
//
// ── Minimal diff to apply ────────────────────────────────────────
//
// BEFORE:
//   public array $aliases = [];
//
// AFTER:
//   public array $aliases = [
//       'auth' => \App\Filters\AuthFilter::class,
//   ];
//
// That's the only required change. The filter is applied per-group
// in Routes.php using ['filter' => 'auth'].
//
// ── CORS for ALL routes (optional) ───────────────────────────────
// If your React app is on a different port (e.g. localhost:5173)
// and you see CORS errors, also add this to $globals['before']:
//
//   public array $globals = [
//       'before' => [
//           // 'honeypot',
//           // 'csrf',
//       ],
//       'after' => [],
//   ];
