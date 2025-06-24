import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/login";
import Register from "./components/register";
import UserList from "./components/getalluser"; // ⬅️ Importa il nuovo componente

function App() {
  return (
    <Router>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/users">Utenti</Link> {/* ⬅️ Aggiunto link alla pagina utenti */}
      </nav>
      <Routes>
        <Route path="/" element={<h1>Benvenuto su ft_transcendence!</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/users" element={<UserList />} /> {/* ⬅️ Aggiunta route */}
      </Routes>
    </Router>
  );
}

export default App;
