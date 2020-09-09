import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Icon, Tree, Form, Select, Switch, Table, LoadingMask } from 'edf-component'
import config from './config'
import renderColumns from './utils/renderColumns'
import extend from './extend'
import { fromJS } from 'immutable'
import { unzipSync } from 'zlib';

const Option = Select.Option
const FormItem = Form.Item

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        let type = this.component.props.store.getState('data.type').toJS()['ttk-scm-financial-assistance'].data.typeoutline
        let valueoutline = this.component.props.store.getState('data.type').toJS()['ttk-scm-financial-assistance'].data.valueoutline
        let initData = this.component.props.initData
        if (initData.isCurrent) this.metaAction.sf('data.isCurrent', fromJS(initData.isCurrent));
        if (type != undefined && type == 'outline') {
            let response = {}, year = '', month = ''
            year = valueoutline.slice(0, 4)
            month = valueoutline.slice(5, 6) == 0 ? valueoutline.slice(6, 7) : valueoutline.slice(5, 8)
            response.year = year
            response.month = month
            response.init = false

            LoadingMask.show()
            const list = await this.webapi.tplus.queryList(response);//查询配置信息
            LoadingMask.hide()

            let newList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

            this.metaAction.sf('data.list', fromJS(newList));
            this.metaAction.sf('data.newList', fromJS(list));
            this.metaAction.sf('data.filter.period', valueoutline);
        } else {
            let response = {}, year = '', month = ''
            year = initData.date.slice(0, 4)
            month = initData.date.slice(5, 6) == 0 ? initData.date.slice(6, 7) : initData.date.slice(5, 8)
            response.year = year
            response.month = month
            response.init = false
            LoadingMask.show()
            const list = await this.webapi.tplus.queryList(response);//查询配置信息
            LoadingMask.hide()

            let newList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

            this.metaAction.sf('data.list', fromJS(newList));
            this.metaAction.sf('data.newList', fromJS(list));
            this.metaAction.sf('data.filter.period', initData.date);
        }
    }

    //当前app的 "tab被点击" (从其他app切换到当前app)
    onTabFocus = async (props) => {
        // this.refresh()
    }

    depreciationChange = async (e) => {
        let date = this.metaAction.momentToString(e, 'YYYY-MM')
        this.component.props.setFilters('outline', date)
        let response = {}, year = '', month = ''
        year = date.slice(0, 4)
        month = date.slice(5, 6) == 0 ? date.slice(6, 7) : date.slice(5, 8)
        response.year = year
        response.month = month
        response.init = false
        LoadingMask.show()
        const list = await this.webapi.tplus.queryList(response);//查询配置信息
        LoadingMask.hide()
        this.metaAction.sf('data.newList', fromJS(list));
        this.metaAction.sf('data.filter.period', date);
    }

    //刷新列表
    refresh = async () => {
        let initData = this.metaAction.gf('data.filter.period')

        let response = {}, year = '', month = ''
        year = initData.slice(0, 4)
        month = initData.slice(5, 6) == 0 ? initData.slice(6, 7) : initData.slice(5, 8)
        response.year = year
        response.month = month
        response.init = false
        LoadingMask.show()
        const list = await this.webapi.tplus.queryList(response);//查询配置信息
        LoadingMask.hide()
        this.metaAction.sf('data.newList', fromJS(list));
        this.metaAction.sf('data.filter.period', initData);
    }

    //下载数据
    downloadText = async () => {
        let initData = this.metaAction.gf('data.filter.period')

        let response = {}, year = '', month = ''
        year = initData.slice(0, 4)
        month = initData.slice(5, 6) == 0 ? initData.slice(6, 7) : initData.slice(5, 8)
        response.year = year
        response.month = month
        response.init = true
        LoadingMask.show()
        const list = await this.webapi.tplus.queryList(response);//查询配置信息
        LoadingMask.hide()
        this.refresh()
    }

    getContentChildren = () => {
        let arr = [],
            data = this.metaAction.gf('data').toJS()
        this.list = this.metaAction.gf('data.newList') && this.metaAction.gf('data.newList').toJS()

        arr.push(
            <Table className='ttk-scm-app-outline-table'
                pagination={false}
                allowColResize={false}
                enableSequenceColumn={false}
                bordered={true}
                showHeader={false}
                rowClassName={this.getRowClassName}
                //scroll={data.list.length > 0 ? data.tableOption : {} }
                dataSource={data.list}
                rowSelection={this.getRowSelection()}
                columns={[
                    {
                        fieldName: '1',
                        title: '9月申报概要',
                        dataIndex: '1',
                        key: '1',
                        render: (text, record, index) => this.getOtherContent(text, record, index, 1)
                    },
                    {
                        fieldName: '2',
                        title: '9月申报概要',
                        dataIndex: '2',
                        key: '2',
                        render: (text, record, index) => this.getOtherContent(text, record, index, 2)
                    }, {
                        fieldName: '3',
                        title: '9月申报概要',
                        dataIndex: '3',
                        key: '3',
                        render: (text, record, index) => this.getOtherContent(text, record, index, 3)
                    },
                ]}>
            </Table>
        )
        return arr
    }

    getRowClassName = (record, index) => {
        if (record.isHeader) {
            return 'table-title'
        }
    }

    //列表展示
    tableColumns = () => {
        let list = this.metaAction.gf('data.list')  //表格信息
        if (list) {
            return renderColumns(list, this)
        }
    }

    //表格复选框
    getRowSelection = () => {
        return undefined
    }

    getHeaderContent = (text, record, index) => {

        const obj = {
            children: record.name,
            props: {},
        };
        if (record.isHeader) {
            obj.props.colSpan = 3
        }
        return obj
    }

    list = []

    getData = (index, type) => {
        let initData = this.metaAction.gf('data.filter.period')

        let response = {}, year = '', month = ''
        year = initData.slice(0, 4)
        month = initData.slice(5, 6) == 0 ? initData.slice(6, 7) : initData.slice(5, 8)

        if (this.list) {
            const data = [
                {
                    children: [
                        {
                            name: month + '月申报概要',
                        }
                    ]
                },
                {
                    children: [
                        {
                            name: '本月税负率',
                            value: this.list && this.list.bysfl ? this.list.bysfl : '--'
                        },
                        {
                            name: '销项总张数',
                            value: this.list && this.list.xxzzs ? this.list.xxzzs : '0'
                        },
                        {
                            name: '进项总张数',
                            value: this.list && this.list.jxzzs ? this.list.jxzzs : '0'
                        }
                    ]
                },
                {
                    children: [
                        {
                            name: '销项税额',
                            value: this.list && this.list.xxse ? this.list.xxse.toFixed(2) : '0.00'
                        },
                        {
                            name: '进项已认证税额',
                            value: this.list && this.list.jxyrzse ? this.list.jxyrzse.toFixed(2) : '0.00'
                        },
                        {
                            name: '预估增值税额',
                            value: this.list && this.list.ygzzse ? this.list.ygzzse.toFixed(2) : '0.00'
                        }
                    ]
                },
                {
                    children: [
                        {
                            name: '申报进项情况',
                        }
                    ]
                },
                {
                    children: [
                        {
                            name: '海关缴款书税额',
                            value: this.list && this.list.sbjxqk && this.list.sbjxqk.hgjksse ? this.list.sbjxqk.hgjksse.toFixed(2) : '0.00'
                        },
                        {
                            name: '海关缴款书金额',
                            value: this.list && this.list.sbjxqk && this.list.sbjxqk.hgjksje ? this.list.sbjxqk.hgjksje.toFixed(2) : '0.00'
                        },
                        {
                            name: '海关缴款书份数',
                            value: this.list && this.list.sbjxqk && this.list.sbjxqk.hgjksfs ? this.list.sbjxqk.hgjksfs : '0'
                        }
                    ]
                },
                {
                    children: [
                        {
                            name: '增值税专票税额',
                            value: this.list && this.list.sbjxqk && this.list.sbjxqk.zzszpse ? this.list.sbjxqk.zzszpse.toFixed(2) : '0.00'
                        },
                        {
                            name: '增值税专票金额',
                            value: this.list && this.list.sbjxqk && this.list.sbjxqk.zzszpje ? this.list.sbjxqk.zzszpje.toFixed(2) : '0.00'
                        },
                        {
                            name: '增值税专票份数',
                            value: this.list && this.list.sbjxqk && this.list.sbjxqk.zzszpfs ? this.list.sbjxqk.zzszpfs : '0'
                        }
                    ]
                },
                {
                    children: [
                        {
                            name: '进项已认证税额合计',
                            value: this.list && this.list.sbjxqk && this.list.sbjxqk.jxyrzsehj ? this.list.sbjxqk.jxyrzsehj.toFixed(2) : '0.00'
                        },
                        {
                            name: '进项金额合计',
                            value: this.list && this.list.sbjxqk && this.list.sbjxqk.jxjehj ? this.list.sbjxqk.jxjehj.toFixed(2) : '0.00'
                        },
                        {
                            name: '进项份数合计',
                            value: this.list && this.list.sbjxqk && this.list.sbjxqk.jxfshj ? this.list.sbjxqk.jxfshj : '0'
                        }
                    ]
                },
                {
                    children: [
                        {
                            name: '申报销项情况',
                        }
                    ]
                },
                {
                    children: [
                        {
                            name: '增值税专票税额',
                            value: this.list && this.list.sbxxqk && this.list.sbxxqk.zzszpse ? this.list.sbxxqk.zzszpse.toFixed(2) : '0.00'
                        },
                        {
                            name: '增值税专票金额',
                            value: this.list && this.list.sbxxqk && this.list.sbxxqk.zzszpje ? this.list.sbxxqk.zzszpje.toFixed(2) : '0.00'
                        },
                        {
                            name: '增值税专票份数',
                            value: this.list && this.list.sbxxqk && this.list.sbxxqk.zzszpfs ? this.list.sbxxqk.zzszpfs : '0'
                        }
                    ]
                },
                {
                    children: [
                        {
                            name: '销项税额合计',
                            value: this.list && this.list.sbxxqk && this.list.sbxxqk.xxsehj ? this.list.sbxxqk.xxsehj.toFixed(2) : '0.00'
                        },
                        {
                            name: '销项金额合计',
                            value: this.list && this.list.sbxxqk && this.list.sbxxqk.xxjehj ? this.list.sbxxqk.xxjehj.toFixed(2) : '0.00'
                        },
                        {
                            name: '销项份数合计',
                            value: this.list && this.list.sbxxqk && this.list.sbxxqk.xxfshj ? this.list.sbxxqk.xxfshj : '0'
                        }
                    ]
                }
            ]
            let colSpan
            if (type == 1) {
                if (data[index].children.length > 1) {
                    colSpan = 1
                } else {
                    colSpan = 3
                }

            } else {
                if (data[index].children.length == 1) {
                    colSpan = 0
                } else {
                    colSpan = 1
                }
            }
            return {
                colSpan,
                value: data[index].children[type - 1]
            }
        }

    }

    getOtherContent = (text, record, index, type) => {
        let obj
        const result = this.getData(index, type)
        return {
            children: result && result.value != undefined ? (result.value.value != undefined && result.value.name ? (result.value.name + ' : ' + result.value.value) : result.value.name) : '',
            props: {
                colSpan: result ? result.colSpan : ''
            }
        }
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}