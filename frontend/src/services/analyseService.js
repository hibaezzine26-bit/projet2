import api from './api';

export const analyseService = {
  async getSummary() {
    const response = await api.get('/analyse/summary');
    return response.data;
  },

  async getResultats() {
    const response = await api.get('/analyse/resultats');
    return response.data;
  },

  async getAnomalies() {
    const response = await api.get('/analyse/anomalies');
    return response.data;
  },

  async executerAnalyse() {
    const response = await api.post('/analyse/executer');
    return response.data;
  },

  async getEtat() {
    const response = await api.get('/analyse/etat');
    return response.data;
  },

  async getStatistiques() {
    const response = await api.get('/analyse/statistiques');
    return response.data;
  },
};

export default analyseService;
