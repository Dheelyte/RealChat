import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import Api from '../Api';
import send from '../../images/send.svg'
import options from '../../images/options.svg'

const MessageDetail = () => {
    const { user } = useAuth();
    const params = useParams();
    const navigate = useNavigate()
    const other_user = params.username;

    const bottomRef = useRef(null);
    const messageInputRef = useRef(null);

    const [chatSocket, setChatSocket] = useState(null);
    const [message, setMessage] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading ] = useState(true)
    const [typing, setTyping ] = useState(false)
    const [showOptions, setShowOptions ] = useState(false)
    const [previousMessageLoading, setPreviousMessageLoading] = useState(false)
    const [showPreviousMessage, setShowPreviousMessage] = useState(true)
    const [previousMessagePage, setPreviousMessagePage] = useState(2)
    const [online, setOnline] = useState(null)

    const MAX_RETRIES = 3; // Define the maximum number of retries

    // messageInputRef.current?.focus();
    
    const scrollToLatestMessage = () => bottomRef.current?.scrollIntoView({behavior: 'smooth'});
   
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
            }
        }
        other_user && fetchData();
    }, [user, other_user]);
      

    useEffect(() => {
        const connectWebSocket = (token, other_user, retryCount = 0) => {
            const newSocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${other_user}/?token=${token}`);

            newSocket.onopen = () => {
                console.log('Connected to WebSocket!');
                return;
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
                if (message.type === "message") {
                    handleMessageReceived(message);
                }

                if (message.type === "typing" && message.sender !== user.user.username) {
                    handleTypingReceived(message);
                }
            };

            // Set chatSocket using a functional update
            setChatSocket((prevSocket) => {
                if (prevSocket) {
                    prevSocket.close(); // Close the previous socket if it exists
                }
                return newSocket;
            });

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
                console.log(handleSetTyping)
                clearTimeout(handleSetTyping)
                handleSetTyping = setTimeout(() => {
                    setTyping(false)
                }, 5000)
            }
        };

        // Connect to WebSocket when user becomes available (not null)
        if (user) {
            connectWebSocket(user.token, other_user);
            console.log(user);
        }
    }, [user, other_user]);


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

    const handleSendMessage = async () => {
        console.log(message)

        if (chatSocket && message.trim() !== "") {
            await chatSocket.send(
                JSON.stringify({
                    type: 'message',
                    text: message,
                    sender: user.user.username,
                })
            );
            messageInputRef.current.value = ""
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
            console.log(response.data)
          } catch (error) {
            console.error('Error fetching data:', error);
          }
    }

    const handleShowOptions = () => {
        setShowOptions(prev => !prev)
    }

    const handleGoBack = () => {
        navigate(-1);
    }

    return (
        <div className='messages-container'>
            <div className='user-header'>
                <div className='user-header-title'>
                    <span onClick={handleGoBack} className='back'>‹</span>
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

            <div id="chat-log" className='chat-log'>
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
                        //const timestampStyle = message.sender === user.user.username ? "timestamp-sent" : "timestamp-received";
                        const timestampFormat = {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                        }
                        const formattedTimestamp = new Date(message.timestamp).toLocaleString(undefined, timestampFormat)
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
                            <p>Typing...</p>
                        </div>
                    )
                }
                <div ref={bottomRef} className='bottom-ref' />
            </div>
            <div className='chat-message'>
                <input onChange={handleInputChange} ref={messageInputRef} id="chat-message-input" type="text" placeholder='Type a message...' className='chat-message-input' />
                <button onClick={handleSendMessage} id="chat-message-submit" type="button" className='chat-message-submit'>
                    <img src={send} alt='' />
                </button>
            </div>
        </div>
    );
};

export default MessageDetail;