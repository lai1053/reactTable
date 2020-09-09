export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-proof-of-charge-new-subjects',
		//onMouseDown: '{{$mousedown}}',
		children: {
			name: 'loading',
			component: 'Spin',
			className: 'app-proof-of-charge-new-subjects-loading',
			spinning: '{{data.other.loading}}',
			tip: '数据加载中...',
			size: 'large',
			children: [{
				name: 'form',
				component: 'Form',
				className: 'app-proof-of-charge-new-subjects-form',
				children: [{
					name: 'rule',
					component: 'Form.Item',
					label: '编码规则',
					_visible: "{{data.other.active !== 'certificate'&&data.other.active!=='archives'}}",
					children: [{
						name: 'name',
						component: '::span',
						style: { width: 260 },
						// children: '4-2-2-2-2'
						children: '{{$renderAccountRule(data.other.accountRule)}}'
					}]
				},
				{
					name: 'code',
					component: 'Form.Item',
					label: '科目属性',
					className: 'app-proof-of-charge-new-subjects-form-code',
					required: true,	
					_visible: "{{$visibleAccountType()}}",
					// _visible: "{{data.other.active == 'addPrimarySubject' || ()}}",			
					validateStatus: "{{data.other.error.accountTypeId?'error':'success'}}",
					help: '{{data.other.error.accountTypeId}}',
					children: [
						{
							name: 'select',
								component: 'Select',
								value: '{{data.form.accountTypeId}}',
								placeholder: '--请选择--',
								disabled: '{{data.other.canModifyAccountType?false:true}}',
								onChange: "{{function(value){$fieldChange('data.form.accountTypeId', value)}}}",
								style: {width: 260},
								children: {
									name: 'option',
									component: 'Select.Option',
									style: { width: 260, height: 28, fontSize: 12 },
									value: '{{data.other.propertyList[_rowIndex].id}}',
									key: '{{data.other.propertyList[_rowIndex].id}}',
									children: '{{data.other.propertyList[_rowIndex].name}}',
									_power: 'for in data.other.propertyList'
								},
						}
					]
				},
				{
					name: 'code',
					component: 'Form.Item',
					label: '科目编码',
					className: 'app-proof-of-charge-new-subjects-form-code',
					required: true,	
					_visible: "{{data.other.active !== 'certificate'&&data.other.active!=='archives'}}",			
					validateStatus: "{{data.other.error.code?'error':'success'}}",
					help: '{{data.other.error.code}}',
					children: [{
						name: 'name',
						component: 'Input',
						disabled: '{{data.form.isSystem || !data.form.isEndNode}}',
						className: 'app-proof-of-charge-new-subjects-form-code-input',
						style: { width: 260, height: 28, fontSize: 12 },
						regex: '^[A-Za-z0-9]+$',
						// addonBefore: '{{data.other.addonBefore}}',
						// maxlength: '2',
						addonBefore: '{{$renderAddonBefore()}}',
						maxlength: '{{$renderMaxlength()}}',
						value: '{{data.form.code}}',
						onChange: `{{function(e){$fieldChange('data.form.code',e.target.value)}}}`,
					}]
				},{
					name: 'subjectName',
					component: 'Form.Item',
					label: '科目名称',
					required: true,
					validateStatus: "{{data.other.error.name?'error':'success'}}",
					help: '{{data.other.error.name}}',
					children: [{
						name: 'name',
						component: 'Input',
						disabled: '{{$disabledState(data.form, "name")}}',
						style: { width: 260, height: 28, fontSize: 12 },
						className: 'subjectNameInput',
						id: 'subjectName',
						autocomplete: 'off',
						value: '{{data.form.name}}',
						onChange: `{{function(e){$fieldChange('data.form.name',e.target.value)}}}`,
					}]
				},{
					name: 'subject',
					component: 'Form.Item',
					label: '上级科目',
					required: '{{data.other.active == "certificate" || data.other.active =="archives"? true : false}}',
					className: 'app-proof-of-charge-new-subjects-form-parent',
					_visible: "{{data.other.codeAndName !== null && data.other.active !== 'addPrimarySubject'}}",
					children: `{{$parentSubjectNode()}}`,
					validateStatus: "{{data.other.error.code  && data.other.codeAndName !== null ?'error':'success'}}",
					help: "{{(data.other.active == 'certificate'|| data.other.active =='archives')&& data.other.codeAndName !== null ? data.other.error.code : null}}",
					// [{
					// 	name: 'superiorSubject',
					// 	component: '::span',
					// 	children: '{{data.other.codeAndName}}',
					// 	style: { width:200 }
					// }]
				},{
					name: 'subjectDirection',
					component: 'Form.Item',
					label: '科目方向',
					children: [{
						name: 'balanceDirection',
						component: 'Radio.Group',
						// disabled: false,
						disabled: '{{$subjectDirectionDisabled()}}',
						// disabled: '{{data.other.oldSubject&&!data.other.oldSubject.isEndNode?false: data.other.oldSubject&&data.other.oldSubject.isEndNode&&data.other.isUsed?true:false }}',
						style: { width:150 },
						value: '{{data.form.balanceDirection}}',
						onChange: '{{function(v){$setField("data.form.balanceDirection", v.target.value)}}}',
						children: [{
							name: 'borrow',
							component: 'Radio',
							value: 0,
							children: '借'
						}, {
							name: 'loan',
							component: 'Radio',
							value: 1,
							children: '贷'
						}]
					}]
				},{
					name: 'bankAccount',
					component: 'Form.Item',
					className: 'bankAccount',
					_visible: "{{data.other.isDisplayBankAccountAux}}",
					children: [{
						name: 'bank',
						component: 'Form',
						className: 'bank-content',					
						children: [{
							name: 'bankCode',
							component: 'Form.Item',
							label: '账号',
							required: true,
							// disabled: '{{$disabledState(data.form, "isCalcPerson")}}',
							help: '{{data.other.error.bankCode}}',
							validateStatus: "{{data.other.error.bankCode?'error':'success'}}",
							children: [{
								name: 'name',
								component: 'Input',
								maxlength: '50',
								style: { width: 260, height: 28, fontSize: 12 },
								value: '{{data.form.bankCode}}',
								onChange: `{{function(e){$fieldChange('data.form.bankCode',e.target.value)}}}`,
							}]
						},{
							name: 'openingBankName',
							component: 'Form.Item',
							label: '开户银行',
							required: true,
							validateStatus: "{{data.other.error.bankName?'error':'success'}}",
							help: '{{data.other.error.bankName}}',
							children: [{
								name: 'name',
								component: 'Input',
								maxlength: '50',
								style: { width: 260, height: 28, fontSize: 12 },
								value: '{{data.form.bankName}}',
								onChange: `{{function(e){$fieldChange('data.form.bankName',e.target.value)}}}`,
							}]
						}]
					}]
				},{
					name: 'adjustAccounts1',
					component: 'Form.Item',
					className: 'adjust-accounts',
					children: [{
						name: 'isCalc',
						component: 'Checkbox',
						checked: "{{data.form.isCalc}}",
						_visible:"{{data.other.isDisplayAuxAcc}}",
						disabled: '{{$disabledState(data.form, "isCalc")}}',
						onClick: `{{function(v){$setField('data.form.isCalc', v.target.checked)}}}`,
						children: '辅助核算'
					},{
						name: 'content',
						component: 'Layout',
						className: 'auxiliary-content',
						_visible: "{{data.form.isCalc && !data.other.isExist}}",
						children: '{{$showisCalc(data.form)}}'
					}]
				},{
					name: 'adjustAccounts2',
					component: 'Form.Item',
					className: 'adjust-accounts-x',
					children: [{
						name: 'isCalcQuantity',
						component: 'Checkbox',
						checked: "{{data.form.isCalcQuantity}}",
						// disabled: '{{!data.form.canDisabledQuantity}}',
						_visible: "{{data.other.multiUnit}}",
						onClick: `{{function(v){$changeAdjustAccounts('isCalcQuantity','unitId','unitList', v.target.checked)}}}`,
						children: '数量核算'
					},{
						name: 'content',
						component: 'Layout',
						className: 'number-content',
						_visible: "{{data.form.isCalcQuantity}}",
						children: [{
							name: 'measurementUnit',
							component: 'Form.Item',
							label: '计量单位',
							children: [{
								name: 'select',
								component: 'Select',
								value: '{{data.form.unitId}}',
								// disabled: '{{!data.form.canDisabledQuantity}}',
								onChange: "{{function(value){$setField('data.form.unitId', value)}}}",
								children: {
									name: 'option',
									component: 'Select.Option',
									value: '{{data.other.unitList[_rowIndex].id}}',
									children: '{{data.other.unitList[_rowIndex].name}}',
									_power: 'for in data.other.unitList'
								},
								dropdownFooter: {
									name: 'add',
									type: 'primary',
									component: 'Button',
									style: { width: '100%', borderRadius: '0' },
									children: '新增',
									onClick: '{{function(){$addCalcList("app-card-unit")}}}'
								},
								style: { width:110 }
							}]
						},{
							name: 'btn',
							className: 'btn',
							component: '::a',
							onClick: '{{$numberAdminClick}}',
							children: '编辑'
						}]
					}]
				},{
					name: 'adjustAccounts3',
					component: 'Form.Item',
					className: 'adjust-accounts-x',
					children: [{
						name: 'isCalcMulti',
						component: 'Checkbox',
						checked: "{{data.form.isCalcMulti}}",
						disabled: '{{!data.form.canDisabledMulti}}',
						_visible: "{{data.other.multiUnit}}",
						onClick: `{{function(v){$changeAdjustAccounts('isCalcMulti','currencyId','currencyList', v.target.checked)}}}`,
						children: '外币核算'
					},{
						name: 'content',
						component: 'Layout',
						className: 'adjust-accounts-content',
						_visible: "{{data.form.isCalcMulti}}",
						children: [{
							name: 'currency',
							component: 'Form.Item',
							label: '默认币种',
							children: [{
								name: 'select',
								component: 'Select',
								disabled: '{{!data.form.canDisabledMulti}}',
								value: '{{data.form.currencyId}}',
								onChange: "{{function(value){$setField('data.form.currencyId', value)}}}",
								children: {
									name: 'option',
									component: 'Select.Option',
									value: '{{data.other.currencyList[_rowIndex].id}}',
									children: '{{data.other.currencyList[_rowIndex].name}}',
									_power: 'for in data.other.currencyList'
								},
								dropdownFooter: {
									name: 'add',
									type: 'primary',
									component: 'Button',
									style: { width: '100%', borderRadius: '0' },
									children: '新增',
									onClick: '{{function(){$addCalcList("app-card-currency")}}}'
								},
								style: { width:110 }
							}]
						},{
							name: 'btn',
							className: 'btn',
							component: '::a',
							onClick: '{{$adjustAdminClick}}',
							children: '编辑'
						}]
					}]
				},{
					name: 'adjustAccounts4',
					component: 'Form.Item',
					className: 'adjust-accounts',
					children: [{
						name: 'isEnable',
						component: 'Checkbox',
						checked: "{{!data.form.isEnable}}",
						// disabled: '{{!data.form.isEndNode || data.other.active == "certificate"||data.form.code=="1001"}}',
						onClick: "{{function(v){$setField('data.form.isEnable', !v.target.checked)}}}",
						children: '停用'
					}]
				}]
			}]
		}
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				name: '',
				code: '',
				balanceDirection: 0,
				isCalc: false,
				isCalcDepartment: false,
				isCalcPerson: false,
				isCalcCustomer: false,
				isCalcSupplier: false,
				isCalcProject: false,
				isCalcInventory: false,
				isCalcBankAccount: false,
				isCalcQuantity: false,
				isCalcMulti: false,
				unitName: '',
				currencyName: '',
				isEnable: true,
				isExCalc1: false,
				isExCalc2: false,
				isExCalc3: false,
				isExCalc4: false,
				isExCalc5: false,
				isExCalc6: false,
				isExCalc7: false,
				isExCalc8: false,
				isExCalc9: false,
				isExCalc10: false,
				isSystem: false,
				isEndNode: true,
				canDisabledQuantity: true,
				canDisabledMulti: true
			},
			other: {
				addonBefore: '',
				isUsed: false,	//是否已使用
				// unitList: [],	//计量单位可选项
				// currencyList: [],	//外币核算可选项
				isExist: false,
				superiorSubject: [],
				isDisplayAuxAcc: true,	//辅助核算项是否显示
				isDisplayBankAccountAux: false,	//银行账号辅助核算是否显示
				codeAndName: null,
				active: 'add',
				error: {},
				loading: true,
				accountRule: {
					"grade1": 4,
					"grade2": 2,
					"grade3": 2,
					"grade4": 2,
					"grade5": 2
				},
			}
		}
	}
}