import express from "express"
import multer from "multer"
import { addNote, listNote, removeNote, updateNote } from "../controllers/noteController.js";
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const noteRouter = express.Router();

// Storage configuration for image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({ storage });

noteRouter.post("/add", upload.single("image"), addNote);
noteRouter.get("/list", listNote);
noteRouter.post("/remove", removeNote);
noteRouter.post("/update", upload.single("image"), updateNote);

export default noteRouter;
