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
