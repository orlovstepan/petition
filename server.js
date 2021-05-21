const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./utils/bc");

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

app.get("/", (req, res) => {
    res.redirect("/petition");
});

app.get("/petition", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/registration");
    } else {
        if (req.session.signed) {
            res.redirect("/thanks");
        } else {
            res.render("petition");
        }
    }
});

app.get("/thanks", (req, res) => {
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
            console.log(rows);
            res.render("signers", {
                rows,
            });
        })
        .catch((e) => {
            console.log("error:", e);
        });
});

app.post("/petition", (req, res) => {
    console.log("req.body", req.body);
    db.addUser(req.body.signature)
        .then(({ rows }) => {
            // console.log("req.session", req.session);
            req.session.signed = true;
            // console.log("req.session after cookies", req.session);
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
    if (
        !req.body.firstname ||
        !req.body.lastname ||
        !req.body.email ||
        !req.body.password
    ) {
        res.render("registration", {
            errorMsg: "Please fill out all the fields",
        });
    } else {
        hash(req.body.password)
            .then((hashedPw) => {
                db.registerUser(
                    req.body.firstname,
                    req.body.lastname,
                    req.body.email,
                    hashedPw
                )
                    .then(({ rows }) => {
                        //setting up cookie
                        console.log("userID in registration:", rows[0].id);
                        req.session.userId = rows[0].id;
                        res.redirect("/profile");
                    })
                    .catch((e) => console.log(e));
            })
            .catch((e) => console.log("error in hash", e));
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.render("login", {
            errorMsg: "Please fill out all the fields",
        });
    } else {
        let userId;
        db.isUser(req.body.email)
            .then(({ rows }) => {
                console.log("rows in login", rows);
                userId = rows[0].id;
                return rows[0].password;
            })
            .then((password) => {
                compare(req.body.password, password)
                    .then((auth) => {
                        req.session.userId = userId;
                        console.log("cookie in login", req.session);
                        res.redirect("/petition");
                    })
                    .catch((e) => res.render("login"), {
                        errorMsg: "Email or Password is incorrect",
                    });
            })
            .catch((e) => console.log("error in login", e));
    }
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    console.log("userID in profile:", req.session.userId);
    db.userProfile(
        req.body.age,
        req.body.city,
        req.body.url,
        req.session.userId
    )
        .then(() => res.redirect("/petition"))
        .catch((e) => console.log(e));
});

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition up and running!")
);
