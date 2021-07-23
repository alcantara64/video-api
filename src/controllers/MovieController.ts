import express from 'express';
import { Request, Response } from 'express';
import ACrudController from '../interfaces/controllers/ACrudController';
import IControllerBase from '../interfaces/controllers/IControllerBase';
import ICrudController from '../interfaces/controllers/ICrudController';
import { MovieService } from '../services/movie-service';



class MovieController extends ACrudController implements IControllerBase, ICrudController {
    private static LOGGER_STRING = 'modules.customer.MovieController';

    constructor() {
        super(
            new MovieService(),
            MovieController.LOGGER_STRING,
        );
    }








}

export default MovieController
