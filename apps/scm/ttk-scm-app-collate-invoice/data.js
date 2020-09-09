import moment from 'moment'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-collate-invoice',
		children: [
			{
				name: 'mail',
				component: 'Spin',
				tip: '加载中...',
				spinning: '{{data.loading}}',
				children: {
					name: 'form',
					component: 'Form',
					className: 'ttk-scm-app-collate-invoice-form',
					children: [
						{
							name: 'barItem',
							component: '::div',
							className: '{{data.accountEnableDto.currentAccount===1? "ttk-scm-app-collate-invoice-form-bar":"ttk-scm-app-collate-invoice-form-bar enablingMode"}}',
							children: [
								{
									name: 'step1',
									component: '::div',
									className: 'ttk-scm-app-collate-invoice-form-bar-step',
									// _visible: '{{data.selectedOption.length}}',
									children: [
										{
											name: 'title',
											className: 'ttk-scm-app-collate-invoice-form-bar-step-icon active',
											component: '::div',
											children: ['1']
										},
										{
											name: 'description',
											component: '::span',
											className: 'ttk-scm-app-collate-invoice-form-bar-step-description active',
											children: ['结算方式确认']
										}
									]
								},
								{
									name: 'line1',
									className: '{{data.other.step >= 2 ? "ttk-scm-app-collate-invoice-form-bar-line active" : "ttk-scm-app-collate-invoice-form-bar-line"}}',
									component: '::span',
									// _visible: '{{data.selectedOption.length}}',
								},
								{
									name: 'step2',
									component: '::div',
									className: 'ttk-scm-app-collate-invoice-form-bar-step',
									_visible: '{{data.accountEnableDto.currentAccount===1}}',
									children: [
										{
											name: 'title',
											className: '{{ data.other.step>=2 ? "ttk-scm-app-collate-invoice-form-bar-step-icon active" : "ttk-scm-app-collate-invoice-form-bar-step-icon" }}',
											component: '::div',
											children: ['2']
										},
										{
											name: 'description',
											component: '::span',
											className: "{{data.other.step>=2 ? 'ttk-scm-app-collate-invoice-form-bar-step-description active' : 'ttk-scm-app-collate-invoice-form-bar-step-description' }}",
											children: ['往来科目确认']
										}
									]
								},
								{
									name: 'line2',
									className: '{{data.other.step >= 3 ? "ttk-scm-app-collate-invoice-form-bar-line active" : "ttk-scm-app-collate-invoice-form-bar-line"}}',
									component: '::span',
									_visible: '{{data.accountEnableDto.currentAccount===1}}',
								},
								{
									name: 'step3',
									component: '::div',
									className: 'ttk-scm-app-collate-invoice-form-bar-step',
									children: [
										{
											name: 'title',
											className: '{{ data.other.step==3 ? "ttk-scm-app-collate-invoice-form-bar-step-icon active" : "ttk-scm-app-collate-invoice-form-bar-step-icon" }}',
											component: '::div',
											children: ['{{data.accountEnableDto.currentAccount===0?"2":"3"}}']
										},
										{
											name: 'description',
											component: '::span',
											className: "{{data.other.step==3 ? 'ttk-scm-app-collate-invoice-form-bar-step-description active' : 'ttk-scm-app-collate-invoice-form-bar-step-description' }}",
											children: ['{{data.other.vatOrEntry===0?"收入科目确认":"存货科目确认"}}']
										}
									]
								}
							]
						},
						{
							name: 'settlement',
							component: "::div",
							className: 'ttk-scm-app-collate-invoice-form-settlement',
							_visible: '{{data.other.step==1}}',
							children: '{{$renderAccount("settlement")}}'
						},
						{
							name: 'current',
							component: "::div",
							className: 'ttk-scm-app-collate-invoice-form-current',
							_visible: '{{data.other.step==2}}',
							children: '{{$renderAccount("current")}}'
						},
						{
							name: 'inventoty',
							component: "::div",
							className: 'ttk-scm-app-collate-invoice-form-inventoty',
							_visible: '{{data.other.step==3}}',
							required: true,
							children: '{{$renderAccount("inventoty")}}'
						},
					]
				}
			},
			{
				name: 'footer',
				component: '::div',
				className: 'ttk-scm-app-collate-invoice-footer',
				children: [{
					name: 'btnGroup',
					component: '::div',
					className: 'ttk-scm-app-collate-invoice-footer-btnGroup',
					children: [
						{
							name: 'save',
							component: 'Button',
							_visible: '{{data.other.step !== 1}}',
							className: 'ttk-scm-app-collate-invoice-footer-btnGroup-item',
							children: '保存',
							onClick: '{{function(){$save()}}}',
						},
						{
							name: 'cancel',
							component: 'Button',
							//_visible: '{{$isShowPreStep()}}',
							_visible: '{{data.other.step !== 1}}',
							className: 'ttk-scm-app-collate-invoice-footer-btnGroup-item',
							children: '上一步',
							onClick: '{{$lastStep}}',
						},
						{
							name: 'confirm',
							component: 'Button',
							className: '{{data.other.step<3?"ttk-scm-app-collate-invoice-footer-btnGroup-item":"ttk-scm-app-collate-invoice-footer-btnGroup-item getvoucher"}}',
							type: 'primary',
							children: "{{data.other.step<3? '下一步' : '生成凭证'}}",
							onClick: '{{$nextStep}}'
						}
					]
				}]
			},
		]
	}
}

export function getInitState(option) {
	let state = {
		data: {
			loading: false,
			list: [],
			accountEnableDto: {},
			other: {
				step: 1,
				bankAccount: [],//结算方式组数， 结算科目要用
				selectOptionSettle: [], //结算科目 勾选的 点击下一步要用
				wlneedList: [], //结算科目 勾选的 点击下一步 传给往来科目的数组要用
				selectBatchSettleId: '', //结算科目 批量修改结算方式 所选的那个id
				selectBatchSettleObj: {},//结算科目 批量修改结算方式 所选的那个整个对象
				isFinishSettle: false, // 第一步是否全部结算
				vatOrEntry: 0,
				queryAccount:{
					allList:[],
					noMachedList:[]
				}
			},
			selectedOption: [],
			inventoryAccountInitData: {},
			inventoryAccount: [],
			inventory: [],
			inventoryAll: [],
			inventoryName: null,
			onlyNotMatch: true,
			inventoryAccountLoading: false
		}
	}
	return state
}