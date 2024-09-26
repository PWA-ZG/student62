const express = require("express");
const path = require("path");
const multer = require("multer");
const idbKeyval = require("idb-keyval");
const https = require("https");
const fs = require("fs");

const app = express();

const externalUrl = process.env.RENDER_EXTERNAL_URL;
const port =
  externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 4080;

// Postavite putanju do vašeg statičkog sadržaja (HTML, CSS, JS, slike, ...)
app.use(express.static(path.join(__dirname, "")));

// Ruta za serviranje index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "", "index.html"));
});

//Spremanje podataka za background sync
app.post("/saveData", function (req, res) {});

//Konfiguriranje servera
const options = {
  key: fs.readFileSync("localhost-key.pem"),
  cert: fs.readFileSync("localhost.pem"),
};
if (externalUrl) {
  const hostname = "0.0.0.0";
  app.listen(port, hostname, () => {
    console.log(
      `Server locally running at http://${hostname}:${port}/ and from outside on ${externalUrl}`
    );
  });
} else {
  https.createServer(options, app).listen(port, function () {
    console.log(`Server running at https://localhost:${port}/`);
  });
}
