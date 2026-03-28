<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use App\Models\TeacherModel;
use App\Models\TokenModel;
use CodeIgniter\HTTP\ResponseInterface;

class AuthController extends BaseController
{
    // ── POST /api/register ───────────────────────────────────
    /**
     * Creates an auth_user row AND a teachers row in a single transaction.
     *
     * Expected JSON body:
     * {
     *   "email":           "alice@example.com",
     *   "first_name":      "Alice",
     *   "last_name":       "Smith",
     *   "password":        "secret123",
     *   "university_name": "MIT",
     *   "gender":          "female",
     *   "year_joined":     2020
     * }
     */
    public function register(): ResponseInterface
    {
        $input = $this->request->getJSON(true);

        if (empty($input)) {
            return $this->fail('Request body must be valid JSON.', 400);
        }

        $userModel    = new UserModel();
        $teacherModel = new TeacherModel();

        // ── Validate user fields ──────────────────────────────
        $userModel->setValidationRule('email', 'required|valid_email|is_unique[auth_user.email]');
        if (! $userModel->validate($input)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $userModel->errors(),
            ], 422);
        }

        // ── Validate teacher fields ───────────────────────────
        // Temporarily set user_id = 0 to run teacher validation only
        $teacherInput = [
            'user_id'         => 1,           // placeholder for validation
            'university_name' => $input['university_name'] ?? '',
            'gender'          => $input['gender']          ?? '',
            'year_joined'     => $input['year_joined']     ?? '',
        ];
        if (! $teacherModel->validate($teacherInput)) {
            return $this->respond([
                'status'  => false,
                'message' => 'Validation failed',
                'errors'  => $teacherModel->errors(),
            ], 422);
        }

        // ── Wrap both inserts in a transaction ────────────────
        $db = \Config\Database::connect();
        $db->transBegin();

        try {
            // 1. Insert auth_user
            $userId = $userModel->insert([
                'email'      => $input['email'],
                'first_name' => $input['first_name'],
                'last_name'  => $input['last_name'],
                'password'   => password_hash($input['password'], PASSWORD_BCRYPT),
            ], true);

            if (! $userId) {
                throw new \RuntimeException('Failed to insert user.');
            }

            // 2. Insert teachers (linking via user_id)
            $teacherModel->insert([
                'user_id'         => $userId,
                'university_name' => $input['university_name'],
                'gender'          => $input['gender'],
                'year_joined'     => (int) $input['year_joined'],
            ]);

            $db->transCommit();

        } catch (\Throwable $e) {
            $db->transRollback();
            return $this->respond([
                'status'  => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
            ], 500);
        }

        // 3. Issue token immediately after register
        $tokenModel = new TokenModel();
        $token      = $tokenModel->createForUser($userId);

        $user = $userModel->findSafe($userId);

        return $this->respond([
            'status'  => true,
            'message' => 'Registration successful',
            'token'   => $token,
            'user'    => $user,
        ], 201);
    }

    // ── POST /api/login ──────────────────────────────────────
    /**
     * Expected JSON body:
     * { "email": "alice@example.com", "password": "secret123" }
     */
    public function login(): ResponseInterface
    {
        $input = $this->request->getJSON(true);

        if (empty($input['email']) || empty($input['password'])) {
            return $this->respond([
                'status'  => false,
                'message' => 'Email and password are required.',
            ], 400);
        }

        $userModel = new UserModel();
        $user      = $userModel->findByEmail($input['email']);

        if (! $user || ! password_verify($input['password'], $user['password'])) {
            return $this->respond([
                'status'  => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $tokenModel = new TokenModel();
        $token      = $tokenModel->createForUser((int) $user['id']);

        // Return user without password
        unset($user['password']);
        $user['name'] = trim($user['first_name'] . ' ' . $user['last_name']);

        return $this->respond([
            'status'  => true,
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => $user,
        ], 200);
    }

    // ── POST /api/logout  (protected) ────────────────────────
    public function logout(): ResponseInterface
    {
        $bearer = $this->request->getHeaderLine('Authorization');
        $token  = trim(str_replace('Bearer', '', $bearer));

        if ($token) {
            (new TokenModel())->revokeToken($token);
        }

        return $this->respond([
            'status'  => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    // ── Helpers ──────────────────────────────────────────────

    private function respond(array $data, int $statusCode = 200): ResponseInterface
    {
        return $this->response
            ->setStatusCode($statusCode)
            ->setContentType('application/json')
            ->setJSON($data);
    }

    private function fail(string $message, int $code = 400): ResponseInterface
    {
        return $this->respond(['status' => false, 'message' => $message], $code);
    }
}
