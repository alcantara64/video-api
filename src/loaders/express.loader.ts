import * as bodyParser from 'body-parser';
import cors from 'cors';
import * as express from 'express';
import 'express-async-errors'; //https://dev.to/ama/how-to-use-express-js-error-handling-middleware-to-make-your-code-cleaner-34j3
import helmet from 'helmet';
import MovieController from '../controllers/MovieController';
import UserController from '../controllers/UserController';
import auth from '../middleware/auth.middleware';
import errorMiddleware from '../middleware/error-middleware';





//export default async ({ app }: { app: express.Application }) => {
export default async (app: express.Application) => {
  try {
    app.get('/status', (req, res) => { res.status(200).end(); });
    app.head('/status', (req, res) => { res.status(200).end(); });
    //app.enable('trust proxy'); need to check if necessary

    app.use(helmet());
    app.use(cors());
    //app.use(require('morgan')('dev'));
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({ limit: "10MB" }));


    /********** login route **********/
    app.post('/login', auth.authenticate, auth.login);
    app.post('/register', auth.createAccount);




    /********** secured routes **********/
    app.use(auth.ensureUser);
    app.use('/user/users', (new UserController()).getRouter());

    app.use('/movie', (new MovieController().getRouter()));

    /********** error handling **********/
    app.use(errorMiddleware.handleValidationError)
    app.use(errorMiddleware.handleAppError)
    app.use(errorMiddleware.handleError)
    app.use(errorMiddleware.notFound)

    return app;
  } catch (err) {
    console.error(err);
    return null
  }
}
