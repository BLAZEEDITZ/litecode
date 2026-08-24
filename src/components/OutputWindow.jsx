import React, { useRef, useEffect } from 'react'
import { langMap } from "../constants/languageOptions";
import { FaTerminal } from 'react-icons/fa';

const OutputWindow = ({ outputDetails, offlineStatus }) => {
    const outputRef = useRef(null);

    // Auto-scroll output to bottom
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [outputDetails]);

    const getOutput = () => {
        if (!outputDetails) return null;

        // Handle OneCompiler API response format
        if (outputDetails.status !== undefined) {
            if (outputDetails.stderr && outputDetails.stderr.trim() !== "") {
                return (
                    <pre className="terminal-output terminal-error">
                        {outputDetails.stderr}
                    </pre>
                );
            }
            if (outputDetails.stdout && outputDetails.stdout.trim() !== "") {
                return (
                    <pre className="terminal-output terminal-success">
                        {outputDetails.stdout}
                    </pre>
                );
            }
            if (outputDetails.exception) {
                return (
                    <pre className="terminal-output terminal-error">
                        Exception: {outputDetails.exception}
                    </pre>
                );
            }
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
                    <button className="terminal-tab active">
                        <span className="terminal-tab-icon"><FaTerminal /></span>
                        Terminal
                        {outputDetails && (
                            <span className={`terminal-tab-dot ${
                                outputDetails.stderr && outputDetails.stderr.trim() ? 'dot-error' : 'dot-success'
                            }`} />
                        )}
                    </button>
                </div>
                <div className="terminal-status">
                    {offlineStatus ? (
                        <span className="status-badge status-offline">
                            <span className="status-dot">&bull;</span>
                            Offline
                        </span>
                    ) : (
                        <span className="status-badge status-online">
                            <span className="status-dot">&bull;</span>
                            Online
                        </span>
                    )}
                </div>
            </div>

            {/* Terminal Body */}
            <div className="terminal-body">
                <div className="terminal-output-pane" ref={outputRef}>
                    {outputDetails ? (
                        getOutput()
                    ) : (
                        <span className="output-placeholder">
                            Run your code to see the output here...
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default OutputWindow