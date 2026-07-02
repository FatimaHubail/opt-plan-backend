const result = require("dotenv").config();

console.log("DOTENV RESULT:", result);
console.log("DATABASE_URI:", process.env.DATABASE_URI);

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
    origin: "http://localhost:5173",
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
