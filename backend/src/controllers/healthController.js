import { prisma } from '../config/database.js';
import { analyzeHealth } from '../services/healthService.js';

export async function submitAssessment(req, res, next) {
  try {
    const user = req.user;
    const data = req.body;

    const assessment = await prisma.healthAssessment.create({
      data: {
        user_id: user.id,
        bmi: data.bmi ? parseFloat(data.bmi) : null,
        injuries: data.injuries || null,
        medications: data.medications || null,
        health_conditions: data.health_conditions || null,
        assessment_data: data.assessment_data ? JSON.stringify(data.assessment_data) : '{}',
      },
    });

    return res.json({ success: true, assessment_id: assessment.id });
  } catch (err) {
    next(err);
  }
}

export async function analyze(req, res, next) {
  try {
    const user = req.user;
    const result = await analyzeHealth(user, req.body);
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ detail: `Health analysis failed: ${err.message}` });
  }
}

export async function getLatest(req, res, next) {
  try {
    const user = req.user;
    const assessment = await prisma.healthAssessment.findFirst({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    });

    if (!assessment) {
      return res.json({ assessment: null });
    }

    let recs = [];
    if (assessment.recommendations) {
      try {
        recs = JSON.parse(assessment.recommendations);
      } catch {
        recs = [];
      }
    }

    return res.json({
      assessment: {
        id: assessment.id,
        bmi: assessment.bmi,
        bmi_category: assessment.bmi_category,
        health_score: assessment.health_score,
        ai_analysis: assessment.ai_analysis,
        recommendations: recs,
        created_at: assessment.created_at.toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}
