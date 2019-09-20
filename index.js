const { getOptions } = require("loader-utils");
const { Compiler } = require("@adobe/htlengine");

module.exports = async function(source) {
  const options = getOptions(this);
  const settings = Object.assign(
    {
      globalName: "htl"
    },
    options
  );

  const compiler = new Compiler()
    .includeRuntime(true)
    .withRuntimeGlobalName(settings.globalName);

  const compiledCode = await compiler.compileToString(source);

  return `
    ${compiledCode}
    const template = module.exports.main;
    module.exports = async (data) => await template(data);
  `;
};
