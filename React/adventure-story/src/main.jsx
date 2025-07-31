import ReactDOM from 'react-dom/client'
import App from './App'
import NewApp from './NewApp'

const root = ReactDOM.createRoot(document.getElementById('root'));

// Toggle between them:
root.render(<NewApp />); // \u2190 NEW adventure app
// root.render(<App />); // \u2190 Old version
