import { describe, it } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { hashPassword, verifyPassword, createAccessToken, decodeToken } from '../src/utils/auth.js';
import { PromptBuilder } from '../src/services/ai/promptBuilder.js';
import { ContextExtractor, ContextResolver } from '../src/services/ai/contextResolver.js';  

describe('1. Authentication & Security (bcrypt & JWT)', () => {
  it('should hash password and verify successfully', async () => {
    const plain = 'TestPassword@123';
    const hash = await hashPassword(plain);
    assert.ok(hash.startsWith('$2b$') || hash.startsWith('$2a$'), 'Hash should be valid bcrypt');
    
    const isValid = await verifyPassword(plain, hash);
    assert.strictEqual(isValid, true, 'Plaintext password must match hash');

    const isWrong = await verifyPassword('WrongPassword', hash);
    assert.strictEqual(isWrong, false, 'Wrong password must fail');
  });

  it('should generate and decode JWT access tokens correctly', () => {
    const payload = { sub: '42', role: 'user' };
    const token = createAccessToken(payload, '1h');
    assert.ok(typeof token === 'string' && token.split('.').length === 3, 'JWT must be well-formed');

    const decoded = decodeToken(token);
    assert.strictEqual(decoded.sub, '42');
    assert.strictEqual(decoded.role, 'user');
    assert.ok(decoded.exp, 'Decoded token must have expiration timestamp');

    const invalid = decodeToken('invalid.token.string');
    assert.strictEqual(invalid, null, 'Invalid token must return null');
  });
});

describe('2. Biometrics and AI Prompt Builder', () => {
  it('should accurately calculate BMI and categories', () => {
    const bmiNormal = PromptBuilder.calculateBmi(70, 175); // ~22.9
    assert.strictEqual(bmiNormal, 22.9);

    const bmiOverweight = PromptBuilder.calculateBmi(90, 175); // ~29.4
    assert.strictEqual(bmiOverweight, 29.4);
  });

  it('should accurately calculate Mifflin-St Jeor BMR for male and female', () => {
    // 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1674
    const maleBmr = PromptBuilder.calculateBmr(70, 175, 25, 'male');
    assert.strictEqual(maleBmr, 1674);

    // 10*60 + 6.25*165 - 5*28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 -> 1330
    const femaleBmr = PromptBuilder.calculateBmr(60, 165, 28, 'female');
    assert.strictEqual(femaleBmr, 1330);
  });

  it('should build prompt strings containing deterministic user context', () => {
    const user = {
      name: 'Adinath',
      age: 26,
      gender: 'male',
      goal: 'weight_loss',
      diet_preference: 'vegetarian',
      allergies: 'peanuts',
      workout_preference: 'home',
      time_availability: 45,
      weight: 75,
      height: 178,
      fitness_level: 'beginner',
    };

    const contextStr = PromptBuilder.getUserContext(user);
    assert.ok(contextStr.includes('Adinath'));
    assert.ok(contextStr.includes('75 kg'));
    assert.ok(contextStr.includes('peanuts'));

    const workoutPrompt = PromptBuilder.buildWorkoutPrompt(user);
    assert.ok(workoutPrompt.includes('CRITICAL: The user is working out at home'));

    const mealPrompt = PromptBuilder.buildMealPrompt(user);
    assert.ok(mealPrompt.includes('Avoid: peanuts'));
  });
});

describe('3. Natural Language Context Resolver', () => {
  it('should extract biometric and dietary overrides from chat messages', () => {
    const msg = "I'm 82kg now and my height is 180cm, also I am a vegan and want to lose weight";
    const extracted = ContextExtractor.extract(msg);

    assert.strictEqual(extracted.weight, 82);
    assert.strictEqual(extracted.height, 180);
    assert.strictEqual(extracted.diet_preference, 'vegan');
    assert.strictEqual(extracted.goal, 'weight_loss');
  });

  it('should resolve user context with natural language overrides', () => {
    const baseUser = {
      id: 1,
      full_name: 'Rahul',
      age: 30,
      gender: 'male',
      weight: 78,
      height: 175,
      fitness_goal: 'maintain',
      diet_preference: 'vegetarian',
    };

    const { effectiveContext, profileUpdates } = ContextResolver.resolve(baseUser, 'I weighed in at 76 kg today');
    assert.strictEqual(effectiveContext.weight, 76);
    assert.strictEqual(profileUpdates.weight, 76);
    assert.strictEqual(effectiveContext.name, 'Rahul');
  });
});

describe('4. API System and Root Endpoints', () => {
  it('GET / should return 200 with API status banner', async () => {
    const res = await request(app).get('/');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.app, 'ArogyaMitra API v2.0');
    assert.strictEqual(res.body.version, '2.0.0');
  });

  it('GET /health should return 200 with ok status', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  it('OPTIONS requests should return CORS headers', async () => {
    const res = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:5173')
      .set('Access-Control-Request-Method', 'POST');
    assert.strictEqual(res.status, 204);
    assert.ok(res.headers['access-control-allow-origin']);
    assert.strictEqual(res.headers['access-control-allow-credentials'], 'true');
  });
});

describe('5. Authentication Routes & Security Enforcements', () => {
  it('POST /api/auth/register should reject empty payloads with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.detail);
  });

  it('POST /api/auth/login should reject empty credentials with 400', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.detail);
  });

  it('GET /api/auth/me should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.detail, 'Could not validate credentials');
  });

  it('GET /api/auth/me should reject invalid Bearer tokens with 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-value');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.detail, 'Could not validate credentials');
  });
});

describe('6. Protected Route Enforcement', () => {
  it('Protected routes require valid JWT tokens', async () => {
    const protectedPaths = [
      ['get', '/api/workout/active'],
      ['post', '/api/workout/generate'],
      ['post', '/api/workout/log-exercise'],
      ['get', '/api/nutrition/active'],
      ['post', '/api/nutrition/generate'],
      ['post', '/api/nutrition/log-meal'],
      ['get', '/api/progress/stats'],
      ['get', '/api/progress/history'],
      ['post', '/api/progress/log'],
      ['get', '/api/health-assessment/latest'],
      ['post', '/api/health-assessment/assessment/submit'],
      ['post', '/api/health-assessment/analyze'],
      ['post', '/api/youtube/search'],
      ['post', '/api/recipes/search'],
      ['get', '/api/calendar/auth-url'],
      ['post', '/api/calendar/sync'],
      ['post', '/api/calendar/save-tokens'],
    ];

    for (const [method, path] of protectedPaths) {
      const res = await request(app)[method](path).send({});
      assert.strictEqual(res.status, 401, `Endpoint ${method.toUpperCase()} ${path} must enforce 401 Unauthorized`);
      assert.strictEqual(res.body.detail, 'Could not validate credentials');
    }
  });
});