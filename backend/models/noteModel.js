import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: false },
   
}, {timestamps: true})

const noteModel = mongoose.model("note", noteSchema)

export default noteModel;