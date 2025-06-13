import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';

function CreateGroup() {
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const currentUser = auth.currentUser;
      const userList = snapshot.docs
        .map(doc => ({ uid: doc.id, ...doc.data() }))
        .filter(user => user.uid !== currentUser.uid);
      setUsers(userList);
    };

    fetchUsers();
  }, []);

  const toggleUser = (uid) => {
    if (selectedUsers.includes(uid)) {
      setSelectedUsers(prev => prev.filter(id => id !== uid));
    } else {
      setSelectedUsers(prev => [...prev, uid]);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) {
      alert('Please enter a group name and select at least one user.');
      return;
    }

    const groupDoc = await addDoc(collection(db, 'groups'), {
      name: groupName,
      members: [...selectedUsers, auth.currentUser.uid],
      createdBy: auth.currentUser.uid,
    });

    navigate(`/group/${groupDoc.id}`);
  };

  return (
    <div>
      <h2>Create Group</h2>
      <input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={e => setGroupName(e.target.value)}
        style={{ padding: '8px', marginBottom: '10px', width: '300px' }}
      />
      <div>
        <h4>Select Users:</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          {users.map(user => (
            <div key={user.uid}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.uid)}
                  onChange={() => toggleUser(user.uid)}
                />
                {user.username || 'Unnamed'}
              </label>
            </div>
          ))}
        </div>
      </div>
      <button onClick={createGroup} style={{ marginTop: '20px' }}>Create Group</button>
    </div>
  );
}

export default CreateGroup;
