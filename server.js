if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}



const methodOverride = require("method-override")
const express = require("express")
const app = express()
const users = []
const bcrypt = require("bcrypt")
const passport= require("passport")
const flash = require("express-flash")
const session = require("express-session")

const initializedPassport =  require("./passport-config")
initializedPassport(passport, 
    email=> users.find(user => user.email === email),
    id=> users.find(user => user.id === id)
    )

app.set("view-engine", "ejs")
app.use(express.urlencoded({extended: false}))
app.use(flash)
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(methodOverride("_method"))
app.use(passport.initialize())
app.use(passport.session())
app.get("/", checkAuthenticated, (req, res)=> {
    res.render("index.ejs", {name: req.user.name})
})

app.get("/login",checknotAuthenticated, (req, res)=> {
    res.render("login.ejs")
})

app.get("/register", checknotAuthenticated,(req, res)=> {
    res.render("register.ejs")
})

app.post("/login", checknotAuthenticated, passport.authenticate("local",{
    successRedirect: "/",
    failureRedirect: "/login",
    failureflash: true
}))

app.post("/register", checknotAuthenticated,async (req, res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect("/login")
    } catch{
        res.redirect("/register")
    } console.log(users)
})

app.delete("/logout", (req, res)=>{
    req.logOut()
    res.redirect("/login")
})


function checkAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checknotAuthenticated(req, res, next){
    if (req.isAuthenticated()){
    return res.redirect("/")
}
next()
}



app.listen(5000)