'use strict';

var checkstyleFormatter = require('checkstyle-formatter');

module.exports = function ( files ) {
    var errorFormatted = [];

    files.forEach( function ( file ) {
        var errorFile = {
            filename: file.context,
            messages: []
        };
        errorFormatted.push(errorFile);
        file.messages.forEach( function ( error ) {
            if ( error.type !== 'info' ) {
                errorFile.messages.push({
                    line: error.lastLine,
                    column: error.firstColumn,
                    severity: error.type,
                    message: error.message
                });
            }
        });
    });

    return checkstyleFormatter( errorFormatted );
};
