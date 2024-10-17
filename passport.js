const passport = require("passport");
const googleStrategy = require("passport-google-oauth2").Strategy;
const User = require('./models/userModel')


passport.serializeUser((user,done)=>{
    done(null, user);
})

passport.deserializeUser((user,done)=>{
    done(null,user);
})

passport.use(new googleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://13.60.234.171:3000/auth/google/callback",
    passReqToCallback: true
}, async (request, accessToken, refreshToken, profile, done) => {
    try {
       
        let user = await User.findOne({ email: profile.email});
       
        
        
        if (!user) {
           
            
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                is_admin: 0, 
                
            });

            await user.save();
        }

        
        done(null, user);
    } catch (error) {
        console.error("Error in Google strategy callback:", error);
        done(error, null);
    }
}));