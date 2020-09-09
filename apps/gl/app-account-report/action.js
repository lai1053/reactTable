import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { TableOperate } from 'edf-component'
import { Checkbox } from 'antd'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        this.load()
    }

    load = async () => {
        const response = await this.webapi.report.query()
        this.injections.reduce('load', response.value.details)
    }
    
    tableOnchange = async(pagination, filters, sorter) => {
        const { columnKey, order } = sorter
        const response = await this.webapi.report.query(sorter)
        this.injections.reduce('tableOnchange', response.value.details)
    }

    sortChange=(key, value)=>{
        this.injections.reduce('sortReduce', key, value)
    }

    rowSelection = (text, row, index) => {
    }

    operateCol = (text, record) => {
        const { status } = record
        return (
            <TableOperate
                viewClick={() => console.log('触发了查看')}
                editClick={() => console.log('触发了编辑')}
                deleteClick={() => console.log('触发了删除')}
                status={status == 128 ? 1 : 2}
            />
        )
    }

    cellRender = (columnKey) => (text, row, rowIndex) => {
        if (columnKey == 'dept1')
            return this.dept1Render(text, row, rowIndex)
        else if (columnKey == 'dept2')
            return this.dept2Render(text, row, rowIndex)
        else if (columnKey == 'dept3')
            return this.dept3Render(text, row, rowIndex)
        else {
            const reportDS = this.metaAction.gf('data.reportDS')
            var className = 'app-account-report-cell-right'
            const isTotalRow = reportDS.getIn([rowIndex, 'dept1']) == '合计' || reportDS.getIn([rowIndex, 'dept2']) == '小计'
            if (isTotalRow)
                className += ' app-account-report-total-cell'
            return {
                children: <div className={className}>{text}</div>,
            }
        }
        let arr = mergeCellData.split(';')
        arr.length && arr.reverse()

        for (let i = 0; i < arr.length; i++) {
            var temp = arr[i].match(/\[\d+,\d+\]/g);
            for (let j = 0; j < temp.length; j++) {
                mergeCellsList.push({
                    row: JSON.parse(temp[j]),
                    col: [i]
                })
            }
        }

        return mergeCellsList
    }

    rowSpan = (text, row, index) => {
        const obj = {
            children: <span>{text}</span>,
            props: {
                rowSpan: this.calcRowSpan(text, 'voucherDate', index),
            },
        }

        return obj
    }

    rowSpan2 = (text, row, index) => {
        const num = this.calcRowSpan(text, 'docCode', index)
        const obj = {
            children: <span className="table-needDel" data-rol={num}>{text}</span>,
            props: {
                rowSpan: num,
            },
        }

        return obj
    }

    rowSpan4 = (text, row, index) => {
        const obj = {
            children: <span>{text}</span>,
            props: {
                rowSpan: this.calcRowSpan(text, 'docCode', index),
            },
        }

        return obj
    }


    cellRender = (columnKey) => (text, row, rowIndex) => {
        if (columnKey == 'dept1')
            return this.dept1Render(text, row, rowIndex)
        else if (columnKey == 'dept2')
            return this.dept2Render(text, row, rowIndex)
        else if (columnKey == 'dept3')
            return this.dept3Render(text, row, rowIndex)
        else {
            const list = this.metaAction.gf('data.list')
            var className = 'app-account-report-cell-right'
            const isTotalRow = list.getIn([rowIndex, 'dept1']) == '合计' || list.getIn([rowIndex, 'dept2']) == '小计'
            if (isTotalRow)
                className += ' app-account-report-total-cell'
            return {
                children: <div className={className}>{text}</div>,
            }
        }
    }

    isTotalRow = (rowIndex) => {

    }


    calcRowSpan(text, columnKey, currentRowIndex) {
        const list = this.metaAction.gf('data.list')
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

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}