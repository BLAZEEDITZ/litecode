import React from "react";

const OutputDetails = ({ outputDetails, runcode, savecode, lang }) => {

    function getStatus() {
        if (!outputDetails) return "No Output";
        
        // OneCompiler format
        if (outputDetails.status === "success") {
            if (outputDetails.stderr && outputDetails.stderr.trim() !== "") {
                return "Compilation Error";
            }
            return "Success";
        } else if (outputDetails.status === "failed") {
            return "Failed";
        }
        
        // Judge0 format
        if (outputDetails.error) {
            let strerr = outputDetails.error;
            if (strerr.indexOf("Error: Timed Out") !== -1) {
                return "Time Limit Exceeded";
            } else {
                return "Compilation failed";
            }
        }
        
        return "No Status";
    }

    function getStatusColor() {
        const status = getStatus();
        if (status === "Success") return "bg-green-100 text-green-900";
        if (status === "No Output") return "bg-yellow-100 text-yellow-900";
        return "bg-red-100 text-red-900";
    }

    function getMemory() {
        if (!outputDetails) return "-";
        
        // OneCompiler format
        if (outputDetails.memoryUsed !== undefined) {
            return `${outputDetails.memoryUsed} bytes`;
        }
        
        // Judge0 format
        if (outputDetails.memory) {
            return outputDetails.memory;
        }
        
        return "-";
    }

    function getExecutionTime() {
        if (!outputDetails) return "-";
        
        // OneCompiler format
        if (outputDetails.executionTime !== undefined) {
            return `${outputDetails.executionTime}ms`;
        }
        
        // Judge0 format
        if (outputDetails.time) {
            return outputDetails.time;
        }
        
        return "-";
    }

    return (
        <>
            {outputDetails && (
                <div className="output-details">
                    <div className="metrics">
                        <div className="metric-item">
                            <span className="metric-label">Status</span>
                            <span className={`metric-badge ${
                                getStatus() === 'Success' ? 'badge-success' :
                                getStatus() === 'No Output' ? 'badge-warning' : 'badge-error'
                            }`}>{getStatus()}</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">Memory</span>
                            <span className="metric-value">{getMemory()}</span>
                        </div>
                        <div className="metric-item">
                            <span className="metric-label">Time</span>
                            <span className="metric-value">{getExecutionTime()}</span>
                        </div>
                    </div>
                    <div className="output-actions">
                        <button onClick={runcode} className="output-action-btn btn-run-again">
                            ↺ Run Again
                        </button>
                        <button onClick={() => savecode()} className="output-action-btn btn-save">
                            ↓ Save
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default OutputDetails;