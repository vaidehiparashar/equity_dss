<?php

namespace App\Models;

use CodeIgniter\Model;

class TeacherModel extends Model
{
    protected $table         = 'teachers';
    protected $primaryKey    = 'id';
    protected $useTimestamps = true;
    protected $returnType    = 'array';

    protected $allowedFields = [
        'user_id',
        'university_name',
        'gender',
        'year_joined',
    ];

    protected $validationRules = [
        'user_id'         => 'required|integer',
        'university_name' => 'required|min_length[2]|max_length[200]',
        'gender'          => 'required|in_list[male,female,other]',
        'year_joined'     => 'required|integer|less_than_equal_to[2099]',
    ];

    // ── Helpers ──────────────────────────────────────────────

    /**
     * Return all teachers joined with auth_user data.
     * Single query, no N+1.
     */
    public function getAllWithUser(): array
    {
        return $this->db->table('teachers t')
            ->select([
                't.id',
                'u.id        AS user_id',
                'u.email',
                'u.first_name',
                'u.last_name',
                't.university_name',
                't.gender',
                't.year_joined',
                'u.created_at',
            ])
            ->join('auth_user u', 'u.id = t.user_id', 'inner')
            ->orderBy('t.id', 'ASC')
            ->get()
            ->getResultArray();
    }

    /** Find teacher row by user_id */
    public function findByUserId(int $userId): ?array
    {
        return $this->where('user_id', $userId)->first();
    }
}
