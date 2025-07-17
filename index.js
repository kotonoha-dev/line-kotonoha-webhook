import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const body = req.body;

    // 応答トークンを取得
    const replyToken = body.events[0]?.replyToken;
    const userMessage = body.events[0]?.message?.text;

    if (replyToken && userMessage) {
      // LINEに返すメッセージ内容（仮）
      const replyMessage = {
        replyToken: replyToken,
        messages: [
          {
            type: 'text',
            text: `こんにちは、ことのはです（あなたのメッセージ: ${userMessage}）`
          }
        ]
      };

      // LINEのメッセージ返信APIに送信
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify(replyMessage)
      });

      res.status(200).json({ message: 'Replied to user' });
    } else {
      res.status(200).json({ message: 'No replyToken or message found' });
    }
  } else {
    res.status(200).json({ message: 'ことのは Webhook is working!' });
  }
}
