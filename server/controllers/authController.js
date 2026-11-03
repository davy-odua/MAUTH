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

//Sending an email verification otp
export const sendVerifyOtp = async (req, res) => {
    try {    
    //Get the user Id to verify the user using their email
    const userId = req.userId;
    //Find the user from the database
    const user = await userModel.findById(userId);
    //If the account is already verified
    if(user.isAccountVerified){
        return res.json({success: false, message: "Account Already Verified"});
    }
    //If account is not yet verified, add the script to generate an otp and send to user email
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    //Now save this otp in the database for this user
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();
    //After updating and saving the user, we will then send the otp to the user's email
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: "Account verification OTP",
        text: `Your OTP is ${otp}. Verify your account using this OTP.`
    }
    await transporter.sendMail(mailOptions);

    res.json({success: true, message: "Verification email sent successfylly"});

        
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}

//Now create a function for the user to enter the otp sent on their email
export const verifyEmail = async (req, res) => {
    const userId = req.userId;
    const {otp} = req.body;

    if(!userId || !otp){
        return res.json({success: false, message: "Missing Details"});
    }

    try {
        const user = await userModel.findById(userId);
        if(!user){
            return res.json({success: false, message: "User Not found"});
        }
        //if user is available then verify otp
        if(user.verifyOtp === '' || user.verifyOtp !== otp){
            return res.json({success: false, message: "Invalid OTP"});
        }
        //Now that the otp is valid, check for the expiry date
        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({success: false, message: "OTP Expired"});
        }
        //If OTP is not expired then verify the user
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        //Now save the user's data
        await user.save();
        return res.json({success: true, message: "Email Verified Successfully"});


    } catch (error) {
        return res.json({success: false, message: error.message});        
    }
}