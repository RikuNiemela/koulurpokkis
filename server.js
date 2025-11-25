// Express palvelin sovellusta varten
const express = require("express");
// Mongoose joka hoitaa yhteyden tietokantaan
const mongoose = require("mongoose");
// Lukee POST pyynnöistä lomakedatan
const bodyParser = require("body-parser");
// Lataa .env tiedoston ympäristönmuuttujat käyttöön
require('dotenv').config();
// Hajauttaa ja vertaa salasanoja
const bcrypt = require("bcryptjs");

// luodaan express sovellus
const app = express();
// otetaan bodyparser käyttöön
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// yhteys mongoDB tietokantaan .env tiedoston muuttujan avulla
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Yhteys muodostettu tietokantaan"))
  .catch(err => console.error("Virhe tietokantayhteydessä:", err));


// määrittelee käyttäjän tiedot tietokannassa
const User = mongoose.model("User", {
  username: String,
  password: String,
});

// rekisteröinti
app.post("/register", async (req, res) => {
  // hakee käyttäjätunnuksen ja salasanan
  const { username, password } = req.body;
// hajautetaan salasana ennen tallennusta
  const hashedPassword = await bcrypt.hash(password, 10);
// luodaan uusi käyttäjä tietokantaan
  const user = new User({
    username,
    password: hashedPassword,
  });n
// tallennetaan käyttäjä
  await user.save();
  // lähetetään vastaus selaimelle
  res.send("Käyttäjä rekisteröity!");
});

// kirjautuminen
app.post("/login", async (req, res) => {
  // haetaan käyttäjätunnus ja salasana
  const { username, password } = req.body;
  // Etsitään tietokannasta käyttäjä
  const user = await User.findOne({ username });
  // Jos käyttäjää ei löydy lähetetään virheviesti
  if (!user) return res.send("Käyttäjää ei löydy!");
  // Verrataan salasanaa tietokannassa olevaan hajautettuun salasanaan
  const valid = await bcrypt.compare(password, user.password);
  // Jos salasalana on väärä lähetetään virheviesti
  if (!valid) return res.send("Väärä salasana!");
  // Jos kaikki on oikein lähetetään onnistumisviesti
  res.send("Kirjautuminen onnistui!");
});

// palvelimen käynnistys 
app.listen(3000, () => console.log("Palvelin käynnissä"));

