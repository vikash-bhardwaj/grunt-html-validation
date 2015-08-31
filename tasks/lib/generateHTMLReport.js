/*
 * grunt-w3c-html-validation remote validation helper
 * https://github.com/vikash-bhardwaj/grunt-w3c-html-validation
 *
 * Copyright (c) 2015 Vikash Bhardwaj
 * Licensed under the MIT license.
 */

'use strict';

var folderPath = "";

module.exports = function generateHTMLReport(errorFileObj, options, errorFileCounter) {
    var curruntErrorFile = errorFileObj,
        grunt = require('grunt'),
        handlebars = require('handlebars');

    // Defining Handlerbars template
    if(grunt.file.exists(options.errorTemplate)) {
        var fileTemp = grunt.file.read(options.errorTemplate);
    } else {
        grunt.log.error("Error: Provided Path for HTML Template file '".error + (options.errorTemplate).error + "' is not found.".error);
        return;
    }

    var template = handlebars.compile(fileTemp);

    // Create The Subfolder Name for Error Files.
    if(errorFileCounter === 0) {
        var newDateObj = new Date(),
            datePortion = (newDateObj.getMonth() + 1) + "-" + newDateObj.getDate() + "-" + newDateObj.getFullYear(),
            timePortion = newDateObj.toTimeString(),
            dateFormat;

        timePortion = timePortion.substr(0, timePortion.lastIndexOf(":")).replace(/:/g, "-");

        dateFormat = datePortion + "-" + timePortion;
        folderPath = (options.useTimeStamp === true) ? "w3cErrors-"+ dateFormat : "w3cErrors";
    }

    var filePath;

    if (!options.errorFileFunction) {
        var filePathTemp = curruntErrorFile["filename"].split("/");

        filePathTemp = (filePathTemp[filePathTemp.length-1].indexOf(".") === -1) ? filePathTemp.slice(filePathTemp.length-2).join("").split("?")[0] : filePathTemp.slice(filePathTemp.length-2).join("").split(".")[0];

        filePathTemp.replace(/\,\<\>\?\|\*\:\"/, '');

        filePath = filePathTemp + "_validation-report" + ".html";
    } else if (typeof options.errorFileFunction === 'function') {
        filePath = options.errorFileName( curruntErrorFile['filename'] );
    }

    var errorCompletePath = (/([^\s])/.test(options.errorHTMLRootDir) === false) ? folderPath + "/" + filePath : options.errorHTMLRootDir + "/" + folderPath + "/" + filePath;

    grunt.file.write(errorCompletePath, template(curruntErrorFile));
    console.log('HTML Validation report generated: '.info + errorCompletePath);
};
