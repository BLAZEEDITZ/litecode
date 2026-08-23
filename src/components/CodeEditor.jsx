import React, { useEffect, useState } from 'react'
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { languageOptions } from "../constants/languageOptions";
import { snippet } from "../constants/snippet";
import { classnames } from "../utils/general";
import './codeEditor.css'
import { FaExpand, FaCompress, FaRegCopy, FaHome } from 'react-icons/fa';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/defineTheme"
import LanguagesDropdown from './LanguageDropdown';
import ThemeDropdown from './ThemeDropdown';
import CustomInput from './CustomInput';
import OutputWindow from './OutputWindow';
import OutputDetails from './OutputDetails';
import useKeyPress from '../hooks/useKeyPress';
import copy from 'copy-to-clipboard';
import StopWatch from './StopWatch';
import { Link } from 'react-router-dom';

//Compiler API: OneCompiler
const defaultCode = `// Type Your code here 1`;

const CodeEditor = () => {

    function loadTheme() {
        let th = { label: 'Blackboard', value: 'blackboard', key: 'blackboard' }
        if (localStorage.getItem("usertheme")) {
            console.log("update theme from local storage");
            th = JSON.parse(localStorage.getItem("usertheme"))
        }
        return th;
    }

    const [code, setCode] = useState(defaultCode);
    const [theme, setTheme] = useState("");
    const [customInput, setCustomInput] = useState("");
    const [outputDetails, setOutputDetails] = useState(null);
    const [processing, setProcessing] = useState(null);
    const [fullScreen, setFullScreen] = useState(false);
    const [font_size, set_font_size] = useState(16)
    const [language, setLanguage] = useState(JSON.parse(localStorage.getItem("language")) || languageOptions[0]);
    const [offlineStatus, SetofflineStatus] = useState(false)

    function setOffline() {
        SetofflineStatus(true);
    }
    function setOnline() {
        SetofflineStatus(false)
    }

    function ctrlplusr(e) {
        if (e.keyCode === 69 && e.ctrlKey) {
            e.preventDefault()
            resetCode()
        }
        else if (e.keyCode === 83 && e.ctrlKey) {
            e.preventDefault()
            downloadTxtFile(code)
        }
    }

    useEffect(() => {
        window.addEventListener('online', setOnline);
        window.addEventListener('offline', setOffline);
        window.addEventListener('keydown', ctrlplusr);
        return () => {
            window.removeEventListener("online", setOnline)
            window.removeEventListener("offline", setOffline)
            window.removeEventListener('keydown', ctrlplusr)
        }
    })

    const onChange = (action, data) => {
        switch (action) {
            case "code": {
                setCode(data);
                window.localStorage.setItem(language.value, JSON.stringify(data))
                break;
            }
            default: {
                console.warn("case not handled!", action, data);
            }
        }
    };

    useEffect(() => {
        const prevCode = JSON.parse(localStorage.getItem(language.value));
        setCode(prevCode || snippet(language.value));
    }, [language.value]);

    const ctrlPress = useKeyPress("Control");
    const key_run = useKeyPress("F9");
    const key_save = useKeyPress("q")
    const key_fullScreen = useKeyPress("F11");

    const onSelectChange = (sl) => {
        setLanguage(sl);
        setOutputDetails(null);
        localStorage.setItem("language", JSON.stringify(sl));
    };

    const downloadTxtFile = (data) => {
        const element = document.createElement("a");
        const file = new Blob([data], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `${language.value}-code.txt`;
        document.body.appendChild(element);
        element.click();
    }

    async function handleThemeChange(th) {
        const theme = th;
        console.log(theme);
        if (["light", "vs-dark"].includes(theme.value)) {
            setTheme(theme);
        } else {
            console.log("calling define theme ");
            defineTheme(theme.value)
                .then((_) => {
                    setTheme(theme);
                    localStorage.setItem("usertheme", JSON.stringify(theme));
                })
        }
    }

    const handleCompile = () => {
        if (processing) return
        console.log("Compiling code...");
        setProcessing(true);

        // OneCompiler API format with files array
        const formData = {
            language: language.value,
            stdin: customInput || "",
            files: [
                {
                    name: `code.${language.value}`,
                    content: code
                }
            ]
        };

        console.log("OneCompiler Request:", formData);
        console.log("API URL:", process.env.REACT_APP_RAPID_API_URL);

        const options = {
            method: "POST",
            url: process.env.REACT_APP_RAPID_API_URL,
            headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
                "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
            },
            data: formData,
        };

        axios
            .request(options)
            .then(function (response) {
                console.log("OneCompiler Response:", response.data);
                setProcessing(false);

                // Keep the original OneCompiler response format
                // Don't reformat it - just add timestamp
                const outputData = {
                    ...response.data,
                    timestamp: new Date().toISOString(),
                };

                console.log("Setting outputDetails:", outputData);
                setOutputDetails(outputData);
                showSuccessToast(`Compiled Successfully!`);
            })
            .catch((err) => {
                console.error("Error from OneCompiler:", err);
                
                let errorMsg = "Something went wrong! Please try again.";
                
                if (err.response) {
                    console.error("Response Error:", err.response.data);
                    errorMsg = err.response.data?.message || err.response.data?.error || errorMsg;
                    
                    if (err.response.status === 401) {
                        errorMsg = "Invalid API Key! Please check your .env file.";
                    } else if (err.response.status === 403) {
                        errorMsg = "API Key not authorized. Check subscription on RapidAPI.";
                    }
                } else if (err.request) {
                    console.error("No Response:", err.request);
                    errorMsg = "No response from server. Check your internet connection.";
                } else {
                    console.error("Error:", err.message);
                    errorMsg = err.message;
                }
                
                setProcessing(false);
                showErrorToast(errorMsg);
            });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (key_run) {
            handleCompile();
        }
    }, [key_run]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (ctrlPress && key_save) {
            downloadTxtFile(code)
        }
    }, [ctrlPress, key_save, code]);

    const resetCode = () => {
        let text = "Your code will be discarded and reset to the default code!";
        if (window.confirm(text)) {
            setCode(snippet(language.value))
        }
    }

    const makeFullScreen = async () => {
        if (!fullScreen) {
            setFullScreen(true)
        }
        else {
            setFullScreen(false)
        }
    }

    useEffect(() => {
        if (key_fullScreen) {
            // makeFullScreen()
        }
    }, [key_fullScreen]);

    useEffect(() => {
        let th = loadTheme();
        console.log("calling define theme from useEffect")
        handleThemeChange(th);
    }, []);

    const showSuccessToast = (msg) => {
        toast.success(msg || `Compiled Successfully!`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    const showErrorToast = (msg) => {
        toast.error(msg || `Something went wrong! Please try again.`, {
            position: "top-right",
            autoClose: 1000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
    };

    const handleShare = async () => {
        try {
            await navigator.share({
                files: [
                    new File([code], 'codetext.txt', { type: "text/plain", }),
                ],
                title: 'code',
                text: 'code',
            },
                {
                    copy: true,
                    email: true,
                    print: true,
                    sms: true,
                    messenger: true,
                    facebook: true,
                    whatsapp: true,
                    twitter: true,
                    linkedin: true,
                    telegram: true,
                    skype: true,
                    pinterest: true,
                    language: 'pt'
                }
            );
        } catch (err) {
            console.error(err);
        }
    };

    // Split view handler
    useEffect(() => {
        const resizer = document.getElementById('dragMe');
        if (!resizer) return;

        const leftSide = resizer.previousElementSibling;
        const rightSide = resizer.nextElementSibling;

        let x = 0;
        let leftWidth = 0;

        const mouseDownHandler = function (e) {
            x = e.clientX;
            leftWidth = leftSide.getBoundingClientRect().width;
            resizer.style.cursor = 'col-resize';
            document.body.style.cursor = 'col-resize';
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        resizer.addEventListener('mousedown', mouseDownHandler);

        const mouseMoveHandler = function (e) {
            if (leftSide && rightSide) {
                const dx = e.clientX - x;
                const newLeftWidth = ((leftWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
                leftSide.style.width = `${newLeftWidth}%`;
                leftSide.style.userSelect = 'none';
                leftSide.style.pointerEvents = 'none';
                rightSide.style.userSelect = 'none';
                rightSide.style.pointerEvents = 'none';
            }
        };

        const mouseUpHandler = function () {
            resizer.style.removeProperty('cursor');
            document.body.style.removeProperty('cursor');
            leftSide.style.removeProperty('user-select');
            leftSide.style.removeProperty('pointer-events');
            rightSide.style.removeProperty('user-select');
            rightSide.style.removeProperty('pointer-events');
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
    })

    const copyToClipboard = () => {
        copy(code);
        showSuccessToast('Copied')
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            {
                !fullScreen &&
                <>
                    <div className="h-1 w-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 transition duration-200">
                    </div>

                    <div className="flex flex-row border-2 border-t-0 border-gray-600 gap-4" >
                        <Link to="/" className='mt-1 ml-2'>
                            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center mr-5">
                                <FaHome fontSize={18} color="black" />
                            </button>
                        </Link>

                        <div className="dropdownInner">
                            <LanguagesDropdown onSelectChange={onSelectChange} Userlanguage={language} />
                        </div>
                        <div className="dropdownInner">
                            <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
                        </div>

                        <div className="px-4 justify-end">
                            <div className="d-flex px-2 py-1 rounded-lg border focus:outline-none hover:bg-gray-700 hover:text-blue-700 focus:z-10  focus:ring-gray-500 bg-gray-800 border-gray-600 hover:text-white hover:bg-gray-700">
                                <label htmlFor="fontsize_lable" className="form-label mr-2 text-gray-100">Font Size</label>
                                <input
                                    type="number"
                                    className="form-control px-3 py-1  text-gray-700 bg-white  border border-solid border-gray-300 rounded transition ease-in-out m-0  focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                    id="fontsize_lable"
                                    placeholder="Font size"
                                    value={font_size}
                                    onChange={(e) => set_font_size(parseInt(e.target.value))}
                                    style={{
                                        width: "80px"
                                    }}
                                />
                            </div>
                        </div>

                        <div className="px-4  mx-auto justify-end flex items-center" style={{
                            flex: 1
                        }} >

                            <button onClick={copyToClipboard} type="button" id="copytxt" className="flex items-center py-2 px-4 mr-3  text-xs font-medium  rounded-lg border focus:outline-none hover:bg-gray-700 hover:text-blue-700 focus:z-10  focus:ring-gray-500 bg-gray-800 border-gray-600 hover:text-white hover:bg-gray-700">
                                <FaRegCopy fontSize={18} color="white" />
                            </button>
                            <button onClick={makeFullScreen} type="button" className="flex items-center py-2 px-4 mr-3 text-xs font-medium  rounded-lg border focus:outline-none hover:bg-gray-700 hover:text-blue-700 focus:z-10  focus:ring-gray-500 bg-gray-800 border-gray-600 hover:text-white hover:bg-gray-700">
                                <FaExpand fontSize={16} color="white" />
                            </button>

                            <button
                                disabled={processing || offlineStatus}
                                onClick={handleCompile} type="button" className="text-white bg-indigo-600 hover:bg-indigo-800   focus:outline-none font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2">

                                {
                                    processing ?
                                        <>
                                            <svg role="status" className="inline w-4 h-4 mr-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                                            </svg>
                                            running...
                                        </>
                                        :
                                        "Run ( F9   ) "
                                }
                            </button>

                            <button onClick={() => downloadTxtFile(code)} type="button" className="text-white bg-indigo-600 hover:bg-indigo-800   focus:outline-none font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2">
                                {"Save Code ( ctrl+s )"}
                            </button>

                            <button onClick={resetCode} type="button" className="text-white bg-indigo-600 hover:bg-indigo-800   focus:outline-none font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2">
                                {"Erase Code ( ctrl+e )"}
                            </button>
                            <button onClick={handleShare} type="button" className="text-white bg-[#db2777] hover:bg-[#ec4899]   focus:outline-none font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center focus:ring-[#2557D6]/50 mr-2">
                                Share
                            </button>

                        </div>
                    </div >
                </>
            }

            < div className="editorlayout flex flex-row  space-x-4 items-start border-2 border-t-0 border-b-0 border-gray-600"
                style={{
                    height: fullScreen ? "99vh" : `calc(100vh - 6.4vh )`,
                }}>
                <div className="flex flex-col h-full justify-start items-end container__left">
                    <CodeEditorWindow
                        code={code}
                        Fontoptions={{
                            fontSize: font_size
                        }}
                        onChange={onChange}
                        language={language?.value}
                        theme={theme.value}
                        isFullScreen={fullScreen}
                    />
                </div>

                <div className="resizer" id="dragMe">
                    <svg stroke="currentColor" fill="#f1f5f9" strokeWidth="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
                    <svg stroke="currentColor" fill="#f1f5f9" strokeWidth="0" viewBox="0 0 24 24" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
                </div>

                <div className="flex  flex-col container__right relative h-full px-1 pt-1"
                    style={{ flex: "1 1 0%" }}>
                    {
                        fullScreen && <button onClick={makeFullScreen} type="button" className="flex items-center py-2 px-4 mr-3 text-xs font-medium  rounded-lg border focus:outline-none hover:bg-gray-700 hover:text-blue-700 focus:z-10  focus:ring-gray-500 bg-gray-800 border-gray-600 hover:text-white hover:bg-gray-700 mt-2"
                            style={{
                                width: "fit-content"
                            }}>
                            {
                                fullScreen ? <FaCompress color='white' /> : <FaExpand color='white' />
                            }
                        </button>
                    }

                    <OutputWindow lang={language.value} outputDetails={outputDetails} offlineStatus={offlineStatus} />
                    <div className="flex flex-col items-end">
                        <CustomInput
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                        />

                        {fullScreen && <button
                            onClick={handleCompile}
                            disabled={!code || processing}
                            className={classnames(
                                "mt-4 border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2 hover:shadow transition duration-200 bg-white flex-shrink-0 font-bold",
                                (!code || processing) ? "opacity-50" : ""
                            )}
                        >
                            {processing ? "Processing..." : "F9 -  Run Code"}
                        </button>}
                    </div>
                    {<OutputDetails runcode={handleCompile} savecode={downloadTxtFile} outputDetails={outputDetails}
                        lang={language.value}
                    />}

                    <StopWatch />

                </div>
            </div >
        </>
    )
}

export default CodeEditor;