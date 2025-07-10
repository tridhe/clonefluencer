export interface CharacterFeatures {
  // Demographics
  age: string;
  gender: string;
  ethnicity: string;
  
  // Physical Features
  bodyType: string;
  hairStyle: string;
  hairColor: string;
  
  // Personality & Traits
  expression: string;
  personality: string;
  confidenceLevel: string;
  
  // Style & Aesthetic
  fashionStyle: string;
  overallVibe: string;
  
  // Scene & Setting
  background: string;
  lightingStyle: string;
  photoType: string;
}

// Demographics
export const ageRanges = ['18-25', '26-35', '36-45', '46-55', '55+'];
export const genderOptions = ['Male', 'Female', 'Non-binary'];
export const ethnicityOptions = ['Asian', 'Black', 'Hispanic/Latino', 'White', 'Middle Eastern', 'Mixed', 'Other'];

// Physical Features
export const bodyTypeOptions = ['Athletic', 'Slim', 'Curvy', 'Muscular', 'Average', 'Plus Size'];
export const hairStyleOptions = ['Long', 'Short', 'Medium', 'Curly', 'Straight', 'Wavy', 'Braided', 'Pixie Cut'];
export const hairColorOptions = ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Colorful'];

// Personality & Traits
export const expressionOptions = ['Confident', 'Friendly', 'Serious', 'Playful', 'Mysterious', 'Elegant'];
export const personalityOptions = ['Charismatic', 'Approachable', 'Bold', 'Sophisticated', 'Creative', 'Authentic'];
export const confidenceLevelOptions = ['Very Confident', 'Confident', 'Moderate', 'Subtle', 'Reserved'];

// Style & Aesthetic
export const fashionStyleOptions = ['Professional', 'Casual', 'Glamorous', 'Edgy', 'Minimalist', 'Bohemian', 'Trendy', 'Classic'];
export const overallVibeOptions = ['Modern', 'Timeless', 'Artistic', 'Corporate', 'Lifestyle', 'Fashion'];

// Scene & Setting
export const backgroundOptions = ['Studio', 'Urban', 'Nature', 'Home', 'Office', 'Café', 'Beach', 'City Street'];
export const lightingStyleOptions = ['Natural Light', 'Studio Lighting', 'Golden Hour', 'Soft Light', 'Dramatic', 'Bright'];
export const photoTypeOptions = ['Headshot', 'Portrait', 'Full Body', 'Lifestyle', 'Professional', 'Candid'];

export const surprisePrompts = [
  'A confident lifestyle influencer in their 20s with warm smile',
  'Tech-savvy influencer with modern style and approachable personality',
  'Fashion-forward influencer with creative expression and bold style',
  'Fitness enthusiast influencer with energetic and motivating presence',
  'Travel blogger influencer with adventurous spirit and friendly demeanor',
  'Business mentor influencer with professional appearance and wisdom'
];

export const enhancementWords = [
  'photorealistic', 'professional lighting', 'high quality', 'detailed',
  'cinematic', 'portrait style', 'modern aesthetic', 'clean background',
  'studio lighting', 'sharp focus', 'vibrant colors'
]; 