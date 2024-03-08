require('dotenv').config()
const express = require('express')
const app = express();
const cors = require('cors')
const PORT = process.env.PORT || 8080;
const connectDB = require('./db')
app.use(express.json())

const corsOption = {
    origin:"http://localhost:3000",
    methods:"GET,POST,PUT,DELETE, PATCH,HEAD",
}

app.use(cors(corsOption))
app.use('/api', require("./Routes/Data"))
app.use('/api', require("./Routes/GetStudent"))



app.get('/', (req, res) => {
    res.send("hello world")
})

connectDB()
app.listen(PORT, () => {
    console.log(`app is listening on the port http://localhost:${PORT} `)
})