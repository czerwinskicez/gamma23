const express = require('express');
const path = require('path');

const app = express();
const port = 4000;

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    return res.redirect("/login");
});
app.get('/login', (req, res) => {
    return res.render("index");
});

app.listen(port, () => console.log(`App running at http://localhost:${port}`));

