import React, { useEffect, useState } from 'react'
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { languageOptions } from "../constants/languageOptions";
import { snippet } from "../constants/snippet";
import { classnames } from "../utils/general";
import './codeEditor.css'
import { FaExpand, FaCompress, FaRegCopy, FaHome, FaSave, FaTrash, FaShare, FaPlay } from 'react-icons/fa';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/defineTheme"
import LanguagesDropdown from './LanguageDropdown';
import ThemeDropdown from './ThemeDropdown';
import OutputWindow from './OutputWindow';
import OutputDetails from './OutputDetails';
import FileExplorer from './FileExplorer';
import InputModal from './InputModal';
import AIChatbot from './AIChatbot';
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
    const [showInputModal, setShowInputModal] = useState(false);
    const [showChatBall, setShowChatBall] = useState(false);
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
            // Save to language localStorage
            window.localStorage.setItem(language.value, JSON.stringify(data))
            
            // IMPORTANT: Notify FileExplorer to update the file content
            // We'll do this by updating the files array through a callback
            if (window.currentFileId) {
                const event = new CustomEvent('updateFileContent', {
                    detail: { fileId: window.currentFileId, content: data }
                });
                window.dispatchEvent(event);
            }
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

    const requiresInputRegex = /input\(|raw_input\(|sys\.stdin|Scanner|BufferedReader|cin|scanf|getline|Console\.ReadLine|gets|fgets|readline/i;

    const handleCompile = () => {
        if (processing) return;
        
        if (requiresInputRegex.test(code)) {
            setShowInputModal(true);
        } else {
            executeCode();
        }
    };

    const handleModalSubmit = () => {
        setShowInputModal(false);
        executeCode();
    };

    const executeCode = () => {
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
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (ctrlPress && key_save) {
            downloadTxtFile(code)
        }
    });

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

    // Handle file selection from explorer
// Handle file selection from explorer
// Handle file selection from explorer
const handleFileSelect = (file) => {
    if (file && file.type === 'file') {
        // Store current file ID globally
        window.currentFileId = file.id;
        // Load the file content
        setCode(file.content || '');
    }
};

    // Handle language change from file extension
    const handleLanguageChange = (lang) => {
        const langOption = languageOptions.find(l => l.value === lang);
        if (langOption) {
            onSelectChange(langOption);
        }
    };

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

            <InputModal 
                isOpen={showInputModal} 
                onClose={() => setShowInputModal(false)}
                onSubmit={handleModalSubmit}
                customInput={customInput}
                setCustomInput={setCustomInput}
            />

            {
                !fullScreen &&
                <>
                    <div className="editor-top-bar" />
                    
                    <div className="editor-navbar">
                        <Link to="/" className="home-btn-link">
                            <button className="home-btn" title="Home">
                                <FaHome fontSize={15} />
                                <span className="home-btn-label">Home</span>
                            </button>
                        </Link>

                        <div className="navbar-divider" />

                        <div className="dropdownInner">
                            <LanguagesDropdown 
                                onSelectChange={onSelectChange} 
                                Userlanguage={language} 
                                onComingSoonClick={() => setShowChatBall(true)}
                            />
                        </div>
                        <div className="dropdownInner">
                            <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
                        </div>

                        <div className="navbar-divider" />

                        <div className="fontsize-control">
                            <label htmlFor="fontsize_lable" className="fontsize-label">Aa</label>
                            <input
                                type="number"
                                className="fontsize-input"
                                id="fontsize_lable"
                                placeholder="16"
                                value={font_size}
                                onChange={(e) => set_font_size(parseInt(e.target.value))}
                            />
                        </div>

                        <div className="navbar-actions">
                            <button onClick={copyToClipboard} type="button" className="icon-btn" title="Copy Code (Ctrl+C)">
                                <FaRegCopy fontSize={15} />
                            </button>
                            
                            <button onClick={makeFullScreen} type="button" className="icon-btn" title="Toggle Full Screen (F11)">
                                <FaExpand fontSize={14} />
                            </button>

                            <div className="navbar-divider" />

                            <button onClick={() => downloadTxtFile(code)} type="button" className="icon-btn" title="Save Code (Ctrl+S)">
                                <FaSave fontSize={14} />
                            </button>

                            <button onClick={resetCode} type="button" className="icon-btn icon-btn-danger" title="Reset Code (Ctrl+E)">
                                <FaTrash fontSize={13} />
                            </button>
                            
                            <button onClick={handleShare} type="button" className="icon-btn" title="Share Code">
                                <FaShare fontSize={14} />
                            </button>

                            <div className="navbar-divider" />

                            <button
                                disabled={processing || offlineStatus}
                                onClick={handleCompile} 
                                type="button" 
                                className="run-btn"
                                title="Run Code (F9)"
                            >
                                {processing ? (
                                    <svg role="status" className="inline w-4 h-4 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.590820 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 28.5686 23.4432 10.3988 42.448 10.3988C61.4528 10.3988 75.9172 28.5686 75.9172 50.5908C75.9172 72.6121 61.4528 90.7818 42.448 90.7818C23.4432 90.7818 9.08144 72.6121 9.08144 50.5908Z" fill="#E5E7EB"/>
                                        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.0669 3.6496 62.3342 1.42799 55.1432 1.42799C42.8181 1.42799 30.7784 5.40659 21.4267 12.7395C11.7919 20.2396 5.47541 30.7742 2.5817 42.8554C0.104477 52.7586 -0.753073 63.0728 0.69841 72.5686C1.9284 81.0953 5.22489 89.12 10.1302 96.1670C14.9079 102.999 21.7410 108.629 29.5604 112.584C37.2368 116.465 45.7731 118.519 54.4882 118.519C63.3297 118.519 71.8760 116.465 79.5524 112.584C87.3718 108.629 94.2049 102.999 99.0826 96.1670" stroke="currentColor" strokeWidth="5"/>
                                    </svg>
                                ) : (
                                    <><FaPlay fontSize={13} /><span className="run-btn-label">Run</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </>
            }

            <div className="editorlayout-with-explorer flex" style={{height: fullScreen ? "99vh" : `calc(100vh - 6.4vh )`}}>
                {/* FILE EXPLORER */}
                <FileExplorer 
                    onFileSelect={handleFileSelect}
                    onLanguageChange={handleLanguageChange}
                    currentLanguage={language}
                />

                {/* EDITOR SECTION */}
                <div className="editorlayout flex flex-row space-x-4 items-start border-2 border-t-0 border-b-0 border-gray-600"
                    style={{
                        flex: 1,
                        height: '100%'
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
                        <div className="resizer-dots"></div>
                    </div>

                    <div className="flex flex-col container__right relative h-full px-1 pt-1"
                        style={{ flex: "1 1 0%" }}>
                        {fullScreen && (
                            <button 
                                onClick={makeFullScreen} 
                                type="button" 
                                className="icon-btn-fullscreen" 
                                title="Exit Full Screen"
                            >
                                {fullScreen ? <FaCompress color='white' /> : <FaExpand color='white' />}
                            </button>
                        )}

                        <OutputWindow 
                            lang={language.value} 
                            outputDetails={outputDetails} 
                            offlineStatus={offlineStatus}
                            customInput={customInput}
                            setCustomInput={setCustomInput}
                        />
                        <div className="flex flex-col items-end">
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
                </div>
            </div>

            <AIChatbot visible={showChatBall} onDismiss={() => setShowChatBall(false)} />
        </>
    )
}

export default CodeEditor;