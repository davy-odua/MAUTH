import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        //Get the user using the userId given by the middleware
        const userId = req.userId;

        const user = await userModel.findById(userId);
        //Check if the user exists
        if(!user){
            return res.json({success: false, message: "User Not Found"});   
        }
        //If the user exists then obtain the Details
        res.json({
            success: true,
            userData: {
                name: user.name,
                isAccountVerified: user.isAccountVerified,
            }
        });

    } catch (error) {
        return res.json({success: false, message: error.message});   
    }
}

//The end of the user Controller