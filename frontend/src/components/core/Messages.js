import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Search from './Search';
import Api from '../Api';
import seen from '../../images/seen.svg'
import unseen from '../../images/unseen.svg'
import userAvatar from '../../images/user2.svg'


const Messages = () => {

    const { user, logout } = useAuth();
    const [chats, setChats] = useState([])
    const [unread, setUnread] = useState(0)
    const [loading, setLoading ] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        if (user) {
            const newSocket = new WebSocket(`ws://127.0.0.1:8000/ws/status/?token=${user.token}`);
            newSocket.onopen = () => {
                console.log('Connected to WebSocket!');
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

    const handleChatClick = (chatId) => {
        // Mark the chat as read by updating its state
        const updatedChats = chats.map((chat) => {
          if (chat.id === chatId) {
            return { ...chat, last_message: {...chat.last_message, seen: true}};
          }
          return chat;
        });
    
        setChats(updatedChats);
    };
    
    return (
        <>
            
            <div className='container'>
                <div className='chats-container'>
                    <div className='title-unread-div'>
                        <h1>Chats</h1>
                        {
                            //unread !== 0 &&
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
                            const timestampFormat = {
                                hour: 'numeric',
                                minute: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour12: true
                            }
                            const formattedTimestamp = new Date(chat.last_message.timestamp)
                            .toLocaleString(undefined, timestampFormat)
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
                                                    <p className='text'>{chat.last_message.text}</p>
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
                <Outlet />
            </div>
        </>
    )
}

export default Messages