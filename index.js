const express = require('express');
const app = express();
const port = 4000;

app.get('/', (req, res) => res.send({"Hello": "gamma!"}));

app.listen(port, () => console.log(`App running at http://localhost:${port}`));
