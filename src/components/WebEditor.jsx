import React, { useEffect, useState } from 'react'
import CodeEditorWindow from "./CodeEditorWindow";
import './codeEditor.css'
import { FaExpand, FaCompress, FaRegCopy, FaHome, FaSave, FaTrash, FaShare, FaPlay } from 'react-icons/fa';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/defineTheme"
import ThemeDropdown from './ThemeDropdown';
import WebOutputWindow from './WebOutputWindow';
import FileExplorer from './FileExplorer';
import useKeyPress from '../hooks/useKeyPress';
import copy from 'copy-to-clipboard';
import StopWatch from './StopWatch';
import { Link } from 'react-router-dom';

const defaultWebFiles = [
    { id: 'html_1', name: 'index.html', type: 'file', language: 'html', content: '<div class="container">\n  <h1>Hello Web Editor</h1>\n  <p>Start typing to see live changes!</p>\n</div>' },
    { id: 'css_1', name: 'style.css', type: 'file', language: 'css', content: 'body {\n  font-family: sans-serif;\n  background: #f4f4f5;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n  margin: 0;\n}\n\n.container {\n  background: white;\n  padding: 2rem;\n  border-radius: 8px;\n  box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n  text-align: center;\n}\n\nh1 {\n  color: #6366f1;\n}' },
    { id: 'js_1', name: 'script.js', type: 'file', language: 'javascript', content: 'console.log("Web Editor initialized!");' }
];

const WebEditor = () => {

    function loadTheme() {
        let th = { label: 'Blackboard', value: 'blackboard', key: 'blackboard' }
        if (localStorage.getItem("usertheme")) {
            th = JSON.parse(localStorage.getItem("usertheme"))
        }
        return th;
    }

    const [code, setCode] = useState(defaultWebFiles[0].content);
    const [theme, setTheme] = useState("");
    const [fullScreen, setFullScreen] = useState(false);
    const [font_size, set_font_size] = useState(16)
    const [language, setLanguage] = useState(defaultWebFiles[0].language);
    
    // States for the web output
    const [webContent, setWebContent] = useState({ html: '', css: '', js: '' });

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
        window.addEventListener('keydown', ctrlplusr);
        return () => {
            window.removeEventListener('keydown', ctrlplusr)
        }
    })

    const onChange = (action, data) => {
        switch (action) {
            case "code": {
                setCode(data);
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

    const ctrlPress = useKeyPress("Control");
    const key_run = useKeyPress("F9");
    const key_save = useKeyPress("q")

    const downloadTxtFile = (data) => {
        const element = document.createElement("a");
        const file = new Blob([data], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `web-code.txt`;
        document.body.appendChild(element);
        element.click();
    }

    async function handleThemeChange(th) {
        const theme = th;
        if (["light", "vs-dark"].includes(theme.value)) {
            setTheme(theme);
        } else {
            defineTheme(theme.value)
                .then((_) => {
                    setTheme(theme);
                    localStorage.setItem("usertheme", JSON.stringify(theme));
                })
        }
    }

    const executeCode = () => {
        // Read files from local storage
        const saved = localStorage.getItem('litecode_web_files');
        const files = saved ? JSON.parse(saved) : defaultWebFiles;
        
        let htmlContent = '';
        let cssContent = '';
        let jsContent = '';

        files.forEach(f => {
            if (f.name.endsWith('.html')) htmlContent += f.content + '\n';
            else if (f.name.endsWith('.css')) cssContent += f.content + '\n';
            else if (f.name.endsWith('.js')) jsContent += f.content + '\n';
        });

        setWebContent({ html: htmlContent, css: cssContent, js: jsContent });
        showSuccessToast('Rendered successfully!');
    };

    // Auto-run on mount
    useEffect(() => {
        executeCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (key_run) {
            executeCode();
        }
    });

    useEffect(() => {
        if (ctrlPress && key_save) {
            downloadTxtFile(code)
        }
    });

    const resetCode = () => {
        if (window.confirm("Your code will be discarded!")) {
            setCode('');
        }
    }

    const makeFullScreen = async () => {
        setFullScreen(!fullScreen)
    }

    useEffect(() => {
        let th = loadTheme();
        handleThemeChange(th);
    }, []);

    const showSuccessToast = (msg) => {
        toast.success(msg || `Success!`, {
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
                files: [new File([code], 'webcode.txt', { type: "text/plain", })],
                title: 'code',
                text: 'code',
            });
        } catch (err) {
            console.error(err);
        }
    };

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

    const handleFileSelect = (file) => {
        if (file && file.type === 'file') {
            window.currentFileId = file.id;
            setCode(file.content || '');
        }
    };

    const handleLanguageChange = (lang) => {
        // fileExplorer language could be 'html', 'css', 'javascript'
        setLanguage(lang);
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
                                onClick={executeCode} 
                                type="button" 
                                className="run-btn"
                                title="Run Code (F9)"
                            >
                                <FaPlay fontSize={13} /><span className="run-btn-label">Run Web</span>
                            </button>
                        </div>
                    </div>
                </>
            }

            <div className="editorlayout-with-explorer flex" style={{height: fullScreen ? "99vh" : `calc(100vh - 6.4vh )`}}>
                <FileExplorer 
                    onFileSelect={handleFileSelect}
                    onLanguageChange={handleLanguageChange}
                    currentLanguage={language}
                    storageKey="litecode_web_files"
                    defaultFiles={defaultWebFiles}
                />

                <div className="editorlayout flex flex-row space-x-4 items-start border-2 border-t-0 border-b-0 border-gray-600"
                    style={{ flex: 1, height: '100%' }}>
                    
                    <div className="flex flex-col h-full justify-start items-end container__left">
                        <CodeEditorWindow
                            code={code}
                            Fontoptions={{ fontSize: font_size }}
                            onChange={onChange}
                            language={language}
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

                        <WebOutputWindow html={webContent.html} css={webContent.css} js={webContent.js} />
                        
                        <StopWatch />
                    </div>
                </div>
            </div>
        </>
    )
}

export default WebEditor;