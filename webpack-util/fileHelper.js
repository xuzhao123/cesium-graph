var fs = require('fs');
var path = require('path');

function mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
        if (exists) {
            callback();
        } else {
            mkdirs(path.dirname(dirname), function () {
                fs.mkdir(dirname, callback);
            });
        }
    });
}

function copy(source, target) {
    fs.stat(source, function (err, stats) {
        if (err) {
            throw err;
        }
        if (stats.isFile()) {
            var readStream = fs.createReadStream(source);
            mkdirs(path.dirname(target), function () {
                var writeStream = fs.createWriteStream(target);
                readStream.pipe(writeStream);
            });
        } else {
            fs.readdir(source, function (err, paths) {
                if (err) {
                    throw err;
                }

                paths.forEach(function (path) {
                    var src = source + '/' + path;
                    var tar = target + '/' + path;
                    copy(src, tar);
                });

            });
        }
    });
}

var FileHelper = {
    mkdirs: mkdirs,
    copy: copy
};

module.exports = FileHelper;