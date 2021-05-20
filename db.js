const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres:@localhost:5432/petition");
//the last bit of this line is the database we're connecting to

module.exports.getSigners = () => {
    // here we talk to the tables in the database
    return db.query(`SELECT first_name, last_name FROM signatures`);
};

module.exports.addUser = (first_name, last_name, signature) => {
    const q = `
    INSERT INTO signatures (first_name, last_name, signature)
    values ($1, $2, $3)
    RETURNING *
    `;

    const params = [first_name, last_name, signature];

    return db.query(q, params);
};

module.exports.getSignature = (id) => {
    const q = `SELECT signature FROM signatures WHERE id = $1;`;
    const params = [id];
    return db.query(q, params);
};

module.exports.registerUser = (first, last, email, password) => {
    const q = `
    INSERT INTO users (first, last, email, password)
    values ($1, $2, $3, $4)
    RETURNING id
    `;
    const params = [first, last, email, password];
    return db.query(q, params);
};

module.exports.isUser = (email) => {
    const q = `SELECT password FROM users WHERE email = $1;`;
    const params = [email];
    return db.query(q, params);
};
