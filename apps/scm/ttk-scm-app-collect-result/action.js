import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Select, Button, Modal, Icon, PrintOption, FormDecorator, Checkbox } from 'edf-component'
import { fromJS, toJS } from 'immutable'
import utils from 'edf-utils'
import moment from 'moment'
import config from './config'
const Option = Select.Option
// let row = []
import { consts } from 'edf-consts'

const checkboxKey = 'invoiceTypeName';//table的主键
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
    }
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        injections.reduce('init', { dateVisible: this.component.props.dateVisible, vatOrEntry: this.component.props.vatOrEntry })
        if (!this.component.props.dateVisible) {
            //本次采集结果
            if (this.component.props.resultData) {
                
                this.load(this.component.props.resultData)

                if (this.component.props.crossCertificationNum) {
                    this.metaAction.sf('data.crossCertificationNum', this.component.props.crossCertificationNum)
                    this.metaAction.sf('data.invoiceSum', this.component.props.resultData[this.component.props.resultData.length - 1].invoiceSum)
                }
            }

        } else {
            //合计
            this.load()
        }
    }
    refresh = () => {
        this.sortParmas()
    }
    isXgm = () => {
        const { vatOrEntry } = this.component.props;
        //  console.log(vatOrEntry,this.metaAction.context.get("currentOrg").vatTaxpayer) 
        return this.metaAction.context.get("currentOrg").vatTaxpayer != 2000010002 && vatOrEntry == 1
    }
    print = async () => {
        const list = this.metaAction.gf('data.list').toJS()
        if (list.length == 0) {
            this.metaAction.toast('warn', '当前没有可打印的数据！')
            return
        }
        const params = this.sortParmas('get');
        const res = await this.webapi.print(params)
    }

    export = () => {
        const list = this.metaAction.gf('data.list').toJS()
        if (list.length == 0) {
            this.metaAction.toast('warn', '当前没有可导出的数据！')
            return
        }
        const params = this.sortParmas('get');
        const res = this.webapi.export(params);
    }

    load = (res) => {
        if (res) {
            this.injections.reduce('load', { res, isInit: true, dateVisible: false })
            setTimeout(() => {
                this.getTableScroll()
            }, 100)
        } else {
            if (this.component.props.defaultdate) {
                this.injections.reduce('update', {
                    path: 'data.date',
                    value: this.component.props.defaultdate
                })
            }
            this.sortParmas('init')
        }

        if(this.component.props.flag == 'sa' && this.component.props.issuedByTax == false && this.metaAction.context.get("currentOrg").vatTaxpayer == 2000010002) {
            this.metaAction.sf('data.flag', true)
            let allInvoiceSum = 0,allAmountTotal = 0,allAmountAndTaxTotal = 0,allTaxTotal = 0
            for(var i=0;i<res.length;i++){
                if(res[i].invoiceTypeName == '合计' && res[i].month != '第一季度' && res[i].month != '第二季度' && res[i].month != '第三季度' && res[i].month != '第四季度') {
                    allInvoiceSum += res[i].invoiceSum
                    allTaxTotal += res[i].taxTotal
                    allAmountTotal += res[i].amountTotal
                    allAmountAndTaxTotal += res[i].amountAndTaxTotal
                }
            }

            this.metaAction.sfs({
                'data.form.allInvoiceSum': allInvoiceSum.toFixed(0),
                'data.form.allTaxTotal': utils.number.addThousPos(allTaxTotal.toFixed(2)),
                'data.form.allAmountTotal': utils.number.addThousPos(allAmountTotal.toFixed(2)),
                'data.form.allAmountAndTaxTotal': utils.number.addThousPos(allAmountAndTaxTotal.toFixed(2))
            });
        }
        
        setTimeout(() => {
			this.onResize()
		}, 20)
    }

    componentDidMount = () => {
        this.onResize()
        const win = window
        if (win.addEventListener) {
            win.addEventListener('resize', this.onResize, false)
        } else if (win.attachEvent) {
            win.attachEvent('onresize', this.onResize)
        } else {
            win.onresize = this.onResize
        }
    }
    onOk = async () => {
        this.component.props.closeModal();
    }
    dateChange = async (date) => {
        this.injections.reduce('dateChange', date);
        this.sortParmas()
    }

	onResize = (e) => {
		let keyRandomTab = Math.floor(Math.random() * 10000)
		this.keyRandomTab = keyRandomTab
		setTimeout(() => {
			if (keyRandomTab == this.keyRandomTab) {
				this.getTableScroll()
			}
		}, 200)
	}

	getTableScroll = (e) => {
		try {
			let tableOption = this.metaAction.gf('data.tableOption').toJS()
			let appDom=document.getElementsByClassName('ttk-scm-app-collect-result')[0];//以app为检索范围
			let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0];//table wrapper包含整个table,table的高度基于这个dom

			if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
			//ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
			let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
			let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

			if (tbodyDom && tableWrapperDom && theadDom) {
				let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
				const width = tableWrapperDom.offsetWidth;
				const height = tableWrapperDom.offsetHeight;
				if (num < 0) {
					this.injections.reduce('setTableOption', {
						...tableOption,
						y: height - theadDom.offsetHeight,
						x: width - 20
					})
				} else {
					delete tableOption.y
					this.injections.reduce('setTableOption', {
						...tableOption,
						x: width-20
					})
				}
			}
		} catch (err) {
			// console.log(err)
		}
	}
    //渲染列
    renderColumns = () => {
        const vatOrEntry = this.metaAction.gf('data.vatOrEntry');
        const flag = this.metaAction.gf('data.flag');
        if (vatOrEntry == 0) {
            if(flag) {
                return [
                    {
                        title: '月份',
                        key: 'month',
                        dataIndex: 'month',
                        _Visible: '{{data.flag}}',
                        className: 'table_td_align_left',
                        width: 82,
                        render: (text, record, index) => this.RowSpanB(text, record, index)
                    },
                    {
                        title: '发票类型',
                        key: 'type',
                        className: 'table_td_align_left',
                        //  width: 102,
                        dataIndex: 'invoiceTypeName'
                    },
                    {
                        title: '开票份数',
                        key: 'kpfs',
                        children: [
                            {
                                title: '总份数',
                                dataIndex: 'invoiceSum',
                                className: 'table_td_align_right',
                                width: 102,
                                key: 'invoiceSum'
                            },
                            {
                                title: '其中：红字',
                                dataIndex: 'invoiceRedSum',
                                className: 'table_td_align_right',
                                width: 102,
                                key: 'invoiceRedSum'
                            }, {
                                title: '其中：蓝字',
                                dataIndex: 'invoicebuleSum',
                                className: 'table_td_align_right',
                                key: 'invoicebuleSum',
                                width: 102,
                            }
                            , {
                                title: '其中：作废',
                                dataIndex: 'invoiceStateSum',
                                className: 'table_td_align_right',
                                key: 'invoiceStateSum',
                                width: 102,
                            }
                        ]
                    },
                    {
                        title: '金额合计',
                        className: 'table_td_align_right',
                        dataIndex: 'amountTotal',
                        key: 'amountTotal',
                        width: 102,
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'amountTotal')
                    },
                    {
                        title: '税额合计',
                        className: 'table_td_align_right',
                        dataIndex: 'taxTotal',
                        key: 'taxTotal',
                        width: 102,
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'taxTotal')
                    },
                    {
                        title: '价税合计',
                        dataIndex: 'amountAndTaxTotal',
                        className: 'table_td_align_right',
                        key: 'amountAndTaxTotal',
                        width: 102,
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'amountAndTaxTotal')
                    }
                ];
            }else {
                return [
                    {
                        title: '发票类型',
                        key: 'type',
                        className: 'table_td_align_left',
                        //  width: 102,
                        dataIndex: 'invoiceTypeName'
                    },
                    {
                        title: '开票份数',
                        key: 'kpfs',
                        children: [
                            {
                                title: '总份数',
                                dataIndex: 'invoiceSum',
                                className: 'table_td_align_right',
                                width: 102,
                                key: 'invoiceSum'
                            },
                            {
                                title: '其中：红字',
                                dataIndex: 'invoiceRedSum',
                                className: 'table_td_align_right',
                                width: 102,
                                key: 'invoiceRedSum'
                            }, {
                                title: '其中：蓝字',
                                dataIndex: 'invoicebuleSum',
                                className: 'table_td_align_right',
                                key: 'invoicebuleSum',
                                width: 102,
                            }
                            , {
                                title: '其中：作废',
                                dataIndex: 'invoiceStateSum',
                                className: 'table_td_align_right',
                                key: 'invoiceStateSum',
                                width: 102,
                            }
                        ]
                    },
                    {
                        title: '金额合计',
                        className: 'table_td_align_right',
                        dataIndex: 'amountTotal',
                        key: 'amountTotal',
                        width: 102,
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'amountTotal')
                    },
                    {
                        title: '税额合计',
                        className: 'table_td_align_right',
                        dataIndex: 'taxTotal',
                        key: 'taxTotal',
                        width: 102,
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'taxTotal')
                    },
                    {
                        title: '价税合计',
                        dataIndex: 'amountAndTaxTotal',
                        className: 'table_td_align_right',
                        key: 'amountAndTaxTotal',
                        width: 102,
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'amountAndTaxTotal')
                    }
                ];
            }
            
        } else {
            if(flag) {
                return [
                    {
                        title: '月份',
                        key: 'month',
                        dataIndex: 'month',
                        _Visible: '{{data.flag}}',
                        className: 'table_td_align_left',
                        width: 82,
                    },
                    {
                        title: '发票类型',
                        key: 'type',
                        className: 'table_td_align_left',
                        // width: 102,
                        dataIndex: 'invoiceTypeName'
                    },
                    {
                        title: '开票份数',
                        key: 'kpfs',
                        children: [
                            {
                                title: '总份数',
                                dataIndex: 'invoiceSum',
                                width: 102,
                                className: 'table_td_align_right',
                                key: 'invoiceSum'
                            },
                            {
                                title: '其中：红字',
                                dataIndex: 'invoiceRedSum',
                                width: 102,
                                className: 'table_td_align_right',
                                key: 'invoiceRedSum'
                            }, {
                                title: '其中：蓝字',
                                dataIndex: 'invoicebuleSum',
                                width: 102,
                                className: 'table_td_align_right',
                                key: 'invoicebuleSum'
                            }
                        ]
                    },
                    {
                        title: '金额合计',
                        className: 'table_td_align_right',
                        dataIndex: 'amountTotal',
                        width: 102,
                        key: 'amountTotal',
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'amountTotal')
                    },
                    {
                        title: '税额合计',
                        className: 'table_td_align_right',
                        dataIndex: 'taxTotal',
                        width: 102,
                        key: 'taxTotal',
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'taxTotal')
                    },
                    {
                        title: '价税合计',
                        dataIndex: 'amountAndTaxTotal',
                        // width: 102,
                        className: 'table_td_align_right',
                        key: 'amountAndTaxTotal',
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'amountAndTaxTotal')
                    }
                ];
            }else {
                return [
                    {
                        title: '发票类型',
                        key: 'type',
                        className: 'table_td_align_left',
                        // width: 102,
                        dataIndex: 'invoiceTypeName'
                    },
                    {
                        title: '开票份数',
                        key: 'kpfs',
                        children: [
                            {
                                title: '总份数',
                                dataIndex: 'invoiceSum',
                                width: 102,
                                className: 'table_td_align_right',
                                key: 'invoiceSum'
                            },
                            {
                                title: '其中：红字',
                                dataIndex: 'invoiceRedSum',
                                width: 102,
                                className: 'table_td_align_right',
                                key: 'invoiceRedSum'
                            }, {
                                title: '其中：蓝字',
                                dataIndex: 'invoicebuleSum',
                                width: 102,
                                className: 'table_td_align_right',
                                key: 'invoicebuleSum'
                            }
                        ]
                    },
                    {
                        title: '金额合计',
                        className: 'table_td_align_right',
                        dataIndex: 'amountTotal',
                        width: 102,
                        key: 'amountTotal',
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'amountTotal')
                    },
                    {
                        title: '税额合计',
                        className: 'table_td_align_right',
                        dataIndex: 'taxTotal',
                        width: 102,
                        key: 'taxTotal',
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'taxTotal')
                    },
                    {
                        title: '价税合计',
                        dataIndex: 'amountAndTaxTotal',
                        // width: 102,
                        className: 'table_td_align_right',
                        key: 'amountAndTaxTotal',
                        render: (text, record, index) => this.normalTdRender(text, record, index, 'amountAndTaxTotal')
                    }
                ];
            }
            
        }
    }
    normalTdRender = (text, record, index, key) => {
        return <span className="ttk-table-app-list-td-con" title={this.transformThoundsNumber(text, key)}>{this.transformThoundsNumber(text, key)}</span>
    }


    RowSpanB = (text, row, index) => {
        let obj 
        return obj = {
            children: <span title={text}>{text}</span>,
            props: {
                rowSpan: this.calcRowSpan(row.month, 'month', index),
            }
        }   
    }
    // 计算 row
    calcRowSpan = (text, columnKey, currentRowIndex) => {
		const list = this.metaAction.gf('data.list')
		if (!list) return
		const rowCount = list.size
		if (rowCount == 0 || rowCount == 1) return 1
		if (currentRowIndex > 0
			&& currentRowIndex <= rowCount
			&& text == list.getIn([currentRowIndex - 1, columnKey])) {
			return 0
		}
		let rowSpan = 1
		for (let i = currentRowIndex + 1; i < rowCount; i++) {
			if (text == list.getIn([i, columnKey]))
				rowSpan++
			else
				break
		}
		return rowSpan
    }


    //数字的转化
    transformThoundsNumber = (text, key) => {
        if (text == 0) {
            return '0.00'
        }
        const arr = ['amountTotal', 'taxTotal', 'amountAndTaxTotal', 'price']
        if (arr.includes(key)) {
            if (!text || parseFloat(text) == 0 || isNaN(parseInt(text))) {
                return ''
            }
            if (key == 'price') {
                return utils.number.format(text, 6)
            } else {
                return utils.number.format(text, 2)
            }
        } else {
            return text
        }
    }
    renderRowClassName = (record, index) => {
        if (record[checkboxKey] == '合计') {
            return 'tr_heji'
        }
        else {
            return 'tr_normal'
        }
    }
    sortParmas = (type) => {
        const voucherMoment = moment(this.metaAction.gf('data.date'))
        const vatOrEntry = this.metaAction.gf('data.vatOrEntry');
        let date = voucherMoment.format('YYYY-MM');//当前月份
        let begin = moment(date).startOf('month').format('YYYY-MM-DD HH:mm:ss')//起始日期
        let end = moment(date).endOf('month').format('YYYY-MM-DD HH:mm:ss')//结束日期

        let params = {
            countFlag: 0,
            vatOrEntry,
            begin,
            end
        }
        if (type == 'get') {
            return { ...params }
        } else if (type == 'init') {
            this.initData(params)
        } else {
            this.requestData(params)
        }
    }

    //初始化数据
    initData = async (params) => {
        let res = await this.webapi.queryInvoiceSum(params);
        this.injections.reduce('load', { res: res.list, puArrivalAuthenticat: res.puArrivalAuthenticat })
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }
    //请求数据
    requestData = async (params) => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        let res = await this.webapi.queryInvoiceSum(params)
        this.injections.reduce('load', { res: res.list, puArrivalAuthenticat: res.puArrivalAuthenticat })
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    tableOnchange = async (pagination, filters, sorter) => {
        // const { checkboxKey, order } = sorter
        // const response = await this.webapi.report.query(sorter)
        // this.injections.reduce('tableOnchange', response.value.details)
    }

    componentWillUnmount = () => {
        // if (this.dateDom) {
        //     this.dateDom.removeEventListener('click', this.rangePickerClick)
        // }
        if (this.props && this.props.isFix === true) return
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
        } else {
            win.onresize = undefined
        }
    }

    disabledRangePicker = (currentDate) => {
        return currentDate.format('YYYYMM') < moment(this.component.props.enableddate).format('YYYYMM')
        //|| currentDate.format('YYYYMM') > moment().format('YYYYMM')
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),//装饰器 使用metaAtjion为参数 实现扩展
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
