const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const { hash, compare } = require("./utils/bc");
const {
    requireLoggedInUser,
    requireLoggedOutUser,
    requireNoSignature,
    requireSignature,
} = require("./middleware");

const COOKIE_SECRET =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

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
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

app.use(csurf());

app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use(requireLoggedInUser);

app.get("/", (req, res) => {
    res.redirect("/petition");
});

/////// PETITION /////////

app.get("/petition", requireNoSignature, (req, res) => {
    res.render("petition");
    // if (!req.session.userId) {
    //     res.redirect("/registration");
    // } else {
    //     if (req.session.signed) {
    //         res.redirect("/thanks");
    //     } else {
    //         res.render("petition");
    //     }
    // }
});

app.post("/petition", requireNoSignature, (req, res) => {
    // console.log("req.body", req.body);
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
            res.redirect("/thanks");
        })
        .catch((e) => {
            console.log("error", e);
        });
    // res.cookie("signed", true);
});

/////// THANKS /////////

app.get("/thanks", requireSignature, (req, res) => {
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

app.post("/thanks", requireSignature, (req, res) => {
    // console.log("req.session", req.session);
    db.deleteSignature(req.session.signatureId)
        .then((result) => {
            req.session.signatureId = null;
            res.redirect("/petition");
        })
        .catch((e) =>
            res.render("thanks", {
                errorMsg: "Sorry, we could not delete your signature",
            })
        );
});

/////// SIGNERS /////////

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

app.get("/signers/:city", requireSignature, (req, res) => {
    db.getByCity(req.params.city)
        .then(({ rows }) => {
            console.log(rows);
            res.render("cities", {
                rows,
                city: req.params.city,
            });
        })
        .catch((e) => console.log("error in cities", e));
});

/////// REGISTRATION /////////

app.get("/registration", requireLoggedOutUser, (req, res) => {
    res.render("registration");
});

app.post("/registration", requireLoggedOutUser, (req, res) => {
    // console.log(req.body);
    if (
        !req.body.firstname ||
        !req.body.lastname ||
        !req.body.email ||
        !req.body.password
    ) {
        res.render("registration", {
            errorMsg: "please fill out all the fields",
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
                        // console.log("userID in registration:", rows[0].id);
                        req.session.userId = rows[0].id;
                        res.redirect("/profile");
                    })
                    .catch((e) => {
                        res.render("registration", {
                            errUniq:
                                "this email is already used, please log in",
                        });
                        console.log("error in registration", e);
                    });
            })
            .catch((e) => {
                console.log("error in hash", e);
            });
    }
});

/////// LOGIN /////////

app.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login");
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.render("login", {
            errorMsg: "please fill out all the fields",
        });
    } else {
        let userId;
        db.isUser(req.body.email)
            // .then(({ rows }) => {
            //     // console.log("rows in login", rows);
            //     return rows[0].password;
            // })
            .then(({ rows }) => {
                userId = rows[0].id;
                // console.log(rows);
                // console.log("req.body.password", req.body.password);
                compare(req.body.password, rows[0].password)
                    .then((auth) => {
                        if (auth) {
                            req.session.userId = userId;
                            // console.log("cookie in login", req.session);
                            // console.log("auth", auth);
                            res.redirect("/petition");
                        } else {
                            // console.log("rendering with error");
                            res.render("login", {
                                errorMsg: "email or password is incorrect",
                            });
                        }
                    })
                    .catch((e) => res.render("login"), {
                        errorMsg: "email or password is incorrect",
                    });
            })
            .catch((e) => console.log("error in login", e));
    }
});

/////// PROFILE /////////

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    // console.log("userID in profile:", req.session.userId);
    db.userProfile(
        req.body.age,
        req.body.city,
        req.body.url,
        req.session.userId
    )
        .then(() => res.redirect("/petition"))
        .catch((e) => console.log(e));
});

/////// EDIT PROFILE /////////

app.get("/edit", (req, res) => {
    db.prepopulateFields(req.session.userId)
        .then(({ rows }) => {
            // console.log("req.session.userId", req.body);
            // console.log(rows);
            res.render("edit", {
                rows,
            });
        })
        .catch((e) => console.log(e));
});

app.post("/edit", (req, res) => {
    // console.log(req.body);
    if (!req.body.password) {
        db.updateUsers(
            req.session.userId,
            req.body.firstname,
            req.body.lastname,
            req.body.email
        )
            .then((result) => {
                db.updateUserProfiles(
                    req.body.age,
                    req.body.city,
                    req.body.url,
                    req.session.userId
                )
                    .then((result) => {
                        db.prepopulateFields(req.session.userId).then(
                            ({ rows }) => {
                                res.render("edit", {
                                    rows,
                                    msg: "your changes have been saved",
                                });
                            }
                        );
                    })
                    .catch((e) => console.log(e));
            })
            .catch((e) => console.log(e));
    } else {
        hash(req.body.password).then((hashedPw) => {
            db.updatePassword(
                req.session.userId,
                req.body.firstname,
                req.body.lastname,
                req.body.email,
                hashedPw
            )
                .then((result) => {
                    db.updateUserProfiles(
                        req.body.age,
                        req.body.city,
                        req.body.url,
                        req.session.userId
                    );
                })
                .then((result) => {
                    db.prepopulateFields(req.session.userId).then(
                        ({ rows }) => {
                            res.render("edit", {
                                rows,
                                msg: "your changes have been saved",
                            });
                        }
                    );
                })
                .catch((e) =>
                    res.render("edit", {
                        errorMsg:
                            "unfortunately, your chages could not be saved",
                    })
                );
        });
    }
});

app.get("/logout", (req, res) => {
    req.session.userId = null;
    console.log(req.session);
    res.redirect("/login");
});

app.listen(process.env.PORT || 8080, () =>
    console.log("Petition up and running!")
);
