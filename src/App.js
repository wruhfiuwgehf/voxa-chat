import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import Users from './Users';
import Chat from './Chat';
import Dashboard from './Dashboard';
import Welcome from './Welcome';
import GroupChat from './GroupChat';
import GroupList from './GroupList';
import Friends from './Friends';
import CreateGroup from './CreateGroup';
import ParticlesBackground from './ParticlesBackground';
import { auth } from './firebase';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden' }}>
      <ParticlesBackground />
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', padding: '20px', color: 'white' }}>
        <Routes>
          <Route path="/group/:groupId" element={<GroupChat />} />
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/users" element={user ? <Users /> : <Navigate to="/login" />} />
          <Route path="/friends" element={user ? <Friends /> : <Navigate to="/login" />} />
          <Route path="/chat/:id" element={user ? <Chat /> : <Navigate to="/login" />} />
          <Route path="/group/:groupId" element={user ? <GroupChat /> : <Navigate to="/login" />} />
          <Route path="/grouplist" element={user ? <GroupList /> : <Navigate to="/login" />} />
         <Route path="/creategroup" element={user ? <CreateGroup /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </div>
    </div>
  );
}

export default App;
