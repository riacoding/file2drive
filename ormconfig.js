const path = require("path");
let base;

//change base to allow typeorm to pick up correct entities
if (process.env.NODE_ENV === "production") {
  //transpiled tsc build in dist
  base = path.join(process.cwd(), "/dist/src");
} else if (process.env.NODE_ENV === "dev") {
  //ts-node build in src
  base = path.join(process.cwd(), "/src");
} else {
  //bin from npm install package json bin
  base = path.join(process.cwd(), "dist/src");
}

console.log(base);

module.exports = {
  type: "sqlite",
  database: "./file2drive.sqlite",
  synchronize: true,
  logging: false,
  entities: [path.join(base, "entity/*.{ts,js}")],
  migrations: [path.resolve(__dirname, "/migration/*.{ts,js}")],
  subscribers: [path.resolve(__dirname, "/subscriber/*.{ts,js}")],
  cli: {
    entitiesDir: "src/entity",
    migrationsDir: "src/migration",
    subscribersDir: "src/subscriber",
  },
};
