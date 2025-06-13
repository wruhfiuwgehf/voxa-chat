import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import './Users.css';

function CreateGroup() {
  const [users, setUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const list = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(user => user.uid !== currentUser.uid);
      setUsers(list);
    };
    fetchUsers();
  }, [currentUser.uid]);

  const toggleUser = (uid) => {
    setSelectedUsers(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert('Please enter a group name and select at least one user.');
      return;
    }

    const groupData = {
      name: groupName,
      members: [currentUser.uid, ...selectedUsers],
      createdAt: new Date()
    };

    try {
      const groupRef = await addDoc(collection(db, 'groups'), groupData);
      navigate(`/group/${groupRef.id}`); // ✅ Navigate directly to the created group
    } catch (error) {
      console.error('Create Group Error:', error);
      alert('Group creation failed. Try again.');
    }
  };

  return (
    <div className="users-container">
      <h2>Create a New Group</h2>
      <input
        placeholder="Group name"
        value={groupName}
        onChange={e => setGroupName(e.target.value)}
        className="user-input"
      />
      <ul className="users-list">
        {users.map(user => (
          <li
            key={user.uid}
            className={`user-item ${selectedUsers.includes(user.uid) ? 'selected' : ''}`}
            onClick={() => toggleUser(user.uid)}
          >
            {user.username || user.email}
          </li>
        ))}
      </ul>
      <button onClick={createGroup} className="user-action-button">
        Create Group
      </button>
    </div>
  );
}

export default CreateGroup;
