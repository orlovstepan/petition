const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
// const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
// app.use(cookieParser());

app.use(
    express.urlencoded({
        extended: false,
    })
);

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(csurf());

app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

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

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    // console.log(req.session);
    if (req.session.signed) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

app.get("/thanks", (req, res) => {
    //FINISH HERE TO SHOW THE SIGNATURE OF THE PERSON WHO SIGNED THE PETITION
    if (req.session.signed) {
        const sigId = req.session.signatureId;
        db.getSignature(sigId)
            .then(({ rows }) => {
                let signImage = rows[0].signature;
                res.render("thanks", {
                    signImage,
                });
            })
            .catch((e) => {
                console.log("error in getSignature:", e);
            });
    } else {
        res.render("petition");
    }
});

app.get("/signers", (req, res) => {
    db.getSigners()
        .then(({ rows }) => {
            res.render("signers", {
                rows,
            });
        })
        .catch((e) => {
            console.log("error:", e);
        });
});

app.post("/petition", (req, res) => {
    // console.log("req.body", req.body);
    db.addUser(req.body.firstname, req.body.lastname, req.body.signature)
        .then(({ rows }) => {
            // console.log("rows", rows);
            req.session.signed = true;
            req.session.signatureId = rows[0].id;
            // console.log(result.rows[0].id);
            const signImage = rows[0].signature;
            // console.log("signature", signature);
            // res.redirect("/thanks");
            res.render("thanks", {
                signImage,
            });
        })
        .catch((e) => {
            console.log("error", e);
        });
    // res.cookie("signed", true);
});

app.get("/registration", (req, res) => {
    res.render("registration");
});

app.post("/registration", (req, res) => {
    // console.log(req.body);
    // db.registerUser()
    // res.render("registration");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    res.render("login");
});

app.listen(8080, () => console.log("Petition up and running!"));
