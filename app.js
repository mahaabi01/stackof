const express = require("express");
const { users } = require("./model/index");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("./model/index");

app.set("view engine", "ejs"); //create ejs as view engine (ui engine/ templating engine)
app.use(express.urlencoded({ extended: true })); // this code tells node js to server side rendering
app.use(express.json()); // if data come from outside like react, vue js
app.use(express.static("public/css/")); // this code give access to any other folders

app.get("/home", (req, res) => {
  res.render("home.ejs");
});

app.get("/register", (req, res) => {
  res.render("auth/register");
});

//get all users
app.get("/users", async (req, res) => {
  const data = await users.findAll();
  res.json({
    data,
  });
});

//post method is used to send data to server to create or update a resource
app.post("/register", async (req, res) => {
  const { username, password, email } = req.body; // this is the process of destructuring in javascripts
  if (!username || !password || !email) {
    return res.send("Please provide username, email, password.");
  } //basic server side validation

  const data = await users.findAll({
    where: {
      email: email,
    },
  });
  if (data.length > 0) {
    return res.send("Already register email.");
  }

  await users.create({
    email, // if key value same this is enough
    password: bcrypt.hashSync(password, 10), //bcrypt is used for hashing purpose
    username,
  });
  res.send("Registered successfully !");
});

//login route
app.get("/login", (req, res) => {
  res.render("auth/login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.send("Please provide email, password");
  }
  //email check
  const [data] = await users.findAll({
    where: {
      email: email,
    },
  });
  if (data) {
    //checking of password
    const isMatched = bcrypt.compareSync(password, data.password);

    //login the user if isMatch is true
    if (isMatched) {
      const token = jwt.sign({ id: data.id }, "password", { expiresIn: "30d" });
      res.cookie('jwttoken', token);
      console.log(token);
      res.send("Logged in success.");
    } else {
      res.send("Invalid email/password");
    }
  } else {
    res.send("No user with that email.");
  }
});

// console.log(app.listen(port, hostname, backlog))
app.listen(3000, () => {
  console.log("Project has started at port 3000");
});
