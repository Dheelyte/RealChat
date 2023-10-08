import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Api from '../Api';

const MessageDetail = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const params = useParams();
    const other_user = params.username;
    console.log(params.username);

    const MAX_RETRIES = 3; // Define the maximum number of retries
    const [message, setMessage] = useState(null)
    const [messages, setMessages] = useState([])

    useEffect(() => {
        const connectWebSocket = (token, other_user, retryCount = 0) => {
            const newSocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${other_user}/?token=${token}`);
            newSocket.onopen = () => {
                console.log('Connected to WebSocket!');
            };
            newSocket.onclose = () => {
                console.log('WebSocket connection closed.');
                if (retryCount < MAX_RETRIES) {
                    // Retry the connection after a delay (e.g., 3 seconds)
                    setTimeout(() => {
                        console.log(`Retrying WebSocket connection (Attempt ${retryCount + 1})...`);
                        connectWebSocket(token, other_user, retryCount + 1);
                    }, 1000); // 3 seconds delay, adjust as needed
                }
            };

            newSocket.onmessage = (event) => {
                // Handle WebSocket messages here
                const message = JSON.parse(event.data);
                handleMessageReceived(message);
                console.log(message)
                
            };

            // Set chatSocket using a functional update
            setChatSocket((prevSocket) => {
                if (prevSocket) {
                    prevSocket.close(); // Close the previous socket if it exists
                }
                return newSocket;
            });
        };

        // Connect to WebSocket when user becomes available (not null)
        if (user) {
            connectWebSocket(user.token, other_user);
            console.log(user);
        }
    }, [user, other_user]);

    const [chatSocket, setChatSocket] = useState(null);

    const handleInputChange = (event) => {
        setMessage(event.target.value)
    }

    const handleMessageReceived = (message) => {
        const utcTimestamp = new Date(message.timestamp);
        const localTimestamp = utcTimestamp.toLocaleString();

        const newMessage = {
            text: message.text,
            sender: message.sender, // You may want to adjust this based on your data
            timestamp: localTimestamp
        };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    const handleSendMessage = async () => {
        console.log(message)
        if (chatSocket) {
            chatSocket.send(
                JSON.stringify({
                    type: 'message',
                    text: message,
                    sender: user.user.username,
                })
            );
        }
    };

    const handleLogout = async () => {
        if (chatSocket) {
            chatSocket.close();
        }
        try {
            await Api.post('user/logout/', {}, {
                headers: {
                    Authorization: `Token ${user.token}`,
                },
            });
            logout();
            navigate('/login');
        } catch (error) {
            // Handle error
        }
    };

    return (
        <div className='messge'>
            <div className='messge'>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>{other_user}</h1>
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

        <div id="chat-log" className='chat-log'>
            {
                messages.map(message => {
                    const textStyle = message.sender === user.user.username ? "message message-sent" : "message message-received";
                    const timestampStyle = message.sender === user.user.username ? "timestamp-sent" : "timestamp-received";
                    
                    return (
                        <>
                            <p className={textStyle}>{message.text}</p>
                            <p className={timestampStyle}>{message.timestamp}</p>
                        </>
                    )
                })
            }
        </div><br />
        <div className='chat-message'>
            <input onChange={handleInputChange} id="chat-message-input" type="text" size="100" className='chat-message-input' /><br />
            <input onClick={handleSendMessage} id="chat-message-submit" type="button" value="Send" className='chat-message-submit' />
        </div>
            
        </div>
        </div>
    );
};

export default MessageDetail;