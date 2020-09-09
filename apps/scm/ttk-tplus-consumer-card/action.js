import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, FormDecorator } from 'edf-component'
import config from './config'
import extend from './extend'
import { Map, fromJS } from 'immutable'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')
        this.load()
    }

    load = async () => {
        let { softAppName, baseUrl, options, starCode } = this.component.props;
        this.metaAction.sf('data.form.code', starCode);//默认的编码
        const consumer = await this.webapi.tplus.common(`${baseUrl}/common/consumerClass/query`, {}, options)
        if (consumer && consumer.error) {
            this.metaAction.toast('error', consumer.error.message)
        } else if (consumer && consumer.result) {
            this.metaAction.sf('data.other.consumer', fromJS(consumer.value))
        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
        }
    }

    //保存
    onOk = async (type) => {
        return await this.save(type)
        // if (save) this.component.props.closeModal(save)
    }

    save = async (type) => {
        let form = this.metaAction.gf('data.form').toJS();
        let { baseUrl, options, consumer: newconsumer, softAppName } = this.component.props;
        const flag1 = newconsumer.find((item) => {
            return item.code == form.code
        })

        if (flag1) {
            this.metaAction.sf('data.form.codeErr', false)
            this.metaAction.toast('error', '已存在相同编码的往来单位')
            return false
        }

        const flag3 = newconsumer.find((item) => {
            return item.names == form.name
        })

        if (flag3) {
            this.metaAction.sf('data.form.nameErr', false)
            this.metaAction.toast('error', '已存在相同名称的往来单位')
            return false
        }

        const flag2 = newconsumer.find((item) => {
            return item.code == form.code && item.names == form.name
        })

        if (flag2) {
            this.metaAction.sf('data.form.codeErr', false)
            this.metaAction.sf('data.form.nameErr', false)
            this.metaAction.toast('error', '已存在相同编码和名称的往来单位')
            return false
        }

        if (form.code == undefined || form.code == '') {
            this.metaAction.sf('data.form.codeErr', false)
            this.metaAction.toast('error', '往来单位编码不能为空')
            return false
        }
        if (form.name == undefined || form.name == '') {
            this.metaAction.sf('data.form.nameErr', false)
            this.metaAction.toast('error', '往来单位名称不能为空')
            return false
        }

        if (form.codeErr == false) {
            this.metaAction.toast('error', '往来单位编码不能超过30个字符')
            return false
        }
        // if (form.consumerId == undefined || form.consumerId == '') {
        //     this.metaAction.sf('data.form.consumerIdErr', false)
        //     this.metaAction.toast('error', '往来单位分类不能为空')
        //     return false
        // }

        const res = await this.webapi.tplus.common(`${baseUrl}/common/consumerManual/create`,
            {
                code: form.code,
                name: form.name,
                partnerClass: { code: form.consumerId },
            },
            options
        )
        if (res && res.error) {
            this.metaAction.toast('error', res.error.message)
        } else if (res.result) {
            if (!res.value) {
                this.metaAction.toast('error', '新增失败')
            } else {
                this.metaAction.toast('success', '新增成功')
            }
        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
        }
        return res
    }


    fieldChange = (path, value) => {
        if (value) value = value.trim();
        if (path == 'data.form.code') {
            if (value.trim().length > 64) {
                this.metaAction.toast('error', '往来单位编码不能超过30个字符')
                this.metaAction.sfs({
                    'data.form.codeErr': false
                })
                return false
            }

            this.metaAction.sfs({
                'data.form.code': value,
                'data.form.codeErr': true
            })
        }
        if (path == 'data.form.name') {
            this.metaAction.sfs({
                'data.form.name': value,
                'data.form.nameErr': true
            })
        }
        if (path == 'data.form.consumerId') {
            this.metaAction.sfs({
                'data.form.consumerId': value,
                'data.form.consumerIdErr': true
            })
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })
    return ret
}