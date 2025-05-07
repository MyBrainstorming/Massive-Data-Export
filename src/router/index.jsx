import { createBrowserRouter } from 'react-router-dom';
import MassiveDataExport from '../view/MassiveDataExport';
import SingleBatchExport from '../view/SingleBatchExport';
import StreamExport from '../view/StreamExport';
const router = createBrowserRouter([
  {
    path: '/',
    element: <MassiveDataExport />,
  },
  {
    path: '/massive-data-export',
    element: <MassiveDataExport />,
  },
  {
    path:"/single-batch-export",
    element:<SingleBatchExport/>
  },
  {
    path:"/stream-export",
    element:<StreamExport/>
  }
]);

export default router; 