<?php

namespace App\Controllers\Api;

use App\Controllers\BaseController;
use App\Models\UserModel;
use App\Models\TeacherModel;
use CodeIgniter\HTTP\ResponseInterface;

class UserController extends BaseController
{
    // ── GET /api/users ───────────────────────────────────────
    /**
     * Returns all auth_user rows joined with their teacher data.
     * This route is protected by AuthFilter – token required.
     */
    public function index(): ResponseInterface
    {
        $userModel = new UserModel();

        // Pull users (no password)
        $users = $userModel->select('id, email, first_name, last_name, created_at')
                           ->orderBy('id', 'ASC')
                           ->findAll();

        return $this->respond([
            'status' => true,
            'users'  => $users,
            'total'  => count($users),
        ]);
    }

    // ── GET /api/teachers ─────────────────────────────────────
    /**
     * Returns all teachers joined with auth_user data.
     * Protected by AuthFilter.
     */
    public function teachers(): ResponseInterface
    {
        $teacherModel = new TeacherModel();

        $teachers = $teacherModel->getAllWithUser();

        // Compute a display_name field for the frontend table
        foreach ($teachers as &$t) {
            $t['name'] = trim($t['first_name'] . ' ' . $t['last_name']);
        }

        return $this->respond([
            'status'   => true,
            'teachers' => $teachers,
            'total'    => count($teachers),
        ]);
    }

    // ── DELETE /api/users/:id ─────────────────────────────────
    public function deleteUser(int $id): ResponseInterface
    {
        $userModel = new UserModel();

        if (! $userModel->find($id)) {
            return $this->respond(['status' => false, 'message' => 'User not found.'], 404);
        }

        // Cascading FK will also delete the teachers row
        $userModel->delete($id);

        return $this->respond(['status' => true, 'message' => 'User deleted.']);
    }

    // ── DELETE /api/teachers/:id ──────────────────────────────
    public function deleteTeacher(int $id): ResponseInterface
    {
        $teacherModel = new TeacherModel();

        if (! $teacherModel->find($id)) {
            return $this->respond(['status' => false, 'message' => 'Teacher not found.'], 404);
        }

        $teacherModel->delete($id);

        return $this->respond(['status' => true, 'message' => 'Teacher deleted.']);
    }

    // ── Helpers ──────────────────────────────────────────────

    private function respond(array $data, int $statusCode = 200): ResponseInterface
    {
        return $this->response
            ->setStatusCode($statusCode)
            ->setContentType('application/json')
            ->setJSON($data);
    }
}
