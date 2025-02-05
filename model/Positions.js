import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const positionSchema = new mongoose.Schema({
    region: String,
    ville: String,
    quartier: String,
    codePostal: Number,
    location: {
        type: { type: String, enum: ["Point"], required: true },
        coordinates: { type: [Number], required: true }, // [Longitude, Latitude]
    },
});
const Position = mongoose.model("Position", positionSchema,"Position");
export default Position;
