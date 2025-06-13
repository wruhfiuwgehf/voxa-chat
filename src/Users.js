// Users.js
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  onSnapshot,
  setDoc,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userList = snapshot.docs
        .filter((doc) => doc.id !== currentUser.uid)
        .map((doc) => ({ uid: doc.id, ...doc.data() }));
      setUsers(userList);
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  useEffect(() => {
    const fetchFriends = async () => {
      const snapshot = await getDocs(collection(db, 'users', currentUser.uid, 'friends'));
      setFriends(snapshot.docs.map((doc) => doc.id));
    };
    fetchFriends();
  }, [currentUser.uid]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'messages'), (snapshot) => {
      const counts = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const chatId = getChatId(currentUser.uid, data.sender);
        if (
          data.receiver === currentUser.uid &&
          !data.read &&
          data.sender !== currentUser.uid
        ) {
          counts[data.sender] = (counts[data.sender] || 0) + 1;
        }
      });
      setUnreadCounts(counts);
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  const getChatId = (uid1, uid2) => {
    return uid1 > uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  const toggleFriend = async (uid) => {
    const friendRef = doc(db, 'users', currentUser.uid, 'friends', uid);
    const friendSnap = await getDoc(friendRef);
    if (friendSnap.exists()) {
      await updateDoc(friendRef, {});
      await setDoc(friendRef, {}, { merge: true });
      setFriends((prev) => prev.filter((id) => id !== uid));
    } else {
      await setDoc(friendRef, { timestamp: serverTimestamp() });
      setFriends((prev) => [...prev, uid]);
    }
  };

  const handleChat = async (uid) => {
    // Clear unread count
    const chatId = getChatId(currentUser.uid, uid);
    const snapshot = await getDocs(collection(db, 'messages'));
    snapshot.docs.forEach(async (docSnap) => {
      const msg = docSnap.data();
      if (
        msg.receiver === currentUser.uid &&
        msg.sender === uid &&
        !msg.read
      ) {
        await updateDoc(doc(db, 'messages', docSnap.id), { read: true });
      }
    });
    navigate(`/chat/${uid}`);
  };

  const sortedUsers = [...users].sort((a, b) => {
    const countA = unreadCounts[a.uid] || 0;
    const countB = unreadCounts[b.uid] || 0;
    return countB - countA;
  });

  return (
    <div className="users-tab">
      <h2>All Users</h2>
      <ul className="user-list">
        {sortedUsers.map((user) => (
          <li key={user.uid} className="user-item">
            <div className="user-info" onClick={() => handleChat(user.uid)}>
              <span className="username">{user.username || 'Unnamed'}</span>
              {unreadCounts[user.uid] > 0 && (
                <span className="badge">{unreadCounts[user.uid]}</span>
              )}
            </div>
            <button
              className={`heart-btn ${friends.includes(user.uid) ? 'friended' : ''}`}
              onClick={() => toggleFriend(user.uid)}
            >
              ❤️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Users;
