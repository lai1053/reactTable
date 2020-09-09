import React from 'react'
import { Button, Table,  DatePicker, Select, Input, Icon} from 'edf-component'
import moment from 'moment'
import utils from 'edf-utils'
import { fromJS } from 'immutable';
const option = Select.Option

class currentAccount extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            tableOption: {
                x: 1,
                y: null
            },
            detail: [{}],
            businessDate: props.businessDate,
            optionArr: [],
            loading: false
        }

        if( props.setOkListener ) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async() => {
        let {detail, rDRecordDto} = this.state, errorAero = []
        let oldAllNum = {}, newAllNum = {}, oldCodeArr = [], newCodeArr = [], errorCode = [], errorItem = []
        rDRecordDto.details && rDRecordDto.details.map(item=>{
            if(item.quantity) {
                oldCodeArr.push(item.inventoryCode)
                oldAllNum[`${item.inventoryCode}`] = oldAllNum[`${item.inventoryCode}`] || 0 + item.quantity
            }
        })
        detail.map(item=> {
            if(item.thisQuantity) {
                if(item.thisQuantity<0 || item.thisAmount<0){
                    errorAero.push(item.inventoryCode)
                }

                // 每行 总数量不能大于入库单的总数量 (rDRecordDto.details)
                newCodeArr.push(item.inventoryCode)
                newAllNum[`${item.inventoryCode}`] = newAllNum[`${item.inventoryCode}`] || 0 + item.thisQuantity

                if((item.thisQuantity || 0)  > (item.quantity || 0) - (item.recoilQuantity || 0)) {
                    errorItem.push(item.inventoryCode)
                }
            }
        })
        if(errorAero.length){
            this.props.metaAction.toast('error', '数量或者金额不能为负数')
            return false
        }
        newCodeArr.map(item=>{
            if(newAllNum[`${item}`] > oldAllNum[`${item}`]) {
                errorCode.push(item)
            }
        })
        errorCode = Array.from(new Set(errorCode))
        errorItem = Array.from(new Set(errorItem))
        if(errorCode.length) {
            this.props.metaAction.toast('error', '本次暂估回冲数量 > 暂估入库数量-已回冲数量，请修改暂估回冲数量')
            return false
        }else if(errorItem.length){
            this.props.metaAction.toast('error', '本次暂估回冲数量合计 >（暂估入库数量-已回冲数量）合计，请修改暂估回冲数量')
            return false
        }
        return detail
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
            let appDom=document.getElementsByClassName('temporary-inventory')[0];//以app为检索范围
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
    componentDidMount = async () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }

        // let businessDate = this.props.businessDate
        // let beginDate = businessDate && businessDate.startOf('month').format('YYYY-MM-DD')
        // let endDate = businessDate && businessDate.endOf('month').format('YYYY-MM-DD')
        // await this.setState({
        //     beginDate,
        //     endDate
        // })
        this.refresh(true)
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

    // 计算 row
    calcRowSpan = (text, columnKey, currentRowIndex) => {
        let {detail} = this.state
        const list = fromJS(detail)
		if (!list) return
		const rowCount = list.size
		if (rowCount == 0 || rowCount == 1) return 1
		if (currentRowIndex > 0
			&& currentRowIndex <= rowCount
			&& text == list.getIn([currentRowIndex - 1, columnKey])) {
			return 0
		}
		let rowSpan = 1
		for (let i = currentRowIndex + 1; i < rowCount; i++) {
			if (text == list.getIn([i, columnKey]))
				rowSpan++
			else
				break
		}
		return rowSpan
    }
    
    getContent = (text, record, index, type) => {
        let obj

        let quantityArr = ['quantity','recoilQuantity','thisQuantity','price'],
            numArr = ['amount','recoilAmount','thisAmount']
        if(text && quantityArr.indexOf(type)> -1) {
            text = utils.number.format(Number(text), 6)
        }else if(text && numArr.indexOf(type)> -1){
            text = utils.number.format(Number(text), 2)
        }

        if(type == 'thisQuantity' || type == 'thisAmount'){
            obj = {
                children: <Input.Number
                            value={text}
                            title={text}
                            onBlur={(v) => this.onBlur(v, index, type)} />,
                props: { colSpan: 1 }
            }
        }else if(type == 'code' || type == 'businessDate'){
            obj = {
                children: <span title={text}>{text}</span>,
                props: { rowSpan: this.calcRowSpan(record.code, 'code', index) }
            } 
        }else{
            obj = {
                children: <span title={text}>{text}</span>,
                props: { colSpan: 1 }
            }
        }
        return obj
    }

    onBlur = (v, index, type) => {
        let {detail} = this.state
        const price = detail[index].price

        if(typeof(v) == 'string') v = v.replace(/,/g, '')
        if(type == 'thisQuantity'){
            detail[index].thisQuantity = v
            detail[index].thisAmount = v * price
        }else{
            detail[index].thisAmount = v
            detail[index].thisQuantity = v/price
        }
        this.setState({
            detail
        })
    }
    // changeDate = async (v) =>{
    //     let beginDate = v && v.startOf('month').format('YYYY-MM-DD')
    //     let endDate = v && v.endOf('month').format('YYYY-MM-DD')
    //     await this.setState({
    //         businessDate: v,
    //         beginDate,
    //         endDate
    //     })
    //     this.refresh()
    // }
    changeSelect = async(v) =>{
        await this.setState({
            inventoryType: v
        })
        this.refresh()
    }
    changeSearch = async(v, name) =>{
        if(name == 'inventorySearch'){
            await this.setState({
                inventorySearch: v.target.value
            })
        }else{
            await this.setState({
                supplier: v.target.value
            })
        }
        this.refresh()
    }
    refresh = async(initData) =>{
        let {businessDate, inventoryType,inventorySearch, supplier, beginDate, endDate } = this.state
        const filter = {
            initData: initData ? true : false,  
            // beginDate,  
            // endDate, 
            propertyId: inventoryType,  
            purchaseId: this.props.purchaseId,  
            supplierName: supplier ? supplier : undefined,  
            search: inventorySearch ? inventorySearch : undefined  
        }
        this.setState({
            loading: true
        })
        const res = await this.props.getRecoilPEList(filter)

        let stateObj
        if(initData){
            stateObj = {
                loading: false,
                detail: res.estimateList,
                rDRecordDto: res.rDRecordDto,
                optionArr: res.inventoryPropertyDtos
            }
        }else{
            stateObj = {
                loading: false,
                detail: res.estimateList,
            }
        }
        this.setState(stateObj)
    }

    resizeEnd = async (params) => {
        // console.log(params, 'params//////////')
        // const code = this.metaAction.gf('data').toJS().other.code;
        // params.code = code;
        // let columnDto = this.metaAction.gf('data.other.columnDto').toJS()
        // columnDto = columnDto.filter((item) => item.isVisible === false).map(obj => {
        //     return {
        //         fieldName: obj.fieldName,
        //         isVisible: false,
        //         width: obj.width,
        //     }
        // })
        // params.columnDetails = params.columnDetails.concat(columnDto)
        // let res = await this.webapi.batchUpdate(params)
        // this.metaAction.sf('data.other.columnDto', fromJS(res[0].columnDetails))
    }

    render(){
        const { tableOption, businessDate ,detail, inventoryType , 
                optionArr, inventorySearch, supplier, loading} = this.state

        let resColumn = []
        const columns = [
            { fieldName: 'businessDate', fieldTitle: '单据日期', fieldParentName: null, width: 90 },
            { fieldName: 'code', fieldTitle: '单据编号', fieldParentName: null, width: 110 },
            { fieldName: 'supplierName', fieldTitle: '供应商', fieldParentName: null, width: 210 },
            { fieldName: 'propertyName', fieldTitle: '存货分类', fieldParentName: null, width: 100 },
            { fieldName: 'inventoryCode', fieldTitle: '存货编码', fieldParentName: null, width: 66 },
            { fieldName: 'inventoryName', fieldTitle: '存货名称', fieldParentName: null, width: 198 },
            { fieldName: 'unitName', fieldTitle: '单位', fieldParentName: null, width: 66 },
            { fieldName: 'specification', fieldTitle: '规格型号', fieldParentName: null, width: 100 },

            { fieldName: '111', fieldTitle: '暂估入库', fieldParentName: null, width: 104 },
            { fieldName: '222', fieldTitle: '已回冲', fieldParentName: null, width: 104 },
            { fieldName: '333', fieldTitle: '本次回冲', fieldParentName: null, width: 104 },
    
            { fieldName: 'quantity', fieldTitle: '数量', fieldParentName: '111'},
            { fieldName: 'price', fieldTitle: '单价', fieldParentName: '111'},
            { fieldName: 'amount', fieldTitle: '金额', fieldParentName: '111'},
    
            { fieldName: 'recoilQuantity', fieldTitle: '数量', fieldParentName: '222'},
            { fieldName: 'recoilAmount', fieldTitle: '金额', fieldParentName: '222'},
    
            { fieldName: 'thisQuantity', fieldTitle: '数量', fieldParentName: '333'},
            { fieldName: 'thisAmount', fieldTitle: '金额', fieldParentName: '333'},
        ]

        // 先插入一级节点    
        let className 
        let left = ['supplierName', 'inventoryName'],
            right = ['quantity', 'price', 'amount', 'recoilQuantity', 'recoilAmount', 'thisQuantity', 'thisAmount']
        columns.forEach(item => {
            if (!item.fieldParentName) {
                if(left.indexOf(item.fieldName)>-1) {
                    className = 'text_left'
                }else if(right.indexOf(item.fieldName)>-1){
                    className = 'text_right'
                } else{
                    className = 'text_center'
                }

                let data
                if(item.fieldName == '333'){
                    data = {
                        title: item.fieldTitle,
                        name: item.fieldName,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        className: className,
                        width: item.width,
                        fixed: 'right',
                        render: (text, record, index) => this.getContent(text, record, index, item.fieldName)
                    }  
                }else{
                    data = {
                        title: item.fieldTitle,
                        name: item.fieldName,
                        dataIndex: item.fieldName,
                        key: item.fieldName,
                        className: className,
                        width: item.width,
                        render: (text, record, index) => this.getContent(text, record, index, item.fieldName)
                    }
                }
                resColumn.push(data)
            }
        })
        resColumn.forEach(item => {
            let childData = []
            columns.forEach(x => {
                if(left.indexOf(x.fieldName)>-1) {
                    className = 'text_left'
                }else if(right.indexOf(x.fieldName)>-1){
                    className = 'text_right'
                } else{
                    className = 'text_center'
                }

                if (x.fieldParentName && x.fieldParentName === item.name) {
                    let data = {
                        title: x.fieldTitle,
                        name: x.fieldName,
                        dataIndex: x.fieldName,
                        key: x.fieldName,
                        className: className,
                        width: item.width,
                        render: (text, record, index) => this.getContent(text, record, index, x.fieldName)
                    }
                    childData.push(data)
                }
            })
            if (childData && childData.length > 0) item.children = childData
        })
        
        return (
            <div className='temporary-inventory'>
                <div className='temporary-inventory-header'>
                    {/* <DatePicker.MonthPicker
                        value={businessDate}
                        onChange={(v)=>this.changeDate(v)}/> */}
                    <Select showSearch={false} placeholder='存货分类' 
                        allowClear= {true} value={inventoryType}
                        onChange={(v)=>this.changeSelect(v)}>
                        {
                            optionArr && optionArr.map((item, index) => {
                                return <Select.Option key={item.id} value={item.id} title={item.name}>{item.name}</Select.Option>
                            })
                        }
                    </Select>
                    <Input.Search placeholder='名称/规格型号/编码' showSearch={true}
                        value={inventorySearch}
                        onChange={(v)=>this.changeSearch(v, 'inventorySearch')}/> 
                    <Input.Search placeholder='供应商' showSearch={true}
                        value={supplier}
                        onChange={(v)=>this.changeSearch(v, 'supplier')}/> 
                    <Icon type='shuaxin' fontFamily='edficon' onClick={()=>this.refresh()} />   
                </div>
                <Table className='temporary-inventory-table'
                    pagination={false}
                    emptyShowScroll={true}
                    allowColResize={false}
                    enableSequenceColumn={false}
                    bordered={true}
                    dataSource={detail}
                    rowSelection={undefined}
                    loading={loading}
                    scroll={tableOption}
                    allowColResize={true}
                    onResizeEnd={(param)=>this.resizeEnd(param)}
                    // remberName= 'temporary-inventory'
                    columns={resColumn}>
                </Table>
            </div>
        )
    }
}

export default currentAccount
