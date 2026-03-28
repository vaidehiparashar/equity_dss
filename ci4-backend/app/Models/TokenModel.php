<?php

namespace App\Models;

use CodeIgniter\Model;

class TokenModel extends Model
{
    protected $table         = 'auth_tokens';
    protected $primaryKey    = 'id';
    protected $useTimestamps = false;   // we set created_at manually
    protected $returnType    = 'array';

    protected $allowedFields = ['user_id', 'token', 'expires_at', 'created_at'];

    // ── Helpers ──────────────────────────────────────────────

    /** Generate and persist a new token for the given user (24-hour expiry). */
    public function createForUser(int $userId): string
    {
        // Revoke any existing tokens for this user
        $this->where('user_id', $userId)->delete();

        $token = bin2hex(random_bytes(32));   // 64-char hex string

        $this->insert([
            'user_id'    => $userId,
            'token'      => $token,
            'expires_at' => date('Y-m-d H:i:s', strtotime('+24 hours')),
            'created_at' => date('Y-m-d H:i:s'),
        ]);

        return $token;
    }

    /**
     * Validate a raw Bearer token.
     * Returns the user_id on success, null on failure/expiry.
     */
    public function getUserIdByToken(string $token): ?int
    {
        $row = $this->where('token', $token)
                    ->where('expires_at >', date('Y-m-d H:i:s'))
                    ->first();

        return $row ? (int) $row['user_id'] : null;
    }

    /** Revoke a specific token (used on logout). */
    public function revokeToken(string $token): void
    {
        $this->where('token', $token)->delete();
    }
}
