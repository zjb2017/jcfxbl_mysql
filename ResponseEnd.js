function ResponseEnd(JCCache, res, success, ErrCode, Msg, result, resultCount) {
    var r = {};
    r.success = success ? success : 'false';            //业务层成功标示(success/failed)
    r.errCode = ErrCode ? ErrCode : '0';            //错误代码（业务层／数据层）
    if (r.success == 'true') {
        r.msg = Msg ? Msg : 'null';          //查询返回值（存储过程）
        r.result = result ? result : [];    //查询返回数据集
        r.totalCount = resultCount ? resultCount : 'null';      //查询返回值（查询／存储过程）
        //r.PacketCount = returnResult.PacketCount;
    } else {
        r.totalCount = 0;      //查询返回值（查询／存储过程）
        r.msg = 'null';          //查询返回值（存储过程）
        r.result = [];    //查询返回数据集
        r.totalCount = resultCount ? resultCount : 'null';      //查询返回值（查询／存储过程）
        //r.PacketCount = 0;
    }
    var resdata = JSON.stringify(r);

    res.end(resdata);

    JCCache.SrvState.ResponseCount++;
}

module.exports.ResponseEnd = ResponseEnd;