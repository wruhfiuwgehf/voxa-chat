import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
      const data = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(user => user.uid !== currentUser.uid);
      setUsers(data);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(collection(db, 'users', currentUser.uid, 'friends'), snapshot => {
      setFriends(snapshot.docs.map(doc => doc.id));
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleFriend = async (user) => {
    const friendRef = doc(db, 'users', currentUser.uid, 'friends', user.uid);
    const docSnap = await getDoc(friendRef);

    if (docSnap.exists()) {
      await setDoc(friendRef, {}, { merge: true }); // already exists, remove later if needed
    } else {
      await setDoc(friendRef, {
        username: user.username || '',
        avatar: user.avatar || ''
      });
    }
  };

  const goToChat = (uid) => {
    navigate(`/chat/${uid}`);
  };

  return (
    <div className="users-container">
      <h2>All Users</h2>
      <ul>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <li key={user.uid} className="user-entry">
              <span className="user-name" onClick={() => goToChat(user.uid)}>
                {user.username || 'Unnamed'}
              </span>
              <button
                className={`friend-button ${friends.includes(user.uid) ? 'friended' : ''}`}
                onClick={() => toggleFriend(user)}
              >
                ❤️
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Users;
