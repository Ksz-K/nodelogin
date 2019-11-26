const express = require("express");
const router = express.Router();

//bring model
let Article = require("../models/article");

router.get("/add", (req, res) => {
  res.render("add_article", {
    title: "Add article"
  });
});

//add submit POST routes
router.post("/add", (req, res) => {
  req.checkBody("title", "Title is required").notEmpty();
  req.checkBody("author", "Author is required").notEmpty();
  req.checkBody("body", "Article text content is required").notEmpty();

  //Get errrrror
  let errors = req.validationErrors();

  if (errors) {
    res.render("add_article", {
      title: "Add Article",
      errors: errors
    });
  } else {
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
  }
});

//LOAD edit form
router.get("/edit/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render("edit_article", {
      title: "Edit Article",
      article: article
    });
  });
});

//UPDATE submit
router.post("/edit/:id", (req, res) => {
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
router.delete("/:id", function(req, res) {
  let query = { _id: req.params.id };
  Article.deleteOne(query, function(error) {
    if (error) {
      console.log(error);
    }
    res.send("Success");
  });
});

//get single article
router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render("article", {
      article: article
    });
  });
});
module.exports = router;
