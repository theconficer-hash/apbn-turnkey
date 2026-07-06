import axios from 'axios'

// Lokal: pakai proxy '/api'. Produksi (Vercel): fungsi serverless pada path yang sama.
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/api' })

export const runSimulation = (payload) => api.post('/simulate', payload)
export const downloadExcel = (payload) =>
  api.post('/export', payload, { responseType: 'blob' })

export default api
