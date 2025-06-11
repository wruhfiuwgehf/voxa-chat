import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  // Fetch all users except current user
  useEffect(() => {
    const fetchUsers = async () => {
      const usersSnap = await getDocs(collection(db, 'users'));
      const allUsers = usersSnap.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(user => user.uid !== currentUser.uid);

      setUsers(allUsers);
    };
    fetchUsers();
  }, [currentUser.uid]);

  // Fetch current user's friends
  useEffect(() => {
    const fetchFriends = async () => {
      const friendsSnap = await getDocs(collection(db, 'users', currentUser.uid, 'friends'));
      const friendIds = friendsSnap.docs.map(doc => doc.id);
      setFriends(friendIds);
    };
    fetchFriends();
  }, [currentUser.uid]);

  // Listen for unread message counts
  useEffect(() => {
    const unsubscribes = users.map(user => {
      const chatId = [currentUser.uid, user.uid].sort().join('_');
      const unreadRef = doc(db, 'users', currentUser.uid, 'unread', chatId);

      return onSnapshot(unreadRef, snapshot => {
        setUnreadCounts(prev => ({
          ...prev,
          [user.uid]: snapshot.exists() ? snapshot.data().count : 0
        }));
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  }, [users, currentUser.uid]);

  const toggleFriend = async (uid) => {
    const friendRef = doc(db, 'users', currentUser.uid, 'friends', uid);
    const isFriend = friends.includes(uid);

    if (isFriend) {
      await updateDoc(friendRef, { uid: null });
      setFriends(prev => prev.filter(id => id !== uid));
    } else {
      await setDoc(friendRef, { uid });
      setFriends(prev => [...prev, uid]);
    }
  };

  const handleChat = async (uid) => {
    const chatId = [currentUser.uid, uid].sort().join('_');
    await setDoc(doc(db, 'users', currentUser.uid, 'unread', chatId), { count: 0 });
    navigate(`/chat/${uid}`);
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aCount = unreadCounts[a.uid] || 0;
    const bCount = unreadCounts[b.uid] || 0;
    return bCount - aCount;
  });

  return (
    <div className="users-container">
      <h2>Users</h2>
      <ul className="user-list">
        {sortedUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          sortedUsers.map(user => (
            <li key={user.uid} className="user-entry">
              <span
                className="user-name"
                onClick={() => handleChat(user.uid)}
              >
                {user.username || 'Unnamed'}
                {unreadCounts[user.uid] > 0 && (
                  <span className="badge">{unreadCounts[user.uid]}</span>
                )}
              </span>
              <span
                className={`heart-icon ${friends.includes(user.uid) ? 'added' : ''}`}
                onClick={() => toggleFriend(user.uid)}
              >
                ❤️
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Users;
