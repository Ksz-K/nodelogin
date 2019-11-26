const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const config = require("./config/database");

//bring model
let Article = require("./models/article");

const mongoose = require("mongoose");
mongoose.set("useUnifiedTopology", true);
//mongoose.connect("mongodb://localhost/nodekb", { useNewUrlParser: true });
mongoose.connect(config.database, config.newparser);
let db = mongoose.connection;

//set public folder
app.use(express.static(path.join(__dirname, "public")));

//expresss sesssion middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
    // cookie: { secure: true }
  })
);

//express MESSAGES middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//Express VAlidator Middleware
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;
      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

db.once("open", () => {
  console.log("Mongo podlaczone...");
});

db.on("error", err => {
  console.log(err);
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Passport config
require("./config/passport")(passport);
//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//HOME ROUTE
app.get("/", (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Articles",
        articles: articles
      });
    }
  });
  /*  let articles = [
    {
      id: 1,
      title: "Article One",
      author: "Kszꓘ",
      body: "This is article one"
    },
    {
      id: 2,
      title: "Article Two",
      author: "Ktosiek",
      body: "This is article two"
    },
    {
      id: 3,
      title: "Article Three",
      author: "Kszꓘ",
      body: "This is article three"
    }
  ]; */

  /*  res.render("index", {
    title: "Articles",
    articles: articles
  }); */
});

//ROUTE files
let articles = require("./routes/articles");
let users = require("./routes/users");
app.use("/articles", articles);
app.use("/users", users);

//start server
app.listen(3000, () => {
  console.log("serwer slucha na porcie 3000...");
});
