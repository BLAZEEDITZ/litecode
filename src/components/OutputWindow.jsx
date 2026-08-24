import React, { useState, useRef, useEffect } from 'react'
import { langMap } from "../constants/languageOptions";

const OutputWindow = ({ outputDetails, offlineStatus, customInput, setCustomInput }) => {
    const [activeTab, setActiveTab] = useState('output');
    const outputRef = useRef(null);

    // Auto-switch to output tab when new output arrives
    useEffect(() => {
        if (outputDetails) {
            setActiveTab('output');
        }
    }, [outputDetails]);

    // Auto-scroll output to bottom
    useEffect(() => {
        if (outputRef.current && activeTab === 'output') {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [outputDetails, activeTab]);

    const getOutput = () => {
        if (!outputDetails) return null;

        // Handle OneCompiler API response format
        if (outputDetails.status !== undefined) {
            // Check for compilation/runtime errors (stderr)
            if (outputDetails.stderr && outputDetails.stderr.trim() !== "") {
                return (
                    <pre className="terminal-output terminal-error">
                        {outputDetails.stderr}
                    </pre>
                );
            }
            
            // Check for successful output (stdout)
            if (outputDetails.stdout && outputDetails.stdout.trim() !== "") {
                return (
                    <pre className="terminal-output terminal-success">
                        {outputDetails.stdout}
                    </pre>
                );
            }
            
            // Check for exception
            if (outputDetails.exception) {
                return (
                    <pre className="terminal-output terminal-error">
                        Exception: {outputDetails.exception}
                    </pre>
                );
            }

            // No output at all
            return (
                <pre className="terminal-output terminal-warning">
                    (No output)
                </pre>
            );
        }

        // Handle old OneCompiler format (output property)
        if (outputDetails.output !== undefined) {
            if (outputDetails.error) {
                return (
                    <pre className="terminal-output terminal-error">
                        {outputDetails.error}
                    </pre>
                );
            } else if (outputDetails.output && outputDetails.output.trim() !== "") {
                return (
                    <pre className="terminal-output terminal-success">
                        {outputDetails.output}
                    </pre>
                );
            }
        }

        // Handle Judge0 API response format
        if (outputDetails.language && langMap[outputDetails.language]) {
            if (outputDetails.error) {
                return (
                    <pre className="terminal-output terminal-error">
                        {outputDetails.error}
                    </pre>
                );
            } else {
                return (
                    <pre className="terminal-output terminal-success">
                        {outputDetails.output}
                    </pre>
                );
            }
        } else if (outputDetails.status?.id) {
            let statusId = outputDetails.status.id;

            if (statusId === 6) {
                return (
                    <pre className="terminal-output terminal-error">
                        {atob(outputDetails?.compile_output)}
                    </pre>
                );
            } else if (statusId === 3) {
                return (
                    <pre className="terminal-output terminal-success">
                        {atob(outputDetails.stdout) || "No output"}
                    </pre>
                );
            } else if (statusId === 5) {
                return (
                    <pre className="terminal-output terminal-error">
                        Time Limit Exceeded
                    </pre>
                );
            }
        }

        return (
            <pre className="terminal-output terminal-muted">
                Unable to parse output format
            </pre>
        );
    };

    return (
        <div className="terminal-panel">
            {/* Terminal Header */}
            <div className="terminal-header">
                <div className="terminal-tabs">
                    <button 
                        className={`terminal-tab ${activeTab === 'output' ? 'active' : ''}`}
                        onClick={() => setActiveTab('output')}
                    >
                        <span className="terminal-tab-icon">?</span>
                        Output
                        {outputDetails && (
                            <span className={`terminal-tab-dot ${
                                outputDetails.stderr && outputDetails.stderr.trim() ? 'dot-error' : 'dot-success'
                            }`} />
                        )}
                    </button>
                    <button 
                        className={`terminal-tab ${activeTab === 'input' ? 'active' : ''}`}
                        onClick={() => setActiveTab('input')}
                    >
                        <span className="terminal-tab-icon">?</span>
                        Input
                        {customInput && customInput.trim() && (
                            <span className="terminal-tab-dot dot-info" />
                        )}
                    </button>
                </div>
                <div className="terminal-status">
                    {offlineStatus ? (
                        <span className="status-badge status-offline">
                            <span className="status-dot">?</span>
                            Offline
                        </span>
                    ) : (
                        <span className="status-badge status-online">
                            <span className="status-dot">?</span>
                            Online
                        </span>
                    )}
                </div>
            </div>

            {/* Terminal Body */}
            <div className="terminal-body">
                {activeTab === 'output' ? (
                    <div className="terminal-output-pane" ref={outputRef}>
                        {outputDetails ? (
                            getOutput()
                        ) : (
                            <span className="output-placeholder">
                                Run your code to see the output here...
                            </span>
                        )}
                    </div>
                ) : (
                    <div className="terminal-input-pane">
                        <textarea
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="Enter your stdin input here before running the code..."
                            className="terminal-input-textarea"
                            spellCheck={false}
                        />
                        <div className="terminal-input-hint">
                            <span className="hint-icon">??</span>
                            Add your input here, then switch to Output tab and run your code
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default OutputWindow