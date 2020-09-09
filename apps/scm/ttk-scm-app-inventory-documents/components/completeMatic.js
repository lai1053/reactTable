import React from 'react'
import { Button, Table,  DatePicker, Input, Icon} from 'edf-component'
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
            amount: props.amount,
            oldCompleteMatic: props.oldCompleteMatic,
            loading: true
        }

        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async() => {
        let {detail} = this.state, isHave=false
        const set = await this.props.webapi.getInfluenceRelation()

        if (set == null && detail.length> 5) {
            this.props.metaAction.toast('error', '请点击设置按钮，设置成本项目与成本大类的对应关系')
            return false
        } else {
            if(set){
                set.map(item=>{
                    if(!item.influenceIdVal) isHave=true
                })
                if(detail.length-1>set.length) isHave=true
            }
            if(isHave){
                this.props.metaAction.toast('error', '请点击设置按钮，设置成本项目与成本大类的对应关系')
                return false
            }else{
                if(detail[detail.length-1].influenceName == '合计') detail.pop()
                return detail
            }
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
            let appDom=document.getElementsByClassName('cost-income-ratio')[0];//以app为检索范围
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
    componentDidMount = async() => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
        const aaa = await this.automaticValue()
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

    getContent = (text, record ,index, name) => {
        let obj
        // if(record.influenceName != '合计'){
        //     obj = {
        //         children: <InputNumber
        //                     value={record.accountEndBalance}
        //                     onBlur={(v) => this.handleBlur(v, index)} />,
        //         props: { colSpan: 1 }
        //     }
        // }else{
        //     obj = {
        //         children: <span>{record.accountEndBalance}</span>,
        //         props: { colSpan: 1 }
        //     }
        // }
        if(record.influenceName != '合计'){
            obj = {
                children: <InputNumber
                            value={record[name]}
                            onBlur={(v) => this.handleBlur(v, index, name)} />,
                props: { colSpan: 1 }
            }
        }else{
            obj = {
                children: <span>{record[name]}</span>,
                props: { colSpan: 1 }
            }
        }
        
        return obj
    }
    handleBlur = (v, index, name) =>{
        let {detail} = this.state
        if(detail[detail.length-1].influenceName != '合计'){
            detail.push({
                influenceName: '合计',
                accountBeginBalance: this.sumColumn('accountBeginBalance'),
                accountOccurrenceAmount: this.sumColumn('accountOccurrenceAmount'),
                finishedCost: this.sumColumn('finishedCost'),
                accountEndBalance: this.sumColumn('accountEndBalance')
            })
        }

        let value = utils.number.format(Number(v), 2), item = detail[index]
        // detail[index].accountEndBalance = value
        detail[index][name] = value

        // const finishedCost = Number(item.accountBeginBalance.replace(/,/g, '')) 
        //                     + Number(item.accountOccurrenceAmount.replace(/,/g, '')) - v || 0
        const finishedCost = Number(item.accountBeginBalance.replace(/,/g, '')) 
        + Number(item.accountOccurrenceAmount.replace(/,/g, '')) - Number(item.accountEndBalance.replace(/,/g, '')) || 0
        detail[index].finishedCost = utils.number.format(Number(finishedCost), 2)
        this.setState({
            detail: detail
        })

        const len = detail.length-1
        detail[len].finishedCost = this.sumColumn('finishedCost')
        // detail[len].accountEndBalance = this.sumColumn('accountEndBalance')
        detail[len][name] = this.sumColumn(name)
        

        this.setState({
            detail: detail
        })
    }
                                                                
    automaticValue = async(type) =>{
        this.setState({
            loading: true
        })
        const ret = await this.props.automaticValue(this.props.oldFormId, type)
        // const ret = await this.props.automaticValue()
        this.setState({
            loading: false
        })
        if(ret){
            let detail, {oldCompleteMatic} = this.state
            
            if(type == 'btn' || !oldCompleteMatic){
                detail = ret.temps
                if(type == 'btn') this.props.metaAction.toast('success', '取值成功')
            }else{
                detail = oldCompleteMatic
            }

            detail.map((item,index)=>{
                let accountBeginBalance = String(item.accountBeginBalance || 0).replace(/,/g, ''),
                    accountOccurrenceAmount = String(item.accountOccurrenceAmount || 0).replace(/,/g, ''),
                    accountEndBalance = String(item.accountEndBalance || 0).replace(/,/g, '')

                detail[index].accountBeginBalance = utils.number.format(Number(accountBeginBalance), 2)
                detail[index].accountOccurrenceAmount = utils.number.format(Number(accountOccurrenceAmount), 2)
                detail[index].accountEndBalance = utils.number.format(Number(accountEndBalance), 2)

                let finishedCost = Number(accountBeginBalance) 
                                    + Number(accountOccurrenceAmount) 
                                    - Number(accountEndBalance) || 0
                detail[index].finishedCost = utils.number.format(Number(finishedCost), 2)
            })

            this.setState({
                detail: detail
            })

            if(detail[detail.length-1].influenceName != '合计'){
                detail.push({
                    influenceName: '合计',
                    accountBeginBalance: this.sumColumn('accountBeginBalance'),
                    accountOccurrenceAmount: this.sumColumn('accountOccurrenceAmount'),
                    finishedCost: this.sumColumn('finishedCost'),
                    accountEndBalance: this.sumColumn('accountEndBalance')
                })
                this.setState({
                    detail: detail
                })
            }
        }
    }

    sumColumn = (type) =>{
        let {detail} = this.state, num = 0
        detail.map(item=>{
            if(item.influenceName != '合计'){
                let i = item[type].replace(/,/g, '')
                num = num + Number(i)
            } 
        })
        return utils.number.format(num, 2)
    }

    setting = () =>{
        let { detail } = this.state
        this.props.setting(detail)
    }
    
    render(){
        let { tableOption ,detail, amount, loading } = this.state
        amount = utils.number.format(amount, 2)
        
        const columns = [{
            name: 'influenceName',
            title: '成本项目',
            dataIndex: 'influenceName',
            align: 'center',
            width: '150px'
        },{
            name: 'accountBeginBalance',
            title: '月初在产品成本',
            dataIndex: 'accountBeginBalance',
            render: (text, record, index)=>{return this.getContent(text, record, index, 'accountBeginBalance')},
            align: 'center',
            width: '140px'
        },{
            name: 'accountOccurrenceAmount',
            title: '本月发生生产成本',
            dataIndex: 'accountOccurrenceAmount',
            render: (text, record, index)=>{return this.getContent(text, record, index, 'accountOccurrenceAmount')},
            align: 'center',
            width: '140px'
        },{
            name: 'finishedCost',
            title: '本月完工产品成本',
            dataIndex: 'finishedCost',
            align: 'center',
            width: '140px'
        },{
            name: 'accountEndBalance',
            title: '月末在产品成本',
            dataIndex: 'accountEndBalance',
            align: 'center',
            render: (text, record, index)=>{return this.getContent(text, record, index, 'accountEndBalance')},
            width: '140px'
        }]
        
        return (
            <div className='cost-income-ratio'>
                <div className='cost-income-ratio-header'>
                    <span>产成品成本金额： {amount}元</span>
                    <Button type='primary' onClick={()=>this.automaticValue('btn')}>成本核算自动取值</Button>
                    <Button onClick = {()=>this.setting()}>设置</Button>
                </div>
                <Table className='cost-income-ratio-table'
                    pagination={false}
                    emptyShowScroll={true}
                    allowColResize={false}
                    enableSequenceColumn={false}
                    bordered={true}
                    dataSource={detail}
                    rowSelection={undefined}
                    loading={loading}
                    scroll={detail.length > 0 ? tableOption : {}}
                    columns={columns}>
                </Table>
            </div>
        )
    }
}

export default currentAccount
