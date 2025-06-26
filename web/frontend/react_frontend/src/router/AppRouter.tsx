import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/ui/navbar';
import Login from '../app/auth/login';
import Register from '../app/auth/register';
import Profile from '../app/profile/profile';

const AppRouter = () => {
  return (
    <>
      <Navbar />
      <div className="p-8">
        <Routes>
          <Route 
            path="/" 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </>
  );
};

export default AppRouter;
