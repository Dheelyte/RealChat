import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './components/auth/AuthContext';
import Home from './components/Home';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import Messages from './components/core/Messages';
import MessageDetail from './components/core/MessageDetail';


function App() {

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/:username" element={<MessageDetail />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
