import express, { Request, Response } from 'express';
import HttpStatus from '../../enums/HttpStatus';
import HttpBadRequestException from '../../exceptions/http/HttpBadRequestException';
import AppUser from '../models/AppUser';
import ICrudService from '../services/ICrudService';
import AControllerBase from "./AControllerBase";
import IControllerBase from "./IControllerBase";
import ICrudController, { CrudControllerRouteOptions } from "./ICrudController";

abstract class ACrudController extends AControllerBase implements IControllerBase, ICrudController {


  constructor(
    protected crudService: ICrudService,
    loggerString: string,
    routeOptions?: CrudControllerRouteOptions) {
    super(loggerString, routeOptions);
  }


  public initRoutes(router: express.Router, routeOptions?: CrudControllerRouteOptions): void {

    this.addRoutesBeforeStandardRoutes(router, routeOptions);


    if (!routeOptions || routeOptions.create) {
      console.log('silly', `${this.loggerString}:initRoutes::Registering create route.`)
      router.post('/', (req: Request, res: Response) => { return this.createSendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.readOne) {
      console.log('silly', `${this.loggerString}:initRoutes::Registering readOne route.`)
      router.get('/:id', (req: Request, res: Response) => { return this.readOneSendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.readMany) {
      console.log('silly', `${this.loggerString}:initRoutes::Registering readMany route.`)
      router.get('/', (req: Request, res: Response) => { return this.readManySendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.updateOne) {
      console.log('silly', `${this.loggerString}:initRoutes::Registering updateOne route.`)
      router.put('/:id', (req: Request, res: Response) => { return this.updateOneSendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.updateMany) {
      console.log('silly', `${this.loggerString}:initRoutes::Registering updateMany route.`)
      router.put('/', (req: Request, res: Response) => { return this.updateManySendResponse(req, res) });
    }

    if (!routeOptions || routeOptions.delete) {
      console.log('silly', `${this.loggerString}:initRoutes::Registering delete route.`)
      router.delete('/:id', (req: Request, res: Response) => { return this.deleteSendResponse(req, res) });
    }

    this.addRoutesAfterStandardRoutes(router, routeOptions);
  }


  addRoutesBeforeStandardRoutes(router: express.Router, routeOptions?: any): void {
    //empty implementation, can be overwritten
  }

  addRoutesAfterStandardRoutes(router: express.Router, routeOptions?: any): void {
    //empty implementation, can be overwritten
  }



  public async createSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.create(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async create(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    this.processPayloadCreate(req.body);

    if (Array.isArray(req.body)) {
      console.debug(`${this.loggerString}:create::Processing array.`);
      this.processPayloadCreateMany(req.body);
      const results = await this.crudService.createMany(req.body);
      return results;

    } else {
      console.debug(`${this.loggerString}:create::Processing single item.`);
      this.processPayloadCreateOne(req.body);
      //check for unique code happens in model
      const result = await this.crudService.createOne(req.body);
      return result;
    }
  }



  public async readOneSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.readOne(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async readOne(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    this.processPayloadReadOne(req.params);
    const id = req.params.id;
    const result = await this.crudService.readOneById(id);
    return result;
  }



  public async readManySendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.readMany(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async readMany(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const results = await this.crudService.readMany(req.query);
    return results;
  }



  public async updateOneSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.updateOne(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async updateOne(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    this.processPayloadUpdateOne(req.params, req.body);
    const id = req.params.id;
    const result = await this.crudService.updateOneById(id, req.body);
    return result;
  }



  public async updateManySendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.updateMany(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async updateMany(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    this.processPayloadUpdateMany(appUser);
    const results = await this.crudService.updateMany(req.body);
    return results;
  }



  public async deleteSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.delete(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async delete(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    this.processPayloadDelete(req.params);
    const id = req.params.id;
    const result = await this.crudService.deleteOneById(id);
    return result;
  }


  public async searchSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.search(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async search(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    const searchQueryOpts = req.body;

    let result = null;
    if (searchQueryOpts.query) {
      result = await this.crudService.searchByQuery(searchQueryOpts);
    }
    else if (searchQueryOpts.queryByCriteria) {
      result = await this.crudService.searchByFilterCriteria(appUser, searchQueryOpts);
    }
    else {
      throw new HttpBadRequestException("Query or criteria attributes need to be specified.");
    }

    return result;
  }

  public async getSearchFilterDataBasedOnConfigSendResponse(req: Request, res: Response): Promise<any> {
    const obj = await this.getSearchFilterDataBasedOnConfig(req, res);
    res.status(HttpStatus.OK.CODE).json(obj);
  }
  public async getSearchFilterDataBasedOnConfig(req: Request, res: Response): Promise<any> {
    const appUser = this.extractAppUser(req);
    return appUser;
  }



  /**
   * Can be overwritten if needed.
   * @param req
   */
  protected extractAppUser(req: Request): AppUser {
    return <AppUser>req.user;
  }

  /**
   * Can be used to modify the payload.
   * @param appUser
   * @param payload
   */
  protected processPayloadCreate(payload: any): void { }
  protected processPayloadCreateOne(payload: any): void { }
  protected processPayloadCreateMany(payload: any): void { }
  protected processPayloadReadOne(params: any): void { }
  protected processPayloadUpdateOne(params: any, payload: any): void { }
  protected processPayloadUpdateMany(payload: any): void { }
  protected processPayloadDelete(params: any): void { }

}

export default ACrudController
