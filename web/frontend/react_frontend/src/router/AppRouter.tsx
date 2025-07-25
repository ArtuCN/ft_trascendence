import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/ui/navbar';
import AuthGuard from '../components/auth/AuthGuard';
import Home from '../app/home/Home';
import Login from '../app/auth/login';
import Register from '../app/auth/register';
import Profile from '../app/profile/profile';

const AppRouter = () => {
  return (
    <AuthGuard>
      <Navbar />
      <div className="ml-64 p-8 min-h-screen">
        <Routes>
          <Route 
            path="/" 
            element={<Home />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile isOpen={true} onClose={() => {}} />} />
        </Routes>
      </div>
    </AuthGuard>
  );
};

export default AppRouter;
