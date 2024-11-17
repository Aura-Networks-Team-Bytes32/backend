require("dotenv").config();
const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const authRoutes = require("./src/routes/generation");

const app = express();

app.use(cors())
app.use(express.json());
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("This API is running live🥳");
});


mongoose
  .connect(`${process.env.DB_CONNECTION_STRING}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    const PORT = process.env.PORT || 5003;
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((err) => console.log(err));
