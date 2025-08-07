import type { Truck, Filiale } from '@shared/schema';
import type { TruckFormData, TruckUpdateData, ApiResponse } from './types';

const API_BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      error: error || response.statusText,
    };
  }

  const data = await response.json();
  return {
    success: true,
    data,
  };
}

export const api = {
  trucks: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/trucks`);
      return handleResponse<Truck[]>(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/trucks/${id}`);
      return handleResponse<Truck>(response);
    },

    create: async (data: TruckFormData) => {
      const response = await fetch(`${API_BASE_URL}/trucks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<Truck>(response);
    },

    update: async (id: string, data: TruckUpdateData) => {
      const response = await fetch(`${API_BASE_URL}/trucks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return handleResponse<Truck>(response);
    },

    delete: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/trucks/${id}`, {
        method: 'DELETE',
      });
      return handleResponse<void>(response);
    },

    import: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/trucks/import`, {
        method: 'POST',
        body: formData,
      });
      return handleResponse<{ imported: number }>(response);
    },

    export: async () => {
      const response = await fetch(`${API_BASE_URL}/trucks/export`);
      return response.blob();
    },
  },

  filiales: {
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/filiales`);
      return handleResponse<Filiale[]>(response);
    },

    getById: async (id: string) => {
      const response = await fetch(`${API_BASE_URL}/filiales/${id}`);
      return handleResponse<Filiale>(response);
    },
  },
};
