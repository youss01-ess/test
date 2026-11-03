const API_URL =
  import.meta.env.VITE_API_URL ??
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:3000'
    : '');

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  age: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileInput {
  firstName: string;
  lastName: string;
  age: number;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: number;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch {
    throw new Error(
      `Impossible de joindre le serveur API (${API_URL}). Vérifiez que le backend NestJS est bien lancé.`,
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const raw = (data as { message?: string | string[] } | null)?.message;
    const message = Array.isArray(raw)
      ? raw.join(', ')
      : (raw ?? 'Une erreur est survenue');
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export function register(input: RegisterInput): Promise<User> {
  return request<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(
  email: string,
  password: string,
): Promise<{ accessToken: string; user: User }> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getMe(token: string): Promise<User> {
  return request<User>('/auth/me', { token });
}

export function updateProfile(
  token: string,
  input: UpdateProfileInput,
): Promise<User> {
  return request<User>('/users/me', {
    method: 'PATCH',
    token,
    body: JSON.stringify(input),
  });
}

export function updateEmail(
  token: string,
  email: string,
  currentPassword: string,
): Promise<User> {
  return request<User>('/users/me/email', {
    method: 'PATCH',
    token,
    body: JSON.stringify({ email, currentPassword }),
  });
}

export function changePassword(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  return request<void>('/users/me/password', {
    method: 'PATCH',
    token,
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export const TOKEN_KEY = 'handyvet_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export interface Animal {
  id: string;
  userId: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  weight?: number | null;
  vaccines?: string | null;
  lastVetVisit?: string | null;
  nextAppointment?: string | null;
  sex?: string | null;
  isSterilized?: boolean | null;
  identificationNumber?: string | null;
  medicalNotes?: string | null;
  hasAntiParasite?: boolean | null;
  antiParasiteProduct?: string | null;
  lastAntiParasiteDate?: string | null;
  hasDewormer?: boolean | null;
  dewormerProduct?: string | null;
  lastDewormingDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAnimalInput {
  name: string;
  type: string;
  breed: string;
  age: number;
  weight?: number;
  vaccines?: string;
  lastVetVisit?: string;
  nextAppointment?: string;
  sex?: string;
  isSterilized?: boolean;
  identificationNumber?: string;
  medicalNotes?: string;
  hasAntiParasite?: boolean;
  antiParasiteProduct?: string;
  lastAntiParasiteDate?: string;
  hasDewormer?: boolean;
  dewormerProduct?: string;
  lastDewormingDate?: string;
}

export interface UpdateAnimalInput {
  name?: string;
  type?: string;
  breed?: string;
  age?: number;
  weight?: number;
  vaccines?: string;
  lastVetVisit?: string;
  nextAppointment?: string;
  sex?: string;
  isSterilized?: boolean;
  identificationNumber?: string;
  medicalNotes?: string;
  hasAntiParasite?: boolean;
  antiParasiteProduct?: string;
  lastAntiParasiteDate?: string;
  hasDewormer?: boolean;
  dewormerProduct?: string;
  lastDewormingDate?: string;
}

export function createAnimal(
  input: CreateAnimalInput,
  token?: string,
): Promise<Animal> {
  const effectiveToken = token ?? getToken() ?? undefined;
  return request<Animal>('/animals', {
    method: 'POST',
    body: JSON.stringify(input),
    token: effectiveToken,
  });
}

export function getAnimals(token?: string): Promise<Animal[]> {
  const effectiveToken = token ?? getToken() ?? undefined;
  return request<Animal[]>('/animals', {
    method: 'GET',
    token: effectiveToken,
  });
}

export function getAnimal(id: string, token?: string): Promise<Animal> {
  const effectiveToken = token ?? getToken() ?? undefined;
  return request<Animal>(`/animals/${id}`, {
    method: 'GET',
    token: effectiveToken,
  });
}

export function updateAnimal(
  id: string,
  input: UpdateAnimalInput,
  token?: string,
): Promise<Animal> {
  const effectiveToken = token ?? getToken() ?? undefined;
  return request<Animal>(`/animals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
    token: effectiveToken,
  });
}

export function deleteAnimal(id: string, token?: string): Promise<Animal> {
  const effectiveToken = token ?? getToken() ?? undefined;
  return request<Animal>(`/animals/${id}`, {
    method: 'DELETE',
    token: effectiveToken,
  });
}

export interface AnimalNotification {
  id: string;
  animalId: string;
  animalName: string;
  animalType: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  title: string;
  message: string;
  dueDate?: string | null;
  daysDiff?: number;
}

export function getNotifications(token?: string): Promise<AnimalNotification[]> {
  const effectiveToken = token ?? getToken() ?? undefined;
  return request<AnimalNotification[]>('/animals/notifications', {
    token: effectiveToken,
  });
}

export interface AiSuggestionCategory {
  title: string;
  badge: string;
  points: string[];
}

export interface AiActionPlanItem {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timeframe: string;
}

export interface AiQuestionAnswer {
  question: string;
  directAnswer: string;
  keyPoints: string[];
}

export interface AnimalAiSuggestionsResponse {
  animalId: string;
  animalName: string;
  generatedAt: string;
  model: string;
  isMock: boolean;
  focus?: string;
  question?: string;
  questionAnswer?: AiQuestionAnswer;
  healthStatus: 'good' | 'attention' | 'critical';
  summary: string;
  categories: {
    preventiveHealth?: AiSuggestionCategory;
    parasiteControl?: AiSuggestionCategory;
    nutritionAndWeight?: AiSuggestionCategory;
    wellbeingAndActivity?: AiSuggestionCategory;
  };
  actionPlan: AiActionPlanItem[];
  veterinaryDisclaimer: string;
  dailyUsage?: {
    used: number;
    max: number;
    remaining: number;
  };
}

export interface GetAnimalAiSuggestionsOptions {
  focus?: string;
  question?: string;
}

export function getAnimalAiSuggestions(
  animalId: string,
  options: GetAnimalAiSuggestionsOptions = {},
  token?: string,
): Promise<AnimalAiSuggestionsResponse> {
  const effectiveToken = token ?? getToken() ?? undefined;
  return request<AnimalAiSuggestionsResponse>(`/animals/${animalId}/suggestions`, {
    method: 'POST',
    body: JSON.stringify(options),
    token: effectiveToken,
  });
}

export interface AiDailyUsage {
  used: number;
  max: number;
  remaining: number;
}

export function getAiDailyUsage(token?: string): Promise<AiDailyUsage> {
  const effectiveToken = token ?? getToken() ?? undefined;
  return request<AiDailyUsage>('/animals/ai-usage', {
    method: 'GET',
    token: effectiveToken,
  });
}

