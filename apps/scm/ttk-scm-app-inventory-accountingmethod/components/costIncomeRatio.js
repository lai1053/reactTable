import React from 'react'
import { Button, Table,  DatePicker} from 'edf-component'
import moment from 'moment'
import utils from 'edf-utils'

class currentAccount extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            tableOption: {
                x: 1,
                y: null
            },
            businessDate: props.businessDate,
            detail: props.detail,
            type: props.type
        }

        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async() => {
        const detalisList = this.state.detail
        let isNeedTip = false
        detalisList.forEach(element => {
            if (element.productQuantity <= 0 || element.price < 0 || element.productQuantity == undefined) {
                isNeedTip = true
            }
        });

        if (isNeedTip) {
            const res = await this.props.handleConfirmTip()
            if (res) {
                return true
            }
        }
        return true
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
    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
        this.onResize()

        // this.setState({
        //     ...this.props
        // })
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

    getContent = (text, record, index, type) => {
        let obj
        // if(type == 'seq') text = text+1

        let quantityArr = ['quantity','periodBeginQuantity','productQuantity','price', 'productPrice'],
            numArr = ['amount','tempAmount','periodBeginAmount','productAmount', 'costRate']
        if(text!=undefined && quantityArr.indexOf(type)> -1) {
            if(Number(text)==0) {
                text = ""
            }else{
                text = utils.number.format(Number(text), 6)
            }
        }else if(text!=undefined && numArr.indexOf(type)> -1){
            if(Number(text)==0) {
                text = ""
            }else{
                text = utils.number.format(Number(text), 2)
            }
        }
        if(text && type == 'costRate') text = `${text}%`
        obj = {
            children: <span title={text}>{text}</span>,
            props: { colSpan: 1 }
        }
        return obj
    }
    render(){
        const { tableOption, businessDate ,detail } = this.state

        let resColumn = []
        const columns = [
            { fieldName: 'seq', fieldTitle: '序号', fieldParentName: null },

            { fieldName: '111', fieldTitle: '产成品', fieldParentName: null },
            { fieldName: '222', fieldTitle: '存货销售成本', fieldParentName: null },
            { fieldName: '333', fieldTitle: '期初结存', fieldParentName: null },
            { fieldName: '444', fieldTitle: '产成品入库成本', fieldParentName: null },
    
            { fieldName: 'inventoryCode', fieldTitle: '存货编码', fieldParentName: '111' },
            { fieldName: 'inventoryName', fieldTitle: '存货名称', fieldParentName: '111' },
            { fieldName: 'specification', fieldTitle: '规格型号', fieldParentName: '111' },
            { fieldName: 'unitName', fieldTitle: '计量单位', fieldParentName: '111' },
            { fieldName: 'amount', fieldTitle: '销售收入', fieldParentName: '111' },
            { fieldName: 'costRate', fieldTitle: '成本率', fieldParentName: '111' },
    
            { fieldName: 'quantity', fieldTitle: '数量', fieldParentName: '222' },
            { fieldName: 'tempAmount', fieldTitle: '金额', fieldParentName: '222' },
    
            { fieldName: 'periodBeginQuantity', fieldTitle: '数量', fieldParentName: '333' },
            { fieldName: 'periodBeginAmount', fieldTitle: '金额', fieldParentName: '333' },
            
            { fieldName: 'productQuantity', fieldTitle: '数量', fieldParentName: '444' },
            { fieldName: 'price', fieldTitle: '单价', fieldParentName: '444' },
            { fieldName: 'productAmount', fieldTitle: '金额', fieldParentName: '444' }
        ]

        if(this.state.type=='costSaleRatio'){
            columns[9].fieldName = 'price'
            columns[9].fieldTitle = '销售单价'
            columns[16].fieldName = 'productPrice'
        }

        // 先插入一级节点    
        let width = 110, className = 'text_left'
        let center = ['seq', 'specification', 'unitName', 'costRate'],
            right = ['amount','quantity','tempAmount','periodBeginQuantity','periodBeginAmount','productQuantity',
                        'price','productAmount', 'productPrice']
        columns.forEach(item => {
            if (!item.fieldParentName) {
                let data = {
                    title: item.fieldTitle,
                    name: item.fieldName,
                    dataIndex: item.fieldName,
                    key: item.fieldName,
                    className: item.fieldName == 'seq' ? 'text_center': 'text_left',
                    width: item.fieldName == 'seq' ? '60px': '',
                    render: (text, record, index) => this.getContent(text, record, index, item.fieldName)
                }   
                resColumn.push(data)
            }
        })
        resColumn.forEach(item => {
            let childData = []
            columns.forEach(x => {
                if(center.indexOf(x.fieldName)>-1) {
                    className = 'text_center'
                }else if(right.indexOf(x.fieldName)>-1){
                    className = 'text_right'
                } else{
                    className = 'text_left'
                }

                if (x.fieldParentName && x.fieldParentName === item.name) {
                    if(x.fieldName == 'unitName' || x.fieldName == 'specification') {
                        width = 65
                    }else if(right.indexOf(x.fieldName)>-1){
                        width = 100
                    }else{
                        width = 110
                    }
                    let data = {
                        title: x.fieldTitle,
                        name: x.fieldName,
                        dataIndex: x.fieldName,
                        key: x.fieldName,
                        className: className,
                        width: width,
                        render: (text, record, index) => this.getContent(text, record, index, x.fieldName)
                    }
                    childData.push(data)
                }
            })
            if (childData && childData.length > 0) item.children = childData
        })
        
        return (
            <div className='cost-income-ratio'>
                <DatePicker.MonthPicker
                    className='cost-income-ratio-header'
                    value={businessDate}
                    disabled= {true} />
                <Table className='cost-income-ratio-table'
                    pagination={false}
                    emptyShowScroll={true}
                    allowColResize={false}
                    enableSequenceColumn={false}
                    bordered={true}
                    dataSource={detail}
                    rowSelection={undefined}
                    scroll={detail.length > 0 ? tableOption : {}}
                    columns={resColumn}>
                </Table>
            </div>
        )
    }
}

export default currentAccount
