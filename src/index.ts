import express from 'express';
import loaders from './loaders';

import config from './lib/config';

async function startServer() {
    const app = express();
    await loaders(app);

    const port: number = config.server.port;

    const server = app.listen(port, () => {
        console.info(`Server is listening on port ${port}...`);

        process.on("unhandledRejection", ex => {
            console.info("index::undhandledRejection", ex);
        });

        process.on("unhandledException", ex => {
            console.error("index::unhandledException", ex);
            throw ex;
        });

    });

    return server;
}

startServer();