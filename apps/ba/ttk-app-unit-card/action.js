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
        const {item} = this.component.props
        if(item) this.injections.reduce('load', item)
    }

    onTabFocus = async (params) => {
        this.load()
    }

    onFieldChanges = (index, value, type) => {
        this.metaAction.sf(`data.form.details.${index}.${type}`, value)
    }

    onOk = async () => {
        let name = this.metaAction.gf('data.other.name'),
        detail = this.metaAction.gf('data.form.details').toJS(), auxiliaryUnitList = [], 
        factorErr = [], fuNameArr = [], newFuArr = []

        if(!name) {
            this.metaAction.toast('error', '主计量单位未录入，不能保存')
            return false
        }
        if(detail && detail.length){
            detail.map((item, index)=>{
                if(item.name && item.factor){
                    auxiliaryUnitList.push({
                        ...item,
                        sequenceNo: index+1,
                        name: item.name,
                        factor: item.factor
                    })
                    fuNameArr.push(item.name)
                    if(item.factor<0) factorErr.push(item)
                }
            })
        }
        if(fuNameArr.length>1){
            newFuArr = Array.from(new Set(fuNameArr))
            if( newFuArr.length != fuNameArr.length ){
                this.metaAction.toast('error', '存在相同名称，不能保存')
                return false
            }
        }
        if(factorErr.length) {
            this.metaAction.toast('error', '换算系数需大于0')
            return false
        }
        const filter = {
            name,
            auxiliaryUnitList
        }
        let edit = this.metaAction.gf('data.other.edit'), response
        if(edit){
            let oldItem = this.metaAction.gf('data.other.oldItem')
            oldItem.name = name
            oldItem.auxiliaryUnitList = auxiliaryUnitList
            response = await this.webapi.update(oldItem)
        }else{
            response = await this.webapi.create(filter)
        }
    }

    onCancel = () => {
        this.component.props.closeModal()
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