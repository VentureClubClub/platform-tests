import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

// TODO see https://github.com/netlify/netlify-identity-widget/blob/master/example/react/src/App.js
//      for netlify identity in react

function App() {
  const [greeting, setGreeting] = useState("hi.")

  // TODO endpoint locations should be configurable
  fetch(".netlify/functions/get-greeting")
    .then(response => response.text())
    .then(text => setGreeting(text))

  return (
    <div className="App">
      <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
        <p>
          {greeting}
          <br/>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
