import api from './api';

export const articleService = {
  async getArticles(page = 0, size = 20) {
    const response = await api.get('/articles', {
      params: { page, size },
    });
    return response.data;
  },

  async searchArticles(term, page = 0, size = 20) {
    const response = await api.get('/articles/search', {
      params: { term, page, size },
    });
    return response.data;
  },

  async getArticleById(id) {
    const response = await api.get(`/articles/${id}`);
    return response.data;
  },

  async getArticleByCodeSAP(codeSAP) {
    const response = await api.get(`/articles/code/${codeSAP}`);
    return response.data;
  },
};

export default articleService;
