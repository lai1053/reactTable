export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'inv-app-new-invoices-card',
		children: [{
			name: 'demo',
			component: '::span',
			className: 'inv-app-new-invoices-card-div',
			children: [{
				name: 'tips',
				component: '::div',
				children:{
					name:'spin',
					component:'Spin',
					tip:'加载中...',
					delay:0.01,
					spinning:'{{data.loading}}',
					children:'{{$rendeInvoices()}}'
				}
			}
			]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			loading:true,
			form:{
				bdzt:true,
				fphm:'',
				fpdm:'',
				kprq:'',
				fplyLx: "2", //  发票来源类型，1：读取，2：录入，3：导入
				sf01: "", //Y：专票，N：普票
				//jzjtbz: "N",
				fpztDm: '1', //           "fpztDm": "1",                   -- 发票状态代码，1：正常，2：作废，3：异常，4：失控
				//showDetailListButton:'1',  // 明细清单按钮
				mxDetailList:[{mxxh: 0,key:'0'}, {mxxh: 1,key:'1'}, {mxxh: 2,key:'2'}, {mxxh: 3,key:'3'}, {mxxh: 4,key:'4'}, {mxxh: 5,key:'5'}, {mxxh: 6,key:'6'}, {mxxh: 7,key:'7'}, {mxxh: 8,key:'8'}],
				bdlyLx:'1', //申报用途
				dkyf:'', // 抵扣月份
				jzjtDm:'N',//即征即退代码
				jsfsDm:'', // 计税方式代码
				fpfs:'1', //开票张数
			},
			error:{
				fphm:'',
				fpdm:'',
				kprq:'',
				jshj:'',
				zbslv:''
			},
			ComsState :{
				name: '',
				purchaseNsrxbh: '',
				name2: '',
				purchaseNsrxbh2: '',
				xsName: '',
				xsNsrxbh: '',
				xsName2: '',
				xsNsrxbh2: '',
				jxfs: '',
				bz: '',
				zf: '',
				kpr: '',
				je: '',
				cllx: false
			},
			editCellData: {
				dataSource: [{mxxh: 0}, {mxxh: 1}, {mxxh: 2}, {mxxh: 3}, {mxxh: 4}, {mxxh: 5}, {mxxh: 6}, {mxxh: 7}, {mxxh: 8}],
				count: '',
				width: '',
				height:'',
				scroll: '',
				showFullScreen: true,
				fluctuateCell: {
					width: 60,
					flexGrow: "6%",
					className: "inv-detail"
				}
			},
			errorList: [],
			slList : [], //税率列表
			jsfsRes : [], // 计税方式
			spbmRes :[], //商品信息
			hwlxRes : [], // 货物类型
			jsfsList:[],
			ticketTypes:[], // 客票类型
			sbytcsList : [{
				name:1,
				value:2
			}], //申报用途
		}
	}
}