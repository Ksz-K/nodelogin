const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");
const flash = require("connect-flash");
const session = require("express-session");

let Article = require("./models/article");

const mongoose = require("mongoose");
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/nodekb", { useNewUrlParser: true });
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

//get single article
app.get("/article/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render("article", {
      article: article
    });
  });
});

app.get("/articles/add", (req, res) => {
  res.render("add_article", {
    title: "Add article"
  });
});

//add submit POST routes
app.post("/articles/add", (req, res) => {
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save(err => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article added");
      res.redirect("/");
    }
  });
});

//LOAD edit form
app.get("/article/edit/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render("edit_article", {
      title: "Edit Article",
      article: article
    });
  });
});

//UPDATE submit
app.post("/articles/edit/:id", (req, res) => {
  let article = {};

  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query = { _id: req.params.id };

  Article.update(query, article, err => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article updated");
      res.redirect("/");
    }
  });
});

//obsluga DELETE
app.delete("/article/:id", function(req, res) {
  let query = { _id: req.params.id };
  Article.deleteOne(query, function(error) {
    if (error) {
      console.log(error);
    }
    res.send("Success");
  });
});

//start server
app.listen(3000, () => {
  console.log("serwer slucha na porcie 3000...");
});
