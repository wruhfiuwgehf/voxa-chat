import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(collection(db, 'users'), where('uid', '!=', currentUser.uid));
      const snapshot = await getDocs(q);
      setUsers(snapshot.docs.map(doc => doc.data()));
    };

    const fetchFriends = async () => {
      const snapshot = await getDocs(collection(db, 'users', currentUser.uid, 'friends'));
      setFriends(snapshot.docs.map(doc => doc.id));
    };

    fetchUsers();
    fetchFriends();
  }, [currentUser.uid]);

  const handleAddFriend = async (user) => {
    const friendRef = doc(db, 'users', currentUser.uid, 'friends', user.uid);
    const exists = await getDoc(friendRef);

    if (!exists.exists()) {
      await setDoc(friendRef, {
        uid: user.uid,
        username: user.username || user.email,
      });
      setFriends((prev) => [...prev, user.uid]);
    }
  };

  const handleChat = (uid) => {
    navigate(`/chat/${uid}`);
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-container">
      <h2>All Users</h2>
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      <div className="users-list">
        {filteredUsers.map(user => (
          <div key={user.uid} className="user-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span
              onClick={() => handleChat(user.uid)}
              style={{ cursor: 'pointer', textDecoration: 'underline', color: '#fff' }}
              title="Click to chat"
            >
              {user.username}
            </span>
            <span
              style={{ color: friends.includes(user.uid) ? 'red' : 'gray', cursor: 'pointer' }}
              onClick={() => handleAddFriend(user)}
              title="Add to Friends"
            >
              ♥
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Users;
