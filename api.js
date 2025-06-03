const API_BASE = 'http://109.172.39.61:8000/';

async function fetchData(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        ...options.headers,
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'API request failed');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const api = {
  async registerUser(userData) {
    return fetchData('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async getUsers(search = '') {
    return fetchData(`/users?search=${encodeURIComponent(search)}`);
  },

  async getUserProfile(userId) {
    return fetchData(`/users/${userId}`);
  },

  async updateUserGames(userId, games) {
    return fetchData(`/users/${userId}/games`, {
      method: 'PUT',
      body: JSON.stringify({ games })
    });
  },

  async getCurrentUser() {
    return fetchData('/users/me');
  },

  async buyPremium() {
    return fetchData('/payments/premium', {
      method: 'POST'
    });
  },

  async checkPremiumStatus() {
    return fetchData('/users/me/premium');
  }  
};