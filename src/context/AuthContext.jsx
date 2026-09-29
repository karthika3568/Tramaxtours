/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';
import { getAccessToken, setAccessToken, removeAccessToken } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize isLoading based on whether a stored token exists
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(getAccessToken()));

  // Restore authenticated session asynchronously on mount
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      return;
    }

    let isMounted = true;

    authService
      .getCurrentUser()
      .then((data) => {
        if (!isMounted) return;
        if (data && data.user && data.user.status === 'active') {
          setUser(data.user);
        } else {
          removeAccessToken();
          setUser(null);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        removeAccessToken();
        setUser(null);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    if (data && data.token) {
      setAccessToken(data.token);
      setUser(data.user);
    }
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      removeAccessToken();
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.getCurrentUser();
      if (data && data.user) {
        setUser(data.user);
        return data.user;
      }
    } catch {
      removeAccessToken();
      setUser(null);
    }
    return null;
  }, []);

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;

      const roles = user.roles || (user.role ? [user.role] : []);
      if (roles.includes('super_admin') || user.role === 'super_admin') {
        return true;
      }

      const permissions = user.permissions || [];
      if (Array.isArray(permission)) {
        return permission.every((p) => permissions.includes(p));
      }
      return permissions.includes(permission);
    },
    [user]
  );

  const hasRole = useCallback(
    (role) => {
      if (!user) return false;

      const roles = user.roles || (user.role ? [user.role] : []);
      if (Array.isArray(role)) {
        return role.some((r) => roles.includes(r) || user.role === r);
      }
      return user.role === role || roles.includes(role);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      role: user?.role || null,
      roles: user?.roles || [],
      permissions: user?.permissions || [],
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshUser,
      hasPermission,
      hasRole,
    }),
    [user, isLoading, login, logout, refreshUser, hasPermission, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthContext };
export default AuthContext;
