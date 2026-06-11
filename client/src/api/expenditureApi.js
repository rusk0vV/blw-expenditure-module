import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

const queryString = (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
};

const get = async (url, filters) => {
  const query = queryString(filters);
  const { data } = await api.get(query ? `${url}?${query}` : url);
  return data;
};

export const getFilters = () => get('/expenditure/filters');
export const getSummary = (filters) => get('/expenditure/summary', filters);
export const getQuarterly = (filters) => get('/expenditure/quarterly', filters);
export const getByHead = (filters) => get('/expenditure/by-head', filters);
export const getDistribution = (filters) => get('/expenditure/distribution', filters);
export const getForecast = () => get('/forecast');

export const uploadWorkbook = async (kind, file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/expenditure/upload/${kind}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress
  });
  return data;
};
