import {
  SafetyVerdict,
  FoodAnalysisResult,
  UserProfile,
  WeeklyPlan,
  RiskItem,
  UnknownItem,
} from './types';
import { CURRENT_USER_PROFILE, MOCK_FOOD_RESULTS, MOCK_WEEKLY_PLAN } from './mock-data';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
export const HEALTH_CHECK_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/api\/v1\/?$/, '/health');

export interface ApiProfileUser {
  id: string;
  name: string;
}

export interface ApiProfileResponse {
  user: ApiProfileUser;
  conditions: string[];
  allergies: string[];
  diet: string[];
  preferences: string[];
  instructions: string[];
}

export interface ApiProfileUpdateRequest {
  conditions?: string[];
  allergies?: string[];
  diet?: string[];
  preferences?: string[];
  instructions?: string[];
}

export interface ApiIngredient {
  name: string;
  normalized_name?: string;
  category?: string;
  is_explicit: boolean;
  confidence: number;
}

export interface ApiRiskItem {
  type: string;
  status: 'confirmed' | 'potential' | 'unknown' | string;
  severity: 'high' | 'moderate' | 'low' | string;
  explanation: string;
}

export interface ApiUnknownItem {
  question: string;
  importance: string;
}

export interface ApiAnalysisResponse {
  analysis_id: string;
  food: {
    name: string;
    ingredients: ApiIngredient[];
  };
  overall_status: 'high_attention' | 'potential_concern' | 'no_detected_concern' | 'insufficient_information' | string;
  risks: ApiRiskItem[];
  unknowns: ApiUnknownItem[];
  recommendations: string[];
  evidence: any[];
}

export interface ApiQuestionItem {
  id: string;
  question: string;
  reason: string;
  importance: string;
}

export interface ApiQuestionsResponse {
  questions: ApiQuestionItem[];
}

export interface ApiAnswerItem {
  question_id: string;
  answer: string;
}

export interface ApiAnswersRequest {
  answers: ApiAnswerItem[];
}

export interface ApiModifyChangeItem {
  type: 'portion' | 'ingredient' | 'drink' | 'prep' | string;
  ingredient?: string;
  action?: 'reduce' | 'remove' | 'substitute' | 'add' | string;
  value?: string;
}

export interface ApiModifyRequest {
  changes: ApiModifyChangeItem[];
}

export interface ApiModifyImpactChange {
  factor: string;
  impact: string;
}

export interface ApiModifyResponse {
  before: { status: string };
  after: { status: string };
  changes: ApiModifyImpactChange[];
}

export interface ApiRestaurantSchema {
  id: string;
  name: string;
  vegetarian_only: boolean;
  confidence: number;
}

export interface ApiMenuItemSchema {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  known_ingredients: string[];
  unknown_ingredients: string[];
  nutrition: Record<string, any>;
}

export interface ApiRestaurantMenuResponse {
  restaurant: ApiRestaurantSchema;
  items: ApiMenuItemSchema[];
}

export interface ApiMenuMatchItem {
  menu_item_id: string;
  name: string;
  status: string;
  reason: string;
}

export interface ApiMenuAnalysisResponse {
  best_matches: ApiMenuMatchItem[];
  review: ApiMenuMatchItem[];
  high_attention: ApiMenuMatchItem[];
  unknown: ApiMenuMatchItem[];
}

export interface ApiMealPlanRequest {
  days?: number;
  meals_per_day?: number;
  preferences?: string[];
}

export interface ApiMealPlanItem {
  meal_type: string;
  name: string;
  recipe: string;
  nutrition: Record<string, any>;
}

export interface ApiDayPlan {
  day: number;
  meals: ApiMealPlanItem[];
}

export interface ApiMealPlanResponse {
  plan_id: string;
  days: ApiDayPlan[];
}

/**
 * Maps Backend overall_status or risk status string to Frontend SafetyVerdict
 */
export function mapApiStatusToVerdict(statusStr: string): SafetyVerdict {
  const normalized = (statusStr || '').toLowerCase();
  if (normalized === 'high_attention' || normalized === 'risk' || normalized === 'high') {
    return 'risk';
  }
  if (normalized === 'potential_concern' || normalized === 'caution' || normalized === 'moderate') {
    return 'caution';
  }
  if (normalized === 'no_detected_concern' || normalized === 'safe' || normalized === 'lower_concern' || normalized === 'low') {
    return 'safe';
  }
  return 'unknown';
}

/**
 * Maps ApiAnalysisResponse to FoodAnalysisResult for UI components
 */
export function mapApiAnalysisToFoodResult(apiRes: ApiAnalysisResponse): FoodAnalysisResult {
  const verdict = mapApiStatusToVerdict(apiRes.overall_status);
  
  const titleMap: Record<SafetyVerdict, string> = {
    risk: 'High Clinical Risk / Attention Required',
    caution: 'Potential Concern / Clinical Advisory',
    safe: 'Safe / No Detected Concern',
    unknown: 'Insufficient Information / Verification Needed',
  };

  const confirmedRisks: RiskItem[] = apiRes.risks
    .filter((r) => r.status === 'confirmed' || r.severity === 'high')
    .map((r, i) => ({
      id: `conf-risk-${i}-${Date.now()}`,
      title: `${r.type.toUpperCase()} Risk Trigger`,
      description: r.explanation,
      severity: (r.severity === 'high' ? 'high' : 'medium') as 'high' | 'medium' | 'low',
      triggeredBy: r.type,
      affectedConditionOrAllergy: r.explanation,
    }));

  const potentialRisks: RiskItem[] = apiRes.risks
    .filter((r) => r.status === 'potential' || (r.severity !== 'high' && r.status !== 'confirmed'))
    .map((r, i) => ({
      id: `pot-risk-${i}-${Date.now()}`,
      title: `${r.type.toUpperCase()} Potential Concern`,
      description: r.explanation,
      severity: (r.severity === 'low' ? 'low' : 'medium') as 'high' | 'medium' | 'low',
      triggeredBy: r.type,
      affectedConditionOrAllergy: r.explanation,
    }));

  const unknowns: UnknownItem[] = (apiRes.unknowns || []).map((u, i) => ({
    id: `unk-${i}-${Date.now()}`,
    title: u.question,
    description: u.question,
    reason: `Importance: ${u.importance || 'medium'}`,
  }));

  const ingredientNames = (apiRes.food.ingredients || []).map((ing) => ing.name).join(', ');

  return {
    id: apiRes.analysis_id,
    foodName: apiRes.food.name,
    category: apiRes.food.ingredients[0]?.category || 'General Food',
    verdict,
    verdictTitle: titleMap[verdict],
    verdictSummary:
      apiRes.recommendations.join(' ') ||
      `Analysis complete for ${apiRes.food.name}. Ingredients identified: ${ingredientNames || 'None specified'}.`,
    confirmedRisks,
    potentialRisks,
    unknowns,
    nutritionalHighlights: [
      { label: 'Overall Status', value: apiRes.overall_status },
      { label: 'Ingredients Extracted', value: `${apiRes.food.ingredients?.length || 0} items` },
      { label: 'Risks Flagged', value: `${apiRes.risks?.length || 0} items` },
      { label: 'Unknowns', value: `${apiRes.unknowns?.length || 0} questions` },
    ],
  };
}

/**
 * API Service helper functions with graceful fallbacks
 */

export async function checkBackendHealth(): Promise<{ status: string; database?: string } | null> {
  try {
    const res = await fetch(HEALTH_CHECK_URL, { cache: 'no-store' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend health check failed:', err);
  }
  return null;
}

export async function getProfileApi(): Promise<UserProfile> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, { cache: 'no-store' });
    if (res.ok) {
      const data: ApiProfileResponse = await res.json();
      return {
        id: data.user.id || CURRENT_USER_PROFILE.id,
        name: data.user.name || CURRENT_USER_PROFILE.name,
        conditions: data.conditions.length > 0 ? data.conditions : CURRENT_USER_PROFILE.conditions,
        allergies: data.allergies.length > 0 ? data.allergies : CURRENT_USER_PROFILE.allergies,
        dietType: data.diet.length > 0 ? data.diet.join(', ') : CURRENT_USER_PROFILE.dietType,
        goals: data.preferences.length > 0 ? data.preferences : CURRENT_USER_PROFILE.goals,
        doctorNoteUploaded: CURRENT_USER_PROFILE.doctorNoteUploaded,
        doctorNoteFileName: CURRENT_USER_PROFILE.doctorNoteFileName,
      };
    }
  } catch (err) {
    console.warn('GET /api/v1/profile API request failed, using local profile fallback:', err);
  }
  return CURRENT_USER_PROFILE;
}

export async function updateProfileApi(payload: ApiProfileUpdateRequest): Promise<UserProfile> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data: ApiProfileResponse = await res.json();
      return {
        id: data.user.id || CURRENT_USER_PROFILE.id,
        name: data.user.name || CURRENT_USER_PROFILE.name,
        conditions: data.conditions,
        allergies: data.allergies,
        dietType: data.diet.join(', '),
        goals: data.preferences,
        doctorNoteUploaded: CURRENT_USER_PROFILE.doctorNoteUploaded,
        doctorNoteFileName: CURRENT_USER_PROFILE.doctorNoteFileName,
      };
    }
  } catch (err) {
    console.warn('PUT /api/v1/profile API failed, using fallback update:', err);
  }
  return {
    ...CURRENT_USER_PROFILE,
    conditions: payload.conditions || CURRENT_USER_PROFILE.conditions,
    allergies: payload.allergies || CURRENT_USER_PROFILE.allergies,
    dietType: payload.diet?.join(', ') || CURRENT_USER_PROFILE.dietType,
    goals: payload.preferences || CURRENT_USER_PROFILE.goals,
  };
}

export async function analyzeFoodApi(options: {
  input_type?: 'text' | 'image';
  text?: string;
  imageFile?: File;
  context?: any;
}): Promise<ApiAnalysisResponse | null> {
  try {
    const inputType = options.input_type || (options.imageFile ? 'image' : 'text');
    let response: Response;

    if (options.imageFile) {
      const formData = new FormData();
      formData.append('input_type', inputType);
      if (options.text) formData.append('text', options.text);
      formData.append('image', options.imageFile);
      if (options.context) {
        formData.append(
          'context',
          typeof options.context === 'string' ? options.context : JSON.stringify(options.context)
        );
      }

      response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });
    } else {
      response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_type: inputType,
          text: options.text || 'Analyze dish for dietary safety',
          context: options.context,
        }),
      });
    }

    if (response.ok) {
      const data: ApiAnalysisResponse = await response.json();
      return data;
    }
  } catch (err) {
    console.warn('POST /api/v1/analyze API request failed:', err);
  }
  return null;
}

export async function getAnalysisQuestionsApi(analysisId: string): Promise<ApiQuestionItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/questions`);
    if (res.ok) {
      const data: ApiQuestionsResponse = await res.json();
      return data.questions || [];
    }
  } catch (err) {
    console.warn(`GET /api/v1/analysis/${analysisId}/questions failed:`, err);
  }
  return [];
}

export async function answerAnalysisQuestionsApi(
  analysisId: string,
  answers: ApiAnswerItem[]
): Promise<ApiAnalysisResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`POST /api/v1/analysis/${analysisId}/answers failed:`, err);
  }
  return null;
}

export async function modifyAnalysisApi(
  analysisId: string,
  changes: ApiModifyChangeItem[]
): Promise<ApiModifyResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/analysis/${analysisId}/modify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`POST /api/v1/analysis/${analysisId}/modify failed:`, err);
  }
  return null;
}

export async function searchRestaurantsApi(query: string = ''): Promise<ApiRestaurantSchema[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/restaurants/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('GET /api/v1/restaurants/search failed:', err);
  }
  return [];
}

export async function getRestaurantMenuApi(restaurantId: string): Promise<ApiRestaurantMenuResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`GET /api/v1/restaurants/${restaurantId}/menu failed:`, err);
  }
  return null;
}

export async function analyzeRestaurantMenuApi(restaurantId: string): Promise<ApiMenuAnalysisResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/analyze-menu`, {
      method: 'POST',
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`POST /api/v1/restaurants/${restaurantId}/analyze-menu failed:`, err);
  }
  return null;
}

export async function generateMealPlanApi(options?: {
  days?: number;
  meals_per_day?: number;
  preferences?: string[];
}): Promise<WeeklyPlan | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/meal-plans/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        days: options?.days || 7,
        meals_per_day: options?.meals_per_day || 3,
        preferences: options?.preferences || ['vegetarian'],
      }),
    });

    if (res.ok) {
      const data: ApiMealPlanResponse = await res.json();
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      return {
        days: data.days.map((d, dIdx) => ({
          day: (dayNames[dIdx % 7] || `Day ${d.day}`) as any,
          dateLabel: `Day ${d.day}`,
          meals: d.meals.map((m, mIdx) => ({
            id: `plan-m-${d.day}-${mIdx}-${Date.now()}`,
            mealType: (m.meal_type.charAt(0).toUpperCase() + m.meal_type.slice(1)) as any,
            recipeTitle: m.name,
            prepTime: '20 mins',
            verdict: 'safe' as SafetyVerdict,
            highlights: ['100% Profile Safe', `Calories: ${m.nutrition?.calories || 350}`],
            recipe: {
              id: `rec-${d.day}-${mIdx}`,
              title: m.name,
              servings: 2,
              prepTime: '20 mins',
              ingredients: typeof m.recipe === 'string' ? m.recipe.split(', ') : [m.recipe],
              instructions: [
                'Prepare fresh ingredients according to profile safety guidelines.',
                'Cook thoroughly and serve warm.',
              ],
              compatibilityNotes: 'Generated by Swaahara AI Meal Plan Engine. Filtered against medical risks.',
            },
          })),
        })),
      };
    }
  } catch (err) {
    console.warn('POST /api/v1/meal-plans/generate failed:', err);
  }
  return null;
}

export async function analyzeTrackerApi(payload: {
  breakfast: string[];
  lunch: string[];
  snacks: string[];
  dinner: string[];
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/tracker/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('POST /api/v1/tracker/analyze API request failed:', err);
  }
  return null;
}
