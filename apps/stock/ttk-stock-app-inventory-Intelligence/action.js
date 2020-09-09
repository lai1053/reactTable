import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import StockAppInventoryIntelligence from '../components/StockAppInventoryIntelligence'

class action {
    constructor (option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }
    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({component, injections})
        this.component = component
        this.injections = injections
        // this.component.props.setOkListener(this.onOk)
        injections.reduce('init')
        // this.load()
        // this.getColumns()
    }

    renderPage = () => {
        return (
            <StockAppInventoryIntelligence
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}
                canRepeat={this.component.props.canRepeat}
                setOkListener={this.component.props.setOkListener}
            >
            </StockAppInventoryIntelligence>
        )
    }

    stockLoading=()=>stockLoading()

    getColumns = async () => {
        const columns = this.metaAction.gf('data.columnData') && this.metaAction.gf('data.columnData').toJS() || []
        this.metaAction.sf('data.columns', fromJS(columns))
    }
    onSearch = (path, data) => {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(()=>{
            this.metaAction.sf(path, data)
            this.reload()
        }, 500)
    }
    resetForm = () => {
        this.metaAction.sf('data.form.constom', '')
    }
    filterList = () => {
        this.metaAction.sf('data.showPopoverCard', false)
        this.reload()
    }
    load = async () => {
        this.selectNameList = sessionStorage['inventoryNameList']
        this.metaAction.sfs({
            'data.other.loading': true,
            'data.loading': true
        })
        let reqList = {
            'code': this.metaAction.gf('data.inputVal'),
            'name': this.metaAction.gf('data.form.constom'),
        }
        const response = await this.webapi.operation.query(reqList)
        let propertyDetailFilter=await this.webapi.operation.findInventoryEnumList()
        
        this.injections.reduce('load', response,propertyDetailFilter)
        this.metaAction.sfs({
            'data.other.loading': false,
            'data.loading': false,
        })
    }
    reload = async () => {
        this.metaAction.sfs({
            'data.other.loading': true,
            'data.loading': true
        })
        let reqList = {
            'code': this.metaAction.gf('data.inputVal'),
            'name': this.metaAction.gf('data.form.constom'),
        }
        const response = await this.webapi.operation.query(reqList)
        this.injections.reduce('reload', response)
        this.metaAction.sf('data.selectedRowKeys', fromJS([]))
        this.metaAction.sfs({
            'data.other.loading': false,
            'data.loading': false,
        })
    }
    renderTotalAmount = (text, record, row) => {
        return <span title={typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}>{typeof text === 'number' && row.amount ? utils.number.format(text, 2) : text}</span>
    }
    renderColumns = () => {
        const arr = []
        const column = this.metaAction.gf('data.columns') && this.metaAction.gf('data.columns').toJS() ||[]
        column.forEach((item, index) => {
            if (item.isVisible) {
                arr.push({
                    title: item.caption,
                    dataIndex: item.fieldName,
                    key: item.fieldName,
                    width: item.width,
                    align: item.align,
                    className: item.className,
                    render: (text, record) => (this.renderTotalAmount(text, record, item))
                })
            }
        })
        return arr
    }
    rowSelection = () => {
        let selectedRowKeys = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
        return {
            selectedRowKeys,
            getCheckboxProps: row => {
                return({
                    disabled: this.selectNameList.indexOf(row.inventoryId) > -1 && !this.component.props.canRepeat ? true : false , // row是一行的数据，就是后台返回的list中的一条数据
                })
            },
            onSelect: (record, selected, selectedRows, nativeEvent) => {
                if (selected) {
                    selectedRowKeys.push(record.inventoryId)
                } else {
                    selectedRowKeys = selectedRowKeys.filter((v) => v !== record.inventoryId && record.inventoryId)
                }
                this.metaAction.sf('data.selectedRowKeys',fromJS(selectedRowKeys))
            },
            onSelectAll: (selected, selectedRows, changeRows) => {            
                selectedRowKeys = selected ? selectedRows.map(v=> v.inventoryId) : []                
                this.metaAction.sf('data.selectedRowKeys',fromJS(selectedRowKeys))
            }
        }
    }
    onOk = async () => {
        return await this.save()
    }
    save = async () => {
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS() || []
        let selectedRowKeys = this.metaAction.gf('data.selectedRowKeys') && this.metaAction.gf('data.selectedRowKeys').toJS() || []
        let arr = []
        list.forEach(item => {
            selectedRowKeys.forEach(data => {
                if (data == item.inventoryId) {
                    arr.push(item)
                }
            })
        })
        
        return arr
    }
    addrow = (ps) => {
        this.injections.reduce('addEmptyRow', ps.rowIndex + 1)
    }
    delrow = (ps) => {
        const list = this.metaAction.gf('data.list')
        const id = list.getIn([ps.rowIndex, 'id'])
        this.injections.reduce('delrow', id)
    }
    mousedown = (e) => {
        const path = utils.path.findPathByEvent(e)
        if (this.metaAction.isFocus(path)) return

        if (path.indexOf('cell.cell') != -1) {
            this.focusCell(this.getCellInfo(path))
        } else {
            if (!this.metaAction.focusByEvent(e)) return
            setTimeout(this.cellAutoFocus, 16)
        }
    }
    getCellInfo (path) {
        const parsedPath = utils.path.parsePath(path)

        const rowCount = this.metaAction.gf('data.list').size
        const colCount = 4
        var colKey = parsedPath.path
            .replace('root.children.table.columns.', '')
            .replace('.cell.cell', '')
            .replace(/\s/g, '')

        return {
            x: colKeys.findIndex(o => o == colKey),
            y: Number(parsedPath.vars[0]),
            colCount,
            rowCount,
        }
    }
    handleChangeHwmc = (rowIndex, v) => {
        let obj
        if (v instanceof Object) {
            let hwmc = v.name
            obj = {
                [`data.list.${rowIndex}.hwmc`]: hwmc, //商品名称
            }
        } else {
            obj = {
                [`data.list.${rowIndex}.hwmc`]: v,
            }
        }
        this.injections.reduce('updateSfs', obj)
    }
    focusCell (position) {
        this.metaAction.sfs({
            'data.other.focusFieldPath': `root.children.table.columns.${colKeys[position.x]}.cell.cell,${position.y}`,
            'data.other.scrollToRow': position.y,
            'data.other.scrollToColumn': position.x
        })

        setTimeout(this.cellAutoFocus, 16)
    }
    cellAutoFocus = () => {
        utils.dom.gridCellAutoFocus(this.component, '.editable-cell')
    }
    
    getCellClassName = (path) => {
        return this.metaAction.isFocus(path) ? 'ttk-edf-app-operation-cell editable-cell' : ''
    }
    isFocusCell = (ps, columnKey) => {
        const focusCellInfo = this.metaAction.gf('data.other.focusCellInfo')
        if (!focusCellInfo)
            return false
        return focusCellInfo.columnKey == columnKey && focusCellInfo.rowIndex == ps.rowIndex
    }
    selectRow = (rowIndex) => (e) => {
        this.injections.reduce('selectRow', rowIndex, e.target.checked)
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid')
        this.metaAction.sf('data.select',selectedArrInfo.length)
    }
    handlePopoverVisibleChange = (visible) => {
        if (visible) {
            const { filterForm } = this.metaAction.gf('data') && this.metaAction.gf('data').toJS() || {}
            this.metaAction.sf('data.formContent', fromJS(filterForm))
        }
        this.metaAction.sf('data.showPopoverCard', visible)
    }
    gridBirthdayOpenChange = (status) => {
        if (status) return
        const editorDOM = ReactDOM.findDOMNode(this.component).querySelector(".editable-cell")
        if (!editorDOM) return

        if (editorDOM.className.indexOf('datepicker') != -1) {
            const input = editorDOM.querySelector('input')
            input.focus()
        }
    }
}
export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}