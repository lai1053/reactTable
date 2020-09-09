import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import {TextArea } from 'edf-component'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.config = config.current
    }

    tableName = '总账（2017.01-2017.12）.pdf';

    onInit = ({ component, injections }) => {

        this.component = component
        this.injections = injections
        injections.reduce('init')
        if (this.component.props.setOkListener) {

            this.component.props.setOkListener(this.onOk)
        }
        this.load()
    }
    load = async () => {

    //    let data = await this.webapi.mail.share(this.component.props.shareUrl, this.component.props.params.newParams?this.component.props.params.newParams:this.component.props.params)
       let urlName
       if(this.component.props.shareUrl.indexOf('glsumrpt')>-1){
        urlName = '总账'
       }else if(this.component.props.shareUrl.indexOf('gldetailrpt')>-1){
        urlName = '明细账'
       }else if(this.component.props.shareUrl.indexOf('balancesumrpt')>-1){
        urlName = '余额表'
       }else if(this.component.props.shareUrl.indexOf('glauxsumrpt')>-1){
        urlName = '辅助总账'
       }else if(this.component.props.shareUrl.indexOf('gldetailauxrpt')>-1){
        urlName = '辅助明细账'
       }else if(this.component.props.shareUrl.indexOf('balanceauxrpt')>-1){
        urlName = '辅助余额表'
       }else if(this.component.props.shareUrl.indexOf('balanceSheet')>-1){
        urlName = '资产负债表'
       }else if(this.component.props.shareUrl.indexOf('profitStatement')>-1){
        urlName = '利润表'
       }else if(this.component.props.shareUrl.indexOf('costOfPeriod')>-1){
        urlName = '期间费用表'
       }else if(this.component.props.shareUrl.indexOf('arap')>-1){
          let reportType = this.component.props.reportType

          if (reportType == 0) {
              urlName = '应收统计表'
          } else if (reportType == 1) {
              urlName = '预收统计表'
          } else if (reportType == 2) {
              urlName = '应付统计表'
          } else if (reportType == 3) {
              urlName = '预付统计表'
          }
       }else if(this.component.props.shareUrl.indexOf('ageAnalysis')>-1){
        urlName = '账龄分析表'
       }else{
        urlName = '现金流量表'
       }
       let hash = {},
       arr = this.component.props.period.split('-'),
       period= this.component.props.period,
       params = this.component.props.params

    for(let i = 0; i<arr.length; i++){

        if(arr[i] == arr[i+1]){
            period = arr[i]
        }
    }
       let option = {
           params: params, period: period
       }
       this.metaAction.sf('data.other.file', `${urlName}(${period}).pdf`)
       this.metaAction.sf('data.form.textBody', `您好！附件是${period}${urlName}，请查阅`)

        this.injections.reduce('load', option, urlName )
        this.metaAction.sf('data.loading',false)
    }
    fieldChange = async (fieldPath, value) => {
        await this.check([{ path: fieldPath, value }])
    }
    goFile = async () => {
        let data = await this.webapi.mail.print(this.component.props.printShareUrl, this.component.props.params.newParams?this.component.props.params.newParams:this.component.props.params)
    }
    check = async (field) => {

        if (!field)
            return
        let checkResults = [];
        for (var o of field) {
            let r = { ...o }

            if (o.path == 'data.form.toAddress') {

                Object.assign(r, await this.checkAddressee(o.value))
            }
            else if (o.path == 'data.form.ccAddress') {

                Object.assign(r, await this.checkCopyTo(o.value))
            }
            else if (o.path == 'data.form.subject') {

                Object.assign(r, await this.checkSubjectd(o.value))
            }

            checkResults.push(r)
        }

        let json = {},
            hasError = true;
        checkResults.forEach(o => {
            json[o.path] = o.value
            json[o.errorPath] = o.message
            if (o.message)
                hasError = false
        })

        this.metaAction.sfs(json)

        return hasError
    }

    checkAddressee = async (address) => {
        let message

        if (!address)
            message = '请录入邮箱'
        else if (!/^((([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6}\;))*(([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})))$/.test(address))
            message = '请输入正确格式的邮箱'

        return { errorPath: 'data.other.error.addressee', message }
    }

    checkCopyTo = async (address) => {
        let message,
            regex = /^((([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6}\;))*(([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})))$/;
        if (!address)
            message = ''
        else if (!regex.test(address))
            message = '请输入正确格式的邮箱'

        return { errorPath: 'data.other.error.copyTo', message }
    }

    checkSubjectd = async (password) => {
        let message

        if (!password)
            message = '请输入主题'

        return { errorPath: 'data.other.error.subject', message }
    }
    sendMail = async (params) => {

        let data = await this.webapi.mail.mailShare(this.component.props.mailShareUrl, params)
        if(data){
            this.metaAction.toast('success', '邮件分享成功')
        }
    }
    onOk = async () => {
        let params = this.metaAction.gf('data.form').toJS()
        const ok = await this.check([{
            path: 'data.form.toAddress', value: params.toAddress
        }, {
            path: 'data.form.ccAddress', value: params.ccAddress
        }, {
            path: 'data.form.subject', value: params.subject
        },{
            path: 'data.form.textBody', value: params.textBody
        }])
        if (!ok) return false
        delete params.file
        params.period = params.search.newParams
        params = Object.assign(params, params.search)
        // params.textBody = detailFile
        // params.textBody = `<h5>您好！</h5><p class="mail-mailcontent"><!-- react-text: 27 -->这是测试分享 ${params.period}${params.urlName}，详情请查看附件：<!-- /react-text --><a href="${params.fileHref}" target="_blank">${params.fileHref}</a></p><h4>Thanks!</h4>`
        delete params.periodName
        delete params.search
        delete params.fileHref
        delete params.newParams
        this.sendMail(params)
        return true
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })
    return ret
}
