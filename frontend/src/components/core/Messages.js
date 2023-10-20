import { useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Search from './Search';
import Api from '../Api';
import seen from '../../images/seen.svg'
import unseen from '../../images/unseen.svg'
import userAvatar from '../../images/user2.svg'

const MAX_RETRIES = 3;

const Messages = () => {

    const { user, logout } = useAuth();
    const { username } = useParams();
    const [chats, setChats] = useState([]);
    const [notificationChat, setNotificationChat] = useState(null)
    const [retryCount, setRetryCount] = useState(0);
    const [unread, setUnread] = useState(0)
    const [loading, setLoading ] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        console.log('Effect chats', chats)
        console.log('chats has been changed')
    }, [chats])

    console.log('Re-render chats', chats)
    

    useEffect(() => {
        if (user) {
            const newSocket = new WebSocket(`ws://127.0.0.1:8000/ws/status/?token=${user.token}`);
            newSocket.onopen = () => {
                console.log('Connected to Status WebSocket!');
            };
        }
    }, [user])
    
    useEffect(() => {
        async function fetchChats () {
            if (user) {
                try {
                    const chats = await Api.get('/chat/rooms/', {
                        headers: {
                            'Authorization': `Token ${user.token}`
                        }
                    })
                    setLoading(false)
                    setChats(chats.data)
                } catch {
                    setLoading(false)
                    setError(true)
                    console.log('An error occurred')
                }

                try {
                    const unreadMesssages = await Api.get('/chat/unread/', {
                        headers: {
                            'Authorization': `Token ${user.token}`
                        }
                    })
                    setUnread(unreadMesssages.data.unread)
                } catch {
                    console.log('An error occurred')
                }
            }
        }
        fetchChats();
    }, [user]);

    
    useEffect(() => {
        const connectReceiveNotificationWebSocket = () => {
            console.log('RETRY COUNT', retryCount);
            if (retryCount >= MAX_RETRIES) {
                console.log("Max retries reached, giving up.");
                return;
            }
            const newSocket = new WebSocket(`ws://127.0.0.1:8000/ws/notification/receive/?token=${user.token}`);
            
            newSocket.onopen = () => {
                console.log('Connected to Notification WebSocket!');
                setRetryCount(0);
            };

            newSocket.onerror = () => {
                console.log('Websocket error')
            }

            newSocket.onclose = () => {
                console.log(`WebSocket connection closed. Retrying...`);
                setRetryCount(retryCount + 1);
                //connectSendNotificationWebSocket();
            }

            newSocket.onmessage = (event) => {
                console.log('New notification message');
                const message = JSON.parse(event.data);
                if (message.type === "notification") {
                    setNotificationChat(message)
                }
            }
        };

        if (user) {
            connectReceiveNotificationWebSocket();
            console.log(user);
        }
    }, [user, retryCount])

    /* eslint-disable */
    useEffect(() => {
        let chatId;
        if (notificationChat) {
            const utcTimestamp = new Date(notificationChat.timestamp);
            const localTimestamp = utcTimestamp.toLocaleString();

            const updatedChats = chats.map((chat) => {
                // Existing chat is updated here
                console.log('updating chat')
                if (chat.other_user.username === notificationChat.sender && notificationChat.sender !== username) {
                    chatId = chat.id;
                    return {
                        ...chat,
                        last_message: {
                            text: notificationChat.text,
                            timestamp: localTimestamp,
                            seen: false,
                            sender: notificationChat.sender,
                        },
                    };
                }
                return chat;
            });

            if (!chatId && notificationChat.sender !== username) {
                const newNotificationChat = {
                    id: chatId,
                    other_user: {
                        username: notificationChat.sender,
                    },
                    last_message: {
                        text: notificationChat.text,
                        timestamp: notificationChat.timestamp,
                        seen: false,
                        sender: notificationChat.sender,
                    }
                };
                updatedChats.unshift(newNotificationChat); // Here, a new chat object is pushed into the array.
            }

            setChats(updatedChats);
        }
    }, [notificationChat])


    const handleChatClick = (chatId) => {
        // Mark the chat as read by updating its state
        const updatedChats = chats.map((chat) => {
            if (chat.id === chatId && chat.last_message.seen === false && chat.last_message.sender !== user.user.username) {
                // Decrease the unread count by one
                setUnread(prev => prev - 1);
            }
            if (chat.id === chatId) {
                return { ...chat, last_message: {...chat.last_message, seen: true}};
            }
            return chat;
        });
    
        setChats(updatedChats);
    };
    
    return (            
        <div className='container'>
            <div className={username ? 'chats-container responsive' : 'chats-container'}>
                <div className='title-unread-div'>
                    <h1>Chats</h1>
                    {
                        unread !== 0 &&
                        <span className='unread'>{unread}</span>
                    }
                </div>
                {!<button onClick={logout}>Log out</button>}
                { user && <p className='welcome'>Welcome, {user.user.username}</p>}

                <Search />
                
                {loading && (<div className="custom-loader"></div>)}

                {chats.length === 0 && !loading && !error &&
                    <div className='no-chats'>You have no chats. Search for a user to start chatting.</div>
                }

                {
                    chats.map(chat => {
                        // eslint-disable-next-line
                        if (chat.last_message.text === "") return;
                        const timestampFormat = {
                            hour: 'numeric',
                            minute: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour12: false
                        }
                        const formattedTimestamp = new Date(chat.last_message.timestamp)
                        .toLocaleString(undefined, timestampFormat)
                        const truncatedText = chat.last_message.text.length <= 17 ? chat.last_message.text : chat.last_message.text.slice(0, 15) + "..."
                        return (
                            <div key={chat.id} className='chat-div' onClick={() => handleChatClick(chat.id)}>
                                <div className='chat-image'>
                                    <img src={userAvatar} alt='' />
                                </div>
                                <div className='chat-details'>
                                    <p className='chat-user'>{chat.other_user.username}</p>
                                    <div className='chat-meta'>
                                        {
                                            chat.last_message.text && (
                                            <div className='last-message'>
                                                <p className='text'>{truncatedText}</p>
                                                <div className='last-message-time-seen'>
                                                    <span className='time'>{chat.last_message.timestamp && formattedTimestamp}</span>
                                                    {
                                                        chat.last_message.sender === user.user.username ? (
                                                        <span className='seen'>
                                                            {
                                                                chat.last_message.seen ? 
                                                                (<img src={seen} alt='' />) :
                                                                (<img src={unseen} alt='' />)
                                                            }
                                                        </span>) : (
                                                            !chat.last_message.seen && <span className='unseen'></span>
                                                        )
                                                    }
                                                </div>
                                            </div>
                                            )
                                        }
                                    </div>
                                </div>
                                <Link className='chat-link' to={chat.other_user.username}></Link>
                            </div>
                        )
                    })
                }
            </div>
            <div className={username ? "messages-container" : "messages-container responsive"}>
                <Outlet />
            </div>
        </div>
    )
}

export default Messages;