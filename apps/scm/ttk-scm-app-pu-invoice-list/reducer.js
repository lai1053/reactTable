import { Map, fromJS, toJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import utils from 'edf-utils'
import config from './config'
import { getInitState } from './data'
import changeToOption from './utils/changeToOption'
import moment from 'moment'
const checkboxKey = 'id';//table的主键
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, { response, isInit, supplier }) => {
        const { list, page, column } = response;
        //防止list出现重复增加唯一字段uuid
        list.forEach((item, index) => {
            item.uuid = index
        })
        let selectedOption = this.metaReducer.gf(state, 'data.tableCheckbox.selectedOption').toJS();//选择的数据
        selectedOption = selectedOption.filter((o) => list.find(a => a.id === o.id));
        let statistics = this.checkboxChange(null, selectedOption);
        state = this.metaReducer.sfs(state, {
            'data.allList': fromJS(list),
            'data.pagination': fromJS(page),
            'data.other.hasOpend': true, //表示页面打开过
            'data.statistics': fromJS(statistics)
        })
        if (column) {
            // let hasDraftPre = this.metaReducer.gf(state, 'data.other.hasDraft');//当前是否有草稿
            //有草稿状态时要加草稿图标
            let hasDraft = false;
            list.forEach(item => {
                if (/*item.isDraft ||*/item.discarded) {
                    hasDraft = true
                }
            })
            if (hasDraft) {
                column.columnDetails[0].width = column.columnDetails[0].width + 24.41;
            }
            state = this.metaReducer.sfs(state, {
                'data.other.ts': fromJS(column.ts),
                'data.other.code': fromJS(column.code),
                'data.list': fromJS(this.processDtoList(column.columnDetails, list)),
                'data.other.columnDto': fromJS(column.columnDetails),
                'data.other.hasDraft': hasDraft
            })
        }
        else {
            let columnDetails = this.metaReducer.gf(state, 'data.other.columnDto').toJS()
            let hasDraftPre = this.metaReducer.gf(state, 'data.other.hasDraft');//当前是否有草稿
            //有草稿状态时要加草稿图标
            let hasDraft = false;
            list.forEach(item => {
                if ( /*item.isDraft || */ item.discarded) {
                    hasDraft = true
                }
            })
            if (hasDraft && !hasDraftPre) {
                columnDetails[0].width = columnDetails[0].width + 24.41;
                state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(columnDetails))
            } else if (hasDraftPre && !hasDraft) {
                //有-》无
                columnDetails[0].width = columnDetails[0].width - 24.41;
                state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(columnDetails))
            }
            state = this.metaReducer.sfs(state, {
                'data.list': fromJS(this.processDtoList(columnDetails, list)),
                'data.other.hasDraft': hasDraft
            })
        }
        if (isInit) {
            const { invoiceTypes, accountStatuses, properties, rateList } = response;
            state = this.metaReducer.sfs(state, {
                'data.tableKey': Math.random(),
                'data.invoiceTypes': fromJS(changeToOption(invoiceTypes, 'name', 'id')),
                'data.newProperties': fromJS(changeToOption(properties, 'propertyName', 'propertyId')),
                'data.accountStatuses': fromJS(changeToOption(accountStatuses, 'name', 'id')),
                'data.supplier': fromJS(changeToOption(supplier, 'name', 'id')),
                'data.rateList': fromJS(changeToOption(rateList, 'name', 'id')),
                'data.properties': fromJS(properties)
            })
        }
        //遍历checkbox更新
        // let tableCheckbox = this.metaReducer.gf(state, 'data.tableCheckbox');
        // if (tableCheckbox) {
        //     let checkboxValue = tableCheckbox.toJS().checkboxValue
        //     let selectedOption = this.initSelectValue(checkboxValue, list);
        //     if (selectedOption) {
        //         state = this.metaReducer.sf(state, 'data.tableCheckbox.selectedOption', fromJS(selectedOption))
        //     }
        // }
        return state
    }

    // initSelectValue = (selcted, all) => {
    //     //   debugger
    //     let selectValue = new Map()
    //     selcted.forEach(item => {
    //         const i = all.find(key => key[checkboxKey] == item)
    //         selectValue = selectValue.set(item, i)
    //     })
    //     const arr = []
    //     for (let value of selectValue.values()) {
    //         arr.push(value)
    //     }
    //     return arr
    // }
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    updateArr = (state, arr) => {
        arr.forEach(item => {
            state = this.metaReducer.sf(state, item.path, fromJS(item.value))
        })
        return state
    }

    changeDate = (state, { beginDate, endDate }) => {
        state = this.metaReducer.sfs(state, {
            'data.searchValue.beginDate': beginDate,
            'data.searchValue.endDate': endDate,
        })
        return state;
    }
    tableSettingVisible = (state, { value, data }) => {
        state = this.metaReducer.sf(state, 'data.showTableSetting', value)
        data = this.metaReducer.gf(state, 'data.other.columnDto')
        return state
    }

    settingOptionsUpdate = (state, { visible, data }) => {
        //state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(data))
        //state = this.metaReducer.sf(state, 'data.showTableSetting', visible)
        let allList = this.metaReducer.gf(state, 'data.allList').toJS()
        // state = this.metaReducer.sf(state, 'data.list', fromJS(this.processDtoList(data, allList)))
        state = this.metaReducer.sfs(state, {
            'data.other.columnDto': fromJS(data),
            'data.showTableSetting': visible,
            'data.list': fromJS(this.processDtoList(data, allList))
        })
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
        // state = this.metaReducer.sf(state, 'data.list', fromJS(value))
        // state = this.metaReducer.sf(state, 'data.key', Math.random())
        state = this.metaReducer.sfs(state, {
            'data.list': fromJS(value),
            'data.key': Math.random()
        })
        //state = this.metaReducer.sf(state, 'data.pagination', fromJS(response.pagination))
        //state = this.metaReducer.sf(state, 'data.filter', fromJS(response.filter))
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
                if (docCode != dtoList[i][checkboxKey]) {
                    retDtoList.push(dtoList[i])
                    docCode = dtoList[i][checkboxKey]
                }
            }
        }

        return retDtoList
    }

    dateRangeChange = (state, value) => {
        return this.metaReducer.sfs(state, value)
    }

    changeEnableDate = (state, value) => {
        return this.metaReducer.sf(state, 'data.other.enableddate', value)
    }
    tplusConfig = (state, option) => {
        let baseUrl = `${document.location.protocol}//${option.foreseeClientHost}`
        return this.metaReducer.sfs(state,
            {
                'data.tplus.baseUrl': baseUrl,
                'data.tplus.softAppName': option.appName
            }
        )
    }

        //选择数据改变
        checkboxChange = (arr, itemArr) => {
            let { add, sub, mul, div } = utils.calculate;//加减乘除
            itemArr = itemArr.filter(o => o);
            let totalAmount = 0;
            let totalTax = 0;
            let newArr = itemArr.map(item => {
                totalAmount = add(totalAmount, item.totalAmount)
                totalTax = add(totalTax, item.totalTax)
                return item.id
            })
            // let obj = {
            //     'data.statistics': fromJS({
            //         count: itemArr.length,
            //         totalAmount: utils.number.format(totalAmount, 2),
            //         totalTax: utils.number.format(totalTax, 2),
            //     }),
            //     'data.tableCheckbox': fromJS({
            //         checkboxValue: newArr,
            //         selectedOption: itemArr
            //     })
            // }
            return {
                count: itemArr.length,
                totalAmount: utils.number.format(totalAmount, 2),
                totalTax: utils.number.format(totalTax, 2),
            };
        }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
