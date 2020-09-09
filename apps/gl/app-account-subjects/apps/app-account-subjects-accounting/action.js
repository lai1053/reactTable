import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Form, Select, Button } from 'edf-component'
import { List, fromJS } from 'immutable'
import { FormDecorator } from 'edf-component'

const FormItem = Form.Item
const Option = Select.Option
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi

    }

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener)
			this.component.props.setOkListener(this.onOk)
        injections.reduce('init')
        this.load()
    }

    load = async () => {
        const data = this.metaAction.gf('data').toJS()
        data.value = [...this.component.props.newCalc]
        data.other = {...this.component.props.calcDict}
        this.injections.reduce('load', data)
    }

    loopFormItem =(data)=>{
        if (!data) return null
		let	list = ['isCalcCustomer','isCalcSupplier','isCalcProject','isCalcDepartment','isCalcPerson','isCalcInventory','isExCalc1','isExCalc2','isExCalc3','isExCalc4','isExCalc5','isExCalc6','isExCalc7','isExCalc8','isExCalc9','isExCalc10'],
            calcDict = this.metaAction.gf('data.other').toJS(),
            selectValue = this.metaAction.gf('data.selectValue').toJS(),
            error = this.metaAction.gf('data.error').toJS(),
            newData = [],
            name, title
        for(let i in list){
            if(data.indexOf(list[i]) != -1){
                newData.push({name: list[i],title: calcDict[list[i]]})
            }
        }

        return newData.map((item,index) => {
            let dropdownFooter = <Button type='primary'  style={{width: '100%', borderRadius: '0'}} onClick={this.addArchive.bind(this,item.name, item.title)}>新增</Button>
            title = item.title
            name = item.name
            return <FormItem
                key={index}
                name={name}
                required={true}
                label={title}
                required={true}
                validateStatus={error[name] && error[name] !== null ? 'error':'success'}
                help ={error[name] && error[name] !== null ? error[name] : null}
                className='app-account-subjects-accounting-form-item'
            >
                <Select style={{ width: 198 }} allowClear={true}
                    className='app-account-subjects-accounting-form-item-select'
                    onFocus={this.onFocus.bind(this,name)}
                    onChange={this.handleChange.bind(this,name)}
                    value={selectValue[name] && selectValue[name]}
                    dropdownFooter={dropdownFooter}
                    filterOptionExpressions = "code,name,helpCode,helpCodeFull"
                >
                    {this.returnOption(name)}

                </Select>
                <a className = 'btn' onClick={this.adminClick.bind(this, name, title)}>编辑</a>
            </FormItem>
        })
    }

    //下拉选框新增按钮
    addArchive = async (fieldName, title) => {
        let name
        if(fieldName.indexOf('isCalc') != -1){
            name = fieldName.slice(6).toLowerCase()
        }
		switch (name) {
			case 'customer':
				await this.voucherAction.addCustomer('data.addValue.customer')
				break;
			case 'department':
				await this.voucherAction.addDepartment('data.addValue.department')
				break;
			case 'person':
				await this.voucherAction.addPerson('data.addValue.person')
				break;
			case 'inventory':
				await this.voucherAction.addInventory('data.addValue.inventory')
				break;
			case 'supplier':
				await this.voucherAction.addSupplier('data.addValue.supplier')
				break;
			case 'project':
				await this.voucherAction.addProject('data.addValue.project')
				break;
			default:
				this.openUserDefineCard(fieldName, title)
		}
		this.writeBackAuxItem(fieldName)
	}
    //自定义辅助核算卡片
    openUserDefineCard = async (fieldName, title) => {
		const ret = await this.metaAction.modal('show', {
				title: `新增${title}`,
				width: 400,
				children: this.metaAction.loadApp('app-card-userdefinecard', {
					store: this.component.props.store,
					activeKey: title
        }),
		})

		if (ret && ret.isEnable) {
            let address = `data.addValue.${fieldName}`
            this.metaAction.sf(address, ret)
			this.writeBackAuxItem(fieldName)  //解决自定义项无法写入session问题
		}
	}

    writeBackAuxItem = (fieldName) => {
        let data = this.metaAction.gf('data').toJS(),
            {addValue, selectValue, list} = data,
            keys = Object.keys(addValue),
            title
        if(keys.length != 0){
            // console.log(data)
            if(fieldName.indexOf('isCalc') != -1){
                title = fieldName.slice(6).toLowerCase()
            }else{
                title = fieldName
            }
            if(addValue[title]){
                selectValue[fieldName] = addValue[title].id
                list[fieldName] = list[fieldName].concat([addValue[title]])
            }
            this.injections.reduce('setData', {list, selectValue})
        }

	}

    //点击管理加载不同app
    adminClick = async(name, title) =>{
        let appName, activeKey, modalTitle
        if(name.indexOf('isCalc') != -1){
            if(title == '部门' || title == '人员'){
                appName = 'department-personnel'
            }else{
                appName = name.slice(6).toLowerCase()
            }
            modalTitle = title
        }else{
            appName = 'userdefinecard'
            activeKey = title
            modalTitle = '自定义档案'
        }
        const ret = await this.metaAction.modal('show', {
			title: modalTitle,
            width: 840,
            style:{ top: 20},
            className: 'app-proof-of-charge-modal',
            bodyStyle: {height: 500, paddingTop: 0},
            footer:'',
			children: this.metaAction.loadApp(`app-list-${appName}?from=subjects`, {
                store: this.component.props.store,
                activeKey: activeKey,
                modelStatus: 1
			}),
		})
		if (!ret) {
            if((typeof name=='string')&&name.constructor==String){
                const list = this.metaAction.gf('data.list').toJS()
              //判断是否为预制辅助核算
                if(name.indexOf('isCalc') != -1){
                    let selectName = name.slice(6).toLowerCase()
                    const response = await this.webapi.query.calcDict("",selectName)
                    list[name] = response.list
                    this.metaAction.sf('data.list', fromJS(list))
                  }else{
                    const response = await this.webapi.query.userdefinearchive({entity:{calcName: name}})
                    list[name] = response.list
                    this.metaAction.sf('data.list', fromJS(list))
                  }
            }
            let data = this.metaAction.gf('data').toJS(),
                {list, selectValue} = data
            if(selectValue[name]){
                let value  = selectValue[name],
                    selectList =  list[name],
                    selectValueData = selectList.filter(o => o.id == value)
                if(selectValueData.length==0){
                    if(selectList.length == 0){
                        delete selectValue[name]
                    }else{
                        selectValue[name] = selectList[0].id
                    }
                }
            }
            this.injections.reduce('setData', {list, selectValue})
		}
    }

    handleChange = (name, id) =>{
        let selectValue = this.metaAction.gf('data.selectValue').toJS()
        selectValue[name] = id
        this.metaAction.sf('data.selectValue', fromJS(selectValue))
    }

    returnOption = (title) =>{
        const list = this.metaAction.gf('data.list').toJS()
        if(Object.keys(list).length == 0 || !list[title])
            return
        return list[title].map((item)=>{
            if(item.isEnable || !item.hasOwnProperty('isEnable')){
                return <Option key={item.id} _data={item} value={item.id}>{title=='isCalcDepartment'||title=='isCalcPerson'?item.name:item.code+' '+item.name}</Option>
            }
        })
    }

    //下拉框获取焦点
	onFocus = async (title) => {
        if((typeof title=='string')&&title.constructor==String){
            const list = this.metaAction.gf('data.list').toJS()
          //判断是否为预制辅助核算
            if(title.indexOf('isCalc') != -1){
                let name = title.slice(6).toLowerCase()
                const response = await this.webapi.query.calcDict("",name)
                list[title] = response.list
                this.injections.reduce('loadData', list)
              }else{
                const response = await this.webapi.query.userdefinearchive({entity:{calcName: title}})
                list[title] = response.list
                this.injections.reduce('loadData', list)
              }
        }
    }

    onOk = async () => {
        let data = this.metaAction.gf('data').toJS(),
            {selectValue, value, other} = data,
            warning = [],
            result = {},
            name = '',
            title = '',
            pathList = []
        for( let i = 0; i < value.length; i++){
            title = value[i]
            if(!selectValue[title]){
                pathList.push({
                    path: 'data.error.'+title,
                    title: other[title]
                })
            }else{
                if(title.indexOf('isCalc') != -1){
                    name = title.slice(6).toLowerCase()+'Id'
                }else{
                    name = 'e'+title.slice(3)
                }
                result[name] = selectValue[title]
            }
        }
        const ok = await this.voucherAction.check(pathList, this.check)
        if(!ok){
            this.metaAction.toast('warning','请按页面提示信息修改信息后才可提交')
            return false
        }
        return result
    }

    //必填项校验
	check = async (fieldPathAndValues) => {
		if (!fieldPathAndValues)
			return

        let r = { ...fieldPathAndValues },
            path = r.path,
            other = this.metaAction.gf('data.other').toJS(),
            message = `${other[path.slice(11)]}不能为空`
        return { errorPath: path, message }
	}

    fieldChange = (path, value) => {
        this.voucherAction.fieldChange(path, value, this.check)
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
