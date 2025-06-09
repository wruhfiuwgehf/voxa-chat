import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [friends, setFriends] = useState(() => {
    const saved = localStorage.getItem('friends') || '[]';
    return JSON.parse(saved);
  });

  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs
        .map((doc) => doc.data())
        .filter((user) => user.uid !== currentUser?.uid);
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleFriend = (uid) => {
    let updated;
    if (friends.includes(uid)) {
      updated = friends.filter((id) => id !== uid);
    } else {
      updated = [...friends, uid];
    }
    setFriends(updated);
    localStorage.setItem('friends', JSON.stringify(updated));
  };

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-container">
      <h2>Users</h2>
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />
      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul className="user-list">
          {filteredUsers.map((user) => (
            <li key={user.uid} className="user-item">
              <span onClick={() => navigate(`/chat/${user.uid}`)}>
                {user.username || user.email}
              </span>
              <span
                className={`heart ${friends.includes(user.uid) ? 'active' : ''}`}
                onClick={() => toggleFriend(user.uid)}
              >
                ❤️
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Users;
