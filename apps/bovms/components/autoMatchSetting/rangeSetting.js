import React from 'react'
import { Tabs, Checkbox, Button } from 'edf-component'
import { Form, Select } from 'antd'
const Option = Select.Option

class RangeSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            editing: false,
            list: [],
            opts: []
        }
        this.text = ''
        switch (props.type) {
            case 'dfAccountList':
            case 'accountList':
                this.text = '会计科目'
                break
            case 'assistTypeList':
                this.text = '辅助核算类型'
                break
            case 'inventoryTypeList':
                this.text = '存货类型'
                break
        }
        this.webapi = props.webapi
        this.metaAction = props.metaAction
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }
    //保存维度设置
    onOk = async () => {
        let { list } = this.state

        if (list.length === 0) {
            this.metaAction.toast('error', `请设置至少1个${this.text}`)
            return false
        }
        if (list.length > 3) {
            this.metaAction.toast('error', `${this.text}不能多于3个`)
            return false
        }
        return list
    }
    async getOpts() {
        const { type, module, yearPeriod } = this.props
        let apiFunc = ''
        let paramas = {}
        if (type === 'inventoryTypeList') {
            apiFunc = 'queryInventoryType'
        } else if (type === 'accountList') {
            apiFunc = 'queryStockAccountCodeList'
            paramas.module = module
            paramas.yearPeriod = yearPeriod
        } else if (type === 'assistTypeList') {
            apiFunc = 'queryArchiveCategory'
        } else if (type === 'dfAccountList') {
            apiFunc = 'queryContactAccountCodeList'
            paramas.yearPeriod = yearPeriod
        }

        let res = await this.webapi.bovms[apiFunc](paramas)
        this.setState({
            opts: res
        })


    }
    componentDidMount() {
        this.setState({
            list: this.props.list
        })
        this.getOpts()
    }
    add() {
        const { list, opts } = this.state,
            { type } = this.props

        this.props.form.validateFieldsAndScroll((err, values) => {

        });
        let item = this.props.form.getFieldValue('item')
        if (item) {
            let dItem = opts.find(f => f.id == item)
            list.push(dItem)
            this.setState({
                list,
                editing: false
            })
        }

    }
    del(index) {
        let { list } = this.state
        list.splice(index, 1)
        this.setState({
            list
        })
    }
    up(index) {
        let { list } = this.state
        let preItem = list[index - 1]
        let currentItem = list[index]

        list[index - 1] = currentItem
        list[index] = preItem
        this.setState({
            list
        })
    }
    down(index) {
        let { list } = this.state
        let aftItem = list[index + 1]
        let currentItem = list[index]
        list[index + 1] = currentItem
        list[index] = aftItem
        this.setState({
            list
        })
    }
    render() {
        const { editing, list, opts } = this.state
        const { type } = this.props
        const { getFieldDecorator } = this.props.form;

        return (
            <div className="bovms-app-auto-match-setting-range-setting">
                <ul className='bovms-app-auto-match-setting-range-setting-list'>
                    {list.map((e, i) => (<li className='bovms-app-auto-match-setting-range-setting-item'>
                        <span className='bovms-app-auto-match-setting-range-setting-item-name'>{`${type === 'assistTypeList' ? '' : e.code} ${e.name}`}</span>
                        {!editing && <div className='bovms-app-auto-match-setting-range-setting-item-actions'>
                            <a href='javascript:;' onClick={this.del.bind(this, i)}>删除</a>
                            {i != 0 && <a href='javascript:;' onClick={this.up.bind(this, i)}>上移</a>}
                            {i != list.length - 1 && <a href='javascript:;' onClick={this.down.bind(this, i)}>下移</a>}
                        </div>}
                    </li>))}
                </ul>
                <div className='bovms-app-auto-match-setting-range-setting-add'>
                    {
                        editing ?
                            <div className='bovms-app-auto-match-setting-range-setting-add-select'>
                                <Form.Item>
                                    {getFieldDecorator('item', {
                                        rules: [{ required: true, message: `请选择${this.text}` }],
                                        initialValue: null,
                                    })(<Select
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                        }
                                        allowClear
                                        style={{ width: '220px', marginRight: '8px' }}
                                    >
                                        {opts.map(e => {
                                            let dItem = list.find(f => f.name === e.name)
                                            if (!dItem) {
                                                return (<Option key={e.id} value={e.id}>{`${type === 'assistTypeList' ? '' : e.code} ${e.name}`}</Option>)
                                            }
                                        })}
                                    </Select>)}
                                </Form.Item>
                                <a href='javascript:;' onClick={this.add.bind(this)}>确定</a>
                                <a href='javascript:;' onClick={() => {
                                    this.setState({
                                        editing: false
                                    })
                                }}>取消</a>

                            </div> :
                            <a href='javascript:;' onClick={() => {
                                this.setState({
                                    editing: true
                                })
                            }}>+ 新增</a>
                    }
                </div>
                <p>已设置{this.text}数：{list.length}</p>
            </div>
        )
    }
}

export default Form.create({ name: 'bovms_app_range_setting' })(RangeSetting); 