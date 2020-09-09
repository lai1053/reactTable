import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { environment } from 'edf-utils'


class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
	    console.log('加载yygl客服')
        this.loadLayer()
    }

    loadLayer = () => {
        let layerNode = document.querySelector('#layer')
        if (!!layerNode) return
        let jqNode = document.querySelector('#jqscript')
        if (!!jqNode && typeof $ != 'undefined') {
            var l = document.createElement("script")
            l.src = "./vendor/layer.js"
            l.id = 'layer'
            document.body.appendChild(l)
        } else {
            setTimeout(() => {
                this.loadLayer()
            }, 300)
        }
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')

        this.onLoad(component, injections)
    }


    onLoad = (component, injections) => {
        var _this = this;
        if (typeof $ == 'undefined') {
            return setTimeout(() => {
                this.onLoad(component, injections)
            }, 16)
        }
        const currentUser = this.metaAction.context.get('currentUser')
        //客服组编号（由在线客服提供）
        let groupNo = component.props.groupNo || "10341037";
        //易号码，如果是匿名则使用anyone，如果是实名则改成自己实名的易号码
        let eno = component.props.eno || "anyone";
        let thirdPartySession = component.props.thirdPartySession || "123";
        //控制只能打开一个在线客服的咨询窗口
        let openIndex = 0;
        //关闭页面索引
        let closeIndex;
        //页面初始化函数
        $(function () {
            if (window.addEventListener) {
                $('#starConversation').addClass('ttk-es-app-im-chat')
                $('#starConversation').click(function () {
                    onclickZxkf(groupNo)
                })
                window.addEventListener('message', function (e) {
                    let user = e.data;
                    let openUrl = user.url;
                    switch (user.method) {
                        case "closeLayer":
                            layer.closeAll();
                            break;
                        case "closeAllLayer":
                            layer.closeAll();
                            break;
                        case "openNav":
                            layer.closeAll();
                            onclickZxkf();
                            break;
                        case "layerMessageAction":
                            layerMessageAction(openUrl);
                            break;
                        case "closeLayerByIndex":
                            layer.close(closeIndex);
                            break;
                    }
                }, false);
            } else if (window.attachEvent) {
                window.attachEvent("onmessage", function (e) {
                    let user = JSON.parse(e.data);
                });
            }
        })

        //在线客服弹窗方法
        function onclickZxkf(groupNo) {
            openIndex = openIndex + 1;

            if (openIndex > 1) {
                layer.msg("只能发起一个会话");
                openIndex--;
            } else {
                console.log(environment.isDevMode())
                //区分新代账和管家
                let orgInfo = _this.metaAction.context.get("currentOrg"),
                    appVersion = appBasicInfo.appId || _this.metaAction.context.get("currentOrg").appId ,
                    url;
                if(114 == appVersion){
                    url = orgInfo && orgInfo.cusServiceUrl ? orgInfo.cusServiceUrl : 'https://znkf.jchl.com/znkfResource/znkf/web/html/index.html?sId=012ffb8f535d46cea0336818baac2416'
                }else if(119 == appVersion){
                    if(window.location.host.includes('jchl.com')){
                        url = `https://znkf.jchl.com/znkfResource/znkf/ark/html/index.html?sId=3f2d3201f1ce47d486c50b877b67b474&newUser=N&thirdPartyUserId=${currentUser.ucUserId}&userPhoneNo=${currentUser.mobile}`
                    }else{
                        url = `https://tznkf.jchl.com/znkfResource/znkf/ark/html/index.html?sId=658cffe0ea4d40f28c10f9436b71e0d7&newUser=N&thirdPartyUserId=${currentUser.ucUserId}&userPhoneNo=${currentUser.mobile}`
                    }
                }else{
                    url = 'https://znkf.jchl.com/znkfResource/znkf/web/html/index.html?sId=a85c7810a78e4cd48d6cc2ae50a9b6b2'
                }
                //聊天界面url——测试环境地址
                // let url = 'https://ecm.jchl.com:8443/Web/Im/GZ/Index.html?groupNo=' + groupNo + '&eno=' + eno + '&thirdPartySession=' + thirdPartySession;
                //生产环境地址
                // let url = 'https://iccsweb.jchl.com:8443/custom/web/GZ/Index.html?groupNo=' + groupNo + '&eno=' + eno + '&thirdPartySession=' + thirdPartySession;
                // let url;/;;./////////////////////////////` = 'https://znkf.jchl.com/znkfResource/znkf/web/html/index.html?sId=a85c7810a78e4cd48d6cc2ae50a9b6b2'
                layer.open({
                    type: 2,
                    title: ' ',
                    shadeClose: true,
                    shade: false,
                    maxmin: false, //开启最大化最小化按钮
                    area: ['700px', '650px'],
                    offset: 'rb',
                    content: [url, 'no'],//传入要调用的url
                    end: function () {           //关闭弹出层触发
                        openIndex--;
                    }
                });
            }
        }

        //留言和查看留言回复弹窗方法
        function layerMessageAction(url) {
            let title = "";
            if (url.indexOf("msgManage.do") != -1) {
                title = "请您留言";
            } else if (url.indexOf("msgReply.do") != -1) {
                title = "查看留言回复";
            } else if (url.indexOf("eval.do") != -1) {
                title = "评价";
            }
            closeIndex = layer.open({
                type: 2,
                title: title,
                shadeClose: true,
                shade: false,
                maxmin: false, //开启最大化最小化按钮
                area: ['600px', '556px'],
                offset: 'r',
                move: false,
                content: [url] //传入要调用的url
            });
        }

    }

    render = () => {

    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

