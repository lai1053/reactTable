import React from "react"
import ReactDOM from "react-dom"
import { Spin } from "antd"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
import md5 from "md5"
import { Carousel, Toast, Menu } from "edf-component"
import { Base64, path, string, environment } from "edf-utils"
import { consts } from "edf-consts"

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = async ({ component, injections }) => {
        this.component = component
        let props = this.component.props
        const spinMask = this.spin()
        //删除打点存储信息
        delete sessionStorage["jchlRecord"]
        if (
            this.component.props.appParams.areacode &&
            this.component.props.appParams.sourceType
        ) {
            sessionStorage["jchlRecord"] =
                this.component.props.appParams.sourceType +
                "_" +
                this.component.props.appParams.areacode
        }
        if (typeof gio == "function") {
            gio("track", "dev_test")
        }
        //通过用户中心，实现一键登录
        if (props != null && props.appParams != null) {
            if (
                props.appParams.sourceType &&
                (props.appParams.sourceType == "zsbj" ||
                    props.appParams.sourceType == "bsgzt")
            ) {
                sessionStorage["thirdPartysourceType"] =
                    props.appParams.sourceType
                if (props.appParams.sourceType == "bsgzt") {
                    sessionStorage.removeItem("appInfo")
                }
            } else {
                sessionStorage.removeItem("thirdPartysourceType")
            }
            let appkey = props.appParams.appkey
            //添加对接青岛代账
            if (!!appkey && appkey == 10001007) {
                const code = props.appParams.code
                let ret = await this.webapi.connector.accessLogin({
                    code,
                    appkey,
                    orgId: props.appParams.orgId,
                    orgname: props.appParams.orgname,
                    enabledYear: props.appParams.enabledYear,
                    enabledMonth: props.appParams.enabledMonth,
                    isReturnValue: true
                })
                if (ret.result) {
                    //设置皮肤、logo、appid
                    let skin =
                        (ret.value.skin && ret.value.skin.toUpperCase()) ||
                        "#1EB5AD"
                    localStorage["skin"] = skin
                    localStorage["logo"] = ret.value.appSource.appLogo
                    sessionStorage["appId"] = ret.value.appId
                    //青岛代账客户对接
                    sessionStorage["dzSource"] = 1
                    sessionStorage["dzType"] = 2
                    sessionStorage["currentOrgStatus"] = undefined
                    props.onRedirect(this.config.goAfterLogin)
                } else {
                    if (
                        ret.error &&
                        sessionStorage["_accessToken"] &&
                        ret.error.message.includes("CODE") &&
                        ret.error.message.includes("已失效")
                    ) {
                        if (props.onRedirect && this.config.goAfterLogin) {
                            props.onRedirect(this.config.goAfterLogin)
                        }
                    } else {
                        Toast.error(ret.error.message)
                    }
                }
                return false
            } else if (appkey != null) {
                let code = props.appParams.code,
                    joinsource = props.appParams.joinsource
                // 金财助手等兼容
                sessionStorage["isLogin"] = true
                if (joinsource == "newjcgj") {
                    sessionStorage["_accessToken"] = code
                    sessionStorage["joinsource"] = "newjcgj"
                    sessionStorage["appInfo"] = JSON.stringify({
                        name: decodeURIComponent(props.appParams.title),
                        appName: props.appParams.page
                    })
                    props.onRedirect(this.config.goAfterLogin)
                } else {
                    if (code != null) {
                        props.appParams.isReturnValue = true
                        spinMask.show()
                        const response = await this.webapi.connector.accessLogin(
                            props.appParams
                        )
                        spinMask.hide()
                        if (response.result) {
                            sessionStorage["mobile"] = response.value.mobile
                            sessionStorage["username"] = response.value.nickname
                            sessionStorage["currentOrgStatus"] =
                                response.value.currentOrgStatus
                            sessionStorage["_accessToken"] = response.token
                            sessionStorage["ompArgs"] = JSON.stringify(
                                response.value.appSource
                            )
                            //跳转创建企业的时候判断是否要带出企业名称
                            if (
                                response.value.sysOrg &&
                                response.value.sysOrg.name
                            ) {
                                localStorage["thirdPartyOrgName"] =
                                    response.value.sysOrg.name
                            } else {
                                localStorage.removeItem("thirdPartyOrgName")
                            }
                            //登录时切换皮肤
                            let skin =
                                (response.value.skin &&
                                    response.value.skin.toUpperCase()) ||
                                "#1EB5AD"
                            localStorage["skin"] = skin
                            //办税工作台特殊处理
                            if (props.appParams.sourceType == "bsgzt") {
                                localStorage["skin"] = "#0066B3"
                                //对接申报缴款
                                if (
                                    props.appParams.page ==
                                    "ttk-taxapply-app-taxlist"
                                ) {
                                    sessionStorage["appInfo"] = JSON.stringify({
                                        name: "申报缴款",
                                        appName: "ttk-taxapply-app-taxlist"
                                    })
                                } else if (
                                    props.appParams.page ==
                                    "ttk-scm-app-sa-invoice-list"
                                ) {
                                    sessionStorage["appInfo"] = JSON.stringify({
                                        name: "销项发票",
                                        appName: "ttk-scm-app-sa-invoice-list"
                                    })
                                }
                            }
                            //新代账特殊处理 打开云上电局申报缴款
                            if (appkey == 10014001 && !!props.appParams.page) {
                                sessionStorage["joinsource"] = "xdz"
                                sessionStorage["appInfo"] = JSON.stringify({
                                    page: props.appParams.page
                                })
                            }
                            if (props.appParams && props.appParams.appkey) {
                                localStorage["ompKey"] = JSON.stringify({
                                    appkey: props.appParams.appkey
                                })
                            }
                            //着陆页点击购买按钮，直接跳转企业列表修改
                            if (
                                this.component.props.appParams &&
                                this.component.props.appParams.source ==
                                    "landingPage"
                            ) {
                                if (response.value.currentOrgStatus != 2) {
                                    sessionStorage["currentOrgStatus"] = 1
                                }
                            }
                            if (props.onRedirect && this.config.goAfterLogin) {
                                //用户一键登录打点
                                if (typeof gio == "function") {
                                    if (
                                        this.component.props.appParams
                                            .areacode &&
                                        this.component.props.appParams
                                            .sourceType
                                    ) {
                                        gio(
                                            "track",
                                            "showPageEnterPortal_" +
                                                this.component.props.appParams
                                                    .sourceType +
                                                "_" +
                                                this.component.props.appParams
                                                    .areacode
                                        )
                                    } else {
                                        gio("track", "showPageEnterPortal_jcgj")
                                    }
                                }
                                props.onRedirect(this.config.goAfterLogin)
                            }
                        } else {
                            if (
                                response.error &&
                                sessionStorage["_accessToken"] &&
                                response.error.message.includes(
                                    "CODE已失效,请重新生成"
                                )
                            ) {
                                if (
                                    props.onRedirect &&
                                    this.config.goAfterLogin
                                ) {
                                    props.onRedirect(this.config.goAfterLogin)
                                }
                            } else {
                                Toast.error(response.error.message)
                                // window.location.href = window.location.protocol + '//' + window.location.host
                            }
                        }
                        return false
                    }
                }
            }
        }
        let info = { mobile: "", password: "", remember: false }
        let currentTimestamp = new Date().getTime()
        //从cookie中读取mobile
        function getCookie(c_name) {
            if (document.cookie.length > 0) {
                let c_start = document.cookie.indexOf(c_name + "=")
                if (c_start != -1) {
                    c_start = c_start + c_name.length + 1
                    let c_end = document.cookie.indexOf(";", c_start)
                    if (c_end == -1) c_end = document.cookie.length
                    return unescape(document.cookie.substring(c_start, c_end))
                }
            }
            return ""
        }
        info.mobile = getCookie("THE_LAST_LOGIN")
        if (props.appParams && props.appParams.mobile) {
            info.mobile = props.appParams.mobile
        } else {
            if (currentTimestamp < localStorage.remember) {
                info.remember = true
                if (info.mobile == localStorage["mobile"]) {
                    info.password = localStorage["password"]
                    info.clearText = localStorage["clearText"]
                }
            } else {
                localStorage.removeItem("mobile")
                localStorage.removeItem("password")
                localStorage.removeItem("clearText")
            }
        }

        this.injections = injections

        info.version = path.getVersion()

        injections.reduce("init", info)

        this.getCarouselBg()
        //绑定回车事件
        this.bindEnter()
        const borwserVersion = environment.getBrowserVersion()
        if (borwserVersion.ie && borwserVersion.version <= 10) {
            //this.dZoom()
        }
    }

    spin = () => {
        const div = document.createElement("div")
        div.setAttribute("class", "edfx-app-login-loading")
        return {
            show() {
                document.body.appendChild(div)
                ReactDOM.render(
                    <Spin size="large" tip={"正在处理中..."} />,
                    div
                )
            },
            hide() {
                ReactDOM.unmountComponentAtNode(div)
                try {
                    document.body.removeChild(div)
                } catch (e) {}
            }
        }
    }

    dZoom = () => {
        let dzoom = document.querySelector("#dzoom")
        if (!dzoom) {
            var l = document.createElement("script")
            l.src = "./vendor/dzoom.js"
            l.id = "dzoom"
            document.body.appendChild(l)
        }
    }

    goLanding = async () => {
        //跳转着陆页
        if (
            location.href.indexOf(consts.DOMAIN_DEV_INNER) != -1 ||
            location.href.indexOf(consts.DOMAIN_DEV_OUTER) != -1 ||
            location.href.indexOf(consts.DOMAIN_LOCALHOST) != -1 ||
            location.href.indexOf(consts.DOMAIN_LOCALHOST_IP) != -1 ||
            location.href.indexOf(consts.DOMAIN_DEBUG_INNER) != -1 ||
            location.href.indexOf(consts.DOMAIN_DEBUG_OUTER) != -1
        ) {
            window.location.href = consts.DOMAIN_GJ_DEV
        } else if (location.href.indexOf(consts.DOMAIN_DEMO) != -1) {
            window.location.href = consts.DOMAIN_GJ_DEMO
        } else if (location.href.indexOf(consts.DOMAIN_ONLINE) != -1) {
            window.location.href = consts.DOMAIN_GJ_ONLINE
        }
    }

    getCarouselBg = async () => {
        if (appBasicInfo.appId == 119) {
            let slogens = [{}, {}]

            slogens[0].url = "./vendor/img/login/ykj-login-1.png"
            slogens[0].title = ""
            slogens[0].slogen1 = "票据电子化上传，随时随地记账，"
            slogens[0].slogen2 = "智能生成财务报表"
            slogens[0].color = "#0066B3"
            slogens[0].bgColor = "#F6FBFF"

            slogens[1].url = "./vendor/img/login/ykj-login-2.png"
            slogens[1].title = ""
            slogens[1].slogen1 = "自动核算，财务工作更轻松"
            slogens[1].slogen2 = "报表可视化，经营分析更简单"
            slogens[1].color = "#F27215"
            slogens[1].bgColor = "#FFFBF8"

            this.injections.reduce("load", slogens)
        } else {
            let slogens = [{}, {}, {}]
            slogens[0].url = "./vendor/img/login/login-bg-1.png"
            slogens[0].title = "操作自动化"
            slogens[0].slogen1 = "发票采集自动化，全税种批量申报，一键报税"
            // slogens[0].slogen2 = '银行对账单导入，智能匹配业务类型'
            slogens[0].color = "#0066B3"
            slogens[0].bgColor = "#F6FBFF"

            slogens[1].url = "./vendor/img/login/login-bg-2.png"
            slogens[1].title = "平台智能化"
            slogens[1].slogen1 = "智能凭证引擎，自动生成财务凭证和财务报表"
            // slogens[1].slogen2 = '全税种批量申报，一键报税'
            slogens[1].color = "#1EB5AD"
            slogens[1].bgColor = "#F7FFFE"

            slogens[2].url = "./vendor/img/login/login-bg-3.png"
            slogens[2].title = "业财税一体化"
            slogens[2].slogen1 = "业务管控、财务记账、税务申报一体化管理平台"
            slogens[2].slogen2 = ""
            slogens[2].color = "#F27215"
            slogens[2].bgColor = "#FFFBF8"

            this.injections.reduce("load", slogens)
        }
    }

    bindEnter = () => {
        let that = this
        document.onkeydown = function(e) {
            let keyCode = e.keyCode
            if (keyCode !== 13) return
            let form = that.metaAction.gf("data.form").toJS()
            that.fieldChange("data.form.mobile", form.mobile)
            that.fieldChange("data.form.password", form.password)

            that.login()
        }
    }

    login = async () => {
        //this.metaAction.toast('error','不建议手机端登录，请前往PC端','close')
        let form = this.metaAction.gf("data.form").toJS()
        let other = this.metaAction.gf("data.other").toJS()
        //登录前校验
        const basicInfo = await this.check(
            [
                {
                    path: "data.form.mobile",
                    value: form.mobile
                },
                {
                    path: "data.form.password",
                    value: form.password
                }
            ],
            "login"
        )
        if (!basicInfo) return

        let props = this.component.props
        if (props != null && props.appParams != null) {
            let appkey = props.appParams.appkey
            if (appkey != null) {
                form.appKey = appkey
            }
        }
        if (other.userInput) {
            if (form.password) {
                form.clearText = Base64.encode(form.password)
                form.password = md5(form.password + "*the3Kingdom*")
            }
        }

        // if (form) {
        //     form.requestUrl = location.hostname
        //     if (/^127.|^192.|^10./.test(location.hostname)) {
        form.requestUrl = "localhost"
        //     }
        // }

        const response = await this.webapi.user.login(
            Object.assign({ isReturnValue: true }, form)
        )
        //登录新代账管理端存储管理端token
        if (response.result && response.value.token) {
            if (
                response.value.token.appId == 114 &&
                response.value.token.orgType == 1
            ) {
                sessionStorage["_accessGlToken"] = response.token
            }
        }
        if (!response.result) {
            let errorCode = [
                "50107",
                "50111",
                "50112",
                "50109",
                "50133",
                "50136",
                "50110",
                "50143"
            ]
            if (errorCode.indexOf(response.error.code) > -1) {
                this.metaAction.sf(
                    "data.other.error.password",
                    response.error.message
                )
                this.metaAction.toast("error", response.error.message)
            } else {
                this.metaAction.sf(
                    "data.other.error.password",
                    "密码不正确,请重新输入!"
                )
                this.metaAction.toast("error", "密码不正确,请重新输入!")
            }
            return
        }

        // electron 最大化指令
        window.parent.postMessage({ windowMax: true }, "*")

        //cookie中存储上次登录的用户名
        function setCookie(c_name, value, expiredays) {
            var exdate = new Date()
            exdate.setDate(exdate.getDate() + expiredays)
            document.cookie =
                c_name +
                "=" +
                escape(value) +
                (expiredays == null ? "" : ";expires=" + exdate.toGMTString())
        }
        setCookie("THE_LAST_LOGIN", form.mobile, 7)

        this.metaAction.context.set("user", response.value)
        //判断是否保存登录信息
        if (form.remember) {
            let time = new Date().getTime() + 7 * 24 * 60 * 60 * 1000
            localStorage.remember = time
            localStorage["mobile"] = form.mobile
            localStorage["password"] = form.password
            localStorage["clearText"] = form.clearText
        } else {
            localStorage.removeItem("mobile")
            localStorage.removeItem("password")
            localStorage.removeItem("clearText")
        }
        sessionStorage["mobile"] = form.mobile
        sessionStorage["username"] = response.value.nickname
        sessionStorage["_accessToken"] = response.token
        sessionStorage["password"] = form.password
        sessionStorage["currentOrgStatus"] = response.value.currentOrgStatus
        sessionStorage["appId"] = response.value.appId
        //正常代账用户登录
        if (response.value.appId == 107) {
            sessionStorage["dzSource"] = 2
        }
        document.onkeydown = null
        //登录时切换皮肤
        let skin =
            (response.value.skin && response.value.skin.toUpperCase()) ||
            "#0066B3"
        localStorage["skin"] = skin
        //logo
        localStorage["logo"] = response.value.appSource.appLogo
        //判断着陆页登录还是正常登录
        if (environment.isClientMode()) {
            let loginparam = {
                appid: "JCGJWEB",
                appName: "LoginSuccess",
                appParam: {
                    userinfo: {
                        loginid: sessionStorage["mobile"], //登录账号
                        username: sessionStorage["username"], //用户名
                        sjh: sessionStorage["mobile"] //手机
                    }
                }
            }
            loginparam = JSON.stringify(loginparam)
            if (_omni && _omni.container) {
                _omni.container.sendmessagetocontainer(loginparam)
            }
        }
        if (
            this.component.props &&
            this.component.props.appParams &&
            this.component.props.appParams.source == "landingPage"
        ) {
            //原本是接产品登录做跳转现在接公司登录；现在改为判断购买时企业状态
            // let key = Object.keys(response.value),landingPage = ''
            // for(let i =0; i < key.length; i++){
            //    if(key[i] != 'token'){
            //     landingPage = landingPage + key[i] + '=' + response.value[key[i]]+'&'
            //    }else {
            //     let tokenKey = Object.keys(response.value.token)
            //     for(let q =0; q < tokenKey.length; q++){
            //      landingPage = landingPage + tokenKey[q] + '=' + response.value.token[tokenKey[q]]+'&'
            //     }
            //    }
            // }
            // window.name = `_accessToken=${response.token}&${landingPage.slice(0,landingPage.length-1)}`
            // window.location.href=`https://gj.jchl.com`
            if (response.value.currentOrgStatus != 2) {
                sessionStorage["currentOrgStatus"] = 1
            }
        } else {
            if (this.component.props.onRedirect && this.config.goAfterLogin) {
                //用户正常登录打点
                if (
                    typeof gio == "function" &&
                    !response.value.currentOrgStatus
                ) {
                    if (
                        this.component.props.appParams.areacode &&
                        this.component.props.appParams.sourceType
                    ) {
                        gio(
                            "track",
                            "userLoginEnterPortal_" +
                                this.component.props.appParams.sourceType +
                                "_" +
                                this.component.props.appParams.areacode
                        )
                    } else {
                        gio("track", "userLoginEnterPortal_jcgj")
                    }
                }
                if (response.value.appId === 114) {
                    this.component.props.onRedirect(this.config.goGlPortal)
                } else {
                    sessionStorage["isLogin"] = true
                    this.component.props.onRedirect(this.config.goAfterLogin)
                }
            }
        }
    }

    goRegisterA = () => {
        this.goRegister()
        //埋点
        _hmt &&
            _hmt.push(["_trackEvent", "系统管理", "企业登录", "右上角立即注册"])
    }

    goRegisterB = () => {
        this.goRegister()
        //埋点
        _hmt &&
            _hmt.push(["_trackEvent", "系统管理", "企业登录", "右下角立即注册"])
    }

    goRegister = () => {
        document.onkeydown = null

        if (this.component.props.onRedirect && this.config.goRegister) {
            if (appBasicInfo.appId == 114) {
                this.component.props.onRedirect(this.config.goDzglRegister)
            } else {
                this.component.props.onRedirect(this.config.goRegister)
            }
        }
    }

    closeTips = () => {
        this.metaAction.sf("data.other.checkTips", false)
    }

    goForgot = () => {
        if (this.component.props.onRedirect && this.config.goForgot) {
            this.component.props.onRedirect(this.config.goForgot)
            //埋点
            _hmt &&
                _hmt.push(["_trackEvent", "系统管理", "企业登录", "忘记密码"])
        }
    }

    fieldChange = async (fieldPath, value, operate) => {
        value = fieldPath.indexOf("mobile") > -1 ? string.trim(value) : value
        this.metaAction.sf(fieldPath, value)
        await this.check([{ path: fieldPath, value }], operate)
    }

    check = async (fieldPathAndValues, operate) => {
        if (!fieldPathAndValues) return

        var checkResults = []

        for (var o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == "data.form.mobile") {
                Object.assign(r, await this.checkMobile(o.value, operate))
            } else if (o.path == "data.form.password") {
                Object.assign(r, await this.checkPassword(o.value))
            }
            checkResults.push(r)
        }

        var json = {}
        var hasError = true
        checkResults.forEach(o => {
            // json[o.path] = o.value
            json[o.errorPath] = o.message
            if (o.message) hasError = false
        })

        this.metaAction.sfs(json)

        return hasError
    }

    checkMobile = async (mobile, operate) => {
        var message
        mobile = string.trim(mobile)
        if (operate && operate == "login") {
            if (!mobile) message = "请输入手机号"
            else if (mobile.length != 11) message = "请输入正确的手机号"
            else {
                let flag = await this.webapi.user.existsMobile(mobile)
                if (!flag) message = "该手机号未注册，请重新输入"
            }
        } else {
            if (!mobile) message = "请输入手机号"
            else if (mobile.length == 1 && !(mobile == "1"))
                message = "请输入正确的手机号"
            else if (
                mobile.length > 1 &&
                mobile.length < 11 &&
                !/^1[3|4|5|6|7|8|9]/.test(mobile)
            )
                message = "请输入正确的手机号"
            else if (mobile.length > 11) {
                message = "请输入正确的手机号"
            } else if (mobile.length == 11) {
                if (!/^1[3|4|5|6|7|8|9]/.test(mobile)) {
                    message = "请输入正确的手机号"
                    return { errorPath: "data.other.error.mobile", message }
                }
                let flag = await this.webapi.user.existsMobile(mobile)

                !flag && (message = "该手机号未注册，请重新输入")
            }
        }
        return { errorPath: "data.other.error.mobile", message }
    }

    imgChange = async () => {}
    checkPassword = async password => {
        var message

        if (!password) message = "请输入密码"

        return { errorPath: "data.other.error.password", message }
    }
    //检查是否要置灰登录
    checkLogin = () => {
        let data = this.metaAction.gf("data").toJS()
        return !(
            data.form.mobile &&
            !data.other.error.mobile &&
            data.form.password &&
            !data.other.error.password
        )
    }

    renderCal = () => {
        if (!this.metaAction.gf("data.other.slogens")) return
        const arr = this.metaAction.gf("data.other.slogens").toJS()
        const data = this.metaAction.gf("data").toJS()
        return (
            <Carousel
                autoplay={true}
                initialSlide={data.other.selectedImgIndex}
                afterChange={this.imgChange}
            >
                {arr.map(item => {
                    return (
                        <div>
                            <div
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: item.bgColor
                                }}
                            ></div>
                            <div className="container">
                                <div
                                    className={
                                        appBasicInfo.appId == 119
                                            ? "edfx-app-login-content-ad2"
                                            : "edfx-app-login-content-ad"
                                    }
                                    style={{
                                        backgroundImage: `url(${item.url})`,
                                        backgroundPosition: "left bottom",
                                        backgroundRepeat: "no-repeat",
                                        backgroundSize: "409px 263px"
                                    }}
                                >
                                    <p style={{ color: item.color }}>
                                        {item.title}
                                    </p>
                                    <p style={{ color: item.color }}>
                                        {item.slogen1}
                                    </p>
                                    <p style={{ color: item.color }}>
                                        {item.slogen2}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </Carousel>
        )
    }

    onExit = () => {}

    // loadClient = () => {
    //     this.loadUrl(navigator.platform)
    // }

    // loadClientMore = (e) => {
    //     this.loadUrl(e.key)
    // }

    // loadText = () => {
    //     let platformText

    //     if(navigator.platform === "Windows" || navigator.platform === "Win32") {
    //         if(this.judgeWin64()) {
    //             platformText = 'Windows'
    //         } else {
    //             platformText = 'Windows32位'
    //         }
    //     } else if(navigator.platform === 'MacIntel') {
    //         platformText = 'Mac'
    //     } else {
    //         platformText = 'Linux'
    //     }

    //     return `${platformText}版下载`
    // }

    // getClientChildren = () => {
    //     let pfo = this.getoptsys()

    //     return (
    //         <Menu.ItemGroup>
    //             {pfo.map(o => {
    //                 return(<Menu.Item name={o.key} key={o.key} className="app-asset-list-depreciation">{o.children}</Menu.Item>)
    //             })}
    //         </Menu.ItemGroup>
    //     )
    // }

    // getoptsys = () => {
    //     let pf = navigator.platform
    //     let pfo = [{
    //         key: 'Windows',
    //         children: 'Windows版下载'
    //     }, {
    //         key: 'Win32',
    //         children: 'Windows32位版下载'
    //     }/*, {
    //         key: 'MacIntel',
    //         children: 'Mac版下载'
    //     }*//*, {
    //         key: 'Linux',
    //         children: 'Linux版下载'
    //     }*/]

    //     if(navigator.platform === "Windows" || navigator.platform === 'Win32') {
    //         if(this.judgeWin64()) {
    //             pfo.splice(0, 1)
    //         } else {
    //             pfo.splice(1, 1)
    //         }
    //     } /*else if(navigator.platform === "MacIntel") {
    //         pfo.splice(2, 1)
    //     }*/ /*else {
    //         pfo.splice(3, 1)
    //     }*/

    //     return pfo
    // }

    // loadCondition = () => {
    //     if(navigator.platform == "Windows" || navigator.platform == "Win32"/* || navigator.platform == "MacIntel"*/) {
    //         return true
    //     }

    //     return false
    // }

    // loadUrl = (type) => {
    //     let iframe = document.createElement('iframe')
    //     iframe.id = 'jcgjClient'
    //     iframe.frameborder = "0"
    //     iframe.style.width = "0px"
    //     iframe.style.height = "0px"

    //     if(type == "MacIntel") {
    //         iframe.src = 'https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/%E9%87%91%E8%B4%A2%E7%AE%A1%E5%AE%B6.dmg'
    //     } else if(type == 'Windows' || type == 'Win32') {
    //         if(this.judgeWin64()) {
    //             iframe.src = 'https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/Setup_%E9%87%91%E8%B4%A2%E7%AE%A1%E5%AE%B6.exe'
    //         } else {
    //             iframe.src = 'https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/Setup_%E9%87%91%E8%B4%A2%E7%AE%A1%E5%AE%B632.exe'
    //         }
    //     }

    //     document.body.appendChild(iframe)
    // }

    // judgeWin64 = () => {
    //     let agent = navigator.userAgent.toLowerCase()

    //     if (agent.indexOf("win64") >= 0 || agent.indexOf("wow64") >= 0) {
    //         return true
    //     }
    // }

    gotoLoad = () => {
        window.open("../../../vendor/platform/loadClient.html?ts=1585122415461")
    }

    gjClientV = () => {
        let urlarr = [
            "dev.bj.jchl.com:8089",
            "test.bj.jchl.com:8089",
            "erpdemo.jchl.com",
            "erp.jchl.com",
            "localhost:8081"
        ]
        return urlarr.includes(location.host)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
