import { createBrowserRouter } from 'react-router-dom';
import MassiveDataExport from '../view/MassiveDataExport';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MassiveDataExport />,
  },
  {
    path: '/massive-data-export',
    element: <MassiveDataExport />,
  }
]);

export default router; 