import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import Api from '../Api';
import userImg from '../../images/user2.svg'
import send from '../../images/send.svg'
import options from '../../images/options.svg'
import useOnScreen from './onScreen';

const WS_DOMAIN = 'wss://reelchat.me/ws';

// const MAX_RETRIES = 3; // Define the maximum number of retries

const MessageDetail = () => {
    const { user } = useAuth();
    const params = useParams();
    const navigate = useNavigate()
    const other_user = params.username;

    const bottomRef = useRef(null);
    const messageInputRef = useRef(null);
    const chatLog = useRef(null);
    const isVisible = useOnScreen(bottomRef)

    const [chatSocket, setChatSocket] = useState(null);
    const [notificationSocket, setNotificationSocket] = useState(null);
    // const [retryChatCount, setRetryChatCount] = useState(0);
    // const [retryNotificationCount, setRetryNotificationCount] = useState(0);
    const [message, setMessage] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading ] = useState(true)
    const [typing, setTyping ] = useState(false)
    const [showOptions, setShowOptions ] = useState(false)
    const [previousMessageLoading, setPreviousMessageLoading] = useState(false)
    const [showPreviousMessage, setShowPreviousMessage] = useState(true)
    const [previousMessagePage, setPreviousMessagePage] = useState(2)
    const [online, setOnline] = useState(null)

    
    const scrollToLatestMessage = () => {
        if (isVisible) {
            bottomRef.current?.scrollIntoView({behavior: 'smooth'});
        }
    }
   
    /* eslint-disable */
    useEffect(() => {
        scrollToLatestMessage() 
    }, [messages, typing])

    useEffect(() => {
        const fetchData = async () => {
            try {
              const response = await Api.get(`chat/rooms/${other_user}/messages/`, {
                headers: {
                  'Authorization': `Token ${user.token}`
                }
              });
              setLoading(false)
              setMessages(response.data);
              scrollToLatestMessage();
            } catch (error) {
              console.error('Error fetching data:', error);
              setLoading(false)
            }
        }
        other_user && fetchData();
    }, [user, other_user]);
      

    useEffect(() => {
        const connectChatWebSocket = () => {
            // if (retryChatCount >= MAX_RETRIES) {
            //     return;
            // }
            const newSocket = new WebSocket(`${WS_DOMAIN}/chat/${other_user}/?token=${user.token}`)

            newSocket.onmessage = (event) => {
                // Handle WebSocket messages here
                const message = JSON.parse(event.data);
                if (message.type === "message") {
                    handleMessageReceived(message);
                }

                if (message.type === "typing" && message.sender !== user.user.username) {
                    handleTypingReceived(message);
                }
            };

            newSocket.onclose = () => {
                setTimeout(() => {
                    connectChatWebSocket();
                }, 5000)
            }
            //setChatSocket(newSocket);
            setChatSocket((prevSocket) => {
                if (prevSocket) {
                    prevSocket.close();
                }
                return newSocket;
            })
        };

        const handleMessageReceived = (message) => {
            setTyping(false)

            const utcTimestamp = new Date(message.timestamp);
            const localTimestamp = utcTimestamp.toLocaleString();
            const newMessage = {
                text: message.text,
                sender: message.sender, // You may want to adjust this based on your data
                timestamp: localTimestamp
            };

            setMessages((prevMessages) => [newMessage, ...prevMessages]);
            scrollToLatestMessage()
        };

        let handleSetTyping
        const handleTypingReceived = () => {
            setTyping(true)
            scrollToLatestMessage()
            clearTimeout(handleSetTyping)
            handleSetTyping = setTimeout(() => {
                setTyping(false)
            }, 5000)
        }

        // Connect to WebSocket when user becomes available (not null)
        if (user && other_user) {
            connectChatWebSocket();
        }
    }, [user, other_user]);

    
    useEffect(() => {
        const connectSendNotificationWebSocket = () => {
            // if (retryNotificationCount >= MAX_RETRIES) {
            //     return;
            // }
            const newSocket = new WebSocket(`${WS_DOMAIN}/notification/send/${other_user}/?token=${user.token}`)

            newSocket.onclose = () => {
                setTimeout(() => {
                    connectSendNotificationWebSocket();
                }, 5000)
            }
            
            setNotificationSocket((prevSocket) => {
                if (prevSocket) {
                    prevSocket.close();
                }
                return newSocket;
            })
        };

        if (user && other_user) {
            connectSendNotificationWebSocket();
        }
    }, [user, other_user])


    useEffect(() => {
        const getOnlineStatus = async () => {
            try {
                const response = await Api.get(`user/online/${other_user}/`, {
                headers: {
                    'Authorization': `Token ${user.token}`
                }
                });
                setOnline(response.data.online)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
        if (user && other_user) {
            getOnlineStatus();
        }
    }, [user, other_user])
    

    const handleInputChange = (event) => {
        setMessage(event.target.value);

        const sendTyping = setTimeout(async () => {
            if (chatSocket) {
                await chatSocket.send(
                    JSON.stringify({
                        type: 'typing',
                        sender: user.user.username,
                    })
                );
            }
        }, 2000)
        return () => clearTimeout(sendTyping)
    }

    const handleInputKeyUp = () => {
        if (messageInputRef.current.scrollHeight <= 150) {
            messageInputRef.current.style.height = 'auto';
            messageInputRef.current.style.height = `${messageInputRef.current.scrollHeight}px`;
        }
    }

    const handleSendMessage = async () => {
        if (chatSocket && message.trim() !== "") {
            await chatSocket.send(
                JSON.stringify({
                    type: 'message',
                    text: message,
                    sender: user.user.username,
                })
            );
            messageInputRef.current.value = ""
            messageInputRef.current.style.height = 'auto';
        }

        if (notificationSocket && message.trim() !== "") {
            await notificationSocket.send(
                JSON.stringify({
                    type: 'notification',
                    text: message,
                    sender: user.user.username,
                })
            )
        }
    };

    const handlePreviousMessages = async () => {
        try {
            setPreviousMessageLoading(true)
            await new Promise(r => setTimeout(r, 5000))
            const response = await Api.get(`chat/rooms/${other_user}/messages/?page=${previousMessagePage}`, {
                headers: {
                    'Authorization': `Token ${user.token}`
                }
            })
            setPreviousMessageLoading(false)
            if (response.data.length === 0) {
                setShowPreviousMessage(false)
            } else {
                setMessages(prevMessages => [...prevMessages, ...response.data])
                setPreviousMessagePage(prev => prev + 1);
            }
        } catch {
            setPreviousMessageLoading(false)
        }
    }

    const handleReportUser = async () => {
        handleShowOptions()
        try {
            const response = await Api.post(`user/report/${other_user}/`, {}, {
              headers: {
                'Authorization': `Token ${user.token}`
              }
            });
          } catch (error) {
            console.error('Error fetching data:', error);
          }
    }

    const handleShowOptions = () => {
        setShowOptions(prev => !prev)
    }

    const handleGoBack = () => {
        navigate('/');
    }

    return (
        <>
            <div className='user-header'>
                <div className='user-header-title'>
                    <span onClick={handleGoBack} className='back'>‹</span>
                    <div className='search-image-div'>
                        <img src={userImg} alt="" />
                    </div>
                    <div className='user-online'>
                        <h3>{other_user}</h3>
                        <span>{online !== null && (online ? "online" : "offline")}</span>
                    </div>
                </div>
                <div onClick={handleShowOptions} className='header-options'>
                    <img src={options} alt='' />
                </div>
                {
                    showOptions && (
                    <div className='header-action'>
                        <li onClick={handleReportUser}>Report</li>
                    </div>)
                }
            </div>

            <div ref={chatLog} className='chat-log'>
                { loading && <div className="custom-loader"></div> }
                
                { messages.length >= 30 && showPreviousMessage && (
                    <div className="previous-container">
                        <div onClick={handlePreviousMessages} className='previous'>
                            { previousMessageLoading ? <div className="custom-loader custom-loader-2"></div> : "⯅ Load more"}
                        </div>
                    </div>
                    )
                }

                {
                    messages.toReversed().map((message, index) => {
                        const textStyle = message.sender === user.user.username ? "message sent" : "message received";
                        const timestamp = new Date(message.timestamp)
                        let timestampFormat = {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                        }
                        let oneDayBefore = new Date()
                        oneDayBefore.setDate(oneDayBefore.getDate() - 1)
                        if (timestamp <= oneDayBefore){
                            timestampFormat['month'] = 'short';
                            timestampFormat['day'] = 'numeric';
                        }
                        
                        const formattedTimestamp = timestamp.toLocaleString(undefined, timestampFormat)
                        return (
                            <div key={index} className={textStyle}>
                                <p>{message.text}</p>
                                <small>{formattedTimestamp}</small>
                            </div>
                        )
                    })
                }
                {
                    typing && (
                        <div className="message received typing">
                            <div className="typing__dot"></div>
                            <div className="typing__dot"></div>
                            <div className="typing__dot"></div>
                        </div>
                    )
                }
                <div ref={bottomRef} className='bottom-ref' />
            </div>
            <div className='chat-message'>
                <textarea
                    onChange={handleInputChange}
                    ref={messageInputRef}
                    onKeyUp={handleInputKeyUp}
                    type="text"
                    placeholder='Type a message...'
                    className='chat-message-input'
                    rows="1"
                />
                <button onClick={handleSendMessage} id="chat-message-submit" type="button" className='chat-message-submit'>
                    <img src={send} alt='' />
                </button>
            </div>
        </>
    );
};

export default MessageDetail;