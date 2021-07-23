import express from 'express';
import { Request, Response } from 'express';
import ACrudController from '../interfaces/controllers/ACrudController';
import IControllerBase from '../interfaces/controllers/IControllerBase';
import ICrudController from '../interfaces/controllers/ICrudController';
import { UserService } from '../services/user-service';



class UserController extends ACrudController implements IControllerBase, ICrudController {
  private static LOGGER_STRING = 'modules.customer.UserController';

  constructor() {
    super(
      new UserService(),
      UserController.LOGGER_STRING,
    );
  }



  addRoutesBeforeStandardRoutes(router: express.Router, routeOptions?: any): void {
    if (!routeOptions?.createAdminRoute) router.get('/me', (req: Request, res: Response) => { return this.readMe(req, res) });

  }


  public async readMe(req: Request, res: Response): Promise<any> {
    console.debug(`${UserController.LOGGER_STRING}:readMe::Start`);
    const userService = <UserService>this.crudService
    const id = req.user.toString();
    const user = await userService.readOneById(id);
    return res.send(user);
  }



  public async createAdminUser(req: Request, res: Response): Promise<any> {
    console.info(`${UserController.LOGGER_STRING}:createAdmin::Start`);
    const userService = <UserService>this.crudService
    const user = req.user //await userService.createAdminUser(req.body);
    return res.send(user);
  }

}

export default UserController
