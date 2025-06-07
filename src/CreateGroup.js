import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const allUsers = querySnapshot.docs
        .map(doc => doc.data())
        .filter(user => user.uid !== auth.currentUser.uid);
      setUsers(allUsers);
    };

    fetchUsers();
  }, []);

  const toggleSelectUser = (uid) => {
    setSelectedUsers((prev) =>
      prev.includes(uid)
        ? prev.filter((id) => id !== uid)
        : [...prev, uid]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name.');
      return;
    }

    if (selectedUsers.length === 0) {
      alert('Please select at least one member.');
      return;
    }

    const groupData = {
      name: groupName,
      members: [auth.currentUser.uid, ...selectedUsers],
      createdAt: Date.now(),
    };

    const docRef = await addDoc(collection(db, 'groups'), groupData);
    navigate(`/group/${docRef.id}`);
  };

  return (
    <div className="create-group-container">
      <h2>Create Group</h2>
      <input
        type="text"
        placeholder="Enter group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      <h4>Select members:</h4>
      <div className="user-list">
        {users.map((user) => (
          <label key={user.uid} style={{ display: 'block', margin: '5px 0' }}>
            <input
              type="checkbox"
              checked={selectedUsers.includes(user.uid)}
              onChange={() => toggleSelectUser(user.uid)}
            />
            {user.username}
          </label>
        ))}
      </div>
      <button onClick={handleCreateGroup} style={{ marginTop: '10px' }}>
        Create Group
      </button>
    </div>
  );
}

export default CreateGroup;
