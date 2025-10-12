// client/src/components/AiChat.jsx
import React, { useState } from 'react';
import axios from 'axios';

// 简单的样式，你可以把它做得更漂亮
const chatWidgetStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '350px',
    maxHeight: '500px',
    border: '1px solid #ccc',
    borderRadius: '10px',
    backgroundColor: 'white',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
};

const chatHeaderStyle = {
    padding: '10px',
    backgroundColor: '#f1f1f1',
    borderBottom: '1px solid #ccc',
    cursor: 'pointer',
};

// ... 省略其他样式 ...

function AiChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([{ role: 'ai', content: '你好！有什么可以帮助你的吗？' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            // 注意！我们调用的是 Node.js 后端的接口
            const response = await axios.post('/api/ai/chat', { question: currentInput });
            const aiMessage = { role: 'ai', content: response.data.answer };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage = { role: 'ai', content: '抱歉，我现在有点忙，请稍后再试。' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return <button style={chatHeaderStyle} onClick={() => setIsOpen(true)}>AI 助手</button>;
    }

    return (
        <div style={chatWidgetStyle}>
            <div style={chatHeaderStyle} onClick={() => setIsOpen(false)}>
                <h4>AI 助手</h4>
            </div>
            {/* 聊天历史和输入框的 JSX ... */}
        </div>
    );
}
export default AiChat;