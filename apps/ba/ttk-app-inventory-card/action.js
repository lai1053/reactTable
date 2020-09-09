import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { FormDecorator } from 'edf-component'
import { Spin, Icon, Input } from 'edf-component'
import { fromJS } from 'immutable'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.voucherAction = option.voucherAction
        this.webapi = this.config.webapi
        this.lastFetchId = 0
    }

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        this.clickStatus = false
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init')
        this.load()
    }

    load = async () => {
        // this.glAccounts()
        let { initData, moduleYW } = this.component.props
        const result = await Promise.all([
            this.webapi.findEnumList(),
            this.webapi.queryAll()
        ])

        // 查看
        if (initData) {
            let pIdList = []
            // if(initData.inventoryRelatedAccountId){
            // 	pIdList.push(initData.inventoryRelatedAccountId)
            // }else{
            // 	result[1].forEach(o=>{
            // 		if(o.id == initData.propertyId) {
            // 			pIdList.push(o.accountId)
            // 		}
            // 	})
            // }
            result[1].forEach(o => {
                if (o.id == initData.propertyId) {
                    pIdList.push(o.accountId)
                }
            })

            if (!pIdList[0]) { // 业务类型不存在
                const isUse = await this.webapi.isUsed({ id: initData.id })
                this.injections.reduce('isUsed', isUse)
            } else {
                const option = {
                    pIdList,
                    isEndNode: true,
                    isEnable: true,
                    isForInventory: true
                }
                const resultIn = await Promise.all([
                    this.webapi.getSonListByPIdOrPCodeList(option),
                    this.webapi.isUsed({ id: initData.id })
                ])
                let subject = resultIn[0],
                    isUsed = resultIn[1]
                this.injections.reduce('glAccounts', subject)
                this.injections.reduce('isUsed', isUsed)
            }
        }
        let propertyList = result[1],
            unitList = result[0].unitList
        this.injections.reduce('load', { propertyList, unitList, initData })
        // 业务模块
        if (moduleYW) {
            this.metaAction.sfs({
                'data.other.moduleYW': true,
                'data.form.name': moduleYW.invenName,
                'data.form.specification': moduleYW.invenSpecification
            })
        }
    }

    handlePopoverVisibleChange = () => {
        let vis = this.metaAction.gf('data.showPopoverCard')
        if (vis) {
            let newAlias = this.metaAction.gf('data.newAlias').toJS()
            this.metaAction.sf('data.otherName', fromJS(newAlias))
        }
        this.metaAction.sf('data.showPopoverCard', !vis)
    }

    saveOtherName = () => {
        let otherArr = this.metaAction.gf('data.otherName').toJS(),
            newArr = [],
            isChong = false
        otherArr = Array.from(new Set(otherArr))
        otherArr.map(item => {
            if (item.name) {
                if (newArr.indexOf(item.name) > -1) isChong = true
                newArr.push(item.name)
            }
        })
        if (isChong) {
            this.metaAction.toast('error', '存在相同的别名，不能保存！')
            return false
        }
        // 去掉空白框
        let newOtherArr = []
        if (otherArr.length != newArr.length) {
            if (newArr.length > 0) {
                otherArr.map(item => {
                    if (item.name) newOtherArr.push(item)
                })
                newOtherArr.map((item, index) => item.sequenceNo = index + 1)
            } else {
                newOtherArr.push(otherArr[0])
            }
        } else {
            newOtherArr = otherArr
        }
        this.metaAction.sfs({
            'data.showPopoverCard': false,
            'data.form.alias': fromJS(newArr.join(',')),
            'data.newAlias': fromJS(newOtherArr), // 用于显示
            'data.otherName': fromJS(newOtherArr)
        })
    }
    cancelOtherName = () => {
        let newAlias = this.metaAction.gf('data.newAlias').toJS()
        this.metaAction.sfs({
            'data.showPopoverCard': false,
            'data.otherName': fromJS(newAlias)
        })
    }
    changeOtherName = (index, value) => {
        let otherArr = this.metaAction.gf('data.otherName').toJS()
        otherArr[index].name = value
        this.metaAction.sf('data.otherName', fromJS(otherArr))
    }
    addName = () => {
        let otherArr = this.metaAction.gf('data.otherName').toJS()
        if (otherArr.length < 5) {
            otherArr.push({
                sequenceNo: otherArr.length + 1,
                name: null
            })
            this.metaAction.sf('data.otherName', fromJS(otherArr))
        } else {
            this.metaAction.toast('error', '最多5个别名')
            return false
        }
    }
    delName = (index) => {
        let otherArr = this.metaAction.gf('data.otherName').toJS()
        otherArr.splice(index, 1)
        otherArr.map((item, index) => item.sequenceNo = index + 1)
        this.metaAction.sf('data.otherName', fromJS(otherArr))
    }

    clearInput = (index) => {
        let otherArr = this.metaAction.gf('data.otherName').toJS()
        otherArr[index].name = null
        this.metaAction.sf('data.otherName', fromJS(otherArr))
    }

    renderOtherName = () => {
        let otherArr = this.metaAction.gf('data.otherName') && this.metaAction.gf('data.otherName').toJS()
        return otherArr && otherArr.map((item, index) => {
            if (index === 0) {
                return <div style={{position: 'relative', padding: '5px 0'}}>
					<Input value={otherArr[index].name} placeholder='请输入别名名称' 
							maxlength={20}
							title={otherArr[index].name}
							onChange={(v)=>this.changeOtherName(index, v.target.value)}/>
					<Icon
						type='close-circle'
						className={otherArr[index].name ? "circle" : "circle-o"}
						onClick={()=>this.clearInput(index)}></Icon>
					<Icon
						type='plus'
						title='新增'
						className='plus plus-only'
						onClick={this.addName}></Icon>
				</div>
            } else {
                return <div style={{position: 'relative', padding: '5px 0'}}>
					<Input value={otherArr[index].name} placeholder='请输入别名名称' 
							maxlength={20}
							title={otherArr[index].name}
							onChange={(v)=>this.changeOtherName(index, v.target.value)}/>
					<Icon
						type='close-circle'
						className={otherArr[index].name ? "circle" : "circle-o"}
						onClick={()=>this.clearInput(index)}></Icon>
					<Icon
						type='minus'
						title='删除'
						className='minus'
						onClick={()=>this.delName(index)}></Icon>
					<Icon
						type='plus'
						title='新增'
						className='plus'
						onClick={this.addName}></Icon>
				</div>
            }
        })
    }

    // 若该存货己被使用时，编号、名称、规格型号录入框需做置灰处理；
    propertyChange = async (value) => {
        this.metaAction.sf('data.form.account', undefined)

        let pIdList = [],
            property = this.metaAction.gf('data.other.property').toJS()
        const item = property.filter(o => o.id == value)[0]
        pIdList.push(item.accountId)
        let option = {
            pIdList,
            isEndNode: true,
            isEnable: true,
            isForInventory: true
        }
        const res = await Promise.all([
            this.webapi.getSonListByPIdOrPCodeList(option),
            this.webapi.getCode({
                archiveName: "ba_inventory",
                codePrefix: item.code
            })
        ])
        let subject = res[0]
        this.injections.reduce('glAccounts', subject)

        // let isUsed = this.metaAction.gf('data.other.isUsed')
        // if(!isUsed) this.metaAction.sf('data.form.code', res[1])
        this.metaAction.sf('data.form.code', res[1])
        this.changeCheck('propertyId')
    }

    onCancel = () => {
        this.component.props.closeModal()
    }

    save = async (type) => {
        if (this.clickStatus) return
        this.clickStatus = true
        const form = this.metaAction.gf('data.form').toJS()
        let checkArr = [{
            path: 'data.form.propertyId',
            value: form.propertyId
        }, {
            path: 'data.form.code',
            value: form.code
        }, {
            path: 'data.form.name',
            value: form.name
        }, {
            path: 'data.form.unit',
            value: form.unit
        }, {
            path: 'data.form.account',
            value: form.account
        }]
        const ok = await this.voucherAction.check(checkArr, this.check)
        if (!ok) {
            this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
            this.clickStatus = false
            return false
        }

        let otherName = this.metaAction.gf('data.otherName'),
            response, option
        otherName = otherName && otherName.size ? otherName.toJS() : otherName

        if (otherName.length == 1 && !otherName[0].name) otherName = []
        let { initData } = this.component.props
        if (initData) {
            option = {
                ...initData,
                code: form.code,
                name: form.name,
                propertyId: form.propertyId,
                specification: form.specification,
                unitId: form.unit.id,
                inventoryRelatedAccountId: form.account.id,
                archiveAliasList: otherName || []
            }
            response = await this.webapi.update(option)
        } else {
            option = {
                code: form.code,
                name: form.name,
                propertyId: form.propertyId,
                specification: form.specification,
                unitId: form.unit.id,
                inventoryRelatedAccountId: form.account.id,
                archiveAliasList: otherName
            }
            response = await this.webapi.create(option)
        }
        if (response && response.error) {
            this.clickStatus = false
            this.metaAction.toast('error', response.error.message)
            return false
        } else if (response) {
            if (type == 'saveAndNew') {
                this.injections.reduce('init')
                this.load()
                this.clickStatus = false
                return response
            } else {
                this.metaAction.toast('success', '保存成功')
                this.component.props.closeModal(response)
                return response
            }
        }
        this.clickStatus = false
    }

    changeCheck = (str) => {
        const form = this.metaAction.gf('data.form').toJS()
        let checkArr
        if (str == 'propertyId' || str == 'code') {
            checkArr = [{
                path: 'data.form.propertyId',
                value: form.propertyId
            }, {
                path: 'data.form.code',
                value: form.code
            }]
        } else if (str == 'name') {
            checkArr = [{
                path: 'data.form.name',
                value: form.name
            }]
        }
        this.voucherAction.check(checkArr, this.check)
    }

    check = (option) => {
        if (!option || !option.path)
            return
        if (option.path == 'data.form.code') {
            return { errorPath: 'data.other.error.code', message: option.value && option.value.trim() ? '' : '请输入编号' }
        } else if (option.path == 'data.form.name') {
            return { errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? '' : '请输入名称' }
        } else if (option.path == 'data.form.propertyId') {
            return { errorPath: 'data.other.error.property', message: option.value ? '' : '请选择存货类型' }
        } else if (option.path == 'data.form.unit') {
            return { errorPath: 'data.other.error.unitId', message: option.value ? '' : '请选择计量单位组' }
        } else if (option.path == 'data.form.account') {
            return { errorPath: 'data.other.error.account', message: option.value ? '' : '请选择存货科目' }
        }
    }

    fieldChange = (path, value) => {
        this.voucherAction.fieldChange(path, value, this.check)
    }

    addUnit = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '新增计量单位',
            width: 720,
            className: 'ttk-app-unit-card-add',
            children: this.metaAction.loadApp('ttk-app-unit-card', {
                store: this.component.props.store,
            })
        })
        if (ret) {
            let oldArr = this.metaAction.gf('data.other.unitList').toJS()
            oldArr.push(ret)
            this.metaAction.sfs({
                'data.other.unitList': fromJS(oldArr),
                'data.form.unit': fromJS(ret)
            })
        }
    }

    addAccount = async () => {
        let sonListByPcodeList = [],
            glAccounts = this.metaAction.gf('data.glAccounts').toJS()
        // sonListByPcodeList.push(glAccounts[0].codeGrade1)
        if (glAccounts[0] && glAccounts[0].codeGrade1) {
            sonListByPcodeList.push(glAccounts[0].codeGrade1)
        } else {
            this.metaAction.toast('error', '当前存货类型所设定的科目己停用，不能新增下级')
            return false
        }
        const ret = await this.metaAction.modal('show', {
            title: '新增科目',
            width: 450,
            okText: '保存',
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
                store: this.component.props.store,
                columnCode: "subjects",
                active: 'archives',
                initData: {
                    sonListByPcodeList,
                    isOnlyEndNode: false,
                    isEnable: true
                }
            })
        })
        if (ret) {
            if (ret.isCalcMulti) {
                return false
            } else if (!ret.isEnable) {
                return false
            } else if ((ret.isCalcInventory && !ret.isCalcDepartment && !ret.isCalcPerson &&
                    !ret.isCalcCustomer && !ret.isCalcSupplier && !ret.isCalcProject &&
                    !ret.isExCalc1 && !ret.isExCalc2 && !ret.isExCalc3 &&
                    !ret.isExCalc4 && !ret.isExCalc5 && !ret.isExCalc6 &&
                    !ret.isExCalc7 && !ret.isExCalc8 && !ret.isExCalc9 &&
                    !ret.isExCalc10) || !ret.isCalc) {
                glAccounts.push(ret)
                this.metaAction.sfs({
                    'data.glAccounts': fromJS(glAccounts),
                    'data.form.account': fromJS(ret)
                })
            } else {
                return false
            }
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }


    metaAction.config({ metaHandlers: ret })

    return ret
}