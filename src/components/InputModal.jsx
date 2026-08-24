import React, { useEffect, useRef, useState } from 'react';
import { FaPlay, FaTimes } from 'react-icons/fa';
import './inputModal.css';

const InputModal = ({ isOpen, onClose, onSubmit, customInput, setCustomInput }) => {
    const inputRef = useRef(null);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setIsClosing(false);
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
        }, 250); // Matches the closing animation duration
    };

    const handleSubmit = () => {
        setIsClosing(true);
        setTimeout(() => {
            onSubmit();
            setIsClosing(false);
        }, 250);
    };

    if (!isOpen && !isClosing) return null;

    return (
        <div className={`input-modal-overlay ${isClosing ? 'closing' : ''}`}>
            <div className={`input-modal-container ${isClosing ? 'closing' : ''}`}>
                <div className="input-modal-header">
                    <h3>Program Requires Input</h3>
                    <button onClick={handleClose} className="input-modal-close">
                        <FaTimes />
                    </button>
                </div>
                <div className="input-modal-body">
                    <p className="input-modal-hint">
                        We detected that your code reads input (e.g. <code>input()</code> or <code>cin</code>). 
                        Please provide the standard input below before execution:
                    </p>
                    <textarea
                        ref={inputRef}
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Enter input data here..."
                        className="input-modal-textarea"
                        spellCheck={false}
                    />
                </div>
                <div className="input-modal-footer">
                    <button onClick={handleClose} className="input-modal-btn cancel-btn">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="input-modal-btn run-btn">
                        <FaPlay fontSize={12} /> Run Code
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputModal;