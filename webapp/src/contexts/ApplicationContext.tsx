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
    _id: string;
    status: string;
    date: string;
  }[];
}

export interface ApplicationState {
  applications: JobApplication[];
  order: string;
  page: number;
  searchQuery: string;
  sort: string;
}

export type ApplicationAction =
  | { type: 'SET_APPLICATIONS'; payload: JobApplication[] }
  | { type: 'SET_SORT'; payload: { sort: string; order: string } }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_SEARCH_QUERY'; payload: string };

export interface ApplicationContextType extends ApplicationState {
  dispatch: Dispatch<ApplicationAction>;
}

export const ApplicationContext = createContext<ApplicationContextType>({
  applications: [],
  order: 'desc',
  page: 1,
  searchQuery: '',
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
        searchQuery: state.searchQuery,
        sort: state.sort
      };

    case 'SET_SORT':
      return {
        applications: state.applications,
        order: action.payload.order,
        page: state.page,
        searchQuery: state.searchQuery,
        sort: action.payload.sort
      };

    case 'SET_PAGE':
      return {
        applications: state.applications,
        order: state.order,
        page: action.payload,
        searchQuery: state.searchQuery,
        sort: state.sort
      };

    case 'SET_SEARCH_QUERY':
      return {
        applications: state.applications,
        order: state.order,
        page: state.page,
        searchQuery: action.payload,
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
    searchQuery: '',
    sort: 'updated'
  });

  return <ApplicationContext.Provider value={{ ...state, dispatch }}>{children}</ApplicationContext.Provider>;
};
