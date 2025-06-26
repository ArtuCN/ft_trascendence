/*import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import LandingPage from '../app/landing/LandingPage';
import Login from '../app/auth/Login';
import Register from '../app/auth/Register';
import Dashboard from '../app/dashboard/Dashboard';
import Profile from '../app/profile/Profile';
import Game from '../app/game/Game';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/game",
        element: <Game />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default router;*/
