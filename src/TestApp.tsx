import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#477A0C' }}>🌿 MYCONFORT - Test</h1>
      <p>L'application se charge correctement !</p>
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginTop: '20px'
      }}>
        <h2>Tests de fonctionnement :</h2>
        <ul>
          <li>✅ React fonctionne</li>
          <li>✅ CSS fonctionne</li>
          <li>✅ TypeScript fonctionne</li>
        </ul>
      </div>
    </div>
  );
}

export default TestApp;
