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
        let { baseUrl, options, softAppName,starCode } = this.component.props;
        this.metaAction.sf('data.form.code',starCode);
        const inventory = await this.webapi.tplus.common(`${baseUrl}/common/inventoryClass/manualQuery`, {}, options)
        const unit = await this.webapi.tplus.common(`${baseUrl}/common/unit/query`, {}, options)

        if (inventory && inventory.error) {
            this.metaAction.toast('error', inventory.error.message)
        } else if (inventory && inventory.result) {
            this.metaAction.sf('data.other.inventory', fromJS(inventory.value))
        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
        }

        if (unit && unit.error) {
            this.metaAction.toast('error', unit.error.message)
        } else if (unit && unit.result) {
            if (unit.value) {
                this.metaAction.sf('data.other.unit', fromJS(unit.value))
            }
        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`)
        }
    }

    //取消
    onCancel = () => {
        console.log(1)
    }

    //保存
    onOk = async (type) => {
        return await this.save(type)
        // if (save) this.component.props.closeModal(save)
    }

    save = async (type) => {
        let form = this.metaAction.gf('data.form').toJS(),
            inventory = this.metaAction.gf('data.other.inventory').toJS(),
            unit = this.metaAction.gf('data.other.unit').toJS();
        let { baseUrl, options, inventory: newinventory, softAppName } = this.component.props;
        const flag1 = newinventory.find((item) => {
            return item.code == form.code
        })

        if (flag1) {
            this.metaAction.sf('data.form.codeErr', false)
            this.metaAction.toast('error', '已存在相同编码的存货')
            return false
        }

        const flag2 = newinventory.find((item) => {
            return item.names == form.name
        })

        if (flag2) {
            this.metaAction.sf('data.form.nameErr', false)
            this.metaAction.toast('error', '已存在相同名称的存货')
            return false
        }

        const flag3 = newinventory.find((item) => {
            return item.code == form.code && item.names == form.name
        })

        if (flag3) {
            this.metaAction.sf('data.form.codeErr', false)
            this.metaAction.sf('data.form.nameErr', false)
            this.metaAction.toast('error', '已存在相同编码和名称的存货')
            return false
        }


        if (form.code == undefined || form.code == '') {
            this.metaAction.sf('data.form.codeErr', false)
            this.metaAction.toast('error', '存货编码不能为空')
            return false
        }

        if (form.name == undefined || form.name == '') {
            this.metaAction.sf('data.form.nameErr', false)
            this.metaAction.toast('error', '存货名称不能为空')
            return false
        }
        // if (form.inventoryId == undefined || form.inventoryId == '') {
        //     this.metaAction.sf('data.form.inventoryIdErr', false)
        //     this.metaAction.toast('error', '存货分类不能为空')
        //     return false
        // }
        if (form.unitId == undefined || form.unitId == '') {
            this.metaAction.sf('data.form.unitIdErr', false)
            this.metaAction.toast('error', '计量单位不能为空')
            return false
        }

        if(form.codeErr == false) {
            this.metaAction.toast('error', '存货编码不能超过30个字符')
            return false
        }

        let inventoryName = '', unitName = ''
        inventory.map((item, index) => {
            if (item.code) {
                if (item.code == form.inventoryId) {
                    inventoryName = item.name
                }
            }
        })

        unit.map((item, index) => {
            if (item.code) {
                if (item.code == form.unitId) {
                    unitName = item.name
                }
            }
        })

        const res = await this.webapi.tplus.common(`${baseUrl}/common/inventory/create`, {
            code: form.code,
            name: form.name,
            inventoryClass: { code: form.inventoryId },
            unit: { code: form.unitId, name: unitName }
        },
            options
        )


        if (res && res.error) {
            this.metaAction.toast('error', res.error.message);
            return false;
        } else if (res && res.result) {
            if (!res.value) {
                this.metaAction.toast('error', '新增失败');
                return false;
            } else {
                this.metaAction.toast('success', '新增成功')
            }
        } else {
            this.metaAction.toast('error', `连接${softAppName}服务失败：请检查配置软件是否正常启动`);
            return false;
        }
        if (!res.value.unit) {
            res.value.unit = { code: form.unitId, name: unitName }
        }
        return res
    }

    fieldChange = (path, value) => {
        if (value) value = value.trim();
        if (path == 'data.form.code') {
            if (value.trim().length > 64) {
                this.metaAction.toast('error', '存货编码不能超过30个字符')
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
        if (path == 'data.form.inventoryId') {
            this.metaAction.sfs({
                'data.form.inventoryId': value,
                'data.form.inventoryIdErr': true
            })
        }
        if (path == 'data.form.unitId') {
            this.metaAction.sfs({
                'data.form.unitId': value,
                'data.form.unitIdErr': true
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