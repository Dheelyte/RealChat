import { useEffect, useState } from 'react';
import { Link, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Header from './Header';
import Search from './Search';
import Api from '../Api';
import seen from '../../images/seen.svg'
import unseen from '../../images/unseen.svg'
import userAvatar from '../../images/user2.svg'

const WS_DOMAIN = 'wss://reelchat.me/ws';

// const MAX_RETRIES = 3;

const Messages = () => {

    const { user, logout } = useAuth();
    const { username } = useParams();
    const [chats, setChats] = useState([]);
    const [notificationChat, setNotificationChat] = useState(null)
    // const [retryCount, setRetryCount] = useState(0);
    const [unread, setUnread] = useState(0)
    const [loading, setLoading ] = useState(true)
    const [error, setError] = useState(false)  

    useEffect(() => {
        if (user) {
            const connectStatusWebSocket = () => {
                const newSocket = new WebSocket(`${WS_DOMAIN}/status/?token=${user.token}`);
                newSocket.onclose = () => {
                    setTimeout(()=>{
                        connectStatusWebSocket();
                    }, 5000)
                }
            }
            connectStatusWebSocket();
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
                }
                try {
                    const unreadMesssages = await Api.get('/chat/unread/', {
                        headers: {
                            'Authorization': `Token ${user.token}`
                        }
                    })
                    setUnread(unreadMesssages.data.unread)
                } catch {
                }
            }
        }
        fetchChats();
    }, [user]);

    
    useEffect(() => {
        const connectReceiveNotificationWebSocket = () => {
            // if (retryCount >= MAX_RETRIES) {
            //     return;
            // }
            const newSocket = new WebSocket(`${WS_DOMAIN}/notification/receive/?token=${user.token}`);

            newSocket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                if (message.type === "notification") {
                    setNotificationChat(message)
                }
            }

            newSocket.onclose = () => {
                setTimeout(() => {
                    connectReceiveNotificationWebSocket();
                }, 5000)
            }
        };

        if (user) {
            connectReceiveNotificationWebSocket();
        }
    }, [user])

    /* eslint-disable */
    useEffect(() => {
        let chatId;
        if (notificationChat) {
            const utcTimestamp = new Date(notificationChat.timestamp);
            const localTimestamp = utcTimestamp.toLocaleString();

            const updatedChats = chats.map((chat) => {
                // Existing chat is updated here
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
            if (chat.id === chatId && chat.last_message.sender !== user.user.username) {
                return { ...chat, last_message: {...chat.last_message, seen: true}};
            }
            return chat;
        });
    
        setChats(updatedChats);
    };
    
    return (            
        <div className='container'>
            <div className={username ? 'chats-container responsive' : 'chats-container'}>
                <Header />
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