import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { fromJS } from 'immutable'
import moment from 'moment'
import utils, { path } from 'edf-utils'
import { Tree, Icon, Button, Popover } from 'edf-component'
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
            addEventListener('enlargeClick', () => this.onResize({}))
        }
        injections.reduce('init')

        this.load()

    }
    load = async () => {
        const defalutDate = moment(new Date()),
            currentOrg = this.metaAction.context.get("currentOrg")
        let maxDefaultDate = defalutDate
        if (currentOrg.periodDate) {
            maxDefaultDate = moment(new Date(currentOrg.periodDate)).add(1, 'month')
        }
        
        const docMaxDate = await this.webapi.archivemanagement.getDocMaxDate()
        // const treeState = await this.webapi.archivemanagement.init()
        // if (treeState && treeState.length > 0) {
        //     const maxDate = treeState.reverse()[0].key
        //     /**
        //      * 兼容IE浏览器，要不然对于2018-8这种格式的日期无法用moment转换
        //      */
        //     // const strYear = maxDate.split('-')[0]
        //     // const strMonth = maxDate.split('-')[1]
        //     // maxDefaultDate = moment(strYear + `-` + `${strMonth}`.padStart('2', '0')).add(1, 'month')

        // }
        const selectMonth = maxDefaultDate.year() + `-` + `${maxDefaultDate.month()}`
        this.injections.reduce('load', { expandedKeys: [`${maxDefaultDate.year()}`], selectedKeys: [selectMonth], docMaxDate })
        await this.reloadData({ year: maxDefaultDate.year(), period: `${maxDefaultDate.month()}` })
    }
    /**
     切换app
    */
    onTabFocus = async () => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.checkboxChange()//清空选项  
            await this.reloadData()
        }
    }


    /**
     * 选择
     */
    onSelect = async (selectedKeys, event) => {
        if (selectedKeys.length > 0) {
            this.metaAction.sf('data.tree.selectedKeys', fromJS(selectedKeys))
            const finishStates = this.metaAction.gf('data.tree.finishStates') || fromJS([])
            if (finishStates.size > 0 && finishStates.filter(element => element.get('key') == selectedKeys[0]).size > 0) {
                this.metaAction.sf('data.other.isFileFinish', true)
            } else {
                this.metaAction.sf('data.other.isFileFinish', false)
            }
            this.metaAction.sf('data.other.btnFileDisabled', true)
            await this.reloadData()
            this.metaAction.sf('data.other.btnFileDisabled', false)

        }
        if (event && !event.selected) {
            event.selected = true
        }
    }
    /**
     * 展开
     */
    onExpand = (expandedKeys) => {
        this.metaAction.sf('data.tree.expandedKeys', fromJS(expandedKeys))
    }
    /**
     * 获取popover内容
     */
    getPopoverContent = (selectKeys) => {

        const btnFileDisabled = this.metaAction.gf('data.other.btnFileDisabled')
        return (
            <div>
                <div style={{ width: '300px' }}>归档数据发生变化，请"重新归档"，也可以通过右上角的"重新归档"按钮进行归档</div>
                <div style={{ textAlign: "center", marginTop: '5px' }}>
                    <Button
                        children='重新归档'
                        className="popverbtn"
                        disabled={btnFileDisabled}
                        onClick={this.batFileClick([selectKeys])}
                    />
                </div>
            </div>
        )
    }
    /**
     * 渲染treeNode节点
     */
    renderTreeNodes = () => {
        let defalutDate = moment(new Date()),
            currentOrg = this.metaAction.context.get("currentOrg"),
            startDate = moment(currentOrg.enabledYear + "-"
                + `${currentOrg.enabledMonth}`),
            endData = moment(currentOrg.periodDate),
            curr = startDate,
            dates = []
        if (!currentOrg.periodDate) {
            endData = defalutDate
        }
        const docMaxDate = this.metaAction.gf('data.docMaxDate')
        if (docMaxDate) {
            const strYear = docMaxDate.split('-')[0]
            const strMonth = docMaxDate.split('-')[1]
            if (moment(strYear + `-` + `${strMonth}`.padStart('2', '0')) > endData) {
                endData = moment(strYear + `-` + `${strMonth}`.padStart('2', '0'))
            }
        }
        while (curr <= endData) {
            let month = curr.month(),
                year = curr.year()
            dates.push({ year: year, month: month + 1 })
            curr.set('month', month + 1)
        }
        const groupDates = dates ? fromJS(dates).groupBy(val => val.get('year')) : fromJS([])
        if (groupDates.size < 1) return <div></div>
        let treeData = [], treeSortData = []
        groupDates.map((item, year) => {
            let month = item.map(e => { return e.get('month') }).reverse()
            treeData.push({ key: year, children: [...month.toJS()] })
        })
        treeSortData = fromJS(treeData).map(e => { return { key: e.get('key'), children: e.get('children').toJS() } }).reverse().toJS();
        const finishStates = this.metaAction.gf('data.tree.finishStates') || fromJS([])
        return treeSortData.map(parent => {
            let parkey = parent.key + `-0`
            let isParIcons = finishStates.size > 0 ? finishStates.filter(element => element.get('key') == parkey) : undefined
            return (
                <Tree.TreeNode
                    title={`${parent.key}年`}
                    icon={
                        isParIcons == undefined
                            ? '' :
                            isParIcons.size < 1 ? '' :
                                isParIcons.first().get('value') == false ?
                                    <Popover placement="topLeft" content={this.getPopoverContent(parkey)} overlayClassName='tishipopover'>
                                        <Icon fontFamily="edficon" type="tishi" className="tishi" />
                                    </Popover>
                                    :
                                    <Icon fontFamily="edficon" type="duigou" className="duigou" />

                    }
                    key={parent.key}>
                    {
                        parent.children ? parent.children.map(child => {
                            let key = parent.key + `-` + `${child}`
                            let isIcons = finishStates.size > 0 ? finishStates.filter(element => element.get('key') == key) : undefined
                            return <Tree.TreeNode
                                icon={
                                    isIcons == undefined
                                        ? '' :
                                        isIcons.size < 1 ? '' :
                                            isIcons.first().get('value') == false ?
                                                <Popover placement="topLeft" content={this.getPopoverContent(key)} overlayClassName='tishipopover'>
                                                    <Icon fontFamily="edficon" type="tishi" className="tishi" />
                                                </Popover>
                                                :
                                                <Icon fontFamily="edficon" type="duigou" className="duigou" />

                                }
                                title={`${child}月`}
                                key={key} />
                        }) : ''
                    }
                </Tree.TreeNode>);
        });
    }
    //选择数据改变
    checkboxChange = (arr = [], itemArr = []) => {
        itemArr = itemArr.filter(o => o != undefined);
        let newArr = []
        itemArr.map(item => {
            if (item) {
                newArr.push(item.id)
            }
        })
        this.injections.reduce('update', {
            path: 'data.other.tableCheckbox',
            value: {
                checkboxValue: newArr,
                selectedOption: itemArr
            }
        })
        this.selectedOption = itemArr
    }
    /**
     * 联查对应期间明细数据
     */
    modifyDetail = async (curData) => {
        this.injections.reduce('tableLoading', true)
        await this.reloadData({ year: curData.year, period: curData.period })
        this.metaAction.sf('data.tree.selectedKeys', fromJS([curData.year + '-' + curData.period]))
        this.injections.reduce('tableLoading', false)
    }
    /**
    * 归档
    */
    batFileClick = (selectedKeys) => async () => {

        if (selectedKeys.length < 1) {
            selectedKeys = this.metaAction.gf('data.tree.selectedKeys').toJS() || []
        }
        if (selectedKeys.length < 1) {
            this.metaAction.toast('warning', '请选择要归档的期间')
            return
        }
        this.injections.reduce('tableLoading', true)
        this.injections.reduce('btnDisabled', true)
        const option = { year: selectedKeys[0].split('-')[0], period: selectedKeys[0].split('-')[1] || 0 }
        let fileArchive = await this.webapi.archivemanagement.fileArchive(option)
        let fileArchiveStatus
        if (fileArchive) {
            let fileArchivetimer = setInterval(async () => {
                fileArchiveStatus = await this.webapi.archivemanagement.isFinishArchiveState({ sequenceNo: fileArchive })
                if (fileArchiveStatus) {
                    clearTimeout(fileArchivetimer)
                    await this.reloadData()
                    this.injections.reduce('btnDisabled', false)
                    this.injections.reduce('tableLoading', false)
                }
            }, 3000)
        } else {
            this.injections.reduce('btnDisabled', false)
            this.injections.reduce('tableLoading', false)
        }
    }
    /**
     * 批量下载excel
     */
    batchDownLoadExcel = async () => {
        let selectedRowKeys = this.metaAction.gf('data.other.tableCheckbox.checkboxValue').toJS() || []
        if (selectedRowKeys.length < 1) {
            this.metaAction.toast('warning', '请选择要下载的文件')
            return
        }
        let selectMonth = this.metaAction.gf('data.tree.selectedKeys').toJS()
        if (selectMonth.length < 1) {
            this.metaAction.toast('warning', '请选择对应的期间')
            return
        }
        const year = `${selectMonth[0]}`.split('-')[0]
        const period = `${selectMonth[0]}`.split('-')[1] || "0"
        let selectedRowData = this.metaAction.gf('data.other.tableCheckbox.selectedOption').toJS()
        const option = selectedRowData.map(element => { return element.excelFileId })
        this.injections.reduce('btnDisabled', true)
        await this.webapi.archivemanagement.downLoadExcelBatch({ year: year, period: period, excelFileIds: option })
        this.injections.reduce('btnDisabled', false)
    }
    /**
   * 下载excel
   */
    downLoadExcel = async (curData) => {
        if(curData.excelFileId){
            this.injections.reduce('tableLoading', true)
            await this.webapi.archivemanagement.downLoadExcel({ excelFileId: curData.excelFileId })
            this.injections.reduce('tableLoading', false)
        }else{
            this.metaAction.toast('warning', '文件不存在，请重新归档')
            return
        }

    }
    /**
     * 批量下载PDF
     */
    batchDownLoadPdf = async () => {
        let selectedRowKeys = this.metaAction.gf('data.other.tableCheckbox.checkboxValue').toJS() || []
        if (selectedRowKeys.length < 1) {
            this.metaAction.toast('warning', '请选择要下载的文件')
            return
        }
        let selectMonth = this.metaAction.gf('data.tree.selectedKeys').toJS()
        if (selectMonth.length < 1) {
            this.metaAction.toast('warning', '请选择对应的期间')
            return
        }
        const year = `${selectMonth[0]}`.split('-')[0]
        const period = `${selectMonth[0]}`.split('-')[1] || "0"
        let selectedRowData = this.metaAction.gf('data.other.tableCheckbox.selectedOption').toJS()
        const option = selectedRowData.map(element => { return element.pdfFileId })
        this.injections.reduce('btnDisabled', true)
        await this.webapi.archivemanagement.downLoadPdfBatch({ year: year, period: period, pdfFileIds: option })
        this.injections.reduce('btnDisabled', false)
    }
    /**
     * 下载PDF
     */
    downLoadPdf = async (curData) => {
        if(curData.pdfFileId){
            this.injections.reduce('tableLoading', true)
            await this.webapi.archivemanagement.downLoadPdf({ pdfFileId: curData.pdfFileId })
            this.injections.reduce('tableLoading', false)  
        }else{
            this.metaAction.toast('warning', '文件不存在，请重新归档')
            return
        }
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
            window.removeEventListener('onTabFocus', this.onTabFocus, false)
            window.removeEventListener('enlargeClick', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
            window.detachEvent('onTabFocus', this.onTabFocus)
            window.detachEvent('enlargeClick', () => this.onResize({}))
        } else {
            window.onresize = undefined
        }
    }

    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('archivecontenttable', 'ant-table-thead', 1, 'ant-table-body', 'data.tableOption', e)
            }
        }, 50)
    }

    getTableScroll = (contaienr, head, num, target, path, e) => {
        try {
            
            const tableCon = document.getElementsByClassName(contaienr)[0]
            if (!tableCon) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll(contaienr, head, num, target, path)
                }, 50)
                return
            }
            
            const header = tableCon.getElementsByClassName(head)[0]
            const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
            const pre = this.metaAction.gf(path).toJS()
            const y = tableCon.offsetHeight - header.offsetHeight - num
            const bodyHeight = body.offsetHeight
            if (bodyHeight > y && y != pre.y) {
                // pre.x = header.scrollWidth
                this.metaAction.sf(path, fromJS({ ...pre, y }))
            } else if (bodyHeight < y && pre.y != null) {

                this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            } else {
                return false
            }
        } catch (err) {
        }
    }
    /**
    * 渲染归档文件
    */
    getFileName = (text, curData) => {
        return (
            <div style={{ textAlign: 'left', display: 'flex', lineHeight: '35px' }}>
                {
                    curData.type == "file" ?
                        <Icon fontFamily="edficon"
                            type="wenjianjia"
                            style={{ 'marginTop': '7px', 'marginRight': '6px' }}
                        /> : ''
                }
                {
                    curData.type == "file" ?
                        <a title={curData.fileName}
                            onClick={() => this.modifyDetail(curData)}>
                            {curData.fileName}
                        </a>
                        :
                        <span title={curData.fileName}>{curData.fileName}
                        </span>
                }

            </div>
        )
    }
    /**
     * 重载数据
     */
    reloadData = async (params) => {
        let year, period, selectMonth
        if (!params) {
            selectMonth = this.metaAction.gf('data.tree.selectedKeys').toJS()
            year = `${selectMonth[0]}`.split('-')[0]
            period = `${selectMonth[0]}`.split('-')[1] || 0
        } else {
            year = params.year
            period = params.period
        }
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        const treeState = await this.webapi.archivemanagement.init()
        const response = await this.webapi.archivemanagement.query({ year, period })
        this.injections.reduce('tableLoading', false)
        if (treeState) {
            const finishStates = fromJS(treeState)
            let selectKey = year + '-' + period
            if (finishStates.size > 0 && finishStates.filter(element => element.get('key') == selectKey).size > 0) {
                this.metaAction.sf('data.other.isFileFinish', true)
            }
        }
        if (response) {
            this.injections.reduce('setTableData', response, treeState, period)
        }
        setTimeout(() => {
            this.getTableScroll('archivecontenttable', 'ant-table-thead', 1, 'ant-table-body', 'data.tableOption')
        }, 100)
    }
    /**
     * 预览pdf
     */
    previewPdf = async (curData) => {
        if(curData.pdfFileId){
            let tempWindow = window.open()
            await this.webapi.archivemanagement.generatePDF({ isOpen: true, pdfFileId: curData.pdfFileId, tempWindow: tempWindow })
        }else{
            this.metaAction.toast('warning', '文件不存在，请重新归档')
            return
        }
    }

    /**
     * 渲染操作列
     */
    renderColumns = (text, curData) => {
        return <div style={{ textAlign: 'center', display: 'block' }}>
            {
                <Icon fontFamily="edficon"
                    type="PDFxiazai"
                    title='下载PDF'
                    onClick={() => this.downLoadPdf(curData)}
                    className='operation'
                />
            }
            {
                <Icon fontFamily="edficon"
                    type="xiazaiexcel"
                    title='下载EXCEL'
                    onClick={() => this.downLoadExcel(curData)}
                    className='operation'
                />
            }
            {
                curData.type == "file" ? ''
                    :
                    <Icon fontFamily="edficon"
                        type="chakan"
                        title='预览PDF'
                        onClick={() => this.previewPdf(curData)}
                        className='operation'
                    />
            }
        </div>
    }

    //表格复选框
    getRowSelection = () => {
        return undefined
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
