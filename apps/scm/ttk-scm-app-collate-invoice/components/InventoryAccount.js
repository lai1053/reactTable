import React from 'react'
import { Select, Input, Button, Table, Radio, Icon, Menu, Dropdown } from 'edf-component'
import { Map, fromJS } from 'immutable'
const RadioGroup = Radio.Group;
const Option = Select.Option;
class InventoryAccount extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            tableOption: {
                x: 1,
                y: 100
            },
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        }
    }

    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        itemArr = itemArr.filter(o => o != undefined);
        let newArr = []
        itemArr.map(item => {
            newArr.push(item.keyId)
        })

        this.setState({
            tableCheckbox: {
                checkboxValue: newArr,
                selectedOption: itemArr
            }
        })
    }

    onResize = (e) => {
        let keyRandom = Math.floor(Math.random() * 10000)
        this.keyRandom = keyRandom
        setTimeout(() => {
            if (keyRandom == this.keyRandom) {
                this.getTableScroll()
            }
        }, 200)
    }

    getTableScroll = (e) => {
        try {
            let tableOption = this.state.tableOption;
            let domContainer = document.getElementsByClassName('ttk-scm-app-collate-invoice-form-inventoty-container')[0];
            let tableWrapperDom = domContainer.getElementsByClassName('ant-table-wrapper')[0];
            //table wrapper包含整个table,table的高度计算要基于这个dom，所以要设置好tableWrapperDom的高度

            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table无滚动时有1个table包含theadDom和tbodyDom
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tableWrapperDom && theadDom && tbodyDom) {
                let num = tableWrapperDom.offsetHeight - theadDom.offsetHeight - tbodyDom.offsetHeight;

                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                if (num < 0) {
                    this.setState({
                        tableOption: {
                            ...tableOption,
                            y: height - theadDom.offsetHeight,//9是由于theadDom tbodyDom与父元素的差值
                            x: width - 8
                        }
                    })
                } else {
                    delete tableOption.y;

                    this.setState({
                        tableOption: {
                            ...tableOption,
                            x: width
                        }
                    })
                }
            }
        } catch (err) {
            console.log(err)
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
        this.onResize()
    }

    componentWillReceiveProps = (nextProps) => {
        // if (nextProps.inventoryAccountInitData && this.inventoryAccountInitData && this.inventoryAccountInitData.invoiceInventoryList.length != nextProps.inventoryAccountInitData.invoiceInventoryList.length) {
        this.onResize()
        // }
    }

    componentWillUnmount = () => {

        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = undefined;
        }

    }

    handleSetting = () => {

    }

    getFullNameChildren = (option) => {
        return <div>{
            option.fullNameArr.map((item, index) => {
                return <span className={`fullname${index}`}>{item}</span>
            })
        }</div>
    }

    //自动生成存货
    handelGenerateInventory = async () => {
        const { tableCheckbox: { selectedOption, checkboxValue } } = this.state;
        //console.log(selectedOption);
        const res = await this.props.handelGenerateInventory(selectedOption);
        this.setState({
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }

    //自动生成存货科目
    handelGenerateInventoryAccount = async () => {
        const { tableCheckbox: { selectedOption, checkboxValue } } = this.state;
        //console.log(selectedOption)
        const res = await this.props.handelGenerateInventoryAccount(selectedOption);
        this.setState({
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }

    //自动生成收入科目
    handelGenerateRevenueAccount = async () => {
        const { tableCheckbox: { selectedOption, checkboxValue } } = this.state;
        const res = await this.props.handelGenerateRevenueAccount(selectedOption);
        this.setState({
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }

    //批量修改存货
    handelUpdateInventory = async () => {
        const { tableCheckbox: { selectedOption, checkboxValue } } = this.state;
        const res = await this.props.handelUpdateInventory(selectedOption);
        this.setState({
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }

    //批量修改业务类型
    handleBatchUpdateProperty = async () => {
        const { tableCheckbox: { selectedOption, checkboxValue } } = this.state;
        const res = await this.props.handleBatchUpdateProperty(selectedOption);
        this.setState({
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }
    //批量修改收入类型
    handleBatchUpdateRevenueType = async () => {
        const { tableCheckbox: { selectedOption, checkboxValue } } = this.state;
        const res = await this.props.handleBatchUpdateRevenueType(selectedOption);
        this.setState({
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }

    //批量修改存货科目
    handelUpdateInventoryAccount = async () => {
        const { tableCheckbox: { selectedOption, checkboxValue } } = this.state;
        const res = await this.props.handelUpdateInventoryAccount(selectedOption);
        this.setState({
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }


    handelGenerateRevenueType = async () => {
        const { tableCheckbox: { selectedOption, checkboxValue } } = this.state;
        const res = await this.props.handelGenerateRevenueType(selectedOption);
        this.setState({
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }

    // 批量修改换算率
    handleBatchChangeRate = async () => {
        const { tableCheckbox: { selectedOption, checkboxValue } } = this.state;
        const res = await this.props.handleBatchChangeRate(selectedOption);
        this.setState({
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }

    // 更多-批量修改存货
    handleBatchUpdateInventory = async () => {
        const { tableCheckbox: { selectedOption, checkboxValue } } = this.state;
        const res = await this.props.handleBatchUpdateInventory(selectedOption);
        this.setState({
            tableCheckbox: {
                checkboxValue: [],
                selectedOption: []
            }
        })
    }

    rendColumns = () => {
        const { vatOrEntry, inventoryAccountInitData: { relatedAccountEnable, costAccountEnable, revenueAccountEnable } } = this.props;
        let columns = [];
        if (vatOrEntry === 1) {
            //进项
            columns = [
                {
                    name: 'inventoryName',
                    // title: '发票-开票名称',
                    title: '发票-开票信息',
                    dataIndex: 'inventoryName',
                    render: (text, record, index) => {
                        return <div className='td_div_block' title={text}>
                            {text}
                        </div>
                    }
                },
                {
                    name: 'propertyId',
                    title: '业务类型',
                    dataIndex: 'propertyId',
                    width: '125px',
                    render: (text, record, index) => {
                        return <Select style={{ width: '100%' }}
                            dropdownClassName='accountSubjectClass'
                            filterOption={(inputValue, option) => { return this.props.handFilterOption(inputValue, option, 'properties') }}
                            allowClear={true}
                            value={text}
                            onChange={(v) => { this.props.handleChangeProperty(v, index) }}
                            className={text ? '' : 'has-error'}
                            dropdownMatchSelectWidth={false}
                            dropdownStyle={{ width: '110px' }}
                        >
                            {
                                this.props.inventoryAccountInitData.properties.map((o, index) => {
                                    return <Option key={index} value={o.propertyId} title={o.propertyName}>{o.propertyName}</Option>
                                })
                            }
                        </Select>
                    },
                },
                {
                    name: 'inventoryId',
                    // title: '存货名称',
                    title: '存货名称/费用类型',
                    dataIndex: 'inventoryId',
                    width: '178px',
                    render: (text, record, index) => {
                        return <Select style={{ width: '100%' }}
                            filterOption={(inputValue, option) => { return this.props.handFilterOption(inputValue, option, 'inventory') }}
                            allowClear={true}
                            value={record.inventoryFocus ? (this.props.inventory.find(o => o.id == text) ? text : record.name) : record.name}
                            className={text ? '' : 'has-error'}
                            dropdownClassName='accountSubjectClass ttk-scm-app-collate-invoice-inventoryDropdown'
                            onChange={(v) => this.props.handleChangeInventory(v, index)}
                            onFocus={() => this.props.handleSelectOnFocus('inventoryFocus', index, record.propertyId)}
                            onBlur={() => this.props.handleSelectOnBlur('inventoryFocus', index)}
                            dropdownFooter={
                                <Button
                                    type='primary'
                                    style={{ width: '100%', borderRadius: '0' }}
                                    onClick={() => this.props.addInventory(index, record)}
                                >
                                    新增
                            </Button>
                            }
                        >
                            {
                                this.props.inventory.map((o, index) => {
                                    return <Option key={index} value={o.id} title={o.fullname}>{this.getFullNameChildren(o)}</Option>
                                })
                            }
                        </Select>
                    },
                },
            ]
            if (!this.props.inventoryAccountInitData.isHideUnit) {
                columns.push(
                    {
                        name: 'inventoryUnitName',
                        title: '计量单位',
                        dataIndex: 'inventoryUnitName',
                        align: 'center',
                        width: '68px'
                    }, {
                        name: 'rate',
                        title: <div style={{ lineHeight: '15px' }}>计量单位转化<div></div>(开票计量单位:存货计量单位)</div>,
                        dataIndex: 'rate',
                        width: '172px',
                        align: 'center',
                        render: (text, record, index) => {
                            if (!record.unitName || !record.inventoryUnitName) {
                                return null
                            }
                            return <div>
                                1{record.unitName}:
                                <Input.Number
                                    style={{ width: 70, margin: '0 8px', fontSize: '12px', textAlign: 'right', height: '26px' }}
                                    value={text}
                                    onChange={(v) => this.props.handleChangeRate(v, index)}
                                    className={!isNaN(Number(text)) && Number(text) > 0 ? '' : 'has-error'}
                                    minValue={0}
                                    precision={6}
                                />
                                {record.inventoryUnitName}
                            </div>
                        }
                    }
                )
            }
            if (relatedAccountEnable) {
                columns.push({
                    name: 'inventoryRelatedAccountId',
                    // title: '存货科目',
                    title: '会计科目',
                    dataIndex: 'inventoryRelatedAccountId',
                    // align: 'left',
                    width: '178px',
                    render: (text, record, index) => {
                        return <Select style={{ width: '100%' }}
                            filterOption={(inputValue, option) => { return this.props.handFilterOption(inputValue, option, 'inventoryAccount') }}
                            allowClear={true}
                            className={this.props.inventoryAccount.find(o => o.id === text) ? '' : 'has-error'}
                            // dropdownClassName='ttk-scm-app-collate-invoice-form-inventoty-select-dropdown accountSubjectClass'
                            value={this.props.inventoryAccount.find(o => o.id === text) ? text : null}
                            //  value={record.inventoryAccountFocus ? text : record.inventoryRelatedAccountName}
                            onChange={(v) => this.props.handleChangeInventoryAccount(v, index)}
                            // onFocus={() => this.props.handleSelectOnFocus('inventoryAccountFocus', index, record.propertyId)}
                            // onBlur={() => this.props.handleSelectOnBlur('inventoryAccountFocus', index)}
                            dropdownStyle= {{width: '350px'}}
                            dropdownFooter={
                                <Button
                                    type='primary'
                                    style={{ width: '100%', borderRadius: '0' }}
                                    onClick={() => this.props.addInventoryAccount(index)}
                                >
                                    新增
                            </Button>
                            }
                        >
                            {
                                this.props.inventoryAccount.map((o, index) => {
                                    return <Option key={index} value={o.id} title={o.codeAndName}>{o.codeAndName}</Option>
                                })
                            }

                        </Select>
                    },
                })
            }
        } else {
            //销项
            columns = [
                {
                    name: 'inventoryName',
                    title: '发票-开票名称',
                    dataIndex: 'inventoryName',
                    render: (text, record, index) => {
                        return <div className='td_div_block' title={text}>
                            {text}
                        </div>
                    }
                },
                {
                    name: 'inventoryId',
                    title: '存货名称',
                    dataIndex: 'inventoryId',
                    width: '178px',
                    render: (text, record, index) => {
                        return <Select style={{ width: '100%' }}
                            filterOption={(inputValue, option) => { return this.props.handFilterOption(inputValue, option, 'inventory') }}
                            value={record.inventorySaFocus ? text : record.name}
                            //value={text}
                            allowClear={true}
                            onChange={(v) => this.props.handleChangeInventory(v, index)}
                            onFocus={() => this.props.handleSelectOnFocus('inventorySaFocus', index, record.propertyId)}
                            onBlur={() => this.props.handleSelectOnBlur('inventorySaFocus', index)}
                            className={text ? '' : 'has-error'}
                            dropdownClassName='ttk-scm-app-collate-invoice-form-inventoty-select-dropdown accountSubjectClass ttk-scm-app-collate-invoice-inventoryDropdown'
                            dropdownFooter={
                                <Button
                                    type='primary'
                                    style={{ width: '100%', borderRadius: '0' }}
                                    onClick={() => this.props.addInventory(index, record)}
                                >
                                    新增
                        </Button>
                            }
                        >
                            {
                                this.props.inventory.map((o, index) => {
                                    return <Option key={index} value={o.id} title={o.fullName}>{this.getFullNameChildren(o)}</Option>
                                })
                            }
                        </Select>
                    },
                },
            ]
            if (!this.props.inventoryAccountInitData.isHideUnit) {
                columns.push(
                    {
                        name: 'inventoryUnitName',
                        title: '计量单位',
                        dataIndex: 'inventoryUnitName',
                        align: 'center',
                        width: '68px'
                    }, {
                        name: 'rate',
                        title: <div style={{ lineHeight: '15px' }}>计量单位转化<div></div>(开票计量单位:存货计量单位)</div>,
                        dataIndex: 'rate',
                        width: '172px',
                        align: 'center',
                        render: (text, record, index) => {
                            if (!record.unitName || !record.inventoryUnitName) {
                                return null
                            }
                            return <div>
                                1{record.unitName}:
                                <Input.Number
                                    style={{ width: 70, margin: '0 8px', fontSize: '12px', textAlign: 'right' }}
                                    value={text}
                                    onChange={(v) => this.props.handleChangeRate(v, index)}
                                    className={!isNaN(Number(text)) && Number(text) > 0 ? '' : 'has-error'}
                                    minValue={0}
                                    precision={6}
                                />
                                {record.inventoryUnitName}
                            </div>
                        }
                    }
                )
            }

            if (revenueAccountEnable === true) {
                columns.push({
                    name: 'revenueTypeAccountId',
                    title: '收入科目',
                    dataIndex: 'revenueTypeAccountId',
                    width: '248px',
                    render: (text, record, index) => {
                        return <Select style={{ width: '100%' }}
                            filterOption={(inputValue, option) => { return this.props.handFilterOption(inputValue, option, 'revenueAccount') }}
                            allowClear={true}
                            onChange={(v) => this.props.handleChangeRevenueAccount(v, index)}
                            dropdownStyle= {{width: '350px'}}
                            value={this.props.inventoryAccountInitData.revenueAccounts.find(o => o.id === text) ? text : null}
                            // value={text}
                            className={this.props.inventoryAccountInitData.revenueAccounts.find(o => o.id === text) ? '' : 'has-error'}
                            dropdownMatchSelectWidth={false}
                            // dropdownClassName='accountSubjectClass'
                            dropdownFooter={
                                <Button
                                    type='primary'
                                    style={{ width: '100%', borderRadius: '0' }}
                                    onClick={() => this.props.addRevenueAccount(index)}
                                >
                                    新增
                        </Button>
                            }
                        >
                            {
                                this.props.inventoryAccountInitData.revenueAccounts.map((o, index) => {
                                    return <Option key={index} value={o.id} title={o.codeAndName}>{o.codeAndName}</Option>
                                })
                            }
                        </Select>
                    },
                })
            } else {
                columns.push({
                    name: 'revenueType',
                    title: '收入类型',
                    dataIndex: 'revenueType',
                    width: '178px',
                    render: (text, record, index) => {
                        return <Select style={{ width: '100%' }}
                            filterOption={(inputValue, option) => { return this.props.handFilterOption(inputValue, option, 'revenueTypes') }}
                            allowClear={true}
                            onChange={(v) => this.props.handleChangeRevenueType(v, index)}
                            value={text}
                            className={text ? '' : 'has-error'}
                            // dropdownClassName='ttk-scm-app-collate-invoice-form-inventoty-select-dropdown accountSubjectClass'
                            dropdownStyle= {{width: '350px'}}
                            dropdownFooter={
                                <Button
                                    type='primary'
                                    style={{ width: '100%', borderRadius: '0' }}
                                    onClick={() => this.props.addRevenueType(index)}
                                >
                                    新增
                        </Button>
                            }
                        >
                            {
                                this.props.inventoryAccountInitData.revenueTypes.map((o, index) => {
                                    return <Option key={index} value={o.id} title={o.name}>{o.name}</Option>
                                })
                            }
                        </Select>
                    },
                })
            }
        }
        return columns;
    }

    render() {
        let { tableCheckbox, tableOption } = this.state
        let { vatOrEntry, loading, inventoryAccountInitData: { invoiceInventoryList: list = [], notMatchCount = 0, totalCount = 0, relatedAccountEnable, revenueAccountEnable }, accountEnableDto, inventoryName } = this.props;

        const menu = (
            <Menu>
                <Menu.Item>
                    <a className='header-btn' onClick={this.handleBatchUpdateInventory}>批量修改存货</a>
                </Menu.Item>
                {vatOrEntry ?
                    <Menu.Item>
                        <a className='header-btn' onClick={this.handleBatchUpdateProperty}>批量修改业务类型</a>
                    </Menu.Item> : null}
                {relatedAccountEnable && vatOrEntry ?
                    <Menu.Item>
                        <a className='header-btn' onClick={this.handelUpdateInventoryAccount}>批量修改存货科目</a>
                    </Menu.Item> : null}

                {revenueAccountEnable && vatOrEntry != 1 ? <Menu.Item>
                    <a className='header-btn' onClick={this.handelGenerateRevenueType}>批量修改收入科目</a>
                </Menu.Item> : null}

                {!revenueAccountEnable && !vatOrEntry ? <Menu.Item>
                    <a className='header-btn' onClick={this.handleBatchUpdateRevenueType}>批量修改收入类型</a>
                </Menu.Item> : null}
                <Menu.Item>
                    <a className='header-btn' onClick={this.handleBatchChangeRate}>批量修改换算率</a>
                </Menu.Item>
            </Menu>
        );


        return (
            <div className='ttk-scm-app-collate-invoice-form-inventoty-container'>
                <div className='ttk-scm-app-collate-invoice-form-inventoty-header'>
                    <Input.Search
                        placeholder='按开票名称'
                        value={inventoryName}
                        onSearch={this.props.handleInventoryAccountOnSearch}
                        onChange={this.props.handleInventoryAccountInputChange}
                        onBlur={this.props.handleInventoryAccountOnSearch}
                        className='search'
                    />
                    <Icon className='btn setting' fontFamily='edficon' type='shezhi' title='设置' onClick={() => this.props.handleInventorySetting()} />
                    <Dropdown overlay={menu}>
                        <Button style={{ marginLeft: 8 }}>
                            批量修改 <Icon type="down" />
                        </Button>
                    </Dropdown>
                    {
                        relatedAccountEnable && vatOrEntry ? <Button className='header-btn' onClick={this.handelGenerateInventoryAccount} style={{ marginLeft: 8 }}>自动生成存货科目</Button> : null
                    }
                    {
                        revenueAccountEnable && !vatOrEntry ? <Button className='header-btn' onClick={this.handelGenerateRevenueAccount} style={{ marginLeft: 8 }}>自动生成收入科目</Button> : null
                    }
                    {/* <Button className='header-btn' onClick={this.handelUpdateInventory} >批量修改存货</Button> */}
                    <Button className='header-btn header-btn-color' onClick={this.handelGenerateInventory} >自动生成存货</Button>

                    <RadioGroup className='header-radio' onChange={this.props.handleSwitchMatchType} value={this.props.onlyNotMatch}>
                        <Radio value={true}>未匹配（{notMatchCount}）</Radio>
                        <Radio value={false}>全部（{totalCount}）</Radio>
                    </RadioGroup>
                </div>
                <div className='ttk-scm-app-collate-invoice-form-inventoty-table-container'>
                    <Table
                        //emptyShowScroll={true}
                        className='table'
                        checkboxKey='keyId'
                        loading={loading}
                        checkboxChange={(e, itemArr) => this.checkboxChange(e, itemArr)}
                        checkboxValue={tableCheckbox.checkboxValue}
                        scroll={list.length > 0 ? tableOption : {}}
                        pagination={false}
                        enableSequenceColumn={false}
                        Checkbox={false}
                        bordered={true}
                        dataSource={list}
                        columns={this.rendColumns()}
                        // style={{height: '300px',borderRight: '1px solid #d9d9d9'}}
                        allowColResize={false}
                        className='ttk-scm-app-collate-invoice-form-inventoty-table'
                        delay={0.01}
                    />
                </div>
            </div>
        )
    }
}

export default InventoryAccount