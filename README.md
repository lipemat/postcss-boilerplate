## The Start Of A Beautiful PostCSS Structure

<p>
<a href="https://www.npmjs.com/package/@lipemat/postcss-boilerplate">
<img alt="npm" src="https://img.shields.io/npm/v/@lipemat/postcss-boilerplate.svg">
</a>
    <img alt="node" src="https://img.shields.io/node/v/@lipemat/postcss-boilerplate.svg">
</p>


A zero configuration starting point for postcss styled theme or plugin.

### Installation
```bash
yarn add @lipemat/postcss-boilerplate
```
 
### Usage
Add the following to your package.json. You may adjust things to fit your environment but be sure to leave the `scripts` as is.

_This may also be found in the "templates" directory._

```json
{
    "theme_path": "../wp-content/themes/core/",
    "root": "../",
    "file_name": "front-end",
    "css_folder": "css/",
    "scripts": {
      "dist": "lipemat-postcss-boilerplate dist",
      "postinstall": "lipemat-postcss-boilerplate fix-pnp",
      "lint": "lipemat-postcss-boilerplate lint",
      "start": "lipemat-postcss-boilerplate start"
    },
    "dependencies": {
      "@lipemat/postcss-boilerplate": "^3.0.0"
    }
}

```


### Configuration Overrides
All configurations are found in the `config` directory and may be extended by adding a matching file within your project directory.

For instance is you want to adjust `postcss.js` you may add a `config/postcss.js` file in your project directory.

All declarations are merged in favor of the project config.
