import {reducer as MetaReducer} from 'edf-meta-engine'
import {Map, List, fromJS} from 'immutable'
import {getInitState} from './data'

class reducer{
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state) => {
        return this.metaReducer.init(state, getInitState())
    }

    load = (state, option) => {
        let { orgDto, dlxxDto, nsxxDto,dlfs,oldVatTaxpayerNum } = option
        let {name, helpCode, nsrsbh, dlzh, dlmm, blr, blrzjhm, linkName, linkTel, isEnable, areaCode, sfdm, csdm, qxdm} = orgDto
        let {DLFS, DLMM, DLZH,gssbmm} = dlxxDto
        let dlfsu = dlfs
        let newnsxxDto =  {}
        if(nsxxDto == null){
            newnsxxDto.BSY = '';
            newnsxxDto.BSY_SFZJHM = '';
            newnsxxDto.BSY_SFZJLX = ''
        }else {
            // {BSY, BSY_SFZJHM, BSY_SFZJLX} = nsxxDto
            newnsxxDto.BSY = nsxxDto.BSY;
            newnsxxDto.BSY_SFZJHM = nsxxDto.BSY_SFZJHM;
            newnsxxDto.BSY_SFZJLX = nsxxDto.BSY_SFZJLX
        }
        let zh = [];
        if(dlfs == '7'){
            zh = DLZH.split('#')
        }
        let from = {
            name,
            helpCode,
            nsrsbh_old:oldVatTaxpayerNum?oldVatTaxpayerNum:nsrsbh,
            nsrsbh_new:nsrsbh?nsrsbh:oldVatTaxpayerNum,
            dlfs: dlfsu,
            dlzh: dlfsu != '7'?DLZH:zh[0],
            sfz:dlfsu == '7'?zh[1]:'',
            dlmm: DLMM, gssbmm, blr:newnsxxDto.BSY, blrzjhm: newnsxxDto.BSY_SFZJHM, blrzj: newnsxxDto.BSY_SFZJLX, linkName, linkTel, isEnable, areaCode, sfdm, csdm, qxdm}
        let area = {registeredProvincial: sfdm, registeredCity: csdm, registeredCounty: qxdm}
        state = this.metaReducer.sfs(state, {
            'data.form': fromJS(from),
            'data.area': fromJS(area)
        })
        return state
    }

    dzswjStatus = (state, value) => {
        return this.metaReducer.sf(state, 'data.dzswjmm', value)
    }

    updateObj = (state,obj) => {
        return this.metaReducer.sfs(state,obj)
    }

    updateSingle = (state,path,value) => {
        return this.metaReducer.sf(state,path,value)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})

    return {...metaReducer, ...o}
}