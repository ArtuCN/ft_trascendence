import React, { useState, useEffect } from "react";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [responseStatus, setResponseStatus] = useState(null);

  const getAllUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/users");

      // Stampi a console la response intera
      console.log("RESPONSE:", response);

      // Salvi lo status (es: 200 OK, 404 Not Found, ecc)
      setResponseStatus(response.status);

      const data = await response.json();

      // Stampi anche i dati
      console.log("DATA:", data);

      setUsers(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    
    <div>
        <button onClick={getAllUsers}>Users</button>
      <h2>List</h2>

      {responseStatus && <p>Status: {responseStatus}</p>}

      {users.length > 0 ? (
        <ul>
            {users.map((user, index) => (
                <li key={index}>
                {user.username} - {user.mail}
                </li>
            ))}
        </ul>
      ) : (
        <p>No user found.</p>
      )}
    </div>
  );
};

export default UserList;
