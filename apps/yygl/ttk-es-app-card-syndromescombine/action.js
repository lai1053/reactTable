import React from 'react'
import config from './config'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {FormDecorator, Icon, Checkbox} from 'edf-component'
import { fromJS } from 'immutable'
import debounce from 'lodash.debounce'

class action{
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.nameChange = debounce(this.nameChange, 400);
    }

    onInit = ({component, injections}) => {
        this.voucherAction.onInit({component, injections})
        this.component = component
        this.injections = injections

        console.info(this.component.props)

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        injections.reduce('init', {
            isPop: this.component.props.isPop
        })
        this.load()
    }

    load = async ()=>{
        let loginType = await this.webapi.customer.findByEnumId({ enumId: 200025 })//登录类型
        let areaQuery = await this.webapi.customer.areaQuery({})//地区选择
        let IDType = await this.webapi.customer.findByEnumId({enumId:'200016'})//证件类型

        if(loginType){//登录类型
            let arg = {}
            loginType.forEach((data) => arg[data.code] = data)
            console.log('deng',arg)
            this.injections.reduce('updateSingle', 'data.other.loginTypeMap', fromJS(arg))
        }
        if(areaQuery){//地区选择
            let arg = {}
            areaQuery.map((data) => {
                data.loginTypeArr = data.loginType.split(',');
                arg[data.code] = data
            })
            this.injections.reduce('updateObj', {
                'data.other.areaQueryArr': fromJS(areaQuery),
                'data.other.areaQueryMap': fromJS(arg)
            })
        }
        if(IDType){
            this.injections.reduce('updateSingle', 'data.IDType',fromJS(IDType))
        }

        let importid = await this.webapi.CAState.getImportid()//客户orgid
        this.injections.reduce('updateSingle', 'data.importId',fromJS(importid))

        let item = await this.webapi.customer.query({ id: this.component.props.id })
        this.injections.reduce('load', item)
        let dd = item.dlfs
        this.injections.reduce('updateSingle', 'data.gg',dd)//存放登录方式
        if(item.dlxxDto.DLFS == '1'){
            this.injections.reduce('updateObj', {
                'data.other.readSuc':true,
                'data.isEdit':'222'//更换证书
            })
        }

        let areaQueryMap = this.metaAction.gf('data.other.areaQueryMap').toJS()
        let ssCode = item.dlxxDto.SS
        this.injections.reduce('updateObj', {
            'data.orgId':item.orgDto.orgId,
            'data.CAState':item.orgDto.orgId,
            'data.isId':this.component.props.id,
            'data.dzswjmm':false,
            'data.other.loginTypeRelation': fromJS(areaQueryMap[ssCode].loginTypeArr)
        })
    }

    onOk = async () => {
        return await this.save()
    }
    save = async () => {
        if (this.clickStatus) return
        this.clickStatus = true
        const form = this.metaAction.gf('data.form').toJS()
        const area = this.metaAction.gf('data.area').toJS()

        let ok = null

        if(form.dlfs == '7'){
            ok = await this.voucherAction.check([
                {
                    path: 'data.form.nsrsbh_old', value: form.nsrsbh_old
                },{
                    path: 'data.form.nsrsbh_new', value: form.nsrsbh_new
                },{
                    path: 'data.form.dlzh', value: form.dlzh
                },{
                    path: 'data.form.sfz', value: form.sfz
                },{
                    path: 'data.form.dlmm', value: form.dlmm
                }], this.check)
        }else{
            ok = await this.voucherAction.check([
                {
                    path: 'data.form.nsrsbh_old', value: form.nsrsbh_old
                },{
                    path: 'data.form.nsrsbh_new', value: form.nsrsbh_new
                },{
                    path: 'data.form.dlzh', value: form.dlzh
                },{
                    path: 'data.form.dlmm', value: form.dlmm
                }], this.check)
        }
        if (!ok) {
            this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
            this.clickStatus = false
            return false
        }

        let orgId = this.metaAction.gf('data.orgId')
        let data = {
            idList:[
                {
                    id:this.component.props.id,
                    orgId:orgId
                }
            ]
        };

        // let res =await this.webapi.customer.downLoadNSRXX(data)
        // if (res) {
        //     let result = await this.webapi.customer.getNsrxxState({sequenceNo: res},5000)
        //
        //     if(result&&result[0]&&result[0].success){
        //         let response
        //         form.name = form.name ? form.name.trim() : ''
        //         form.helpCode = form.helpCode ? form.helpCode.trim() : ''
        //         form.oldVatTaxpayerNum = form.nsrsbh_old ? form.nsrsbh_old.trim() : ''
        //         form.nsrsbh = form.nsrsbh_new ? form.nsrsbh_new.trim() : ''
        //         form.dlfs = form.dlfs ? form.dlfs.trim() : ''
        //         form.dlzh = form.dlzh ? form.dlzh.trim() : ''
        //         form.dlmm = form.dlmm ? form.dlmm.trim() : ''
        //
        //         form.gssbmm = form.gssbmm ? form.gssbmm.trim() : ''
        //         form.blr = form.blr ? form.blr.trim() : ''
        //         form.blrzj = form.blrzj ? form.blrzj.trim() : ''
        //         form.blrzjhm = form.blrzjhm ? form.blrzjhm.trim() : ''
        //         form.linkName = form.linkName ? form.linkName : ''
        //         form.linkTel = form.linkTel ? form.linkTel : ''
        //         form.sfdm = area.registeredProvincial?area.registeredProvincial:'';
        //         form.csdm = area.registeredCity?area.registeredCity:'';
        //         form.qxdm = area.registeredCounty?area.registeredCounty:'';
        //
        //         form.id = this.component.props.id
        //         response = await this.webapi.customer.update(form)
        //
        //         this.clickStatus = false
        //         if (response.success) {
        //             this.metaAction.toast('success', '保存成功、下载纳税人信息成功')
        //             return response
        //         } else {
        //             this.metaAction.toast('error', response.message)
        //             return false
        //         }
        //     }else{
        //         this.clickStatus = false
        //         this.metaAction.toast('error', form.dlfs=='1'?'保存失败，请检查CA证书是否已采集':'保存失败，请检查登录账号和密码')
        //         return false
        //     }
        // }else{
        //     this.clickStatus = false
        //     this.metaAction.toast('error', form.dlfs=='1'?'保存失败，请检查CA证书是否已采集':'保存失败，请检查登录账号和密码')
        //     return false
        // }

        let response
        let params = {
            id:this.component.props.id,
            name:form.name ? form.name.trim() : '',
            helpCode:form.helpCode ? form.helpCode.trim() : '',
            oldVatTaxpayerNum:form.nsrsbh_old ? form.nsrsbh_old.trim() : '',
            nsrsbh:form.nsrsbh_new ? form.nsrsbh_new.trim() : '',
            dlfs:form.dlfs ? form.dlfs.trim() : '',
            dlzh:form.dlfs != '7'?(form.dlzh ? form.dlzh.trim() : ''):form.dlzh+'#'+form.sfz,
            dlmm:form.dlmm ? form.dlmm.trim() : ''
        }
        response = await this.webapi.customer.getNsrxxOther(params)

        this.clickStatus = false
        if (response){
            if (response.success) {
                this.metaAction.toast('success', '保存成功、下载纳税人信息成功')
                return response
            } else {
                if(response.message=='客户名称、纳税人识别号、助记码不能重复，请确认！！'){
                    this.metaAction.toast('error', '客户名称、纳税人识别号、助记码不能重复，请确认！！')
                }else{
                    this.metaAction.toast('error', form.dlfs=='1'?'保存失败，请检查CA证书是否已采集':'保存失败，请检查登录账号和密码')
                }
                return false
            }
        }
    }

    changeDLFS = async (e) =>{
        this.injections.reduce('updateSingle', 'data.form.dlfs',e.target.value)
        let rr = this.metaAction.gf('data.form.dlfs')
        console.log('??????',rr)
        if (this.component.props.active == 'details'){
            if(rr == 1){//登录方式为CA
                //调查询是否有ca信息接口
                let orgid = this.metaAction.gf('data.orgId');
                let id = this.component.props.id;
                let data = {};
                data.id = id;
                data.orgId = orgid;
                let res = await this.webapi.CAState.queryisCA(data);
                if(res){
                    if(res.exist){//存在CA
                        // debugger
                        console.log('我是登录方式',res.exist)
                        this.injections.reduce('updateObj', {
                            'data.other.readSuc': true,
                            'data.isEdit':'222'
                        })//更换证书
                    }else {
                        console.log('我是登录方式',res.exist)
                        this.injections.reduce('updateObj', {
                            'data.other.readSuc': false,
                            'data.isEdit':'333'
                        })//采集证书
                    }

                }else {
                }

            }
        }else {

        }
    }

    //表单校验
    changeCheck = (str) => {
        const form = this.metaAction.gf('data.form').toJS()
        switch (str){
            case 'nsrsbh_old'://旧纳税人识别号
                this.voucherAction.check([{
                    path: 'data.form.nsrsbh_old', value: form.nsrsbh_old
                }], this.check);
                this.voucherAction.check([{
                    path: 'data.form.nsrsbh_new', value: form.nsrsbh_new
                }], this.check);
                break;
            case 'nsrsbh_new'://新纳税人识别号
                this.voucherAction.check([{
                    path: 'data.form.nsrsbh_new', value: form.nsrsbh_new
                }], this.check);
                break;
            case 'dlzh'://用户名
                this.voucherAction.check([{
                    path: 'data.form.dlzh', value: form.dlzh
                }], this.check);
                break;
            case 'sfz'://身份证
                this.voucherAction.check([{
                    path: 'data.form.sfz', value: form.sfz
                }], this.check);
                break;
            case 'dlmm'://用户名密码
                this.voucherAction.check([{
                    path: 'data.form.dlmm', value: form.dlmm
                }], this.check);
                break;
        }
    }
    check = async (option) => {
        let reg = /^[0-9a-zA-Z]+$/;
        if (!option || !option.path)
            return
        if (option.path == 'data.form.nsrsbh_old') {//旧纳税人识别号
            return {
                errorPath: 'data.other.error.nsrsbh_old',
                message: option.value ?(!reg.test(option.value) ? '纳税人识别号只能是数字和字母'
                    : (option.value &&
                        (option.value.length == 20 || option.value.length == 15 || option.value.length == 18)) ? ''
                        : '税号应为15，18或20位'): '请输入纳税人识别号'
            }
        }else if (option.path == 'data.form.nsrsbh_new') {//新纳税人识别号
            let nsrsbh_old = this.metaAction.gf('data.form.nsrsbh_old')
            return {
                errorPath: 'data.other.error.nsrsbh_new',
                message:  nsrsbh_old==option.value?'新纳税人识别号不能与旧纳税人识别号相同'
                    :(option.value ?(!reg.test(option.value) ? '纳税人识别号只能是数字和字母'
                        : (option.value &&
                            (option.value.length == 20 || option.value.length == 15 || option.value.length == 18)) ? ''
                            : '税号应为15，18或20位'): '请输入纳税人识别号')
            }
        }else if (option.path == 'data.form.dlzh') {//用户名
            return {errorPath: 'data.other.error.dlzh', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : '请输入账户名称'}
        }else if (option.path == 'data.form.dlmm') {//用户名密码
            return {errorPath: 'data.other.error.dlmm', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : '请输入密码'}
        }else if (option.path == 'data.form.sfz') {//身份证
            return {errorPath: 'data.other.error.sfz', message: option.value && option.value.trim() ? (option.value.trim().length > 200 ? '名称最大长度为200个字符' : "") : '请输入身份证'}
        }
    }

    //读取证书名称和证书序列号
    queryCA = async () =>{
        let importId = this.metaAction.gf('data.CAState')
        let data = {}
        data.importId = importId
        let ret = await this.webapi.CAState.queryCAName(data);
        if(ret){
            console.log(ret,'ppppp')
            let tt = fromJS(ret);
            let dd = this.metaAction.gf('data.tt').toJS()
            this.injections.reduce('updateObj', {
                'data.tt':tt,
                'data.form.dlzh': this.metaAction.gf('data.form.name'),
                // 'data.form.dlmm': '77777'
                'data.form.dlmm': dd[0].caExpire
            })
        }
    }
    //唤起CA工具
    openCATool = async () => {
        //定时器里有个轮询 读完企业信息会返回true 这个延时器就会关掉
        clearTimeout(this.timer)

        let basic = this.metaAction.gf('data.form').toJS()

        const info = await this.voucherAction.check([{
            path: 'data.form.name', value: basic.name
        }, {
            path: 'data.form.nsrsbh', value: basic.nsrsbh
        }, {
            path: 'data.form.areaCode', value: basic.areaCode
        }], this.check)

        if (!info) {
            if (!basic.name || !basic.nsrsbh) {
                const res = await this.metaAction.modal('warning', {
                    title: '提示',
                    content: '请录入正确的纳税人识别号或企业名称',
                    okText: '确定'
                })

            }
            return
        }

        let vatTaxpayerNum = this.metaAction.gf('data.form.nsrsbh'),
            //ss = this.metaAction.gf('data.form.areaCode'),
            ss ='11',//北京市areacode代码
            //areaCode = this.metaAction.gf('data.form.areaCode').toJS(),//110000北京市
            name = this.metaAction.gf('data.form.name'),
            area='北京市',
            // importid = await this.webapi.CAState.getImportid(),//
            importid = this.metaAction.gf('data.importId'),//客户orgid新增时
            orgid = this.metaAction.gf('data.orgId'),//客户orgid编辑时
            currentOrg = this.metaAction.context.get("currentOrg")
        console.log(currentOrg);
        let dzorgid=currentOrg.id//中介ID，北京CA的同事老是拧不过弯来，所以这个参数对应orgid，传给他代理记账公司的ID

        let a = document.querySelector('#caHype')
        let env = appBasicInfo.apiDomain + '/v1'//开发环境动态获取暂不好用
        // let env = window.location.protocol+"//"+window.location.host + '/v1'//开发环境动态获取暂不好用;
        console.log('yyyyyy',env)
        // console.log('uuuuuu',env)
        // let env = 'http://api.dev.aierp.cn:8089/v1'
        // if(env.indexOf('https') > -1) {
        //     env = env.replace('https', 'http')
        // }
        if(this.component.props.active == 'details') {
            let isEdit = this.metaAction.gf('data.isEdit')
            console.log('isEdit',isEdit)

            if(isEdit == '222'){//CA存在编辑
                let gg = this.metaAction.gf('data.orgId')
                this.injections.reduce('updateSingle', 'data.CAState',gg)
                var testss=`ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&orgId=${orgid}`;
                console.log(testss);

                a.setAttribute('href', `ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&orgId=${orgid}`)
            }
            else if(isEdit == '333'){//不存在CA新增
                let gg = this.component.props.id;//取主键ID
                this.injections.reduce('updateSingle', 'data.CAState',gg)
                var testss=`ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&importid=${importid}`;
                console.log(testss);

                a.setAttribute('href', `ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&importid=${importid}`)
            }

        }else {
            var testss=`ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&importid=${importid}`;
            console.log(testss);

            a.setAttribute('href', `ttk://domainNameFrom=${env}&token=${sessionStorage.getItem('_accessToken')}&orgid=${dzorgid}&nsrsbh=${vatTaxpayerNum}&qymc=${name}&shengshi=${area}&areacode=${ss}&importid=${importid}`)
        }
        a.click()
        this.queryCAState()
    }
    //更换ca证书
    changeCA = async () => {
        let platform = window.navigator.platform
        if (platform.toUpperCase().indexOf("WIN") == -1) {
            await this.metaAction.modal('warning', {
                content: 'CA登录只支持windows系统',
                title: '提示',
                okText: '确定'
            })
            return
        }
        const result = await this.metaAction.modal('confirm', {
            title: '提示',
            content: 'CA证书已读取，更换证书将清空之前读取的企业信息，是否确认更换CA证书？',
        })
        if (result) {
            this.openCATool()
        }
    }
    //下载CA证书
    downloadCACertifacate = async () => {
        let platform = window.navigator.platform
        if (platform.toUpperCase().indexOf("WIN") == -1) {
            await this.metaAction.modal('warning', {
                content: 'CA登录只支持windows系统',
                title: '提示',
                okText: '确定'
            })
            return
        }
        let url = await this.webapi.CAState.getToolUrl();
        //let url = "https://ttk-prod.oss-cn-beijing.aliyuncs.com/DOWNLOAD/CATool.exe";
        if (url) {
            var iframeObject = document.getElementById('downloadExe');
            if (iframeObject) {
                iframeObject.src = url;
            }
            else {
                var iframe = document.createElement('iframe');
                iframe.id = 'downloadExe';
                iframe.frameborder = "0";
                iframe.style.width = "0px"
                iframe.style.height = "0px"
                iframe.src = url;
                document.body.appendChild(iframe);
            }

        }
    }
    //查询CA状态
    queryCAState = async () => {
        let data = {};
        if(this.component.props.active == 'details'){
            let orgid = this.metaAction.gf('data.orgId');
            let id = this.component.props.id;
            data.id = id;
            data.orgId = orgid;
        }else {
            let id2 = this.metaAction.gf('data.importId');
            data.id = id2
        }

        //如果当前的登录方式为CA登录时轮询
        let result = await this.webapi.CAState.queryisCA(data)
        if(result){
            if(result.exist){
                this.injections.reduce('updateObj', {
                    'data.other.CAStep': false,
                    'data.other.hasReadCA': true,
                    'data.other.readSuc':true,
                })
                // this.readOrgInfoBtnState()
            }else {
                this.timer = setTimeout(this.queryCAState, 2000)
            }
        }else {
            this.timer = setTimeout(this.queryCAState, 2000)
        }
        // if (!result) {
        //     this.timer = setTimeout(this.queryCAState, 2000)
        // } else {
        //     this.metaAction.sfs({
        //         'data.other.CAStep': false,
        //         'data.other.hasReadCA': true,
        // 		'data.other.readSuc':true,
        //     })
        //
        //     // this.readOrgInfoBtnState()
        // }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({...option, metaAction}),
        o = new action({...option, metaAction, voucherAction}),
        ret = {...metaAction, ...voucherAction, ...o}
    metaAction.config({metaHandlers: ret})
    return ret
}