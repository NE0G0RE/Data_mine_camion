import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
}

interface Permission {
  roleId: string;
  roleNom: string;
  niveau: number;
  type: string;
  filialeId?: string;
  filialeNom?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  permissions: Permission[];
  isAdmin: boolean;
  accessibleFiliales: string[];
  login: (user: User, token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessibleFiliales, setAccessibleFiliales] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier le token au chargement
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(tokenToVerify);
        setPermissions(data.permissions.roles || []);
        setIsAdmin(data.permissions.isAdmin || false);
        setAccessibleFiliales(data.permissions.accessibleFiliales || []);
      } else {
        // Token invalide, nettoyer le localStorage
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("token", userToken);
    
    // Les permissions seront mises à jour par l'appel API de login
    // qui retourne déjà les permissions
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setPermissions([]);
    setIsAdmin(false);
    setAccessibleFiliales([]);
    localStorage.removeItem("token");
  };

  const value: AuthContextType = {
    user,
    token,
    permissions,
    isAdmin,
    accessibleFiliales,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 