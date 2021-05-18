const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres:@localhost:5432/petition");
//the last bit of this line is the database we're connecting to

// module.exports.getCities = () => {
//     // here we talk to the tables in the database
//     return db.query(`SELECT * FROM cities`);
// };

module.exports.addUser = (first_name, last_name, timestamp) => {
    const q = `
    INSERT INTO signatures (first_name, last_name, timestamp)
    values ($1, $2, $3)
    `;

    const params = [first_name, last_name, timestamp];

    return db.query(q, params);
};
