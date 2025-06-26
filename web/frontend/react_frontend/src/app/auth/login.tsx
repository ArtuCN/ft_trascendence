import { useState } from "react";
import AuthModal from "../../components/ui/AuthModal";

const Login = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button 
        onClick={() => setShowModal(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Accedi
      </button>
      
      <AuthModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
};

export default Login;
