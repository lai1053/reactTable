import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state,option) => {
        const initState = getInitState()
        initState.data.changelinkman = option.changelinkman
        initState.data.areaType = option.areaType
        return this.metaReducer.init(state, initState)
    }

    load = (state, option, type) => {
        let data = {}

        data['data.basic.ts'] = option.ts
        data['data.basic.name'] = option.name
        data['data.basic.accountingStandards'] = option.accountingStandards
        data['data.basic.enableDate'] = option.enabledYear + '-' + option.enabledMonth
        data['data.basic.vatTaxpayer'] = option.vatTaxpayer
        data['data.basic.vatTaxpayerNum'] = option.vatTaxpayerNum
        data['data.basic.isSignAndRetreat'] = option.isSignAndRetreat
        data['data.basic.ieEnv'] = option.ieEnv || false
        data['data.initState.name'] = option.name
        data['data.initState.enableDate'] = option.enabledYear + '-' + option.enabledMonth
        data['data.initState.vatTaxpayer'] = option.vatTaxpayer
        data['data.initState.accountingStandards'] = option.accountingStandards
        data['data.initState.isSignAndRetreat'] = option.isSignAndRetreat
        data['data.initState.vatTaxpayerNum'] = option.vatTaxpayerNum
        data['data.other.openSjvatTaxpayerChangeStateState'] = option.vatTaxpayerChangeState

        if (option.dlxxDto) {
            data['data.other.openSjState'] = option.dlxxDto.openSjState
            //个税申报密码
            data['data.basic.gssbmm'] = option.dlxxDto.gssbmm
            data['data.initState.gssbmm'] = option.dlxxDto.gssbmm
            //判断是否有登录方式、网报账号、网报密码
            if (!(type && type == 2)) {
                if (option.dlxxDto.DLFS) {
                    data['data.basic.dlfs'] = String(option.dlxxDto.DLFS)
                }
                if (option.dlxxDto.DLZH) {
                    data['data.basic.wbzh'] = option.dlxxDto.DLZH
                }
                if (option.dlxxDto.DLMM) {
                    data['data.basic.wbmm'] = option.dlxxDto.DLMM
                    data['data.initState.pwd'] = option.dlxxDto.DLMM
                }
                data['data.other.readOrgInfoBtn'] = this.readOrgInfoBtnState(option.dlxxDto)
                if (!(this.readOrgInfoBtnState(option.dlxxDto))) {
                    data['data.other.CAStep'] = false
                    data['data.other.hasReadCA'] = true
                }
            }
            //非网报账号
            if (!option.dlxxDto.isNetAccount) {
                if (option.dlxxDto.DLFS) {
                    data['data.basic.ss'] = option.dlxxDto.SS
                    data['data.other.readOrgInfoBtn'] = false
                    data['data.other.isNetAccount'] = true
                }
            } else {
                if (!option.dlxxDto.openSjState) {
                    data['data.basic.ss'] = option.dlxxDto.SS
                    data['data.initState.ss'] = option.dlxxDto.SS
                    data['data.other.isShowOtherMsg'] = false
                    // let dkswjgshEnum = this.metaReducer.gf(state, 'data.enumData.dkswjgshEnum')
                    // if(dkswjgshEnum.indexOf(areasCode.id) > -1) {
                    //     data['data.other.showDkswjgsh'] = true
                    //     data['data.basic.dkswjgsh'] = option.dkswjgsh
                    //     data['data.initState.dkswjgsh'] = option.dkswjgsh
                    // }else {
                    //     data['data.other.showDkswjgsh'] = false
                    //     data['data.basic.showDkswjgsh'] = null
                    //     data['data.initState.dkswjgsh'] = null
                    // }
                    if (type && type == 1) {
                        data['data.basic.dlfs'] = null
                        data['data.basic.wbzh'] = null
                        data['data.basic.wbmm'] = null
                        data['data.initState.pwd'] = null
                        data['data.nsxxDto.name'] = null
                        data['data.other.hasReadCA'] = false
                        data['data.other.readOrgInfoBtn'] = true
                    }
                } else {
                    data['data.basic.ss'] = option.dlxxDto.SS
                    data['data.initState.ss'] = option.dlxxDto.SS
                    // let dkswjgshEnum = this.metaReducer.gf(state, 'data.enumData.dkswjgshEnum')
                    // if(dkswjgshEnum.indexOf(areasCode.id) > -1) {
                    //     data['data.other.showDkswjgsh'] = true
                    //     data['data.basic.dkswjgsh'] = option.dkswjgsh
                    //     data['data.initState.dkswjgsh'] = option.dkswjgsh
                    // }else {
                    //     data['data.other.showDkswjgsh'] = false
                    //     data['data.basic.showDkswjgsh'] = null
                    //     data['data.initState.dkswjgsh'] = null
                    // }
                    data['data.nsxxDto.name'] = option.dlxxDto.QYMC
                    data['data.basic.isAuthorization'] = option.dlxxDto.isAuthorization
                    //登录方式为CA登录
                    if (option.dlxxDto.DLFS == 1) {
                        data['data.other.CAStep'] = false
                        data['data.other.hasReadCA'] = true
                    }
                    data['data.other.readOrgInfoBtn'] = false
                    data['data.other.isShowOtherMsg'] = true
                    let appVersion = this.metaReducer.gf(state, 'data.appVersion')
                    let appParams
                    if(sessionStorage['appParams']) {
                        appParams = JSON.parse(sessionStorage['appParams'])['appParams']
                    }
                    if(appVersion == 105 && appParams && appParams.isReadOnly && appParams.isReadOnly == 1) {
                        data['data.other.isReadOnly'] = true
                    }
                }
            }
        } else {
            data['data.other.isShowOtherMsg'] = false
        }
        if (option.nsxxDto) {
            //初始保存银行账户和开户银行状态
            data['data.initState.YHZH'] = option.nsxxDto.YHZH
            data['data.initState.KHYH'] = option.nsxxDto.KHYH
            if(!!option.nsxxDto.ZCZB) {
                option.nsxxDto.ZCZB = this.addThousandsPosition(option.nsxxDto.ZCZB, true)
            }
            data['data.nsxxDto'] = fromJS(option.nsxxDto)

            if (option.nsxxDto.KYRQ) {
                data['data.nsxxDto.KYRQ'] = option.nsxxDto.KYRQ.slice(0, 10)
            }
            // //处理增值税企业类型字段
            // let zzsqylxEnum = this.metaReducer.gf(state, 'data.enumData.tax.ZZSQYLX.enumDetails').toJS()
            // let arr = []
            // if(option.nsxxDto.ZZSQYLX) {
            //     for(let i = 0; i < zzsqylxEnum.length ; i++) {
            //         arr.push(zzsqylxEnum[i].code)
            //     }
            //     if(arr.indexOf(option.nsxxDto.ZZSQYLX) == -1) {
            //         data['data.nsxxDto.ZZSQYLX'] = null
            //     }
            // }
        } else {
            data['data.nsxxDto'] = fromJS({})
        }
        if (option.sfzxxDtos.length != 0) {
            data['data.sfzxxDtos'] = fromJS(option.sfzxxDtos)
        }
        if (option.zgrdDtos.length != 0) {
            data['data.zgrdDtos'] = fromJS(option.zgrdDtos)
        }
        if(option.zfjglxDto){
            data['data.zfjgInfo'] = fromJS(option.zfjglxDto)
        }
        if(option.fzjgxxDtos.length != 0){
            data['data.list'] = fromJS(option.fzjgxxDtos)
        }
        state = this.metaReducer.sfs(state, data)
        return state
    }
    readOrgInfoBtnState = (data) => {
        let dlfs = data.DLFS,
            ss = data.SS
        if (!ss || !dlfs) {
            return true
        }
        if (dlfs != 1) {
            let wbzh = data.DLZH,
                wbmm = data.DLMM
            if (!wbzh || !wbmm) {
                return true
            } else {
                return false
            }
        } else {
            if (!data.caState) {
                return true
            } else {
                return false
            }
        }
    }
    addThousandsPosition = (input, isFixed) => {
        if (!input) return null
        if (isNaN(input)) return null
        let num

        if (isFixed) {
            num = parseFloat(input).toFixed(2)
        } else {
            num = input.toString()
        }
        let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g
        return num.replace(regex, "$1,")
    }
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    accountDateChange = (state, option) => {
        let list = this.metaReducer.gf(state, 'data.list').toJS()
        list.map(item => {
            if(item.id == option.record.id) item[option.fieldName] = option.e
        })
        state = this.metaReducer.sf(state, `data.list`, fromJS(list))
        return state
    }
    //总分机构
    fzjgList  = (state, option) => {
        let value = option;
		if (value) {
            state = this.metaReducer.sf(state, 'data.list', fromJS(value));
		}
		// if (value && value.page) {
		// 	let page = {
		// 		current: value.page.currentPage,
		// 		total: value.page.totalCount,
		// 		pageSize: value.page.pageSize
		// 	};
		// 	state = this.metaReducer.sf(state, 'data.pagination', fromJS(page));
        // }
        return state;
	}


}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}