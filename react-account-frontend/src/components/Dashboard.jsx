import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      } catch (error) {
        console.error(error);
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  return (
    <div className="container">
      <h2>Dashboard</h2>
      <p>Email: {user.email}</p>
      <p>Account Created: {new Date(user.created_at).toLocaleDateString()}</p>
      <Link to="/edit-account" className="btn btn-primary">Edit Account</Link>
    </div>
  );
}

export default Dashboard;
