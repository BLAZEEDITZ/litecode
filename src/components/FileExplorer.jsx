import React, { useState, useEffect, useCallback } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaChevronDown, FaChevronRight, FaPlus, FaTrash, FaEdit, FaChevronLeft, FaCode } from 'react-icons/fa';
import { getLanguageFromFileName } from '../constants/fileExtensionMap';
import './explorer.css';

const FileExplorer = ({ 
    onFileSelect, 
    onLanguageChange, 
    currentLanguage,
    storageKey = 'litecode_files',
    defaultFiles = []
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [activeFileId, setActiveFileId] = useState(null);
    const [files, setFiles] = useState(() => {
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : defaultFiles;
    });
    
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [newFileName, setNewFileName] = useState('');
    const [showNewFileInput, setShowNewFileInput] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [showNewFolderInput, setShowNewFolderInput] = useState(false);
    const [parentForNewItem, setParentForNewItem] = useState(null);

    // Debounced save to localStorage - only runs when files actually change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (files.length > 0) {
                localStorage.setItem(storageKey, JSON.stringify(files));
            }
        }, 1000); // Save after 1 second of inactivity
        return () => clearTimeout(timer);
    }, [files, storageKey]);

    // Generate unique ID
    const generateId = () => `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Find item by ID recursively
    const findItemById = useCallback((items, id) => {
        for (let item of items) {
            if (item.id === id) return item;
            if (item.children) {
                const found = findItemById(item.children, id);
                if (found) return found;
            }
        }
        return null;
    }, []);

    // Add item to specific location recursively
    const addItemRecursive = useCallback((items, parentId, newItem) => {
        if (!parentId) {
            return [...items, newItem];
        }
        
        return items.map(item => {
            if (item.id === parentId) {
                return {
                    ...item,
                    children: [...(item.children || []), newItem]
                };
            }
            if (item.children) {
                return {
                    ...item,
                    children: addItemRecursive(item.children, parentId, newItem)
                };
            }
            return item;
        });
    }, []);

    // Delete item recursively
    const deleteItemRecursive = useCallback((items, id) => {
        return items
            .filter(item => item.id !== id)
            .map(item => {
                if (item.children) {
                    return {
                        ...item,
                        children: deleteItemRecursive(item.children, id)
                    };
                }
                return item;
            });
    }, []);

    // Rename item recursively
    const renameItemRecursive = useCallback((items, id, newName, isFile) => {
        return items.map(item => {
            if (item.id === id) {
                let finalName = newName;
                if (isFile && !newName.includes('.')) {
                    const oldExt = item.name.split('.').pop();
                    finalName = `${newName}.${oldExt}`;
                }
                return {
                    ...item,
                    name: finalName,
                    language: isFile ? getLanguageFromFileName(finalName) : item.language
                };
            }
            if (item.children) {
                return {
                    ...item,
                    children: renameItemRecursive(item.children, id, newName, isFile)
                };
            }
            return item;
        });
    }, []);

// Update file content
const updateFileContent = useCallback((fileId, newContent) => {
    const updateRecursive = (items) => {
        return items.map(item => {
            if (item.id === fileId && item.type === 'file') {
                console.log('Updating file:', fileId, 'with content length:', newContent.length);
                return { ...item, content: newContent };
            }
            if (item.children) {
                return { ...item, children: updateRecursive(item.children) };
            }
            return item;
        });
    };
    setFiles(prev => {
        const updated = updateRecursive(prev);
        return updated;
    });
}, []);

    // Listen for file content updates from CodeEditor
    useEffect(() => {
        const handleUpdateFileContent = (event) => {
            const { fileId, content } = event.detail;
            if (fileId && content !== undefined) {
                updateFileContent(fileId, content);
            }
        };
        window.addEventListener('updateFileContent', handleUpdateFileContent);
        return () => window.removeEventListener('updateFileContent', handleUpdateFileContent);
    }, [updateFileContent]);

    // Create new file
    const createFile = useCallback(() => {
        if (!newFileName.trim()) {
            setShowNewFileInput(false);
            setParentForNewItem(null);
            return;
        }
        
        const lang = getLanguageFromFileName(newFileName);
        const newFile = {
            id: generateId(),
            name: newFileName,
            type: 'file',
            content: '',
            language: lang,
            createdAt: new Date().toISOString()
        };
        
        setFiles(prev => addItemRecursive(prev, parentForNewItem, newFile));
        setNewFileName('');
        setShowNewFileInput(false);
        setParentForNewItem(null);
        
        // Auto-select the new file
        setActiveFileId(newFile.id);
        onFileSelect(newFile);
        onLanguageChange(lang);
    }, [newFileName, parentForNewItem, addItemRecursive, onFileSelect, onLanguageChange]);

    // Create new folder
    const createFolder = useCallback(() => {
        if (!newFolderName.trim()) {
            setShowNewFolderInput(false);
            setParentForNewItem(null);
            return;
        }
        
        const newFolder = {
            id: generateId(),
            name: newFolderName,
            type: 'folder',
            children: [],
            createdAt: new Date().toISOString()
        };
        
        setFiles(prev => addItemRecursive(prev, parentForNewItem, newFolder));
        setNewFolderName('');
        setShowNewFolderInput(false);
        setParentForNewItem(null);
        setExpandedFolders(new Set([...expandedFolders, newFolder.id]));
    }, [newFolderName, parentForNewItem, addItemRecursive, expandedFolders]);

    // Delete file/folder
    const deleteItem = useCallback((id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            setFiles(prev => deleteItemRecursive(prev, id));
        }
    }, [deleteItemRecursive]);

    // Rename file/folder
    const startRename = useCallback((item) => {
        setRenamingId(item.id);
        setRenameValue(item.name);
    }, []);

    const confirmRename = useCallback((id, oldName, isFile) => {
        if (!renameValue.trim()) {
            setRenamingId(null);
            return;
        }
        
        setFiles(prev => renameItemRecursive(prev, id, renameValue, isFile));
        setRenamingId(null);
        setRenameValue('');
    }, [renameValue, renameItemRecursive]);

    // Toggle folder expansion
    const toggleFolder = useCallback((folderId) => {
        setExpandedFolders(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(folderId)) {
                newExpanded.delete(folderId);
            } else {
                newExpanded.add(folderId);
            }
            return newExpanded;
        });
    }, []);

    // Get file icon
    const getFileIcon = useCallback((item) => {
        if (item.type === 'folder') {
            return expandedFolders.has(item.id) ? 
                <FaFolderOpen className="text-yellow-400" /> : 
                <FaFolder className="text-yellow-400" />;
        }
        return <FaFile className="text-blue-400" />;
    }, [expandedFolders]);

    // Render file tree
    const renderItems = useCallback((items, level = 0) => {
        return items?.map(item => (
            <div key={item.id} className="file-tree-item">
                <div 
                    className={`file-item-row level-${level} ${item.type === 'file' && item.id === activeFileId ? 'active' : ''}`}
                    onClick={() => {
                        if (item.type === 'file') {
                            setActiveFileId(item.id);
                            onFileSelect(item);
                            onLanguageChange(item.language);
                        } else {
                            toggleFolder(item.id);
                        }
                    }}
                    style={{ paddingLeft: `${level * 16}px` }}
                >
                    <div className="file-item-content">
                        {item.type === 'folder' ? (
                            <span className="folder-chevron">
                                {expandedFolders.has(item.id) ? 
                                    <FaChevronDown size={12} /> : 
                                    <FaChevronRight size={12} />
                                }
                            </span>
                        ) : (
                            <span className="file-chevron"></span>
                        )}
                        <span className="file-icon">
                            {getFileIcon(item)}
                        </span>
                        
                        {renamingId === item.id ? (
                            <input
                                autoFocus
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        confirmRename(item.id, item.name, item.type === 'file');
                                    }
                                    if (e.key === 'Escape') {
                                        setRenamingId(null);
                                    }
                                }}
                                onBlur={() => confirmRename(item.id, item.name, item.type === 'file')}
                                className="rename-input"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span className="file-name">{item.name}</span>
                        )}
                    </div>

                    <div className="file-actions">
                        {item.type === 'folder' && (
                            <>
                                <button 
                                    className="action-btn add-btn" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setParentForNewItem(item.id);
                                        setShowNewFileInput(true);
                                    }}
                                    title="New File"
                                >
                                    <FaPlus size={12} />
                                </button>
                                <button 
                                    className="action-btn add-folder-btn" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setParentForNewItem(item.id);
                                        setShowNewFolderInput(true);
                                    }}
                                    title="New Folder"
                                >
                                    <FaFolder size={12} />
                                </button>
                            </>
                        )}
                        <button 
                            className="action-btn rename-btn" 
                            onClick={(e) => {
                                e.stopPropagation();
                                startRename(item);
                            }}
                            title="Rename"
                        >
                            <FaEdit size={12} />
                        </button>
                        <button 
                            className="action-btn delete-btn" 
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(item.id);
                            }}
                            title="Delete"
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>
                </div>

                {item.type === 'folder' && expandedFolders.has(item.id) && item.children && (
                    <div className="folder-children">
                        {renderItems(item.children, level + 1)}
                    </div>
                )}
            </div>
        ));
    }, [expandedFolders, renamingId, renameValue, confirmRename, startRename, deleteItem, toggleFolder, getFileIcon, onFileSelect, onLanguageChange, activeFileId]);

    return (
    <div className={`file-explorer-container ${isOpen ? 'open' : 'closed'}`}>
        {/* Toggle Button - ALWAYS VISIBLE */}
        <button 
            className="explorer-toggle-btn"
            onClick={() => setIsOpen(!isOpen)}
            title={isOpen ? "Close Explorer" : "Open Explorer"}
        >
            {isOpen ? <FaChevronLeft size={12} /> : <FaCode size={12} />}
        </button>

        {/* Explorer Content - ONLY SHOWN WHEN OPEN */}
        {isOpen && (
            <div className="explorer-content">
                {/* Header */}
                <div className="explorer-header">
                    <div className="explorer-header-left">
                        <FaCode className="explorer-header-icon" size={14} />
                        <h2>Explorer</h2>
                    </div>
                    <div className="explorer-actions">
                        <button 
                            className="explorer-btn"
                            onClick={() => {
                                setParentForNewItem(null);
                                setShowNewFileInput(true);
                            }}
                            title="New File"
                        >
                            <FaPlus size={12} />
                        </button>
                        <button 
                            className="explorer-btn"
                            onClick={() => {
                                setParentForNewItem(null);
                                setShowNewFolderInput(true);
                            }}
                            title="New Folder"
                        >
                            <FaFolder size={12} />
                        </button>
                    </div>
                </div>

                {/* New File Input */}
                {showNewFileInput && (
                    <div className="new-item-input">
                        <input
                            autoFocus
                            type="text"
                            placeholder="filename.js"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') createFile();
                                if (e.key === 'Escape') {
                                    setShowNewFileInput(false);
                                    setParentForNewItem(null);
                                }
                            }}
                            onBlur={() => {
                                if (newFileName.trim()) createFile();
                                else {
                                    setShowNewFileInput(false);
                                    setParentForNewItem(null);
                                }
                            }}
                        />
                    </div>
                )}

                {/* New Folder Input */}
                {showNewFolderInput && (
                    <div className="new-item-input">
                        <input
                            autoFocus
                            type="text"
                            placeholder="folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') createFolder();
                                if (e.key === 'Escape') {
                                    setShowNewFolderInput(false);
                                    setParentForNewItem(null);
                                }
                            }}
                            onBlur={() => {
                                if (newFolderName.trim()) createFolder();
                                else {
                                    setShowNewFolderInput(false);
                                    setParentForNewItem(null);
                                }
                            }}
                        />
                    </div>
                )}

                {/* File Tree */}
                <div className="file-tree">
                    {files.length === 0 ? (
                        <div className="empty-state">
                            <p>No files yet</p>
                            <p className="hint">Create a new file to get started</p>
                        </div>
                    ) : (
                        renderItems(files)
                    )}
                </div>
            </div>
        )}
    </div>
);
};

export default FileExplorer;