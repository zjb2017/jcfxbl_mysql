function ResponseEnd(JCCache,res, success, ErrCode, returnValue, returnMsg, returnResult) {
    var r = {};
    r.success = success ? success : 'failed';            //业务层成功标示(success/failed)
    r.ErrCode = ErrCode ? ErrCode : 'null';            //错误代码（业务层／数据层）
    if (r.success == 'success') {
        r.returnValue = returnValue ? returnValue : 'null';      //查询返回值（查询／存储过程）
        r.returnMsg = returnMsg ? returnMsg : 'null';          //查询返回值（存储过程）
        r.returnResult = returnResult ? returnResult : [];    //查询返回数据集
        //r.PacketCount = returnResult.PacketCount;
    } else {
        r.returnValue = 'null';      //查询返回值（查询／存储过程）
        r.returnMsg = 'null';          //查询返回值（存储过程）
        r.returnResult = [];    //查询返回数据集
        //r.PacketCount = 0;
    }
    var resdata = JSON.stringify(r);

    res.end(resdata);
    
    JCCache.SrvState.ResponseCount++;
}

module.exports.ResponseEnd = ResponseEnd;