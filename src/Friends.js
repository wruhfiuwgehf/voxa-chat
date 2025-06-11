import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';

function Friends() {
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchFriends = async () => {
      const snapshot = await getDocs(collection(db, 'users', currentUser.uid, 'friends'));

      const friendsWithUsernames = await Promise.all(
        snapshot.docs.map(async docSnap => {
          const uid = docSnap.id;
          const userDoc = await getDoc(doc(db, 'users', uid));
          const userData = userDoc.exists() ? userDoc.data() : { username: 'Unknown' };
          return {
            uid,
            username: userData.username || 'Unknown',
          };
        })
      );

      setFriends(friendsWithUsernames);
    };

    fetchFriends();
  }, [currentUser.uid]);

  const handleChat = (uid) => {
    navigate(`/chat/${uid}`);
  };

  const handleUnfriend = async (uid) => {
    await deleteDoc(doc(db, 'users', currentUser.uid, 'friends', uid));
    setFriends(friends.filter(friend => friend.uid !== uid));
  };

  return (
    <div className="friends-container">
      <h2>Your Friends</h2>
      <div className="friends-list">
        {friends.length === 0 ? (
          <p>No friends yet.</p>
        ) : (
          friends.map((friend) => (
            <div
              key={friend.uid}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#222',
                padding: '8px',
                marginBottom: '6px',
                borderRadius: '4px',
              }}
            >
              <span
                onClick={() => handleChat(friend.uid)}
                style={{ cursor: 'pointer', color: '#fff' }}
              >
                {friend.username}
              </span>
              <button
                onClick={() => handleUnfriend(friend.uid)}
                style={{ color: 'white' }}
              >
                Unfriend
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Friends;
