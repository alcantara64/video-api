import mongoose from 'mongoose'
import config from '../lib/config';

export default async (): Promise<any> => {

  console.info(`loaders.mongoose::Connecting to ${config.mongoDb.urlNoPw}`);

  const connection = await mongoose.connect(config.mongoDb.url,
    { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });
  return connection;
}
