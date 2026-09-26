export type SafetyVerdict = 'safe' | 'caution' | 'risk' | 'unknown';

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  conditions: string[];
  allergies: string[];
  dietType: string;
  goals: string[];
  doctorNoteUploaded: boolean;
  doctorNoteFileName?: string;
}

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  triggeredBy: string;
  affectedConditionOrAllergy: string;
}

export interface UnknownItem {
  id: string;
  title: string;
  description: string;
  reason: string;
}

export interface RecipeDetails {
  id: string;
  title: string;
  servings: number;
  prepTime: string;
  ingredients: string[];
  instructions: string[];
  compatibilityNotes: string;
}

export interface MealPlanCard {
  id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  recipeTitle: string;
  prepTime: string;
  verdict: SafetyVerdict;
  highlights: string[];
  recipe: RecipeDetails;
}

export interface DayPlan {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  dateLabel: string;
  meals: MealPlanCard[];
}

export interface WeeklyPlan {
  days: DayPlan[];
}


export interface DishVariant {
  name: string;
  verdict: SafetyVerdict;
  explanation: string;
  ingredients: string[];
  nutritionSummary?: string;
  changesMade?: string[];
}

export interface DishReformulation {
  id: string;
  foodName: string;
  originalDish: DishVariant;
  modifiedDish: DishVariant;
}

export interface FoodAnalysisResult {
  id: string;
  foodName: string;
  category: string;
  imageUrl?: string;
  verdict: SafetyVerdict;
  verdictTitle: string;
  verdictSummary: string;
  confirmedRisks: RiskItem[];
  potentialRisks: RiskItem[];
  unknowns: UnknownItem[];
  nutritionalHighlights: { label: string; value: string }[];
  reformulation?: DishReformulation;
}

export interface MenuDishItem {
  id: string;
  dishName: string;
  description: string;
  price: string;
  verdict: SafetyVerdict;
  oneLineReason: string;
  matchedConditions: string[];
  category?: string;
}

export interface MenuAnalysis {
  id: string;
  restaurantName: string;
  cuisine: string;
  dishes: MenuDishItem[];
}

export interface ProfileVerdictComparison {
  userProfile: UserProfile;
  verdict: SafetyVerdict;
  verdictSummary: string;
  keyReason: string;
  tags: string[];
}

export interface FoodProfileComparison {
  foodId: string;
  foodName: string;
  category: string;
  imageUrl?: string;
  description: string;
  profiles: ProfileVerdictComparison[];
}

export interface ClarificationOption {
  id: string;
  label: string;
  details: string;
  targetResultId: string;
}

export interface ClarificationQuestion {
  id: string;
  foodName: string;
  question: string;
  subtext: string;
  options: ClarificationOption[];
}
