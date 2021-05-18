const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieParser = require("cookie-parser");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
app.use(cookieParser());
app.use(express.urlencoded());
app.use(express.static("./public"));

// app.get("/cities", (req, res) => {
//     console.log("made it to the cities route");
//     db.getCities()
//         .then((result) => {
//             console.log("result", result);
//         })
//         .catch((e) => console.log(e));
// });

//would normally use a post request for this

// app.get("/add-city", (req, res) => {
//     console.log("made it to add city");
//     db.addCity("Lima", 10555000, "Peru")
//         .then((result) => {
//             console.log("result", result);
//         })
//         .catch((e) => console.log(e));
// });

app.get("/petition", (req, res) => {
    // if (req.cookies.signed) {
    //     res.redirect("/thanks");
    // }
    res.render("petition", {
        layout: "main",
    });
});

app.get("/thanks", (req, res) => {
    res.render("thanks");
});

app.get("/signers", (req, res) => {
    res.render("signers");
});

app.post("/petition", (req, res) => {
    db.addUser(`req.body.firstname req.body.lastname req.body.signature`);
    res.cookie("signed", true);
    res.redirect("/thanks");
});

app.listen(8080, () => console.log("Petition up and running!"));
