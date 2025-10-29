import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoader } from '../loading/loaderContext';

export const RouterLoader: React.FC = () => {
  const { show, hide } = useLoader();
  const location = useLocation();

  useEffect(() => {
    show('Loading page...');
    const timer = setTimeout(() => hide(), 200); // Debounce
    return () => {
      clearTimeout(timer);
      hide();
    };
  }, [location.pathname, show, hide]);

  return null;
};