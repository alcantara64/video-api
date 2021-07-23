import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { Request, Response, NextFunction } from 'express';


import config from '../lib/config';
//import UserService from '../modules/user/UserService';
import HttpStatus from '../enums/HttpStatus';
import AppUser from '../interfaces/models/AppUser';

import HttpUnauthorizedException from '../exceptions/http/HttpUnauthorizedException';
import { UserService } from '../services/user-service';
import HttpBadRequestException from '../exceptions/http/HttpBadRequestException';



const jwtSecret = config.jwtSecret;
const jwtOpts: jwt.SignOptions = { algorithm: 'HS256', expiresIn: '12h' }

passport.use(dbStrategy());
const authenticate = passport.authenticate('local', { session: false });

export default {
  authenticate,
  login,
  ensureUser,
  createAccount,
}

async function login(req: Request, res: Response, next: NextFunction) {
  const userIdOrEmail = req.body.email;
  console.log(`milddleware.auth:login::Login of user started ${userIdOrEmail}`);
  const userService = new UserService();

  const user = await userService.findUserForAuthByIdOrEmailWithPassword(userIdOrEmail);

  if (!user) {
    throw new HttpUnauthorizedException("Invalid login credentials.");
  };

  const appUser = await buildAppUser(user);


  const token = await sign({
    _id: user._id,
    email: user.email,
  });


  //res.cookie('jwt', token, { httpOnly: true }) Removing cookie for now.
  res.json({ token, user });
}
async function createAccount(req: Request, res: Response,) {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    throw new HttpBadRequestException('email, name and password are required');
  }
  const payload = {
    email, name, password
  }
  const userService = new UserService();
  const newUser = await userService.createOne(payload);
  if (newUser) return res.json({ message: 'Account Created Successfully' })
  console.log("milddleware.auth:createUser::user creation error.", newUser);
  return res.status(HttpStatus.INTERNAL_SERVER_ERROR.CODE).send({
    message: 'A server error occurred'
  });

}
async function ensureUser(req: Request, res: Response, next: NextFunction) {
  //const token = req.headers.authorization; //|| req.cookies.jwt removing cookie for now
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(HttpStatus.UNAUTHORIZED.CODE).send('Access denied. No token provided.');
  }

  try {
    const userFromToken: any = await verify(token);
    const appUser: AppUser = await buildAppUserWithId(userFromToken._id);
    req.user = appUser;
    return next();
  } catch (error) {
    console.log("milddleware.auth:ensureUser::Token verification error.", error);
    return res.status(HttpStatus.UNAUTHORIZED.CODE).send('Invalid token.');
  }
}

async function sign(payload: any) {
  const token = await jwt.sign(payload, jwtSecret, jwtOpts);
  return token
}

async function verify(jwtString = '') {
  jwtString = jwtString.replace(/^Bearer /i, '')
  console.log(jwtSecret);
  try {
    const payload = await jwt.verify(jwtString, jwtSecret); //TODO need to check if this really works asynchronosly.
    return payload
  } catch (err) {
    console.log("milddleware.auth:verify::There was an error verifying the auth token.", err);
    throw new HttpUnauthorizedException("Invalid token.", err.message);
  }
}

function dbStrategy() {
  return new Strategy(
    { usernameField: 'email' },

    async function (username, password, cb) {
      const userService = new UserService();
      try {
        const user = await userService.findUserForAuthByIdOrEmailWithPassword(username);

        if (!user) {
          return cb(null, false)
        }

        const isUser = await bcrypt.compare(password, user.password)
        if (isUser) {
          return cb(null, { username: user.username })
        }
      } catch (err) {
        console.log("milddleware.auth:dbStrategy::There was an error retrieving the user.", err);
        throw new HttpUnauthorizedException("User login failed.", err.message);
      }

      cb(null, false);
    })
}


async function buildAppUserWithId(id: string): Promise<AppUser> {
  const userService = new UserService();
  const user: any = await userService.findUserById(id);

  const appUser = await buildAppUser(user)
  return appUser;
}

async function buildAppUser(user: any): Promise<AppUser> {

  const appUser = new AppUser(
    user._id,
    user.name,
    user.email,
  );

  return appUser;
}

