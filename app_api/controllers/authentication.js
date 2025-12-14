const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

const register = async (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  const user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.setPassword(req.body.password);

  try {
    await user.save();
    const token = user.generateJwt();
    return res.status(200).json({ token });
  } catch (err) {
    return res.status(404).json(err);
  }
};

const login = (req, res, next) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ message: 'All fields required' });
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login error:', err);
      return res.status(500).json({ message: 'An unexpected error occurred' });
    }

    if (user) {
      const token = user.generateJwt();
      return res.status(200).json({ token });
    }

    return res.status(401).json(info);
  })(req, res, next);
};




module.exports = {
  register,
  login,
};