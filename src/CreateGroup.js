import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList = snapshot.docs
        .map((doc) => doc.data())
        .filter((user) => user.uid !== currentUser?.uid);
      setUsers(usersList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleUser = (uid) => {
    setSelectedUsers((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0) {
      alert('Please enter a group name and select at least one user.');
      return;
    }

    try {
      const groupDoc = await addDoc(collection(db, 'groups'), {
        name: groupName,
        members: [currentUser.uid, ...selectedUsers],
        createdAt: serverTimestamp(),
      });

      navigate(`/group/${groupDoc.id}`);
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group.');
    }
  };

  return (
    <div className="group-create-container">
      <h2>Create Group</h2>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="group-input"
      />
      <ul className="user-list">
        {users.map((user) => (
          <li
            key={user.uid}
            className={`user-item ${selectedUsers.includes(user.uid) ? 'selected' : ''}`}
            onClick={() => toggleUser(user.uid)}
          >
            {user.username || user.email}
          </li>
        ))}
      </ul>
      <button onClick={handleCreateGroup}>Create Group</button>
    </div>
  );
}

export default CreateGroup;
