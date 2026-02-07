import { createContext, useReducer } from 'react';
import type { ReactNode, Dispatch } from 'react';

export interface JobApplication {
  _id: string;
  companyName: string;
  jobTitle: string;
  emailUsed: string;
  trackingLink: string;
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
  statusFilter: string[];
  emailUsedFilter: string[];
  sort: string;
  order: string;
  pageSize: number;
  page: number;
  searchQuery: string;
  totalPages: number;
}

export type ApplicationAction =
  | { type: 'SET_APPLICATIONS'; payload: { applications: JobApplication[]; totalPages: number } }
  | { type: 'SET_FILTERS'; payload: { statusFilter: string[]; emailUsedFilter: string[] } }
  | { type: 'SET_SORT'; payload: { sort: string; order: string; pageSize: number } }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_SEARCH_QUERY'; payload: string };

export interface ApplicationContextType extends ApplicationState {
  dispatch: Dispatch<ApplicationAction>;
}

export const ApplicationContext = createContext<ApplicationContextType>({
  applications: [],
  statusFilter: [],
  emailUsedFilter: [],
  sort: 'updated',
  order: 'desc',
  pageSize: 24,
  page: 1,
  searchQuery: '',
  totalPages: 0,
  dispatch: () => {}
});

export const applicationsReducer = (state: ApplicationState, action: ApplicationAction) => {
  switch (action.type) {
    case 'SET_APPLICATIONS':
      return {
        applications: action.payload.applications,
        statusFilter: state.statusFilter,
        emailUsedFilter: state.emailUsedFilter,
        sort: state.sort,
        order: state.order,
        pageSize: state.pageSize,
        page: state.page,
        searchQuery: state.searchQuery,
        totalPages: action.payload.totalPages
      };

    case 'SET_FILTERS':
      return {
        applications: state.applications,
        statusFilter: action.payload.statusFilter,
        emailUsedFilter: action.payload.emailUsedFilter,
        sort: state.sort,
        order: state.order,
        pageSize: state.pageSize,
        page: 1,
        searchQuery: state.searchQuery,
        totalPages: state.totalPages
      };

    case 'SET_SORT':
      return {
        applications: state.applications,
        statusFilter: state.statusFilter,
        emailUsedFilter: state.emailUsedFilter,
        sort: action.payload.sort,
        order: action.payload.order,
        pageSize: action.payload.pageSize,
        page: 1,
        searchQuery: state.searchQuery,
        totalPages: state.totalPages
      };

    case 'SET_PAGE':
      return {
        applications: state.applications,
        statusFilter: state.statusFilter,
        emailUsedFilter: state.emailUsedFilter,
        sort: state.sort,
        order: state.order,
        pageSize: state.pageSize,
        page: action.payload,
        searchQuery: state.searchQuery,
        totalPages: state.totalPages
      };

    case 'SET_SEARCH_QUERY':
      return {
        applications: state.applications,
        statusFilter: state.statusFilter,
        emailUsedFilter: state.emailUsedFilter,
        sort: state.sort,
        order: state.order,
        pageSize: state.pageSize,
        page: state.page,
        searchQuery: action.payload,
        totalPages: state.totalPages
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
    statusFilter: [],
    emailUsedFilter: [],
    sort: 'updated',
    order: 'desc',
    pageSize: 24,
    page: 1,
    searchQuery: '',
    totalPages: 0
  });

  return <ApplicationContext.Provider value={{ ...state, dispatch }}>{children}</ApplicationContext.Provider>;
};
