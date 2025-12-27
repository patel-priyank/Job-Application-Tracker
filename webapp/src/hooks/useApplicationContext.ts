import { useContext } from 'react';

import { ApplicationContext } from '../contexts/ApplicationContext';

export const useApplicationContext = () => {
  const context = useContext(ApplicationContext);

  if (!context) {
    throw Error('useApplicationContext must be used inside an ApplicationContextProvider.');
  }

  return context;
};
