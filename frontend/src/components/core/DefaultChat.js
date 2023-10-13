import icon from '../../images/chat-icon.svg'

const DefaultChat = () => {
    return (
        <div className="default-container">
            <div className="center">
                <img src={icon} alt='' />
                <h2>Select a chat</h2>
                <p>Click a chat on the side panel to show its messages here</p>
            </div>
        </div>
        
    )
}

export default DefaultChat;