import React, { useState } from "react";
import Head from 'next/head'

import axios from 'axios';
import { Typography, Container, TextField, Button, CircularProgress } from '@mui/material';
import TypingAnimation from "../components/TypingAnimation";



export default function Chatboat() {
  const [inputValue, setInputValue] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const userMessage = { type: 'user', message: inputValue };
    setChatLog((prevChatLog) => [...prevChatLog, userMessage]);

    await sendMessage(inputValue);

    setInputValue('');
  }

  const sendMessage = async (message) => {
    const url = '/api/chat';

    const data = {
      model: "gpt-3.5-turbo-0301",
      messages: [{ "role": "user", "content": message }]
    };

    setIsLoading(true);

    try {
      const response = await axios.post(url, data);
      const botMessage = { type: 'bot', message: response.data.choices[0].message.content };

      setChatLog((prevChatLog) => [...prevChatLog, botMessage]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Container maxWidth="sm">
      <Head>
        <title>ChatBoat</title>
      </Head>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'auto', backgroundColor: '#121212', color: '#fff' }}>
        <Typography variant="h3" align="center" sx={{ py: 3, fontWeight: 'bold', backgroundImage: 'linear-gradient(to right, #3b82f6, #9333ea)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>ChatBoat</Typography>
        <div style={{ flex: 1, padding: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {chatLog.map((message, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ backgroundColor: message.type === 'user' ? '#9333ea' : '#4b5563', borderRadius: '8px', padding: '16px', color: '#fff', maxWidth: '300px' }}>
                  {message.message}
                </div>
              </div>
            ))}
            {isLoading &&
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: '#4b5563', borderRadius: '8px', padding: '16px', color: '#fff', maxWidth: '300px' }}>
                  <TypingAnimation />
                </div>
              </div>
            }
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: '24px', backgroundColor: '#4b5563' }}>
          <div style={{ display: 'flex', borderRadius: '8px', border: '1px solid #4b5563', backgroundColor: '#4b5563' }}>
            <TextField type="text" fullWidth variant="standard" placeholder="Type your message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} sx={{ color: '#fff' }} />
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#9333ea', color: '#fff', borderRadius: '0', '&:hover': { backgroundColor: '#7c3aed' } }}>Send</Button>
          </div>
        </form>
      </div>
    </Container>
  )
}
