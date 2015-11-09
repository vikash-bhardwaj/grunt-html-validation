/*
 * grunt-w3c-html-validation
 * https://github.com/vikash-bhardwaj/grunt-w3c-html-validation
 * Forked from grunt-html-validation https://github.com/praveenvijayan/grunt-html-validation
 * Copyright (c) 2015 Vikash Bhardwaj
 * Licensed under the MIT license which is based on original license from Forked plug-in.
 */

'use strict';

module.exports = function (grunt) {

    var w3cjs = require('w3cjs'),
        colors = require('colors'),
        chalk = require('chalk'),
        rval = require('./lib/remoteval'),
        generateHTMLReports = require('./lib/generateHTMLReport'),
        generateCheckstyleReport = require('./lib/generateCheckstyleReport'),
        fs = require('fs');

    colors.setTheme({
        silly: 'rainbow',
        input: 'grey',
        verbose: 'cyan',
        prompt: 'grey',
        info: 'green',
        data: 'grey',
        help: 'cyan',
        warn: 'yellow',
        debug: 'blue',
        error: 'red',
        blue: 'blue'
    });

    var counter = 0,
        errorFileCounter = 0,
        msg = {
            error: 'Something went wrong',
            ok: 'Validation successful..',
            start: 'Validation started for.. '.info,
            networkError: 'Network error re-validating..'.error,
            validFile: 'Validated skipping..',
            nofile: ':- No file is specified in the path!',
            nextfile: 'Skipping to next file..'.verbose,
            eof: 'End of File..'.verbose,
            fileNotFound: 'File not found..'.error,
            remotePathError: 'Remote path '.error + '(options->remotePath) '.grey +
                             'is mandatory when remote files '.error +
                             '(options-> remoteFiles) '.grey + 'are specified!'.error
        },
        len,
        reportArry = [],
        retryCount = 0,
        reportFilename = '',
        htmlSource;

    grunt.registerMultiTask('validation', 'HTML W3C validation.', function () {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            path: 'validation-status.json',
            reportpath: 'validation-report.json',
            reset: true,
            proxy: null,
            stoponerror: false,
            failHard: false,
            remotePath: false,
            maxTry: 3,
            relaxerror: [],
            doctype: false, // Defaults false for autodetect
            charset: false, // Defaults false for autodetect
            generateReport: true,
            errorHTMLRootDir: "w3cErrors",
            useTimeStamp: false,
            errorTemplate: __dirname.split("/lib")[0] + "/template/error_template.html"
        });

        var done = this.async(),
            files = grunt.file.expand(this.filesSrc),
            flen = files.length,
            readSettings = {},
            isRelaxError = false,
            entityMap = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': '&quot;',
                "'": '&#39;',
                "/": '&#x2F;'
            };

        isRelaxError = options.relaxerror.length && options.relaxerror.length !== '';

        var escapeHtml = function(string) {
            return String(string).replace(/[&<>"'\/]/g, function (s) {
              return entityMap[s];
            });
        };

        var makeFileList = function (files) {
            return files.map(function (file) {
                return options.remotePath + file;
            });
        };

        //Reset current validation status and start from scratch.
        if (options.reset) {
            grunt.file.write(options.path, '{}');
        }

        if (!flen) {
            var nomsg = this.data.src;
            console.log(nomsg + msg.nofile.error);
        }
        /*
         * This method is not used anymore

        var updateErrObjForSourceContext = function(errSourceContext, errorObj) {
            // Return the method with blank properties if no "lastLine" defined for error Object.
            if(typeof errorObj.lastLine === "undefined") {
                return {
                    errSrcFirstPart: "",
                    errSrcToHighlight: "",
                    errSrcSecondPart: ""
                };
            }

            var errSourceContextLine = errSourceContext[errorObj["lastLine"] -1],
                errSrcContextLen = errSourceContextLine.length,
                errorPoint = errorObj["lastColumn"],
                errorSrcMidNum = 39,
                isErrPartialSrcCode = (errSrcContextLen >  (errorPoint + errorSrcMidNum)),
                errSourceEndPoint = isErrPartialSrcCode ? errorPoint + errorSrcMidNum :  errSrcContextLen,
                errSourceStartPoint = isErrPartialSrcCode ? errorPoint - errorSrcMidNum :  0;

            errSourceContextLine = errSourceContextLine.substring(errSourceStartPoint, errSourceEndPoint);

            var errSrcLen = errSourceContextLine.length,
                errorSourceContext = {};

            errorSourceContext["errSrcFirstPart"] = (errSrcLen === 78) ? "..." + errSourceContextLine.substring(0, errorSrcMidNum - 1) : errSourceContextLine.substring(0, errorPoint - 1);

            errorSourceContext["errSrcToHighlight"] = (errSrcLen === 78) ? errSourceContextLine.substr(errorSrcMidNum - 1, 1) : errSourceContextLine.substr(errorPoint - 1, 1);

            errorSourceContext["errSrcToHighlight"] = '<strong style="color: #FF0000; font-weight: bold; cursor: help; border-bottom: thin dotted;" title="Position where error was detected.">' + errorSourceContext["errSrcToHighlight"] + '</strong>';

            errorSourceContext["errSrcSecondPart"] = (errSrcLen === 78) ? errSourceContextLine.substring(errorSrcMidNum, 78) + "..." : errSourceContextLine.substring(errorPoint, errSrcContextLen);

            return errorSourceContext;
        };
        */

        var addToReport = function (fname, status) {
            var relaxedReport = [],
                report = {},
                styleToHighlight = '<strong style="background-color: #FFFF80; font-weight: bold;" title="Position where error was detected.">ErrorToCome</strong>';

            // No Need to execute complete method if status is coming as "false"
            if(status === false) {
                report.filename = fname;
                report.error = relaxedReport;
                reportArry.push(report);

                return;
            }

            for (var i = 0; i < status.length; i++) {
                if (!checkRelaxError(status[i].message)) {
                    /********
                     * We don't need below code anymore to generate the Error Source Code Content.
                     * This is becasue now W3CJS Node Plug-in has been updated with new HTML checker which provides Code extract as part of JSON.

                    /*
                     * Code to update the Error Object with Source code Context.
                     * This will help user to find the error by copy/paste in source of HTML.
                     *
                    var errorSourceContext = updateErrObjForSourceContext(errSourceContext, status[i]);

                    status[i]["errSrcFirstPart"] = errorSourceContext["errSrcFirstPart"];

                    status[i]["errSrcToHighlight"] = errorSourceContext["errSrcToHighlight"];

                    status[i]["errSrcSecondPart"] = errorSourceContext["errSrcSecondPart"];

                    // Update the Explanation Link to w3c feedback link and also add target attribute top open the link in new Tab.
                    status[i]["explanation"] = status[i]["explanation"].replace("href=\"feedback.html", "target=\"_blank\" href=\"http://validator.w3.org/feedback.html");
                    */

                    // Highlight the Source Code.
                    if(status[i]["extract"]) {
                        var extractTemp = status[i]["extract"],
                            hiliteStart = status[i]["hiliteStart"],
                            hiliteLength = status[i]["hiliteLength"];

                            status[i]["errSrcFirstPart"] = extractTemp.substr(0, hiliteStart);
                            status[i]["errSrcToHighlight"] = escapeHtml(extractTemp.substr(hiliteStart, hiliteLength));
                            status[i]["errSrcToHighlight"] = styleToHighlight.replace("ErrorToCome", status[i]["errSrcToHighlight"]);
                            status[i]["errSrcSecondPart"] = extractTemp.substr(hiliteStart + hiliteLength);
                    }

                    relaxedReport.push(status[i]);
                }
            }

            report.filename = fname;
            report.error = relaxedReport;
            reportArry.push(report);

            /**
             * Code to generate the HTML Reports if needed
             */
            if(relaxedReport[0] && options.generateReport === true) {
                generateHTMLReports(report, options, errorFileCounter);
                errorFileCounter++;
            }
        };

        var wrapfile,
            wrapfile_line_start = 0,
            combinedErrorReports = [];
        var validate = function (files) {
            if (files.length) {
                // fix: Fatal error: Unable to read 'undefined' file (Error code: ENOENT).
                if (!files[counter]) {
                    done();
                    return;
                }


                if (grunt.file.exists(options.path)) {
                    readSettings = grunt.file.readJSON(options.path);
                }
                var currFileStat = readSettings[files[counter]] || false;

                if (currFileStat) {
                    console.log(msg.validFile.green + files[counter]);
                    reportFilename = options.remoteFiles ? dummyFile[counter] : files[counter];
                    addToReport(reportFilename, false);
                    counter++;
                    validate(files);
                    return;
                }

                if (files[counter] !== undefined) {

                    var filename = options.remoteFiles ? dummyFile[counter] : files[counter];

                    console.log(msg.start + filename);
                }

                var errorReports = [];

                var w3cjs_options = {
                    //file: files[counter],       // file can either be a local file or a remote file
                    // file: 'http://localhost:9001/010_gul006_business_landing_o2_v11.html',
                    output: 'json',             // Defaults to 'json', other option includes html
                    doctype: options.doctype,   // Defaults false for autodetect
                    charset: options.charset,   // Defaults false for autodetect
                    proxy: options.proxy,       // Proxy to pass to the w3c library
                    callback: function (res) {

                        errorReports.push( res );
                        combinedErrorReports.push( res );

                        flen = files.length;

                        if (!res.messages) {
                            ++retryCount;
                            var netErrorMsg = msg.networkError + ' ' + retryCount.toString().error + ' ';
                            if (retryCount === options.maxTry) {
                                counter++;
                                if (counter !== flen) {
                                    netErrorMsg += msg.nextfile;
                                } else {
                                    netErrorMsg += msg.eof;
                                }
                                retryCount = 0;
                            }

                            console.log(netErrorMsg);
                            validate(files);
                            return;
                        }

                        len = res.messages.length;

                        var setGreen = function () {
                            readSettings[files[counter]] = true;
                            grunt.log.ok(msg.ok.green);

                            reportFilename = options.remoteFiles ? dummyFile[counter] : files[counter];
                            addToReport(reportFilename, false);
                        };

                        if (len) {
                            var errorCount = 0,
                                prop;

                            for (prop in res.messages) {
                                res.messages[prop].unwrapLine = res.messages[prop].lastLine - wrapfile_line_start;
                            }

                            for (prop in res.messages) {
                                var chkRelaxError;
                                if (isRelaxError) {
                                    chkRelaxError = checkRelaxError(res.messages[prop].message);
                                }

                                if (!chkRelaxError) {
                                    errorCount = errorCount + 1;

                                    var lineNumber = ' Line no: ' + JSON.stringify(options.wrapfile ? res.messages[prop].unwrapLine : res.messages[prop].lastLine);
                                    if (typeof(prompt) !== 'undefined') {
                                        lineNumber = lineNumber.prompt;
                                    }

                                    console.log(errorCount + '=> '.warn + JSON.stringify(res.messages[prop].message).help + lineNumber );
                                }

                            }

                            if (errorCount !== 0) {
                                console.log('No of errors: '.error + errorCount);
                            }

                            readSettings[files[counter]] = false;
                            reportFilename = options.remoteFiles ? dummyFile[counter] : files[counter];
                            addToReport(reportFilename, res.messages);

                            if (options.stoponerror) {
                                done();
                                return;
                            }

                            if (isRelaxError && errorCount === 0) {
                                setGreen();
                            }

                        } else {

                            setGreen();

                        }

                        grunt.file.write(options.path, JSON.stringify(readSettings));
                        // depending on the output type, res will either be a json object or a html string
                        counter++;

                        if (counter === flen) {
                            if (options.generateCheckstyleReport) {
                                var checkstyleReport = generateCheckstyleReport( combinedErrorReports );

                                grunt.file.write( options.generateCheckstyleReport, checkstyleReport );
                                console.log('Checkstyle report generated: '.green + options.generateCheckstyleReport );
                            }

                            if (options.reportpath) {
                                grunt.file.write(options.reportpath, JSON.stringify(reportArry));
                                console.log('Validation report generated: '.green + options.reportpath);
                            }
                            if (options.failHard) {
                                var validationErrCount = reportArry.reduce(function (sum, report) {
                                    return sum + report.error.length;
                                }, 0);
                                if (validationErrCount > 0) {
                                    grunt.fail.warn(validationErrCount + ' total unignored HTML validation error' + grunt.util.pluralize(validationErrCount, '/s') + '.');
                                }
                            }
                            done();
                            if (!options.remoteFiles) {
                                return;
                            }
                        }

                        if (options.remoteFiles) {
                            if (counter === flen) {
                                return;
                            }

                            rval(dummyFile[counter], options.request, function () {
                                validate(files);
                            });

                        } else {
                            validate(files);
                        }
                    }
                };

                if (options.wrapfile) {
                    if (!wrapfile) {
                        wrapfile = grunt.file.read(options.wrapfile);
                        wrapfile_line_start = wrapfile.substring(0, wrapfile.indexOf('<!-- CONTENT -->')).split('\n').length - 1;
                    }

                    w3cjs_options.input = htmlSource = wrapfile.replace('<!-- CONTENT -->', grunt.file.read(files[counter]));

                } else if(options.remoteFiles) {
                    /*
                     * New Code Changed to fix:
                     * the issue where plug-in was skipping validation for all files/URL after any Error-Free file/URL.
                     * We changed the Dynamic URL for tempp path to hard coded as it was conflicting with chnaged code of files array.
                     */
                    w3cjs_options.file = '_tempvlidation.html';

                    htmlSource = fs.readFileSync(w3cjs_options.file, "utf-8");
                } else {
                    w3cjs_options.file = files[counter];

                    htmlSource = fs.readFileSync(w3cjs_options.file, "utf-8");
                }

                // override default server
                if (options.serverUrl) {
                    w3cjs.setW3cCheckUrl(options.serverUrl);
                }

                w3cjs.validate(w3cjs_options);
            }
        };

        function checkRelaxError(error) {
            for (var i = 0, l = options.relaxerror.length; i < l; i++) {
                var re = new RegExp(options.relaxerror[i], 'g');
                if (re.test(error)) {
                    return true;
                }
            }
        }

        /* Remote validation
         * Note on Remote validation.
         *  W3Cjs supports remote file validation but due to some reasons it is not working as expected.
         *  Local file validation is working perfectly. To overcome this remote page is fetch using 'request'
         *  npm module and write page content in '_tempvlidation.html' file and validates as local file.
         */

        if (!options.remotePath && options.remoteFiles) {
            console.log(msg.remotePathError);
            return;
        }

        if (options.remotePath && options.remotePath !== '') {
            files = makeFileList(files);
        }

        if (options.remoteFiles) {

            if (typeof options.remoteFiles === 'object' && options.remoteFiles.length && options.remoteFiles[0] !== '') {
                files = options.remoteFiles;

            } else {
                files = grunt.file.readJSON(options.remoteFiles);
            }

            files = makeFileList(files);

            var dummyFile = files;

            files = [];

            for (var i = 0; i < dummyFile.length; i++) {
                /**
                 * Old Code from original grunt plug-in
                    files.push('_tempvlidation.html');
                 */

                /**
                 * New Code Changed to fix:
                 * the issue where plug-in was skipping validation for all files/URL after any Error-Free file/URL.
                 * We changed the Hard coded names of file in files array to dynamic so that it doesn't skip the files after any Error-Free file/URL.
                 */
                var filePathTemp = dummyFile[i].split("/");
                filePathTemp = filePathTemp.slice(filePathTemp.length-2).join("").replace(/[&.+/http(s):=?]/g, "");

                files.push(filePathTemp + '_tempvlidation.html');
            }

            rval(dummyFile[counter], options.request, function () {
                validate(files);
            });

            return;
        }

        if (!options.remoteFiles) {
            validate(files);
        }

    });

};
