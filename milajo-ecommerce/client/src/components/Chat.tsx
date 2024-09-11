import React, { useState, useEffect, useRef } from 'react';
import { Tooltip, TextField, Typography, IconButton, Collapse } from '@mui/material';
import { Send, SportsHandball, ChatBubble, ExpandLess } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import styles from '../styles/chat.module.css';

interface Message {
  text: JSX.Element | string;
  sender: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [open, setOpen] = useState(false);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async () => {
    if (userMessage.trim() === '') return;
    setTyping(true);
    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const { text, title, id } = data.response;
      if (!id) {
        // No ID, just show the response message
        setMessages([
          ...messages,
          { text: userMessage, sender: 'Me' },
          { text: text, sender: 'Jo' },
        ]);
      } else {
        // ID exists, include the Link component
        setMessages([
          ...messages,
          { text: userMessage, sender: 'Me' },
          {
            text: (
              <span>
                {text}{' '}
                <Link to={`/item?id=${id}`}>{title}</Link>
              </span>
            ),
            sender: 'Jo',
          },
        ]);
      }
      setUserMessage('');
      setTyping(false);
    } catch (error) {
      console.error('Error fetching from backend:', error);
    }
  };

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div>
        <Collapse in={open}>
          <div className={styles.chatContainer}>
            <div className={styles.chatHeader} onClick={() => setOpen(false)}>
              <SportsHandball className={styles.chatLogo} />
              <span>Jo - Buy Buddy</span>
              <IconButton style={{ marginLeft: 'auto' }}>
                <ExpandLess sx={{ color: '#f9a825' }} />
              </IconButton>
            </div>
            <div className={styles.chatBody} ref={chatBodyRef}>
              {messages.length === 0 && (
                <Typography
                  variant="body2"
                  className={styles.bodyBox}
                >
                  <strong>Jo:</strong> Hello! How can I assist you today?
                </Typography>
              )}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    textAlign: msg.sender === 'Jo' ? 'left' : 'right',
                    marginBottom: '10px',
                  }}
                >
                  <Typography
                    variant="body2"
                    style={{
                      display: 'inline-block',
                      padding: '10px',
                      borderRadius: '20px',
                      backgroundColor: msg.sender === 'Jo' ? '#e0e0e0' : '#fff',
                      color: msg.sender === 'Jo' ? 'black' : '#259',
                      border: msg.sender === 'Jo' ? '1px solid #fff' : '1px solid #2596be',
                    }}
                  >
                    <strong>{msg.sender}:</strong> {msg.text}
                  </Typography>
                </div>
              ))}
            </div>
            <div className={styles.chatTyping}>
              <div
                className={styles.typingIndicatorBubble}
                style={{ visibility: typing ? 'visible' : 'hidden' }}
              >
                <div className={styles.typingIndicatorBubbleDot}></div>
                <div className={styles.typingIndicatorBubbleDot}></div>
                <div className={styles.typingIndicatorBubbleDot}></div>
              </div>
            </div>

            <div className={styles.chatFooter}>

              <TextField
                className={styles.chatInput}
                variant="outlined"
                size="small"
                fullWidth
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
              />
              <Tooltip title="Send">
                <Send className={styles.chatSend} onClick={handleSendMessage} />
              </Tooltip>
            </div>
          </div>
        </Collapse>

        {!open && (
          <IconButton
            onClick={() => setOpen(true)}
            className={styles.btn}
          >
            <ChatBubble />
          </IconButton>
        )}
      </div>
    </>
  );
};

export default Chat;
