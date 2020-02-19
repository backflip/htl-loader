# htl-loader

Webpack loader for HTL/Sightly templates. Based on [`@adobe/htlengine`](https://www.npmjs.com/package/@adobe/htlengine).

## Installation

`npm install --save-dev htl-loader @adobe/htlengine`

## Usage

See [./example](./example).

1. Add loader to `webpack.config.js`:

```js
{
  module: {
    rules: [
      {
        test: /\.htl$/,
        use: ["htl-loader"]
      }
    ]
  }
}
```

2. Create examplary `template.htl`:

```html
<h1>${htl.title}</h1>
```

3. Import and run compiled template in your JavaScript:

```js
import html from "./template.htl?{\"data\":{\"title\":\"Hello\"}}";

document.body.insertAdjacentHTML("beforeend", html);
```

## Advanced

### Configuration options:

| Name | Default | Description |
|:-----|:---|:------------|
| `globalName` | `htl` | Name of the runtime global variable. |
| `useDir` | `null` | Root directory for use-classed passed to the runtime. |
| `transformSource` | `null` | Function invoked before compiling the htl. |
| `transformCompiled` | `null` | Function invoked after compiling the htl. |
| `data` | `{}` | Runtime global. |
| `includeRuntime` | `true` | Include runtime and evaluate template during compilation. |
| `runtimeVars` | `[]` | Add (global) runtime variable names during compilation. |
| `moduleImportGenerator` | `null` | Use custom module import generator. |

### Example

```js
{
  module: {
    rules: [
      {
        test: /\.htl$/,
        use: [
          {
            loader: "htl-loader",
            options: {
              // Remove directives `@adobe/htlengine` does not understand
              transformSource: source => {
                const output = source
                  .replace(/data-sly-use\.templates?="(.*?)"/g, "")
                  .replace(/<sly[^>]+data-sly-call=(["']).*?\1.*?><\/sly>/g, "");

                return output;
              },
              // Allow for custom models in data from `use` directives
              transformCompiled: (compiled, settings) => {
                const output = compiled.replace(
                  /(new Runtime\(\);)/,
                  `$1
                  const originalUse = runtime.use.bind(runtime);
                  runtime.use = function(uri, options) {
                    const settings = Object.assign({
                      model: '${settings.model}'
                    }, options);
                    return originalUse(uri, settings);
                  }`
                );

                return output;
              },
              useDir: path.resolve(__dirname, "../src/htlmocks")
            }
          }
        ]
      }
    ]
  }
}
```

## License

[MIT](http://www.opensource.org/licenses/mit-license)
