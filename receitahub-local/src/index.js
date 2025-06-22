import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // O CSS padrão do create-react-app
import App from './App'; // Importa nosso componente principal

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);