// server/controllers/ai.js
const axios = require('axios');
const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000'; // AI 服务的基础 URL

exports.handleChat = async (req, res) => {
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: '问题不能为空' });
    }
    try {
        const AI_QUERY_URL = `${AI_SERVICE_BASE_URL}/query`; // 拼接完整的 AI 查询端点
        console.log(`转发问题到 AI 服务 (${AI_QUERY_URL}): ${question}`);
        const response = await axios.post(AI_QUERY_URL, { question });
        res.json(response.data);
    } catch (error) {
        console.error('AI 服务通信错误:', error.message);
        // 打印更详细的错误信息，帮助调试
        if (error.response) {
            console.error('AI Service Response Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('AI Service Request Error: No response received');
        } else {
            console.error('AI Service Setup Error:', error.message);
        }
        res.status(500).json({ error: 'AI 助手当前不可用' });
    }
};
