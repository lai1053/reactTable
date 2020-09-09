import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { DataGrid } from 'edf-component'


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
    }

    getListColumns = () => {
        let { Column, Cell } = DataGrid
        const columns = this.getColumns()
        let list = this.metaAction.gf('data.list').toJS()

        let cols = []
        columns.forEach(op => {
            let col = <Column name={op.id} isResizable={false} columnKey={op.id} flexGrow={1} width={op.width}
                header={<Cell name='header'
                    className="edf-company-manage-headerBgColor">{op.columnName}</Cell>}
                cell={(ps) => {
                    if (op.name == "name") {
                        return <Cell style={{borderLeft: '1px solid #d9d9d9',  cursor: 'default'}}>{`${list[ps.rowIndex]['name']}`}</Cell>
                    }
                    if (op.name == "handle") {
                        let type = list[ps.rowIndex].type
                        if(type == 1) {
                            return <Cell style={{textAlign: 'center'}}><span className={'handleBtn'} style={{cursor: 'pointer'}} onClick={this.openLink.bind(this, list[ps.rowIndex])}>查看</span></Cell>
                        }else if(type == 2) {
                            return <Cell style={{textAlign: 'center'}}><span className={'handleBtn'} style={{cursor: 'pointer'}} onClick={this.openLink.bind(this, list[ps.rowIndex])}>查看</span></Cell>
                        }
                    }
                }}
            />
            cols.push(col)
        })

        return cols
    }
    getColumns = () => {
        return [{
            columnName: '文档名称',
            id: 'name',
            name: 'name',
            width: 260,
        }, {
            columnName: '操作',
            id: 'handle',
            name: 'handle',
            width: 80,
        }]
    }
    openLink = (data) => {
        let a = document.querySelector('#helpCenterHype')
        a.setAttribute('href', data.url)
        a.click()
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}