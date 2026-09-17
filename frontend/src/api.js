import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const getSummary = (peak) => api.get('/summary', { params: { peak } }).then((r) => r.data)
export const getZones = (peak) => api.get('/zones', { params: { peak } }).then((r) => r.data)
export const getTraffic = (peak) => api.get('/traffic', { params: { peak } }).then((r) => r.data)
export const getTransit = () => api.get('/transit').then((r) => r.data)
export const getFanZones = () => api.get('/fan-zones').then((r) => r.data)
export const getEnergyTimeseries = (peak) =>
  api.get('/energy-timeseries', { params: { peak } }).then((r) => r.data)

export const analyzeSustainability = (payload) =>
  api.post('/analyze-sustainability', payload).then((r) => r.data)

export default api
