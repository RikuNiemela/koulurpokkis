const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();
const bcrypt = require("bcryptjs");


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// yhteys mongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Yhteys muodostettu tietokantaan"))
  .catch(err => console.error("Virhe tietokantayhteydessä:", err));



const User = mongoose.model("User", {
  username: String,
  password: String,
});

// rekisteröinti
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    password: hashedPassword,
  });n

  await user.save();
  res.send("Käyttäjä rekisteröity!");
});

// kirjautuminen
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) return res.send("Käyttäjää ei löydy!");

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) return res.send("Väärä salasana!");

  res.send("Kirjautuminen onnistui!");
});

// palvelimen käynnistys 
app.listen(3000, () => console.log("Palvelin käynnissä"));
