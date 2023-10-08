import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Api from '../Api';


const Messages = () => {
    const navigate = useNavigate()
    const { user, logout } = useAuth();

    useEffect(() => {
        !user && navigate('/login');
    }, [user, navigate]);

    useEffect(() => {
        // Connect to WebSocket when user becomes available (not null)
        if (user) {
            connectWebSocket(user.token);
            console.log(user)
        }
    }, [user]);

    const [socket, setSocket] = useState(null);

    const connectWebSocket = (token) => {
        const newSocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/delight/?token=${token}`);
        setSocket(newSocket);
    
        newSocket.onopen = () => {
          console.log('Connected to WebSocket!');
        };
    
        newSocket.onclose = () => {
          console.log('WebSocket connection closed.');
        };
    
        // You can also handle other WebSocket events like onmessage, onerror, etc.
      };

    

    const handleLogout = async () => {
        if (socket) {
            socket.close();
          }
        try {
        await Api.post('user/logout/', {}, {
            headers: {
                'Authorization': `Token ${user.token}`
            }
        })
        logout();
        navigate('/login');
        } catch {

        }
    }
    
    return (
        <div className='messge'>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1>Messages</h1>
            { user ? (
                <>
                    <p>Welcome, {user.user.username}!</p>
                    <button onClick={handleLogout}>Logout</button>
                </>
                ) : (
                    <p>You are not logged In</p>
                )
            }
            </div>

        <div id="chat-log" className='chat-log'></div><br />
            <div className='chat-message'>
            <input id="chat-message-input" type="text" size="100" className='chat-message-input' /><br />
            <input id="chat-message-submit" type="button" value="Send" className='chat-message-submit' />
        </div>
            
        </div>
    )
}

export default Messages