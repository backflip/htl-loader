const crypto = require('crypto');
const path = require('path');
const assert = require('assert');
const fse = require('fs-extra');
const webpack = require('webpack');

async function createTestRoot() {
  const dir = path.resolve(__dirname, 'tmp', crypto.randomBytes(16)
    .toString('hex'));
  await fse.ensureDir(dir);
  return dir;
}

async function compile(dist, fixture, options = {}) {
  const compiler = webpack({
    context: path.resolve(__dirname, 'fixtures', fixture),
    entry: `./entry.js`,
    mode: "development",
    output: {
      path: dist,
      filename: 'bundle.js',
      libraryTarget: 'commonjs2',
    },
    module: {
      rules: [{
        test: /\.htl$/,
        use: {
          loader: path.resolve(__dirname, '../index.js'),
          options,
        },
      }],
    },
  });

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(new Error(stats.toJson().errors));

      resolve(stats);
    });
  });
}

describe('Build Tests', () => {
  let testRoot;
  beforeEach(async () => {
    testRoot = await createTestRoot();
  });

  afterEach(async () => {
    fse.remove(testRoot);
  });

  it('Compiles and evaluates simple htl with data.', async () => {
    await compile(testRoot, 'simple', {
      data: {
        title: 'Hello'
      }
    });
    const html = require(path.resolve(testRoot, 'bundle.js')).default;
    assert.equal(html, '<h1>Hello</h1>');
  });

  it('Compiles and evaluates simple htl with data in query.', async () => {
    await compile(testRoot, 'simple_with_query');
    const html = require(path.resolve(testRoot, 'bundle.js')).default;
    assert.equal(html, '<h1>Hello, world.</h1>');
  });

});
