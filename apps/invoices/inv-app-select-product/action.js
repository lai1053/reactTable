import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import { Button} from 'antd'
import SearchTree from './searchTree.js'
import RadioTable from './radioTable.js'
import { fromJS } from 'immutable'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }


    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        // console.log('this.component.props:', this.component.props)
        // if (this.component.props.setOkListener) {
        //     this.component.props.setOkListener(this.onOk)
        // }
        // if (this.component.props.setCancelLister) {
        //     this.component.props.setCancelLister(this.onCancel)
        // }
        injections.reduce('init');
    }

    componentDidMount = () => {
        this.mounted = true;
        // this.load();
    }

    load = async () => {
        const res = await this.webapi.invoices.getSpbmList()
        if (res) {
            this.metaAction.sf('data.spbmList', fromJS(res.map(item => ({ ...item, key: item.spbm, title: item.spmc }))))
        }
    }

    onSelect = (list) => {
        this.metaAction.sf('data.loading', true)
        if (list) {
            let selectedRowKeys = this.metaAction.gf('data.selectedRowKeys').toJS();
            if (list && list.length === 1 && list[0] && list[0].key > -1) {
                selectedRowKeys = [list[0].key]
            }
            this.metaAction.sfs({
                'data.selectedRowKeys': fromJS(selectedRowKeys),
                'data.spbmFilterList': fromJS(list),
                'data.loading': false,
            })

        }
    }

    onCancel = () => {
        this.component.props.closeModal && this.component.props.closeModal()
    }

    rowCallback = (arr) => {
        this.metaAction.sf('data.selectedRowKeys', fromJS(arr))
    }

    renderModal = () => {
        const spbm = this.component.props.spbmList.toJS()
        //this.metaAction.gf('data.spbmList').toJS()
        const list = this.metaAction.gf('data.spbmFilterList').toJS()
        const selectedRowKeys = this.metaAction.gf('data.selectedRowKeys').toJS()
        const loading = this.metaAction.gf('data.loading')
        // console.log(spbm, 'spbm')
        return <div className="-body">
                <SearchTree data={spbm} onSelect={this.onSelect} />
                <div className="-radio-table">
                    <RadioTable className="-table" loading={loading} data={list} selectedRowKeys={selectedRowKeys} callback={this.rowCallback} />
                    <div className="footer">
                        <Button type="primary" onClick={this.onOK}>确定</Button>
                        <Button onClick={this.onCancel}>取消</Button>
                    </div>
                </div>
            </div>
    }

    onOK = () => {
        let rowKeys = this.metaAction.gf('data.selectedRowKeys').toJS(),
            key = rowKeys && rowKeys[0],
            list = this.metaAction.gf('data.spbmFilterList').toJS(),
            item = list.find(f => f.key == key)
        if (item) {
            // this.component.props.callback(item)
            this.component.props.closeModal && this.component.props.closeModal(item)
        }
        // return false
    }

}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}