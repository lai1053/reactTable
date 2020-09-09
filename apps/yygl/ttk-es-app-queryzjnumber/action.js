import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Map, fromJS, toJS, is } from 'immutable'
import {Icon, Tooltip, Dropdown, Menu, Select,Popover} from 'edf-component'
import { message, Modal } from 'antd'
import config from './config'
// import RenderTree from './component/RenderTree'
import utils from "edf-utils";
import moment from 'moment'


class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }

    
    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = this.config.webapi
        injections.reduce('init')
        this.initPage()
    }

    initPage = () => {
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        this.injections.reduce('updateObj', {
            'data.pagination': fromJS(pagination),
        })
        // this.load();
    }

    judgeChoseBill = async (type) => {
        if(type == 'queryCustomer'){
            this.load()
        }
        else if(type == 'exportAssign'){
            // let loading = this.metaAction.gf('data.loading')
            // if (!loading) {
            //     this.injections.reduce('tableLoading', true)
            // }
            const pagination = this.metaAction.gf('data.pagination').toJS()
            const params = {
                entity:{},
                page:{
                    currentPage:pagination.currentPage,
                    pageSize:pagination.pageSize
                }
            }
            const ret = await this.webapi.zjNumber.exportZJ(params);

        }
    }

    setData = (path,val) =>{
        this.injections.reduce('updateSingle', path,val)
    }

    load = async () => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        const pagination = this.metaAction.gf('data.pagination').toJS()
        const params = {
            entity:{},
            page:{
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }
        const ret = await this.webapi.zjNumber.queryNumber(params);
        // if (!this.mounted) return
        if(ret){
            this.injections.reduce('updateObj', {
                'data.list' : fromJS(ret.list),
                'data.pagination' : fromJS(ret.page),
            })
            setTimeout(() => {
                this.onResize()
                this.injections.reduce('tableLoading', false)
            }, 50)
        }else {
            this.injections.reduce('tableLoading', false)
        }

    }

    renderColumns = () => {
        const arr = []
        const column = this.metaAction.gf('data.columns').toJS()
        column.forEach((item, index) => {
                    arr.push({
                        title: item.caption,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width:item.width,
                        render: (text, record) => (this.renderTotalAmount(text, record, item)),
                    })

        })
        // this.metaAction.sf('data.columnsWidth', width)
        //
        return arr
    }

    renderTotalAmount = (text, record, row) => {
        if (row.fieldName === 'totalAmount' && record.limitRate) {
            return <span>
                <Tooltip
                    arrowPointAtCenter={true}
                    placement="top"
                    title={record.limitRate}
                    overlayClassName='inv-tool-tip-warning'>
                    <Icon type="exclamation-circle" className='inv-custom-warning-text' />
                </Tooltip>
                <span style={{ paddingLeft: '5px' }}>{text && row.amount ? utils.number.format(text, 2) : text}</span>
            </span>
        } else {
            return <span title={text && row.amount ? utils.number.format(text, 2) : text}>{text && row.amount ? utils.number.format(text, 2) : text}</span>
        }
    }

    // 显示列设置
    showTableSetting = ({ value, data }) => {
        const columns = this.metaAction.gf('data.columns').toJS()
        this.injections.reduce('updateObj', {
            'data.other.columnDto': fromJS(columns),
            'data.showTableSetting': value
        })
    }

    upDateTableSetting = async ({ value, data }) => {
        console.log('确认',data)
        // const columns = []
        // const TaxpayerNature = this.metaAction.gf('data.TaxpayerNature')
        // const pageID = TaxpayerNature === '0' ? 'batchCustomGeneral' : 'batchCustomSmall'
        // for (const item of data) {
        //     item.isVisible ? columns.push(item.id) : null
        // }
        // const resp = await this.webapi.invoice.upDateColumn({
        //     pageID,
        //     columnjson: JSON.stringify(columns)
        // })
        // if (!this.mounted) return
        // if (resp) {
        //     this.getColumns()
        //     this.injections.reduce('tableSettingVisible', { value })
        // }

    }

    //关闭栏目设置
    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }
    resetTableSetting = async () => {
        alert('重置')
        // const TaxpayerNature = this.metaAction.gf('data.TaxpayerNature')
        // const pageID = TaxpayerNature === '0' ? 'batchCustomGeneral' : 'batchCustomSmall'
        // let res = await this.webapi.invoice.deleteColumn({ pageID })
        // if (!this.mounted) return
        // if (res) {
        //     this.injections.reduce('update', {
        //         path: 'data.showTableSetting',
        //         value: false
        //     })
        //     this.getColumns()
        // }
    }

    //选择数据改变
    checkboxChange = (arr, itemArr,e) => {
        // debugger
        console.log(e)
        let newArr = []
        arr.forEach(item => {
            if (item) {
                newArr.push(item)
            }
        })
        let newItemArr = []
        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        this.injections.reduce('updateObj', {
            'data.customerList':fromJS(arr),
            'data.tableCheckbox':fromJS({
                checkboxValue: newArr,
                selectedOption: newItemArr
            })
        })
        //this.selectedOption = newItemArr
    }

    //分页发生变化
    pageChanged = (current, pageSize) => {
        let { pagination, list } = this.metaAction.gf('data').toJS()
        const len = list.length
        if (pageSize) {
            pagination = {
                ...pagination,
                'currentPage': len === 0 ? 1 : current,
                'pageSize': pageSize
            }
        } else {
            pagination = {
                ...pagination,
                'currentPage': len === 0 ? 1 : current,
            }
        }
        this.injections.reduce('updateObj', {
            'data.loading':true,
            'data.pagination': fromJS(pagination)
        })
        this.load()

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

    btnClick = () => {
        this.injections.reduce('modifyContent')
    }

    getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let appDom = document.getElementsByClassName('inv-app-custom-list')[0]; //以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0]; //table wrapper包含整个table,table的高度基于这个dom
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
                const tbodyWidth = tbodyDom.offsetWidth;
                const columnsWidth = this.metaAction.gf('data.columnsWidth')
                if (num < 0) {
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: columnsWidth > width ? columnsWidth: 1,
                        y: height - theadDom.offsetHeight,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        x: columnsWidth >  width  ? columnsWidth: 1
                    })
                }
            }
        } catch (err) { }
    }
}



export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}

