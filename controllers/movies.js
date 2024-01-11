const Movie = require('../models/movie');

const { CREATED } = require('../utils/statusCodes');

const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ForbiddenError = require('../errors/forbidden-error');

const getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.find({}).sort({ createdAt: -1 });
    return res.send(movies);
  } catch (error) {
    return next(error);
  }
};

const createMovie = async (req, res, next) => {
  const owner = req.user._id;
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  try {
    const newMovie = await Movie.create({
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner,
    });
    return res.status(CREATED).send(newMovie);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return next(new BadRequestError('Ошибка валидации полей'));
    }

    return next(error);
  }
};

const deleteMovie = async (req, res, next) => {
  const { movieId } = req.params;
  const { _id: userId } = req.user;

  try {
    const movie = await Movie.findById(movieId).orFail(new NotFoundError('Такого фильма не существует'));

    if (userId !== movie.owner.toString()) {
      throw new ForbiddenError('Нельзя удалить чужой фильм');
    }

    await Movie.deleteOne(movie);

    return res.send(movie);
  } catch (error) {
    if (error.name === 'CastError') {
      return next(new BadRequestError('Передан невалидный id'));
    }
    return next(error);
  }
};

module.exports = {
  createMovie,
  deleteMovie,
  getMovies,
};
