import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import config from './config'
import moment from 'moment'
import { Tree } from 'edf-component'
import { Menu, Checkbox, DataGrid } from 'edf-component'

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

    load = async (id, type) => {
        const tree = await this.webapi.column.query()
        const columns = await this.webapi.columnDetail.findByColumnCode('columnList')
        this.injections.reduce('load', tree, columns)
        const pagination = this.metaAction.gf('data.pagination').toJS()
        if(id) {
            this.metaAction.sf('data.selectedKeys', String(id))
        }
        if(!(type && type == 'modify')){
            this.loadColumn(pagination, id || tree[0].id)
        }
    }

    loadColumn = async (pagination, queryId) => {
        let params = {}
        params.page = pagination
        params.entity = {columnId: queryId}
        const response = await this.webapi.columnDetail.init(params)
        this.injections.reduce('column', response)
        return
    }

    reload = async () => {
        const pagination = this.metaAction.gf('data.pagination').toJS(),
        filter = this.metaAction.gf('data.other.filter').toJS()
        this.load(pagination, filter)
    }

    selectType = async (selectedKeys, info) => {
        const pagination = { currentPage: 1, pageSize: 20 }
        this.metaAction.sf('data.selectedKeys', selectedKeys[0])
        this.loadColumn(pagination, selectedKeys[0])
    }

    getListRowsCount = () => {
        return this.metaAction.gf('data.list').size
    }

    getListColumns = () => {
        const enus = this.metaAction.gf('data.list').toJS(),
        columns = this.metaAction.gf('data.columns').toJS()
        let { Column, Cell } = DataGrid
        let cols = [
            <Column name='select' columnKey='select' flexGrow={1} width={30}
                header={<Cell name='cb'><Checkbox checked={this.isSelectAll()} onChange={this.selectAll()}></Checkbox></Cell>}
                cell={(ps) => {
                   return <Cell name='cell'><Checkbox onChange={this.selectRow(ps.rowIndex)} checked={enus[ps.rowIndex].selected}></Checkbox></Cell>
                }}
            />
        ]
        columns.forEach(op => {
            if (op.isVisible == 1) {
                let col = <Column name={op.id} columnKey={op.id} flexGrow={1} width={op.width}
                    header={<Cell name='header'>{op.caption}</Cell>}
                    cell={(ps) => {
                        //console.log(op)
                        if (op.fieldName == 'fieldName' || op.fieldName == 'caption' || op.fieldName == 'defPrecision') {
                            return <Cell><a onClick={this.modifyDetail(enus[ps.rowIndex].id)}>{enus[ps.rowIndex][op.fieldName]}</a></Cell>  
                        }
                        else if (op.fieldTypeDTO.code == 'enum') {
                            return <Cell>{enus[ps.rowIndex][op.fieldName+'DTO']['name']}</Cell>  
                        }
                        else if (op.fieldTypeDTO.code == 'boolean') {
                            return <Cell>{enus[ps.rowIndex][op.fieldName] == 0 ? '否' : '是'}</Cell>                                                                                        
                        }
                        else {
                            return <Cell>{enus[ps.rowIndex][op.fieldName]}</Cell>     
                        }       
                    }}
                />
                cols.push(col)
            }
        })
        return cols
    }

    isSelectAll = () => {
        const lst = this.metaAction.gf('data.list')
        if (!lst || lst.size == 0)
            return false

        return lst.every(o => o.get('selected'))
    }

    selectAll = () => (e) => {
        this.injections.reduce('selectAll', e.target.checked)
    }

    selectRow = (rowIndex) => (e) => {
        this.injections.reduce('selectRow', rowIndex, e.target.checked)
    }

    pageChanged = (currentPage, pageSize) => {
        const filter = this.metaAction.gf('data.other.filter').toJS()
        const nodeId = this.metaAction.gf('data.selectedKeys')
        this.loadColumn({ currentPage, pageSize }, nodeId)
    }

    loopTreeChildren = data => {
        if (!data) return null
        return data.map((item) => {
            if (item.children && item.children.length) {
                return <Tree.TreeNode key={item.id} title={item.name}>{this.loopTreeChildren(item.children)}</Tree.TreeNode>
            }
            return <Tree.TreeNode key={item.id} title={item.name} />
        })
    }


    addType = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '新增',
            children: this.metaAction.loadApp('ttk-edf-app-column-type', {
                store: this.component.props.store,
                actionType: 'add'
            })
        })
        if (ret) {
            let pagination = this.metaAction.gf('data.pagination').toJS()
            this.load(ret.id)
        }
    }

    modifyType = async () => {
        const nodeId = this.metaAction.gf('data.selectedKeys')
        if (!nodeId) {
            this.metaAction.toast('error', '请选中一个栏目方案')
            return
        }
        const tree = this.metaAction.gf('data.tree').toJS()
        let data = tree.find((o) => {
            return o.id == nodeId
        })
        const ret = await this.metaAction.modal('show', {
            title: '修改',
            children: this.metaAction.loadApp('ttk-edf-app-column-type', {
                store: this.component.props.store,
                actionType: 'modify',
                data: data,
            })
        })
        if (ret) {
            let pagination = this.metaAction.gf('data.pagination').toJS()
            this.load(ret.id, 'modify')
        }
    }

    delType = async () => {
        const nodeId = this.metaAction.gf('data.selectedKeys')
        if (!nodeId) {
            this.metaAction.toast('error', '请选中一个栏目方案')
            return
        }
        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })
        if (ret) {
            const response = await this.webapi.column.del([{id: Number(nodeId)}])
            this.metaAction.toast('success', '删除栏目成功')
            this.load()
        }
    }

    addDetail = async () => {
        const nodeId = this.metaAction.gf('data.selectedKeys')
        if (!nodeId) {
            this.metaAction.toast('error', '请选中一个栏目方案')
            return
        }       
        const ret = await this.metaAction.modal('show', {
            title: '新增',
            children: this.metaAction.loadApp('ttk-edf-app-column-detail', {
                store: this.component.props.store,
                actionType: 'add',
                nodeId: nodeId
            })
        })

        if (ret) {
            var typeList = []
            typeList.push(nodeId)
            this.selectType(typeList)
        }
    }

    modifyDetail = (id) => async () => {
        const nodeId = this.metaAction.gf('data.selectedKeys')
        const list = this.metaAction.gf('data.list').toJS()
        let data = list.find((o) => {
            return o.id == id
        })
        const ret = await this.metaAction.modal('show', {
            title: '修改',
            children: this.metaAction.loadApp('ttk-edf-app-column-detail', {
                store: this.component.props.store,
                actionType: 'modify',
                nodeId: nodeId,
                data: data
            })
        })

        if (ret) {
            var typeList = []
            typeList.push(nodeId)
            this.selectType(typeList)
        }
    }

    batchDelDetail = async () => {
        const nodeId = this.metaAction.gf('data.selectedKeys')
        if (!nodeId) {
            this.metaAction.toast('error', '请选中一个栏目方案')
            return
        }

        const lst = this.metaAction.gf('data.list')
        if (!lst || lst.size == 0) {
            this.metaAction.toast('error', '请选中要删除的栏目')
            return
        }
        const selectRows = lst.filter(o => o.get('selected'))
        if (!selectRows || selectRows.size == 0) {
            this.metaAction.toast('error', '请选中要删除的栏目')
            return
        }

        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })

        if(!ret)
            return

        const ids = selectRows.map(o => o.get('id')).toJS()
        let params = []
        for(let i = 0 ; i < ids.length ; i++) {
            params.push({id: ids[i]})
        }
        await this.webapi.columnDetail.delDetail(params)
        this.metaAction.toast('success', '删除成功')
        
        var typeList = []
        typeList.push(nodeId)
        this.selectType(typeList)
    }

    columnSetting = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '栏目设置',
            children: this.metaAction.loadApp('ttk-edf-app-column-setting', {
                store: this.component.props.store,
                columnCode: "columnList"
            })
        })

        if (ret) {
            this.reload()
        }
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}