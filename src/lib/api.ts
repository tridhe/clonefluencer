export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error: ${response.status} ${response.statusText}`, errorText);
    throw new Error(`API request failed with status ${response.status}`);
  }
  return response.json();
};

const apiService = {
  generateImage: async (data: {
    prompt: string;
    model: string;
    width: number;
    height: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  generateCharacterPrompt: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/character-prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  editImageWithFlux: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/image/flux`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  mergeImages: async (data: {
    left_url: string;
    right_url: string;
    target_width: number;
    target_height: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/image/merge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  getExploreImages: async (data: { limit: number }) => {
    const response = await fetch(`${API_BASE_URL}/api/explore?limit=${data.limit}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return handleResponse(response);
  },
};

export { apiService };