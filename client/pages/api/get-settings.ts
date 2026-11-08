import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.resolve("./helpers/webSetting.json");

  const jsonData = fs.readFileSync(filePath, "utf8");
  res.status(200).json(JSON.parse(jsonData));
}
