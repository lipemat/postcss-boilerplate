## The Start Of A Beautiful PostCSS Structure

A zero configuration starting point for postcss styled theme or plugin.

### Installation
```bash
yarn add @lipemat/postcss-boilerplate
```
 
### Usage
Add the following to your package.json. (this may also be found in the `templates` directory.

```json
{
    "theme_path": "../wp-content/themes/core/",
    "root": "../",
    "file_name": "front-end",
    "scripts": {
      "dist": "lipemat-postcss-boilerplate dist",
      "start": "lipemat-postcss-boilerplate start",
      "lint": "lipemat-postcss-boilerplate lint"
    },
    "resolutions": {
        "css-modules-loader-core": "https://github.com/lipemat/css-modules-loader-core.git"
      },
    "dependencies": {
      "@lipemat/postcss-boilerplate": "^2.0.1"
    }
}

```

You may adjust things as needed by be sure to leave the `scripts` as is.


### Configuration Overrides
All configurations are found in the `config` directory and may be extended by adding a matching file within your project directory.

For instance is you want to adjust `postcss.js` you may add a `config/postcss.js` file in your project directory.

All declarations are merged in favor of the project config.
