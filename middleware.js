module.exports.requireLoggedInUser = (req, res, next) => {
    if (
        !req.session.userId &&
        req.url != "/login" &&
        req.url != "/registration"
    ) {
        res.redirect("/registration");
    } else {
        next();
    }
};

module.exports.requireLoggedOutUser = (req, res, next) => {
    if (req.session.userId) {
        res.redirect("/petition");
    } else {
        next();
    }
};

module.exports.requireNoSignature = (req, res, next) => {
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        next();
    }
};

module.exports.requireSignature = (req, res, next) => {
    if (!req.session.signed) {
        res.redirect("/petition");
    } else {
        next();
    }
};
