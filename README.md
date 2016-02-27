# grunt-w3c-html-validation [![Build Status](https://travis-ci.org/praveenvijayan/grunt-html-validation.png?branch=master)](https://travis-ci.org/praveenvijayan/grunt-html-validation)

> W3C html validation grunt plugin, Forked from <a target="_blank" title="html-grunt-validation" href="https://github.com/praveenvijayan/grunt-html-validation">html-grunt-validation</a>. Validate all files in a directory automatically.

This version has below additions on top of original plug-in:
<ul>
  <li>This plug-in has been extended to generate the W3C error's source code context/reference from validated code. This will help users to find the error easily by just copy/paste from validated page source.</li>
  <li>Original plug-in was skipping validation for all files/URL after any Error-Free file/URL. This will not skip files after a error free file/URL and will validate all configured files/URLs.</li>
  <li>This plug-in has also been extended for generating W3C reports in HTML format and now has some extra settings.</li>
</ul>

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-w3c-html-validation --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-w3c-html-validation');
```

And add to your task list using `validation`:

```js
grunt.registerTask('default', ['validation']);
```

## The "validation" task

### Overview
In your project's Gruntfile, add a section named `validation` to the data object passed into `grunt.initConfig()`.

```js
validation: {
    options: {
        reset: grunt.option('reset') || false,
        stoponerror: false,
        remotePath: 'http://decodize.com/',
        remoteFiles: ['html/moving-from-wordpress-to-octopress/',
                      'css/site-preloading-methods/'], //or
        remoteFiles: 'validation-files.json', // JSON file contains array of page paths.
        relaxerror: ['Bad value X-UA-Compatible for attribute http-equiv on element meta.'], //ignores these errors
        generateReport: true,
        errorHTMLRootDir: "w3cErrorFolder",
        useTimeStamp: true,
        errorTemplate: "w3c_validation_error_Template.html"
    },
    files: {
        src: ['<%= yeoman.app %>/*.html',
              '!<%= yeoman.app %>/index.html',
              '!<%= yeoman.app %>/modules.html',
              '!<%= yeoman.app %>/404.html']
    }
}
```

### Options

## New Options

#### options.errorFileFunction

Type: `Mixed` <br/>
Default value: `undefined`

This is a generator for the error file. It must be a `function`

#### options.generateReport
Type: `Boolean` <br/>
Default value: `'true'`
Flag to get the W3C errors to be generated in form of HTML files, if set to `false` then it will will not generate HTML report of errors.

Note: Error HTMLs files will be generated only if file/URL has some errors, in case of no error it will not generate the error file.

#### options.generateCheckstyleReport
Type: `String`<br>
Default value: `undefined`

When a string is set ther will be generated a checkstyle report in this path.

#### options.errorHTMLRootDir
Type: `String` <br/>
Default value: `w3cErrorFolder`
Sets the name for Root Folder which will contain W3C error HTMLs wrapped by another folder.

#### options.useTimeStamp
Type: `String` <br/>
Default value: `'false'`
If set to `true` sub folder inside `options.errorHTMLRootDir` folder will have a Timestamp with format - 'w3cErrors-Month-Date-Year-Hours-Minutes', an example can be 'w3cErrors-3-23-2015-09-37'. If set to `false` then it will overwrite the error sub folder and will not have the Timestamp, folder name will be 'w3cErrors'.

#### options.errorTemplate
Type: `String` <br/>
Default value: `w3c_validation_error_Template.html`
Expects name for 'Handlebar' template to generate the error's HTMLs. Sample template is provided with plug-in in root folder.

#### options.request
Type `object` <br/>
Default value: `undefined`

Configuration for the `request` Module. For more information please read [the docs](https://github.com/request/request/tree/v2.40.0).

## Regular grunt-html-validation Options

#### options.reset
Type: `Boolean` <br/>
Default value: `'false'`

Resets all the validated  files status. When want to revalidate all the validated files -
`eg: sudo grunt validation --reset=true`

#### options.proxy
Type: `String` <br/>
Default value: `null`

Setup your proxy when you are behind a corporate proxy and encounters `ETIMEDOUT`.

```js
proxy: 'http://proxy:8080'
```

#### options.serverUrl
Type: `String` <br/>
Default value: `null`

Supply a different validator server URL, for instance [if you run a local server](http://validator.w3.org/source/).
Eg: `http://localhost/w3c-validator/check`

#### options.path
Type: `String` <br/>
Default value: `'validation-status.json'`

Default file for storing validation information.

#### options.reportpath
Type: `String` <br/>
Default value: `validation-report.json`

Consolidated report in JSON format, if reportpath is `false` it will not generated.

#### options.stoponerror
Type: `Boolean` <br/>
Default value: `false`

When hit by a validation error, html-validator continue validating next file by default and this process continues until all files in the list completes validation. If 'stoponerror' set to  `true`, validator will stop validating next file.

#### options.maxTry
Type: `Number` <br/>
Default value: `3`

Number of retries when network error occuers. Default case, after 3 reties validator will move to next file.

#### options.remotePath
Type: `String` <br/>
Default value: ``

#### options.wrapfile
Type: `String` <br/>
Default value: ``

File that will wrap your files inside.

The file must contain a comment that will be replaced by each file content: **&lt;!-- CONTENT --&gt;**

Useful to validate partials because w3c validator need &lt;html&gt;, &lt;head&gt;, &lt;body&gt;...

Note: line reported will be the partial line, if you see a negative number this means that the error is in the *wrapfile*.

example

```html
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
      <!-- CONTENT -->
  </body>
</html>
```



#### options.remoteFiles
Type: `Array` <br/>
Default value: ``

Array of page paths to be validated. When remote files are not present validator will append file names from local folder. `remotePath` is mandatory when this option is specified.

eg:

```js
remoteFiles: ['html/moving-from-wordpress-to-octopress/',
              'css/site-preloading-methods/']
```

you can also provide a file that contains an array of pages.

```js
remoteFiles: 'validation-files.json'
```

```js
['html/getting-started-with-yeoman-1-dot-0-beta-on-windows',
'html/slidemote-universal-remote-control-for-html5-presentations/',
'html/simple-responsive-image-technique/']
```

#### options.relaxerror
Type: `Array` <br/>
Default value: ``

Helps to skip certain w3c errors messages from validation. Give exact error message or a regular expression in an array & validator will ignore those relaxed errors from validation.

```js
relaxerror: ['Bad value X-UA-Compatible for attribute http-equiv on element meta.',
             'document type does not allow element "[A-Z]+" here']
```

#### options.doctype
Type: `String` <br/>
Default value: `false`

Set `false` for autodetect or chose one of this options:

- `HTML5`
- `XHTML 1.0 Strict`
- `XHTML 1.0 Transitional`
- `XHTML 1.0 Frameset`
- `HTML 4.01 Strict`
- `HTML 4.01 Transitional`
- `HTML 4.01 Frameset`
- `HTML 4.01 + RDFa 1.1`
- `HTML 3.2`
- `HTML 2.0`
- `ISO/IEC 15445:2000 ("ISO HTML")`
- `XHTML 1.1`
- `XHTML + RDFa`
- `XHTML Basic 1.0`
- `XHTML Basic 1.1`
- `XHTML Mobile Profile 1.2`
- `XHTML-Print 1.0`
- `XHTML 1.1 plus MathML 2.0`
- `XHTML 1.1 plus MathML 2.0 plus SVG 1.1`
- `MathML 2.0`
- `SVG 1.0`
- `SVG 1.1`
- `SVG 1.1 Tiny`
- `SVG 1.1 Basic`
- `SMIL 1.0`
- `SMIL 2.0`


#### options.charset
Type: `String` <br/>
Default value: `false`

Set `false` for autodetect or chose one of this options:

- `utf-8`
- `utf-16`
- `iso-8859-1`
- `iso-8859-2`
- `iso-8859-3`
- `iso-8859-4`
- `iso-8859-5`
- `iso-8859-6-i`
- `iso-8859-7`
- `iso-8859-8`
- `iso-8859-8-i`
- `iso-8859-9`
- `iso-8859-10`
- `iso-8859-11`
- `iso-8859-13`
- `iso-8859-14`
- `iso-8859-15`
- `iso-8859-16`
- `us-ascii`
- `euc-jp`
- `shift_jis`
- `iso-2022-jp`
- `euc-kr`
- `gb2312`
- `gb18030`
- `big5`
- `big5-HKSCS`
- `tis-620`
- `koi8-r`
- `koi8-u`
- `iso-ir-111`
- `macintosh`
- `windows-1250`
- `windows-1251`
- `windows-1252`
- `windows-1253`
- `windows-1254`
- `windows-1255`
- `windows-1256`
- `windows-1257`

#### options.failHard
Type: `boolean` <br/>
Default value: `false`

If true, the task will fail at the end of its run if there were any validation errors that were not ignored via `options.relaxerror`.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

Report issues [here](https://github.com/vikash-bhardwaj/grunt-w3c-html-validation/issues)

## Release History
 * 2016-02-27   v0.1.8   Updated peer dependency to support Grunt 1.0.0 
 * 2015-11-26   v0.1.7   Added Checkstyle reporter 
 * 2015-08-18   v0.1.6   Updated the Documentation issues highlighted by a user.
 * 2015-08-18   v0.1.5   Updated the code for fixing an issue where it was skipping the report creation for URLs which were changing only Query String Parameter.
 * 2015-08-18   v0.1.4   Updated plug-in to fix the error in temp file name.
 * 2015-08-18   v0.1.3   Updated plug-in to include error template as part of installation and also add configuration for errorFileFunction to pass a function.
 * 2015-08-17   v0.1.2   Updated Plug-in on the basis of new W3CJS plug-in changes because W3C Mark-up validator API changed their URL.
 * 2015-07-08   v0.1.1   Updated the code for fixing some issues related to code break because current API started returning an info object which doesn't have some required properties so error report creation was breaking.
 * 2015-04-25   v0.0.9   Updated to extended for generating the W3C error's source code context/reference from validated code. This will help users to find the error easily by just copy/paste from validated page source.
 * 2015-04-23   v0.0.8   Updated the Release History.
 * 2015-04-23   v0.0.7   Changed the version number to push to NPM, this Version is more stable than the previous versions because it has fix for Local repository validations.
 * 2015-03-29   v0.0.6   Updated Comments and headers of files.
 * 2015-03-23   v0.0.5   Updated Readme for new settings which has been added to generate the HTML reoprts for W3C errors, also added sample handlebar template for HTML report.
 * 2015-03-19   v0.0.4   Updatedto have capability to generate the Errors in HTML format using Handlebar as a dependency
 * 2015-03-19   v0.0.3   updated package.json for updated git information
 * 2015-03-19   v0.0.2   updated readme and package.json
 * 2015-03-19   v0.0.1   Updated Package.json and License file to publish the plug-in with new features.
 * 2014-05-27   v0.1.18  Version bump, Fixes #54
 * 2014-05-15   v0.1.17  Fixes #50, #52
 * 2014-04-23   v0.1.16  Fixes
 * 2014-04-03   v0.1.15  Updated dependencies (jshnt, nodeunit, request), gitignore, code cleanup etc..
 * 2014-03-23   v0.1.14  Updated with wrapfile & server url options.
 * 2013-12-26   v0.1.13  Fixed running multiple tasks fail due to validation failure.
 * 2013-12-17   v0.1.11  Option to set proxy, w3cjs updated to 0.1.22, added fail hard and some bug fixes
 * 2013-11-22   v0.1.9   Fix some bugs
 * 2013-11-22   v0.1.8   Added options for specify doctype and charset
 * 2013-11-22   v0.1.7   Added support for RegExp in relaxed validation
 * 2013-08-31   v0.1.6   Added relaxed validation, w3cjs updated from 0.1.9 to 0.1.10.
 * 2013-08-31   v0.1.5   Added remote validation support. Max network error retry count.
 * 2013-08-19   v0.1.4   Fixed issues. Added 'stoponerror' option, validation report added.
 * 2013-08-05   v0.1.2   Fixed issues.
 * 2013-04-20   v0.1.0   Initial release.


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/praveenvijayan/grunt-html-validation/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

