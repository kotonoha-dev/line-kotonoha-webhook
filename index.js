import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const body = req.body;

    const replyToken = body.events?.[0]?.replyToken;
    const userMessage = body.events?.[0]?.message?.text;

    if (replyToken && userMessage) {
      // OpenAI APIで返信生成
      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      const openaiData = await openaiRes.json();
      const replyText = openaiData.choices?.[0]?.message?.content || 'うまく返せなかったみたい...';

      // LINEに返信
      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE
