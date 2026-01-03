import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

// Stream URLs
const ottStreamURL = "https://hntv.netlify.app/free-playlist";
const altStreamURL = "https://pastebin.com/raw/YctRidwE";

// Allowed OTT User-Agents
const allowedAgents = [
  "aganaman"
];

// Allowed Referers (adjust as needed)
const allowedReferers = [
  "https://masports.dns.org"
];

app.get("/", async (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const referer = req.headers["referer"] || "";

  const isAllowedOTTApp = allowedAgents.some(a =>
    userAgent.includes(a)
  );

  const isAllowedReferer = allowedReferers.some(r =>
    referer.startsWith(r)
  );

  // ❌ Block if referer is invalid
  if (!isAllowedReferer) {
    return res.status(403).send("Forbidden");
  }

  const streamURL = isAllowedOTTApp ? ottStreamURL : altStreamURL;

  try {
    const response = await fetch(streamURL, {
      headers: {
        "User-Agent": userAgent,
        "Referer": referer,
        "Cache-Control": "no-cache"
      }
    });

    if (!response.ok) {
      return res.status(response.status).send("Stream fetch error");
    }

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");

    response.body.pipe(res);

  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
