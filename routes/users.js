const router = require('express').Router();
const {
  updateUser,
  getCurrentUser,
} = require('../controllers/users');

const {
  userDataValidator,
} = require('../middlewares/validators/userValidator');

router.get('/me', getCurrentUser);
router.patch('/me', userDataValidator, updateUser);

module.exports = router;
