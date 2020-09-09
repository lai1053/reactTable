export function getMeta() {
	return {
		name: 'root',
		className: 'ttk-scm-app-exchange-accounts',
		component: 'Layout',
		children: [{
			name: 'loading',
			component: 'Spin',
			className: 'ttk-scm-app-exchange-accounts-loading',
			spinning: '{{data.loading}}',
			tip: '数据加载中...',
			size: 'large',
			children: {
				name: 'main',
				component: 'Layout',
				className: 'ttk-scm-app-exchange-accounts-main',
				children: [
					{
						name: 'date',
						component: 'Form.Item',
						label: '单据日期',
						children: [{
							name: 'businessDate',
							component: 'DatePicker',
							allowClear: false,
							disabled: '{{data.other.isEnable}}',
							// className: 'app-proof-of-charge-form-header-date-picker',
							value: '{{data.form.businessDate}}',
							onChange: `{{function(d){$fieldChange('data.form.businessDate', d)}}}`,
							disabledDate: `{{function(current){ return current && current.valueOf() < data.other.disabledDate
							}}}`
						}]
					}, {
						name: 'nameItem',
						component: 'Form.Item',
						label: '单据编号',
						children: [{
							name: 'code',
							component: '::span',
							children: '{{data.form.code}}',
						}]
					}, {
						name: 'accountOut',
						component: 'Form.Item',
						label: '转出账户',
						required: true,
						validateStatus: "{{data.other.error.accountOut?'error':'success'}}",
						help: '{{data.other.error.accountOut}}',
						children: {
							name: 'out',
							component: 'Select',
							showSearch: false,
							disabled: '{{data.other.isEnable}}',
							optionFilterProp: "children",
							value: '{{data.form.bankAccountId}}',
							onChange: `{{function(v){$fieldChange('data.form.bankAccountId',data.other.accountList.filter(function(data){
								return data.id == v})[0].id)}}}`,
							children: {
								name: 'selectItem',
								component: 'Select.Option',
								value: '{{data.other.accountList[_rowIndex].id}}',
								children: '{{data.other.accountList[_rowIndex].name}}',
								_power: 'for in data.other.accountList'
							},
							dropdownFooter: {
								name: 'add',
								component: 'Button',
								type: 'primary',
								style: { width: '100%', borderRadius: '0' },
								children: '新增',
								onClick: '{{function(){$addAccount()}}}'
							},
						}
					}, {
						name: 'inBankAccount',
						component: 'Form.Item',
						label: '转入账户',
						required: true,
						validateStatus: "{{data.other.error.inBankAccount?'error':'success'}}",
						help: '{{data.other.error.inBankAccount}}',
						children: {
							name: 'into',
							component: 'Select',
							showSearch: false,
							disabled: '{{data.other.isEnable}}',
							optionFilterProp: "children",
							value: '{{data.form.inBankAccountId}}',
							onChange: `{{function(v){$fieldChange('data.form.inBankAccountId',data.other.accountList.filter(function(data){return data.id == v})[0].id)}}}`,
							children: {
								name: 'selectItem',
								component: 'Select.Option',
								disabled: '{{data.other.accountList[_rowIndex].id == data.form.bankAccountId}}',
								value: '{{data.other.accountList[_rowIndex].id}}',
								children: '{{data.other.accountList[_rowIndex].name}}',
								_power: 'for in data.other.accountList'
							},
							dropdownFooter: {
								name: 'add',
								component: 'Button',
								type: 'primary',
								style: { width: '100%', borderRadius: '0' },
								children: '新增',
								onClick: '{{function(){$addAccount("in")}}}'
							},
						}
					}, {
						name: 'moneyItem',
						component: 'Form.Item',
						label: '金额',
						required: true,
						validateStatus: "{{data.other.error.amount?'error':'success'}}",
						help: '{{data.other.error.amount}}',
						children: [{
							name: 'amount',
							component: 'Input.Number',
							precision: 2,
							disabled: '{{data.other.isEnable}}',
							className: 'right-item',
							value: '{{$addThousandsPosition(data.form.amount)}}',
							onBlur: "{{function(e){$amountValue('data.form.amount',e)}}}",
							//value: '{{data.form.amount}}',
							// onChange: "{{function(e){$fieldChange('data.form.amount',e)}}}"
						}]
					}, {
						name: 'remarkItem',
						component: 'Form.Item',
						label: '备注',
						children: [{
							name: 'remark',
							component: 'Input.TextArea',
							className: 'textarea',
							disabled: '{{data.other.isEnable}}',
							maxlength: 200,
							value: '{{data.form.remark}}',
							onChange: "{{function(e){$sf('data.form.remark',e.target.value)}}}"
						}]
					}
				]
			}
		},{
			name: 'footer',
			component: '::div',
			className: 'ttk-scm-app-exchange-accounts-footer',
			children: [{
				name: 'cancel',
				component: 'Button',
				children: '取消',
				className: 'cancel',
				onClick: '{{function(){$cancel()}}}'
			}, {
				name: 'save',
				component: 'Button',
				children: '{{data.other.isEnable ? "确定" :"保存"}}',
				type: '{{data.other.isEnable || data.other.type == "edit" ? "primary" : "Default"}}',
				className: 'save btn',
				disabled: '{{ !data.form.code }}',
				onClick: '{{function(){$save()}}}'
			}, {
				name: 'saveNew',
				component: 'Button',
				type: 'primary',
				_visible: '{{!data.other.isEnable && data.other.type != "edit"}}',
				children: '保存并新增',
				className: 'saveNew btn',
				disabled: '{{ !data.form.code }}',
				onClick: '{{function(){$save("saveNew")}}}'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			importId: undefined,
			form: {
				code: undefined, //单据编码
				businessDate: '', //单据日期
				bankAccountId: '', //转出账户
				inBankAccountId: undefined, //转入账户
				amount: '', //金额
				remark: '' //备注
			},
			other: {
				accountList: [], //账户列表
				error: {} //错误信息
			}
		}
	}
}