import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    //Here we are getting the cookies and then from the cookies, we are getting the token,
    //And then from the token, we are getting the userId
    const {token} = req.cookies;
    
    if(!token){
        return res.json({success: false, message: "Not Authorized Login Again"});       
    }
    //If token is available
    try {
        // Now we decode the token
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET); 
        //On this decoded token, we will find the Id because we used the userId to create this token
        if(tokenDecode.id){
            req.userId = tokenDecode.id
        }else{
            return res.json({success: false, message: "Not Authorized. Login Again"});              
        }

        next()
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export default userAuth;