import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/screen', async (req, res) => {
  const { jobDescription, resumeText } = req.body;

  if (!jobDescription || !resumeText) {
    return res.status(400).json({ error: 'Job description and resume text are required.' });
  }

  try {
    const result = openai
      ? await screenWithOpenAI(jobDescription, resumeText)
      : screenWithRules(jobDescription, resumeText);

    res.json(result);
  } catch (error) {
    console.error('Screening error:', error);
    res.status(500).json({ error: 'Unable to process screening request.' });
  }
});

app.listen(port, () => {
  console.log(`AI Resume Screening app running at http://localhost:${port}`);
});

function screenWithRules(jobDescription, resumeText) {
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  const matches = jobKeywords.filter((keyword) => resumeKeywords.includes(keyword));
  const score = Math.min(100, Math.round((matches.length / Math.max(jobKeywords.length, 1)) * 100));

  return {
    source: 'rule-based',
    score,
    matches,
    summary: `Resume matches ${matches.length} of ${jobKeywords.length} key terms from the job description.`,
    recommendations: getRecommendations(score)
  };
}

async function screenWithOpenAI(jobDescription, resumeText) {
  const prompt = `You are an AI screening assistant. Compare the candidate resume against the job description below.

Job description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nProvide a JSON object with keys: score (0-100), summary, strengths, weaknesses, recommendations.`;

  const response = await openai.responses.create({
    model: 'gpt-4.1-mini',
    input: prompt
  });

  const text = response.output?.[0]?.content?.[0]?.text || '';
  const parsed = parseOpenAIResponse(text);
  return {
    source: 'openai',
    ...parsed
  };
}

function extractKeywords(text) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length > 3)
    )
  );
}

function getRecommendations(score) {
  if (score >= 80) {
    return ['The resume is a strong match. Emphasize measurable achievements and keep keywords aligned.'];
  }

  if (score >= 50) {
    return ['Add more specific role-related keywords and quantify achievements. Highlight directly related experience.'];
  }

  return ['Rewrite the resume to focus more closely on the job requirements. Add concrete project results and relevant keywords.'];
}

function parseOpenAIResponse(text) {
  try {
    const jsonText = text.trim().replace(/^[^\{]*(\{[\s\S]*\})[^\}]*$/, '$1');
    return JSON.parse(jsonText);
  } catch (error) {
    return {
      score: 0,
      summary: 'Could not parse AI response. Please verify your OpenAI configuration.',
      strengths: [],
      weaknesses: [],
      recommendations: ['Check your API configuration or use rule-based screening.']
    };
  }
}
