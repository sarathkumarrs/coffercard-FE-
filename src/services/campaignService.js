import api from '../utils/api';

export const campaignService = {
  // Get all campaigns
  getCampaigns: () => api.get('/campaigns/'),
  
  // Get single campaign
  getCampaign: (id) => api.get(`/campaigns/${id}/`),
  
  // Create new campaign
  createCampaign: (data) => api.post('/campaigns/', data),
  
  // Update campaign
  updateCampaign: (id, data) => api.put(`/campaigns/${id}/`, data),
  
  // Delete campaign
  deleteCampaign: (id) => api.delete(`/campaigns/${id}/`),
  
  // Get prizes for a campaign
  getPrizes: (campaignId) => api.get(`/prizes/?campaign=${campaignId}`),
  
  // Create prize
  createPrize: (data) => api.post('/prizes/', data),
  
  // Get campaign claims
  getClaims: (campaignId) => api.get(`/claims/?campaign=${campaignId}`),
  
  // Get campaign views
  getCampaignViews: (campaignId) => api.get(`/campaign-views/?campaign=${campaignId}`)
};