import axios from 'axios';
import { API_BASE } from './data.js';

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

export const fetchSampleGraph = () => api.get('/api/sample-graph').then(r => r.data);

export const runDijkstra = (nodes, edges, source, target) =>
  api.post('/api/dijkstra', { nodes, edges, source, target }).then(r => r.data);

export const runBellmanFord = (nodes, edges, source, target) =>
  api.post('/api/bellman-ford', { nodes, edges, source, target }).then(r => r.data);

export const compareAlgorithms = (nodes, edges, source, target) =>
  api.post('/api/compare', { nodes, edges, source, target }).then(r => r.data);

export const validateGraph = (nodes, edges) =>
  api.post('/api/validate-graph', { nodes, edges }).then(r => r.data);

export const checkHealth = () => api.get('/api/health').then(r => r.data);
