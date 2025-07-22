import express from "express";
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// LINEからのPOSTを処理
app.post("/", async (req, res) => {
  const events = req.body.events;
  if (!events || events.length === 0) {
    return res.status(200).send("No events");
  }

  const event = events[0];
  const userMessage = event.message?.text;

  if (!userMessage) {
    return res.status(200).send("No message");
  }

  // OpenAI API 設定
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  // ChatGPTからの応答取得
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "あなたはやさしいAIです。敬語で短くLINEのように返してください。",
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  const gptReply = completion.data.choices[0].message.content;

  // LINEのWebhook応答として返す（デモ用にログだけ）
  console.log("GPTの返答:", gptReply);

  // LINEからのWebhookには200だけ返して、実際の送信は未実装
  res.status(200).send("OK");
});

// Webhookの確認用
app.get("/", (req, res) => {
  res.json({ message: "ことのは Webhook is working!" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
