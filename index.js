export default function handler(req, res) {
  if (req.method === 'POST') {
    const events = req.body.events;
    const replyToken = events[0].replyToken;
    const userMessage = events[0].message?.text || "";

    const replyMessage = {
      replyToken: replyToken,
      messages: [
        {
          type: "text",
          text: `ことのはは今、あなたの言葉を受け取ったよ：「${userMessage}」`,
        },
      ],
    };

    // LINE Messaging APIに返信を送信
    fetch("https://api.line.me/v2/bot/message/reply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(replyMessage),
    });

    res.status(200).end();
  } else {
    res.status(200).json({ message: "ことのは Webhook is working!" });
  }
}
