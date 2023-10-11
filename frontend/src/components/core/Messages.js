import { useEffect, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Search from './Search';
import Api from '../Api';
import seen from '../../images/seen.svg'
import unseen from '../../images/unseen.svg'
import user1 from '../../images/user1.svg'
import user2 from '../../images/user2.svg'
import user4 from '../../images/user4.svg'


const Messages = () => {
    //const navigate = useNavigate()
    const { user, logout } = useAuth();
    const [chats, setChats] = useState([])
    const [unread, setUnread] = useState(0)
    const [loading, setLoading ] = useState(true)

    const userImages = [user1, user2, user4];

    const randomImage = () => {
        const randomIndex = Math.floor(Math.random() * userImages.length);
        return userImages[randomIndex];
      };

    useEffect(() => {
        async function fetchChats () {
            if (user) {
                const chats = await Api.get('/chat/rooms/', {
                    headers: {
                        'Authorization': `Token ${user.token}`
                    }
                })
                setLoading(false)
                setChats(chats.data.data)

                const unreadMesssages = await Api.get('/chat/unread/', {
                    headers: {
                        'Authorization': `Token ${user.token}`
                    }
                })
                setUnread(unreadMesssages.data.unread)
            }
        }
        fetchChats();
    }, [user]);
    
    
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
                    <p className='welcome'>Welcome, {user.user.username}</p>

                    <Search />
                    
                    {loading && (<div class="custom-loader"></div>)}

                    {
                        chats.map(chat => {
                            const timestampFormat = {
                                hour: 'numeric',
                                minute: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour12: true
                            }
                            const formattedTimestamp = new Date(chat.last_message.timestamp).toLocaleString(undefined, timestampFormat)
                            return (
                                <div key={chat.id} className='chat-div'>
                                    <div className='chat-image'>
                                        <img src={randomImage()} alt='' />
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
                                                        <span className='seen'>{chat.last_message.seen ? (
                                                            <img src={seen} alt='' />
                                                        ) : (<img src={unseen} alt='' />)}</span>
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