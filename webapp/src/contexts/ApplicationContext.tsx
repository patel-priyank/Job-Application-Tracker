import { createContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';

export interface JobApplication {
  _id: string;
  companyName: string;
  jobTitle: string;
  link: string;
  status: string;
  date: string;
  history: {
    status: string;
    date: string;
  }[];
}

export interface ApplicationState {
  applications: JobApplication[];
}

export type ApplicationAction =
  | { type: 'SET_APPLICATIONS'; payload: JobApplication[] }
  | { type: 'CREATE_APPLICATION'; payload: JobApplication }
  | { type: 'UPDATE_APPLICATION'; payload: JobApplication }
  | { type: 'DELETE_APPLICATION'; payload: JobApplication };

export interface ApplicationContextType extends ApplicationState {
  dispatch: Dispatch<ApplicationAction>;
}

export const ApplicationContext = createContext<ApplicationContextType>({
  applications: [],
  dispatch: () => {}
});

export const applicationsReducer = (state: ApplicationState, action: ApplicationAction) => {
  switch (action.type) {
    case 'SET_APPLICATIONS':
      return {
        applications: action.payload
      };

    case 'CREATE_APPLICATION':
      return {
        applications: [...state.applications, action.payload]
      };

    case 'UPDATE_APPLICATION':
      return {
        applications: state.applications.map(application =>
          application._id === action.payload._id ? action.payload : application
        )
      };

    case 'DELETE_APPLICATION':
      return {
        applications: state.applications.filter(application => application._id !== action.payload._id)
      };

    default:
      return state;
  }
};

interface ApplicationContextProviderProps {
  children: ReactNode;
}

export const ApplicationContextProvider = ({ children }: ApplicationContextProviderProps) => {
  const [state, dispatch] = useReducer(applicationsReducer, {
    applications: []
  });

  return <ApplicationContext.Provider value={{ ...state, dispatch }}>{children}</ApplicationContext.Provider>;
};
