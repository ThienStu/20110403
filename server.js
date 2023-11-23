const path=require('path');
const express=require('express');
const { default: helmet } = require('helmet');
const passport = require('passport');
const {Strategy} = require('passport-google-oauth20');
const cookieSession = require('cookie-session');
const {verify}=require('crypto')
const PORT=3000;
const app=express();

require('dotenv').config();
const config={
    CLIENT_ID:process.env.CLIENT_ID,
    CLIENT_SECRET:process.env.CLIENT_SECRET,
    COOKIE_KEY1:process.env.COOKIE_KEY_1,
    COOKIE_KEY2:process.env.COOKIE_KEY_2
}
const AUTH_OPTIONS={
    callbackURL: '/auth/google/callback',
    clientID:config.CLIENT_ID,
    clientSecret:config.CLIENT_SECRET
}


function verifyCallback(accessToken,refreshToken,profile,done){
    console.log('Gg profile',profile);
    done(null,profile);
}
passport.use(new Strategy(AUTH_OPTIONS,verifyCallback));
passport.serializeUser((user,done)=>{
    done(null,user.id);
})
passport.deserializeUser((id,done)=>{
    // User.findById(id).then(user=>{
    //     done(null,obj)
    // });
    done(null,id)
})
app.use(helmet());
app.use(cookieSession({
    name:'session',
    maxAge: 3000,
    keys: [config.COOKIE_KEY1,config.COOKIE_KEY2]
}));

app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req, res, next) {
    const isLoggedIn=req.isAuthenticated()&&req.user;
    if(!isLoggedIn){
        return res.status(401).json({
            error:'You must be logged in'
        })
    }
    next();
}
app.get('/auth/google',
passport.authenticate('google',{
    scope:['email']}));

app.get('/auth/google/callback',
    passport.authenticate('google',{
        failRedirect:'/failure',
        succesRedirect:'/',
        session:true
    }),(req,res)=>{
        console.log('Google called us back')
    });
app.get('/auth/logout',(req,res)=>{
    req.logout();
    return res.redirect('/');
});
app.get('/failure',(req,res)=>{
    return res.send('FAiled to log in!')
});
app.get('/secret',checkLoggedIn,(req,res)=>{
    return res.send('Your personal secret value is 42!')
});

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'));

});
app.listen(PORT,()=>{
    console.log(`listening on port ${PORT}`);
});