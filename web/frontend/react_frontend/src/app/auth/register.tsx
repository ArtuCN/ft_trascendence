import { useState } from "react";
import AuthModal from "../../components/ui/AuthModal";

const Register = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div>
      <button 
        onClick={() => setShowModal(true)}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Registrati
      </button>
      
      <AuthModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </div>
  );
};

export default Register;
