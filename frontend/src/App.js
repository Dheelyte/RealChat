import { Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './components/auth/AuthContext';
import Signup from './components/auth/Signup';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DefaultChat from './components/core/DefaultChat';
import Messages from './components/core/Messages';
import MessageDetail from './components/core/MessageDetail';
import CallerPage from './components/core/callerPage';
import { useState } from 'react';




function App() {
  const [changeMode, setIsChangeMode]   = useState()
  const toggleMode = () =>{
    setIsChangeMode(prevMode => !prevMode)
};
  
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Messages  changeMode={changeMode}/></ProtectedRoute>}>
          <Route index element={<DefaultChat  />} />
          <Route path=":username" element={<ProtectedRoute><MessageDetail  changeMode={changeMode} /></ProtectedRoute>} />
          <Route path="/callerpage" element={<CallerPage changeMode={changeMode} toggleMode={toggleMode} />}/> 
   </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
