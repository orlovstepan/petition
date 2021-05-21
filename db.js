const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres:@localhost:5432/petition"
);
//the last bit of this line is the database we're connecting to

module.exports.getSigners = () => {
    return db.query(`
    SELECT first, last, user_profiles.age, user_profiles.city FROM users
    JOIN user_profiles
    ON users.id = user_profiles.id
    `);
};

module.exports.addUser = (signature) => {
    const q = `
    INSERT INTO signatures (signature)
    values ($1)
    RETURNING *
    `;

    const params = [signature];

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
    const q = `SELECT password, id FROM users WHERE email = $1;`;
    const params = [email];
    return db.query(q, params);
};

module.exports.userProfile = (age, city, url, user_id) => {
    const q = `
    INSERT INTO user_profiles (age, city, url, user_id) values ($1, $2, $3, $4);
    `;
    const params = [age, city, url, user_id];
    return db.query(q, params);
};
