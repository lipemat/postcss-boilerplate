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
    "theme_path": "./",
    "scripts": {
      "dist": "lipemat-postcss-boilerplate dist",
      "postinstall": "lipemat-postcss-boilerplate fix-pnp",
      "lint": "lipemat-postcss-boilerplate lint",
      "start": "lipemat-postcss-boilerplate start"
    },
  "dependencies": {
    "@lipemat/postcss-boilerplate": "^4.5.0"
  }
}

```
* `brotliFiles : {bool}` Enabled generating pre-compressed .br files for CSS and JS. Defaults to `true`.
* `css_folder : {string}` Path of directory for generate finished CSS files within. Defaults to `./css/dist/`.
* `cssEnums : {bool}` Generate PHP enums for CSS modules. Has no effect if `combinedJson` is false. Defaults to `true`.
* `file_name : {string}` Name of finished CSS file. Defaults to `front-end`.
* `shortCssClasses: {bool|{js:bool, pcss:bool}}` Enable short 1-2 character CSS classes. Recommended if you're not running multiple instances of this package on the same site.
* `theme_path : {string}` Path or theme's root relative to the package.json file.


### Configuration Overrides
All configurations are found in the `config` directory and may be extended by adding a matching file within your project directory.

For instance is you want to adjust `postcss.js` you may add a `config/postcss.js` file in your project directory.

All declarations are merged in favor of the project config.

## Certificates

If you are using https in your local environment, you may point to the certificates in your package.json like so:

```json
{
  "certificates": {
    "cert": "<path to -crt.pem file>",
    "key": "<path to -key.pem file>"
  }
}
```

If certificates are provided, live reload will load via https. You'll want to point your livereload script https, and the domain of certificates origin.

## Live Reload Port

Each `start` run claims the first free LiveReload port in the range `35729`-`35748`, allowing up to 20 worktrees to run their dev servers in parallel. If all 20 ports are in use, `start` fails immediately.

The chosen port is written to a `.running` JSON file in the CSS dist folder while `start` is active and removed on exit:

```json
{
  "pid": 12345,
  "port": 35730,
  "started": "2026-06-22T00:00:00.000Z"
}
```

PHP reads this file via `Lipe\Lib\Theme\Resources::live_reload()` to point the LiveReload script at the correct port for the current worktree, falling back to `35729` when the file is absent.
