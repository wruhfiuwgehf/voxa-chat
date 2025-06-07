import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from './firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import EmojiPicker from 'emoji-picker-react';

function GroupChat() {
  const { groupId } = useParams();
  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [groupName, setGroupName] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    const fetchGroupName = async () => {
      const ref = doc(db, 'groups', groupId);
      const docSnap = await getDoc(ref);
      if (docSnap.exists()) setGroupName(docSnap.data().name);
    };
    fetchGroupName();
  }, [groupId]);

  useEffect(() => {
    const q = query(collection(db, 'groups', groupId, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });
    return () => unsubscribe();
  }, [groupId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
    const senderName = userSnap.exists() ? userSnap.data().username : 'Unknown';

    await addDoc(collection(db, 'groups', groupId, 'messages'), {
      sender: currentUser.uid,
      senderName,
      text,
      timestamp: serverTimestamp(),
    });

    setText('');
    setShowEmoji(false);
  };

  const formatTime = (timestamp) => {
    const date = timestamp?.toDate?.();
    return date ? new Intl.DateTimeFormat('default', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date) : '';
  };

  return (
    <div style={{ padding: '20px', color: 'white' }}>
      <h2>{groupName || 'Group Chat'}</h2>
      <div style={{ maxHeight: 300, overflowY: 'scroll', marginBottom: 10 }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === currentUser.uid ? 'right' : 'left',
              marginBottom: '10px'
            }}
          >
            <div style={{
              display: 'inline-block',
              backgroundColor: msg.sender === currentUser.uid ? '#4361ee' : '#3a0ca3',
              padding: '8px 12px',
              borderRadius: '10px',
              maxWidth: '70%',
              color: 'white'
            }}>
              <b>{msg.senderName || 'Unknown'}</b>: {msg.text}
              <div style={{ fontSize: '0.75em', marginTop: '4px', opacity: 0.6 }}>
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          style={{ width: '60%', padding: '8px', marginRight: '5px' }}
        />
        <button onClick={() => setShowEmoji(!showEmoji)}>😄</button>
        <button onClick={sendMessage}>Send</button>
      </div>
      {showEmoji && (
        <div style={{ position: 'absolute', zIndex: 1000 }}>
          <EmojiPicker
            onEmojiClick={(e) => setText(prev => prev + e.emoji)}
            theme="dark"
          />
        </div>
      )}
    </div>
  );
}

export default GroupChat;
