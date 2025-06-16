import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import './CreateGroup.css';

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const currentUser = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const data = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(user => user.uid !== currentUser.uid);
      setUsers(data);
    };
    fetchUsers();
  }, [currentUser]);

  const toggleSelect = (uid) => {
    setSelectedUsers(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert('Please provide a group name and select at least one user.');
      return;
    }

    try {
      const groupRef = await addDoc(collection(db, 'groups'), {
        name: groupName,
        members: [...selectedUsers, currentUser.uid],
        createdAt: serverTimestamp()
      });

      navigate(`/group/${groupRef.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  return (
    <div className="create-group-container">
      <h2>Create a New Group</h2>
      <input
        type="text"
        placeholder="Enter group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="group-name-input"
      />
      <div className="user-list">
        {users.map((user) => (
          <div
            key={user.uid}
            className={`user-item ${selectedUsers.includes(user.uid) ? 'selected' : ''}`}
            onClick={() => toggleSelect(user.uid)}
          >
            {user.username || 'Unnamed'}
          </div>
        ))}
      </div>
      <button onClick={handleCreateGroup} className="create-group-btn">
        Create Group
      </button>
    </div>
  );
}

export default CreateGroup;
