import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Select } from 'edf-component'
import { Map, fromJS } from 'immutable'
import renderColumns from './utils/renderColumns'
import { message } from 'antd'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.extendAction = option.extendAction
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')

        this.appParams = {}
        this.load()
    }

    load = async () => {
		if (sessionStorage['appParams']) {
			this.appParams = JSON.parse(sessionStorage['appParams'])['appParams']
			// console.log(appParams, 'appParams')
        }
        if(this.component.props.initData && this.component.props.initData.type == 'tjSetting'){
            this.metaAction.sf('data.other.fromJRB', true)
        }
        let orgIds = [], currentOrg = this.metaAction.context.get("currentOrg")
        if (this.appParams.orgIds) {
            // orgIds = decodeURIComponent(this.appParams.orgIds.match(/\%5B(.)*\%5D/g)[0]).replace(/(\[|\]|\+)/g, '').split(',')
            // console.log(orgIds, 'orgIds')
            orgIds = JSON.parse(this.appParams.orgIds)
        } 
        else {
            orgIds = [currentOrg.id]
        }

        if (orgIds.length) {
            this.metaAction.sfs({
                'data.other.loading': true,
                'data.other.orgIds': fromJS(orgIds)
            })
        }else {
            this.metaAction.sf('data.other.loading', true)
        }

        

        const list = [
            this.webapi.queryAll({orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0] )}),
            this.webapi.queryAccountMappingForPage({orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])})
        ]
        const res = await Promise.all(list)

        if (res) {
            let mappings = res[1]&&res[1].mappings || []

            // if (res[1]&&res[1].mappings.length) {
            //     mappings.push({}) // 为了增加合计行
            // }

            this.metaAction.sfs({
                'data.other.accountList': fromJS(res[0] || []),
                // 'data.other.tableList': fromJS(res[1].mappings || []),
                'data.other.tableList': fromJS(mappings || []),
                'data.other.aboutAccount': fromJS({
                    noMappingCount: res[1]&&res[1].noMappingCount || 0,
                    origAccountCount: res[1]&&res[1].origAccountCount || 0,
                    yesMappingCount: res[1]&&res[1].yesMappingCount || 0,
                }),
                'data.other.loading': false
            })
        } else {
            this.metaAction.sf('data.other.loading', false)
        }
        
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    handleReLoad = async() => {
        // this.metaAction.sf('data.other.loading', true)
        let orgIds = this.metaAction.gf('data.other.orgIds').toJS()
        const res = await this.webapi.queryAccountMappingForPage({orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])})
        
        if (res) {
            let mappings = res.mappings || []
            // mappings.push({}) // 为了增加合计行

            this.metaAction.sfs({
                'data.other.tableList': fromJS(res.mappings || []),
                'data.other.aboutAccount': fromJS({
                    noMappingCount: res.noMappingCount || 0,
                    origAccountCount: res.origAccountCount || 0,
                    yesMappingCount: res.yesMappingCount || 0,
                }),
                'data.other.loading': false
            })
            this.metaAction.toast('success', '重新匹配成功')
        } else {
            this.metaAction.sf('data.other.loading', false)
        }
        setTimeout(() => {
            this.getTableScroll()
        }, 100)
    }

    getTableScroll = () => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let dom = document.getElementsByClassName('ttk-gl-app-report-setting-root-tablediv-table')[0]
            let tableDom
            if (!dom) {
                return
            }
            tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
            tableDom.scrollTop = 0;
            tableDom.scrollLeft = 0;
            if (tableDom && dom) {
                let num = dom.offsetHeight - tableDom.offsetHeight
                if (num < 39) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    tableOption = {
                        ...tableOption,
                        y: height - 39,
                    }
                    this.metaAction.sf('data.tableOption', fromJS(tableOption))
                } else { // 当数量太少 不用出现滚动条
                    delete tableOption.y
                    this.metaAction.sf('data.tableOption', fromJS(tableOption))
                }
            }
        } catch (err) {
            // console.log(err)
        }
    }


    handleMath = (e, type) => {
        let key = e.target.value
        this.metaAction.sf('data.other.loading', true)
        let sfsObj={}
        sfsObj[`data.other.${type}`] = key
        if (key === '0') {
            let { tableList } = this.metaAction.gf('data.other').toJS()
            let list = tableList.filter(item => !item.systemCode)
            list = list.length == 1 && !list[0].origCode ? [] : list
            sfsObj['data.other.noMapTableList'] = fromJS(list)
        }

        this.metaAction.sfs(sfsObj)
        setTimeout(() => {
            this.metaAction.sf('data.other.loading', false)
            this.getTableScroll()
        }, 100)
    }

    handlePre = async () => {
        let { tab2, tab1, match } = this.metaAction.gf('data.other').toJS()

        this.metaAction.sfs({
            'data.other.tab1': true,
            'data.other.tab2': false,
            'data.other.match': '1',
            'data.other.loading': true
        })

        setTimeout(() => {
            this.metaAction.sf('data.other.loading', false)
            this.getTableScroll()
        }, 100)
    }

    handleNext = async () => {

        // const res = await this.metaAction.modal('warning',{
        //     content: '当前科目匹配存在多对多或多对一关系，请检查',
        //     className: 'warningModalCss',
        //     okText: '确定'
        // })

        let { aboutAccount, tableList , orgIds} = this.metaAction.gf('data.other').toJS()
        // tableList.pop() // 去掉补充的合计行
        const result = await this.webapi.updateAccountMapping({
            mappings: tableList || [],
            orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])
            // noMappingCount: aboutAccount.noMappingCount,
            // yesMappingCount: aboutAccount.yesMappingCount,
            // origAccountCount: aboutAccount.origAccountCount
        })
        if (!result) {
            return
        }

        let { tab2, tab1 } = this.metaAction.gf('data.other').toJS()
        const res = await this.webapi.reportSet({orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])})
        let sfsObj = {
            tab1: false,
            tab2: true
        }
        if (res) {
            sfsObj = Object.assign(sfsObj, res)
        }
        this.injections.reduce('updateSingle', sfsObj)
    }

    handleReportFormula = async () => {
        let orgIds = this.metaAction.gf('data.other.orgIds').toJS()
        const res = await this.metaAction.modal('show', {
            title: '报表列表',
            // width: '1100px',
            width: '85%',
            className: '',
            style: { top: 20 },
            children: this.metaAction.loadApp('ttk-gl-app-report-list', {
                store: this.component.props.store,
                orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])
            }),
            footer: null
        })
    }

    handleSave = async () => {
        let { reClassType, valueType, showValueType , orgIds} = this.metaAction.gf('data.other').toJS()

        // const res = await this.webapi.save(showValueType ? {reClassType, valueType} : {reClassType})
        const list = [
            this.webapi.save(showValueType ? { reClassType, valueType, orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])} : { reClassType, orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])}),
            this.webapi.saveTemplate({orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])})
        ]

        const res = await Promise.all(list)
        if (res) {
            this.metaAction.toast('success', '保存成功')
            this.component.props.closeModal()
        }
    }

    handleCancel = () => {
        this.component.props.closeModal()
    }


    handleMatch = async() => {
        let orgIds = this.metaAction.gf('data.other.orgIds').toJS()
        const res1 = await this.webapi.beginRepeatMapping({orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])})
        let token = sessionStorage['_accessToken'],
        appVersion = sessionStorage['appId']
        if (res1) {
            const result = await this.webapi.queryConnectionStatus({orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])})
            if (result) {
                let a = document.querySelector('#exeType')
                let currentOrg = this.metaAction.context.get('currentOrg')
                if(appVersion == 104){
                    a.setAttribute('href', `Foresees://EtlParams:{"ConID":"JRB","orgID":"${currentOrg.id}","AppID":"BB","FuncID":"GetKM","Token":"${token}"}`)
                }else{
                    a.setAttribute('href', `Foresees://EtlParams:{"ConID":"CSY","orgID":"${currentOrg.id}","AppID":"BB","FuncID":"GetKM"}`)
                }
                a.click()
            } else {
                const response = await this.webapi.saveGrade1AccountFromTTK({orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])})

            }

            this.metaAction.sfs({
                'data.other.isCanNext': false,
                'data.other.loading': true
            })
            
            let res2= null
            setTimeout(async() => {
                res2 = await this.webapi.queryRepeatMappingFinishState({orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])});

                this.times = setInterval(async() => {
                    if(res2 == 0) {
                        res2 = await this.webapi.queryRepeatMappingFinishState({orgId: this.component.props.orgId || this.appParams.orgId || Number(orgIds[0])});
                    }else {
                        clearInterval(this.times)
                        if (res2 == 1) {
                            this.metaAction.sf('data.other.isCanNext', true)
                            this.handleReLoad()
                        } else if (res2 == 2) {
                            message.error('数据异常，请重试！', 5)
        
                            this.metaAction.sfs({
                                'data.other.isCanNext': true,
                                'data.other.loading': false
                            })
                        } else if (res2 == 3) {
                            message.error('本次请求超时，请重试！', 5)
                            this.metaAction.sfs({
                                'data.other.isCanNext': true,
                                'data.other.loading': false
                            })
                        } else {
                            this.metaAction.sf('data.other.loading', false)
                        }
                    }
                }, 500)
            }, 50)
        }
    }


    
    tableColumns = () => {
        let { tableList, aboutAccount, accountList , match, noMapTableList} = this.metaAction.gf('data.other').toJS()
        let list = match == '0' ? noMapTableList : tableList
        return this.renderColumns(list, aboutAccount, accountList)
    }

    renderColumns = (tableList, aboutAccount, accountList) => {
        let columnArray = [
            { fieldName: 'origCode', fieldTitle: '原科目编码' },
            { fieldName: 'origName', fieldTitle: '原科目名称' },
            { fieldName: 'systemCodeAndName', fieldTitle: '标准科目' }
        ]
        const columns = columnArray.map((item, index) => {
            return {
                name: item.fieldName,
                title: item.fieldTitle,
                dataIndex: item.fieldName,
                // key: item.fieldName,
                width: item.fieldName == 'origCode' ? '80px' : '265px',
                render: (_rowIndex, v, index) => { return this.renderText(item.fieldName, v, index, tableList, aboutAccount, accountList) }
            }
        })

        return columns
    }

    renderText = (name, rowData, index, tableList, aboutAccount, accountList) => {
        // console.log(name, rowData, index, tableList)
        let obj = null
        if (rowData) {
            if (!rowData.origName) {
            //     if (name == 'origCode') {
            //         obj = {
            //             children: <span>合计</span>,
            //             props: {
            //                 colSpan: 1
            //             }
            //         }
            //     } else if (name == 'origName') {
            //         obj = {
            //             children: <div style={{ display: 'flex', flexDirection: 'row' }} className='totalStyle'>
            //                 <div>科目数：<span>{aboutAccount.origAccountCount || 0}</span></div>
            //                 <div>已匹配数：<span>{aboutAccount.yesMappingCount || 0}</span></div>
            //                 <div>未匹配数：<span>{aboutAccount.noMappingCount || 0}</span></div>
            //             </div>,
            //             props: {
            //                 colSpan: 2
            //             }
            //         }
            //     } else {
            //         obj = {
            //             children: <span></span>,
            //             props: {
            //                 colSpan: 0
            //             }
            //         }
            //     }
            } else {
                if (name == 'systemCodeAndName') {
                    obj = {
                        children: <Select
                            dropdownStyle={{ width: '265px' }}
                            onChange={(e)=> this.handleSelectChange(e, index)}
                            filterOption={(inputValue, option)=> this.filterOption(inputValue, option)}
                            value={rowData.systemCode}>
                            {
                                accountList && accountList.map((item, index) => {
                                    return <Select.Option key={item.code} value={item.code}>{item.codeBlankSpaceName}</Select.Option>
                                })
                            }
                        </Select>,
                        props: {
                            colSpan: 1
                        }
                    }
                } else {
                    obj = {
                        children: <div className='nameStyle' title={rowData[name]}
                            style={name == 'origCode' ? { textAlign: 'center' } : {}}>{rowData[name]}</div>,
                        props: {
                            colSpan: 1
                        }
                    }
                }

            }
        }

        return obj
    }

    handleSelectChange = (e, index) => {
        let {tableList, aboutAccount, noMapTableList, match} = this.metaAction.gf('data.other').toJS()

       
        let sfsObj = {}

        if (match === '0' ? !noMapTableList[index].systemCode:!tableList[index].systemCode) {
            aboutAccount.noMappingCount = aboutAccount.noMappingCount - 1
            aboutAccount.yesMappingCount = aboutAccount.yesMappingCount + 1
        }

        if (match === '0') {
            noMapTableList[index].systemCode = e
            sfsObj['data.other.noMapTableList'] = fromJS(noMapTableList)

            let isHave = false
            tableList.forEach(element => {
                let obj = noMapTableList.find(item=> item.origCode ==element.origCode)
                if (obj) {
                    element.systemCode = obj.systemCode
                    isHave = true
                }
            });

            if (isHave) sfsObj['data.other.tableList'] = fromJS(tableList)
        } else {
            tableList[index].systemCode = e
            sfsObj['data.other.tableList'] = fromJS(tableList)
        }

        sfsObj['data.other.aboutAccount'] = fromJS(aboutAccount)


        this.metaAction.sfs(sfsObj)
        // this.metaAction.sfs({
        //     'data.other.tableList': fromJS(tableList),
        //     'data.other.aboutAccount': fromJS(aboutAccount)
        // })
    }

    filterOption = (inputValue, option) => {
        if (option && option.props && option.props.value) {
            let accountingSubjects = this.metaAction.gf('data.other.accountList')
            let itemData = accountingSubjects.find(o => o.get('code') == option.props.value)

            if ((itemData.get('code') && itemData.get('code').indexOf(inputValue) == 0)
                || (itemData.get('gradeName') && itemData.get('gradeName').indexOf(inputValue) != -1)
                || (itemData.get('codeAndName') && itemData.get('codeAndName').indexOf(inputValue) == 0)
                || (itemData.get('helpCode') && itemData.get('helpCode').toUpperCase().indexOf(inputValue.toUpperCase()) != -1)
                || (itemData.get('helpCodeFull') && itemData.get('helpCodeFull').indexOf(inputValue) != -1)) {
                return true
            }
            else {
                return false
            }
        }

        return true
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}