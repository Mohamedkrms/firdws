const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            processDir(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            if (content.includes('http://localhost:5000') || content.includes('const API_URL = import.meta.env')) {
                // Remove local declarations of API_URL
                content = content.replace(/\s*const API_URL = [^;]+;/g, '');

                // Add import if not present
                if (!content.includes('import { API_URL }')) {
                    const importStatement = `import { API_URL } from '@/config';\n`;
                    // Find last import
                    const lastImportIndex = content.lastIndexOf('import ');
                    if (lastImportIndex !== -1) {
                        const nextLineIndex = content.indexOf('\n', lastImportIndex);
                        content = content.slice(0, nextLineIndex + 1) + importStatement + content.slice(nextLineIndex + 1);
                    } else {
                        content = importStatement + '\n' + content;
                    }
                }

                // Replace strings
                content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`${API_URL}$1`');
                content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`${API_URL}$1`');
                content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`${API_URL}$1`');

                fs.writeFileSync(filePath, content);
                console.log('Updated ' + filePath);
                modified = true;
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
