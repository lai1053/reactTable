import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.component = component
		this.injections = injections
		if (this.component.props.setOkListener)
			this.component.props.setOkListener(this.onOk)

		injections.reduce('init')
		this.load(this.component.props.initData)
	}

	load = async (initData) => {
    if (initData.certificateData) {
      let certificateData = initData.certificateData.toJS(),
          details = certificateData.details

			let response = await this.webapi.commonDoc.getNewCode()
			let form = { code: response }

			for(var i=0; i<details.length; i++){
					if(details[i].summary != ''){
							if(details[i].summary.length > 30){
									let name = details[i].summary.slice(0,30)
									form.name = name
							}else{
									form.name =details[i].summary
							}
							break
					}
			}
			form.isDisplayCheckBox = true
			this.injections.reduce('load', certificateData, form)
    } else if (initData.template) {
        let form = {}
	      form.modify = initData.modify
        form.id = initData.template.get('docTemplateId')
        form.code = initData.template.get('docTemplateCode')
        form.name = initData.template.get('docTemplateName')

        //"保存金额"字段,隐藏
        form.isDisplayCheckBox = false
				this.injections.reduce('load', {}, form)
    }
	}

	//保存为常用凭证确认按钮
	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		const form = this.metaAction.gf('data.form').toJS()
		const ok = await this.check([{path: 'data.form.code', value: form.code},
																 {path: 'data.form.name', value: form.name}])
		if (!ok) return false

    let isEdit = !this.metaAction.gf('data.other.certificateData'),
			modify = this.metaAction.gf('data.form').get('modify') || false

    if (isEdit || modify) {
      let editTemplate = {}

      editTemplate.docTemplateId = this.metaAction.gf('data.form.id')
      editTemplate.docTemplateCode = this.metaAction.gf('data.form.code')
      editTemplate.docTemplateName = this.metaAction.gf('data.form.name')
	  	editTemplate.isReturnValue = true

		  let response = await this.webapi.commonDoc.update(editTemplate)
			if (response && response.result == false) {
				this.metaAction.toast('warning', response.error.message)
				return false
			} else {
				this.metaAction.toast('success', '常用模版保存成功')
				return { result: true, editTemplate: editTemplate }
			}
    }
    else {
			let response = await this.webapi.commonDoc.create(this.getTemplateFromCertificate())
			if (response && response.result == false) {
				this.metaAction.toast('warning', response.error.message)
				return false
			} else {
				this.metaAction.toast('success', '常用模版保存成功')
			}
    }

		return true
	}

	//必填项校验
	check = async (fieldPathAndValues) => {
		if (!fieldPathAndValues)
			return

		var checkResults = []

		for (var o of fieldPathAndValues) {
			let r = { ...o }
			if (o.path == 'data.form.code') {
				Object.assign(r, await this.checkCode(o.value))
			}
			else if (o.path == 'data.form.name') {
				Object.assign(r, await this.checkName(o.value))
			}
			checkResults.push(r)
		}

		var json = {}
		var hasError = true
		checkResults.forEach(o => {
			json[o.path] = o.value
			json[o.errorPath] = o.message
			if (o.message)
				hasError = false
		})

		this.metaAction.sfs(json)
		return hasError
	}

	checkCode = async (code) => {
		var message

		if (!code)
			message = '请录入编码'

		return { errorPath: 'data.other.error.code', message }
	}

	checkName = async (name) => {
		var message

		if (!name)
			message = '请录入名称'

		return { errorPath: 'data.other.error.name', message }
	}

	//把凭证单据,转换成模板数据
	getTemplateFromCertificate = () => {
    let certificateData = this.metaAction.gf('data.other.certificateData'),
				templateForm = this.metaAction.gf('data.form'),
        template = {}

    template.docTemplateCode = templateForm.get('code')
    template.docTemplateName = templateForm.get('name')
    template.isSaveAmount = templateForm.get('isSaveAmount') || false

    template.docType = certificateData.get('docType')
		template.isReturnValue= true
    template.entrys = []
    let details = certificateData.get('details')
    if (details && details.size){
        for (let item of details) {
            let entry = this.convertVoucherItemForServer(item, false)

            if (entry) {
                template.entrys.push(entry)
            }
        }
    }
    return template
	}

	  convertVoucherItemForServer = (item, isForUpdate) => {
	      if (!item || !item.get('accountingSubject')) {
	          return undefined
	      }

	      let accountingSubject = item.get('accountingSubject')

	      //如果需要数量/外币 核算,但是没有填写
	      if ((accountingSubject.get('isCalcQuantity') || accountingSubject.get('isCalcMulti')) &&
	          !item.get('quantityAndForeignCurrency')) {
	          return undefined
	      }

	      //如果需要辅助核算,但是没有填写
	      if (accountingSubject.get('isCalc') && !accountingSubject.get('auxAccountSubjects')) {
	          return undefined
	      }

	      let entry = {
	          summary: item.get('summary'),
	          accountId: accountingSubject.get('id'),
	          origAmountDr: item.get('debitAmount'),
	          amountDr: item.get('debitAmount'),
	          origAmountCr: item.get('creditAmount'),
	          amountCr: item.get('creditAmount'),
	          inPutTaxDeductId: item.get('inPutTaxDeductId') ? item.get('inPutTaxDeductId') : null
	      }

	      //考虑修改的情况: 修改分录
	      if (isForUpdate) {
	          if (item.get('id')) {
	              entry.id = item.get('id')
	              entry.rowStatus = 2
	              entry.ts = item.get('ts')
	          }
	          else {
	              entry.rowStatus = 1  //--分录状态 0:未变化  1:新增  2:修改  3:删除
	          }
	      }

	      //数量辅助核算
	      if (accountingSubject.get('isCalcQuantity')) {
	          entry.quantity = item.get('quantityAndForeignCurrency').get('quantity')
	          entry.price = item.get('quantityAndForeignCurrency').get('price')
	          entry.unitId = accountingSubject.get('unitId') //计量单位, 暂不支持编辑, 所以用科目里设置的即可
	          entry.exchangeRate = 1
	      } else {
	          entry.quantity = null
	          entry.price = null
	          entry.unitId = null
	          entry.exchangeRate = null
	      }

	      //外币辅助核算
	      if (accountingSubject.get('isCalcMulti')) {
	          entry.currencyId = item.get('quantityAndForeignCurrency').get('currency') ? item.get('quantityAndForeignCurrency').get('currency').get('id') : ''
	          entry.exchangeRate = item.get('quantityAndForeignCurrency').get('exchangeRate')
	          if (entry.amountDr) {
	              entry.origAmountDr = item.get('quantityAndForeignCurrency').get('origAmount') || 0
	          }
	          else {
	              entry.origAmountCr = item.get('quantityAndForeignCurrency').get('origAmount') || 0
	          }
	      } else {
	          entry.currencyId = null
	          entry.exchangeRate = 1
	          entry.origAmountDr = null
	          entry.origAmountCr = null
	      }

	      //其他辅助核算
	      if (accountingSubject.get('isCalc')) {
	          let auxAccountSubjects = accountingSubject.get('auxAccountSubjects')
	          //部门
	          if (accountingSubject.get('isCalcDepartment')) {
	              entry.departmentId = auxAccountSubjects.get('department').get('id')
	          } else {
	              entry.departmentId = null //为了保持上下分录属性字段数量一致，需传null 临时方案 haozhao
	          }

	          //人员
	          if (accountingSubject.get('isCalcPerson')) {
	              entry.personId = auxAccountSubjects.get('person').get('id')
	          } else {
	              entry.personId = null
	          }

	          //客户
	          if (accountingSubject.get('isCalcCustomer')) {
	              entry.customerId = auxAccountSubjects.get('customer').get('id')
	          } else {
	              entry.customerId = null
	          }

	          //供应商
	          if (accountingSubject.get('isCalcSupplier')) {
	              entry.supplierId = auxAccountSubjects.get('supplier').get('id')
	          } else {
	              entry.supplierId = null
	          }

	          //存货
	          if (accountingSubject.get('isCalcInventory')) {
	              entry.inventoryId = auxAccountSubjects.get('inventory').get('id')
	          } else {
	              entry.inventoryId = null
	          }

	          //项目
	          if (accountingSubject.get('isCalcProject')) {
	              entry.projectId = auxAccountSubjects.get('project').get('id')
	          } else {
	              entry.projectId = null
	          }

						for (var j = 1; j <= 10; j++) {
			          if (accountingSubject.get(`isExCalc${j}`)) {
			              entry[`exCalc${j}`] = auxAccountSubjects.get(`exCalc${j}`).get('id')
			          } else {
			              entry[`exCalc${j}`] = null
			          }
						}
	      } else {
	          entry.customerId = null
	          entry.departmentId = null
	          entry.personId = null
	          entry.inventoryId = null
	          entry.supplierId = null
	          entry.projectId = null
            for (var j = 1; j <= 10; j++) {
                entry[`exCalc${j}`] = null
            }
	      }
	      return entry
	  }
	}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
