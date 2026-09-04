import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaTimes, FaPaperPlane, FaRobot, FaUser, FaGripLines } from 'react-icons/fa';
import './aiChatbot.css';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are LiteCode AI, a helpful coding assistant built into the LiteCode online IDE. You help users with:
- Writing, debugging, and explaining code in 40+ languages
- HTML, CSS, JavaScript for web development
- Algorithm design and data structures
- Best practices and code optimization
Keep responses concise and use code blocks with language tags when showing code. Be friendly and encouraging.`;

const AIChatbot = ({ visible, onDismiss }) => {
    const [chatOpen, setChatOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Hey! I\'m **LiteCode AI**. Ask me anything about coding!' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [size, setSize] = useState({ width: 380, height: 500 });
    const [ballPos, setBallPos] = useState({ x: null, y: null });
    const [isDraggingBall, setIsDraggingBall] = useState(false);
    const [ballDismissing, setBallDismissing] = useState(false);

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);
    const messagesRef = useRef(null);
    const resizingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

    // Auto-scroll chat
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, loading]);

    // Focus input when chat opens
    useEffect(() => {
        if (chatOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [chatOpen]);

    // Send message to Gemini
    const sendMessage = useCallback(async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', text: input.trim() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const contents = [
                { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
                { role: 'model', parts: [{ text: 'Understood! I am LiteCode AI, ready to help with coding.' }] },
            ];

            newMessages.forEach(m => {
                contents.push({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                });
            });

            const res = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents })
            });

            const data = await res.json();
            const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t process that. Please try again.';
            setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
        } catch (err) {
            console.error('Gemini API error:', err);
            setMessages(prev => [...prev, { role: 'ai', text: 'Oops! Something went wrong. Check your internet connection.' }]);
        }

        setLoading(false);
    }, [input, loading, messages]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Chat open/close with animation
    const openChat = () => {
        setIsClosing(false);
        setChatOpen(true);
    };

    const closeChat = () => {
        setIsClosing(true);
        setTimeout(() => {
            setChatOpen(false);
            setIsClosing(false);
        }, 250);
    };

    // Dismiss floating ball
    const dismissBall = (e) => {
        e.stopPropagation();
        setBallDismissing(true);
        setTimeout(() => {
            onDismiss();
            setBallDismissing(false);
        }, 300);
    };

    // Ball dragging
    const onBallMouseDown = (e) => {
        if (e.target.closest('.chatball-close')) return;
        setIsDraggingBall(true);
        const rect = e.currentTarget.getBoundingClientRect();
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            startX: rect.left,
            startY: rect.top
        };
    };

    useEffect(() => {
        if (!isDraggingBall) return;
        const onMove = (e) => {
            const dx = e.clientX - dragStartRef.current.x;
            const dy = e.clientY - dragStartRef.current.y;
            setBallPos({
                x: dragStartRef.current.startX + dx,
                y: dragStartRef.current.startY + dy
            });
        };
        const onUp = () => setIsDraggingBall(false);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        return () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
    }, [isDraggingBall]);

    // Resize handler
    const onResizeMouseDown = (e) => {
        e.preventDefault();
        resizingRef.current = true;
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = size.width;
        const startH = size.height;

        const onMove = (ev) => {
            if (!resizingRef.current) return;
            const newW = Math.max(300, Math.min(700, startW + (ev.clientX - startX)));
            const newH = Math.max(350, Math.min(800, startH + (ev.clientY - startY)));
            setSize({ width: newW, height: newH });
        };
        const onUp = () => {
            resizingRef.current = false;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    // Fallback copy for non-HTTPS contexts
    const copyToClipboard = useCallback((text) => {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }, []);

    // Event delegation for copy buttons (inline onclick doesn't work in dangerouslySetInnerHTML)
    useEffect(() => {
        const container = messagesRef.current;
        if (!container) return;

        const handleClick = (e) => {
            const btn = e.target.closest('.chat-copy-btn');
            if (!btn) return;

            const wrapper = btn.closest('.chat-code-wrapper');
            if (!wrapper) return;

            const codeEl = wrapper.querySelector('pre code');
            if (!codeEl) return;

            copyToClipboard(codeEl.innerText);
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = 'Copy Code';
                btn.classList.remove('copied');
            }, 2000);
        };

        container.addEventListener('click', handleClick);
        return () => container.removeEventListener('click', handleClick);
    }, [chatOpen, copyToClipboard]);

    // Format AI messages with basic markdown
    const formatMessage = (text) => {
        // Code blocks with copy button (no onclick needed - handled by event delegation)
        let formatted = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
            return '<div class="chat-code-wrapper"><button class="chat-copy-btn">Copy Code</button><pre class="chat-code-block"><code>' + code.trim() + '</code></pre></div>';
        });
        // Inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>');
        // Bold
        formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br/>');
        return formatted;
    };

    if (!visible) return null;

    const ballStyle = ballPos.x !== null ? {
        position: 'fixed',
        left: ballPos.x,
        top: ballPos.y,
        bottom: 'auto',
        right: 'auto'
    } : {};

    return (
        <>
            {/* Floating Ball */}
            {!chatOpen && !isClosing && (
                <div
                    className={`chatbot-ball ${ballDismissing ? 'dismissing' : ''}`}
                    style={ballStyle}
                    onMouseDown={onBallMouseDown}
                    onClick={() => { if (!isDraggingBall) openChat(); }}
                    title="Open LiteCode AI"
                >
                    <FaRobot className="chatbot-ball-icon" />
                    <div className="chatbot-ball-pulse" />
                    <button className="chatball-close" onClick={dismissBall} title="Dismiss">
                        <FaTimes fontSize={8} />
                    </button>
                </div>
            )}

            {/* Chat Window */}
            {(chatOpen || isClosing) && (
                <div
                    className={`chatbot-window ${isClosing ? 'closing' : ''}`}
                    style={{ width: size.width, height: size.height }}
                >
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-left">
                            <FaRobot className="chatbot-header-icon" />
                            <span className="chatbot-header-title">LiteCode AI</span>
                            <span className="chatbot-header-badge">Beta</span>
                        </div>
                        <button className="chatbot-header-close" onClick={closeChat}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages" ref={messagesRef}>
                        {messages.map((msg, i) => (
                            <div key={i} className={`chatbot-msg ${msg.role}`}>
                                <div className="chatbot-msg-avatar">
                                    {msg.role === 'ai' ? <FaRobot /> : <FaUser />}
                                </div>
                                <div
                                    className="chatbot-msg-bubble"
                                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
                                />
                            </div>
                        ))}
                        {loading && (
                            <div className="chatbot-msg ai">
                                <div className="chatbot-msg-avatar"><FaRobot /></div>
                                <div className="chatbot-msg-bubble typing">
                                    <span className="dot" /><span className="dot" /><span className="dot" />
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chatbot-input-bar">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask me anything..."
                            className="chatbot-input"
                            rows={1}
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || loading}
                            className="chatbot-send-btn"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>

                    {/* Resize Handle */}
                    <div className="chatbot-resize-handle" onMouseDown={onResizeMouseDown}>
                        <FaGripLines fontSize={10} />
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatbot;