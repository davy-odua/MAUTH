//This is where we connect our server to the mongodb database
import mongoose from "mongoose";    // Mongoose is the tool that will talk to mongo db for us

const connectDB = async (req, res) => {
    try {
        mongoose.connection.on('connected', () => console.log("Database Connected"));
        await mongoose.connect(`${process.env.MONGODB_URI}/mern-authentication`);      
    } catch (error) {
        console.log("Database connection failed", error.message)
    }
}


export default connectDB;