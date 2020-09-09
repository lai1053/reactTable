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
        const response = await this.webapi.enumDetail.init()
        const columns = await this.webapi.columnDetail.findByColumnCode('enumList')
        this.injections.reduce('load', response, columns)
        const pagination = this.metaAction.gf('data.pagination').toJS()
        if(id && type == 'add') {
            this.metaAction.sf('data.selectedKeys', String(id))
        }
        if(!(type && type == 'modify')){
            this.loadColumn(pagination, response[0].id)
        }
    }

    loadColumn = async (pagination, queryId) => {
        let params = {}
        params.page = pagination
        params.entity = {columnId: queryId}
        const response = await this.webapi.enumDetail.column(params)
        this.injections.reduce('column', response)
    }

    reload = async () => {
        const pagination = this.metaAction.gf('data.pagination').toJS(),
        filter = this.metaAction.gf('data.other.filter').toJS()
        this.load(pagination, filter)
    }

    selectType = (selectedKeys, info) => {
        let key = null
        if(selectedKeys.length == 0) {
            key = this.metaAction.gf('data.selectedKeys')
        }
        const pagination = { currentPage: 1, pageSize: 20 }
        this.metaAction.sf('data.selectedKeys', selectedKeys[0] || key)
        this.loadColumn(pagination, selectedKeys[0] || key)
    }

    getListRowsCount = () => {
        return this.metaAction.gf('data.list').size
    }

    getListColumns = () => {
        const enus = this.metaAction.gf('data.list').toJS()
        const columns = this.metaAction.gf('data.columns').toJS()
        let { Column, Cell } = DataGrid
        let cols = [
            <Column name='select' columnKey='select' flexGrow={1} width={40}
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
                        if (op.fieldName == 'code') {
                            return <Cell><a onClick={this.modifyDetail(enus[ps.rowIndex].id)}>{enus[ps.rowIndex][op.fieldName]}</a></Cell>  
                        }
                        return <Cell>{enus[ps.rowIndex][op.fieldName]}</Cell>            
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
        const type = this.metaAction.gf('data.selectedKeys')
        const ret = await this.metaAction.modal('show', {
            title: '新增',
            children: this.metaAction.loadApp('ttk-edf-app-enum-type', {
                store: this.component.props.store,
                parentId: type
            })
        })

        if (ret) {
            let pagination = this.metaAction.gf('data.pagination').toJS()
            this.reload(ret.id, 'add')
        }
    }

    modifyType = async () => {
        const type = this.metaAction.gf('data.selectedKeys')

        if (!type) {
            this.metaAction.toast('error', '请选中一个分类')
            return
        }

        const ret = await this.metaAction.modal('show', {
            title: '修改',
            children: this.metaAction.loadApp('ttk-edf-app-enum-type', {
                store: this.component.props.store,
                typeId: type
            })
        })
        if (ret) {
            let pagination = this.metaAction.gf('data.pagination').toJS()
            this.reload(ret.id)
        }

    }

    delType = async () => {
        const type = this.metaAction.gf('data.selectedKeys')
        if (!type) {
            this.metaAction.toast('error', '请选中一个枚举分类')
            return
        }

        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })

        if (ret) {
            const response = await this.webapi.enum.del({ id:  Number(type)})
            this.metaAction.toast('success', '删除枚举分类成功')
            this.load()
        }
    }

    addDetail = async () => {
        const type = this.metaAction.gf('data.selectedKeys')
        if (!type) {
            this.metaAction.toast('error', '请选中一个枚举分类')
            return
        }

        const ret = await this.metaAction.modal('show', {
            title: '新增',
            children: this.metaAction.loadApp('ttk-edf-app-enum-detail', {
                store: this.component.props.store,
                typeId: type
            })
        })

        if (ret) {
            var typeList = []
            typeList.push(type)
            this.selectType(typeList)
        }
    }

    modifyDetail = (id) => async () => {
        const type = this.metaAction.gf('data.selectedKeys')
        const list = this.metaAction.gf('data.list').toJS()
        let data = list.find((o) => {
            return o.id == id
        })
        
        const ret = await this.metaAction.modal('show', {
            title: '修改',
            children: this.metaAction.loadApp('ttk-edf-app-enum-detail', {
                store: this.component.props.store,
                data: data,
                id
            })
        })

        if (ret) {
            var typeList = []
            typeList.push(type)
            this.selectType(typeList)
        }
    }

    batchDelDetail = async () => {
        const type = this.metaAction.gf('data.selectedKeys')
        if (!type) {
            this.metaAction.toast('error', '请选中一个枚举分类')
            return
        }

        const lst = this.metaAction.gf('data.list')
        if (!lst || lst.size == 0) {
            this.metaAction.toast('error', '请选中要删除的枚举项')
            return
        }

        const selectRows = lst.filter(o => o.get('selected'))
        if (!selectRows || selectRows.size == 0) {
            this.metaAction.toast('error', '请选中要删除的枚举项')
            return
        }

        const ret = await this.metaAction.modal('confirm', {
            title: '删除',
            content: '确认删除?'
        })

        if(!ret)
            return

        const ids = selectRows.map(o => o.get('id')).toJS()
        await this.webapi.enumDetail.delDetail({ ids })
        this.metaAction.toast('success', '删除成功')

        var typeList = []
        typeList.push(type)
        this.selectType(typeList)
    }

    columnSetting = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '栏目设置',
            children: this.metaAction.loadApp('ttk-edf-app-column-setting', {
                store: this.component.props.store,
                columnCode: "enumList"
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