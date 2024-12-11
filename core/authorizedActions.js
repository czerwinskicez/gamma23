const db = require("./database");
const userModule = require("./initUsers");

const hello = _ => {
    console.log("hello");
};

module.exports = {
    hello,
};