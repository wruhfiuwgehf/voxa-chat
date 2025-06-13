import React, { useEffect, useState, useRef } from 'react';
import {
  collection,
  addDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { db, auth } from './firebase';
import './Chat.css';

function Chat() {
  const { id } = useParams(); // target user's UID
  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [usernames, setUsernames] = useState({});
  const chatEndRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatContainerRef = useRef(null);

  const getChatId = (uid1, uid2) => {
    return uid1 > uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
  };

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', getChatId(currentUser.uid, id)),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const msgs = [];
      const newUsernames = { ...usernames };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const senderId = data.sender;

        if (!newUsernames[senderId]) {
          const userDoc = await getDoc(doc(db, 'users', senderId));
          if (userDoc.exists()) {
            newUsernames[senderId] = userDoc.data().username || 'Unknown';
          }
        }

        // Mark messages as read
        if (data.receiver === currentUser.uid && !data.read) {
          await updateDoc(doc(db, 'messages', docSnap.id), {
            read: true,
          });
        }

        msgs.push({ id: docSnap.id, ...data });
      }

      setMessages(msgs);
      setUsernames(newUsernames);

      // Auto-scroll after rendering
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    return () => unsubscribe();
  }, [currentUser.uid, id]);

  const handleSend = async () => {
    if (!text.trim()) return;

    await addDoc(collection(db, 'messages'), {
      text: text.trim(),
      sender: currentUser.uid,
      receiver: id,
      timestamp: serverTimestamp(),
      chatId: getChatId(currentUser.uid, id),
      read: false,
    });

    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleScroll = () => {
    const container = chatContainerRef.current;
    if (container) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 10;
      setShowScrollButton(!isAtBottom);
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Private Chat</h2>
      <div className="chat-messages" onScroll={handleScroll} ref={chatContainerRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${msg.sender === currentUser.uid ? 'own' : 'other'}`}
          >
            <div className="sender-name">
              {usernames[msg.sender] || msg.sender}
            </div>
            <div className="message-text">{msg.text}</div>
            {msg.timestamp?.seconds && (
              <div className="message-time">
                {new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef}></div>
        {showScrollButton && (
          <button className="scroll-to-bottom" onClick={scrollToBottom}>
            ⬇️
          </button>
        )}
      </div>
      <div className="chat-input-area">
        <textarea
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="chat-textarea"
        />
        <button onClick={handleSend} className="send-button">Send</button>
      </div>
    </div>
  );
}

export default Chat;
