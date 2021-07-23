import ACrudService from "../interfaces/services/ACrudService";
import ICrudService from "../interfaces/services/ICrudService";
import MovieModel from "../models/movie-model";

export class MovieService extends ACrudService implements ICrudService {
    public static LOGGER_STRING = 'services.movie.UserService';


    constructor() {
        super(
            MovieModel,
            MovieService.LOGGER_STRING,
        );

    }
}
