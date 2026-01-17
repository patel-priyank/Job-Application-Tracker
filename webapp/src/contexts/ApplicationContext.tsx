import { createContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';

export interface JobApplication {
  _id: string;
  companyName: string;
  jobTitle: string;
  emailUsed: string;
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
  order: string;
  page: number;
  sort: string;
}

export type ApplicationAction =
  | { type: 'SET_APPLICATIONS'; payload: JobApplication[] }
  | { type: 'CREATE_APPLICATION'; payload: JobApplication }
  | { type: 'UPDATE_APPLICATION'; payload: JobApplication }
  | { type: 'DELETE_APPLICATION'; payload: JobApplication }
  | { type: 'SET_SORT'; payload: { sort: string; order: string } }
  | { type: 'SET_PAGE'; payload: number };

export interface ApplicationContextType extends ApplicationState {
  dispatch: Dispatch<ApplicationAction>;
}

export const ApplicationContext = createContext<ApplicationContextType>({
  applications: [],
  order: 'desc',
  page: 1,
  sort: 'updated',
  dispatch: () => {}
});

export const applicationsReducer = (state: ApplicationState, action: ApplicationAction) => {
  switch (action.type) {
    case 'SET_APPLICATIONS':
      return {
        applications: action.payload,
        order: state.order,
        page: state.page,
        sort: state.sort
      };

    case 'CREATE_APPLICATION':
      return {
        applications: [...state.applications, action.payload],
        order: state.order,
        page: state.page,
        sort: state.sort
      };

    case 'UPDATE_APPLICATION':
      return {
        applications: state.applications.map(application =>
          application._id === action.payload._id ? action.payload : application
        ),
        order: state.order,
        page: state.page,
        sort: state.sort
      };

    case 'DELETE_APPLICATION':
      return {
        applications: state.applications.filter(application => application._id !== action.payload._id),
        order: state.order,
        page: state.page,
        sort: state.sort
      };

    case 'SET_SORT':
      return {
        applications: state.applications,
        order: action.payload.order,
        page: state.page,
        sort: action.payload.sort
      };

    case 'SET_PAGE':
      return {
        applications: state.applications,
        order: state.order,
        page: action.payload,
        sort: state.sort
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
    applications: [],
    order: 'desc',
    page: 1,
    sort: 'updated'
  });

  return <ApplicationContext.Provider value={{ ...state, dispatch }}>{children}</ApplicationContext.Provider>;
};
