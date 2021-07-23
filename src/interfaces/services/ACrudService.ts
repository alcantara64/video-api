/** 2021-02-10 - Frank - Removed dataAttribute config dependency for search route. This is handeled by the frontend by filtering the globalSearch fields for string only there.  */
import mongoose from 'mongoose';
import AServiceBase from "./AServiceBase";
import ICrudService, { SearchQueryOps } from "./ICrudService";
import IServiceBase from "./IServiceBase";
import HttpNotFoundException from '../../exceptions/http/HttpNotFoundException';
import AppUser from '../models/AppUser';



abstract class ACrudService extends AServiceBase implements IServiceBase, ICrudService {

  /**
   * Standard implementation for ICrudService.
   * @param model The mongoose model
   * @param loggerString Returned string will be used to build up logger information. Example "modules.customer.CustomerService"
   */
  constructor(protected model: mongoose.Model<any>,
    loggerString: string,) {
    super(loggerString);
  }
  searchByFilterCriteria(appUser: AppUser, queryOpts: any): Promise<any> {
    throw new Error('Method not implemented.');
  }


  /**
   * Creates one item in the database
   * @param payload The json object that comes from the external caller
   */
  public async createOne(payload: any): Promise<any> {
    console.debug(`${this.loggerString}:createOne::Start`);

    const newModel = new this.model(payload);
    return await newModel.save();
  }

  /**
   * Creates many items in the database
   * @param payload An array of payloads to be created in the database.
   */
  public async createMany(payload: Array<any>): Promise<any> {
    console.debug(`${this.loggerString}:createMany::Start`);

    const newModels = await this.model.insertMany(payload);
    return newModels;
  }

  /**
   * Reads one item from the database by database ID. Throws exception if user does not have access
   * @param appUser
   * @param id
   */
  public async readOneById(id: string): Promise<any> {
    console.debug(`${this.loggerString}:readOneById::Start`);

    const result = await this.model.findById(id)
      .select(this.getMongooseQuerySelectOptions())
      .populate(this.getMongooseQueryPopulateOptions("readOneById"));

    if (!result) {
      throw new HttpNotFoundException("Object does not exist.");
    }

    return result;
  }


  /**
   * @param appUser
   * @param opts Model attribute names, either single value or array. Example {status = 0} or {status=[0,1]}
   * Strings will be used as a regex. To avoid wildcard for attributes, add an object "disableWildcardFor". Example:
   * disableWildcardFor.code = 1 will avoid wildcard search for the code attribute
   */
  public async readMany(appUser: AppUser, opts: any = {}): Promise<any> {
    console.info(`${this.loggerString}:readMany::Started`, opts);

    const hrstart = process.hrtime();

    //temporarily leaving this in. removing offset and limit eventually
    //readMany will be fixed limited to 1000 records for now
    /** 2021-01-19 - Frank - Extending standard limit to 5000 until UI is adjusted to do server side pagination */
    const { offset = 0, limit = 5000, disableWildcardFor = {}, ...optsQuery } = opts;

    /*
    Commenting out, by default returning active and inactive
    if(optsQuery["status"] === undefined) {
      optsQuery.status = ModelStatus.ACTIVE;
    }
    */

    Object.keys(optsQuery).forEach(function (key) {
      const value = optsQuery[key]
      if (!(value instanceof Array) && isNaN(value)) {
        //convert to regex because we want to do wildcard searches; 'i' is for ignore case

        if (key !== 'memberOrg' && key !== 'holdingOrg' && !disableWildcardFor[key]) {
          optsQuery[key] = new RegExp(value, 'i')
        }
      }
    });

    let securedQuery = {};

    securedQuery = optsQuery;


    const resultCount = await this.model.countDocuments(securedQuery);
    let sort = this.getSortOrderForReadMany();
    if (!sort) {
      sort = { name: 1 }
    }

    const results = await this.model.find(securedQuery)
      .select(this.getMongooseQuerySelectOptions())
      .populate(this.getMongooseQueryPopulateOptions("readMany"))
      .sort(sort)
      .skip(Number(offset))
      .limit(Number(limit));


    const hrend = process.hrtime(hrstart)[1] / 1000000; //time in ms
    console.info(`${this.loggerString}:readMany::${results.length} records found in ${hrend}ms`);

    return {
      info: {
        offset: offset,
        limit: limit,
        resultCount: results.length,
        totalCount: resultCount,
        queryTime: hrend, //time in ms
        query: securedQuery
      },
      results: results
    };
  }


  public async updateOneById(id: string, payload: any): Promise<any> {
    console.debug(`${this.loggerString}:updateOneById::Started`);


    //this will automatically check for user security
    const result = await this.readOneById(id);


    //doesnt work with validators unfortunately. _id is empty which is needed for unique custom validator
    //let result = await User.findByIdAndUpdate(id, payload, {runValidators: true});
    Object.keys(payload).forEach(function (key) {
      result[key] = payload[key]
    });

    return await result.save();
  }

  /**
   * Raw implementation using this.updateOneById. It may make sense to investigate if there are better ways
   * in mongoose to do that. This function, however, is not likely to be used often.
   * @param userSecurity
   * @param payload
   */
  public async updateMany(payload: Array<any>): Promise<any> {
    console.debug(`${this.loggerString}:updateMany::Started`);



    const results: any = [];
    for (let item of payload) {
      //also checks each one for security
      results.push(await this.updateOneById(item.id, item));
    };

    return results;
  }

  public async deleteOneById(id: string): Promise<any> {
    console.debug(`${this.loggerString}:deleteOneById::Started`);

    await this.readOneById(id);

    const result = await this.model.findByIdAndDelete(id);
    return result;
  }


  /**
   * Standard implementation returns null.
   * This can be used to sepcifically exclude fields. For example, "-password" would exclude the password field.
   */
  protected getMongooseQuerySelectOptions(): string | null {
    return null;
  }

  /**
   * Standard implementation returns null.
   * This can be used to sepcifically load fields. For example, "roles" for users.
   */
  protected getMongooseQueryPopulateOptions(methodName: "readOneById" | "readMany"): string | null | Array<Object> {
    return null;
  }


  /**
   * Search by mongoose query
   * @param appUser
   * @param queryOpts
   * @param mongooseOptions override default mongoose options for select and popoulate
   */
  public async searchByQuery(queryOpts: SearchQueryOps, mongooseOptions?: { select?: string, populate?: any }): Promise<any> {
    console.debug(`${this.loggerString}:searchByQuery::Started`, { queryOpts: queryOpts });

    const hrstart = process.hrtime();


    const { options, query } = queryOpts;
    let securedQuery = {};
    securedQuery = query;


    console.info(`${this.loggerString}:searchByQuery::Secured query`, { securedQuery: securedQuery });

    /**2021-02-01 Creating Mongoose Query for Dynamic Search facility */
    let searchQuery: any = {};
    let mergeQuery: any = { "$and": [] };

    if (options.globalSearch) {
      const { fieldNames = [], searchValue = "" } = options.globalSearch;
      let qArr: any = [];
      fieldNames.forEach(function (fieldName) {
        /** 2021-02-10 - Frank - Removed dataAttributeMap check again to make this route more generic.
         * This means, the customer list will have to honor the check for string and only pass those fields for global search
        */
        qArr.push({ [fieldName]: { $regex: searchValue, $options: 'i' } });
      });

      mergeQuery.$and.push(securedQuery)
      if (qArr.length > 0) {
        searchQuery.$or = qArr;
        mergeQuery.$and.push(searchQuery)
      }
      /**2021-02-01 Generating new merged query (securedquery + searchQuery) */

      /**2021-02-01 End of merged query (securedquery + searchQuery) generation*/
    } else {
      mergeQuery.$and.push(securedQuery)
    }
    console.info(`${this.loggerString}:searchByQuery::merge query`, { mergeQuery });
    /**2021-02-01 End of Creating Mongoose Query for Dynamic Search facility */

    /** 2021-01-19 - Frank - Extending standard limit to 5000 until UI is adjusted to do server side pagination */
    const { offset = 0, limit = 5000 } = options;
    const selectOptions = this.getMongooseQuerySelectOptions();

    const resultCount = await this.model.countDocuments(mergeQuery);

    const results = await this.model.find(mergeQuery)
      .lean()
      .select(mongooseOptions?.select || selectOptions)
      .populate(mongooseOptions?.populate)
      .skip(Number(offset))
      .limit(Number(limit))
      .sort(options.sort);

    const hrend = process.hrtime(hrstart)[1] / 1000000; //time in ms
    console.info(`${this.loggerString}:searchByQuery::${results.length} records found in ${hrend}ms`);
    return {
      info: {
        offset: offset,
        limit: limit,
        resultCount: results.length,
        totalCount: resultCount,
        queryTime: hrend, //time in ms
        query: mergeQuery
      },
      results: results
    };

  }










  /**
   * Empty implementation. Can be overwritten in child class.
   * @param appUser The current appUser
   * @param newModel The new model instance that was created.
   * @param payload The payload.
   */
  protected async afterCreateOne(appUser: AppUser, newModel: any, payload: any): Promise<void> { }

  /**
   * Empty implementation. Can be overwritten in child class.
   * @param appUser The current appUser
   * @param newModel The new model instances that were created.
   * @param payload The payload.
   */
  protected async afterCreateMany(appUser: AppUser, newModels: Array<any>, payload: Array<any>): Promise<void> { }

  /**
   * Empty implementation. Can be overwritten in child class.
   * Note: There is no afterUpdateMany, because updateMany calls updateOne
   * @param appUser
   * @param updatedModel
   * @param id
   * @param payload
   */
  protected async afterUpdateOne(appUser: AppUser, updatedModel: any, id: string, payload: any): Promise<void> { }


  /**
   * Model not yet updated, but data fetched from database
   * @param appUser
   * @param notYetUpdatedModel
   * @param id
   * @param payload
   */
  protected async beforeUpdateOnePayloadProcessing(appUser: AppUser, notYetUpdatedModel: any, id: string, payload: any): Promise<void> { }


  /**
   * Provide the sort order for readMany
   */
  protected getSortOrderForReadMany(): any {
    return undefined;
  }



  /**
   * Empty implementation. Can be overwritten in child class.
   * @param appUser The current appUser
   * @param payload The payload.
   */
  protected async beforeCreateOne(appUser: AppUser, payload: any): Promise<void> { }

  /**
   * Empty implementation. Can be overwritten in child class.
   * @param appUser The current appUser
   * @param payload The payload.
   */
  protected async beforeCreateMany(appUser: AppUser, payload: Array<any>): Promise<void> { }

  /**
   * Empty implementation. Can be overwritten in child class.
   * Note: There is no afterUpdateMany, because updateMany calls updateOne
   * @param appUser
   * @param id
   * @param payload
   */
  protected async beforeUpdateOne(appUser: AppUser, id: string, payload: any): Promise<void> { }

  protected async beforeDeleteOne(appUser: AppUser, id: string): Promise<void> { }

  /**
   * Can be used to filter the Model data for specific fields.
   * Example use: EmailTemplateService uses MessageTemplateModel where dataDomain = "communication"
   * Standard implementation returns null.
   */
  protected restrictModelByDataDomain(): boolean {
    return false;
  }


}

export default ACrudService



export type FileUploadResult = {
  wasFileUploaded: boolean,
  bucketUrlToFile?: string
}
