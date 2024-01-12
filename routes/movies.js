const router = require('express').Router();
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

const {
  movieDataValidator,
  movieIdValidator,
} = require('../middlewares/validators/movieValidator');

router.get('/', getMovies);
router.post('/', movieDataValidator, createMovie);
router.delete('/:movieId', movieIdValidator, deleteMovie);

module.exports = router;
