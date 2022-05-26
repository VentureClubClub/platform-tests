#!/usr/bin/env -S npx ts-node
import { createServer } from 'http';
import { postgraphile, PostGraphileOptions } from 'postgraphile'
import { Pool } from 'pg'
import fs from 'fs'
import 'dotenv/config'

const NO_DEFAULT = `${Math.random()}${Math.random()}${Math.random()}`

function cfg(name: string, defaultValue = NO_DEFAULT): string {
  const value = process.env[name] || ""
  if (value === "" && defaultValue !== NO_DEFAULT) return defaultValue
  if (value === "") throw new Error(`Missing required config ${name}`)
  return value
}

const database = new Pool({
  database: cfg("PGDATABASE"),
  user: cfg("PGUSER"),
  password: cfg("PGPASSWORD"),
  port: parseInt(cfg("PGPORT"), 10),
  host: cfg("PGHOST"),
  ssl: {
    ca: fs.readFileSync(cfg("PGSSLROOTCERT")).toString(),
    cert: fs.readFileSync(cfg("PGSSLCERT")).toString(),
  },
})

const schemas = ["public"]

const options: PostGraphileOptions = {
  watchPg: true,
  graphiql: true,
  enhanceGraphiql: true,
  subscriptions: true,
  dynamicJson: true,
  setofFunctionsContainNulls: false,
  ignoreRBAC: false,
  showErrorStack: 'json',
  extendedErrors: ['hint', 'detail', 'errcode'],
  allowExplain: true,
  legacyRelations: 'omit',
  exportGqlSchemaPath: `${__dirname}/schema.graphql`,
  sortExport: true,
};

const middleware = postgraphile(database, schemas, options);

const server = createServer(middleware);
server.listen(`${cfg("LISTEN_HOST", "localhost")}:${cfg("LISTEN_PORT", "4001")}`, () => {
  const address = server.address();
  if (address === null) {
    console.log("ERROR: unexpected null address")
    return
  }
  if (typeof address !== 'string') {
    const href = `http://${address.address}:${address.port}${options.graphiqlRoute || '/graphiql'}`;
    console.log(`PostGraphiQL available at ${href} 🚀`);
  } else {
    console.log(`PostGraphile listening on ${address} 🚀`);
  }
});
