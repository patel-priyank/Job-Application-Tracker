import { createContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';

export interface User {
  name: string;
  email: string;
  emailsUsed: string[];
  createdAt: string;
  passwordUpdatedAt: string;
  token: string;
}

export interface AuthState {
  user: User | null;
  ready: boolean;
}

export type AuthAction = { type: 'SET_USER'; payload: User | null };

export interface AuthContextType extends AuthState {
  dispatch: Dispatch<AuthAction>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  ready: false,
  dispatch: () => {}
});

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        user: action.payload,
        ready: true
      };

    default:
      return state;
  }
};

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    ready: false
  });

  return <AuthContext.Provider value={{ ...state, dispatch }}>{children}</AuthContext.Provider>;
};
