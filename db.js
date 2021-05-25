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
    JOIN signatures
    ON signatures.id = users.id; 
    `);
};

module.exports.getByCity = (city) => {
    const q = `
    SELECT users.first, users.last, age 
    FROM user_profiles
    RIGHT JOIN users
    ON user_profiles.id = users.id
    JOIN signatures
    ON signatures.id = users.id
    WHERE LOWER(city) = LOWER($1)
    `;
    const params = [city];
    return db.query(q, params);
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

module.exports.prepopulateFields = (id) => {
    const q = `
    SELECT users.id, users.first, users.last, users.email, user_profiles.age, user_profiles.city, user_profiles.url FROM users
    JOIN user_profiles
    ON user_profiles.id = users.id 
    WHERE users.id = $1
    ;`;
    const params = [id];
    return db.query(q, params);
};

module.exports.updateUserProfiles = (age, city, url, user_id) => {
    const q = `
    INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $1, city = $2, url  = $3
    ;`;
    const params = [age, city, url, user_id];
    return db.query(q, params);
};

module.exports.updateUsers = (id, first, last, email) => {
    const q = `UPDATE users 
               SET first = $2,last = $3, email = $4
               WHERE id = $1 ;`;

    const params = [id, first, last, email];
    return db.query(q, params);
};

module.exports.updatePassword = (first, last, email, password) => {
    const q = `
    INSERT INTO users (first, last, email, password)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email)
    DO UPDATE SET first = $1, last = $2, email = $3, password = $4
    ;`;
    const params = [first, last, email, password];
    return db.query(q, params);
};

module.exports.deleteSignature = (id) => {
    const q = `
    DELETE FROM signatures signature WHERE id = $1
    `;
    const params = [id];
    return db.query(q, params);
};
