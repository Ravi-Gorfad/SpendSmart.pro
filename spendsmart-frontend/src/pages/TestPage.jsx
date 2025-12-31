// Simple test page to verify React is working
import React from 'react';

const TestPage = () => {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0'
    }}>
      <h1 style={{ color: '#333' }}>React is Working! ✅</h1>
      <p style={{ color: '#666', marginTop: '20px' }}>
        If you can see this, React is rendering correctly.
      </p>
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '10px',
        display: 'inline-block'
      }}>
        <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
        <p><strong>React Version:</strong> {React.version || 'Unknown'}</p>
      </div>
    </div>
  );
};

export default TestPage;

