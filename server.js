const express = require("express");
const app = express();
const fs = require("fs");
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

function readData() {
  return JSON.parse(fs.readFileSync("data.json", "utf-8"));
}
function writeData(data) {
  fs.writeFileSync("data.json", JSON.stringify(data, null, 2));
}

function nextId(list) {
  return list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;
}

function missing(body, fields) {
  return fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
}

app.get("/api/requests", (req, res) => {
    res.status(200).json(readData());
  });

  
  app.get("/api/requests/:id", (req, res) => {
    const request = readData().find((x) => x.id === Number(req.params.id));
    if (!request) return res.status(404).json({ error: "Request not found" });
    res.status(200).json(request);
  });

  
  app.post("/api/requests", (req, res) => {
    const m = missing(req.body, ["requester", "location", "problem", "priority"]);
    if (m.length) return res.status(400).json({ error: "Missing: " + m.join(", ") });
    const { requester, location, problem, priority } = req.body;
    const list = readData();
    const request = { id: nextId(list), requester, location, problem, priority, status: "Pending" };
    list.push(request);
    writeData(list);
    res.status(201).json(request);
  });

 
  app.delete("/api/requests/:id", (req, res) => {
    const list = readData();
    const index = list.findIndex((x) => x.id === Number(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Request not found" });
    const deleted = list.splice(index, 1)[0];
    writeData(list);
    res.status(200).json({ message: "Request deleted", deleted });
  });

   app.use(express.static(__dirname));
   app.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);

   });
