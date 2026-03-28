<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table         = 'auth_user';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $returnType    = 'array';

    protected $allowedFields = [
        'email',
        'first_name',
        'last_name',
        'password',
    ];

    // Never return password in select results
    protected $hidden = ['password'];

    protected $validationRules = [
        'email'      => 'required|valid_email|is_unique[auth_user.email]',
        'first_name' => 'required|min_length[2]|max_length[100]',
        'last_name'  => 'required|min_length[2]|max_length[100]',
        'password'   => 'required|min_length[6]',
    ];

    protected $validationMessages = [
        'email' => [
            'is_unique' => 'This email address is already registered.',
        ],
    ];

    // ── Helpers ──────────────────────────────────────────────

    /** Find user by email, including the password field for verification */
    public function findByEmail(string $email): ?array
    {
        return $this->select('id, email, first_name, last_name, password')
                    ->where('email', $email)
                    ->first();
    }

    /** Return user without password */
    public function findSafe(int $id): ?array
    {
        return $this->select('id, email, first_name, last_name, created_at')
                    ->find($id);
    }
}
