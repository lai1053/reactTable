import React from 'react'
// import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { FormDecorator, DataGrid, Layout, Form, Button } from 'edf-component'
import {formatSixDecimal, stockLoading, transToNum} from '../commonAssets/js/common'
import { formatNumbe } from './../common'
// const colKeys = ['code', 'name', 'number', 'work', 'size','monery','pices']

import extend from './extend'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.extendAction = option.extendAction
        this.voucherAction = option.voucherAction
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
		this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        this.component.props.setOkListener(this.onOk)
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        const id= this.component.props.id;
        const serviceTypeCode= this.component.props.serviceTypeCode;
        const flag= this.component.props.flag;
        const titleName= this.component.props.titleName;
        injections.reduce('init',titleName,flag)
        this.load(id,serviceTypeCode)
    }
    load = async (id,serviceTypeCode) => {
        this.metaAction.sf('data.loading', true)
        const response = await this.webapi.operation.findBillTitleById({'serviceTypeCode':serviceTypeCode,'id':id})
        this.injections.reduce('load', response, serviceTypeCode)
    }
    quantityFormat = (quantity, decimals, isFocus) => {
		if (quantity) {
			return formatNumbe(quantity,decimals)
		}
    }

    onCancel = () => {
        this.component.props.closeModal && this.component.props.closeModal()
    }

    // 页面渲染
    renderPage = () => {
        const data = this.metaAction.gf('data').toJS()
        return (
            <React.Fragment>
                <div className="inventory-look-container">
                    { data.loading && <div className='ttk-stock-app-spin'>
                            { stockLoading() }
                        </div>
                    }
                    <Layout className='ttk-stock-app-inventory-look-header-title'>
                        <div className='ttk-stock-app-inventory-h2'>
                            <span className='ttk-stock-app-inventory-h2'>{data.title.titleName}</span>
                        </div>
                        {this.renderForm(data)}
                    </Layout>

                    {this.renderTable(data)}
                    
                    <div className='ttk-stock-app-inventory-picking-add-footer-btn'>
                        <Layout className='ttk-stock-app-inventory-picking-add-footer'>
                            <span>制单人：{data.form.operater}</span>
                        </Layout>
                        <div className='ttk-stock-app-inventory-picking-add-footer-btn-btnGroup'>
                            <Button className='ttk-stock-app-inventory-picking-add-footer-btn-btnGroup-item' onClick={this.onCancel}>
                                取消
                            </Button>
                        </div>
                    </div>
                
                </div>
            </React.Fragment>
        )
    }

    // 表单渲染
    renderForm = (data) => {
        const flag = data.title.titleName !== "生产领料单"
        // const titleText = data.title.titleName == "生产领料单" ? '领料日期': '入库日期' 
        const titleText = '日期'
        return (
            <Form className='helloworld-add-form'>
                <React.Fragment>
                    <Form.Item label='单据编号'> {/* style={flag ? {} : {width:'100%'}} */}
                        <span>{data.form.code}</span>
                    </Form.Item>
                    <Form.Item label={titleText} className='enableDate'>
                        {/* style={flag ? {} : { position: 'absolute', right: '0px' }} */}
                        <span>{data.form.cdate}</span>
                    </Form.Item>
                    {flag && <Form.Item label='往来单位' className='wapperWidth200'><span>{data.form.supplierName}</span></Form.Item>}
                </React.Fragment>
            </Form>
        )
    }

    // 表格渲染
    renderTable = (data) => {
        const {list=[], serviceTypeCode=''} = data || {}

        const columnField = [{
            flexGrow: 1,
            width: 75,
            fixed: 'left',
            title: '存货编号',
            align: 'left',
            dataIndex: 'inventoryCode',
            className: 'dataGrid-tableHeaderNoBoder',
        },{
            flexGrow: 1,
            width: 150,
            fixed: 'left',
            title: '存货名称',
            align: 'left',
            dataIndex: 'inventoryName',
            className: 'dataGrid-tableHeaderNoBoder'
        },{
            flexGrow: 1,
            width: 75,
            fixed: 'left',
            title: '规格型号',
            align: 'left',
            dataIndex: 'inventoryGuiGe',
            className: 'dataGrid-tableHeaderNoBoder'
        },{
            flexGrow: 1,
            width: 75,
            fixed: 'left',
            title: '单位',
            align: 'left',
            dataIndex: 'inventoryUnit',
            className: 'dataGrid-tableHeaderNoBoder'
        },{
            flexGrow: 1,
            width: 75,
            title: '数量',
            align: 'left',
            dataIndex: 'num',
            className: 'dataGrid-tableHeaderNoBoder',
            footer: true,
            footerField: 'billBodyNum'
        
        },{
            flexGrow: 1,
            width: 75,
            title: '单价',
            align: 'right',
            dataIndex: 'price',
            className: 'dataGrid-tableHeaderNoBoder',
        },{
            flexGrow: 1,
            width: 75,
            title: '金额',
            align: 'right',
            dataIndex: 'ybbalance',
            className: 'dataGrid-tableHeaderNoBoder',
            footer: true,
            footerField: 'billBodyYbBalance'
        }]

        if(serviceTypeCode==='ZGRK'){
            const chNumCol = {
                flexGrow: 1,
                width: 75,
                title: '冲回数量',
                headerAlign: 'center',
                align: 'right',
                dataIndex: 'chNum',
                className: 'dataGrid-tableHeaderNoBoder',
                footer: true,
                footerField: 'billBodyChNum'
            }

            columnField.push(chNumCol)
        }
        
        const {Column, Cell, TextCell} = DataGrid
        const columns = columnField.map(v=>{
            let {flexGrow, fixed, width, align, title, dataIndex,footer, footerField} = v
            
            const footerElement = footer ? 
                    <Cell className={'mk-datagrid-cellContent-' + align}>{data.listAll[footerField]}</Cell> : null
            
            return (
                <Column 
                    columnKey={dataIndex} 
                    flexGrow={flexGrow} 
                    width={width} 
                    fixed = {fixed || ''}
                    align='center'
                    header={ <Cell className='dataGrid-tableHeaderNoBoder'>{ title }</Cell> }
                    cell={ 
                        ({rowIndex}) => { 
                            let contentText =  '', cText = transToNum(list[rowIndex][dataIndex])
                            
                            if( ['num', 'price'].includes(dataIndex) ){
                                contentText =  cText ? formatSixDecimal(list[rowIndex][dataIndex]) : ''
                            
                            }else if(dataIndex==='ybbalance'){
                                contentText = cText ? formatNumbe(list[rowIndex][dataIndex], 2) : ''

                            }else if(dataIndex==='chNum'){
                                contentText = cText ? formatSixDecimal(list[rowIndex]['chNum']) : ''
                            
                            }else{
                                contentText = list[rowIndex][dataIndex]
                            }
                            
                            return( <TextCell align={align} title={contentText} value={contentText} tip={true} /> )
                        }
                    }
                    footer={footerElement}
                />
            )   
        })

        return (
            <DataGrid 
                scroll={data.tableOption} 
                style={{minHeight:'314px',border: '1px solid #ccc'}}
                className='ttk-stock-app-inventory-look-form-details' 
                rowsCount={data.list.length}
                headerHeight={35} 
                rowHeight={35} 
                footerHeight={35} 
                enableSequence={true}
                startSequence={1} 
                sequenceFooter={ <DataGrid.Cell>合计</DataGrid.Cell> }
                key={data.other.detailHeight} 
                readonly={false} 
                enableAddDelrow={false} 
                columns={columns}
            ></DataGrid>
        )
    }
}
export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction, voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}

