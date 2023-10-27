import React, { createContext, useContext, useState } from 'react';

// Create a context to manage chat data
const ChatContext = createContext();

export function useChatContext() {
  return useContext(ChatContext);
}

export function ChatProvider({ children }) {
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state

  const setChat = (chatId) => {
    // Fetch chat data based on chatId here if needed
    setSelectedChat(chatId);
    if (chatId) setLoading(false); // Set loading to false when authentication check is done
  };

  return (
    <ChatContext.Provider value={{ selectedChat, setChat }}>
      {!loading && (
        // Render the children only when authentication check is complete
        children
      )}
    </ChatContext.Provider>
  );
}
