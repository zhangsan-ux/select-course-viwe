(function ($) {
    var _ajaxUrl,
        _ajaxJsonData = {},
        //从localStorage中获取token
        _token = window.localStorage.getItem('AuthorizationToken'),
        _contentType,
        _baseUrl = "http://localhost/select-course/",
        _loginUrl = "http://localhost/select-course-view/view/user/login.html",
        _indexUrl = "http://localhost/select-course-view/view/index.html",
        _studentIndexUrl =  "http://localhost/select-course-view/view/student/courseList.html",
        _courseId,
        _courseName,
        _courseCredit,
        _list = {},
        _menu = window.localStorage.getItem('menus') ,
        _permissions = window.localStorage.getItem('permissions'),
        _cb;

    /**
     * get ajax表单提交请求
     * @param url 请求url
     * @param ajaxData 请求数据(非json格式字符串，使用对象格式)
     * @param cb 回调函数
     */
    function sendGetFormDateAjax(url, ajaxData, cb) {
        _ajaxUrl = url;
        _ajaxJsonData = ajaxData;
        // _contentType = "multipart/form-data";
        _cb = cb;
        sendAjax('get');
    }

    /**
     * get ajax表单提交请求
     * @param url 请求url
     * @param ajaxData 请求数据(非json格式字符串，使用对象格式)
     * @param cb 回调函数
     */
    function sendGetFormDateAjaxForHaveChooseCourse(url, cb) {
        _ajaxUrl = url;
        //_ajaxJsonData = ajaxData;
        // _contentType = "multipart/form-data";
        _cb = cb;
        ForHaveChooseCourse('get');
    }

    /**
     * 请求ajax
     * @param type 请求类型
     */
    function ForHaveChooseCourse(type) {
        $.ajax({
            url: _ajaxUrl,
            //data: _ajaxJsonData,
            contentType: _contentType,
           // type: type,
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
                    top.location.href = _loginUrl;
                    return;
                }
                //响应头部处理
                var token = xhr.getResponseHeader("AuthorizationToken");
                if (token != null && typeof (token) != "undefined") {
                    console.log("响应头部token为:" + token);
                    window.localStorage.setItem("AuthorizationToken", token);
                }

                //9999表示成功
                if (result.code === 9999) {
                  var  courseId = result.data.courseId;
                    var courseName= result.data.courseName ;
                    var courseCredit = result.data.courseCredit;
                    $('#tbody').html(_cb(_list));


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
    /**
     * post ajax请求
     * @param url 请求url
     * @param ajaxData 请求数据(非json格式字符串，使用对象格式)
     * @param cb 回调函数
     */
    function sendPostAjax(url, ajaxData, cb) {
        _ajaxUrl = url;
        _ajaxJsonData = typeof (ajaxData) == "undefined" ? _ajaxJsonData : JSON.stringify(ajaxData);
        _cb = cb;
        _contentType = "application/json;charset=utf-8";
        sendAjax('post');
    }

    /**
     * 请求ajax
     * @param type 请求类型
     */
    function sendAjax(type) {
        $.ajax({
            url: _ajaxUrl,
            data: _ajaxJsonData,
            contentType: _contentType,
            type: type,
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
                    top.location.href = _loginUrl;
                    return;
                }
                //响应头部处理
                var token = xhr.getResponseHeader("AuthorizationToken");
                if (token != null && typeof (token) != "undefined") {
                    console.log("响应头部token为:" + token);
                    window.localStorage.setItem("AuthorizationToken", token);
                }

                //9999表示成功
                if (result.code === 9999) {
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

    //获取url上的参数
    function getParameter(name) {
        const reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        const r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
     //权限按钮控制
    function getPerms() {
        //后台返回
        var permissionArrs = window.localStorage.getItem("permissions");
        var permissionArr =jQuery.parseJSON(permissionArrs);
        var useButton = $(".use-button");
        for (var i = 0; i < useButton.length; i++)  {
            var permission = useButton.eq(i).attr("permission");
            if ($.inArray(permission, permissionArr) == '-1') {
                //隐藏
                useButton.eq(i).hide();
            } else {

            }
        }

    }
    //处理值
    function checkNull(value) {
        if (typeof (value) == "undefined" || value == null) {
            return '';
        }
        return value;
    }

    //获取选中的ids
    function getTableCheckedIds() {
        const ids = $("input[class='table_id']:checked");
        const idArr = [];
        for (let i = 0; i < ids.length; i++) {
            idArr[i] = ids.eq(i).val();
        }
        return idArr;
    }

    //关闭并且刷新父页面
    function closeAndReload() {
        const index = parent.layer.getFrameIndex(window.name);
        parent.location.reload();
        parent.layer.close(index);
    }

    //用户编辑回调函数
    function editCallBack() {
        layer.msg('操作成功', {icon: '-1', time: 1000});
        setTimeout(closeAndReload, 1000);
    }

    function getToken() {
        return _token;
    }

    function getMenu() {
        return JSON.parse(_menu);
    }

    function getPermissions(){
        return JSON.parse(_permissions);
    }

    window.sendGetFormDateAjax = sendGetFormDateAjax;
    window.sendGetFormDateAjaxForHaveChooseCourse =sendGetFormDateAjaxForHaveChooseCourse;
    window.sendPostAjax = sendPostAjax;
    window.baseUrl = _baseUrl;
    window.indexUrl = _indexUrl;
    window.loginUrl = _loginUrl;
    window.getPermission = getPermissions;
    window.getParameter = getParameter;
    window.checkNull = checkNull;
    window.getTableCheckedIds = getTableCheckedIds;
    window.editCallBack = editCallBack;
    window.getToken = getToken;
    window.getMenu = getMenu;
    window.studentIndexUrl =_studentIndexUrl;
    window.getPerms = getPerms;
}(jQuery));