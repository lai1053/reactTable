import React from 'react'
import {Spin, Input, Icon, Popover,Select,Button,DatePicker,Radio,Table} from 'edf-component'
const { RangePicker } = DatePicker;
const { Option } = Select;
import {columnData} from './fixdData'
export default class SalePurchaseStat extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            inputVal: '',
            showPopoverCard:false,
            formContentSaleStatus:'',
            nsqj:'',
            mode:1,
            list:[
                {
                    hwmc:"螺丝钉",
                    ggxh:'1*1',
                    dw:'个',
                    xxsl:'3',
                    xxje:'3.22',
                    jxsl:'2',
                    jxje:'5.55',
                    cesl:'1.23',
                    ceje:'4.22'
                }
            ]
        }
        
    }
    
    onSearch() {
    
    }
    filterList(){
    
    }
    resetForm(){
    
    }
    handleMonthPickerChange(e){
        console.log(123.);
        console.log(e);
    }
    export(){
        console.log(this.state);
    }
    renderTaxAmount(text,record,item){
        console.log(text, record, item);
    }
    renderColums(){
        const arr = []
        const column = columnData
        let width = 0
        const fixedTable = false
        column.forEach((item, index) => {
            if (item) {
                width += item.width
                if (item.children) { // 判断是否进入了有多级表头的分支
                    const child = [] // 多表头
                    let col //  一级表头是否要显示 *** 状态栏显示
                    item.children.forEach(subItem => {
                        if (subItem.isSubTitle) { // 二级表头渲染方式
                            child.push({
                                title: subItem.caption,
                                dataIndex: subItem.fieldName,
                                key: subItem.fieldName,
                                width: subItem.width,
                                align: subItem.align,
                                className: subItem.className,
                                //render: (text, record) => (this.renderTaxAmount(text, record, subItem.type))
                            })
                        } else { // 状态一级表头渲染方式
                          //正常状态显示
                                col = {
                                    title: subItem.caption,
                                    dataIndex: subItem.fieldName,
                                    key: subItem.fieldName,
                                    width: subItem.width,
                                    align: 'center',
                                    className: subItem.className,
                                    render: (text, record) => (this.renderTaxAmount(record, subItem.type))
                                }
                        }
                    })
                    arr.push({ // 表头数据
                        title: item.caption,
                        align: item.align,
                        children: child,
                        className: item.className,
                    })
                    if (col) {
                        arr.push(col)
                    }
                } else { // 常规操作
                    arr.push({
                        title: item.caption,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        width: item.width,
                        align: 'center',
                        className: item.className,
                        //render: (text, record) => (this.renderTaxAmount(text, record, item)), // 特殊字段处理
                        fixed: fixedTable ? item.isFixed : ''
                    })
                }
            }
        })
        return arr
    }
    render() {
        return (
            <Spin spinning={this.state.loading} delay={1} wrapperClassName={'spin-box'} size='large' tip={'数据处理中...'}>
                <div className='inv-batch-custom-header'>
                    <div className='header-left'>
                        <Input
                            className='inv-batch-custom-header-filter-input'
                            type='text'
                            placeholder='请输入商品名称'
                            value={this.state.inputVal}
                            onChange={(value) => {
                                this.setState({inpuValue: value})
                            }}
                            onPressEnter={() => {
                                this.onSearch.bind(this)
                            }}
                            prefix={<Icon type="search"></Icon>}
                        >
                        </Input>
                        <Popover
                            popupClassName='inv-batch-custom-popover'
                            placement='bottom'
                            trigger='click'
                            visible={this.state.showPopoverCard}
                            onVisibleChange={(v)=>{this.setState({showPopoverCard:v})}}
                            content={
                                <div className='inv-batch-custom-popover-content'>
                                    <div className='filter-conte'>
                                        <div className='inv-batch-custom-popover-item'>
                                            <span className='inv-batch-custom-popover-label'>差额绝对值:</span>
                                            <Select
                                                className='inv-batch-custom-popover-option'
                                                getPopupContainer={(trigeer)=>{return trigeer.parentNode}}
                                                value={this.state.formContentSaleStatus}
                                                onChange={(value)=>this.setState({formContentSaleStatus:value})}
                                            >
                                                <Option style={{alignitems: 'center'}} value={1}>≥</Option>
                                                <Option value={2}>=</Option>
                                                <Option value={3}>≤</Option>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className='filter-footer'>
                                        <Button
                                            type='primary'
                                            onClick={()=>{this.filterList.bind(this)}}
                                        >
                                            查询
                                        </Button>
                                        <Button
                                            className= 'reset-btn'
                                            onClick={()=>{this.resetForm.bind(this)}}
                                        >
                                            重置
                                        </Button>
                                    </div>
                                </div>
                            }
                        >
                            <span className= 'inv-batch-custom-filter-btn header-item'>
                                <Icon type='filter'></Icon>
                            </span>
                        </Popover>
                        <span className='tax-month header-item'>
                            <label>报税月份</label>
                        </span>
                        <RangePicker
                            picker="year"
                            value={this.state.nsqj}
                            format={"YYYYMM"}
                            onChange={(e)=>this.handleMonthPickerChange(e)}
                        />
                        <Radio.Group
                            style={{marginLeft:'10px'}}
                            onChange={(e)=>this.setState({mode:e.target.value})}
                            value={this.state.mode}
                        >
                            <Radio value={1}>商品</Radio>
                            <Radio value={2}>商品+规格</Radio>
                            <Radio value={3}>商品+规格+单位</Radio>
                        </Radio.Group>
                    </div>
                    <div className='header-right'>
                        <Button
                            className= 'reset-btn'
                            onClick={()=>this.export()}
                        >
                            导出
                        </Button>
                    </div>
                </div>
                <Table
                    className='inv-batch-custom-table'
                    bordered={true}
                    dataSource={this.state.list}
                    columns={this.renderColums()}
                    delay={0}
                >
                </Table>
            </Spin>)
    }
}