import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Input, LoadingMask, DatePicker } from 'edf-component'
import moment from 'moment'
import { consts } from 'edf-consts'
import { environment } from 'edf-utils'

const { TextArea } = Input;

const defaultList = [
    {
        period: '01'
    },
    {
        period: '02'
    },
    {
        period: '03'
    },
    {
        period: '04'
    },
    {
        period: '05'
    },
    {
        period: '06'
    },
    {
        period: '07'
    },
    {
        period: '08'
    },
    {
        period: '09'
    },
    {
        period: '10'
    },
    {
        period: '11'
    },
    {
        period: '12'
    },
    {
        period: '合计'
    },
]

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        // let currentOrg = this.metaAction.context.get('currentOrg'),
        //     appKey = currentOrg ? currentOrg.appKey : '',
        //     appId = currentOrg ? currentOrg.appId : ''
        // injections.reduce('init', this.component.props.initData, appKey, appId)
        // 再次进入 refresh
        let addEventListener = this.component.props.addEventListener;
        if (addEventListener) {
            addEventListener('onTabFocus', ::this.load);
        }
        let tjNd = this.component.props.tjNd,
            tjYf = this.component.props.tjYf,
            year,
            defaultYear = moment().format('YYYY')
        if( tjNd && defaultYear - tjNd >= 0 && defaultYear - tjNd <= 1 ) {
            if(tjNd && tjYf) {
                if( tjYf == '01' ) {
                    year = `${tjNd - 1}`
                } else {
                    year = `${tjNd}`
                }
            }
        }
        injections.reduce('init', year )//年 要字符串格式
        this.load(year)
    }

    componentDidMount = () => {
        // this.onResize()

        const win = window
        if (win.addEventListener) {
            win.addEventListener('resize', this.onResize, false)
            win.addEventListener('click', this.onClick, false)
        } else if (win.attachEvent) {
            win.attachEvent('onresize', this.onResize)
            win.attachEvent('onclick', this.onClick)
        } else {
            win.onresize = this.onResize
            win.onclick = this.onClick
        }
    }

    componentWillUnmount = () => {
        // if (this.props && this.props.isFix === true) return

        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
            win.removeEventListener('click', this.onClick, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
            win.detachEvent('onclick', this.onClick)
        } else {
            win.onresize = undefined
            win.onclick = undefined
        }
    }

    onClick = (e) => {
        let classNameList = e.path.map(item => item.className)
        if(classNameList.indexOf('yearPicker')<0) {

            this.metaAction.sf('data.other.isOpen', false )
        } else if(classNameList.indexOf('ant-calendar-year-panel-prev-decade-btn')<0 || classNameList.indexOf('ant-calendar-year-panel-next-decade-btn')<0 ) {//ant-calendar-year-panel-prev-decade-btn
            setTimeout(this.renderDisabledCell,0)
        }

    }

    onResize = (e) => {
        let keyRandom = Math.floor(Math.random() * 10000)

        this.keyRandom = keyRandom

        setTimeout(() => {
            if (this.keyRandom == keyRandom) {
                this.computeFun()
            }
        }, 200)
    }

    getYearPicker = () => {
        let date = moment( this.metaAction.gf('data.other.year' ) ),
            isOpen = this.metaAction.gf('data.other.isOpen' )
        return (<DatePicker 
            mode="year" 
            format="YYYY"  
            onChange={this.dateChange} 
            onPanelChange={this.panelChange} 
            onOpenChange={() => {this.handleOpenChange()}} 
            value={date}
            open={isOpen}
            disabledTime = {(current) => { return this.disabledUseDate(current)}}
            getCalendarContainer = {() => {return document.querySelector('.yearPicker')}}
        />)
            // onBlur={this.handleBlur} 
    }

    renderDate = ( current, today, arg3 ) => {
        let defaultYear = this.metaAction.gf('data.other.defaultYear' )
        if(current.format('YYYY') == today.format('YYYY')){
            return (<div className={'ant-calendar-year-panel-cell ant-calendar-year-panel-selected-cell'}><a className={'ant-calendar-year-panel-year'}>{today.format('YYYY')}</a></div>)
        } else if( defaultYear && !(today<=defaultYear&& defaultYear-today<=1) ) {
            return (<div className={'ant-calendar-year-panel-cell'} disabled><a className={'ant-calendar-year-panel-year'} disabled>{today.format('YYYY')}</a></div>)
        } else {
            return (<div className={'ant-calendar-year-panel-cell'}><a  className={'ant-calendar-year-panel-year'}>{today.format('YYYY')}</a></div>)
        }
    }
    disabledUseDate = (current) => {
        return current && current < moment().endOf('day');
        return false
		return current &&( current < moment('2017').endOf('year') )
		return current &&( current > moment('2017').endOf('year') || current < moment('2019').endOf('year') )
	}
    dateChange = (e) => {
        let defaultYear = this.metaAction.gf('data.other.defaultYear' )
        if( !(e<=defaultYear&& defaultYear-e<=1) ) {
            this.metaAction.toast('warning', '不能选择这一年！')
            this.metaAction.sf('data.other.isOpen', false )
        }
        this.metaAction.sf('data.other.year', e )
        this.metaAction.sf('data.other.isOpen', false )
    }
    panelChange = (e) => {
        let year = moment(e).format('YYYY')
        let defaultYear = this.metaAction.gf('data.other.defaultYear' )
        debugger
        if( !(year<=defaultYear&& defaultYear-year<=1) ) {
            return
        }
        this.metaAction.sf('data.other.year', year )
        this.metaAction.sf('data.other.isOpen', false )
        this.load(year)
    }
    handleBlur = (e) => {
        this.metaAction.sf('data.other.isOpen', false )
    }
    handleOpenChange = () => {
        this.metaAction.sf('data.other.isOpen', true )
        setTimeout(this.renderDisabledCell,0)
    }
    renderDisabledCell = () => {
        let dateCells = document.querySelectorAll('.ant-calendar-year-panel-year')
        let defaultYear = this.metaAction.gf('data.other.defaultYear' )
        if( !defaultYear ) defaultYear = ( new Date() ).getFullYear()
        for( let key of dateCells) {
            let year = key.innerText
            if(  defaultYear && !(year<=defaultYear&& defaultYear-year<=1)  ) {
                key.style.cursor = 'not-allowed'
                key.style.color = '#bcbcbc'
                key.style.background = '#f5f5f5'
                key.style.textDecoration = 'none'
            }
        }
    }
    getIsOld = ( ) => {
        let currentOrg = this.metaAction.context.get('currentOrg'),
            areaCode = currentOrg.areaCode
        // 北京 陕西 广东 福建 贵州 青海 山东
        return true
    }
    load = async (year, showMessage) => {   
        if( typeof year == 'object' )  year = this.metaAction.gf('data.other.year' )
        let params = {
            year: year//年 要字符串格式
        },
        currentOrg = this.metaAction.context.get('currentOrg'),
        areaCode = currentOrg.areaCode
        setTimeout(() => { this.computeFun() }, 200)
        let res,
            isOld = this.getIsOld()
            if( isOld ) {
                res = await this.webapi.tax.getNewSbse({nd:year})
            } else {
            res = await this.webapi.tax.queryTaxAccountInner(params)
            LoadingMask.hide()
        }
        if( res ) {
            if(showMessage) {
                this.metaAction.toast('success', '更新数据成功！')
            }
            if( !isOld ) {
                res = this.formatData(res)
            }
            if( !res || !res.length ) {
                res = defaultList
            } else if( res && res.length < 13 ) {
                let len = res.length,
                    newList = [],
                    sumRow
                for( let i = 0; i<13; i++) {
                    if( i <= len - 2 ) {
                        newList.push( { ...res[i] })
                    } else if( i == len - 1) {
                        sumRow = { ...res[i] }
                        newList.push( { ...defaultList[i] })
                    } else {
                        newList.push( { ...defaultList[i] })
                    }
                }
                newList[12] = sumRow
                res = newList
            }
            this.injections.reduce('load', res )
        }

    }

    formatData = ( data ) => {
        data.map( (item, index) => {
            item.zzsse = this.formatItemProp( item.taxAmount01 )
            item.fjsse = this.formatItemProp( item.taxAmount02 )
            item.yhsse = this.formatItemProp( item.taxAmount03 )
            // item.whsyjefse = this.formatItemProp( item.taxAmount04 )
            item.whsyjsfylse = this.formatItemProp( item.taxAmount04 )
            // item.grsdsse = this.formatItemProp( item.taxAmount05 )
            item.dkdjgrsdsse = this.formatItemProp( item.taxAmount05 )
            item.qysdsse = this.formatItemProp( item.taxAmount06 )
            item.zese = this.formatItemProp( item.taxAmountTotal )
            if( item.month === undefined ) {
                item.period = item.remark
            } else if( item.month <= 9 ) {
                item.period = '0' + item.month
            } else {
                item.period = '' + item.month
            }
            return item 
        })
        return data
    }

    formatItemProp = ( data ) => {
        if( !data ) {
            return undefined
        }
        if( typeof data === 'number' ) {
            return data
        }
    }
    computeFun = () => {
        let height = document.querySelector('.ttk-tax-app-declaration-tax-xdz-content').offsetHeight
        this.metaAction.sf('data.other.scrollY', height-74 )
    }
    refresh = async () => {
        let year = this.metaAction.gf('data.other.year' )
        let params = {
                year: year
            },
            currentOrg = this.metaAction.context.get('currentOrg'),
            areaCode = currentOrg.areaCode
        let res,
            isOld = this.getIsOld()

        LoadingMask.show()
        if( isOld ) {
            let resultIn = await Promise.all( 
                [
                    Promise.resolve( this.webapi.tax.refreshSbtz({nd:year, ndDm:'06'}) ),
                    Promise.resolve( this.webapi.tax.refreshSbtz({nd:year, ndDm:'12'}) )
                ]
            )
            LoadingMask.hide()
            if( resultIn && resultIn[0] && resultIn[1]  ) {
                this.load(year, true)
                // let res = [ ...resultIn[0].slice(0,6), ...resultIn[1].slice(6,13) ]
                // this.metaAction.toast('success', '更新数据成功！')
                // if( !res || !res.length ) {
                //     res = defaultList
                // } else if( res && res.length < 13 ) {
                //     let len = res.length,
                //         newList = [],
                //         sumRow
                //     for( let i = 0; i<13; i++) {
                //         if( i <= len - 2 ) {
                //             newList.push( { ...res[i] })
                //         } else if( i == len - 1) {
                //             sumRow = { ...res[i] }
                //             newList.push( { ...defaultList[i] })
                //         } else {
                //             newList.push( { ...defaultList[i] })
                //         }
                //     }
                //     newList[12] = sumRow
                //     res = newList
                // }
                // this.injections.reduce('load', res )
            }
        } else {
            this.load(year, true )
        }
    }

    exportExcel = async () => {
        let year = this.metaAction.gf('data.other.year' ),
            params = {
                year
            },
            currentOrg = this.metaAction.context.get('currentOrg'),
            areaCode = currentOrg.areaCode
        if( this.getIsOld() ) {
            let res = await await this.webapi.tax.exportExcel({
                nd: year
            })
        } else {
            let res = await await this.webapi.tax.taxProgressExport(params)
        }
    }

    renderCell = ( sbywbm, index, text, record ) => {
        let list = this.metaAction.gf('data.list' ).toJS(),
            len = list.length
        if( index == len -1 ) {
            return <div title={text}> {text} </div>
        }
        return (<div title={text}>
            <a href="javascript:;" onClick={() => this.openPage(sbywbm, index, text, record)} >{text}</a>
        </div>)
    }

    openPage = async ( sbywbm, index, text, record ) => {
        let currentOrg = this.metaAction.context.get('currentOrg'),
            orgId = currentOrg ? currentOrg.id : ''
        let linkCode = '1203010',
            requestType = 0,
            linkType = 'ysdj',
            sourceType = 1,
            tjNd = this.metaAction.gf('data.other.year' ),
            tjYf = parseInt(record.period)+1,
            tjNdStr,
            tjYfStr
        tjNd = tjNd?parseInt(tjNd):tjNd 
        tjYf = tjYf==13?1:tjYf
        if( tjYf == 13 ) {
            tjYfStr == '01'
            tjNdStr = `${tjNd+1}`
        } else if( tjYf <= 9 ) {
            tjYfStr == `0${tjYf}`
            tjNdStr = `${tjNd}`
        } else {
            tjYfStr == `${tjYf}`
            tjNdStr = `${tjNd}`
        }
        if(sbywbm == 'cswhjsfYbt' || sbywbm == 'jyffjYbt' || sbywbm == 'dfjyffjYbt'){
            sbywbm = 'fjs'
        }
        if( linkType == 'ysdj' ) {
            let params = { linkCode,requestType,linkType,sourceType,"tjNd":tjYf==13?(`${tjNd+1}`):`${tjNd}`,"tjYf":tjYf<10?(`0${tjYf}`):`${tjYf}`,sbywbm,orgId },
                url
            if( linkType == 'ysdj' ) {
                LoadingMask.show()
                if(window.location && window.location.href) params.requestUrl = window.location.href
                console.log('params',params)
                url = await this.webapi.tax.getYsdjUrl( params )
                if( this.isDevMode() ) {
                    url = url ? 'http://'+url : url
                } else {
                    url = url ? window.location.protocol+'//'+url : url
                }
                LoadingMask.hide()
            }
            if (requestType == 0) {
                if (url) {
                    window.open(url)
                }
            }
        }
    }

    isDevMode = () => {
        let href = window.location.href.toLowerCase()

        const devMode = href.indexOf('127.0.0.1') > -1
            || href.indexOf('localhost') > -1
            || href.indexOf('debug.') > -1
            || href.indexOf('192.') > -1
            || href.indexOf('172.') > -1
            || href.indexOf('dev.') > -1
            || href.indexOf('test.') > -1
            || href.indexOf('dev-jr.') > -1
            || href.indexOf('test-jr.') > -1
            || href.indexOf('dev-dz.') > -1
            || href.indexOf('test-dz.') > -1
            || href.indexOf('dz-dev.') > -1
            || href.indexOf('dz-test.') > -1
            || href.indexOf('dev-xdz.') > -1
            || href.indexOf('debug-xdz.') > -1
            || href.indexOf('erpdemo') > -1
            || href.indexOf('xdzdemo') > -1

        if (href.indexOf('erptest.jchl') > -1) return false
        return devMode
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })
    return ret
}

