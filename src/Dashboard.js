import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to your Dashboard</h1>
      <div style={styles.buttonContainer}>
        <button style={styles.button} onClick={() => navigate('/users')}>Users</button>
        <button style={styles.button} onClick={() => navigate('/friends')}>Friends</button>
        <button style={styles.button} onClick={() => navigate('/grouplist')}>Group Chats</button>
        <button style={styles.button} onClick={() => navigate('/creategroup')}>Create Group</button>
        <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    color: 'white',
  },
  heading: {
    fontSize: '3rem',
    marginBottom: '40px',
    color: '#fff',
    textShadow: '0 0 20px #ff00ff',
    fontFamily: '"Orbitron", sans-serif',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    maxWidth: '300px',
  },
  button: {
    padding: '15px',
    fontSize: '1.2rem',
    background: 'linear-gradient(to right, #6a00ff, #ff00d4)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    boxShadow: '0 0 15px #ff00d4',
  },
  logoutButton: {
    padding: '15px',
    fontSize: '1.2rem',
    backgroundColor: '#222',
    color: 'white',
    border: '2px solid #ff00d4',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '20px',
  }
};

export default Dashboard;
