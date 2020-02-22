const crypto = require("crypto");
const path = require("path");
const assert = require("assert");
const fse = require("fs-extra");
const webpack = require("webpack");
const { Runtime } = require("@adobe/htlengine");

async function createTestRoot() {
  const dir = path.resolve(
    __dirname,
    "tmp",
    crypto.randomBytes(16).toString("hex")
  );
  await fse.ensureDir(dir);
  return dir;
}

async function compile(dist, fixture, options = {}) {
  const compiler = webpack({
    context: path.resolve(__dirname, "fixtures", fixture),
    entry: `./entry.js`,
    mode: "development",
    output: {
      path: dist,
      filename: "bundle.js",
      libraryTarget: "commonjs2"
    },
    module: {
      rules: [
        {
          test: /\.htl$/,
          use: {
            loader: path.resolve(__dirname, "../index.js"),
            options
          }
        }
      ]
    }
  });

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(new Error(stats.toJson().errors));

      resolve(stats);
    });
  });
}

describe("Build Tests", () => {
  let testRoot;
  beforeEach(async () => {
    testRoot = await createTestRoot();
  });

  afterEach(async () => {
    fse.remove(testRoot);
  });

  it("Compiles and evaluates simple htl with data.", async () => {
    await compile(testRoot, "simple", {
      data: {
        title: "Hello"
      }
    });
    const html = require(path.resolve(testRoot, "bundle.js")).default;
    assert.equal(html, "<h1>Hello</h1>");
  });

  it("Compiles and evaluates simple htl with data in query.", async () => {
    await compile(testRoot, "simple_with_query");
    const html = require(path.resolve(testRoot, "bundle.js")).default;
    assert.equal(html, "<h1>Hello, world.</h1>");
  });

  it("Compiles and evaluates htl using templates.", async () => {
    await compile(testRoot, "templates", {
      globalName: "properties",
      data: {
        title: "Hello"
      }
    });
    const html = require(path.resolve(testRoot, "bundle.js")).default;
    assert.equal(html.trim(), "<h1>Hello</h1>");
  });

  it("Allows to exclude runtime", async () => {
    await compile(testRoot, "simple", {
      includeRuntime: false
    });
    const template = require(path.resolve(testRoot, "bundle.js")).default;

    const runtime = new Runtime().setGlobal({
      title: "Hello"
    });
    const html = await template(runtime);
    assert.equal(html, "<h1>Hello</h1>");
  });

  it("Supports runtime vars", async () => {
    await compile(testRoot, "runtimevars", {
      includeRuntime: false,
      runtimeVars: ["wcmmode"]
    });
    const template = require(path.resolve(testRoot, "bundle.js")).default;

    const runtime = new Runtime().setGlobal({
      title: "Hello",
      wcmmode: {
        edit: true
      }
    });
    const html = await template(runtime);
    assert.equal(html.trim(), "<h1>Hello</h1>\n<div>click here to edit</div>");
  });

  it("Can set custom module import generator", async () => {
    await compile(testRoot, "useclasses", {
      includeRuntime: false,
      // very simple import generator. a better usecase would be to defer loading the module with
      // custom function, e.g. one that automatically injects some data into the use-class.
      moduleImportGenerator: (baseDir, varName, id) => {
        return `const ${varName} = require('./${id}');`;
      }
    });
    const template = require(path.resolve(testRoot, "bundle.js")).default;

    const runtime = new Runtime().setGlobal({
      properties: {
        title: "Jupiter",
        radius: 3000
      }
    });
    const html = await template(runtime);
    assert.equal(html.trim(), "<h1>Jupiter</h1>\n    Surface Area: 113097336");
  });
});
