import noteModel from "../models/noteModel.js";
import fs from 'fs'

// add note item
const addNote = async (req, res) => {
    try {
        const note = new noteModel({
            title: req.body.title,
            content: req.body.content,
            image: req.file ? req.file.filename : null,
            createdAt: req.body.date,
        });

        await note.save();
        res.status(200).json({ success: true, message: "Note Added" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error adding note" });
    }
}


//all note list
const listNote = async (req, res) => {
    try {
        const notes = await noteModel.find({});
        res.json({ success: true, data: notes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching notes" });
    }
};
// const listNote = async (req, res) => {
//     try {
//       console.log("Fetching notes...");
//       const notes = await noteModel.find({});
//       console.log("Notes fetched:", notes);
//       res.json({ success: true, data: notes });
//     } catch (error) {
//       console.error("Error fetching notes:", error);
//       res.status(500).json({ success: false, message: "Error fetching notes" });
//     }
//   };


// remove note item

const removeNote = async (req, res) => {

    try {
        const note = await noteModel.findById(req.body.id);
        fs.unlink(`uploads/${note.image}`, () => { })

        await noteModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Note Removed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });

    }

}

const updateNote = async (req, res) => {
    try {
        // Find the note by ID
        const note = await noteModel.findById(req.body.id);

        if (!note) {
            return res.status(404).json({ success: false, message: "Note not found" });
        }

        // If a new image is uploaded, delete the old one
        if (req.file) {
            const oldImagePath = `uploads/${note.image}`;
            fs.unlink(oldImagePath, (err) => {
                if (err) console.error(`Error deleting old image: ${err}`);
            });

            note.image = req.file.filename; // Update the image filename
        }

        // Update other fields
        note.title = req.body.title || note.title;
        note.content = req.body.content || note.content;
        note.createdAt = req.body.date || note.createdAt;

        // Save the updated note
        await note.save();

        res.status(200).json({ success: true, message: "Note Updated", data: note });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating note" });
    }
};


export { addNote, listNote, removeNote, updateNote }