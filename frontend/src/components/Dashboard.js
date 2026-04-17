import React from 'react';

function Dashboard({ vault, onLogout }) {
  return (
    <div>
      <h2>Dashboard</h2>
      
      <button onClick={onLogout}>Logout</button>
      
      <h3>Your Passwords:</h3>
      
      {vault && vault.passwords && vault.passwords.length > 0 ? (
        <ul>
          {vault.passwords.map((password, index) => (
            <li key={index}>
              <strong>{password.title}</strong>
              <p>Username: {password.username}</p>
              <p>Password: {password.password}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No passwords saved yet.</p>
      )}
    </div>
  );
}

export default Dashboard;