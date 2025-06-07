import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1>Voxa Welcomes You </h1>
      <h1>This is dedicated to Sathvik Edara</h1>
      <button onClick={() => navigate('/signup')}>Sign Up</button>
      <button onClick={() => navigate('/login')}>Log In</button>
    </div>
  );
}

export default Welcome;
