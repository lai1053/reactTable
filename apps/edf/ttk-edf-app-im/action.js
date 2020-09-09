import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { environment } from 'edf-utils'


class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current

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
        if (typeof $ == 'undefined') {
            return setTimeout(() => {
                this.onLoad(component, injections)
            }, 16)
        }
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
                $('#starConversation').addClass('ttk-edf-app-im-chat')
                $('#starConversation').click(function () {
                    onclickZxkf()
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
        function onclickZxkf() {
            openIndex = openIndex + 1;

            if (openIndex > 1) {
                layer.msg("只能发起一个会话");
                openIndex--;
            } else {
                console.log(environment.isDevMode())

                //聊天界面url——测试环境地址
                // let url = 'https://ecm.jchl.com:8443/Web/Im/GZ/Index.html?groupNo=' + groupNo + '&eno=' + eno + '&thirdPartySession=' + thirdPartySession;
                //生产环境地址
                let url = 'https://iccsweb.jchl.com:8443/custom/web/GZ/Index.html?groupNo=' + 10011093 + '&eno=' + eno + '&thirdPartySession=' + thirdPartySession;
                layer.open({
                    type: 2,
                    title: ' ',
                    shadeClose: true,
                    shade: false,
                    maxmin: false, //开启最大化最小化按钮
                    area: ['600px', '556px'],
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

