const fs = require("fs");
const path = require("path");
const { getOptions, parseQuery } = require("loader-utils");
const { Compiler } = require("@adobe/htlengine");

module.exports = async function(source) {
  const options = getOptions(this);
  const query = this.resourceQuery ? parseQuery(this.resourceQuery) : null;
  const settings = Object.assign(
    {
      globalName: "htl",
      model: "default",
      useDir: null,
      transformSource: null,
      transformCompiled: null,
      data: {}
    },
    options,
    query
  );

  let input = source;

  // Optionally transform source, e.g. remove directives `@adobe/htlengine` does not understand
  if (settings.transformSource) {
    input = settings.transformSource(source, settings);
  }

  // Set up compiler
  const compiler = new Compiler()
    .includeRuntime(true)
    .withRuntimeGlobalName(settings.globalName);

  // Compile
  let compiledCode = await compiler.compileToString(input);

  // Specify location for data files from `use` directives
  if (settings.useDir) {
    // Remove files from cache
    fs.readdirSync(settings.useDir).forEach(file => {
      const filePath = path.join(settings.useDir, file);
      delete require.cache[filePath];
    });

    compiledCode = compiledCode.replace(
      /(runtime\.setGlobal\(resource\);)/,
      `$1\nruntime.withUseDirectory('${settings.useDir}');`
    );
  }

  // Optionally transform compiled, e.g. to customize runtime
  if (settings.transformCompiled) {
    compiledCode = settings.transformCompiled(compiledCode, settings);
  }

  // Run
  const template = eval(compiledCode);
  const html = await template(settings.data);

  return `module.exports = \`${html}\``;
};
