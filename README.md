# htl-loader

Webpack loader for HTL/Sightly templates. Based on [`@adobe/htlengine`](https://www.npmjs.com/package/@adobe/htlengine).

## Installation

`npm install --save htl-loader @adobe/htlengine`

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
    ];
  }
}
```

2. Create exemplary `template.htl`:

```html
<h1 data-sly-use.page="./data">${page.title}</h1>
```

3. Create exemplary `data.js` in same directory:

```js
module.exports = class Data {
  use() {
    return {
      title: "Hello"
    };
  }
};
```

4. Import and run compiled template in your JavaScript:

```js
import html from "./template.htl";
// <h1>Hello</h1>

document.body.insertAdjacentHTML("beforeend", html);
```

## Advanced

### Configuration options

| Name                                                      | Default | Description                                               |
| :-------------------------------------------------------- | :------ | :-------------------------------------------------------- |
| [`globalName`](./test/build.test.js#L77-L86)              | `htl`   | Name of the runtime global variable.                      |
| `transformSource`                                         | `null`  | Function invoked before compiling the htl.                |
| `transformCompiled`                                       | `null`  | Function invoked after compiling the htl.                 |
| [`data`](./test/build.test.js#L61-L69)                    | `{}`    | Runtime global.                                           |
| [`includeRuntime`](./test/build.test.js#L96-L107)         | `true`  | Include runtime and evaluate template during compilation. |
| [`runtimeVars`](./test/build.test.js#L109-L124)           | `[]`    | Add (global) runtime variable names during compilation.   |
| [`moduleImportGenerator`](./test/build.test.js#L126-L145) | `null`  | Use custom module import generator.                       |
| [`scriptResolver`](./test/build.test.js#L81-L98)          | `null`  | Use custom script resolver.                               |
| [`templateLoader`](./test/build.test.js#L100-L119)        | `null`  | Use custom template loader.                               |

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
                  .replace(
                    /<sly[^>]+data-sly-call=(["']).*?\1.*?><\/sly>/g,
                    ""
                  );

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
    ];
  }
}
```

## Contributors

- [tripodsan](https://github.com/tripodsan)

## License

[MIT](http://www.opensource.org/licenses/mit-license)
