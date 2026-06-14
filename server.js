require("dotenv").config()

const express = require("express")
const helmet = require("helmet")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const mongoose = require("mongoose")
const dbConnection = require("./config/dbConnection")
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const errorHandler = require("./middleware/errorHandler")

const app = express()

dbConnection()

app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
)
app.use(express.json({ limit: "10kb" }))
app.use(cookieParser())

app.use("/api/users", userRoutes)
app.use("/api/auth", authRoutes)

app.use(errorHandler)

mongoose.connection.once("open", () => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server on port ${process.env.PORT || 5000}`)
  })
})
