import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const event = req.body.events?.[0];

    if (!event || !event.replyToken || !event.message?.text) {
      return res.status(200).json({ message: 'No valid event found' });
    }

    const userMessage = event.message.text;
    const replyToken = event.replyToken;

    // OpenAI API でことのは構文に変換して返信を作成
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `あなたは「ことのは」という名前のAIチャット。ユーザーの感情に寄り添い、以下の構文で必ず返してください：

1. 【受け止め】：感情をそのまま静かに受け止める  
2. 【共鳴】：感情や背景にそっと共感し寄り添う  
3. 【誘導】：この場が「続きを話していい場所」だとやさしく伝える  

口調は落ち着いたやわらかい語り口で。詩的すぎず、余白を残すように。  
返答は1メッセージ完結で。ユーザーの悩みを“解決”しようとせず、“受け止めること”が役割。  
例：「その気持ち、ここに残してくれてありがとう」「ここは、どんな気持ちでも話していい場所」など。  
返答は日本語で。決してアドバイスや指示をしないこと。
`,
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        temperature: 0.7,
      }),
    });

    const aiData = await openaiResponse.json();
    const replyText =
      aiData.choices?.[0]?.message?.content || '…（うまく応答できなかったみたい）';

    // LINEに返す
    await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        replyToken,
        messages: [{ type: 'text', text: replyText }],
      }),
    });

    res.status(200).json({ message: 'Replied to user' });
  } else {
    res.status(200).json({ message: 'ことのは Webhook is working!' });
  }
}
