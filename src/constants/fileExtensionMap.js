// Map file extensions to programming languages
export const fileExtensionMap = {
    // C/C++
    'c': 'c',
    'cpp': 'cpp',
    'cc': 'cpp',
    'cxx': 'cpp',
    'h': 'cpp',
    'hpp': 'cpp',
    
    // Python
    'py': 'python',
    'python': 'python',
    
    // JavaScript/TypeScript
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    
    // Java
    'java': 'java',
    
    // C#
    'cs': 'csharp',
    'csharp': 'csharp',
    
    // PHP
    'php': 'php',
    
    // Ruby
    'rb': 'ruby',
    'ruby': 'ruby',
    
    // Go
    'go': 'go',
    
    // Rust
    'rs': 'rust',
    
    // Swift
    'swift': 'swift',
    
    // Kotlin
    'kt': 'kotlin',
    'kts': 'kotlin',
    
    // R
    'r': 'r',
    'R': 'r',
    
    // Scala
    'scala': 'scala',
    
    // Bash
    'sh': 'bash',
    'bash': 'bash',
    
    // SQL
    'sql': 'sql',
    
    // HTML
    'html': 'html',
    'htm': 'html',
    
    // CSS
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    
    // JSON
    'json': 'json',
    
    // XML
    'xml': 'xml',
    
    // YAML
    'yaml': 'yaml',
    'yml': 'yaml',
    
    // Markdown
    'md': 'markdown',
    'markdown': 'markdown',
};

// Reverse map - language to common extension
export const languageToExtension = {
    'c': 'c',
    'cpp': 'cpp',
    'python': 'py',
    'javascript': 'js',
    'typescript': 'ts',
    'java': 'java',
    'csharp': 'cs',
    'php': 'php',
    'ruby': 'rb',
    'go': 'go',
    'rust': 'rs',
    'swift': 'swift',
    'kotlin': 'kt',
    'r': 'r',
    'scala': 'scala',
    'bash': 'sh',
    'sql': 'sql',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'markdown': 'md',
};

export const getLanguageFromFileName = (fileName) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return fileExtensionMap[ext] || 'javascript';
};