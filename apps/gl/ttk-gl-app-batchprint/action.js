import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { Checkbox, PrintOption3 } from 'edf-component'
import moment from 'moment'
import utils from 'edf-utils'
import debounce from 'lodash.debounce'
import { message } from 'antd'
import { element } from 'prop-types'
const CheckboxGroup = Checkbox.Group

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.batchPrint = debounce(this.batchPrint, 200)
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        this.load()
    }

    load = async () => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            enabledPeriod = `${currentOrg.enabledYear}-${currentOrg.enabledMonth}`,
            startDate,
            endDate
        if (currentOrg.periodDate) {
            startDate = currentOrg.periodDate
            endDate = currentOrg.periodDate
        }
        this.injections.reduce('load', { startDate, endDate, enabledPeriod })
    }

    onPanelChange = (value) => {
        let begindate = utils.date.transformMomentDate(value[0])
        let enddate = utils.date.transformMomentDate(value[1])

        this.injections.reduce('updateState', [{
            path: 'data.printOption.startDate',
            value: begindate.format('YYYY-MM'),
        }, {
            path: 'data.printOption.endDate',
            value: enddate.format('YYYY-MM'),
        }])
        return {
            begindate: begindate.format('YYYY-MM'),
            enddate: enddate.format('YYYY-MM'),
        }
    }

    getNormalDateValue = () => {
        return [moment(this.metaAction.gf('data.printOption.startDate')), moment(this.metaAction.gf('data.printOption.endDate'))]
    }

    renderGroupData = (type, options) => {
        const currentOrg = this.metaAction.context.get("currentOrg")
        if (currentOrg.accountingStandards == '2000020008' && type == 'reports') {// 2000020008  民非
            options = options.map(element => {
                if (element.value == 'profitStatement') {
                    element.label = '业务活动表'
                }
                return element
            })
        }
        let data = options.filter(x => x.type == type)
        let printOptions = this.metaAction.gf('data.printOption'),
            checkedList = [...printOptions.get(type)]
        return <CheckboxGroup
            options={data}
            value={checkedList}
            onChange={(checkedValues) => this.onChange(checkedValues, type)}
        />
    }

    onChange = (checkedValues, type) => {
        this.injections.reduce('updateState', [{
            path: `data.printOption.${type}`,
            value: checkedValues
        }])
    }

    /**
     * 打印设置
     */
    printSet = async () => {
        let _this = this
        LoadingMask.show()
        const { enabledMonth, enabledYear } = this.metaAction.context.get('currentOrg')
        let enableddate = ''
        if (enabledMonth && enabledYear) {
            enableddate = utils.date.transformMomentDate(`${enabledYear}-${enabledMonth}`)
        }
        const {
            height,
            printTime,
            landscape,
            type,
            width,
            leftPadding,
            rightPadding,
            topPadding,
            bottomPadding,
            contentFontSize,
            printCover,
            customPrintTime,
            creator,
            supervisor,
            creatorType,
            supervisorType,
            samePage
        } = await this.webapi.getPrintConfig()
        LoadingMask.hide()
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 700,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'app-proof-of-collect-rpt-print-modal-container',
            children: <PrintOption3
                height={height}
                printTime={printTime}
                landscape={landscape}
                type={type}
                width={width}
                samePage={samePage}
                topPadding={topPadding}
                bottomPadding={bottomPadding}
                contentFontSize={contentFontSize}
                printCover={printCover}
                leftPadding={leftPadding}
                rightPadding={rightPadding}
                creator={creator}
                supervisor={supervisor}
                enableddate={enableddate}
                creatorType={creatorType}
                glFrom={true}
                customPrintTime={customPrintTime}
                supervisorType={supervisorType}
                callBack={_this.submitPrint}
                from='proofOfCollect'
            />
        })
    }

    batchOperation = async (type) => {
        let printOptions = this.metaAction.gf('data.printOption'),
            reportList = [...printOptions.get('reports'), ...printOptions.get('accountBooks')]
        if (reportList && reportList.length < 1) {
            this.metaAction.toast('warning', '请选择批量处理的报表和账簿')
            return
        }
        let params = {}
        params['beginYear'] = printOptions.get('startDate').split('-')[0]
        params['beginPeriod'] = printOptions.get('startDate').split('-')[1]
        params['endYear'] = printOptions.get('endDate').split('-')[0]
        params['endPeriod'] = printOptions.get('endDate').split('-')[1]
        params['printTag'] = type == 'print' ? true : false
        params['reportList'] = Array.from(new Set(reportList))
        this.metaAction.sf('data.loading', true)
        let browserType = utils.environment.getBrowserVersion(),
            tempWindow
        if (browserType.ismode360) {
            tempWindow = window.open()
            tempWindow.document.body.innerHTML = "<div'>正在打印中，请稍等...</div>"
        }
        let forwardingFlag = await this.webapi.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            if (browserType.ismode360 && tempWindow) {
                tempWindow.close()
            }
            this.metaAction.sf('data.loading', false)
            return
        } else {
            let exportAsync = await this.webapi.getPrintDataAsync(params), asyncStatus
            if (exportAsync) {
                let matchInitTimer = setInterval(async () => {
                    asyncStatus = await this.webapi.printAsyncStatus({ sequenceNo: exportAsync, isReturnValue: true })
                    if (asyncStatus && asyncStatus.matchInitState == 'STATUS_RESPONSE') {
                        let url = JSON.parse(asyncStatus.file)
                        if (!browserType.ismode360) {
                            tempWindow = window.open()
                            tempWindow.document.title = type == 'print' ? '批量打印' : '批量导出'
                        }
                        url.tempWindow = tempWindow
                        if (type == 'print') {
                            await this.webapi.getPrintDataAsyncResult(url)
                        } else {
                            await this.webapi.getExportDataAsyncResult(url)
                        }

                        //执行成功
                        clearTimeout(matchInitTimer)
                        this.metaAction.sf('data.loading', false)
                    } else if (asyncStatus && (asyncStatus.matchInitState == 'STATUS_EXCEPTION' ||  asyncStatus.matchInitState == 'STATUS_NO_REQUEST')) {
                        clearTimeout(matchInitTimer)
                        this.metaAction.sf('data.loading', false)
                    } else if (asyncStatus.error && asyncStatus.error.message) {
                        clearTimeout(matchInitTimer)
                        this.metaAction.sf('data.loading', false)
                        this.customeMessage('error', `${asyncStatus.error.message}`, 5)

                    }
                }, 3000)
            } else {
                this.metaAction.sf('data.loading', false)
            }
        }
    }
    /**
     * 批量打印
     */
    batchPrint = async () => {
        
        await this.batchOperation('print')
    }
    /**
    * 批量导出
    */
    batchExport = async () => {
        await this.batchOperation('export')
    }

    customeMessage = (type, content, duration) => {
        message.config({ top: 0, stack: false })
        if (type == 'success') {
            message.success(content, duration)
        } else if (type == 'info') {
            message.info(content, duration)
        } else if (type == 'warning') {
            message.warning(content, duration)
        } else if (type == 'error') {
            message.error(content, duration)
        } else if (type == 'success') {
            message.success(content, duration)
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}