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
app.use(cors({
    origin: ['https://note-app-sn2b.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

// db connection
let dbConnection = null;
const initDB = async () => {
    dbConnection = await connectDB();
};
initDB();

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

app.listen(port,()=>{
    console.log(`server Started on http://localhost:${port}`);
})
