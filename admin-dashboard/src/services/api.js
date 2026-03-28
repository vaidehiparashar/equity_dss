/**
 * src/services/api.js
 * ─────────────────────────────────────────────────────────────────
 * Central API service for the AdminPanel frontend.
 *
 * All functions return Axios promises.
 * The Bearer token is attached automatically by axiosClient interceptor.
 * On 401, the interceptor clears localStorage and redirects to /login.
 *
 * Usage example:
 *   import api from '../services/api'
 *   const { data } = await api.auth.login({ email, password })
 */

import axiosClient from '../api/axiosClient'

// ──────────────────────────────────────────────────────────────────
// AUTH  (public – no token needed)
// ──────────────────────────────────────────────────────────────────
const auth = {
  /**
   * Login a user.
   * @param {{ email: string, password: string }} credentials
   * @returns Promise<{ status, token, user }>
   */
  login: (credentials) => axiosClient.post('/login', credentials),

  /**
   * Register a new user + create their teacher profile in one call.
   * @param {{
   *   first_name: string,
   *   last_name: string,
   *   email: string,
   *   password: string,
   *   university_name: string,
   *   gender: 'male'|'female'|'other',
   *   year_joined: number
   * }} payload
   * @returns Promise<{ status, token, user }>
   */
  register: (payload) => axiosClient.post('/register', payload),

  /**
   * Logout – revokes the token from the server.
   * @returns Promise<{ status, message }>
   */
  logout: () => axiosClient.post('/logout'),
}

// ──────────────────────────────────────────────────────────────────
// USERS  (protected – requires Bearer token)
// ──────────────────────────────────────────────────────────────────
const users = {
  /**
   * Get all users.
   * @returns Promise<{ status, users: Array, total: number }>
   */
  getAll: () => axiosClient.get('/users'),

  /**
   * Delete a user by ID (also deletes their teacher record via CASCADE).
   * @param {number} id
   * @returns Promise<{ status, message }>
   */
  delete: (id) => axiosClient.delete(`/users/${id}`),
}

// ──────────────────────────────────────────────────────────────────
// TEACHERS  (protected – requires Bearer token)
// ──────────────────────────────────────────────────────────────────
const teachers = {
  /**
   * Get all teachers joined with their auth_user data.
   * @returns Promise<{ status, teachers: Array, total: number }>
   */
  getAll: () => axiosClient.get('/teachers'),

  /**
   * Delete a teacher record by teacher ID.
   * (Does NOT delete the auth_user account)
   * @param {number} id
   * @returns Promise<{ status, message }>
   */
  delete: (id) => axiosClient.delete(`/teachers/${id}`),
}

// ──────────────────────────────────────────────────────────────────
// Default export – grouped namespace for clean imports
// ──────────────────────────────────────────────────────────────────
const api = { auth, users, teachers }

export default api

// Named exports for direct import convenience
export { auth, users, teachers }
