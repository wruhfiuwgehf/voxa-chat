import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from './firebase';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import EmojiPicker from 'emoji-picker-react';

function GroupChat() {
  const { groupId } = useParams();
  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [text, setText] = useState('');
  const [usernames, setUsernames] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const bottomRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    const fetchGroupName = async () => {
      const docSnap = await getDoc(doc(db, 'groups', groupId));
      if (docSnap.exists()) {
        setGroupName(docSnap.data().name);
      }
    };
    fetchGroupName();
  }, [groupId]);

  useEffect(() => {
    const q = query(
      collection(db, 'groups', groupId, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = [];
      const nameMap = { ...usernames };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (!nameMap[data.sender]) {
          const userSnap = await getDoc(doc(db, 'users', data.sender));
          nameMap[data.sender] = userSnap.exists() ? userSnap.data().username : 'Unknown';
        }
        msgs.push(data);
      }

      setUsernames(nameMap);
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (text.trim()) {
      await addDoc(collection(db, 'groups', groupId, 'messages'), {
        text,
        sender: currentUser.uid,
        timestamp: serverTimestamp(),
      });
      setText('');
    }
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    setShowScrollButton(scrollHeight - scrollTop > clientHeight + 200);
  };

  const handleEmojiClick = (emojiData) => {
    setText(prev => prev + emojiData.emoji);
  };

  return (
    <div>
      <h2>{groupName || 'Group Chat'}</h2>
      <div
        ref={containerRef}
        style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}
        onScroll={handleScroll}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 10,
              textAlign: msg.sender === currentUser.uid ? 'right' : 'left',
              color: msg.sender === currentUser.uid ? 'cyan' : 'pink',
            }}
          >
            <div style={{ fontSize: '12px', opacity: 0.7 }}>
              {usernames[msg.sender] || 'Unknown'}
            </div>
            <div>{msg.text}</div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '30px',
            padding: '10px',
            borderRadius: '50%',
            background: '#444',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            zIndex: 1000,
          }}
        >
          ↓
        </button>
      )}

      <div>
        <input value={text} onChange={e => setText(e.target.value)} />
        <button onClick={() => setShowEmojiPicker(prev => !prev)}>😀</button>
        <button onClick={sendMessage}>Send</button>
      </div>
      {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
    </div>
  );
}

export default GroupChat;
