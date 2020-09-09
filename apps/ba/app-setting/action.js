import React from 'react'
import { Checkbox } from 'edf-component'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS } from 'immutable'


class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.webapi = this.config.webapi
        this.injections = injections
        let {dtoProp,isVoucher} = component.props
        if (this.component.props.setOkListener)
            this.component.props.setOkListener(this.onOk)

        this.webapi.set.getByDtoId(dtoProp).then(response=>{
            let initDataInfo = {
                isVoucher,
                visibleList: response,
                dtoProp
            }
            injections.reduce('init',initDataInfo)

        })

    }
    onOk = async()=>{
        let res = this.webapi.set.updateCardControl(this.metaAction.gf('data.form').toJS())
        if(res){
            this.metaAction.toast('success','设置成功')
            return res
        }
    }
    handleRecover = ()=>{
        let formData = JSON.parse(JSON.stringify(this.metaAction.gf('data.visibleList').toJS()))
        this.metaAction.sf('data.form',fromJS(formData))
    }
    handleChange = (key)=>(e)=>{
        let formData = this.metaAction.gf('data.form').toJS(),
        list = formData[0].details

        list = list.map(o=>{
            if(o.propertyName === key){
                o.visible = e.target.checked
            }
            return o
        })
        formData[0].details = list
        this.metaAction.sf('data.form',fromJS(formData) )
    }
    getListChildren = (data,type)=>{
        let form = []
        switch (type) {
            case 'list':
                data[0].details.map(o=>{
                    form.push(
                        <div>
                            <Checkbox
                                onChange={this.handleChange(o.propertyName)}
                                checked = {o.visible}>
                                {o.propertyTitle}
                            </Checkbox>
                        </div>
                    )

                })
                break;
            case 'head':
                data[0].details.map(o=>{
                    if(o.isHead){
                        form.push(
                            <div>
                                <Checkbox
                                    onChange={this.handleChange(o.propertyName)}
                                    checked = {o.visible}>
                                    {o.propertyTitle}
                                </Checkbox>
                            </div>
                        )
                    }
                })
                break;
            case 'body':
                data[0].details.map(o=>{
                    if(!o.isHead){

                        form.push(
                            <div>
                                <Checkbox
                                    onChange={this.handleChange(o.propertyName)}
                                    checked = {o.visible}>
                                    {o.propertyTitle}
                                </Checkbox>
                            </div>
                        )
                    }
                })
                break;

        }
        return form
    }
    btnClick = () => {
        this.injections.reduce('modifyContent')
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
