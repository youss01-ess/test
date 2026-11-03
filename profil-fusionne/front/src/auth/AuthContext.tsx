import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as api from '../api';
import type { RegisterInput, UpdateProfileInput, User } from '../api';

const TOKEN_KEY = 'handyvet_token';
const USER_KEY = 'handyvet_user';

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // stockage indisponible : la session ne survivra pas au rechargement
  }
}

function readCachedUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveCachedUser(user: User | null): void {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  } catch {
    // stockage indisponible
  }
}

async function withToken<T>(
  action: (token: string) => Promise<T>,
  onExpired: () => void,
): Promise<T> {
  const token = readToken();
  if (!token) {
    onExpired();
    throw new Error('Session expirée, veuillez vous reconnecter');
  }

  try {
    return await action(token);
  } catch (error) {
    if (error instanceof api.ApiError && error.status === 401) {
      onExpired();
    }
    throw error;
  }
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
  updateProfile: (input: UpdateProfileInput) => Promise<void>;
  updateEmail: (email: string, currentPassword: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    return readToken() ? readCachedUser() : null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    return readToken() !== null && readCachedUser() === null;
  });

  useEffect(() => {
    const token = readToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .getMe(token)
      .then((freshUser) => {
        setUser(freshUser);
        saveCachedUser(freshUser);
      })
      .catch(() => {
        saveToken(null);
        saveCachedUser(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user } = await api.login(email, password);
    saveToken(accessToken);
    saveCachedUser(user);
    setUser(user);
  }, []);

  const register = useCallback(
    async (input: RegisterInput) => {
      await api.register(input);
      await login(input.email, input.password);
    },
    [login],
  );

  const logout = useCallback(() => {
    saveToken(null);
    saveCachedUser(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput) => {
      const updated = await withToken(
        (token) => api.updateProfile(token, input),
        logout,
      );
      saveCachedUser(updated);
      setUser(updated);
    },
    [logout],
  );

  const updateEmail = useCallback(
    async (email: string, currentPassword: string) => {
      const updated = await withToken(
        (token) => api.updateEmail(token, email, currentPassword),
        logout,
      );
      saveCachedUser(updated);
      setUser(updated);
    },
    [logout],
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await withToken(
        (token) => api.changePassword(token, currentPassword, newPassword),
        logout,
      );
    },
    [logout],
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      updateEmail,
      changePassword,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      updateEmail,
      changePassword,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}