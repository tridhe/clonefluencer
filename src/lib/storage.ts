import { authService } from './auth';
import { API_BASE_URL } from './api';

export interface Generation {
  generation_id: string;
  user_id: string;
  user_email: string;
  prompt: string;
  enhanced_prompt?: string;
  image_model: string;
  llm_model: string;
  image_url: string;
  image_key: string;
  character_data?: any;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface GenerationStats {
  total_generations: number;
  user_id: string;
}

export interface StorageResponse<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface GenerationsResponse extends StorageResponse {
  generations: Generation[];
  last_key?: string;
  count: number;
}

class StorageService {
  private baseUrl = API_BASE_URL;

  private async getAuthHeaders(): Promise<HeadersInit> {
    const user = await authService.getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await authService.getAccessToken();
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-User-ID': user.sub,
      'X-User-Email': user.email || '',
    };
  }

  /**
   * Get user's image generations with pagination
   */
  async getUserGenerations(limit: number = 20, lastKey?: string): Promise<GenerationsResponse> {
    try {
      const headers = await this.getAuthHeaders();
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(lastKey && { last_key: lastKey })
      });

      const response = await fetch(`${this.baseUrl}/api/generations?${params}`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch generations');
      }

      return {
        success: data.success,
        generations: data.generations || [],
        last_key: data.last_key,
        count: data.count || 0,
        error: data.error
      };
    } catch (error) {
      console.error('Error fetching generations:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        generations: [],
        count: 0
      };
    }
  }

  /**
   * Get specific generation by ID
   */
  async getGeneration(generationId: string): Promise<StorageResponse<Generation>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generations/${generationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch generation');
      }

      return {
        success: data.success,
        data: data.generation,
        error: data.error
      };
    } catch (error) {
      console.error('Error fetching generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a generation
   */
  async deleteGeneration(generationId: string): Promise<StorageResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}/api/generations/${generationId}`, {
        method: 'DELETE',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete generation');
      }

      return {
        success: data.success,
        error: data.error
      };
    } catch (error) {
      console.error('Error deleting generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user's generation statistics
   */
  async getUserStats(): Promise<StorageResponse<GenerationStats>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}/api/user/stats`, {
        method: 'GET',
        headers,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      return {
        success: data.success,
        data: data.stats,
        error: data.error
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Publish a generation to the public explore marketplace
   */
  async publishGeneration(generationId: string): Promise<StorageResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}/api/generations/${generationId}/publish`, {
        method: 'POST',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to publish generation');
      }

      return {
        success: data.success,
        error: data.error,
      };
    } catch (error) {
      console.error('Error publishing generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Unpublish a generation (remove from marketplace)
   */
  async unpublishGeneration(generationId: string): Promise<StorageResponse> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}/api/generations/${generationId}/unpublish`, {
        method: 'POST',
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unpublish generation');
      }

      return {
        success: data.success,
        error: data.error,
      };
    } catch (error) {
      console.error('Error unpublishing generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Store an image generation (called automatically by image generation)
   */
  async storeGeneration(generationData: {
    prompt: string;
    image_model: string;
    llm_model: string;
    image_data: string; // base64
    character_data?: any;
    enhanced_prompt?: string;
  }): Promise<StorageResponse<{ generation_id: string; image_url: string; created_at: string }>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${this.baseUrl}/api/store-generation`, {
        method: 'POST',
        headers,
        body: JSON.stringify(generationData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to store generation');
      }

      return {
        success: data.success,
        data: {
          generation_id: data.generation_id,
          image_url: data.image_url,
          created_at: data.created_at
        },
        error: data.error
      };
    } catch (error) {
      console.error('Error storing generation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const storageService = new StorageService(); 