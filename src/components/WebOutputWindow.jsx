import React from 'react';

const WebOutputWindow = ({ html, css, js }) => {
    // Combine HTML, CSS, and JS into a single HTML string
    const srcDoc = `
        <html>
            <head>
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>${js}</script>
            </body>
        </html>
    `;

    return (
        <div className="terminal-panel flex flex-col w-full h-full" style={{ height: '100%', minHeight: '300px' }}>
            <div className="terminal-header">
                <div className="terminal-tabs">
                    <button className="terminal-tab active">
                        <span className="terminal-tab-icon">🌐</span>
                        Output
                    </button>
                </div>
            </div>
            <div className="terminal-body" style={{ flex: 1, backgroundColor: '#fff', padding: 0 }}>
                <iframe
                    srcDoc={srcDoc}
                    title="output"
                    sandbox="allow-scripts"
                    frameBorder="0"
                    width="100%"
                    height="100%"
                    style={{ border: 'none', backgroundColor: '#fff' }}
                />
            </div>
        </div>
    );
};

export default WebOutputWindow;