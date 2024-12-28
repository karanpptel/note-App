import noteModel from "../models/noteModel.js";

// add note item
const addNote = async (req, res) => {
    try {
        if (!req.body.title || !req.body.content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const note = new noteModel({
            title: req.body.title,
            content: req.body.content,
            image: req.fileUrl || null,
            createdAt: new Date()
        });

        await note.save();
        res.status(201).json({ 
            success: true, 
            message: "Note Added",
            note: note
        });
    } catch (error) {
        console.error('Error adding note:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error adding note",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

//all note list
const listNote = async (req, res) => {
    try {
        const notes = await noteModel.find({}).sort({ createdAt: -1 });
        res.status(200).json({ 
            success: true, 
            data: notes 
        });
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching notes",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// remove note item
const removeNote = async (req, res) => {
    try {
        const note = await noteModel.findByIdAndDelete(req.body.id);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Note deleted successfully"
        });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({
            success: false,
            message: "Error deleting note",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const updateNote = async (req, res) => {
    try {
        const updateData = {
            title: req.body.title,
            content: req.body.content,
        };

        if (req.fileUrl) {
            updateData.image = req.fileUrl;
        }

        const note = await noteModel.findByIdAndUpdate(
            req.body.id,
            updateData,
            { new: true }
        );

        if (!note) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Note updated successfully",
            note: note
        });
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({
            success: false,
            message: "Error updating note",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export { addNote, listNote, removeNote, updateNote }