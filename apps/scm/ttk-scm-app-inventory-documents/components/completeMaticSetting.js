import React from 'react'
import { Button, Table,  DatePicker, Input, Select} from 'edf-component'
import moment from 'moment'
import utils from 'edf-utils'
const InputNumber = Input.Number

class currentAccount extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            tableOption: {
                x: 1,
                y: null
            },
            detail: props.detail || [],
            influenceRelation: props.influenceRelation 
        }

        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async() => {
        let {detail} = this.state, isHave=false
        detail.map(item=>{
            if(!item.accountValues) isHave = true
        })
        if(isHave){
            this.props.metaAction.toast('error', '请设置成本项目与成本大类的对应关系')
            return false
        }else{
            return detail
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
            let appDom=document.getElementsByClassName('cost-income-ratios')[0];//以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0];
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

        let {detail, influenceRelation} = this.props, optionArr = []

        if(detail[detail.length-1].influenceName == '合计') detail.pop()

        if(influenceRelation && influenceRelation.length){
            detail.map((item,index)=>{
                const i = influenceRelation.filter(o=>o.influenceIdKey == item.influenceValue)
                if(i && i.length){
                    detail[index].accountValues = `${i[0].influenceIdVal}`
                }
                item.influenceIdKey = item.influenceValue
                if(index<4) optionArr.push(item)
            })
        }else{
            detail.map((item,index)=>{
                if(index<4){
                    detail[index].accountValues = item.influenceValue
                    item.influenceIdKey = item.influenceValue
                    optionArr.push(item)
                } 
            })
        }

        this.setState({
            optionArr,
            detail: detail
        })
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

    getContent = (text, record ,index) => {
        let obj
        const {optionArr} = this.state
        obj = {
            children: <Select 
                        style={{ height: 30}} 
                        showSearch={false}
                        dropdownClassName='completeMaticCss2-setting'
                        value={record.accountValues}
                        onChange={(e) => this.handleSelectChange(e, index)}>
                        {
                            optionArr && optionArr.map((item, index) => {
                                return <option key={item.influenceValue} value={item.influenceValue}>{item.influenceName}</option>
                            })
                        }
                        </Select>,
            props: { colSpan: 1 }
        }
        return obj
    }

    handleSelectChange = (value, index) => {
        let {detail} = this.state
        detail[index].accountValues = value
        this.setState({
            detail
        })
    }
                                                                
    render(){
        let { tableOption ,detail } = this.state
        
        const columns = [{
            name: 'influenceName',
            title: '成本明细项目',
            dataIndex: 'influenceName',
            align: 'center',
            width: '100px'
        },{
            name: 'accountValues',
            title: '成本项目大类',
            dataIndex: 'accountValues',
            align: 'center',
            render: (text, record, index)=>{return this.getContent(text, record, index)},
            width: '100px'
        }]
        
        return (
            <div className='cost-income-ratios'>
                <Table className='cost-income-ratios-table'
                    pagination={false}
                    emptyShowScroll={true}
                    allowColResize={false}
                    enableSequenceColumn={false}
                    bordered={true}
                    dataSource={detail}
                    rowSelection={undefined}
                    scroll={detail.length > 0 ? tableOption : {}}
                    columns={columns}>
                </Table>
            </div>
        )
    }
}

export default currentAccount
