import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import { fromJS, toJS } from "immutable"
import { DataGrid, Echarts, Popover, Icon, Tooltip, Dropdown, Menu } from "edf-component"
import config from "./config"
import moment from "moment"
import utils, { fetch, path } from "edf-utils"
import RenderTree from "./component/RenderTree"
import isEqual from "lodash.isequal"
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        console.time("testForEach")
        this.component = component
        this.injections = injections
        let option = { calendarYM: moment(new Date()).format("YYYY-MM") }

        injections.reduce("init", option)
        this.geTorgDatasourceType()
        let isExpire = this.component.props.isExpire
        this.metaAction.sf("data.other.isExpire", isExpire)
        this.isScroll = false
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener("onTabFocus", ::this.onTabFocus)
            // addEventListener('onTabFocus', :: this.load);
            addEventListener("onResize", () => {})
        }

        this.loadList("", "init")
        this.loadgetGGxx()
        this.loadgetbsrq()
        this.getjzVal()
        this.getpermission()
        this.btnQX()
    }
    componentDidMount = () => {
        let domain = document.domain
        if (
            domain == "localhost" ||
            domain == "dev-xdz.bj.jchl.com" ||
            domain == "xdz.bj.jchl.com"
        ) {
            console.log("计时结束")
            console.timeEnd("testForEach")
        }
    }
    //当前app的 "tab被点击" (从其他app切换到当前app)
    onTabFocus = () => {
        const isPullUp = fromJS(this.metaAction.gf("data.isPullUp"))
        this.injections.reduce("update", { path: "data.listSearchValue.orgName", value: "" })
        this.injections.reduce("update", { path: "data.isCreatedAccount", value: 0 })
        if (isPullUp) {
            this.loadList("", "init")
        } else {
            this.loadList(1, "init")
        }
        this.loadgetGGxx()
        this.loadgetbsrq()
        this.getpermission()
        this.getjzVal()
    }

    geTorgDatasourceType = async () => {
        appBasicInfo.orgDataSourceType && appBasicInfo.orgDataSourceType == "FZYM"
            ? this.metaAction.sf("data.orgDatasourceType", 1)
            : this.metaAction.sf("data.orgDatasourceType", 0)
    }

    getClass = type => {
        const orgDatasourceType = this.metaAction.gf("data.orgDatasourceType")
        let classname = {}
        if (orgDatasourceType == 0) {
            if (type == 1) {
                classname = {
                    position: "absolute",
                    left: "17.6%",
                    top: "24.2%",
                }
            } else if (type == 2) {
                classname = {
                    position: "absolute",
                    left: "17.6%",
                    top: "44.9%",
                }
            } else if (type == 3) {
                classname = {
                    position: "absolute",
                    left: "49.4%",
                    top: "10.4%",
                }
            } else if (type == 4) {
                classname = {
                    position: "absolute",
                    left: "49.4%",
                    top: "33.3%",
                }
            }
        } else {
            if (type == 1) {
                classname = {
                    position: "absolute",
                    left: "15.2%",
                    top: "23.2%",
                }
            } else if (type == 2) {
                classname = {
                    position: "absolute",
                    left: "15.2%",
                    top: "43.9%",
                }
            } else if (type == 3) {
                classname = {
                    position: "absolute",
                    left: "47%",
                    top: "9.4%",
                }
            } else if (type == 4) {
                classname = {
                    position: "absolute",
                    left: "47%",
                    top: "32.3%",
                }
            }
        }
        return classname
    }

    getpermission = async () => {
        let params = {
            // orgId:6896858486553600,
            // userId:"313272023784706048"
        }

        const res = await this.webapi.desktop.getfpkh(params)
        if (!(JSON.stringify(res.body.bmxx) == "{}")) {
            if (!(res.body.bmxx.length == 0)) {
                this.metaAction.sfs({
                    "data.other.permission.treeData": res.body.bmxx,
                    "data.other.permission.all": res.body.all,
                    "data.maxde": res.body.bmxx[0].bmdm,
                })
            } else {
                this.metaAction.sfs({
                    "data.other.permission.treeData": [],
                    "data.other.permission.all": null,
                    "data.maxde": "",
                    "data.other.permission.self": "分配我的客户",
                })
            }
        } else {
            this.metaAction.sfs({
                "data.other.permission.treeData": [],
                "data.other.permission.all": null,
                "data.maxde": "",
                "data.other.permission.self": "分配我的客户",
            })
        }
    }

    btnQX = async () => {
        let daglMenu = []
        let taxAppName = ""
        let taxAppProps = {}
        daglMenu = JSON.parse(sessionStorage.getItem("dzglMenu"))
        let showData = this.metaAction.gf("data.showData").toJS()
        if (daglMenu) {
            for (let i = 0; i < daglMenu.length; i++) {
                if (daglMenu[i].name == "部门管理" && daglMenu[i].isWrite != 100) {
                    showData.addB = true
                }
                if (daglMenu[i].name == "人员管理" && daglMenu[i].isWrite != 100) {
                    showData.addR = true
                }
                if (daglMenu[i].name == "客户资料" && daglMenu[i].isWrite != 100) {
                    showData.addK = true
                }
                if (daglMenu[i].name == "客户分配" && daglMenu[i].isWrite != 100) {
                    showData.assignK = true
                }
                if (daglMenu[i].name == "账套管理" && daglMenu[i].isWrite != 100) {
                    showData.newZ = true
                    showData.importZ = true
                }
                if (daglMenu[i].name == "发票采集" && daglMenu[i].isWrite != 100) {
                    showData.invZ = true
                }
                if (daglMenu[i].name == "税务申报" && daglMenu[i].isWrite != 100) {
                    showData.taxZ = true
                    taxAppName = daglMenu[i].appName
                    taxAppProps = JSON.parse(daglMenu[i].appProps)
                }
            }
        }
        this.injections.reduce("update", { path: "data.showData", value: showData })
        this.injections.reduce("update", { path: "data.taxAppName", value: taxAppName })
        this.injections.reduce("update", { path: "data.taxAppProps", value: taxAppProps })
    }

    renderTree = () => {
        let permission = this.metaAction.gf("data.other.permission").toJS()
        let showbm = this.metaAction.gf("data.showbm")
        this.metaAction.sf("data.ifgs", permission.all ? "公司的客户" : "部门的客户")

        return (
            <RenderTree
                treeData={permission.treeData || []}
                title={permission.all ? "公司的客户" : "部门的客户"}
                self={showbm}
                onConfirm={this.handleConfirm}
                onReset={this.handleReset}
                setmda={this.setmda}
            />
        )
    }
    setmda = (path, val) => {
        this.metaAction.sf(path, val)
    }
    handleConfirm = e => {
        //确定
        this.metaAction.sf("data.checkedKeys.checked", e)
        let checked = this.metaAction.gf("data.checkedKeys.checked")
        let ifgs = this.metaAction.gf("data.ifgs")
        this.screenLoadList()
        this.getjzVal()
    }
    handleDropDownClick = () => {
        let visible = this.state.visible
        this.setState({
            visible: !visible,
        })
    }

    loadTaxCalendar = async () => {
        let taxCalendar = await this.webapi.desktop.getTaxCalendar({
            year: 2019,
        })
        if (taxCalendar) {
            this.injections.reduce("initTaxCalendar", taxCalendar)
        }
    }

    getUserSearchVisible = () => {
        let currentUser = this.getCurrentUser(),
            _visible = true

        if (currentUser && currentUser.isRoleAdmin == true) {
            _visible = true
        } else {
            _visible = false
        }

        return _visible
    }

    getCurrentUser = () => this.metaAction.context.get("currentUser") || {}

    loadEchartsData = async () => {
        const { userId, date } = this.metaAction.gf("data.searchValue").toJS()
        let params = {
            date: moment(date).format("YYYY-MM-DD"),
        }

        if (userId != -1) {
            params.personId = userId
        }

        // const res = await this.webapi.desktop.getEchart(params)
        this.injections.reduce("initEchartList", res)
    }

    screenLoadList = async status => {
        this.metaAction.sf("data.loading", true)
        const page1 = this.metaAction.gf("data.page").toJS().currentPage
        const size1 = this.metaAction.gf("data.page").toJS().pageSize
        // const orgName = this.metaAction.gf('data.listSearchValue').toJS().orgName

        let isCreatedAccount = this.metaAction.gf("data.isCreatedAccount"),
            selectedYearMonth = this.getSelectedYearMonth(),
            orgName = this.metaAction.gf("data.listSearchValue.orgName"),
            userId = this.metaAction.gf("data.searchValue.userId"),
            type = this.metaAction.gf("data.checkedKeys.checked"),
            maxde = this.metaAction.gf("data.maxde"),
            types = "self",
            all = this.metaAction.gf("data.other.permission.all")

        if (type.length != 0 && type.length) {
            types = "dept"
        }
        for (let i = 0; i < type.length; i++) {
            if (type[i] == maxde && all == "all") {
                types = "all"
            }
        }
        let params = {}
        params = {
            entity: {
                departments: type,
                type: types, //"all"
                seachtext: orgName,
                vatTaxpayer: isCreatedAccount,
            },
            page: {
                currentPage: page1,
                pageSize: size1,
            },
        }

        if (userId != -1) {
            params.entity.personId = userId
        }
        let res = await this.webapi.desktop.getHomepageUserData(params)
        let { list, page } = res
        this.injections.reduce("loadList", list, page)
        this.metaAction.sf("data.loading", false)
        let orgidList = []
        list.map(item => {
            let orgidObiect = { orgId: item.orgId }
            orgidList.push(orgidObiect)
        })

        let resJzxx = await this.webapi.desktop.getOrgListOnlyJzxx(orgidList)
        list.map(item => {
            let object = resJzxx.list.find(i => item.orgId == i.orgId)
            item.jz = object.jz
            item.zq = object.zq
        })
        this.injections.reduce("loadList", list, page)
        let stateList = []
        list.map(item => {
            let stateParams = {
                orgId: item.orgId,
                areaType: item.areaType,
                djxh: item.djxh,
                swjgdm: item.swjgdm,
                Infostatic: item.Infostatic,
            }
            stateList.push(stateParams)
        })

        let resStatus = await this.webapi.desktop.getOrgListOnlyState(stateList)
        if (!Array.isArray(resStatus)) {
            resStatus = []
        }
        if (resStatus.length > 0) {
            list.map(item => {
                let object = resStatus.find(i => item.orgId == i.orgId)
                if (object) {
                    item.gsShztDm = object.gsShztDm
                    item.sbztDm = object.sbztDm
                    item.gsJkztDm = object.gsJkztDm
                    item.jkztDm = object.jkztDm
                }
            })
            this.injections.reduce("loadList", list, page)
        }

        let dataGridHeight
        if (status == 1) {
            dataGridHeight = document.getElementById("app").clientHeight - 54 - 161
        } else {
            dataGridHeight = document.getElementById("app").clientHeight - 30 - 54 - 161 - 130
        }
        if (status == "sear") {
            this.metaAction.sf("data.isVisibleGuid", false)
            this.metaAction.sf("data.isVisibleList", true)
            this.getjzVal()
        } else if (status == "btn") {
            this.metaAction.sf("data.isVisibleGuid", false)
            this.metaAction.sf("data.isVisibleList", true)
        }
        this.metaAction.sfs({
            "data.other.refershDatagrid": Math.random(),
            "data.other.dataGridHeight": dataGridHeight,
            "data.other.dataTableHeight": dataGridHeight - 76,
        })
    }
    loadList = async (status, isinit) => {
        let dataGridHeight
        let isVisibleList = this.metaAction.gf("data.isVisibleList")
        if (status == 1) {
            dataGridHeight = document.getElementById("app").clientHeight - 54 - 161
        } else {
            dataGridHeight = document.getElementById("app").clientHeight - 30 - 54 - 161 - 130
        }

        this.metaAction.sfs({
            "data.other.refershDatagrid": Math.random(),
            "data.other.dataGridHeight": dataGridHeight,
            "data.other.dataTableHeight": dataGridHeight - 76,
        })
        if (isVisibleList) {
            this.metaAction.sf("data.loading", true)
        }

        const page1 = this.metaAction.gf("data.page").toJS().currentPage
        const size1 = this.metaAction.gf("data.page").toJS().pageSize

        let isCreatedAccount = this.metaAction.gf("data.isCreatedAccount"),
            selectedYearMonth = this.getSelectedYearMonth(),
            orgName = this.metaAction.gf("data.listSearchValue.orgName"),
            userId = this.metaAction.gf("data.searchValue.userId"),
            type = this.metaAction.gf("data.checkedKeys.checked"),
            maxde = this.metaAction.gf("data.maxde"),
            types = "self",
            all = this.metaAction.gf("data.other.permission.all")

        if (type.length != 0 && type.length) {
            types = "dept"
        }
        for (let i = 0; i < type.length; i++) {
            if (type[i] == maxde && all == "all") {
                types = "all"
            }
        }
        let params = {}
        params = {
            entity: {
                departments: type,
                type: types, //"all"
                seachtext: orgName,
                vatTaxpayer: isCreatedAccount,
            },
            page: {
                currentPage: page1,
                pageSize: size1,
            },
        }

        if (userId != -1) {
            params.entity.personId = userId
        }
        if (isinit == "init") {
            await this.getShowSign(params)
        }
        let showSign = this.metaAction.gf("data.showSign")
        if (showSign) {
            this.metaAction.sf("data.isVisibleGuid", false)
            this.metaAction.sf("data.isVisibleList", true)
            this.metaAction.sf("data.loading", true)

            let res = await this.webapi.desktop.getHomepageUserData(params)
            let { list, page } = res
            this.injections.reduce("loadList", list, page)
            this.metaAction.sf("data.loading", false)
            let orgidList = []
            list.map(item => {
                let orgidObiect = { orgId: item.orgId }
                orgidList.push(orgidObiect)
            })

            let resJzxx = await this.webapi.desktop.getOrgListOnlyJzxx(orgidList)
            list.map(item => {
                let object = resJzxx.list.find(i => item.orgId == i.orgId)
                item.jz = object.jz
                item.zq = object.zq
            })
            this.injections.reduce("loadList", list, page)
            let stateList = []
            list.map(item => {
                let stateParams = {
                    orgId: item.orgId,
                    areaType: item.areaType,
                    djxh: item.djxh,
                    swjgdm: item.swjgdm,
                    Infostatic: item.Infostatic,
                }
                stateList.push(stateParams)
            })

            let resStatus = await this.webapi.desktop.getOrgListOnlyState(stateList)
            if (!Array.isArray(resStatus)) {
                resStatus = []
            }
            if (resStatus.length > 0) {
                list.map(item => {
                    let object = resStatus.find(i => item.orgId == i.orgId)
                    if (object) {
                        item.gsShztDm = object.gsShztDm
                        item.sbztDm = object.sbztDm
                        item.gsJkztDm = object.gsJkztDm
                        item.jkztDm = object.jkztDm
                    }
                })
                this.injections.reduce("loadList", list, page)
            }
        } else {
            this.metaAction.sf("data.isVisibleGuid", true)
            this.metaAction.sf("data.isVisibleList", false)
        }
        // let res = await this.webapi.desktop.getList(params)
        if (status == "sear") {
            this.metaAction.sf("data.isVisibleGuid", false)
            this.metaAction.sf("data.isVisibleList", true)
            this.getjzVal()
        } else if (status == "btn") {
            this.metaAction.sf("data.isVisibleGuid", false)
            this.metaAction.sf("data.isVisibleList", true)
            this.getjzVal()
        }
        this.metaAction.sf("data.loading", false)
        this.injections.reduce("update", { path: "data.showSign", value: true })
    }

    getShowSign = async params => {
        let resSign = await this.webapi.desktop.judgeHomepageNum(params)
        if (resSign.existCustomer && resSign.existCustomer == "Y") {
            this.injections.reduce("update", { path: "data.showSign", value: true })
        } else {
            this.injections.reduce("update", { path: "data.showSign", value: false })
        }
    }

    resetval = () => {
        this.metaAction.sf("data.listSearchValue.orgName", "")
        this.metaAction.sf("data.isCreatedAccount", 0)
    }
    //切换代理机构刷新列表
    componentWillReceiveProps = async nextProps => {
        let _notRender = this.component.props._notRender
        if (!isEqual(nextProps.isRefresh, this.component.props.isRefresh) && !_notRender) {
            let pagination = {
                currentPage: 1,
                pageSize: 50,
                totalCount: 0,
                totalPage: 0,
            }
            const isPullUp = fromJS(this.metaAction.gf("data.isPullUp"))
            this.metaAction.sfs({
                "data.listSearchValue.orgName": "",
                "data.isCreatedAccount": 0,
                "data.list": fromJS([]),
                "data.pagination": fromJS(pagination),
                "data.checkedKeys.checked": [],
                "data.other.permission.all": null,
            })
            if (isPullUp) {
                this.loadList("", "init")
            } else {
                this.loadList(1, "init")
            }
            this.loadgetGGxx()
            this.loadgetbsrq()
            this.getpermission()
            this.getjzVal()
        }
    }
    loadPersonList = async () => {
        let option = {
            page: {
                currentPage: 1,
                pageSize: 200,
            },
        }

        let response = await this.webapi.desktop.getPersonList(option)

        this.injections.reduce("loadPersonList", response.list)
    }
    loadgetGGxx = async () => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        let option = {
            areaCode: currentOrg.areaCode,
        }
        //messagetype : 1
        let response = await this.webapi.desktop.getGGxx(option)

        this.metaAction.sf("data.gglistdata", fromJS(response))
    }
    loadgetbsrq = async () => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        let option = {
            year: moment().year(),
            areaCode: currentOrg.areaCode,
        }

        let response = await this.webapi.desktop.getbsrq(option)
        this.metaAction.sfs({
            "data.monthdate": moment().month() + 1,
            "data.rdate": fromJS(response[moment().month()].endDay),
        })
    }

    setKhflVal = e => {
        this.metaAction.sf("data.isCreatedAccount", e)
        // this.loadList();
    }

    searchChange = value => {
        this.injections.reduce("searchChange", value)
    }

    getSelectedYearMonth = () => {
        let selectedYearMonth = moment(this.metaAction.gf("data.searchValue.date")),
            year = selectedYearMonth.year(),
            period = selectedYearMonth.month() + 1

        return { year, period }
    }

    toEnterpriseTerminal = async (dzCustomerOrgId, dzCustomerName) => {
        // console.log(this.component.props.setGlobalContent){

        // this.component.props.setGlobalContent(dzCustomerName, 'edfx-app-portal', {}, dzCustomerOrgId,null)
        this.component.props.setGlobalContent({
            name: dzCustomerName,
            appName: "edfx-app-portal",
            params: {},
            orgId: dzCustomerOrgId,
            // showHeader:true
        })
    }

    getCurrentOrg = () => this.metaAction.context.get("currentOrg") || {}

    getParam = () => {
        let url,
            params = {}

        url = path.getTargetUrl(2)

        let options = {
            headers: {
                token: this.getToken(),
            },
        }

        params.url = url
        params.options = options

        return params
    }

    getToken = () => {
        return sessionStorage["_accessToken"]
    }

    pageChanged = (current, pageSize) => {
        this.metaAction.sfs({
            "data.page.currentPage": current || this.metaAction.gf("data.page.currentPage"),
            "data.page.pageSize": pageSize || this.metaAction.gf("data.page.pageSize"),
        })
        this.loadList()
    }

    searchValueChange = (value, path) => {
        this.metaAction.sf(path, value)
        // this.loadEchartsData()
        this.loadList()
    }

    listFormChange = (value, path) => {
        this.metaAction.sf(path, value)

        let wayId = this.metaAction.gf("data.listSearchValue.wayId")

        if (wayId == 1) {
            this.loadList()
        } else {
            let status = {},
                statusId = this.metaAction.gf("data.listSearchValue.statusId")

            if (statusId != -1) {
                // 财务进度
                if (wayId == 2) {
                    status = {
                        accountHandleStatusId: statusId,
                    }
                    // 报税进度
                } else if (wayId == 3) {
                    status = {
                        taxHandleStatusId: statusId,
                    }
                }
            }

            this.loadList(status)
        }
    }

    statusChange = (value, path) => {
        this.metaAction.sf(path, value)

        let status = {},
            wayId = this.metaAction.gf("data.listSearchValue.wayId"),
            statusId = this.metaAction.gf("data.listSearchValue.statusId")

        if (value != -1) {
            // 财务进度
            if (wayId == 2) {
                if (statusId != -1) {
                    status = {
                        accountHandleStatusId: statusId,
                    }
                }
                // 报税进度
            } else if (wayId == 3) {
                if (statusId != -1) {
                    status = {
                        taxHandleStatusId: statusId,
                    }
                }
            }
        }

        this.loadList(status)
    }

    renderEchart = () => {
        let echartData = this.metaAction.gf("data.chartData").toJS()

        if (!(echartData instanceof Array)) {
            return
        }

        const arr = [
            {
                key: "biz",
                name: "理票",
            },
            {
                key: "finance",
                name: "记账",
            },
            {
                key: "tax",
                name: "报税",
            },
        ]
        const dom = arr.map(item => {
            let echart = echartData.find(key => {
                return key.type == item.key
            })

            return (
                <div className="ttk-es-app-yyhome-top-chart-chartmain-con-item">
                    {this.echartOption(echart, item.key, item.name)}
                </div>
            )
        })

        // let dom = []
        //
        // dom.push(
        //     <div className="ttk-es-app-yyhome-top-chart-chartmain-con-item">
        //         {this.echartOptionTest()}
        //     </div>
        // )
        // const dom = arr.map(item => {
        //     let echart = echartData.find((key) => {
        //         return key.type == item.key
        //     })
        //     console.log(echart)
        //     return (
        //         <div className="ttk-es-app-yyhome-top-chart-chartmain-con-item">
        //             {this.echartOptionTest()}
        //         </div>
        //     )
        // })

        return <div className="ttk-es-app-yyhome-top-chart-chartmain-con">{dom}</div>
    }

    handlePopoverVisibleChange = visible => {
        if (visible) {
            const { filterForm } = this.metaAction.gf("data").toJS()
            this.metaAction.sf("data.formContent", fromJS(filterForm))
        }
        this.metaAction.sf("data.showPopoverCard", visible)
    }

    setEchart123 = () => {
        let data = this.metaAction.gf("data.bsxx").toJS()
        let bfb = 0
        if (data.yjz.total != 0) {
            bfb = (
                (Number(data.yjz.total) / (Number(data.wjz.total) + Number(data.yjz.total))) *
                100
            ).toFixed(2)
        }
        const option = {
            color: ["#39ec89", "#3291d8", "#fea772"], //已完成，未开始，进行中
            tooltip: {
                trigger: "item",
                formatter: "{b} : {c} ({d}%)",
            },
            title: {
                text: bfb + "%", // ,
                left: "center",
                top: "25%",
                padding: [24, 0],
                textStyle: {
                    color: "#11C2C1",
                    fontSize: 16,
                    align: "center",
                    fontWeight: "normal",
                    color: "#666",
                },
            },
            legend: {
                x: "center",
                y: "center",
                data: ["直接访问"],
            },
            series: [
                {
                    name: "",
                    type: "pie",
                    radius: ["60%", "80%"],
                    itemStyle: {
                        normal: {
                            label: {
                                show: false,
                            },
                            labelLine: {
                                show: false,
                            },
                        },
                        emphasis: {
                            label: {
                                show: false,
                                position: "center",
                                textStyle: {
                                    fontSize: "14",
                                    fontWeight: "bold",
                                },
                            },
                        },
                    },
                    data: [
                        { value: data.yjz.total, name: "已缴款", itemStyle: { color: "#0066b3" } }, //data.finishCount
                        { value: data.wjz.total, name: "未缴款", itemStyle: { color: "#f07812" } }, //data.processingCount
                        { value: data.wrw.total, name: "无任务", itemStyle: { color: "#dfdfdf" } }, //data.noneCount
                    ],
                },
            ],
        }

        return <Echarts option={option} />
    }

    setEchartbs = () => {
        let data = this.metaAction.gf("data.jsxx").toJS()
        let bfb = 0
        if (data.yjz.total != 0) {
            bfb = (
                (Number(data.yjz.total) / (Number(data.wjz.total) + Number(data.yjz.total))) *
                100
            ).toFixed(2)
        }
        const option = {
            color: ["#39ec89", "#3291d8", "#fea772"], //已完成，未开始，进行中
            tooltip: {
                trigger: "item",
                formatter: "{b} : {c} ({d}%)",
            },
            title: {
                text: bfb + "%", // ,
                left: "center",
                top: "25%",
                padding: [24, 0],
                textStyle: {
                    color: "#11C2C1",
                    fontSize: 16,
                    align: "center",
                    fontWeight: "normal",
                    color: "#666",
                },
            },
            legend: {
                x: "center",
                y: "center",
                data: ["直接访问"],
            },
            series: [
                {
                    name: "",
                    type: "pie",
                    radius: ["60%", "80%"],
                    itemStyle: {
                        normal: {
                            label: {
                                show: false,
                            },
                            labelLine: {
                                show: false,
                            },
                        },
                        emphasis: {
                            label: {
                                show: false,
                                position: "center",
                                textStyle: {
                                    fontSize: "14",
                                    fontWeight: "bold",
                                },
                            },
                        },
                    },
                    data: [
                        { value: data.yjz.total, name: "已申报", itemStyle: { color: "#0066b3" } }, //data.finishCount
                        { value: data.wjz.total, name: "未申报", itemStyle: { color: "#f07812" } }, //data.processingCount
                        { value: data.wrw.total, name: "无任务", itemStyle: { color: "#dfdfdf" } }, //data.noneCount
                    ],
                },
            ],
        }

        return <Echarts option={option} />
    }

    getjzVal = async () => {
        let type = this.metaAction.gf("data.checkedKeys.checked"),
            isCreatedAccount = this.metaAction.gf("data.isCreatedAccount"),
            maxde = this.metaAction.gf("data.maxde"),
            orgName = this.metaAction.gf("data.listSearchValue.orgName"),
            types = "self",
            all = this.metaAction.gf("data.other.permission.all")
        if (type.length != 0 && type.length) {
            types = "dept"
        }
        // debugger
        for (let i = 0; i < type.length; i++) {
            if (type[i] == maxde && all == "all") {
                types = "all"
            }
        }
        let dd = {
            departments: type,
            type: types, //"all"
            seachtext: orgName,
            vatTaxpayer: isCreatedAccount,
        }
        // let data = await this.webapi.desktop.getjzxx(dd)
        let data = await this.webapi.desktop.queryTjkhOrgHome(dd)
        let sysOrgDtoList = []
        data.map(item => {
            let dataItem = {
                orgId: item.orgId || "",
                djxh: item.djxh || "",
                areaType: item.areaType || "",
                swjgdm: item.swjgdm || "",
                Infostatic: item.Infostatic || "",
            }
            sysOrgDtoList.push(dataItem)
        })
        let params1 = {
            sysOrgDtoList: sysOrgDtoList,
            from: "sbjd",
        }
        let params2 = {
            sysOrgDtoList: sysOrgDtoList,
            from: "jzjd",
        }
        let data1 = await this.webapi.desktop.getJzjdOrSbjdTj(params1)
        let data2 = await this.webapi.desktop.getJzjdOrSbjdTj(params2)
        if (data1) {
            this.metaAction.sfs({
                //jk
                "data.bsxx.yjz.total": this.formatNumber(data1.sizeByJkNoAlready),
                "data.bsxx.wjz.total": this.formatNumber(data1.sizeByJkNoFinish),
                "data.bsxx.wrw.total": this.formatNumber(data1.sizeByjKNoStart),
            })
            this.metaAction.sfs({
                //sb
                "data.jsxx.yjz.total": this.formatNumber(data1.sizeBySbAlready),
                "data.jsxx.wjz.total": this.formatNumber(data1.sizeBySbNoFinish),
                "data.jsxx.wrw.total": this.formatNumber(data1.sizeByjKNoStart),
            })
        }
        if (data2) {
            this.metaAction.sfs({
                //kz
                "data.jzxx.yjz.total": this.formatNumber(data2.b),
                "data.jzxx.wjz.total": this.formatNumber(data2.a),
                "data.jzxx.wrw.total": this.formatNumber(data2.c),
            })
        }
    }
    formatNumber = v => {
        return typeof v === "number" ? v : 0
    }
    setEchartjz = () => {
        let data = this.metaAction.gf("data.jzxx").toJS()
        // console.log(data,'data')
        let bfb = 0
        if (data.yjz.total != 0) {
            bfb = (
                (Number(data.yjz.total) / (Number(data.wjz.total) + Number(data.yjz.total))) *
                100
            ).toFixed(2)
        }

        const option = {
            color: ["#39ec89", "#3291d8", "#fea772"], //已完成，未开始，进行中
            tooltip: {
                trigger: "item",
                formatter: "{b} : {c} ({d}%)",
            },
            title: {
                text: bfb + "%", // ,
                left: "center",
                top: "25%",
                padding: [24, 0],
                textStyle: {
                    color: "#11C2C1",
                    fontSize: 16,
                    align: "center",
                    fontWeight: "normal",
                    color: "#666",
                },
            },
            legend: {
                x: "center",
                y: "center",
                data: ["直接访问"],
            },
            series: [
                {
                    name: "",
                    type: "pie",
                    radius: ["60%", "80%"],
                    itemStyle: {
                        normal: {
                            label: {
                                show: false,
                            },
                            labelLine: {
                                show: false,
                            },
                        },
                        emphasis: {
                            label: {
                                show: false,
                                position: "center",
                                textStyle: {
                                    fontSize: "14",
                                    fontWeight: "bold",
                                },
                            },
                        },
                    },
                    data: [
                        { value: data.yjz.total, name: "已记账", itemStyle: { color: "#0066b3" } }, //data.finishCount
                        { value: data.wjz.total, name: "未记账", itemStyle: { color: "#f07812" } }, //data.processingCount
                        { value: data.wrw.total, name: "无任务", itemStyle: { color: "#dfdfdf" } }, //data.noneCount
                    ],
                },
            ],
        }

        return <Echarts option={option} />
    }

    renderEchart1 = (data, key, name) => {
        if (!document.getElementById(key)) return
        // console.log(echarts, 'echarts')
        if (!echarts) return

        var myChart = echarts.init(document.getElementById(key))
        //init初始化接口，返回ECharts实例，其中dom为图表所在节点

        var _zr = myChart.getZr()

        let option = {
            color: ["#39ec89", "#3291d8", "#fea772"], //已完成，未开始，进行中
            tooltip: {
                trigger: "item",
                formatter: "{b} : {c} ({d}%)",
            },
            title: {
                text: 0, // + '%',
                left: "center",
                top: "25%",
                padding: [24, 0],
                textStyle: {
                    color: "#11C2C1",
                    fontSize: 16,
                    align: "center",
                    fontWeight: "normal",
                    color: "#666",
                },
            },
            legend: {
                x: "center",
                y: "center",
                data: ["直接访问"],
            },
            series: [
                {
                    name: "",
                    type: "pie",
                    radius: ["60%", "80%"],
                    itemStyle: {
                        normal: {
                            label: {
                                show: false,
                            },
                            labelLine: {
                                show: false,
                            },
                        },
                        emphasis: {
                            label: {
                                show: false,
                                position: "center",
                                textStyle: {
                                    fontSize: "14",
                                    fontWeight: "bold",
                                },
                            },
                        },
                    },
                    data: [
                        { value: 0, name: "已完成", itemStyle: { color: "#1EC6F3" } }, //data.finishCount
                        { value: 0, name: "进行中", itemStyle: { color: "#FEA772" } }, //data.processingCount
                        { value: 0, name: "未开始", itemStyle: { color: "#D0D0D0" } }, //data.noneCount
                    ],
                },
            ],
        }

        myChart.setOption(option) // 为echarts对象加载数据
    }

    ggDetail = async id => {
        let option = [{ messageId: id }]
        let response = await this.webapi.desktop.getGGrd(option)
        this.loadgetGGxx()
        const ret = await this.metaAction.modal("show", {
            title: "公告详情",
            width: 800,
            footer: null,
            children: this.metaAction.loadApp("ttk-es-app-noticexx", {
                store: this.component.props.store,
                id: id,
            }),
        })
    }
    ggList = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "公告列表",
            width: 950,
            footer: null,
            children: this.metaAction.loadApp("ttk-es-app-noticelist", {
                store: this.component.props.store,
            }),
        })
    }
    checkJs = async () => {
        this.metaAction.sfs({
            "data.jsBtn": "ttk-es-app-yyhome-top-chart-chartdes-btn active",
            "data.bsBtn": "ttk-es-app-yyhome-top-chart-chartdes-btn",
            "data.jzBtn": "ttk-es-app-yyhome-top-chart-chartdes-btn",
            "data.isbs": true,
            "data.isjs": false,
            "data.isjz": false,
        })
        this.setEchartjz()
    }
    checkBs = async () => {
        this.metaAction.sfs({
            "data.jzBtn": "ttk-es-app-yyhome-top-chart-chartdes-btn",
            "data.jsBtn": "ttk-es-app-yyhome-top-chart-chartdes-btn",
            "data.bsBtn": "ttk-es-app-yyhome-top-chart-chartdes-btn active",
            "data.isbs": false,
            "data.isjs": true,
            "data.isjz": false,
        })
        this.setEchartjz()
    }
    checkJz = async () => {
        this.metaAction.sfs({
            "data.jsBtn": "ttk-es-app-yyhome-top-chart-chartdes-btn",
            "data.bsBtn": "ttk-es-app-yyhome-top-chart-chartdes-btn",
            "data.jzBtn": "ttk-es-app-yyhome-top-chart-chartdes-btn active",
            "data.isjz": true,
            "data.isbs": false,
            "data.isjs": false,
        })

        this.setEchartjz()
    }

    changeBodyTab = () => {
        let isVisible = this.metaAction.gf("data.isVisible")
        if (isVisible) {
            return false
        } else {
            this.metaAction.sf("data.isVisible", !isVisible)
        }
    }

    handelMouseOver = (e, name, index) => {
        if (name == "未建账") {
            // debugger
            // console.log(1111,e)
            let rowIndex = +index
            this.metaAction.sf([`data.jzy.${rowIndex}.isShow`], true)
            // this.injections.reduce('showChange',index,true)
            // debugger
            let isShow1 = this.metaAction.gf("data.jzy")
            // console.log('ffff',isShow1)
        } else {
            // console.log(222)
        }
    }
    handelMouseOut = (e, name, index) => {
        if (name == "未建账") {
            // console.log(333)
            let rowIndex = +index
            this.metaAction.sf([`data.jzy.${rowIndex}.isShow`], false)
            // this.injections.reduce('showChange',index,false)
        } else {
            // console.log(444)
        }
    }
    //创建账套
    createZt = (obj, type) => e => {
        console.log("num：" + obj)
        console.log("num1：" + obj.num)
        if (obj.num == "0") {
            if (type == 1) {
                this.createZttInfo(obj.orgId)
            } else if (type == 2) {
                return false
            }
        } else {
            return false
        }
    }

    close = ret => {
        this.closeTip()
    }

    createZttInfo = async id => {
        const ret = await this.metaAction.modal("show", {
            title: "创建账套",
            width: 450,
            // className: 'ttk-es-app-ztmanage-cjzt',
            height: 540,
            footer: null,
            closeModal: this.close,
            closeBack: back => {
                this.closeTip = back
            },
            children: this.metaAction.loadApp("ttk-es-app-ztmanage-add", {
                store: this.component.props.store,
                id: id,
                sourceType: "0", //0创建账套 1账套信息
                page: "home",
            }),
        })

        //创建账套成功后刷新页面
        if (ret) {
            this.loadList()
        }
    }

    openPage = (appName, pageName, num) => {
        //引导页面打开tab页
        let appname = ""
        let name = pageName
        let org = this.metaAction.context.get("currentOrg")
        const taxAppName = this.metaAction.gf("data.taxAppName")
        const taxAppProps = this.metaAction.gf("data.taxAppProps").toJS()
        let number = num
        switch (appName) {
            case "manage":
                appname = "ttk-es-app-glmanage"
                break
            case "customer":
                appname = "ttk-es-app-customer"
                break
            case "assign":
                appname = "ttk-es-app-customer-assign"
                break
            case "newzt":
                appname = "ttk-es-app-ztmanage"
                break
            case "inv":
                appname = "inv-app-custom-list"
                break
            case "tax":
                appname = taxAppName
                break
            default:
                appname = "ttk-es-app-glmanage"
        }
        if (number == 999) {
            this.component.props.setGlobalContent({
                name: name,
                appName: appname,
                params: taxAppProps,
                orgId: org.id,
                token: sessionStorage.getItem("_accessToken"),
                // showHeader:true
            })
        } else {
            this.component.props.setGlobalContent({
                name: name,
                appName: appname,
                params: { yy: number },
                orgId: org.id,
                token: sessionStorage.getItem("_accessToken"),
                // showHeader:true
            })
        }
    }

    //筛选查询
    cxbtn = visible => {
        this.loadList(visible)
        this.metaAction.sf("data.showPopoverCard", false)
    }

    pullUp = data => {
        const isPullUp = fromJS(this.metaAction.gf("data.isPullUp"))
        if (isPullUp) {
            this.metaAction.sfs({
                "data.isPullUp": false,
            })
            this.loadList(1)
        } else {
            this.metaAction.sfs({
                "data.isPullUp": true,
            })
            this.loadList()
        }
    }

    echartOption = (data, key, name) => {
        const finishCount = data.finishCount
        const processingCount = data.processingCount
        const noneCount = data.noneCount
        const totalCount = data.totalCount

        const option = {
            title: {
                text: name,
                left: "center",
                top: 20,
                textStyle: {
                    color: "#666666",
                    fontSize: "13px",
                    fontWeight: "bold",
                },
            },
            series: [
                {
                    name: "访问来源",
                    type: "pie",
                    radius: ["25%", "45%"],
                    minAngle: 10,
                    label: {
                        formatter: "{b}: {@2012}",
                    },
                    data: [
                        { value: finishCount, name: "已完成", itemStyle: { color: "#1EC6F3" } },
                        { value: processingCount, name: "进行中", itemStyle: { color: "#FEA772" } },
                        { value: noneCount, name: "未开始", itemStyle: { color: "#ccc" } },
                    ],
                },
            ],
        }

        return <Echarts option={option} className="rcchart" />
    }

    getListRowsCount = () => {
        return this.metaAction.gf("data.list").size
    }
    entertozb = rowIndex => () => {
        alert(rowIndex)
    }
    renderPopover = () => {
        return (
            <div className="popover">
                <span>
                    <Icon
                        fontFamily="edficon"
                        type="XDZzhuangtai-yiwancheng"
                        className="yiwancheng"
                    />
                    已完成
                </span>
                <span>
                    <Icon fontFamily="edficon" type="XDZzhuangtai-wurenwu" className="weishenbao" />
                    未完成
                </span>
                <span>
                    <Icon fontFamily="edficon" type="XDZzhuangtai-weishenbao" className="wurenwu" />
                    无任务
                </span>
            </div>
        )
    }
    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        let newArr = []
        arr.forEach(item => {
            if (item) {
                newArr.push(item)
            }
        })
        let newItemArr = []
        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        this.injections.reduce("update", {
            path: "data.tableCheckbox",
            value: {
                checkboxValue: newArr,
                selectedOption: newItemArr,
            },
        })
        //this.selectedOption = newItemArr
    }

    renderOperate = ps => {
        let { Column, Cell } = DataGrid,
            enabledStyle = { "margin-right": "8px" }

        return (
            <Cell name="operate">
                <a onClick={this.entertozb(ps.rowIndex)} style={enabledStyle}>
                    进入账簿
                </a>
            </Cell>
        )
    }

    CalendarTime = time => {
        let calendarYM = this.metaAction.gf("data.other.calendarYM")
                ? this.metaAction.gf("data.other.calendarYM")
                : moment(new Date()).format("YYYY-MM"),
            panelYear = parseInt(calendarYM.split("-")[0]),
            panelMonth = parseInt(calendarYM.split("-")[1])

        let taxCalendar = this.metaAction.gf("data.taxCalendar")

        if (taxCalendar.size > 0 && moment().year() == time.year()) {
            if (
                moment().year() == time.year() &&
                moment().month() == time.month() &&
                moment().date() == time.date()
            ) {
                return (
                    <div
                        style={{
                            color: "#029FE8",
                            borderColor: "#029FE8",
                            backgroundColor: "rgba(2,159,232,0.2)",
                            textAlign: "center",
                            verticalAlign: "middle",
                            width: "23px",
                            height: "23px",
                            marginLeft: "5px",
                        }}>
                        {time.date()}
                    </div>
                )
            } else if (
                time.date() >= taxCalendar.get(parseInt(panelMonth - 1)).get("startDay") &&
                time.date() <= taxCalendar.get(parseInt(panelMonth - 1)).get("endDay") &&
                time.year() == panelYear &&
                time.month() + 1 == panelMonth
            ) {
                return (
                    <div
                        style={{
                            backgroundColor: "#FFE48D",
                            textAlign: "center",
                            verticalAlign: "middle",
                            borderRadius: "50%",
                            width: "23px",
                            height: "23px",
                            marginLeft: "5px",
                        }}>
                        {time.date()}
                    </div>
                )
            } else if (time.year() == panelYear && time.month() + 1 == panelMonth) {
                return (
                    <div
                        style={{
                            textAlign: "center",
                            width: "23px",
                            height: "23px",
                            marginLeft: "5px",
                        }}>
                        {time.date()}
                    </div>
                )
            } else {
                return (
                    <div
                        style={{
                            textAlign: "center",
                            width: "23px",
                            height: "23px",
                            color: "#E9E9E9",
                            marginLeft: "5px",
                        }}>
                        {time.date()}
                    </div>
                )
            }
        } else {
            if (time.year() == panelYear && time.month() + 1 == panelMonth) {
                return (
                    <div
                        style={{
                            textAlign: "center",
                            width: "23px",
                            height: "23px",
                            marginLeft: "5px",
                        }}>
                        {time.date()}
                    </div>
                )
            } else {
                return (
                    <div
                        style={{
                            textAlign: "center",
                            width: "23px",
                            height: "23px",
                            color: "#E9E9E9",
                            marginLeft: "5px",
                        }}>
                        {time.date()}
                    </div>
                )
            }
        }
        /*

        else if (time.year() == panelYear && time.month() + 1 == panelMonth) {
            return <div style={{ textAlign: 'center', width: '23px', height: '23px', marginLeft: '5px' }}>{time.date()}</div>
        } else {
            return <div style={{ textAlign: 'center', width: '23px', height: '23px', color: '#E9E9E9', marginLeft: '5px' }}>{time.date()}</div>
        }
        */
    }

    onPanelChange = (value, mode) => {
        value = value.format("YYYY-MM")
        this.injections.reduce("onPanelChange", value)
    }
    // 0 未完成
    // 1 已完成
    // 2 无任务
    getIconType = status => {
        if (status == 2) {
            return "XDZzhuangtai-weishenbao" //无任务，大爷的图标他们弄反了，需要注意
        } else if (status == 0) {
            return "XDZzhuangtai-wurenwu" //未完成
        } else if (status == 1) {
            return "XDZzhuangtai-yiwancheng" //已完成
        } else {
            //return 'XDZzhuangtai-yiwancheng'
            return "XDZzhuangtai-weishenbao"
        }
    }

    getStatusClassName = status => {
        if (status == 0) {
            return "icon-color-jinhangshi" //未完成
        } else if (status == 1) {
            return "icon-color-yiwancheng" //已完成
        } else if (status == 2) {
            return "icon-color-weikaishi" //无任务
        } else {
            //return 'icon-color-yiwancheng'
            return "icon-color-weikaishi"
        }
    }

    getStateName = accountHandleStatus => {
        let stateName = "无任务"

        if (accountHandleStatus == 0) {
            stateName = "未完成"
        } else if (accountHandleStatus == 1) {
            stateName = "已完成"
        } else if (accountHandleStatus == 2) {
            stateName = "无任务"
        }

        return stateName
    }

    pageTotal = () => {
        return `共 ` + this.metaAction.gf("data.page.totalCount") + ` 条 `
    }

    onRowClick = (e, index) => {
        this.injections.reduce("update", { path: "data.other.onRowIndex", value: index })
    }

    handleRenderText = (name, rowData, index) => {
        // console.log(name, rowData, index,'555555')
        let onRowIndex = this.metaAction.gf("data.other.onRowIndex")
        if (name == "name" || name == "zjm") {
            if (rowData[name]) {
                return (
                    <div
                        title={rowData[name]}
                        style={{
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                        }}>
                        {rowData[name]}
                    </div>
                )
            } else {
                return (
                    <div
                        title={rowData[name]}
                        style={{
                            opacity: 0,
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                        }}>
                        填充
                    </div>
                )
            }
        } else {
            if (name == "option") {
                return (
                    <a
                        href="javascript:;"
                        onClick={() => this.toEnterpriseTerminal(rowData.khorgId, rowData.name)}>
                        进入
                    </a>
                )
            } else if (name == "zq") {
                if (rowData.zq == "未建账") {
                    return (
                        <div class="ee">
                            <div class="qq">{rowData[name]}</div>
                            <div
                                className={
                                    rowData.zq == "未建账"
                                        ? rowData.num == "0"
                                            ? "ww"
                                            : "tt"
                                        : "rr"
                                }
                                onClick={this.createZt(rowData, rowData.zq == "未建账" ? 1 : 2)}>
                                {rowData.zq == "未建账" ? "建账" : rowData.zq}
                            </div>
                        </div>
                    )
                } else {
                    return (
                        <div class="ee">
                            <div class="qq">{rowData[name]}</div>
                            <div class="qqs">{rowData[name]}</div>
                        </div>
                    )
                }
            } else {
                if (!rowData[name] && rowData[name] !== 0) {
                    return ""
                } else {
                    let type = this.getIconType(rowData[name])
                    return (
                        <Icon
                            fontFamily="edficon"
                            type={type}
                            className={this.getStatusClassName(rowData[name])}
                        />
                    )
                }
            }
        }
    }

    renderColumns = () => {
        const columns = this.metaAction.gf("data.other.columns").toJS(),
            orgDatasourceType = this.metaAction.gf("data.orgDatasourceType")
        //   console.log(orgDatasourceType,'renderColumns');
        if (orgDatasourceType == 0) {
            let arr = [
                {
                    id: 3,
                    fieldName: "zq",
                    fieldTitle: "当前账期",
                    caption: "当前账期",
                    isVisible: true,
                    width: 120,
                },
                {
                    id: 4,
                    fieldName: "jz",
                    fieldTitle: "记账",
                    caption: "记账",
                    isVisible: true,
                    width: 120,
                },
            ]
            columns.splice(2, 0, ...arr)
        }
        const resArr = []

        columns.forEach((item, index) => {
            let obj = {}
            if (item.children) {
                let itemChildren = []
                item.children.forEach((node, nodeIndex) => {
                    itemChildren.push({
                        name: node.fieldName,
                        title:
                            node.fieldName === "gsShztDm" || node.fieldName === "gsJkztDm" ? (
                                <div>
                                    <span
                                        title={node.fieldTitle}
                                        style={{
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                        }}>
                                        {node.fieldTitle}
                                    </span>
                                    <Popover
                                        placement="bottom"
                                        content="只取本系统申报状态，未在本系统申报，请进入自然人系统查看。"
                                        overlayClassName="ttk-zs-taxapply-app-taxlist-jinggaoPopover">
                                        <Icon
                                            fontFamily="edficon"
                                            type="bangzhutishi"
                                            style={{
                                                fontSize: "18px",
                                                color: "#59b4f5",
                                                marginLeft: "5px",
                                                marginTop: "9px",
                                                verticalAlign: "top",
                                                fontWeight: 100,
                                            }}></Icon>
                                    </Popover>
                                </div>
                            ) : (
                                node.fieldTitle
                            ),
                        dataIndex: node.fieldName,
                        width: node.width,
                        // fixed: item.fieldName == 'option'?'right':false,
                        align:
                            node.fieldName == "name" || node.fieldName == "helpCode"
                                ? "left"
                                : "center",
                        render: (text, v, index) => {
                            return this.handleRenderText(node.fieldName, v, index)
                        },
                    })
                })
                obj = {
                    title: item.fieldTitle,
                    children: itemChildren,
                }
            } else {
                obj = {
                    name: item.fieldName,
                    title: item.fieldTitle,
                    dataIndex: item.fieldName,
                    width: item.width,
                    className:
                        item.fieldName == "option" && orgDatasourceType == 1 ? "optionclass" : "",
                    // fixed: item.fieldName == 'option'?'right':false,
                    align:
                        item.fieldName == "name" || item.fieldName == "helpCode"
                            ? "left"
                            : "center",
                    render: (text, v, index) => {
                        return this.handleRenderText(item.fieldName, v, index)
                    },
                }
            }
            resArr.push(obj)
        })

        return resArr
    }

    bannerClick = async () => {
        /*const ret = await this.metaAction.modal('show', {
            title: '批量签名',
            className: 'ttk-es-app-yyhome-batch-signature-modal',
            wrapClassName: 'card-archive',
            width: '100%',
            height: '100%',
            footer:null,
            children: this.metaAction.loadApp('ttk-es-app-yyhome-batch-signature', {
                store: this.component.props.store,
                // id: record.id,
                // active: 'details'
            })
        });
        if (ret) {
            this.load();
        }*/
        const urlHref = window.location.href.split("#")[0]
        let w = window.open("about:blank")
        if (!w) {
            w = window.open(`${urlHref}#/edfx-app-root/ttk-es-app-yyhome-batch-signature`)
        } else {
            w.location.href = `${urlHref}#/edfx-app-root/ttk-es-app-yyhome-batch-signature#theme=blue`
        }
        return false
    }
    bannerSbjdClick = async () => {
        const urlHref = window.location.href.split("#")[0]
        let w = window.open("about:blank")
        if (!w) {
            w = window.open(`${urlHref}#/edfx-app-root/ttk-es-app-yyhome-batch-declare`)
        } else {
            w.location.href = `${urlHref}#/edfx-app-root/ttk-es-app-yyhome-batch-declare#theme=blue`
        }
        return false
    }
    bannerFuncClick = async () => {
        const urlHref = window.location.href.split("#")[0]
        let w = window.open("about:blank")
        if (!w) {
            w = window.open(`${urlHref}#/edfx-app-root/ttk-es-app-yyhome-function-introduce`)
        } else {
            w.location.href = `${urlHref}#/edfx-app-root/ttk-es-app-yyhome-function-introduce#theme=blue`
        }
    }
    bannerNoDiskClick = async () => {
        const urlHref = window.location.href.split("#")[0]
        let w = window.open("about:blank")
        if (!w) {
            w = window.open(`${urlHref}#/edfx-app-root/ttk-es-app-yyhome-no-disk-authentication`)
        } else {
            w.location.href = `${urlHref}#/edfx-app-root/ttk-es-app-yyhome-no-disk-authentication#theme=blue`
        }
        return false
    }
    bannerFuncSecondClick = async () => {
        // const urlHref = window.location.href.split('#')[0]
        let w = window.open("about:blank")
        if (!w) {
            w = window.open("https://jcdz-help.jchl.com/xdz-help/GNJS/202005/new.html")
        } else {
            w.location.href = "https://jcdz-help.jchl.com/xdz-help/GNJS/202005/new.html"
        }
        return false
    }
    bannerSettlementClick = async () => {
        const urlHref = window.location.href.split("#")[0]
        let w = window.open("about:blank")
        if (!w) {
            w = window.open(`${urlHref}#/edfx-app-root/ttk-es-app-yyhome-annual-settlement`)
        } else {
            w.location.href = `${urlHref}#/edfx-app-root/ttk-es-app-yyhome-annual-settlement#theme=blue`
        }
        return false
    }

    bannerQuestionnaireClick = async () => {
        let w = window.open("about:blank")
        if (!w) {
            w = window.open("http://jchlyhdy.mikecrm.com/ZEM5unk")
        } else {
            w.location.href = "http://jchlyhdy.mikecrm.com/ZEM5unk"
        }
        return false
    }

    openBatchSignature = () => {
        this.component.props.setGlobalContent({
            name: "批量签名",
            appName: "ttk-es-app-yyhome-batch-signature",
            params: {},
            orgId: 111,
            // showHeader:true
        })
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
