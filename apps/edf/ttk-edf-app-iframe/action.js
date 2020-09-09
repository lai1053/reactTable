import React from 'react'
import {
    action as MetaAction
} from 'edf-meta-engine'
import config from './config'
import Container from './components/container'
import { fetch, environment, path } from 'edf-utils'
import isEqual from 'lodash.isequal'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = async ({component, injections}) => {
        this.component = component
        this.injections = injections

        let addEventListener = this.component.props.addEventListener
        if (addEventListener && this.component.props.openKey != 'taxOpenFirstTab') {
            addEventListener('onTabFocus', this.tabFocus)
        }

        this.onResize()

        if(this.component.props.dzgl === true && !(this.component.props.openKey && this.component.props.openKey == 'taxOpenFirstTab')) {
            const code = await this.webapi.getUcCode(params)
            const s = this.esDomain()
            const src = `http://${s}/dzapi.jsp?address=${this.component.props.address}&code=${code}`
            injections.reduce('init', {src, dzgl: this.component.props.dzgl})
            return
        }

        let code = null
        if (this.component.props.isValidate) {
            let linkCode = this.component.props.linkCode
            let params = {}
            switch (linkCode) {
                case 3020:
                    params.type = 'zj'
                    break
                case 3010:
                    params.type = 'px'
                    break
                case 3030:
                    params.type = 'zx'
                    break
            }
            code = await this.webapi.getCode(params)
        }
        let option = {}
        if (this.component.props.src) {
            if (code) {
                option.src = this.component.props.src + '?' + code
            } else {
                option.src = this.component.props.src
            }
        }
        // option.src = 'http://127.0.0.1:8020/demo/demo5/index.html?__hbt=1536638067101'

        let currentOrg = this.metaAction.context.get('currentOrg'), appId = currentOrg.appId
        console.log('涉税查询'+option.src)
        injections.reduce('init', option)

        //获取appVersion
        let appVersion = this.component.props.appVersion
        if (!!appVersion) {
            this.metaAction.sf('data.appVersion', this.component.props.appVersion)
        }

        let showBackBtn = this.component.props.showBackBtn
        if(!!showBackBtn && appVersion == 105) {
            this.metaAction.sfs({
                'data.other.backType': showBackBtn,
                'data.other.showBackBtn': true
            })
        }
        //this.changeFrameHeight()
        if(this.component.props.openKey && this.component.props.openKey == 'taxOpenFirstTab'){
            await this.webapi.init()
            const response = await this.webapi.portal()
            if(response) {
                this.metaAction.context.set('currentUser', response.user)
                this.metaAction.context.set('currentOrg', response.org)
                this.metaAction.sf('data.openKey', 'taxOpenFirstTab')
            }
        }
    }

    esDomain = () => {
        const domain = location.hostname
        let s = ''
        if(domain.indexOf('dev-xdz.aierp.cn') > -1 || domain.indexOf('debug-xdz.aierp.cn') > -1) {
            s = 'test-jcyy.aierp.cn:8089'
        }else if(domain.indexOf('xdz.aierp.cn') > -1) {
            s = 'demo-nes.aierp.cn:8089'
        }else if(domain.indexOf('nes-demo.jchl.com') > -1) {
            s = 'es-demo.jchl.com'
        }else if(domain.indexOf('nes.jchl.com') > -1) {
            s = 'es.jchl.com'
        }else {
            s = 'demo-nes.aierp.cn:8089'
        }
        return s
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
            window.removeEventListener('message', this.onMessage, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
            window.detachEvent('onmessage', this.onMessage)
        } else {
            window.onresize = undefined
            window.onmessage = undefined
        }
    }

    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
            window.addEventListener('message', this.onMessage, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
            window.attachEvent('onmessage', this.onMessage)
        } else {
            window.onresize = this.onResize
            window.onmessage = this.onmessage
        }
    }

    componentWillReceiveProps = async (nextProps) => {
        const openKey = this.metaAction.gf('data.openKey')
        if(!isEqual(nextProps.isRefresh,  this.component.props.isRefresh) && openKey != 'taxOpenFirstTab') {
            const code = await this.webapi.getUcCode(params)
            const s = this.esDomain()
            const src = `http://${s}/dzapi.jsp?address=${this.component.props.address}&code=${code}`
            this.metaAction.sfs({
                'data.src': src,
            })
        }
    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.changeFrameHeight()
            }
        }, 50)
    }

    onMessage = (e) => {
        let data

        console.log('e.data:' + e.data)
        console.log(typeof(e.data))
        if (typeof(e.data) == "string") {
            data = JSON.parse(e.data)
        } else {
            data = e.data
        }

        console.log(data)

        switch (data.method) {
            case 'openNewTab':
                let ts = new Date().getTime()
                console.log('onMessage:' + data.url)
                this.component.props.setPortalContent(data.name, 'ttk-edf-app-iframe?linkcode=' + ts, {
                    'src': data.url
                })
                break;
            case 'openNewApp':
                if( data.data && data.data.appProps) {
                    this.component.props.setPortalContent(data.data.name, data.data.appName, data.data.appProps)
                }else {
                    this.component.props.setPortalContent(data.data.name, data.data.appName)
                }
                break;
            case 'openPersonalIncomeTax':
                this.openPersonalIncomeTax(data)
                break;
            case 'closeCurrentTab':
                let name = window.reduxStore.getState().getIn(['edfx-app-portal', 'data', 'content', 'name'])
                this.component.props.tabEdit(name, 'remove')
                break;
            case 'messageFromOem':
                console.log('oem发来的消息。。。balabalabala')
                break
            default:
                console.log('onMessage not found')
                break
        }
    }
    openPersonalIncomeTax = async(data) => {
        let token = fetch.getAccessToken()
        let params = {}
        params.tokenForCode = token
        params.sblxdm = data.sblxdm
        params.skssqq = data.skssqq
        let response = await this.webapi.individualQueryUrl(params)

        response = path.getResponse(response, data.declareState, data.reportId)
        console.log('个税URL地址:' + response)
        let linkCode = 'personalIncomeTax'

        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('个人所得税(代扣代缴)', 'ttk-edf-app-iframe?linkcode=' + linkCode, { 'src': response })
    }

    tabFocus = async (params) => {
        let props = params.toJS()
        if(props && props.dzgl === true) {
            const code = await this.webapi.getUcCode(params)
            const s = this.esDomain()
            const src = `http://${s}/dzapi.jsp?address=${this.component.props.address}&code=${code}`
            console.log(src)
            this.metaAction.sfs({
                'data.src': src,
                'data.random': Math.random()
            })
            return
        }
        if (props) {
            let url = ''
            if (props.src.indexOf('?') > -1) {
                url = props.src + '&isReEnter=true'

                // 更新皮肤参数 haozhao 2018-10-17 start
                let skin = localStorage.getItem('skin').replace('#', '')

                let skinBefore = url.split('&skin=')[0],
                    skinEnd = url.split('&skin=')[1]

                if (skinEnd) {
                    skinEnd = skin + skinEnd.substr(6, skinEnd.length - 6)
                }

                let newUrl

                if (skinEnd) {
                    newUrl = skinBefore + '&skin=' + skinEnd
                } else {
                    newUrl = skinBefore
                }
                // 更新皮肤参数 haozhao 2018-10-17 end
                this.metaAction.sfs({
                    'data.src': newUrl,
                    'data.random': Math.random()
                })
            } else {
                url = props.src + '?isReEnter=true'
                this.metaAction.sf('data.src', url)
            }

            window.setTimeout(function () {

            }, 10)
            //console.log('url:' + url)
        }
    }
    changeFrameHeight = () => {
        var ifm = document.getElementById("ttkIframe")
        if (ifm) {
            //ifm.height = parseInt(document.documentElement.clientHeight) + 100
            //ifm.setAttribute('isReload', true)
            window.setTimeout(function () {
                ifm.setAttribute('name', 'ttkIframe')
            }, 0)

        }
    }

    renderLoading = (url) => {
        if (url == undefined || url == null || url == '') {
            return <Spin delay={1} tip="加载中..." />
        }
    }

    backBtnClick = () => {
        const code = this.metaAction.gf('data.other.backType')
        if(code == 1) {
            this.component.props.setPortalContent('申报缴款', 'ttk-taxapply-app-taxlist', { })
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({
            ...option,
            metaAction
        }),
        ret = {
            ...metaAction,
            ...o
        }

    metaAction.config({
        metaHandlers: ret
    })

    return ret
}
