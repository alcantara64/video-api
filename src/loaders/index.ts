import * as express from 'express';
import expressLoader from './express.loader';
import mongooseLoader from './mongoose.loader';


export default async (app: express.Application): Promise<void> => {



  const db = await mongooseLoader();
  if (db) {
    console.info('loaders.index::MongoDB initialized.');
  } else {
    console.error('loaders.index::MongoDB NOT initialized.');
    throw new Error("MongoDB NOT initialized");
  }

  await expressLoader(app);
  console.info('loaders.index::Express initialized');
}
