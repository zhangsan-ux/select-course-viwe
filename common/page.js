(function ($) {
    var _total = 0,
        _pageNum = 1,
        _pageSize = 10,
        _ajaxUrl,
        _ajaxJsonData = {},
        _token = window.localStorage.getItem('AuthorizationToken'),
        _list = {},
        _cb;

    /**
     url 为 ajax请求的url
     pageSize 为每页显示的行数
     ajaxData 为ajax请求出pageNum 和pageSize 需额外传递的值的键名 组成的数组
     调用方法如： tableInit('http://localhost:8088/test/getUserList', 20, {}, 回调函数)
     **/
    function tableInit(url, pageSize, ajaxData, cb) {
        _ajaxUrl = url;
        _ajaxJsonData = typeof (ajaxData) == "undefined" ? _ajaxJsonData : ajaxData;
        _pageSize = typeof (pageSize) == "undefined" ? _pageSize : pageSize;
        _cb = cb;
        getFormAjax();
    }

    /**
     *
     * 获取信息
     *
     */
    function getFormAjax() {
        _ajaxJsonData.pageNum = _pageNum;
        _ajaxJsonData.pageSize = _pageSize;
        $.ajax({
            url: _ajaxUrl,
            data: JSON.stringify(_ajaxJsonData),
            contentType: "application/json;charset=utf-8",
            type: 'post',
            dataType: 'json',
            beforeSend: function (request) {
                //添加请求头
                request.setRequestHeader("AuthorizationToken", _token);
            },
            success: function (result, status, xhr) {
                //1000表示用户登录异常，需要重新登录
                if (result.code === 1000) {
                    layer.msg(result.message, {icon: '-1', time: 1000});
                    //从定向到登录页面
                    top.location.href = loginUrl;
                    return;
                }
                //响应头部处理
                var token = xhr.getResponseHeader("AuthorizationToken");
                if (token != null && typeof (token) != "undefined") {
                    console.log("响应头部token为:" + token);
                    window.localStorage.setItem("AuthorizationToken", token);
                }

                if (result.code === 9999) {
                    _list = result.data.rows;
                    _total = result.data.total;
                    _pageNum = result.data.pageNum;
                    _pageSize = result.data.pageSize;
                    $('#tbody').html(_cb(_list));
                    $("#total").html(_total);
                    //调用分页
                    getPageInfo();
                    //出发回调函数处理
                    if (typeof (_cb) != "undefined" && _cb != null) {
                        _cb(result);
                        return;
                    }
                    //没有回调函数暂不处理
                    return;
                }
                //其它状态则弹出文本框
                layer.msg(result.message, {icon: '-1', time: 1000});
            }
        });
    }

//layui分页的js
    function getPageInfo() {
        layui.use('laypage',
            function () {
                var laypage = layui.laypage;
                //执行一个laypage实例
                laypage.render({
                    elem: 'page1',
                    count: _total,
                    curr: _pageNum,
                    limit: _pageSize,
                    groups: 5,
                    limits: [10, 20, 30, 40, 500],
                    layout: ['count', 'prev', 'page', 'next', 'limit', 'skip'],
                    jump: function (obj, first) {
                        if (!first) {
                            _pageNum = obj.curr, _pageSize = obj.limit,
                                getFormAjax();
                        }
                    }
                });
            });
    }

    window.tableInit = tableInit
}(jQuery));