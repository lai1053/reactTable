import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import utils from 'edf-utils'
import config from './config'
import { getInitState } from './data'
import changeToOption from './utils/changeToOption'
import moment from 'moment'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, { response, noInitDate, tableLoading }, dataList, tableCheckbox, type) => {
        const { dtoList, page, accountList, columnDto, voucherStateList, voucherTypeList, displayDate, loading, docList} = response
        let loadObj = {
            'data.allList': fromJS(docList),
            'data.pagination': fromJS(page)
            
        }
       
        if(columnDto){
            loadObj['data.list'] = fromJS(this.processDtoList(columnDto.columnDetails, docList))
          
        }else{
            loadObj['data.list'] = fromJS(this.processDtoList(this.metaReducer.gf(state, 'data.other.columnDto').toJS(), docList))
           
        }
        if(tableCheckbox){
            loadObj['data.other.selectedRowKeys'] = fromJS(tableCheckbox.value)
          
        }
        if (accountList) {
            //科目数据量大，先放到window下进行缓存，然后打开下拉进行读取
            window.proofSearchAccountList = accountList
        }
      
        if(columnDto){
            loadObj['data.other.columnDto'] = fromJS(columnDto.columnDetails)
            loadObj['data.other.ts'] = fromJS(columnDto.ts)
            loadObj['data.other.code'] = fromJS(columnDto.code)
           
        }
      
        if(voucherStateList){
            loadObj['data.other.voucherStateOption'] = fromJS(changeToOption(voucherStateList, 'name', 'id'))
        }
        if(voucherTypeList){
            loadObj['data.other.sourceVoucherTypeIdOption'] = fromJS(changeToOption(voucherTypeList, 'name', 'id'))
        }
       
        if (displayDate && !noInitDate && type != 'init') {
            loadObj['data.searchValue.date_end'] = utils.date.transformMomentDate(displayDate)
            loadObj['data.searchValue.date_start'] = utils.date.transformMomentDate(displayDate)
            loadObj['data.searchValue.displayDate'] = displayDate
          
        }

        if (dataList) {
            loadObj = {...loadObj, ...dataList}
        }
        state = this.metaReducer.sfs(state, loadObj)
        return state
    }

    processDtoList = (columnDetails, dtoList) => {
        let docDetailsCol = columnDetails.filter(item => item.isHeader == false && item.isVisible == true),
            retDtoList = []

        // 凭证管理中要显示明细列
        if (docDetailsCol && docDetailsCol.length > 0) {
            retDtoList = dtoList
            // 凭证管理中不显示明细列时，做数据排重用以控制行的高度为标准行高
        } else {
            let docCode = ''
            for (var i = 0; i < dtoList.length; i++) {
                if (docCode != dtoList[i].docCode) {
                    retDtoList.push(dtoList[i])
                    docCode = dtoList[i].docCode
                }
               
            }
        }

        return retDtoList
    }

    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    updateArr = (state, arr) => {
        state = this.metaReducer.sfs(state, arr)
        return state
    }

    tableSettingVisible = (state, { value, data }) => {
        state = this.metaReducer.sf(state, 'data.showTableSetting', value)
        data = this.metaReducer.gf(state, 'data.other.columnDto')
        return state
    }

    settingOptionsUpdate = (state, { visible, data }) => {
        state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(data))
        state = this.metaReducer.sf(state, 'data.showTableSetting', visible)
        let allList = this.metaReducer.gf(state, 'data.allList').toJS()
        state = this.metaReducer.sf(state, 'data.list', fromJS(this.processDtoList(data, allList)))
        return state
    }

    normalSearchChange = (state, { path, value }) => {
        state = this.metaReducer.sf(state, `data.normalSearch.${path}`, fromJS(value))
        return state
    }


    searchUpdate = (state, value) => {
        return this.metaReducer.sf(state, 'data.searchValue', fromJS(value))
    }

    tableOnchange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value))
        state = this.metaReducer.sf(state, 'data.key', Math.random())
        return state
    }

    sortReduce = (state, value) => {
        state = this.metaReducer.sf(state, `data.sort`, fromJS(value))
        return state
    }

    setTableScroll = (state, value) => {
        let tableOption = { x: 1090, y: value }
        state = this.metaReducer.sf(state, 'data.tableOption', fromJS(tableOption))
        return state
    }

    setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
