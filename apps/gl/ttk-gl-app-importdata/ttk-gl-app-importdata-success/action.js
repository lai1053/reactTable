import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { FormDecorator } from 'edf-component'
import { InfiniteListScroller } from 'edf-component'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }
    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        injections.reduce('init')
        //获取appVersion
        let appVersion = {}
        if (sessionStorage['appId'] == 110) {
            appVersion = sessionStorage['appId']  //解决旧账迁移多企业过来的appId
        } else {
            appVersion = this.component.props.appVersion
        }
        if (!!appVersion) {
            this.metaAction.sf('data.appVersion', appVersion)
        }
        this.load(appVersion)
    }

    load = async (appVersion) => {
        /**
         * 工作台对接，导入页面直接跳转到此，需要异步后端批量调用接口进行处理
         */
        this.metaAction.sf('data.loading', true)
        if (appVersion == 110) {
            let importDataSeq = await this.webapi.importapi.importAsync()
            if (importDataSeq) {
                let matchInittimer = setInterval(async () => {
                    let res = await this.webapi.importapi.getImportStatus({ sequenceNo: importDataSeq })
                    if (res.matchInitState == 'STATUS_RESPONSE') {
                        clearTimeout(matchInittimer)
                        await this.batPromiseRequest()
                        this.metaAction.sfs(
                            {
                                'data.other.title': '导入成功！',
                                'data.loading': false
                            })

                    } else if (res.matchInitState == 'STATUS_EXCEPTION') {
                        clearTimeout(matchInittimer)
                        this.metaAction.sfs(
                            {
                                'data.other.title': '导入失败！',
                                'data.loading': false
                            })
                        this.metaAction.toast('error', `${res.matchInitMessage}`)
                    }
                }, 3000)
            } else {
                this.metaAction.sf('data.loading', false)
            }
        } else {
            await this.batPromiseRequest()
            this.metaAction.sfs(
                {
                    'data.other.title': '导入成功！',
                    'data.loading': false
                })
        }
    }
    /**
     * 批量请求
     */
    batPromiseRequest = async () => {
        await Promise.all([
            this.webapi.importapi.getSuccessAndFailedCount(),
            this.webapi.importapi.queryUnMatch(),
            this.webapi.importapi.queryVoucherFailedList({ "type": "SDVoucher" }),
            this.webapi.importapi.queryAssetFailedList(),
            this.webapi.importapi.saveAccountsSnapshot()
        ]).then((res) => {
            const successAndFailedCount = res[0]
            const queryUnMatch = res[1]
            const queryVoucherFailedList = res[2]
            const queryAssetFailedList = res[3]
            this.injections.reduce('load', successAndFailedCount, { queryUnMatch, queryVoucherFailedList, queryAssetFailedList })
        });

    }

    getErrorDetails = async (type) => {
        let errorDetailsObj = this.metaAction.gf('data.other.errorDetails'),
            newList,
            errorDetails

        if (errorDetailsObj && (errorDetailsObj.queryUnMatch.length > 0
            || errorDetailsObj.queryVoucherFailedList.length > 0
            || errorDetailsObj.queryAssetFailedList.length > 0)) {
            if (type == 'SDAccount') {//科目失败列表
                errorDetails = errorDetailsObj.queryUnMatch
                newList = errorDetails.map((item, index) => {
                    return { id: item.glAccountId, content: `● ${item.sourceCode} ${item.sourceName} 未匹配新科目`, popverContent: `${item.fullMsg}` }
                })
            } else if (type == 'SDVoucher') {//凭证失败列表
                errorDetails = errorDetailsObj.queryVoucherFailedList
                newList = errorDetails.map((item, index) => {
                    return { id: `${item.voucherDate}-${item.code}`, content: `● ${item.msg} `, popverContent: `${item.fullMsg}` }
                })
            } else if (type == 'SDAssetCard') {//资产草稿列表
                errorDetails = errorDetailsObj.queryAssetFailedList
                newList = errorDetails.map((item, index) => {
                    return { content: `● ${item} ` }
                })
            }

            await this.metaAction.modal('show', {
                title: type == 'SDAssetCard' ? '草稿明细' : '失败明细',
                okText: '关闭',
                style: { top: 40 }, //兼容代账端嵌入导账后弹出页面不显示内容
                width: 420,
                wrapClassName: 'errordetails-modal',
                children: <InfiniteListScroller
                    count={newList.length}
                    care=''
                    dataSource={newList}
                />
            })
        }
    }
    // 渲染成功导入信息
    renderTips = () => {
        let converseInfo = this.metaAction.gf('data.other.converseInfo'),
            infos = this.metaAction.gf('data.other.sucessinfos') && this.metaAction.gf('data.other.sucessinfos').toJS()
        if (!infos) {
            return
        } else {
            sessionStorage['currentOrgStatus'] = null
            let res
            if (infos.length > 0) {
                res = infos.filter((element) => element.type == 'SDAccount')[0]
            }
            return (
                <div>
                    <span className='ttk-gl-app-importdata-success-content-notetips'>请及时核对财务期初数据、会计科目、基础档案及历史凭证是否正确。</span>
                    {
                        res && res.tipMessage ?
                            <span className='ttk-gl-app-importdata-success-content-noteaccount'>{res.tipMessage}</span>
                            : ''
                    }
                    {infos.length > 0 &&
                        infos.map(element => {
                            let successCount = element.successCount || 0
                            let failedCount = element.failedCount || 0
                            return (
                                <div className='ttk-gl-app-importdata-success-content-row'>
                                    <div className='ttk-gl-app-importdata-success-content-row-left'>
                                        <span className='ttk-gl-app-importdata-success-content-row-label'
                                            title={element ? `${element.typeName} : ` : ''}>
                                            {element ? `${element.typeName} : ` : ''}
                                        </span>
                                    </div>
                                    <div className='ttk-gl-app-importdata-success-content-row-right'>
                                        <span className='ttk-gl-app-importdata-success-content-row-label'
                                            title={` 成功导入${successCount}条,${element.type == 'SDAssetCard' ? '草稿 ' : '失败 '}${failedCount}条`}>
                                            {`成功导入${successCount}条,${element.type == 'SDAssetCard' ? '草稿 ' : '失败 '} `}
                                            {
                                                element.type == 'SDAccount' || element.type == 'SDVoucher' || element.type == 'SDAssetCard' ?
                                                    failedCount ?
                                                        <a href="javascript:;"
                                                            style={{ color: '#E74040', 'text-decoration': 'underline' }}
                                                            onClick={() => this.getErrorDetails(element.type)}
                                                        >
                                                            {failedCount}
                                                        </a> : 0
                                                    :
                                                    `${failedCount}`
                                            }
                                            {` 条`}

                                        </span>
                                    </div>
                                </div>
                            )
                        }
                        )
                    }
                </div>
            )
        }
    }
    close = async () => {
        sessionStorage['currentOrgStatus'] = null
        if (sessionStorage['appId'] == 110){
            this.component.props.closeTabs({ key: 'current' })
            this.component.props.setPortalContent && this.component.props.setPortalContent('门户首页', 'edfx-app-portal', {
                isShowMenu: false,
                isTabsStyle: false
            })
        }else{
            this.component.props.setPortalContent && this.component.props.setPortalContent('门户首页', 'edfx-app-portal', {
                isShowMenu: false,
                isTabsStyle: false
            })
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



