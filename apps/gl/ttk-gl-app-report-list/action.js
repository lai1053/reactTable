import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Select } from 'edf-component'
import { Map, fromJS } from 'immutable'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')

        this.load()
    }

    load = async () => {

        this.metaAction.sf('data.tab1.loading', true)
        const res = await this.webapi.queryTemplate({orgId: this.component.props.orgId})

        if (res) {
            this.metaAction.sfs({
                'data.tab1.tableHead': fromJS(res[0].heads || []),
                'data.tab1.tableList': fromJS(res[0].rows || []),
                'data.tab2.tableHead': fromJS(res[1].heads || []),
                'data.tab2.tableList': fromJS(res[1].rows || []),
                'data.tab1.loading': false,
                'data.tab1.accountingStandardsId': res[0].accountingStandardsId,
                'data.tab2.accountingStandardsId': res[1].accountingStandardsId
            })
        } else {
            this.metaAction.sf('data.tab1.loading', false)
        }

        setTimeout(() => {
            this.getTableScroll('tab1')
        }, 100)
    }

    getTableScroll = (type) => {
        try {
            let tableOption = this.metaAction.gf(`data.${type}.tableOption`).toJS()

            let dom = type == 'tab1' ? document.getElementsByClassName('ttk-gl-app-report-list-root-table1')[0] : 
            document.getElementsByClassName('ttk-gl-app-report-list-root-table2')[0]

            let tableDom
            if (!dom) {
                return
            }
            tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
            tableDom.scrollTop = 0;
            tableDom.scrollLeft = 0;

            let tableHeadDom = dom.getElementsByClassName('ant-table-thead')[0];
            if (tableDom && dom) {
                let num = dom.offsetHeight - tableDom.offsetHeight

                let number = tableHeadDom.offsetHeight

                if (num < (number+2)) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    tableOption = {
                        ...tableOption,
                        y: height - (number+2)
                    }
                    this.metaAction.sf(`data.${type}.tableOption`, fromJS(tableOption))
                } else { // 当数量太少 不用出现滚动条
                    delete tableOption.y
                    this.metaAction.sf(`data.${type}.tableOption`, fromJS(tableOption))
                }
            }
        } catch (err) {
            // console.log(err)
        }
    }

    // handleClassName = (type) => {

    //     if (type == 'balance') {
    //         const accountingStandardsId = this.metaAction.gf('data.tab1.accountingStandardsId')

    //         let className = 'OrgB'
    //         switch (accountingStandardsId) {
    //             case 2000020001: className = 'OrgB'; break;
    //             case 2000020002: className = 'smallOrgB'; break;
    //             case 2000020009: className = 'orgZhiDuB'; break;
    //             default: className = 'OrgB'
    //         }

    //         return `ttk-gl-app-report-list-root-table1 ${className}`
    //     } else {
    //         const accountingStandardsId = this.metaAction.gf('data.tab2.accountingStandardsId')

    //         let className = 'OrgP'
    //         switch (accountingStandardsId) {
    //             case 2000020001: className = 'OrgP'; break;
    //             case 2000020002: className = 'smallOrgP'; break;
    //             case 2000020009: className = 'orgZhiDuP'; break;
    //             default: className = 'OrgP'
    //         }

    //         return `ttk-gl-app-report-list-root-table2 ${className}`
    //     }

    // }

    handleOnchangeTab = (key) => {
        // console.log(key,'key *********')

        let tab = key == 'balance' ? 'tab1' : 'tab2'

        this.metaAction.sf('data.tab1.loading', true)
        setTimeout(() => {
            this.getTableScroll(tab)
            this.metaAction.sf('data.tab1.loading', false)
        }, 100)
    }

    handleText = (index, rowData, name) => {
        // const value = rowData[name].trim()
        return <div className='divCss' title={rowData[name]}>{rowData[name]}</div>
    }

    tableColumns = (type) => {
        const tableHead = this.metaAction.gf(`data.${type}.tableHead`).toJS()
        let columns = []
        tableHead && tableHead.forEach(element => {
            columns.push({
                name: element.name,
                title: element.title,
                dataIndex: element.name,
                align: element.title == '行次' ? 'center' : 'left',
                // width: type == 'tab1'&&element.title == '行次' ? '49px': type == 'tab2'&&element.title == '行次'? '29px':'160px',
                width: type == 'tab1'&&element.title == '行次' ? '7%': type == 'tab2'&&element.title == '行次'? '4%':'18%',
                render: (_rowIndex, v, index) => { return this.handleText(index, v, element.name) }
            })
        });


        return columns
    }
    
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}