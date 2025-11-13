import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8080;

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Serve static files from current directory
app.use(express.static(__dirname));

// Serve the debug HTML file at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'debug-react-flow.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 Debug server running at http://localhost:${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} to test the React flow`);
});