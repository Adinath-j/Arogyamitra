import { prisma } from '../config/database.js';
import { hashPassword, verifyPassword, createAccessToken } from '../utils/auth.js';
import { logger } from '../utils/logger.js';

export async function register(req, res, next) {
  try {
    const payload = req.body;
    if (!payload.email || !payload.email.trim()) {
      logger.warn("User creation rejected: missing required field 'email'");
      return res.status(400).json({ detail: 'Email is required' });
    }
    if (!payload.username || !payload.username.trim()) {
      logger.warn("User creation rejected: missing required field 'username'");
      return res.status(400).json({ detail: 'Username is required' });
    }
    if (!payload.password || !payload.password.trim()) {
      logger.warn("User creation rejected: missing required field 'password'");
      return res.status(400).json({ detail: 'Password is required' });
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingEmail) {
      return res.status(400).json({ detail: 'Email already registered' });
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: payload.username },
    });
    if (existingUsername) {
      return res.status(400).json({ detail: 'Username already taken' });
    }

    const hashedPassword = await hashPassword(payload.password);

    const user = await prisma.user.create({
      data: {
        email: payload.email,
        username: payload.username,
        hashed_password: hashedPassword,
        full_name: payload.full_name || '',
        name: payload.full_name || '',
        role: 'user',
        age: payload.age ? parseInt(payload.age, 10) : null,
        gender: payload.gender || 'male',
        height: payload.height ? parseFloat(payload.height) : null,
        weight: payload.weight ? parseFloat(payload.weight) : null,
        fitness_level: payload.fitness_level || 'beginner',
        fitness_goal: payload.fitness_goal || 'weight_loss',
        goal: payload.fitness_goal || 'weight_loss',
        workout_preference: payload.workout_preference || 'home',
        diet_preference: payload.diet_preference || 'vegetarian',
        diet_type: payload.diet_preference || 'vegetarian',
        allergies: payload.allergies || '',
        time_availability: payload.time_availability ? parseInt(payload.time_availability, 10) : 45,
      },
    });

    const token = createAccessToken({ sub: String(user.id), role: user.role });

    return res.status(201).json({
      access_token: token,
      token_type: 'bearer',
      user_id: user.id,
      username: user.username,
      full_name: user.full_name || '',
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ detail: 'Username and password required' });
    }

    // Accept either username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ detail: 'Incorrect username or password' });
    }

    const valid = await verifyPassword(password, user.hashed_password);
    if (!valid) {
      return res.status(401).json({ detail: 'Incorrect username or password' });
    }

    const token = createAccessToken({ sub: String(user.id), role: user.role });

    return res.json({
      access_token: token,
      token_type: 'bearer',
      user_id: user.id,
      username: user.username,
      full_name: user.full_name || '',
      role: user.role,
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  return res.json(req.user);
}

export async function updateMe(req, res, next) {
  try {
    const payload = req.body;
    const allowed = [
      'full_name',
      'age',
      'gender',
      'height',
      'weight',
      'fitness_goal',
      'diet_preference',
      'allergies',
      'time_availability',
      'fitness_level',
      'workout_preference',
    ];

    const dataToUpdate = {};
    for (const key of allowed) {
      if (payload[key] !== undefined) {
        dataToUpdate[key] = payload[key];
        if (key === 'full_name') dataToUpdate.name = payload[key];
        if (key === 'fitness_goal') dataToUpdate.goal = payload[key];
        if (key === 'diet_preference') dataToUpdate.diet_type = payload[key];
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate,
    });

    return res.json(updatedUser);
  } catch (err) {
    next(err);
  }
}
