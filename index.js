const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Verify webhook
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = EAAS8CVvZC2HcBOzZAfZBKCiLTwJ0wwxG5C6TbOBIUbRXhINKtPt5ICdYppGXJEC3N2y9wZChKM1kQhL9Qj43dlMZBZC99e1ULrzGvKLiPjfuZBftolzpMPQcLJlcslGgWoGI2rQ8dZByApZCxEM8rvpEw6ZBD6pL3K6uPHjJapxZBRBxSa2OXy4KxzKieWyz1CsPuvvTwwcHALZAF98YW9MZD;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages
app.post("/webhook", (req, res) => {
  const body = req.body;

  if (body.object === "page") {
    body.entry.forEach(entry => {
      const event = entry.messaging[0];
      const senderId = event.sender.id;

      if (event.message) {
        const userMessage = event.message.text;

        // Call ChatGPT API here
        sendMessageToChatGPT(userMessage, senderId);
      }
    });

    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

const sendMessageToChatGPT = async (message, senderId) => {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer your_openai_api_key`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    }),
  });

  const data = await response.json();
  const reply = data.choices[0].message.content;

  // Send response back to Facebook Messenger
  sendMessageToMessenger(senderId, reply);
};

const sendMessageToMessenger = (senderId, message) => {
  const PAGE_ACCESS_TOKEN = your_page_access_token;

  fetch(`https://graph.facebook.com/v11.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: senderId },
      message: { text: message },
    }),
  });
};

module.exports = app;

