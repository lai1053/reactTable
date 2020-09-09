import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import extend from './extend'
import config from './config'
import { FormDecorator, Select, Icon } from 'edf-component'
import { fromJS, Set } from "immutable"

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
    }
    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        const { initData } = this.component.props
        injections.reduce('init', initData)
        this.injections.reduce('tableLoading', true)
        this.load(initData);
    }

    /**
     * 加载
     */
    load = async (initData) => {
        let response = await this.webapi.profitlossaccountsset.init(initData)
        this.extendAction.gridAction.cellAutoFocus()
        this.injections.reduce('tableLoading', false)
        this.injections.reduce('load', response)

        setTimeout(() => {
            this.onResize()
        }, 100)
    }

    /**
     * 科目过滤
     */
    filterOption = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }

    /**
     * 页签切换
     */
    tabChange = (path, value) => {
        this.metaAction.sf(path, value)
    }

    /**
     * 取消
     */
    handleCancel = async () => {
        this.component.props.closeModal(true)
    }

    /**
    * 重置
    */
    handleReset = async () => {
        const { initData } = this.component.props
        const res = await this.webapi.profitlossaccountsset.reset(initData)
        if (res) {        
            this.injections.reduce('load', res)
        }
    }

    /**
     * 保存
     */
    handleSave = async () => {
        let profitLoss = this.metaAction.gf('data.profitLossList'),
            assetLiability = this.metaAction.gf('data.assetLiabilityList'),
            { initData } = this.component.props
        if (profitLoss && profitLoss.size > 0) {
            const firstElement = profitLoss.get(0)
            //补全数据结构，否则nodejs会过滤掉，导致后面有值的列无法接收到数据
            if (!firstElement.get('accountId')) {
                profitLoss = profitLoss.update(0, item => item.set(`accountId`, null))
            }
            if (!firstElement.get('"profitLossType')) {
                profitLoss = profitLoss.update(0, item => item.set(`"profitLossType`, null))
            }
            if (!firstElement.get('assetLiabilityType')) {
                profitLoss = profitLoss.update(0, item => item.set(`assetLiabilityType`, null))
            }
        }
        let isEmptyData = false
        for (let index = 0; index < assetLiability.size; index++) {
            const element = assetLiability.get(index)
            if (!element.get('accountId')) {
                isEmptyData = true
                break
            }
        }
        if (isEmptyData) {
            this.metaAction.toast('warning', '科目数据不能为空,请重新选择')
            return
        }
        let assetAccount = assetLiability.map((element) => {
            return element.get('accountId')
        })
        if (Set(assetAccount.toJS()).size != assetLiability.size) {
            this.metaAction.toast('warning', '结转科目数据重复,请重新选择')
            return
        }
        const res = await this.webapi.profitlossaccountsset.save({ ...initData, profitLoss, assetLiability })
        if (res) {
            this.metaAction.toast('success', '保存成功')
            this.component.props.closeModal('save')
        }
    }

    /**
     * 科目选择
     */
    onSubjectSelect = async (colType, rowIndex, v) => {
        if (colType == 'profitlossAccount') {
            let details = this.metaAction.gf('data.profitLossList')
            details = details.update(rowIndex, item => item.set(`accountId`, v))
            this.injections.reduce('update', { path: 'data.profitLossList', value: details })
        } else {
            let details = this.metaAction.gf('data.assetLiabilityList')
            details = details.update(rowIndex, item => item.set(`accountId`, v))
            this.injections.reduce('update', { path: 'data.assetLiabilityList', value: details })
        }
    }

    /**
     * 按钮状态
     */
    isDisabled = () => {
        let profitLoss = this.metaAction.gf('data.profitLossList'),
            assetLiability = this.metaAction.gf('data.assetLiabilityList')

        return (profitLoss.size > 0 || assetLiability.size > 0) ? false : true
    }

    /**
     * keydown事件
     */
    gridKeydown = (e) => {
        this.extendAction.gridAction.gridKeydown(e)
        if (e.keyCode == 40) {
            this.extendAction.gridAction.cellAutoFocus()
        }
    }

    /**
     * 合并属性列
     */
    rowSpan = (text, columnKey, currentRowIndex, list) => {
        if (!list) return
        const rowCount = list.size
        if (rowCount == 0 || rowCount == 1) return 1

        if (currentRowIndex > 0
            && currentRowIndex <= rowCount
            && text == list.getIn([currentRowIndex - 1, columnKey])) {
            return 0
        }
        var rowSpan = 1
        for (let i = currentRowIndex + 1; i < rowCount; i++) {
            if (text == list.getIn([i, columnKey]))
                rowSpan++
            else
                break
        }

        return rowSpan
    }

    /**
     * 渲染单元格
     */
    renderCell = (columnName, index, value, record) => {
        let dataList = this.metaAction.gf('data.assetLiabilityList'),
            assetAccountList = this.metaAction.gf('data.other.assetAccountList'),
            liabilitiesAccountList = this.metaAction.gf('data.other.liabilitiesAccountList'),
            disabledDel1 = dataList.filter(item => item.get('assetLiabilityType') == 1).size == 1 ? true : false,
            disabledDel2 = dataList.filter(item => item.get('assetLiabilityType') == 2).size == 1 ? true : false,
            disabledDelIcon = record.assetLiabilityType == 1 ? disabledDel1 : disabledDel2
        if (columnName == 'propertyName') {
            const num = this.rowSpan(value, 'propertyName', index, dataList)
            const obj = {
                children: <span title={value}>{value}</span>,
                props: {
                    rowSpan: num,
                },
            }
            return obj
        }
        if (columnName == 'orderNum') {
            return (
                <div className="orderno">
                    <div className="num">{record.orderNum}</div>
                    <div className="addAndMinus">
                        <Icon type="plus-circle-o"
                            className="addIcon"
                            onClick={() => this.addRow(record.assetLiabilityType, record)} />
                        <Icon type="minus-circle-o"
                            className="delIcon"
                            onClick={() => this.delRow(index, disabledDelIcon)}
                            disabled={disabledDelIcon} />
                    </div>
                </div>
            )
        } else
            if (columnName == 'accountId') {
                const dataSource = record.assetLiabilityType == 1 ? assetAccountList : liabilitiesAccountList
                return (
                    <div style={{ width: '100%' }}>
                        <Select style={{ width: '100%' }}
                            onSelect={(value) => this.onSubjectSelect('assetLiability', index, value)}
                            value={value}
                            filterOption={(inputValue, option) => this.filterOption(inputValue, option)}
                        // onFocus={handleFocus}
                        >
                            {
                                dataSource.map((item, index) => {
                                    return (<Option key={item.get('accountId')} title={item.get('codeAndName')} _data={item} value={item.get('accountId')}>{item.get('codeAndName')}</Option>)
                                })
                            }
                        </Select>
                    </div>
                )
            }
    }

    /**
     * 新增
     */
    addRow = (type, record) => {
        let list = this.metaAction.gf('data.assetLiabilityList').toJS(),
            assetList = list.filter(item => item.assetLiabilityType == 1),
            liabilityList = list.filter(item => item.assetLiabilityType == 2),
            lastIndex = 0
        if (type == 1) {
            lastIndex = assetList.length
            assetList.splice(lastIndex, 0,
                {
                    accountId: null,
                    assetLiabilityType: 1,
                    orderNum: lastIndex + 1,
                    propertyName: "货币性资产"
                }
            )
        } else {
            lastIndex = liabilityList.length
            liabilityList.splice(lastIndex, 0,
                {
                    accountId: null,
                    assetLiabilityType: 2,
                    orderNum: lastIndex + 1,
                    propertyName: "货币性负债"
                }
            )
        }
        this.metaAction.sf('data.assetLiabilityList', fromJS([...assetList, ...liabilityList]))
        setTimeout(() => {
            this.onResize()
        }, 100)
    }

    /**
     * 删除
     */
    delRow = (index, disabledDelIcon) => {
        if (disabledDelIcon) {
            return false
        }
        let list = this.metaAction.gf('data.assetLiabilityList').toJS()
        list.splice(index, 1)
        list = this.sortList(list)
        this.metaAction.sf('data.assetLiabilityList', fromJS(list))
        setTimeout(() => {
            this.onResize()
        }, 100)
    }

    /**
     * 排序
     */
    sortList = (list) => {
        if (list) {
            let i = 0, j = 0
            list.map((item, index) => {
                if (item.assetLiabilityType == 1) {
                    item.orderNum = ++i
                }
                if (item.assetLiabilityType == 2) {
                    item.orderNum = ++j
                }
            })
        }
        return list
    }

    mouseEnter = () => {
        return {
            className: 'operation'
        }
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = undefined
        }
    }

    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('tablebody', 'ant-table-thead', 2, 'ant-table-body', 'data.tableOption', e)
            }
        }, 200)
    }

    getTableScroll = (contaienr, head, num, target, path, e) => {
        try {
            const tableCon = document.getElementsByClassName(contaienr)[0]
            if (!tableCon) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll(contaienr, head, num, target, path)
                }, 500)
                return
            }
            const header = tableCon.getElementsByClassName(head)[0]
            const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
            const pre = this.metaAction.gf(path).toJS()
            const y = tableCon.offsetHeight - header.offsetHeight - num
            const bodyHeight = body.offsetHeight
            if (bodyHeight > y && y != pre.y) {
                this.metaAction.sf(path, fromJS({ ...pre, y }))
            } else if (bodyHeight < y && pre.y != null) {
                this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            } else {
                return false
            }
        } catch (err) {

        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction, extendAction }),
        ret = { ...metaAction, ...voucherAction, ...extendAction.gridAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}   