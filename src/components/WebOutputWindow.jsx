import React from 'react';
import { FaGlobe } from 'react-icons/fa';

const WebOutputWindow = ({ html, css, js }) => {
    const end = '/script>';
    const srcDoc = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>${css || ''}</style>
</head>
<body>
${html || ''}
<script>${js || ''}<${end}
</body>
</html>`;

    return (
        <div className="terminal-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '300px' }}>
            <div className="terminal-header">
                <div className="terminal-tabs">
                    <button className="terminal-tab active">
                        <span className="terminal-tab-icon"><FaGlobe /></span>
                        Output
                    </button>
                </div>
            </div>
            <div style={{ flex: 1, backgroundColor: '#fff', overflow: 'hidden', borderRadius: '0 0 8px 8px' }}>
                <iframe
                    srcDoc={srcDoc}
                    title="output"
                    sandbox="allow-scripts"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                    style={{ border: 'none', display: 'block' }}
                />
            </div>
        </div>
    );
};

export default WebOutputWindow;