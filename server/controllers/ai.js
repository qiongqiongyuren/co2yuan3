// server/controllers/ai.js
const axios = require('axios');
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/query';

exports.handleChat = async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: '问题不能为空' });
    }
    try {
        console.log(`转发问题到 AI 服务: ${question}`);
        const response = await axios.post(AI_SERVICE_URL, { question });
        res.json(response.data);
    } catch (error) {
        console.error('AI 服务通信错误:', error.message);
        res.status(500).json({ error: 'AI 助手当前不可用' });
    }
};