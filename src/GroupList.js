import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useNavigate } from 'react-router-dom';

function GroupList() {
  const [groups, setGroups] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'groups'), (snapshot) => {
      setGroups(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsub();
  }, []);

  return (
    <div>
      <h2>Group Chats</h2>
      {groups.map((group) => (
        <div key={group.id} onClick={() => navigate(`/group/${group.id}`)} style={{ cursor: 'pointer' }}>
          <h3>{group.name}</h3>
        </div>
      ))}
    </div>
  );
}

export default GroupList;
