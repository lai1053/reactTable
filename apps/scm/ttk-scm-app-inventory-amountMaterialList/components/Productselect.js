import React from 'react'
import { Table, Select, Button, Input, Form, TableSort, Checkbox } from 'edf-component'
import { Map, fromJS } from 'immutable'
import { addThousPos, clearThousPos } from '../../../../utils/number'
class Productselect extends React.Component {
    constructor(props){
        super(props)
        this.state={
            list: [],
            tableOption: {x:1400},
            loading: true,
            inventoryType: '',
            searchContent: '',
            tableCheckbox: {
                checkboxValue: [],
				selectedOption: []
            },
            sort: {
				// userOrderField: 'periodEndAmount',
                // order: 'desc',
                userOrderField: null,
				order: null,
            },
            amount: props.amount, //产成品入库直接材料合计余额
            productAmount: props.productAmount, //生产入库成本
            isVisiablePer: false, // 是否显示百分比以及生产入库成本
            pickingAmount: undefined, // 领料金额
            percentage: undefined, // 百分比
            productionAccounting: props.productionAccounting,
            syAmount: props.amount, //剩余金额
        }

        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
    }

    componentDidMount = () => {
        this.load()
    }

    load = async (parmas, type, searchContent, inventoryType) => {
        this.setState({loading: true})
        const {sort} = this.state
        const res = await this.props.getInventory(parmas, type, searchContent, inventoryType, sort)
        let list = res && res.list ? fromJS(res.list) : fromJS([])

        if (type == 'add' && list.length != 0) {
            const listOwn = this.state.list
            list = list.toJS().map(item => {
                listOwn.forEach((obj) => {
                    if (obj.quantity && item.id == obj.id) {
                        item.quantity = obj.quantity
                    }
                })
                return item
            })
            list = fromJS(list)
        }

        this.setState({list: list.toJS(), loading: false})
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    onOk = () => {
        const tableCheckbox = this.state.tableCheckbox
        let selectedOption = fromJS(tableCheckbox.selectedOption).toJS(), 
        quantityEmp = false, 
        list = this.state.list

        let newSelectList = []
        for (let item of selectedOption) {
            if (item) {
                for(let obj of list) {
                    if (item.id == obj.id) {
                        newSelectList.push(obj)
                        break
                    }
                }
            }
        }
        if (newSelectList.length == 0) {
            this.props.handleTip(newSelectList, null)
            return false
        } 
        
        for(let item of newSelectList) {
            if (item.quantity == undefined) {
                quantityEmp = true
                list = list.map((obj, index) => {
                    if (obj.id == item.id) {
                        obj.quantityEmp = true
                    }
                    return obj
                })
            }
        }
        // 把数量必填去掉
        // if (quantityEmp) {
        //     this.props.handleTip(newSelectList, quantityEmp)
        //     this.setState({list: list})
        //     return false
        // }

        newSelectList = newSelectList.map((item, index) => {
            item.inventoryCode = item.code
            item.inventoryName = item.name
            item.inventoryId = item.id

            // 结存数量及金额
            if(typeof item.periodEndAmount == 'undefined') item.periodEndAmount = null
            if(typeof item.periodEndQuantity == 'undefined') item.periodEndQuantity = null

            item.price = item.periodEndPrice
            
            delete item.code
            delete item.name
            delete item.id
            return item
        })

        this.props.productSelectOk(fromJS(newSelectList).toJS())
    }

    handleSearch = (value) => {
        const inventoryType = this.state.inventoryType
        this.load(value, 'search', null, inventoryType)
        this.setState({
            searchContent: value,
            tableCheckbox: {
                checkboxValue: [],
				selectedOption: []
            }
        })
    }

    handleInputChange = (e) => {
        let value = e.target.value
        this.setState({searchContent: value})
        let keyRandom = Math.floor(Math.random()*10000000)
        this.keyRandom = keyRandom
        clearTimeout(this.time)
        this.time = setTimeout(() => {
            if( keyRandom == this.keyRandom ) {
                this.handleSearch(value)
            }
        }, 100)
    }

    handleSelectChange = (e) => {
        const searchContent = this.state.searchContent
        this.load(e, 'change', searchContent, null)
        this.setState({
            inventoryType: e,
            tableCheckbox: {
                checkboxValue: [],
				selectedOption: []
            }
        })
    }

    handleQuantityBlur = (v, indexList) => {
        let list = this.state.list
        let tableCheckbox = this.state.tableCheckbox
        list[indexList].quantity = v
        list[indexList].amount =  v * list[indexList].periodEndPrice
        if (v) {
            list[indexList].quantityEmp = false

            //填写数量自动勾选复选框
            let isHave = false
            tableCheckbox.selectedOption.forEach((item,index) => {
                if (item.id == list[indexList].id) {
                    isHave = true
                } 
                if (isHave) {
                    tableCheckbox.selectedOption.splice(index, 1)
                }
            })
            tableCheckbox.selectedOption.push(list[indexList])
            this.setState({
                list: list, 
                tableCheckbox: {
                    checkboxValue: [...new Set([...tableCheckbox.checkboxValue, list[indexList].id])],
                    selectedOption: fromJS(tableCheckbox.selectedOption).toJS()
                }
            })
        } else {
            this.setState({
                list: list
            })
        }
    }

    checkboxChange = (arr, itemArr) => {
        let list = this.state.list
        
        list = list.map((item,index) => {
            let quantityEmp = false
            for(let value of arr) {
                if(item.id == value) {
                    quantityEmp = true
                }
            }

            if (!quantityEmp) {
                item.quantityEmp = false
            }
            return item
        })

        this.setState({
            tableCheckbox: {
                checkboxValue: arr,
                selectedOption: itemArr,
            },
            list: list
        })
    }

    addInventory = async() => {
        const res = await this.props.addInventory()
        if (res) {
            const inventoryType = this.state.inventoryType
            const searchContent = this.state.searchContent
            this.load('', 'add', searchContent, inventoryType)
        }
    }


    renderQuantity = (name, rowData, index) => {
        return <Input.Number 
        value={addThousPos(rowData.quantity, true, null, 6)}
        precision={6}
        executeBlur={true}
        style={{height: '26px', border: rowData.quantityEmp ? '1px solid red' : '1px solid #d9d9d9', textAlign:'right'}}
        onBlur={(v) => this.handleQuantityBlur(v, index)}/>
    }

    renderText = (name, rowData, index) => {
        return <div title={rowData[name]} 
        style={{display:'block',textOverflow: 'ellipsis',overflow: 'hidden', whiteSpace: 'nowrap'}}>
        {rowData[name]}
        </div>
    }

    renderNumber = (name, rowData, index) => {
        let obj = null
        
        switch(name) {
            case 'periodEndAmount':  obj = {
                children: addThousPos(rowData.periodEndAmount, true, null, 2)
            }; break;
            case 'periodEndQuantity':  obj = {
                children: addThousPos(rowData.periodEndQuantity, true, null, 6)
            }; break;
            case 'periodEndPrice':  
            obj = rowData.periodEndPrice > 0 ? {
                children: addThousPos(rowData.periodEndPrice, true, null, 6)
            } : '';
            break;
            case 'amount':  
            obj = {
                children: addThousPos(rowData.amount, true, null, 2)
            };
            break;
            default: obj = {
                children: ''
            }; 
        }

        return obj
    }

    getTableScroll = () => {
        try {
            let tableOption = this.state.tableOption
            let dom = document.getElementsByClassName('table')[0]
            let tableDom
            if (!dom) {
                return
            }
            tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
            tableDom.scrollTop = 0;
            tableDom.scrollLeft = 0;
            if (tableDom && dom) {
                let num = dom.offsetHeight - tableDom.offsetHeight
                if (num < 74) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    tableOption = {
                        ...tableOption,
                        y: height - 74
                    }
                    this.setState({tableOption: tableOption})
                } else { // 当数量太少 不用出现滚动条
                    delete tableOption.y
                    this.setState({tableOption: tableOption})
                }
            }
        } catch (err) {
            // console.log(err)
        }
    }

    renderSyAmount = () => {
        let {amount} = this.state
        let amountTotal = this.props.sumColumn('amount')
        amount = clearThousPos(amount, true)
        amountTotal = clearThousPos(amountTotal, true)
        return addThousPos(Number(amount)-Number(amountTotal), true, null, 2) || '0.00'
    }

    sortChange = (name, value) => {
        let {sort, inventoryType} = this.state
        sort.userOrderField = name
        sort.order = value
        this.setState({sort})
        this.load(null, null, null, inventoryType)
    }

    handleCheckBox = (e) => {
        this.setState({
            isVisiablePer: e.target.checked
        })
    }

    // 自动领料
    automaticAcquisition = () => {
        let {tableCheckbox, pickingAmount, list, amount} = this.state
        let {selectedOption = []} = tableCheckbox

        if (!tableCheckbox.checkboxValue.length) {
            this.props.handleTip(null, null, 'picking')
            return
        }

        pickingAmount = clearThousPos(pickingAmount, true)

        // console.log(clearThousPos(pickingAmount, true), pickingAmount >= 0, 'clearThousPos(pickingAmount, true)')

        if (!(pickingAmount >= 0)) {
            this.props.handleTip(null, null, 'pickingNum')
            return
        }

        let periodEndAmountTotal = 0
        selectedOption.forEach(item => {
            periodEndAmountTotal += item.periodEndAmount
        })

        let lastIndex = 0, amountTotal = 0
        list.forEach((item ,index)=> {
            let selectObj = selectedOption.find(obj => {
                lastIndex = index
                return obj.id == item.id
            }) || {}
            item.amount = addThousPos((selectObj.periodEndAmount/periodEndAmountTotal)*pickingAmount, true, null, 2)
            amountTotal += selectObj.periodEndAmount/periodEndAmountTotal*pickingAmount
        })

        // console.log(lastIndex, amountTotal, pickingAmount, 'lastIndex')
        if (amountTotal != pickingAmount) {
            console.log(pickingAmount, amountTotal, '******')
            list[lastIndex].amount =  clearThousPos(list[lastIndex].amount, true) + (pickingAmount - amountTotal)
            list[lastIndex].amount = addThousPos(list[lastIndex].amount, true, null, 2)
        }

        amount = clearThousPos(amount, true)
        this.setState({list, syAmount: addThousPos(amount- amountTotal, true, null, 2)})

        // let periodEndAmountTotal = 0
        // selectedOption.forEach(item => {
        //     periodEndAmountTotal += item.periodEndAmount
        // })


        // list.forEach(item => {
        //     let selectObj = selectedOption.find(obj => obj.id == item.id) || {}
        //     item.amount = addThousPos((selectObj.periodEndAmount/periodEndAmountTotal)*pickingAmount, true, null, 2)
        // })

        // this.setState({list})
    }

    // 全额领料
    fullAcquisition = () => {
        let {tableCheckbox, pickingAmount, list, amount} = this.state
        let {selectedOption = []} = tableCheckbox
        if (!tableCheckbox.checkboxValue.length) {
            this.props.handleTip(null, null, 'picking')
            return
        }

        // if (!(clearThousPos(pickingAmount, true) >= 0)) {
        //     this.props.handleTip(null, null, 'pickingNum')
        //     return
        // }

        let amountTotal = 0
        list.forEach(item => {
            let selectObj = selectedOption.find(obj => obj.id == item.id) || {}
            item.amount = addThousPos(selectObj.periodEndAmount, true, null, 2)
            amountTotal += selectObj.periodEndAmount || 0
        })

        amount = clearThousPos(amount, true)
        this.setState({
            list, 
            pickingAmount: addThousPos(amountTotal, true, null, 2), 
            syAmount: addThousPos(amount- amountTotal, true, null, 2)
        })
    }

    handleBlur = (e, type) => {
        let value = e || 0, isOk = true, sfObj = {}, {productAmount} = this.state
        
        if (type == 'percentage') {
            if (value <0) {
                this.props.handleTip(null, null, 'percentage')
                isOk = false
                sfObj['percentage'] = ''
            } else {
                let pickingAmount = productAmount * (value / 100)
                sfObj['percentage'] = addThousPos(value, true, null, 2)
                sfObj['pickingAmount'] = addThousPos(pickingAmount, true, null, 2)
            }
        } else {
            let percentage = (value/productAmount)*100
            sfObj['pickingAmount'] = addThousPos(value, true, null, 2)
            sfObj['percentage'] = addThousPos(percentage, true, null, 2)
        }

        this.setState(sfObj)
    }

    renderGapNumber = (name, rowData, index) => {
        let value = null

        if (name == 'gapQuantity') {
            if ((rowData.periodEndQuantity - (rowData.quantity || 0 )) < 0) {
                value = addThousPos( Math.abs(rowData.periodEndQuantity - (rowData.quantity || 0 )), true, null, 6)
            }
        } else if (name == 'gapAmount'){
            if ((rowData.periodEndAmount - (rowData.amount || 0)) < 0) {
                value = addThousPos(Math.abs(rowData.periodEndAmount - (rowData.amount || 0)), true, null, 2)
            }
        }
        return value
    }


    render() {
        const {list, tableCheckbox, tableOption, loading, sort, amount, 
            productAmount, isVisiablePer, pickingAmount, percentage, productionAccounting, syAmount} = this.state
        let {title, selectList} = this.props
        selectList = this.props.selectList || []
        
        const columns = [{
            title: '原料',
            children:[{
                name: 'code',
                title: '存货编码',
                dataIndex: 'code',
                align: 'center',
                width: '65px'
            },{
                name: 'name',
                title: '存货名称',
                dataIndex: 'name',
                align: 'left',
                render: (_rowIndex, v, index)=>{ return this.renderText("name", v, index)},
                width: '160px'
            },{
                name: 'specification',
                title: '规格型号',
                dataIndex: 'specification',
                align: 'left',
                render: (_rowIndex, v, index)=>{ return this.renderText("specification", v, index)},
                width: '85px'
            },{
                name: 'unitName',
                title: '单位',
                dataIndex: 'unitName',
                align: 'center',
                width: '65px'
            }]
        },{
            title: '期末结存',
            children:[{
                name: 'periodEndQuantity',
                title: <TableSort 
                title='数量'
                handleClick={(e) => {this.sortChange("periodEndQuantity", e)} } 
                sortOrder={sort.userOrderField == "periodEndQuantity" ? sort.order : null}/>,
                key: 'periodEndQuantity',
                dataIndex: 'periodEndQuantity',
                align: 'right',
                render:(_rowIndex, v, index)=>{ return this.renderNumber("periodEndQuantity", v, index)},
                width: '110px',
            },{
                name: 'periodEndPrice',
                title:'单价',
                dataIndex: 'periodEndPrice',
                align: 'right',
                render:(_rowIndex, v, index)=>{ return this.renderNumber("periodEndPrice", v, index)},
                width: '110px',
            },{
                name: 'periodEndAmount',
                title: <TableSort 
                title='金额'
                handleClick={(e) => {this.sortChange("periodEndAmount", e)} } 
                sortOrder={sort.userOrderField == "periodEndAmount" ? sort.order : null}/>,
                key: 'periodEndAmount',
                dataIndex: 'periodEndAmount',
                align: 'right',
                render:(_rowIndex, v, index)=>{ return this.renderNumber("periodEndAmount", v, index)},
                width: '110px',
            }]
        },{
            title: '领料出库',
            children:[{
                name: 'quantity',
                title: '数量',
                render:(_rowIndex, v, index)=>{ return this.renderQuantity("quantity", v, index)},
                width: '110px',
                style: {padding: '4px 6px !important'}
            },{
                name: 'periodEndPrice',
                title: '单价',
                dataIndex: 'periodEndPrice',
                align: 'right',
                render:(_rowIndex, v, index)=>{ return this.renderNumber("periodEndPrice", v, index)},
                width: '110px',
            },{
                name: 'amount',
                title: '金额',
                dataIndex: 'amount',
                align: 'right',
                render:(_rowIndex, v, index)=>{ return this.renderNumber("amount", v, index)},
                width: '110px',
            }]
        },{
            title: '库存缺口',
            children:[{
                name: 'gapQuantity',
                title: '数量',
                dataIndex: 'gapQuantity',
                align: 'right',
                render:(_rowIndex, v, index)=>{ return this.renderGapNumber("gapQuantity", v, index)},
                width: '110px',
            },{
                name: 'gapAmount',
                title: '金额',
                dataIndex: 'gapAmount',
                align: 'right',
                render:(_rowIndex, v, index)=>{ return this.renderGapNumber("gapAmount", v, index)},
                width: '110px',
            }]
        }]
        return(
            <div>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                        <Input.Search
                        placeholder="名称/规格型号/编码"
                        onChange={this.handleInputChange}
                        onSearch={(value) => this.handleSearch(value)}
                        style={{ width: 200, height: 30}}
                        value={this.state.searchContent}
                        />
                        <Select style={{ width: 120 , height: 30, marginLeft: '8px'}} 
                        placeholder='存货分类'
                        allowClear= {true}
                        onChange={(e) => this.handleSelectChange(e)}>
                            {
                                selectList.map((item, index) => {
                                    return <option key={item.id} value={item.name}>{item.name}</option>
                                })
                            }
                        </Select> 
                    </div>
                    <div className='butDiv'>
                        <Form>
                            <Form.Item label='领料金额'><Input.Number onBlur={(e) => this.handleBlur(e, 'pickingAmount')} value={pickingAmount}/></Form.Item>
                        </Form>
                        <Button onClick={() => this.automaticAcquisition()}>自动领料</Button>
                        <Button onClick={() => this.fullAcquisition()}>全额领料</Button>
                        <Button onClick={() => this.addInventory()}>新增存货</Button>
                    </div>
                </div>
                <div className='middleProduction' style={productionAccounting != 0 ? {display: 'block'} : {display: 'none'}}>
                    <div className='middleLeft'>
                        <div className='amountTotal'>
                            <span>产成品入库直接材料合计余额：</span>
                            <span>{amount || '0.00'}</span>
                        </div>
                        <div className='syAmount'>
                            <span>剩余余额：</span>
                            <span>{syAmount}</span>
                        </div>
                        <div className='check'>
                            <Checkbox onChange={(e) => this.handleCheckBox(e)}>按生产入库成本百分比确定领料金额</Checkbox>
                        </div>
                        <div className='form' style={isVisiablePer ? {display: 'inline-block'} : {display: 'none'}}>
                            <Form>
                                <Form.Item label='百分比'>
                                    <Input.Number 
                                    onBlur={(e) => this.handleBlur(e, 'percentage')}
                                    customAttribute={Math.random()*10000} 
                                    value={percentage}/>
                                    <span> %</span>
                                </Form.Item>
                            </Form>
                        </div>
                        <div className='span' style={isVisiablePer ? {display: 'inline-block'} : {display: 'none'}}>
                            <span>生产入库成本: </span>
                            <span>{productAmount ? `${productAmount} 元` : '0.00 元'}</span>
                        </div>
                    </div>
                    {/* <div className='middleRight'>
                        <div className='check'>
                            <Checkbox onChange={(e) => this.handleCheckBox(e)}>按生产入库成本百分比确定领料金额</Checkbox>
                        </div>
                        <div className='form' style={isVisiablePer ? {display: 'inline-block'} : {display: 'none'}}>
                            <Form>
                                <Form.Item label='百分比'>
                                    <Input.Number 
                                    onBlur={(e) => this.handleBlur(e, 'percentage')}
                                    customAttribute={Math.random()*10000} 
                                    value={percentage}/>
                                    <span> %</span>
                                </Form.Item>
                            </Form>
                        </div>
                        <div className='span' style={isVisiablePer ? {display: 'inline-block'} : {display: 'none'}}>
                            <span>生产入库成本: </span>
                            <span>{productAmount ? `${productAmount} 元` : '0.00 元'}</span>
                        </div>
                    </div> */}
                </div>
                <div style={{height: '290px', marginTop: '10px'}}>
                    <Table 
                    emptyShowScroll={true}
                    className='table'
                    checkboxKey='id'
                    loading={loading}
                    checkboxChange={(e, itemArr) => this.checkboxChange(e, itemArr)}
                    checkboxValue={tableCheckbox.checkboxValue}
                    scroll={list.length > 0 ? tableOption : {}}
                    pagination={false}
                    enableSequenceColumn={false}
                    Checkbox={false}
                    bordered={true}
                    dataSource={list}
                    columns={columns}
                    style={{height: '290px',borderRight: '1px solid #d9d9d9'}}
                    allowColResize={false} />
                </div>
            </div>
        )
    }
}

export default Productselect