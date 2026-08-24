import React, { useEffect, useRef } from 'react';
import { FaPlay, FaTimes } from 'react-icons/fa';
import './inputModal.css';

const InputModal = ({ isOpen, onClose, onSubmit, customInput, setCustomInput }) => {
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="input-modal-overlay">
            <div className="input-modal-container">
                <div className="input-modal-header">
                    <h3>Program Requires Input</h3>
                    <button onClick={onClose} className="input-modal-close">
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
                    <button onClick={onClose} className="input-modal-btn cancel-btn">
                        Cancel
                    </button>
                    <button onClick={onSubmit} className="input-modal-btn run-btn">
                        <FaPlay fontSize={12} /> Run Code
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputModal;