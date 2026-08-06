// Toegangspunt vir die React-App, dit koppel App.jsx aan die html se root en laai die globale CSS-lêers in

// Laai die nodige modules in
// react vir die kern van react
import React from 'react';
// react-dom vir die DOM-rendering
import ReactDOM from 'react-dom/client';
// App-komponent wat al die ander komponente saambind
import App from './App.jsx';
// Laai die globale CSS-lêers in




// Render die App-komponent in die root-element van die html
ReactDOM.createRoot(document.getElementById('root')).render(
  // Gebruik StrictMode vir streng kontrole van die React-komponente
  <React.StrictMode>
    {/* Render die App-komponent */}
    <App />
  </React.StrictMode>
);