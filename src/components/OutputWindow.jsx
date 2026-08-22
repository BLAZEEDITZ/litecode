import React from 'react'
import { langMap } from "../constants/languageOptions";

const OutputWindow = ({ outputDetails, offlineStatus }) => {

    const getOutput = () => {
        if (!outputDetails) return null;

        console.log("OutputWindow received:", outputDetails);

        // Handle OneCompiler API response format
        if (outputDetails.status !== undefined) {
            console.log("OneCompiler format detected");
            
            // Check for compilation/runtime errors (stderr)
            if (outputDetails.stderr && outputDetails.stderr.trim() !== "") {
                return (
                    <pre className="px-2 py-1 font-normal text-red-500">
                        {outputDetails.stderr}
                    </pre>
                );
            }
            
            // Check for successful output (stdout)
            if (outputDetails.stdout && outputDetails.stdout.trim() !== "") {
                return (
                    <pre className="px-2 py-1 font-normal text-green-500">
                        {outputDetails.stdout}
                    </pre>
                );
            }
            
            // Check for exception
            if (outputDetails.exception) {
                return (
                    <pre className="px-2 py-1 font-normal text-red-500">
                        Exception: {outputDetails.exception}
                    </pre>
                );
            }

            // No output at all
            return (
                <pre className="px-2 py-1 font-normal text-yellow-500">
                    (No output)
                </pre>
            );
        }

        // Handle old OneCompiler format (output property)
        if (outputDetails.output !== undefined) {
            console.log("Old OneCompiler format detected");
            if (outputDetails.error) {
                return (
                    <pre className="px-2 py-1 font-normal text-red-500">
                        {outputDetails.error}
                    </pre>
                );
            } else if (outputDetails.output && outputDetails.output.trim() !== "") {
                return (
                    <pre className="px-2 py-1 font-normal text-green-500">
                        {outputDetails.output}
                    </pre>
                );
            }
        }

        // Handle Judge0 API response format
        if (outputDetails.language && langMap[outputDetails.language]) {
            console.log("Judge0 format detected");
            if (outputDetails.error) {
                return (
                    <pre className="px-2 py-1 font-normal text-red-500">
                        {outputDetails.error}
                    </pre>
                );
            } else {
                return (
                    <pre className="px-2 py-1 font-normal text-green-500">
                        {outputDetails.output}
                    </pre>
                );
            }
        } else if (outputDetails.status?.id) {
            console.log("Judge0 status format detected");
            let statusId = outputDetails.status.id;

            if (statusId === 6) {
                return (
                    <pre className="px-2 py-1 font-normal text-red-500">
                        {atob(outputDetails?.compile_output)}
                    </pre>
                );
            } else if (statusId === 3) {
                return (
                    <pre className="px-2 py-1 font-normal text-green-500">
                        {atob(outputDetails.stdout) || "No output"}
                    </pre>
                );
            } else if (statusId === 5) {
                return (
                    <pre className="px-2 py-1 font-normal text-red-500">
                        Time Limit Exceeded
                    </pre>
                );
            }
        }

        console.log("Unknown format:", outputDetails);
        return (
            <pre className="px-2 py-1 font-normal text-gray-400">
                Unable to parse output format
            </pre>
        );
    };

    return (
        <>
            <h1 className="font-bold text-xl text-transparent mb-2 flex justify-between text-zinc-100">
                Output
                {
                    offlineStatus ?
                        <>
                            <span className='flex gap-1 items-center text-[#f43f5e]'>
                                <span className='text-xl'>●</span>
                                <span className='text-sm'>Internet DisConnected</span>
                            </span>
                        </>
                        :
                        <>
                            <span className='flex gap-1 items-center text-[#4ade80]'>
                                <span className='text-xl'>●</span>
                                <span className='text-sm'>Internet Connected</span>
                            </span>
                        </>
                }
            </h1>
            <div className="w-full h-60 bg-[#1e293b] shadow-lg rounded-md text-white font-normal text-sm overflow-y-auto border border-gray-600">
                {outputDetails ? <>{getOutput()}</> : null}
            </div>
        </>
    );
}

export default OutputWindow