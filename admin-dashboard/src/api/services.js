import api from './axiosClient'

// ── AUTH ──────────────────────────────────────────────────────────
// CI4 routes: POST /api/login  |  POST /api/register  |  POST /api/logout
export const loginUser    = (data)  => api.post('/login',    data)
export const registerUser = (data)  => api.post('/register', data)
export const logoutUser   = ()      => api.post('/logout')

// ── USERS (protected – token auto-attached by axiosClient) ────────
export const getUsers     = ()      => api.get('/users')
export const deleteUser   = (id)    => api.delete(`/users/${id}`)

// ── TEACHERS (protected) ──────────────────────────────────────────
export const getTeachers   = ()     => api.get('/teachers')
export const deleteTeacher = (id)   => api.delete(`/teachers/${id}`)
