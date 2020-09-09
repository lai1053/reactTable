import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import extend from './extend'
import config from './config'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    
    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        injections.reduce('init')
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        const params = this.component.props.urlData
        this.load(params)
    }
    
    load = async (params)=>{
        this.injections.reduce('load', params)
        if (params.key == 'startCheck') {
            setTimeout(() => {
                //获取iframe元素
                const ifr = document.getElementById('ControlIframe'),
                    { url, encryptedData } = params
                let doc = ifr.contentDocument || ifr.contentWindow.document
                this.openPostWindow(url, encryptedData, doc)
            }, 500)
        }
    }
    onTabFocus = async () => {
        const params = this.component.props.urlData
        this.load(params)
    }
    
    /**
     * 开始体检发送post请求
     */
    openPostWindow = (url, data, doc) => {
        //创建form表单
        let temp_form = doc.createElement("form")
        temp_form.action = url
        //如需打开新窗口，form的target属性要设置为'_blank'
        temp_form.target = "_self"
        temp_form.method = "post"
        temp_form.style.display = "none"
        // temp_form.proto = 'https'
        //添加参数
        let opt = doc.createElement("textarea")
        opt.name = 'data'
        opt.value = data
        let opt2 = doc.createElement("textarea")
        opt2.name = 'proto'
        opt2.value = 'https'
        temp_form.appendChild(opt)
        temp_form.appendChild(opt2)
       
        doc.body.appendChild(temp_form)
        //提交数据
        temp_form.submit()
    }
    
    
    
    btnClick = () => {
        this.injections.reduce('modifyContent')
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}

