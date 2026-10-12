import React from 'react';
import { Box } from '@mui/material';

const TypingAnimation = () => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'linear-gradient(to right, #cbd5e0, #4b5563)', animation: 'pulse-animation 1s infinite' }}></div>
      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'linear-gradient(to right, #cbd5e0, #4b5563)', animation: 'pulse-animation 1s infinite', animationDelay: '0.75s' }}></div>
      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'linear-gradient(to right, #cbd5e0, #4b5563)', animation: 'pulse-animation 1s infinite', animationDelay: '1.5s' }}></div>
    </Box>
  );
};

export default TypingAnimation;
