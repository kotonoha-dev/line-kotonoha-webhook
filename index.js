import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const body = req.body;
    const event = body.events?.[0];

    const replyToken = event?.replyToken;
    const userMessage = event?.message?.text;

    if (replyToken && userMessage) {
      // ChatGPTに投げるリクエスト
      const gptResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'あなたはやさしく寄り添うAIです。' },
            { role: 'user', content: userMessage }
          ]
        })
      });

      const gptData = await gptResponse.json();
      const gptReply = gptData.choices?.[0]?.message?.content || 'ごめんなさい、うまく応答できませんでした。';

      // LINEに返信を送信
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          replyToken: replyToken,
          messages: [{ type: 'text', text: gptReply }]
        })
      });

      res.status(200).json({ message: 'Replied with GPT response' });
    } else {
      res.status(200).json({ message: 'No replyToken or message found' });
    }
  } else {
    res.status(200).json({ message: 'ことのは Webhook is working!' });
  }
}
