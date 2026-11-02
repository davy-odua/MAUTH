import userModel from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

//lets create the function for the register controller

export const register = async (req, res) => {
    const {name, email, password} = req.body;

    //Check if all fields are filled
    if(!name || !email || !password){
        return res.json({success: false, message: "All Fields are required"});
    }

    try {
        //Check if the user already exists
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.json({success: false, message: "User already exists"})
        }

        //Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);
        //Now you can save the user
        const user = new userModel({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        //Create and send the token inside a cookie
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d' });

        //Send the token inside of a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV==='production',
            sameSite: process.env.NODE_ENV==='production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 *60 * 1000
        });

        //Send welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject : 'Welcome to Mern-Authentication',
            text: `Welcome to Mern-Authentication. Your account has been created with email id: ${email}`
        }
        await transporter.sendMail(mailOptions);
        
        res.json({success: true, message: "User registered successfully"});

    } catch (error) {
        return res.json({success: false, message: error.message});
    }

}

// Lets create the function for the login controller
export const login = async (req, res) => {
    const {email, password} = req.body
    //If the user does not give all details
    if(!email || !password){
        return res.json({success: false, message: "All fields are required"});
    }
    try {
        //Find out if the user actually exists
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "Invalid email"})
        }

        //Find out if the password actually matches
        const isMatching = await bcrypt.compare(password, user.password)
        if(!isMatching){
            res.json({success: false, message: "Invalid password"})
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d' });

        //Send the token inside of a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV==='production',
            sameSite: process.env.NODE_ENV==='production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 *60 * 1000
        });

        return res.json({success: true, message: "User logged in successfully"});
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

export const logout = async (req, res) => {
    try {
        //Now we have to clear the cookie from the response
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV==='production',
            sameSite: process.env.NODE_ENV==='production' ? 'none' : 'strict',
        });    

        return res.json({success: true, message: "User Logged out"});
        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}