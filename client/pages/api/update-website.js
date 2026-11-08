import fs from "fs";
import path from "path";

export default function handler(req, res) {
  if (req.method === "POST") {
    const colorsPath = path.resolve("./helpers/webSetting.json");

    const colors = {
      ...req.body,
    };

    fs.writeFileSync(colorsPath, JSON.stringify(colors, null, 2));
    res.end();
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
