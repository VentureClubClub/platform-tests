/* global require exports __dirname process */

const serverlessExpress = require('@vendia/serverless-express')
const combineMiddlewares = require('./combineMiddlewares')
const { postgraphile } = require('postgraphile')
const cors = require('cors')

const schemas = process.env.DATABASE_SCHEMAS
  ? process.env.DATABASE_SCHEMAS.split(',')
      : ['yugabyte'];

const options = {
  dynamicJson: true,
  cors: true,
  graphiql: false,
  graphqlRoute: '/graphql',
  externalUrlBase: `/${process.env.AWS_STAGE}`,

  // If consuming JWT:
  jwtSecret: process.env.JWT_SECRET || String(Math.random()),
  // If generating JWT:
  jwtPgTypeIdentifier: process.env.JWT_PG_TYPE_IDENTIFIER

  /* If you want to enable GraphiQL, you must use `externalUrlBase` so PostGraphile
   * knows where to tell the browser to find the assets.  Doing this is
   * strongly discouraged, you should use an external GraphQL client instead.
    graphiql: true,
    enhanceGraphiql: true,
    graphqlRoute: '/',
    graphiqlRoute: '/graphiql',
  */
};

const app = combineMiddlewares([
  cors(),

  // from https://github.com/graphile/postgraphile-lambda-example/blob/main/src/index.js
  // Determines the effective URL we are at if `absoluteRoutes` is set
  (req, res, next) => {
    if (options.absoluteRoutes) {
      try {
        const event = JSON.parse(decodeURIComponent(req.headers['x-apigateway-event']));
        // This contains the `stage`, making it a true absolute URL (which we
        // need for serving assets)
        const realPath = event.requestContext.path;
        req.originalUrl = realPath;
      } catch (e) {
        return next(new Error('Processing event failed'));
      }
    }
    next();
  },

  postgraphile(process.env.DATABASE_URL, schemas, {
    ...options,
    readCache: `${__dirname}/postgraphile.cache`
  })
])

exports.handler = serverlessExpress({ app })
