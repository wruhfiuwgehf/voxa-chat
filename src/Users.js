import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { Link } from 'react-router-dom';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState('');
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersList = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(user => user.uid !== currentUser.uid); // don't show self
      setUsers(usersList);
    });

    const friendsRef = doc(db, 'friends', currentUser.uid);
    const unsubscribeFriends = onSnapshot(friendsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFriends(data.friendIds || []);
      } else {
        setDoc(friendsRef, { friendIds: [] });
        setFriends([]);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeFriends();
    };
  }, [currentUser]);

  const toggleFriend = async (uid) => {
    if (!uid || !currentUser) return;
    const docRef = doc(db, 'friends', currentUser.uid);
    let updatedFriends = [...friends];

    if (friends.includes(uid)) {
      updatedFriends = updatedFriends.filter(id => id !== uid);
    } else {
      updatedFriends.push(uid);
    }

    try {
      await updateDoc(docRef, { friendIds: updatedFriends });
      setFriends(updatedFriends);
    } catch (error) {
      console.error("Error updating friends:", error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="users-container">
      <h2>Users</h2>
      <input
        className="search-bar"
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul className="user-list">
        {filteredUsers.map((user) => (
          <li key={user.uid} className="user-item">
            <Link to={`/chat/${user.uid}`} className="username">
              {user.username || 'Unnamed'}
            </Link>
            <button
              className={`heart-button ${friends.includes(user.uid) ? 'hearted' : ''}`}
              onClick={() => toggleFriend(user.uid)}
            >
              ❤️
            </button>
          </li>
        ))}
        {filteredUsers.length === 0 && <li className="no-users">No users found.</li>}
      </ul>
    </div>
  );
}

export default Users;
