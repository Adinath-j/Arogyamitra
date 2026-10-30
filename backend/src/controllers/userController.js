import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { hashPassword } from '../utils/auth.js';

export async function createUser(req, res, next) {
  try {
    const userData = req.body;
    const guestUuid = crypto.randomUUID().substring(0, 8);
    const guestEmail = `guest_${guestUuid}@local.arogyamitra`;
    const guestUsername = `guest_${guestUuid}`;
    const guestPassword = await hashPassword(crypto.randomBytes(16).toString('hex'));

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        full_name: userData.name,
        age: userData.age,
        gender: userData.gender,
        goal: userData.goal,
        fitness_goal: userData.goal,
        diet_type: userData.diet_type,
        diet_preference: userData.diet_type,
        allergies: userData.allergies || '',
        time_availability: userData.time_availability || 45,
        email: guestEmail,
        username: guestUsername,
        hashed_password: guestPassword,
        role: 'guest',
      },
    });

    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export async function getUser(req, res, next) {
  try {
    const userId = parseInt(req.params.user_id || req.params.userId, 10);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    next(err);
  }
}
