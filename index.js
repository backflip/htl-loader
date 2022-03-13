const fs = require("fs");
const path = require("path");
const { Compiler } = require("@adobe/htlengine");

// Basic loader query parser allowing for `?data=JSON_OBJECT`
function parseQuery(resourceQuery) {
  const result = {};
  const params = new URLSearchParams(resourceQuery.slice(1));

  for (const [key, value] of params.entries()) {
    if (key === "data") {
      result[key] = JSON.parse(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

module.exports = async function (source) {
  const options = this.getOptions();
  const query = this.resourceQuery ? parseQuery(this.resourceQuery) : null;
  const settings = Object.assign(
    {
      globalName: "htl",
      model: "default",
      transformSource: null,
      transformCompiled: null,
      includeRuntime: true,
      runtimeVars: [],
      moduleImportGenerator: null,
      templateLoader: null,
      scriptResolver: null,
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
    .withDirectory(this.rootContext)
    .includeRuntime(settings.includeRuntime)
    .withRuntimeGlobalName(settings.globalName);

  settings.runtimeVars.forEach(name => {
    compiler.withRuntimeVar(name);
  });
  if (settings.moduleImportGenerator) {
    compiler.withModuleImportGenerator(settings.moduleImportGenerator);
  }
  if (settings.templateLoader) {
    compiler.withTemplateLoader(settings.templateLoader);
  }
  if (settings.scriptResolver) {
    compiler.withScriptResolver(settings.scriptResolver);
  }

  // Compile
  let compiledCode = await compiler.compileToString(
    input,
    path.relative(__dirname, this.context)
  );

  // Optionally transform compiled, e.g. to customize runtime
  if (settings.transformCompiled) {
    compiledCode = settings.transformCompiled(compiledCode, settings);
  }

  if (settings.includeRuntime) {
    // Run
    const template = eval(compiledCode);
    const html = await template(settings.data);

    return `module.exports = \`${html}\``;
  } else {
    return compiledCode;
  }
};
