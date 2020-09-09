import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { FormDecorator, Icon, DatePicker, Button } from 'edf-component'
import config from './config'
import { Map, fromJS } from 'immutable'
import extend from './extend'
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
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections

        injections.reduce('init')

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }

        this.load()
    }

    load = async () => {
        this.metaAction.sf('data.other.loading', true)
        let account = await this.webapi.getAccount()
        if(account && account.glAccounts){
            const {propertyList} = this.component.props
            if(propertyList) this.injections.reduce('load', propertyList, account.glAccounts)
        }
    }

    // 若未录入时，不允许新增下一行，并给出提示“当前行未录入完整，不能新增下一行”

    changeType = (index, value, type) => { 
        if(type == 'accountId') {
            let glAccounts = this.metaAction.gf('data.glAccounts').toJS()
            const name = glAccounts.filter(o=>o.id == value)[0].codeAndName
            this.metaAction.sfs({
                [`data.form.details.${index}.${type}`]: fromJS(value),
                [`data.form.details.${index}.accountName`]: fromJS(name),
                [`data.form.details.${index}.recordStatus`]: 2
            })
        }else{
            this.metaAction.sfs({
                [`data.form.details.${index}.${type}`]: fromJS(value),
                [`data.form.details.${index}.recordStatus`]: 2
            })
        }
    }

    onOk = async () => {
        let details = this.metaAction.gf('data.form.details').toJS()
        let delArr = this.metaAction.gf('data.form.delArr').toJS()

        details.forEach((item, index)=>{
            if(!item.name && !item.accountId && !item.code){
                details.splice(index, 1)
            }
        })
        let isFalse, newAccount = [], newName = [], newCode = [], hasCode = []
        details.forEach((item, index)=>{
            if((!item.name || !item.accountId) && item.code){
                this.metaAction.toast('error', '存在未录入的数据，不能保存！')
                isFalse = true
            }
            if(item.name && item.accountId){
                newAccount.push(item.accountId)
                newName.push(item.name)
                if(item.code) newCode.push(item.code)
            }
        })
        if(isFalse) return false
        newAccount = Array.from(new Set(newAccount))
        newName = Array.from(new Set(newName))
        hasCode = Array.from(new Set(newCode))
        
        // if(details.length != newName.length){
        //     this.metaAction.toast('error', '存货类型名称不能重复，请修改后重新保存！')
        //     isFalse = true
        // }
        // if(details.length != newCode.length){
        //     this.metaAction.toast('error', '存货类型编码不能重复，请修改后重新保存！')
        //     isFalse = true
        // }
        if(details.length != newName.length || details.length != newAccount.length || hasCode.length != newCode.length){
            this.metaAction.toast('error', '存货类型名称/编码/科目不能重复，请修改后重新保存！')
            isFalse = true
        }
        if(isFalse) return false

        if(delArr && delArr.length){
            details = details.concat(delArr)
        }
        
        // 0 不动
        // 1 新增
        // 2 修改
        // 3 删除
        details.forEach((item, index)=>{
            if(!item.id) {
                details[index].recordStatus = 1
            }else if(item.recordStatus !== 3 && item.recordStatus !== 2){
                details[index].recordStatus = 0   // 没有动
            }
            details[index].sequenceNo = index + 1
        })
        const res = await this.webapi.setData({inventoryTypeList: details})
        if(res){
            this.metaAction.toast('success', '保存成功')
            this.component.props.closeModal(true)
        }else{
            return false
        }
    }

    onCancel = () => {
        this.component.props.closeModal(false)
    }

    addBottomRow = (gridName) => (ps) => {
        let details = this.metaAction.gf(`data.form.${gridName}`).toJS()
        if(!details[details.length - 1].name || !details[details.length - 1].accountId){
            this.metaAction.toast('error', '当前行未录入完整，不能新增下一行')
            return false
        }
        this.injections.reduce('addRowBefore', gridName, ps.rowIndex)
        this.injections.reduce('addBottomRow', gridName, ps.rowIndex)
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