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
                <div className="flex justify-between w-full mt-4">
                    <div className="metrics-container flex flex-col space-y-3">
                        <p className="text-sm text-slate-300">
                            Status:{" "}
                            <span className={`ml-2 font-semibold px-2 py-1 rounded-md ${getStatusColor()}`}>
                                {getStatus()}
                            </span>
                        </p>

                        <p className="text-sm text-slate-300">
                            Memory:{" "}
                            <span className="ml-2 font-semibold px-2 py-1 rounded-md bg-gray-100 text-slate-900">
                                {getMemory()}
                            </span>
                        </p>

                        <p className="text-sm text-slate-300">
                            Time:{" "}
                            <span className="ml-2 font-semibold px-2 py-1 rounded-md bg-gray-100 text-slate-900">
                                {getExecutionTime()}
                            </span>
                        </p>
                    </div>

                    <div className="flex gap-2 items-start">
                        <button 
                            onClick={runcode}
                            className="bg-indigo-600 hover:bg-indigo-800 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                        >
                            Run Again
                        </button>
                        <button 
                            onClick={() => savecode()} 
                            className="bg-green-600 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                        >
                            Save
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default OutputDetails;