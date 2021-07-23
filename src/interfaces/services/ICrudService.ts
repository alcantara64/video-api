import AppUser from '../models/AppUser';

interface ICrudService {

  createOne(payload: any): Promise<any>;
  createMany(payload: Array<any>): Promise<any>;

  readOneById(id: string): Promise<any>;
  readMany(query?: any): Promise<any>;
  updateOneById(id: string, payload: any): Promise<any>;
  updateMany(payload: Array<any>): Promise<any>;
  deleteOneById(id: string): Promise<any>;

  searchByQuery(query: any): Promise<any>;

  searchByFilterCriteria(appUser: AppUser, queryOpts: any): Promise<any>;

}

export default ICrudService

/** Defining global search type*/
export type globalSearch = {
  fieldNames: string[],
  searchValue: string
}

export type SearchQueryOps = {
  options: {
    offset: number,
    limit: number,
    globalSearch: globalSearch,//2021-01-31 dynamic globalSearch bucket
    sort: string//2021-01-31 dynamic sort bucket
  },
  query: any
}
