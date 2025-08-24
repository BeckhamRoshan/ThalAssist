// src/services/ApiService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.refreshTokenPromise = null;
  }

  setToken(token) {
    this.token = token;
  }

  getToken() {
    return this.token || localStorage.getItem('auth_token');
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      let response = await fetch(url, config);
      
      // Handle token refresh for 401 responses
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          config.headers.Authorization = `Bearer ${this.getToken()}`;
          response = await fetch(url, config);
        } else {
          // Refresh failed, redirect to login
          this.clearToken();
          window.location.href = '/login';
          return;
        }
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async refreshToken() {
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this._performTokenRefresh();
    const result = await this.refreshTokenPromise;
    this.refreshTokenPromise = null;
    return result;
  }

  async _performTokenRefresh() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token);
        localStorage.setItem('auth_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }

    return false;
  }

  // Authentication endpoints
  async login(credentials) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
      localStorage.setItem('auth_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.access_token) {
      this.setToken(response.access_token);
      localStorage.setItem('auth_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }
    
    return response;
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    }
    this.clearToken();
  }

  async updateProfile(profileData) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Donor-related endpoints
  async findDonors(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/donors/search?${queryString}`);
  }

  async getDonorProfile(donorId) {
    return this.request(`/api/donors/${donorId}`);
  }

  async updateDonorAvailability(availability) {
    return this.request('/api/donors/availability', {
      method: 'POST',
      body: JSON.stringify(availability),
    });
  }

  async getDonationHistory() {
    return this.request('/api/donors/donations/history');
  }

  async scheduleDonation(donationData) {
    return this.request('/api/donors/donations/schedule', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  // Blood availability endpoints
  async getBloodAvailability(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/blood/availability?${queryString}`);
  }

  async getBloodBanks(location) {
    return this.request(`/api/blood/banks?location=${encodeURIComponent(location)}`);
  }

  async requestBlood(requestData) {
    return this.request('/api/blood/request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  // Emergency endpoints
  async createEmergencyRequest(emergencyData) {
    return this.request('/api/emergency/request', {
      method: 'POST',
      body: JSON.stringify(emergencyData),
    });
  }

  async getEmergencyRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/emergency/requests?${queryString}`);
  }

  async respondToEmergency(requestId, responseData) {
    return this.request(`/api/emergency/requests/${requestId}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  }

  // Chatbot endpoints
  async sendChatMessage(message, context = {}) {
    return this.request('/api/chatbot/message', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async getChatHistory(limit = 50) {
    return this.request(`/api/chatbot/history?limit=${limit}`);
  }

  // Notification endpoints
  async getNotifications() {
    return this.request('/api/notifications');
  }

  async markNotificationRead(notificationId) {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/api/notifications/read-all', {
      method: 'POST',
    });
  }

  // Analytics endpoints
  async getUserStats() {
    return this.request('/api/analytics/user-stats');
  }

  async getDashboardData() {
    return this.request('/api/dashboard/data');
  }

  // Location-based services
  async getNearbyUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/location/nearby-users?${queryString}`);
  }

  async updateLocation(locationData) {
    return this.request('/api/location/update', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  // Matching algorithm endpoints
  async findCompatibleDonors(patientData) {
    return this.request('/api/matching/find-donors', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  async findPatientsInNeed(donorData) {
    return this.request('/api/matching/find-patients', {
      method: 'POST',
      body: JSON.stringify(donorData),
    });
  }

  // File upload endpoints
  async uploadFile(file, type = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/api/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }

  // Error reporting
  async reportError(errorData) {
    return this.request('/api/errors/report', {
      method: 'POST',
      body: JSON.stringify(errorData),
    });
  }
}



// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Also export the class for testing purposes
export { ApiService };