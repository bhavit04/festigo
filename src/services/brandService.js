import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Request config:', {
    url: config.url,
    headers: config.headers,
    method: config.method
  });
  return config;
});

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
);

const brandService = {
  // Get dashboard data
  getDashboardData: async (brandId) => {
    try {
      if (!brandId) {
        throw new Error('Brand ID is required');
      }
      
      console.log('Fetching dashboard data for brandId:', brandId);
      const response = await api.get(`/brands/${brandId}/dashboard`);
      console.log('Dashboard data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Dashboard fetch error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      // Log the full error object
      console.error('Full error object:', error);
      
      throw new Error(error.response?.data?.error || 'Failed to fetch dashboard data');
    }
  },

  // Update preferences
  updatePreferences: async (brandId, preferences) => {
    try {
      const response = await api.patch(`/${brandId}/preferences`, preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update preferences');
    }
  },

  // Get sponsorship history
  getSponsorshipHistory: async (brandId) => {
    try {
      const response = await api.get(`/${brandId}/sponsorships/history`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch sponsorship history');
    }
  },

  // Update sponsorship status
  updateSponsorshipStatus: async (sponsorshipId, status) => {
    try {
      const response = await api.patch(`/sponsorship/${sponsorshipId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update sponsorship status');
    }
  },

  // Create sponsorship request
  createSponsorshipRequest: async (requestData) => {
    try {
      const response = await api.post('/sponsorship/request', requestData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to create sponsorship request');
    }
  },

  createListing: async (listingData) => {
    try {
      console.log('Creating listing with data:', listingData);
      
      // Validate required fields
      if (!listingData.brandId || !listingData.brandName || !listingData.industry) {
        throw new Error('Missing required brand information');
      }

      const response = await api.post('/listings/create', listingData);
      console.log('Listing created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Create listing error:', error);
      throw error;
    }
  },

  getListings: async (filters = {}) => {
    try {
      const response = await api.get('/listings', { params: filters });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch listings');
    }
  },

  // Add the sendProposal method
  sendProposal: async (formData) => {
    try {
      console.log('Sending proposal file...');
      
      const response = await api.post('/proposals/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Proposal sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Send proposal error:', error);
      throw new Error(error.response?.data?.error || 'Failed to send proposal');
    }
  },

  getProposals: async (listingId) => {
    try {
      const response = await api.get(`/proposals/listing/${listingId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to fetch proposals');
    }
  },

  updateProposalStatus: async (proposalId, status) => {
    try {
      const response = await api.patch(`/proposals/${proposalId}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to update proposal status');
    }
  }
};

export default brandService; 
