import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { Button, Modal } from 'antd'
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
        // console.log(this.component.props.path, '-onInit:', this.component.props.key)
        const { init, inputValue, error, disabled } = component.props || {}
        injections.reduce('init', {
            init,
            value: inputValue,
            error,
            disabled,
        })
        this.load()
    }
    load = async () => {
        const res = await this.webapi.invoices.getSpbmList()
        if (res) {
            this.metaAction.sf('data.spbmList', fromJS(res.map(item => ({ ...item, key: item.spbm, title: item.spmc }))))
        }
        return false
    }
    componentWillReceiveProps = (nextProps) => {
        // 框架问题，父级app传值后，无法赋值给子app，得在这里处理
        // let inputValue = this.metaAction.gf('data.value')
        // if (inputValue !== nextProps.inputValue) {
        //     this.metaAction.sf('data.value', nextProps.inputValue)
        // }
        const error = this.metaAction.gf('data.error')
        const value = this.metaAction.gf('data.value')
        const disabled = this.metaAction.gf('data.disabled')
        if (error === nextProps.error && value === nextProps.inputValue && disabled === nextProps.disabled) return
        this.metaAction.sfs({
            'data.error': nextProps.error,
            'data.value': nextProps.inputValue,
            'data.disabled': nextProps.disabled,
        })
    }
    onSelect = (list) => {
        if (list) {
            // console.log('onSelect:', list)
            // let list=this.metaAction.gf('data.spbmList').toJS()
            this.metaAction.sf('data.spbmFilterList', fromJS(list))
        }
    }
    onCancel = () => {
        this.metaAction.sf('data.visible', false)
    }
    rowCallback = (arr) => {
        this.metaAction.sf('data.selectedRowKeys', fromJS(arr))
    }
    renderModal = () => {
        const spbm = this.metaAction.gf('data.spbmList').toJS()
        const list = this.metaAction.gf('data.spbmFilterList').toJS()
        const visible = this.metaAction.gf('data.visible')
        const selectedRowKeys = this.metaAction.gf('data.selectedRowKeys').toJS()
        return <Modal
            title="商品信息"
            visible={visible}
            className='inv-app-product-select-modal'
            wrapClassName='inv-app-product-select-wrap'
            width={960}
            height={500}
            centered
            onCancel={this.onCancel}
            footer={null}
            bodyStyle={{ padding: '0px' }}
        >
            <div className="-body">
                <SearchTree data={spbm} onSelect={this.onSelect} />
                <div className="-radio-table">
                    <RadioTable className="-table" data={list} selectedRowKeys={selectedRowKeys} callback={this.rowCallback} />
                    <div className="footer">
                        <Button onClick={this.onCancel}>取消</Button>
                        <Button type="primary" onClick={this.onOK}>确定</Button>
                    </div>
                </div>
            </div>
        </Modal>
    }
    btnClick = () => {
        if (this.metaAction.gf('data.disabled')) {
            return;
        }
        this.metaAction.sf('data.visible', true)
    }
    onBlur = (e) => {
        if (this.component.props.callback) {
            this.component.props.callback(this.metaAction.gf('data.value'))
        }
    }
    onChange = (v) => {
        const value = this.component.props.inputValue //this.metaAction.gf('data.value')
        const newValue = v.target.value
        if (value !== newValue && this.component.props.callback) {
            this.metaAction.sf('data.value', newValue)
            this.component.props.callback(newValue)
        }
    }
    onOK = () => {
        let rowKeys = this.metaAction.gf('data.selectedRowKeys').toJS(),
            key = rowKeys && rowKeys[0],
            list = this.metaAction.gf('data.spbmFilterList').toJS(),
            item = list.find(f => f.key == key)
        // console.log(key, list, item)
        if (item && this.component.props.callback) {
            this.metaAction.sfs({ 'data.value': item.spmc, 'data.visible': false })
            this.component.props.callback({ ...item, slv: item.slv })
        }

    }
    // debounce((v) => {
    // }, 150, {
    //     'leading': true,
    //     'trailing': false,
    //     'maxWait': 1000,
    // })
    getLayoutClass = () => {
        const { init, error, disabled } = this.metaAction.gf('data').toJS()
        return `inv-app-product-select${init?" init":""}${error?" error":""} ${disabled?"disabled":""}`
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}