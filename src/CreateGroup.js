import './CreateGroup.css';
import React, { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import './Users.css'; // optional for consistent styling

function CreateGroup() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(user => user.uid !== currentUser.uid);
      setUsers(fetchedUsers);
    };

    fetchUsers();
  }, [currentUser.uid]);

  const toggleSelect = (uid) => {
    setSelectedUsers(prev =>
      prev.includes(uid)
        ? prev.filter(id => id !== uid)
        : [...prev, uid]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name.');
      return;
    }
    if (selectedUsers.length === 0) {
      alert('Please select at least one user.');
      return;
    }

    try {
      const groupRef = doc(collection(db, 'groups'));
      await setDoc(groupRef, {
        name: groupName,
        members: [...selectedUsers, currentUser.uid],
        createdAt: serverTimestamp(),
      });
      alert('Group created!');
      setGroupName('');
      setSelectedUsers([]);
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group. Please try again.');
    }
  };

  return (
    <div className="create-group-container">
      <h2>Create a Group</h2>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <div className="user-list">
        {users.map((user) => (
          <div
            key={user.uid}
            className={`user-item ${selectedUsers.includes(user.uid) ? 'selected' : ''}`}
            onClick={() => toggleSelect(user.uid)}
          >
            {user.username || 'Unnamed User'}
          </div>
        ))}
      </div>
      <button onClick={createGroup}>Create Group</button>
    </div>
  );
}

export default CreateGroup;
