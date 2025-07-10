const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface EnhancePromptRequest {
  prompt: string;
  llm_model?: string;
}

export interface EnhancePromptResponse {
  original_prompt: string;
  enhanced_prompt: string;
}

export interface SurprisePromptResponse {
  prompt: string;
}

export interface CharacterPromptRequest {
  base_prompt: string;
  llm_model?: string;
  character_features: {
    age: string;
    gender: string;
    ethnicity: string;
    body_type: string;
    hair_style: string;
    hair_color: string;
    expression: string;
    personality: string;
    confidence_level: string;
    fashion_style: string;
    overall_vibe: string;
    background: string;
    lighting_style: string;
    photo_type: string;
  };
}

export interface CharacterPromptResponse {
  character_features: {
    age: string;
    gender: string;
    ethnicity: string;
    body_type: string;
    hair_style: string;
    hair_color: string;
    expression: string;
    personality: string;
    confidence_level: string;
    fashion_style: string;
    overall_vibe: string;
    background: string;
    lighting_style: string;
    photo_type: string;
  };
  base_prompt: string;
  generated_prompt: string;
}

export interface HealthResponse {
  status: string;
  aws_bedrock_available: boolean;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface ModelsResponse {
  text_models: Model[];
  image_models: Model[];
}

export interface GenerateImageRequest {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
}

export interface GenerateImageResponse {
  prompt: string;
  model: string;
  image: string;
  width: number;
  height: number;
}

export interface FluxEditRequest {
  input_image: string;
  prompt: string;
  llm_model?: string;
  aspect_ratio?: string;
  seed?: number;
  safety_tolerance?: number;
  output_format?: string;
}

export interface FluxEditResponse {
  success: boolean;
  image: string;
  prompt: string;
  original_prompt: string;
  optimized_prompt: string;
  model: string;
  width: number;
  height: number;
  request_id: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async enhancePrompt(data: EnhancePromptRequest): Promise<EnhancePromptResponse> {
    return this.request<EnhancePromptResponse>('/api/enhance-prompt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateSurprisePrompt(): Promise<SurprisePromptResponse> {
    return this.request<SurprisePromptResponse>('/api/surprise-prompt', {
      method: 'POST',
    });
  }

  async generateCharacterPrompt(data: CharacterPromptRequest): Promise<CharacterPromptResponse> {
    return this.request<CharacterPromptResponse>('/api/character-prompt', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getModels(): Promise<ModelsResponse> {
    return this.request<ModelsResponse>('/api/models');
  }

  async generateImage(data: GenerateImageRequest): Promise<GenerateImageResponse> {
    return this.request<GenerateImageResponse>('/api/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async editImageWithFlux(data: FluxEditRequest): Promise<FluxEditResponse> {
    return this.request<FluxEditResponse>('/api/image/flux-edit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService(); 