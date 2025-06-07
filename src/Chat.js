import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import EmojiPicker from 'emoji-picker-react';

function Chat() {
  const { id } = useParams();
  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);

  const getChatId = (uid1, uid2) => [uid1, uid2].sort().join('_');

  useEffect(() => {
    if (!currentUser || !id) return;
    const chatId = getChatId(currentUser.uid, id);
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp')
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, [id, currentUser]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
    const senderName = userSnap.exists() ? userSnap.data().username : 'Unknown';

    await addDoc(collection(db, 'messages'), {
      chatId: getChatId(currentUser.uid, id),
      sender: currentUser.uid,
      senderName,
      receiver: id,
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
      <h2>Private Chat</h2>
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
              backgroundColor: msg.sender === currentUser.uid ? '#7b2cbf' : '#5a189a',
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

export default Chat;
