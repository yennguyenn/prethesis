import bcrypt from 'bcrypt';
import db from '../models/index.js';

export async function googleFormWebhook(req, res) {
  try {
    // The Google Forms Apps Script will send data in the request body
    const { name, email, ...otherData } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user already exists
    let user = await db.User.findOne({ where: { email } });

    if (!user) {
      // If user doesn't exist, create a new one
      const randomPassword = Math.random().toString(36).slice(-8);
      user = await db.User.create({
        name: name ? name.trim() : 'Google Form User',
        email: email.trim().toLowerCase(),
        passwordHash: randomPassword,
        role: 'user'
      });
    }

    // Note: Insert survey responses here if needed using `user.id`

    return res.status(200).json({
      message: 'User processed successfully from Google Form',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default { googleFormWebhook };
