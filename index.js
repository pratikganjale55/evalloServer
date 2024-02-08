const express = require("express") ;
const app = express() ;
const dotenv = require("dotenv") ;
const cors = require("cors") ;
const path = require('path');
const connection = require("./src/Database/connection") ;
const router = require("./src/Routes/contentRoute") ;
dotenv.config() ;

app.use(cors()) ;
app.use(express.urlencoded({ extended: true }));
app.use(express.json()) ;
app.use(express.static("files"))
app.use("/", router)
 
app.listen(process.env.PORT || 8080, async() => {
    await connection ;
    console.log(`Server start at ${process.env.PORT}`)
})

module.exports = app ;