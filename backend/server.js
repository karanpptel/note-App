import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import noteRouter from "./routes/noteRoutes.js"
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'

//app config
const app = express()
const port = process.env.PORT || 4000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middleware
app.use(express.json())

// CORS configuration
app.use(cors({
    origin: '*',  // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    credentials: true,
    maxAge: 86400
}));

// Additional headers for CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// db connection
let dbConnection = null;
const initDB = async () => {
    try {
        dbConnection = await connectDB();
        if (!dbConnection) {
            console.error('Failed to connect to database. Server will continue to run but database operations will fail.');
        }
    } catch (error) {
        console.error('Database initialization error:', error);
    }
};

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// api endpoints
app.use("/api/note", noteRouter)

app.get("/", (req,res)=> {
    res.json({
        message: "Hello Vercel - API is Working!",
        status: "online",
        dbStatus: dbConnection ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
    });
})

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

initDB();

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
