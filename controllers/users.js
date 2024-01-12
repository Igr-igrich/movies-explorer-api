const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');

const MONGO_DUPLICATE_ERROR_CODE = 11000;
const SALT_ROUNDS = 10;

const { SUCCESS, CREATED } = require('../utils/statusCodes');

const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const ConflictError = require('../errors/conflict-err');

const createUser = async (req, res, next) => {
  try {
    const {
      name, email, password,
    } = req.body;

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create({
      name, email, password: hash,
    });
    return res.status(CREATED).send({
      name: newUser.name,
      email: newUser.email,
      _id: newUser._id,
    });
  } catch (error) {
    if (error.code === MONGO_DUPLICATE_ERROR_CODE) {
      return next(new ConflictError('Пользователь с таким email уже зарегистрирован'));
    }
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Ошибка валидации полей'));
    }
    return next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password').orFail(() => new UnauthorizedError('Пользователь не найден'));

    const matched = await bcrypt.compare(String(password), user.password);
    if (!matched) {
      throw new UnauthorizedError('NotAuthenticated');
    }

    const token = generateToken({ _id: user._id });

    return res.status(SUCCESS).send({ token });
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id).orFail(() => new NotFoundError('Пользователь не найден'));
    return res.send(user);
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new BadRequestError('Передан невалидный id'));
    }
    return next(error);
  }
};

const updateUser = async (req, res, next) => {
  const owner = req.user._id;
  try {
    const user = await User.findByIdAndUpdate(
      owner,
      { name: req.body.name, email: req.body.email },
      {
        new: true,
        runValidators: true,
      },
    );
    return res.send(user);
  } catch (error) {
    if (error.code === MONGO_DUPLICATE_ERROR_CODE) {
      return next(new ConflictError('Пользователь с таким email уже зарегистрирован'));
    }
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Ошибка валидации полей'));
    }
    return next(error);
  }
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateUser,
};
