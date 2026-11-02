import mongoose from "mongoose";

//Create a new schema - structure of the data
const userSchema = new mongoose.Schema({
    name: {type: String, required: true,},
    email: {type: String, required: true, unique: true, toLowerCase: true, trim: true},
    password: {type: String, required: true, },
    verifyOtp: {type: String, default:''},
    verifyOtpExpireAt: {type: Number, default: 0},
    isAccountVerified: {type: Boolean, default: false},
    resetOtp: {type: String, default:''},
    resetOtpExpireAt: {type: Number, default:0}
});

//Now lets create the model from the BluePrint

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;