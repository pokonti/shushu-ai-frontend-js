const API_BASE_URL = 'http://134.209.242.230:8000/auth';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('access_token');
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.email, // Using email as username
          password: userData.password,
          email: userData.email,
        //   first_name: userData.firstName,
        //   last_name: userData.lastName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(credentials) {
    try {
      // OAuth2PasswordRequestForm expects form data
      const formData = new FormData();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      this.token = data.access_token;

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      if (!this.token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If token is invalid, clear it
        if (response.status === 401) {
          this.logout();
        }
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch user data');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_type');
    this.token = null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.token;
  }

  // Get current token
  getToken() {
    return this.token;
  }

  // Get authorization header
  getAuthHeader() {
    return this.token ? `Bearer ${this.token}` : null;
  }

  // Helper method to make authenticated requests
  async authenticatedRequest(url, options = {}) {
    const authHeader = this.getAuthHeader();
    if (!authHeader) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Token expired or invalid, logout user
      this.logout();
      throw new Error('Session expired. Please log in again.');
    }

    return response;
  }
}

export default new AuthService();