import React from 'react'
import {Table, Select, Button} from 'edf-component'
import { Map, fromJS } from 'immutable'

class InventorySubjectSet extends React.Component{
    constructor(props) {
        super(props)
        this.state= {
            // loading: true,
            tableOption: {},
            glAccounts:[],
            list: []
        }
        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async() => {
        let { list } = this.state
        let isHave = false
        list.forEach(item => {
            if (!item.inventoryRelatedAccountId) isHave = true
        })
       
        const res = await this.props.handleOk(isHave, list)
        if (res == false) {
            return false
        }
    }

    componentDidMount = async() =>{
        let {glAccounts, unSetRelateAccountsInventorys} = this.props
        this.setState({
            glAccounts: glAccounts||[],
            list: unSetRelateAccountsInventorys||[]
        })
        setTimeout(() => {
            this.getTableScroll()
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
                if (num < 36) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    tableOption = {
                        ...tableOption,
                        y: height -36
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

    handleSelectChange = (e, index) => {
        let {list} = this.state
        list[index].inventoryRelatedAccountId = e
        this.setState({
            list: list
        })
    }

    addSubject = async(rowDate, index) => {
        const res = await this.props.addSubject()
        let {list, glAccounts} = this.state
        if (res) {
            const item = res.addItem
            if (item.isEnable) list[index].inventoryRelatedAccountId = item.id

            glAccounts = res.glAccounts
            this.setState({
                list: list,
                glAccounts: glAccounts
            })
        }
    }

    renderText = (name, rowData, index) => {
        const glAccounts = this.state.glAccounts
        if(name == 'subject') {
            return <Select 
            allowClear= {true} 
            onChange={(e) => this.handleSelectChange(e,index)}
            dropdownStyle={{ width: '283px' }}
            value={rowData.inventoryRelatedAccountId&&rowData.inventoryRelatedAccountId}
            filterOptionExpressions='code,name,helpCode,helpCodeFull'
            dropdownFooter={
                <Button type='primary' 
                    style={{ width: 283, borderRadius: '0' }}
                    onClick={()=>this.addSubject(rowData, index) }>新增科目
                </Button>
            }>
                {
                    glAccounts.map((item, index) => {
                        return <Option key={item.id} value={item.id}>{item.codeAndName}</Option>
                    })
                }
            </Select>
        }

        return <div title={rowData[name]} 
        style={{display:'block',textOverflow: 'ellipsis',overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left'}}>
        {rowData[name]}
        </div>
    }

    render() {
        const {list, tableOption} = this.state
        const columns = [
            {
                name: 'inventoryCode',
                title: '存货编码',
                dataIndex: 'inventoryCode',
                align: 'center',
                width: '85px'
            },{
                name: 'inventoryName',
                title: '存货名称',
                dataIndex: 'inventoryName',
                // align: 'left',
                width: '270px',
                render: (_rowIndex, v, index)=>{ return this.renderText("inventoryName", v, index)},
            },{
                name: 'subject',
                title: '存货对应科目',
                dataIndex: 'subject',
                width: '300px',
                render: (_rowIndex, v, index)=>{ return this.renderText("subject", v, index)},
            }
        ]
        return (
            <div className='wrap'>
                <div className='tip'>下列存货没有设置对应科目，全部设置后，才能同步科目期初</div>
                <div style={{height: '300px', marginTop: '12px'}}>
                    <Table 
                    emptyShowScroll={true}
                    className='table'
                    // loading={loading}
                    scroll={list.length > 0 ? tableOption : {}}
                    pagination={false}
                    enableSequenceColumn={false}
                    Checkbox={false}
                    bordered={true}
                    dataSource={list}
                    columns={columns}
                    style={{height: '300px',borderRight: '1px solid #d9d9d9'}}
                    allowColResize={false} />
                </div>
            </div>
        )
    }
}

export default InventorySubjectSet