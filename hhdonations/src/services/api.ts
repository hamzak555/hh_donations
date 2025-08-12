// API service for data persistence
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    
    return response.status === 204 ? null : await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// Data sync service
export const dataService = {
  // Sync all data at once
  syncAll: async (data: any) => {
    return apiCall('/sync', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // Get all data
  getAll: async () => {
    return apiCall('/data');
  },
};

// Drivers API
export const driversAPI = {
  getAll: async () => {
    return apiCall('/drivers');
  },
  
  create: async (driver: any) => {
    return apiCall('/drivers', {
      method: 'POST',
      body: JSON.stringify(driver),
    });
  },
  
  update: async (id: string, updates: any) => {
    return apiCall(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (id: string) => {
    return apiCall(`/drivers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Containers API
export const containersAPI = {
  getAll: async () => {
    return apiCall('/containers');
  },
  
  create: async (container: any) => {
    return apiCall('/containers', {
      method: 'POST',
      body: JSON.stringify(container),
    });
  },
  
  update: async (id: string, updates: any) => {
    return apiCall(`/containers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (id: string) => {
    return apiCall(`/containers/${id}`, {
      method: 'DELETE',
    });
  },
};

// Bins API
export const binsAPI = {
  getAll: async () => {
    return apiCall('/bins');
  },
  
  create: async (bin: any) => {
    return apiCall('/bins', {
      method: 'POST',
      body: JSON.stringify(bin),
    });
  },
  
  update: async (id: string, updates: any) => {
    return apiCall(`/bins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (id: string) => {
    return apiCall(`/bins/${id}`, {
      method: 'DELETE',
    });
  },
};

// Bales API
export const balesAPI = {
  getAll: async () => {
    return apiCall('/bales');
  },
  
  create: async (bale: any) => {
    return apiCall('/bales', {
      method: 'POST',
      body: JSON.stringify(bale),
    });
  },
  
  update: async (id: string, updates: any) => {
    return apiCall(`/bales/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (id: string) => {
    return apiCall(`/bales/${id}`, {
      method: 'DELETE',
    });
  },
};

// Pickup Requests API
export const pickupRequestsAPI = {
  getAll: async () => {
    return apiCall('/pickup-requests');
  },
  
  create: async (request: any) => {
    return apiCall('/pickup-requests', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  update: async (id: string, updates: any) => {
    return apiCall(`/pickup-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },
  
  delete: async (id: string) => {
    return apiCall(`/pickup-requests/${id}`, {
      method: 'DELETE',
    });
  },
};

// Check if API is available
export const checkAPIConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};