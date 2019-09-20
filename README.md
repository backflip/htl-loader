# htl-loader

Webpack loader for HTL/Sightly templates. Based on [`@adobe/htlengine`](https://www.npmjs.com/package/@adobe/htlengine).

## Installation

`npm install --save-dev htl-loader @adobe/htlengine`

## Usage

See [./test](./test).

1. Add loader to `webpack.config.js`:

```js
{
  module: {
    rules: [
      {
        test: /\.htl$/,
        use: {
          loader: "htl-loader",
          options: {
            globalName: "htl"
          }
        }
      }
    ]
  },
  node: {
    fs: "empty"
  }
}
```

2. Create examplary `template.htl`:

```html
<h1>${htl.title}</h1>
```

3. Import and run compiled template in your JavaScript:

```js
import template from "./template.htl";

(async () => {
  const html = await template({
    title: "HTL"
  });

  document.body.insertAdjacentHTML("beforeend", html);
})();
```

## License

[MIT](http://www.opensource.org/licenses/mit-license)
