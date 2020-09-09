import React from 'react'
import { Select, Input, Button, Table, Form } from 'edf-component'
import { Map, fromJS } from 'immutable'
import { addThousPos } from '../../../../utils/number'
class SettlementAccount extends React.Component {
    constructor(props){
        super(props)
        this.state={
            list:[],
            searchContent: '',
            loading: true,
            tableOption: {
                x: 1,
                y: 100
            },
            tableCheckbox: {
                checkboxValue: [],
				selectedOption: []
            },
            settleObj:{},
            settleList: [],
            selectValueList: [],
            selectedOption: [], // 全部的
            selectedOptionNew: [], //当前勾选的
            selectBatchSettleId: ''
        }
    }

    componentDidMount = async() => {
        // console.log('lllalalalalallalalallal')
        this.setState({
            loading: true
        })
        await this.load('init')
        const settleList = this.props.bankAccount
        const vatOrEntry = this.props.vatOrEntry

        let selectedOption = fromJS(this.props.selectedOption).toJS()
        // console.log(selectedOption, 'selectedOption')
        //// 这块前端自己过滤的 满足条件的展示到结算科目列表
        // let list = selectedOption.filter(o => o.settledAmount < o.taxInclusiveAmount)

        //// 这里自己加的字段 等接口里面有了就可以去掉这块
        let list = selectedOption
        list = list.map(item => {
            // item.bankAccountId = vatOrEntry ? 3000050006 : 3000050005
            item.bankAccountId = item.bankAccountId ? item.bankAccountId : vatOrEntry ? 6 : 5
            item.bankAccountTypeId = item.bankAccountTypeId ? item.bankAccountTypeId : vatOrEntry ? 3000050006 : 3000050005
            return item
        })
        ////

        this.setState({
            settleList: settleList,
            // list: list,
            list:selectedOption,
            // selectedOption: list, //这里是为了取消搜索过滤之后能拿到全部的
            selectedOption: selectedOption, //这里是为了取消搜索过滤之后能拿到全部的
            selectBatchSettleId: this.props.selectBatchSettleId,
            loading: false
        })
        // this.props.handleShowList(list)
    }

    componentWillReceiveProps = (nextProps) => {
        // console.log(nextProps, 'nextProps')
        let {selectBatchSettleId, selectedOptionNew, list} = this.state
        // if (nextProps.selectBatchSettleId && nextProps.selectBatchSettleId != selectBatchSettleId) {
        if (nextProps.selectBatchSettleObj.id && nextProps.selectBatchSettleObj.id != selectBatchSettleId) {
            list = list.map(item => {
                selectedOptionNew.forEach((obj) => {
                    if (item.id == obj.id) {
                        // item.bankAccountId = nextProps.selectBatchSettleId
                        item.bankAccountId = nextProps.selectBatchSettleObj.id
                        item.bankAccountTypeId = nextProps.selectBatchSettleObj.bankAccountTypeId

                        obj.bankAccountId = nextProps.selectBatchSettleObj.id
                        obj.bankAccountTypeId = nextProps.selectBatchSettleObj.bankAccountTypeId
                    }
                })
                return item
            })
            // console.log(selectedOptionNew, 'selectedOptionNew')
            this.setState({
                list: list,
                // selectBatchSettleId: nextProps.selectBatchSettleId,
                selectBatchSettleId: nextProps.selectBatchSettleObj.id,
                selectedOptionNew: selectedOptionNew
            })

            // 这里是为了点击下一步的时候能够拿到 第一步所选中的那些
            this.props.handSettleCheckbox(selectedOptionNew,'props')
        }
    }

    load = async (type) => {
        const res = await this.props.handleSettleLoad(type)
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    handleSelectChange = (value,index) => {
        if (!isNaN(Number(value))) {
            value = Number(value)
        }
        let {selectValueList, list, tableCheckbox, settleList, selectedOption} = this.state
        selectValueList[index] = value
        list[index].bankAccountId = value

        let typeValue = null
        settleList.forEach(item => {
            if(item.id == value) {
                typeValue = item.bankAccountTypeId
            }
        })

        // selectValueList[index] = value
        list[index].bankAccountTypeId = typeValue

        selectedOption = selectedOption.map(obj => {
            if (obj.id == list[index].id) {
                obj.bankAccountTypeId = typeValue
                obj.bankAccountId = value
            }
            return obj
        })

        let newselectedOption = tableCheckbox.selectedOption.map(item => {
            if (item.id == list[index].id) {
                item.bankAccountTypeId = typeValue
                item.bankAccountId = value
            }
            return item
        })
        // console.log(list, 'list list')
        this.setState({
            selectValueList: selectValueList,
            list: list,
            tableCheckbox:{
                ...tableCheckbox,
                selectedOption: newselectedOption
            },
            selectedOption: selectedOption, // 搜索前端自己写 就要把自己更改的也更新到全部的那个里面 以至于搜索完之后不会冲掉更改的结算方式
        })

        // 这个就是为了更新 所选择的那个项 在这里是为了 当先选择后更改结算方式的时候更够更新下
        // this.props.handSettleCheckbox(newselectedOption, 'selectChange', selectedOption) 
        // console.log([list[index]], 'selectchange')
        this.props.handSettleCheckbox(newselectedOption, 'selectChange', [list[index]])
    }

    // 新增结算方式
    addSettle = async(rowDate, index) => {
        let {settleList, selectValueList, list} = this.state
        const res = await this.props.handleAddSettle(rowDate, 'onerow')
        // console.log(res, 'res add ')
        if (res) {
            list[index].bankAccountId = res.id
            list[index].bankAccountTypeId = res.bankAccountTypeId

            settleList.push(res) 
            // selectValueList[index] = res.name
            this.setState({
                settleList: settleList,
                list: list
                // selectValueList:selectValueList
            })
        }
    }


    renderSettles = (name, rowDate, index) => {
        let {selectValueList, settleList} = this.state
        const {vatOrEntry, bankAccount} = this.props
        settleList = bankAccount.length > settleList.length ? bankAccount : settleList 
        return <Select 
        onChange={(v) => this.handleSelectChange(v,index)}
        value={rowDate.bankAccountId ? rowDate.bankAccountId: vatOrEntry ? 6 : 5}
        dropdownStyle={{ width: '130px' }}
        dropdownFooter={
            <Button type='primary' 
                style={{ width: 130, borderRadius: '0' }}
                onClick={()=>this.addSettle(rowDate, index) }>新增
            </Button>
        }>
            {
                settleList.map((item, index) => {
                    return <Option key={index} value={item.id}>{item.name}</Option>
                })
            }
        </Select>
    }

    renderText = (name, rowData, index) => {
        if ( name == 'notSettleAmount') {
            return <div title={rowData[name]} className='tdText align'>{addThousPos(rowData[name], true)}</div>
        } else {
            return <div title={rowData[name]} className='tdText'>{rowData[name]}</div>
        }
    }


    checkboxChange = (arr, itemArr) => {
        // console.log(arr, itemArr)
        this.setState({
            tableCheckbox: {
                checkboxValue: arr,
                selectedOption: itemArr,
            }
        })

        // 这里是为了点击下一步的时候能够拿到 第一步所选中的那些
        this.props.handSettleCheckbox(itemArr)
    }
    
    // 批量修改结算方式
    handleBatchSettle = async () => {
        const tableCheckbox = this.state.tableCheckbox
        this.props.handleBatchSettle(tableCheckbox.selectedOption)
        this.setState({
            selectedOptionNew: tableCheckbox.selectedOption
        })
    }


    handleSearch = async(value) => {
        const {selectedOption} = this.state
        // console.log(value, 'value')
        this.setState({
            loading: true
        })
        if (value) {
            // const newList = selectedOption.filter(obj => obj.customerName&&obj.customerName.indexOf(value) > -1 
            // || obj.inventoryName&&obj.inventoryName.indexOf(value) > -1 || obj.invoiceNumber&&obj.invoiceNumber.indexOf(value) > -1)
    
            value = value.replace(/\\/g, "\\\\")
            let regExp = new RegExp(value, 'i')

            const newList = selectedOption.filter(obj => obj.customerName&&obj.customerName.search(regExp) != -1 
            || obj.inventoryName&&obj.inventoryName.search(regExp) != -1 || 
            obj.supplierName&&obj.supplierName.search(regExp) != -1||
            obj.invoiceNumber&&obj.invoiceNumber.search(regExp) != -1)


            // this.setState({
            //     list: newList,
            //     loading: false
            // })
            setTimeout(() => {
                this.setState({
                    list: newList,
                    loading: false
                })
            }, 150)
        } else {
            // this.setState({
            //     list: selectedOption,
            //     loading: false
            // })
            setTimeout(() => {
                this.setState({
                    list: selectedOption,
                    loading: false
                })
            }, 150)
        }
        setTimeout(() => {
            this.getTableScroll()
        }, 0)
        // const res = await this.props.handleSettleSearch(value)
        // if (res) {
        //     // console.log(res, 'res search')
        //     const resList = res.list
        //     const tableCheckbox = this.state.tableCheckbox

        //     let newList = []
        //     tableCheckbox.selectedOption.forEach(item => {
        //         resList.forEach(obj => {
        //             if (item.id == obj.id) {
        //                 newList.push(item)
        //             }
        //         })
        //     })

        //     // //// 这里自己添加的字段 等接口里有了 就不用自己加了
        //     // const list = res.list.map(item => {
        //     //     item.bankAccountId = item.bankAccountId ? item.bankAccountId : vatOrEntry ? 6 : 5
        //     //     item.bankAccountTypeId = item.bankAccountTypeId ? item.bankAccountTypeId : vatOrEntry ? 3000050006 : 3000050005
        //     //     return item
        //     // })
        //     // this.setState({
        //     //     list: list
        //     // })
        //     // ////

        //     this.setState({
        //         list: res.list
        //     })

        //     // 这里是为了点击下一步的时候能够拿到 第一步所选中的那些搜索条件过滤后的 
        //     this.props.handSettleCheckbox(newList)
        // }
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
                if (num < 37) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    tableOption = {
                        ...tableOption,
                        y: height - 37
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
   

    render(){
        let { searchContent, tableCheckbox, list, tableOption, loading} = this.state

        // console.log(list, 'list')
        const { vatOrEntry } = this.props
        const columns = [
            {
                name: 'invoiceDate',
                title: '开票日期',
                dataIndex: 'invoiceDate',
                width: '88px'
            },{
                name: 'invoiceNumber',
                title: '发票号码',
                dataIndex: 'invoiceNumber',
                render: (_rowIndex, v, index)=>{ return this.renderText("invoiceNumber", v, index)},
                width: '95px'
            },{
                name: 'inventoryName',
                title: '商品名称',
                dataIndex: 'inventoryName',
                render: (_rowIndex, v, index)=>{ return this.renderText("inventoryName", v, index)},
                // width: '128px'
            },{
                name: 'voucherCustomerName',
                title: '购方名称',
                dataIndex: 'voucherCustomerName',
                _visible: !vatOrEntry ? true : false,
                render: (_rowIndex, v, index)=>{ return this.renderText("voucherCustomerName", v, index)},
                // width: '128px'
            },{
                name: 'voucherSupplierName',
                title: '销方名称',
                dataIndex: 'voucherSupplierName',
                style:"{{display: vatOrEntry ? 'block' : 'none'}}",
                _visible: vatOrEntry ? true : false,
                render: (_rowIndex, v, index)=>{ return this.renderText("voucherSupplierName", v, index)},
                // width: '128px'
            },{
                name: 'notSettleAmount',
                title: '结算金额',
                dataIndex: 'notSettleAmount',
                render: (_rowIndex, v, index)=>{ return this.renderText("notSettleAmount", v, index)},
                width: '105px'
            },{
                name: 'bankAccountId',
                title: '结算方式',
                dataIndex: 'bankAccountId',
                render: (_rowIndex, v, index)=>{ return this.renderSettles("bankAccountId", v, index)},
                width: '139px'
            }
        ]
        return(
            <div className='ttk-scm-app-collate-invoice-form-settlement-wrap'>
                <div style={{marginBottom: '10px'}} className='search'>
                    <Input.Search 
                    placeholder= {vatOrEntry ? '按发票号码/销方名称/商品名称搜索' : '按发票号码/购方名称/商品名称搜索'}
                    onChange={this.handleInputChange}
                    value={searchContent}
                    style={{ width: 240, height: 30}} 
                    onSearch={(v) => {this.handleSearch(v)}}/>
                    <Button onClick={() => {this.handleBatchSettle()}}>批量修改结算方式</Button>
                </div>
                <div>
                    <Table 
                    emptyShowScroll={true}
                    checkboxKey='id'
                    className='table'
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
                    style={{height: '250px',borderRight: '1px solid #d9d9d9'}}
                    allowColResize={false} />
                </div>
            </div>
        )
    }
}

export default SettlementAccount