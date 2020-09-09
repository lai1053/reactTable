import React from 'react'
import { Map, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
// import { LoadingMask, FormDecorator, Input } from 'edf-component'
import extend from './extend'
import config from './config'
import renderColumns from './utils/renderColumns'
import { sortSearchOption } from 'edf-utils'
import changeToOption from './utils/changeToOption'
import { TableOperate, Table, Select, Button, Modal, Input, Number, Checkbox, Icon, Popconfirm, FormDecorator, LoadingMask} from 'edf-component'

const Option = Select.Option;

const ExtendEditableSelectCell = ({ dataSource, onChange, value, columnName, onClick, saveNewVlue, handleFocus,disabled}) => {
  let productChildren = []
  //新增按钮 实现新增档案

  if (dataSource) {
    dataSource.forEach((item,index) => {
      productChildren.push(<Option title={item.name} value={item.id}>{item.name}</Option>)
    })
    // if(columnName == 'itemName' && value==undefined){
    //     productChildren.splice(0,0,<Option title={''} value={''}>{''}</Option>)
    // }
  }
  return (
    <div style={{width: '100%'}}>
      <Select style={{ width: '100%' }}
      onChange={(value) => onChange(value)}
      value={ value }
      disabled = {disabled}
      allowClear = {true}
      dropdownClassName={'cashflowstatementDistributionSelect'}
      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
       onFocus={handleFocus}>
        {productChildren}
      </Select>
    </div>
  )
}


const EditableCell = ({ value, onBlur, onEnter ,customAttribute, disabled}) => {
    // '^(-?[0-9]+)(?:\.[0-9]{1,2})?$'
  return (
    <div>
      <Input.Number
        value={value}
        onBlur={(value) => onBlur(value)}
        onPressEnter={(e) => onEnter(e)} 
        style={{'textAlign':'right',fontSize:'12px'}}
        disabled={disabled}
        customAttribute = {customAttribute}
        regex='^([0-9]+)(?:\.[0-9]{1,2})?$'
        />
    </div>
  )
}


class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.config = config.current
		this.webapi = this.config.webapi
        this.voucherAction = option.voucherAction
	}

    onInit = ({ component, injections }) => {
		this.component = component
        this.injections = injections
        this.customAttribute = Math.random()
		injections.reduce('init', component.props)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        this.load()
    }

    //初始化接口调用
	load = async (data) => {
        this.metaAction.sf('data.loading', true)
        let params = this.metaAction.gf('data.periodData')
        let response = await this.webapi.balancesheet.getCashFlowDistributionInfo({period: params})
        if(response) {
            this.metaAction.sf('data.loading', false)
		    this.injections.reduce( 'load', response )        
        }
		    
    }

    // new start
    //判断该列单元格是否是select框
    renderCell = (columnName, index, value) => {
        let editable = true,pageSize = this.metaAction.gf('data.pagination.pageSize'),
        list = this.metaAction.gf('data.list').toJS(),
        // let list = this.metaAction.gf('data.currentList')?this.metaAction.gf('data.currentList').toJS():[],
            dataSource = this.metaAction.gf('data.dataSource').toJS(),
            renderDataSource,
            monthClosingFlag = this.metaAction.gf('data.monthClosingFlag')
        if( list[index]&&list[index]['isNameRow'] ) {
            if(columnName=='summary') {
                return {
                    children: <span title={value} style={{'textAlign':'left','width':'100%','display':'inline-block'}}>{value}</span>,
                    props: {
                        colSpan: 7,
                    }
                }
            } else {
                return {
                    children: '',
                    props: {
                        colSpan: 0,
                    }
                }
            }
        }
        if( list[index]&&list[index]['canEdit'] == true ) {
            if( columnName == 'itemName' ) {
                return (
                  <ExtendEditableSelectCell
                    editable={editable}
                    // allowClear={true}
                    disabled = {monthClosingFlag}
                    onChange={(value) => this.handleSelectChange(value, columnName, index, dataSource)}
                    dataSource={dataSource}
                    value={value}
                    columnName={columnName}
                    onClick={() => {this.handleOnClickAdd(columnName, index)}}
                    handleFocus={this.handleFocus}
                    /* handleFoucus={() => this.handlerFoucus(columnName, index)} */
                  />
                )
            } 
            if( columnName == 'allotAmount' ) {
                if(list[index].itemName==''||list[index].itemName==undefined){
                    return ''
                }else{
                    return (<EditableCell
                        disabled = {monthClosingFlag}
                        value={value}
                        customAttribute = {this.customAttribute}
                        onBlur={(value) => this.handleBlur(value, columnName, index)}
                        onEnter={(e) => this.handleEnter(e, index, columnName)}
                    />)
                }
                
            }
            if(columnName=='cashFlowDirectionName'){
                if(list[index].itemName==''||list[index].itemName==undefined){
                    return ''
                }
            }
            
            return this.renderTextCell(columnName, index, value)
        } 
        else if(columnName=='cashFlowDirectionName'||columnName=='allotAmount'){
            return ''
            
        }
        else{
            return this.renderTextCell(columnName, index, value)
        }
        
    }

    //分页发生变化
    pageChanged = (current, pageSize) => {
        
        let page = this.metaAction.gf('data.pagination').toJS(),
        list = this.metaAction.gf('data.list').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        let currentList = list.slice((current-1)*(page.pageSize),current*(page.pageSize))
        this.metaAction.sfs({
            'data.currentList': fromJS(currentList),
            'data.pagination': fromJS(page)
    })
        this.metaAction.sf('data.currentList',fromJS(currentList))
        // this.metaAction.sf('data.list',fromJS(list.slice((current-1)*pageSize),current*pageSize))
    }

    renderTextCell = (columnName, index, value) => {
        let list = this.metaAction.gf('data.list')
        return (<div title={value} className="text-cell">
            {value}
        </div>)
    }

    handleEnter = (e, rowIndex, columnName) => {
        if (e.keyCode == 13 || e.key == 'Enter' || e.keyCode == 108) {
            const inputs = document.getElementsByClassName('ant-input mk-input-number')
            const index = $(inputs).index(e.target)
            let newValue = e.target.value,list = this.metaAction.gf('data.list', list),errorMessage = '分配的金额'
            // if(newValue && newValue > Math.abs( this.clearThousandsPosition( list[rowIndex].amount ) ) ) {
            //     this.metaAction.toast('warning', `${errorMessage}不能大于同行金额绝对值，请调整！`)
            //     listInput = listInput.update(index, item => item.set( 'allotAmount', undefined ))
            //     // this.metaAction.sf('data.list', listInput)
            //     this.updateData( listInput, value, columnName, index )                          
            //     return
            // }
            // if (newValue && newValue > 9999999999.99) {
            //   this.metaAction.toast('warning', `${errorMessage}不能大于9,999,999,999.99，请调整！`)
            //   listInput = listInput.update(index, item => item.set( 'allotAmount', undefined ))
            // //   this.metaAction.sf('data.list', listInput)
            //   this.updateData( listInput, value, columnName, index )            
            //   return
            // }
            // if (newValue && newValue < -9999999999.99) {
            //   this.metaAction.toast('warning', `${errorMessage}不能小于-9,999,999,999.99，请调整！`)
            //   listInput = listInput.update(index, item => item.set( 'allotAmount', undefined ))
            //   //   this.metaAction.sf('data.list', listInput)
            //     this.updateData( listInput, value, columnName, index )  
            //   return
            // }
            if (newValue && newValue.indexOf(',') > -1) {
              newValue = newValue.replace(/,/g, '')
            }
            if (isNaN(newValue)) {
                this.metaAction.toast('warning', '请输入数字！')
                return
            }
            inputs[index+1].focus()
        }
    }

    handleBlur = (value, columnName, index) => {//焦点离开输入框触发
        let listInput = this.metaAction.gf('data.list'),
            errorMessage = '分配的金额'
        let values
        listInput = listInput.update(index, item => item.set(columnName, value))
        this.customAttribute = Math.random()
        
        if (value) {
          if (value.toString().indexOf(',') > -1) {
            values = value.replace(/,/g, '')
          } else {
            values = parseFloat(value).toFixed(2)
          }
        }
    
        if (values && isNaN(values)) {
          this.metaAction.toast('warning', '请输入数字！')
          return
        }

        // if(values && values > Math.abs( this.clearThousandsPosition( listInput.get(index).get('amount') ) ) ) {
        //     this.metaAction.toast('warning', `${errorMessage}不能大于同行金额绝对值，请调整！`)
        //     listInput = listInput.update(index, item => item.set( 'allotAmount', undefined ))
        //     // this.metaAction.sf('data.list', listInput)
        //     this.updateData( listInput, value, columnName, index )            
        //     return
        // }
        if (value > 9999999999.99) {
            
          this.metaAction.toast('warning', `${errorMessage}不能大于9,999,999,999.99，请调整！`)
          listInput = listInput.update(index, item => {
              item = item.set( 'allotAmount', undefined )
              return item
            })
          this.updateData( listInput, value, columnName, index )
            // this.metaActionw.sf('data.list', listInput)
          return
        }
        if (value < -9999999999.99) {
            this.metaAction.toast('warning', `${errorMessage}不能小于-9,999,999,999.99，请调整！`)
            listInput = listInput.update(index, item => item.set( 'allotAmount', undefined ))
            //   this.metaAction.sf('data.list', listInput)
              this.updateData( listInput, value, columnName, index )  
            return
          }
        // listInput = listInput.update(rowIndex, item => item.set(columnName, value)) 
        // if (values < -9999999999.99) {
        //   this.metaAction.toast('warning', `${errorMessage}不能小于-9,999,999,999.99，请调整！`)
        //   return
        // }
    
        listInput = listInput.update(index, item => item.set( 'allotAmount', this.addThousandsPosition( values, true ) ))

        this.updateData( listInput, value, columnName, index )
        
        // this.metaAction.sf('data.list', listInput)
    }

    handleSelectChange = (value, columnName, index, dataSource) => {//选择框值改变触发
        let list = this.metaAction.gf('data.list')
        if(value == undefined){//清除
            list = list.update(index, item => item.set('itemName', ''))
            list = list.update(index, item => item.set('cashFlowDirectionName', ''))
            list = list.update(index, item => item.set('allotAmount', ''))
            list = list.update(index, item => item.set('accountingStandardsId', ''))
            list = list.update(index, item => item.set('id', ''))
            list = list.update(index, item => item.set('lineNum', ''))
            list = list.update(index, item => item.set('name', ''))
            list = list.update(index, item => item.set('itemType', ''))
        }else{
            const selectObj = dataSource.filter((item) => item.id == value)
            const obj = {}
            obj.id =selectObj[0]&& selectObj[0].id ? selectObj[0].id : '-1'
            obj.name = selectObj[0]&&selectObj[0].name ? selectObj[0].name : ''
            list = list.update(index, item => item.set('itemId', obj.id ))
            list = list.update(index, item => item.set('itemName', obj.name ))
        }
      
        this.updateData( list, value, columnName, index )

    }

    updateData = ( newList, value, columnName, index ) => {
        // let paramList = this.metaAction.gf('data.changeList')?this.metaAction.gf('data.changeList').toJS():[],
        let haveItem = false,
            sfsData = {},
            curItem = newList.get(index).toJS()
       if(curItem.itemName==''){
            newList = newList.update(index, item => item.set('allotAmount', '0.00'))
       }else{
            newList = newList.update(index, item => item.set('allotAmount', curItem.allotAmount ))
            // curItem.allotAmount = curItem.allotAmount ? this.clearThousandsPosition( curItem.allotAmount ) : 0
       }
        curItem.docAmount = curItem.docAmount ? this.clearThousandsPosition( curItem.docAmount ) : null
        // curItem.allotAmount = curItem.allotAmount ? this.clearThousandsPosition( curItem.allotAmount ) : 0
        sfsData['data.list'] = newList
        // sfsData['data.changeList'] = fromJS( paramList )
        this.metaAction.sfs( sfsData ) 
    }

    handleOnClickAdd = async (value, rowIndex) => {
        let list = this.metaAction.gf('data.list').toJS()
    }
    // new end

    //去除千分位
    clearThousandsPosition = (num) => {
        if (num && num.toString().indexOf(',') > -1) {
            let x = num.toString().split(',')
            return parseFloat(x.join(""))
        } else {
            return num
        }
    }

    //添加千分位
    addThousandsPosition = (input, isFixed) => {
        if (isNaN(input)) return ''
        let num

        if (isFixed) {
            num = parseFloat(input).toFixed(2)
        } else {
            num = input.toString()
        }
        let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g

        return num.replace(regex, "$1,")
    }

    //点击确定按钮
    onOk = async () => {
        return await this.save()
    }

    //保存报表公式
    save = async () => {
        let list = this.metaAction.gf('data.list')
        let type = this.metaAction.gf(`data.type`),
            params = this.getParams('save'),
            response
        response = await this.webapi.balancesheet.saveDocCashFlowData(params)
        if (response && response.message && response.messageType=='warn') {
            // this.metaAction.toast('error', this.getDisplayErrorMSg(response.error.message.split('<br/>')))
            await this.metaAction.modal('warning', {
                content: this.getDisplayErrorMSg(response.message.split('<br/>')),
                okText: '返回修改'
            })
            return false
        }else if(response && response.message && response.messageType=='error'){
            this.metaAction.toast('warning',response.message)
            return false
        }else{
            this.metaAction.toast('success', '保存成功')
            return true
        }
        
	}

    getDisplayErrorMSg = (errorMsg) => {
        return <div style={{ display: 'inline-table' }}>
            {
                errorMsg.map(item => <div>{item}<br /></div>)
            }
        </div>
    }
    
    onTabFocus = (data) => {
        let periodData = this.metaAction.gf('data.selectData').toJS()
        this.load(data.initSearchValue)
    }

    //获取参数
    getParams = (funType) => {//获取参数，funtype是哪个方法的参数
        let type = this.metaAction.gf(`data.type`),//利润表还是资产负债表
            period = this.metaAction.gf(`data.period`).toJS(),
            index = this.metaAction.gf(`data.index`),
            cashFlowInfoIds = this.metaAction.gf('data.cashFlowInfoIds')?this.metaAction.gf('data.cashFlowInfoIds').toJS():[],
            params = {
                period:period,
                reportId:type,
                rowNo:(index+1)
            },
            paramOption = {}
        
        let list = this.metaAction.gf(`data.list`)?this.metaAction.gf(`data.list`).toJS():[]
        params.glReportTemplateProjectItemList = []
        if(list.length<1) {
            return false
        } else {
            let voucherList = [],
                newVoucher
            list.map(( item, index )=> {
                item.docAmount=item.docAmount?this.clearThousandsPosition(item.docAmount):undefined
                item.allotAmount=item.allotAmount?this.clearThousandsPosition(item.allotAmount):0.00
                if( item.isNameRow ) {
                    if( typeof newVoucher == 'object' ) {
                        voucherList.push( newVoucher )
                    }
                    newVoucher = {
                        docCode: item.docCode,
                        docId: item.docId,
                        orgId: item.orgId,
                        voucherDate: item.voucherDate,
                        // ...item,
                        details: []
                    }
                } else {
                    if( typeof newVoucher == 'object' &&  typeof newVoucher.details == 'object' ) {
                        newVoucher.details.push( item )
                    }
                }
            })
            if( typeof newVoucher == 'object' ) {
                voucherList.push( newVoucher )
            }
            voucherList.map(o => {
                o.details.map(i => {
                    if(i.itemName == ''){
                        i.allotAmount = '0.00'
                    }
                })
            })
            paramOption.rows = this.metaAction.gf('data.rows')
            paramOption.entryMaxUpdateTime = this.metaAction.gf('data.entryMaxUpdateTime')
            paramOption.cashFlowDetails = voucherList
            paramOption.cashFlowInfoIds = cashFlowInfoIds
            return paramOption
        }
    }
    
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })
    return ret
}
