import React from 'react'
import { Form, Radio, Button, Table, Input, Select } from 'edf-component'
const FormItem = Form.Item

class currentAccount extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            metaAction: props.metaAction,
            store: props.store,
            webapi: props.webapi,
            selectOption: props.selectOption,
            list: props.list,
            vatOrEntry: props.vatOrEntry,
            setOkListener: props.setOkListener,
            setCancelLister: props.setCancelLister,
            id: props.id,
            oldId: props.relationId,
            tableOption: {
                x: 1,
                y: null
            },
        }
        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
        if( props.setCancelLister ) {
            props.setCancelLister(this.onCancel)
        }
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
            let domContainer = document.getElementsByClassName('current-account-model-table')[0];
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
    componentWillUnmount = () => {

        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = undefined;
        }

    }

    onOk = async() => {
        let newList = [], oldId = this.state.oldId
        const {id, vatOrEntry} = this.state
        if(vatOrEntry){
            newList.push({
                supplierId: id,
                id: oldId
            })
        }else{
            newList.push({
                customerId: id,
                id: oldId
            })
        }
        return newList
    }
    onCancel = async() => {
        // console.log('onCancel')
    }
    getContent = (text, record, index, type) => {
        let obj
        obj = {
            children: record[type],
            props: {
                colSpan: 1
            }
        }
        return obj
    }

    // 下拉
    getSupplierOption = () => {
        const {selectOption} = this.state
        return selectOption.map(item => {
            return <Option title={item.name} value={item.id}>{item.name}</Option>
        })
    }
    addSupplier = async() => {
        const {metaAction, store, webapi} = this.state
		const ret = await metaAction.modal('show', {
            title: '新增供应商',
            width: 700,
            children: metaAction.loadApp(
                'app-card-vendor', {
                    store: store
                }
            )
        })
        if(ret) {
            const option = await webapi.getSupplierOption()
            this.changeSupplier(ret.id)
            this.setState({
                selectOption: option.list,
                id: ret.id
            })
        }
    }
    addCustomer = async() => {
        const {metaAction, store, webapi} = this.state
        const ret = await metaAction.modal('show', {
            title: '新增客户',
            width: 700,
            children: metaAction.loadApp(
                'app-card-customer', {
                    store: store
                }
            )
        })
        if(ret) {
            const option = await webapi.getCustomerOption()
            this.changeSupplier(ret.id)
            this.setState({
                selectOption: option.list,
                id: ret.id
            })
            
        }
    }

    changeSupplier = async(v) =>{
        const {webapi, vatOrEntry, list} = this.state
        let res
        if(vatOrEntry){
            res = await webapi.getSupplier({supplierId: v})
        }else{
            res = await webapi.getCustomer({customerId: v})
        }

        this.setState({
            id: v,
            list: res
        })
        setTimeout(()=>{
            this.onResize()
        }, 20)
    }

    render(){
        const { list, id, tableOption, vatOrEntry} = this.state

        let columns = []  
        if(vatOrEntry){
            columns = [
                {
                    fieldName: 'name',
                    title: '销方名称',
                    dataIndex: '1',
                    key: '1',
                    render: (text, record, index) => this.getContent(text, record, index, 'supplierName')
                },
                {
                    fieldName: 'supplier',
                    dataIndex: '2',
                    title: '供应商',
                    key: '2',
                    render: (text, record, index) => this.getContent(text, record, index, 'name')
                }
            ]
        }else{
            columns = [
                {
                    fieldName: 'name',
                    title: '购方名称',
                    dataIndex: '1',
                    key: '1',
                    render: (text, record, index) => this.getContent(text, record, index, 'customerName')
                },
                {
                    fieldName: 'customerName',
                    dataIndex: '2',
                    title: '客户',
                    key: '2',
                    render: (text, record, index) => this.getContent(text, record, index, 'name')
                }
            ]
        }
        
        return (
            <div className='current-account-model-table'>
                {vatOrEntry ? 
                    <FormItem label='供应商'>
                        <Select
                            value={id}
                            style={{ width: '100%' }}
                            onChange={(value) => this.changeSupplier(value)}
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            dropdownFooter={
                                <Button type='primary' 
                                    style={{ width: '100%', borderRadius: '0' }}
                                    onClick={()=>this.addSupplier() }>新增供应商
                                </Button>
                            }>
                            {this.getSupplierOption()}
                        </Select>
                    </FormItem>
                    :<FormItem label='客户'>
                        <Select
                            value={id}
                            style={{ width: '100%' }}
                            onChange={(value) => this.changeSupplier(value)}
                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            dropdownFooter={
                                <Button type='primary' 
                                    style={{ width: '100%', borderRadius: '0' }}
                                    onClick={()=>this.addCustomer() }>新增客户
                                </Button>
                            }>
                            {this.getSupplierOption()}
                        </Select>
                    </FormItem>
                }
                <Table className='current-account-model-table-tab'
                    pagination={false}
                    emptyShowScroll={true}
                    allowColResize={false}
                    enableSequenceColumn={false}
                    bordered={true}
                    dataSource={list}
                    rowSelection={undefined}
                    scroll={list.length > 0 ? tableOption : {}}
                    columns={columns}>
                </Table>
            </div>
        )
    }
}

export default currentAccount
