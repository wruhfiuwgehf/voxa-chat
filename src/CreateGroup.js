import React, { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useNavigate } from 'react-router-dom';

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), snapshot => {
      const userList = snapshot.docs
        .map(doc => doc.data())
        .filter(user => user.uid !== currentUser.uid && user.username); // ✅ filter out self and invalid usernames
      setUsers(userList);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const toggleUser = (uid) => {
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
      const groupRef = await addDoc(collection(db, 'groups'), {
        name: groupName,
        members: [currentUser.uid, ...selectedUsers],
        createdAt: new Date(),
      });

      navigate(`/group/${groupRef.id}`);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group. Please try again.');
    }
  };

  return (
    <div style={{ color: 'white', padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>Create Group</h2>
      <input
        type="text"
        placeholder="Group name"
        value={groupName}
        onChange={e => setGroupName(e.target.value)}
        style={{ padding: '10px', width: '100%', marginBottom: '20px', borderRadius: '8px' }}
      />
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {users.map(user => (
          <div
            key={user.uid}
            onClick={() => toggleUser(user.uid)}
            style={{
              padding: '10px',
              margin: '5px 0',
              backgroundColor: selectedUsers.includes(user.uid) ? '#6c5ce7' : 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {user.username}
          </div>
        ))}
      </div>
      <button
        onClick={createGroup}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '8px',
          background: '#a29bfe',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        Create Group
      </button>
    </div>
  );
}

export default CreateGroup;
