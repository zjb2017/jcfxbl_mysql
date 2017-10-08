var util = require('util');
var fs = require("fs");
var debug = require('debug')('jcDAL:LoadTempletScript');

function LoadTempletScript(JCCache,act) {
    if (typeof (JCCache.sqlModuleCache[act]) == 'undefined') {
        //https://nodejs.org/dist/latest-v6.x/docs/api/fs.html
        var path = util.format('./sqlModule/%s.xml', act.replace(/\./g, '/'));
        if (fs.existsSync(path)) {
            moduleFileData = fs.readFileSync(path);
            JCCache.sqlModuleCache[act] = moduleFileData.toString();
            debug('Template [%s] Load OK.', path);
        } else {
            debug("ERR_TEMPLET_FILE_READ_FAILED:[%s]", path);
            return null;
        }
    } else {
        moduleFileData = JCCache.sqlModuleCache[act];
        debug('Template Cache [%s] Read OK.', act);
    }

    return JCCache.sqlModuleCache[act];
}

module.exports.LoadTempletScript = LoadTempletScript;