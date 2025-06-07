import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';

function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ padding: '30px', color: 'white' }}>
      <h2>Dashboard</h2>
      <button onClick={() => navigate('/users')}>Users</button>
      <button onClick={() => navigate('/friends')}>Friends</button>
      <button onClick={() => navigate('/grouplist')}>View Groups</button>
      <button onClick={() => navigate('/creategroup')}>Create Group</button>
      <button onClick={logout}>Log Out</button>
    </div>
  );
}

export default Dashboard;
