import api from './api';

export const importExportService = {
  async importExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/excel/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async exportExcel() {
    const response = await api.get('/excel/export', {
      responseType: 'blob',
    });
    return response.data;
  },

  async exportRegle(mode) {
    const response = await api.get(`/excel/export/${mode}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getHistorique(limit = 10) {
    const response = await api.get('/excel/historique/derniers', {
      params: { limit },
    });
    return response.data;
  },

  async getImports(limit = 10) {
    const response = await api.get('/excel/imports', {
      params: { limit },
    });
    return response.data;
  },
};

export default importExportService;
