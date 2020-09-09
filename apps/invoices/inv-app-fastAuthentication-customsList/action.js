import React from "react";
import { action as MetaAction} from "edf-meta-engine";
import config from "./config";
import { fromJS } from "immutable";
import Suaxin from "./components/Suaxin";
import moment from "moment";
import { Button, Form, Input } from "antd";
import { LoadingMask, Upload } from "edf-component";
import { fetch, calculate } from "edf-utils";

class action {
    constructor(option) {
        this.metaAction = option.metaAction;
        this.config = config.current;
        this.webapi = this.config.webapi;
    }

    onInit = ({ component, injections }) => {
        this.component = component;
        this.injections = injections;
        injections.reduce("init");
        this.request();
    };

    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener("resize", this.onResize, false);
        } else if (window.attachEvent) {
            window.attachEvent("onresize", this.onResize);
        } else {
            window.onresize = this.onResize;
        }
    };

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener("resize", this.onResize, false);
        } else if (win.detachEvent) {
            window.detachEvent("onresize", this.onResize);
        } else {
            window.onresize = undefined;
        }
    };

    getTableScroll = e => {
        try {
            let tableOption = this.metaAction.gf("data.tableOption").toJS();
            let appDom = document.getElementsByClassName(
                "inv-app-fastAuthentication-customsList"
            )[0]; //以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName(
                "ant-table-wrapper"
            )[0]; //table wrapper包含整个table,table的高度基于这个dom
            if (!tableWrapperDom) {
                if (e) {
                    return;
                }
                setTimeout(() => {
                    this.getTableScroll();
                }, 100);
                return;
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName(
                "ant-table-thead"
            )[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName(
                "ant-table-tbody"
            )[0];

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num =
                    tableWrapperDom.offsetHeight -
                    tbodyDom.offsetHeight -
                    theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                if (num < 0) {
                    this.injections.reduce("tableOption", {
                        ...tableOption,
                        x: width - 13,
                        y: height - theadDom.offsetHeight - 1
                    });
                } else {
                    delete tableOption.y;
                    this.injections.reduce("tableOption", {
                        ...tableOption,
                        x: width - 2,
                        y: height - theadDom.offsetHeight - 1
                    });
                }
            }
        } catch (err) {}
    };
    //搜索查询
    handerFilter = form => {
        if (form) {
            this.injections.reduce("initInvoiceInfo", "data.filter.form", form);
        }
        this.request(form);
    };

    //选择数据改变
    checkboxChange = (arr, itemArr) => {
        // console.log(arr, itemArr);
        this.injections.reduce("update", {
            path: "data.tableCheckbox",
            value: {
                checkboxValue: arr,
                selectedOption: itemArr
            }
        });
        let { add } = calculate; //加减乘除
        itemArr = itemArr.filter(o => o);
        let totalAmount = 0;
        let totalTax = 0;
        let newArr = itemArr.map(item => {
            totalAmount = add(totalAmount, item.hjje);
            totalTax = add(totalTax, item.hjse);
            return item.id;
        });

        let onlyShowSelected = this.metaAction.gf(
            "data.other.onlyShowSelected"
        );

        let obj = {
            /*  'data.statistics': fromJS({
                  count: itemArr.length,
                  totalAmount: utils.number.format(totalAmount, 2),
                  totalTax: utils.number.format(totalTax, 2),
              }),*/
        };
        if (onlyShowSelected) {
            let listAll = this.metaAction.gf("data.list").toJS();
            if (itemArr.length === listAll.length) return;
            //为了保证顺序
            let list = listAll
                .map(o => {
                    return itemArr.find(item => item.id === o.id);
                })
                .filter(a => a);
            obj["data.list"] = fromJS(list);
        }
        // if (!itemArr.length) {
        //  obj['data.other.onlyShowSelected'] = false
        // }
        this.metaAction.sfs(obj);
        if (onlyShowSelected) {
            /*  this.onResize()*/
        }
    };
    clearCheck = () => {
        this.metaAction.sfs({
            "data.tableCheckbox.checkboxValue":[],
            "data.tableCheckbox.selectedOption":fromJS([]),
            "data.selectedRowKeys":[]
        })
    };
    // 菜单点击更多
    moreActionOpeate = e => {
        this[e.key] && this[e.key]();
    };

    // 双击发票修改
    doubleClick = record => {
        return {
            onDoubleClick: e => {
                const { kjxh } = record;
                const { periodDate } = this.metaAction.context.get(
                    "currentOrg"
                );
                let date = moment()
                    .subtract(1, "months")
                    .format("YYYYMM");
                this.component.props.nsqj = periodDate;
                let obj = {
                    title: "修改海关专用缴款书",
                    appName: "inv-app-pu-cdpi-invoice-card"
                };
                let ret = this.metaAction.modal("show", {
                    title: obj.title,
                    wrapClassName: `${obj.appName}-wrap`,
                    width: "80%",
                    style: { top: 5 },
                    okText: "保存",
                    bodyStyle: { padding: "0px 0 12px 0" },
                    children: this.metaAction.loadApp(obj.appName, {
                        store: this.component.props.store,
                        nsqj: date,
                        fromModule: "InvoiceAuthentication",
                        kjxh
                    })
                });
                if (ret) {
                    this.request();
                }
            }
        };
    };

    // 请求列表
    request = async (options = {}) => {
        let { systemDateTime } = this.metaAction.context.get("currentOrg");
        systemDateTime =
            moment()
                .subtract(0, "month")
                .format("YYYYMM") || systemDateTime;
        this.metaAction.sf(
            "data.skssq",
            moment(`${systemDateTime}01`, "YYYYMM")
        );
        this.metaAction.sf("data.loading", true);
        /*let {periodDate} =  this.metaAction.context.get("currentOrg")
        periodDate = periodDate.replace(/-/g,'')*/
        let req = {
            rzzt: "", //认证状态
            kprqq: "", // 开票日期起
            kprqz: "", // 开票日期止
            fphm: "", // 缴款书号码
            sbrq: systemDateTime
        };

        if (options) {
            /*     if(options.page)req.page.currentPage = options.page.currentPage  // 页码暂时不用
                 if(options.page)req.page.pageSize = options.page.pageSize*/
            if (options.recognize_retult) req.rzzt = options.recognize_retult; //认证状态
            if (options.bill_date_start) req.kprqq = options.bill_date_start; // 开票日期起
            if (options.bill_date_end) req.kprqz = options.bill_date_end; // 开票日期止
            if (options.inv_code) req.fphm = options.inv_code; // 缴款书号码
        }

        const response = await this.webapi.person.initList(req);
        this.dealData(response);
        this.clearCheck();
    };
    // 处理列表数据
    dealData = response => {
        let list = response.jxfpDtos;
        list.forEach((item, index) => {
            item.id = item.kjxh;
            item.kprq2 = item.kprq.substring(0, 10);
            if (item.hjje) item.hjje = item.hjje.toFixed(2);
            if (item.hjse) item.hjse = item.hjse.toFixed(2);
            if (item.bdzt === "0") item.bdzts = "未认证";
            if (!item.bdzt) item.bdzts = "未认证";
            if (item.bdzt === "1") item.bdzts = "已认证";
            if (item.bdzt === "2") item.bdzts = "认证中";
        });

        let statistics = {
            count: response.jxfpDtos.length,
            totalAmount: response.ljje.toFixed(2),
            totalTax: response.ljse.toFixed(2)
        };
        this.metaAction.sfs({
            "data.statistics":statistics,
            "data.list":list,
            "data.loading":false
        })
        this.onResize(); // 页面数据加载完成后计算滚动条高度
    
    };

    // 调整大小
    onResize = e => {
        let keyRandomTab = Math.floor(Math.random() * 10000);
        this.keyRandomTab = keyRandomTab;
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll();
            }
        }, 200);
    };
    // 待对比数据导出回调函数，确认导出
    isExport = async () => {
        const selectedOption = this.metaAction
            .gf("data.tableCheckbox.selectedOption")
            .toJS(); //选中要导出的数据
        let arr = [];
        selectedOption.forEach(item => {
            arr.push(item.fphm);
        });
        let data = this.metaAction.gf("data.skssq");
        let date = moment(data)
            .subtract(0, "months")
            .format("YYYYMM");
        const { vatTaxpayerNum, name } = this.metaAction.context.get(
            "currentOrg"
        );
        let res = {
            nsrsbh: vatTaxpayerNum,
            nsqj: date,
            nsrmc: name,
            fpdmList: arr
        };
        let re = await this.webapi.person.educe(res);
        this.request();
    };

    // 待对比数据导出
    contrastData = async () => {
        const selectedOption = this.metaAction
            .gf("data.tableCheckbox.selectedOption")
            .toJS(); //选中的
        let { add } = calculate; // 加减乘除
        if (selectedOption.length == 0) {
            return this.metaAction.toast("error", "请选择您要导出的数据");
        }
        let spd = selectedOption.length; //张数
        let amount = 0; // 金额
        let ex_tax_amount = 0; // 税额
        let set = [];
        let set2 = [];
        for (const item of selectedOption) {
            amount = add(amount, item.hjje);
            ex_tax_amount = add(ex_tax_amount, item.hjse);
        }
        let res = await this.metaAction.modal("confirm", {
            title: "",
            width: "458px",
            onOk: this.isExport,
            content: (
                <div style={{ fontSize: "12px", lineHeight: "22px" }}>
                    <h3 style={{ paddingBottom: "10px" }}>请确认</h3>
                    <div>本次选取的海关缴款书汇总如下:</div>
                    <div>
                        本次选取：<span style={{ color: "orange" }}>{spd}</span>
                        份，金额合计：
                        <span style={{ color: "orange" }}>{amount}</span>
                        元，税额合计：
                        <span style={{ color: "orange" }}>{ex_tax_amount}</span>
                        元
                    </div>
                    <div>请确认是否导出？ </div>
                </div>
            )
        });
    };

    // 刷新
    refresh = async () => {
        // 选择一个刷新区间
        let data = this.metaAction.gf("data.skssq");
        let res = this.metaAction.modal("show", {
            title: "刷新认证结果",
            width: 350,
            wrapClassName: "ttk-scm-app-authorized-invoice-list-download",
            children: (
                <Suaxin
                    store={this.component.props.store}
                    webapi={this.webapi}
                    defaulDate={data}
                />
            )
        });
        if (res) {
            this.request();
        }
    };
    // 导入
    import = async () => {
        this.metaAction.sf("data.hgfile", "");
        await this.metaAction.modal("show", {
            title: "导入",
            className: "inv-app-batch-purchase-list-import-modal-hg2",
            okText: "导入",
            footer: false,
            cancelText: "取消",
            width: 600,
            children: (
                <div style={{ lineHeight: 2, fontSize: "12px" }}>
                    <div style={{ fontSize: "15px", color: "#333" }}>
                        <strong>支持导入：海关进口增值税专用缴款书</strong>
                    </div>
                    <div style={{ textIndent: "-1.5em", marginLeft: "2em" }}>
                        {" "}
                        <span>
                            1、支持“ 中国国际贸易单一窗口（
                            <a
                                href="https://www.singlewindow.cn/"
                                target="view_window"
                            >
                                https://www.singlewindow.cn/
                            </a>
                            ）”下载海关进口增值税缴款书文件导入。
                        </span>{" "}
                    </div>
                    <div style={{ textIndent: "-1.5em", marginLeft: "2em" }}>
                        2、支持下载模板，并在模板中整理数据后，导入文件。
                    </div>
                    <div style={{ color: "#333" }}>
                        <strong>方法一：</strong>
                    </div>
                    <div style={{ textIndent: "-1.5em", marginLeft: "2em" }}>
                        1、请先到“ 中国国际贸易单一窗口（
                        <a
                            href="https://www.singlewindow.cn/"
                            target="view_window"
                        >
                            https://www.singlewindow.cn/
                        </a>
                        ）”下载 海关进口增值税缴款书
                    </div>
                    <div style={{ textIndent: "-1.5em", marginLeft: "2em" }}>
                        2、选择文件进行导入
                    </div>
                    <div style={{ color: "#333" }}>
                        <strong>方法二：</strong>
                    </div>
                    <div style={{ textIndent: "-1.5em", marginLeft: "2em" }}>
                        1、下载
                        <a
                            style={{ color: "#0066B3" }}
                            onClick={() => {
                                this.DownloadTemplate();
                            }}
                        >
                            导入模版
                        </a>
                        并按模版格式整理数据
                    </div>
                    <div style={{ textIndent: "-1.5em", marginLeft: "2em" }}>
                        2、选择文件进行导入
                    </div>
                    <div style={{ textIndent: "-1.5em", marginLeft: "2em" }}>
                        <span style={{ color: "#f17712" }}>温馨提示：</span>{" "}
                        <span>
                            1、缺少发票种类、专用缴款书号码、日期或税款金额的不能导入哦！
                        </span>
                    </div>
                    <div style={{ marginLeft: "70px" }}>
                        <strong>
                            2、请不要对“国贸单一窗口”导出的原始文件做任何修改！
                        </strong>
                    </div>
                    <Form.Item>
                        <span>上传文件：</span>
                        <Input
                            className="inv-app-batch-purchase-list-import-modal-input-hg"
                            placeholder="请选择文件"
                            //value = {this.metaAction.gf('data.hgOriginalNames')}
                            style={{
                                display: "inline-block",
                                width: "375px",
                                verticalAlign: "middle"
                            }}
                        />
                        <Upload
                            onChange={this.hgUploadChange}
                            accept=".xls, .xlsx"
                            action="/v1/edf/file/upload"
                            showUploadList={false}
                            beforeUpload={this.hgBeforeUpload}
                            headers={this.getAccessToken()}
                            style={{
                                display: "inline-block",
                                verticalAlign: "middle"
                            }}
                        >
                            <Button type="primary">选择文件</Button>
                        </Upload>
                    </Form.Item>
                    <div>
                        <div className="inv-app-batch-purchase-list-import-modal-hg-bottom-right">
                            <Button
                                key="submit"
                                type="primary"
                                style={{
                                    marginRight: "15px"
                                }}
                                onClick={() => {
                                    this.readyImport("hg");
                                }}
                            >
                                导入
                            </Button>
                            <Button
                                key="back"
                                onClick={() => {
                                    this.destroyAll("hg2");
                                }}
                            >
                                取消
                            </Button>
                        </div>
                    </div>
                </div>
            )
        });
    };
    // 新增
    newIncreased = async () => {
        let data = this.metaAction.gf("data.skssq");
        let date = moment(data)
            .subtract(-1, "months")
            .format("YYYYMM");
        const res = await this.metaAction.modal("show", {
            title: "新增海关专用缴款书",
            width: "80%",
            okText: "保存",
            cancelText: "关闭",
            bodyStyle: { padding: "0px 0 12px 0" },
            children: this.metaAction.loadApp("inv-app-pu-cdpi-invoice-card", {
                store: this.component.props.store,
                nsqj: date,
                fromModule: "InvoiceAuthentication"
            })
        });
        if (res.listNeedLoad === true) {
            this.request();
        } else {
            return;
        }
    };

    //删除发票
    deleteBatchClick = async () => {
        const selectedOption = this.metaAction
            .gf("data.tableCheckbox.selectedOption")
            .toJS(); //选中的
        if (selectedOption.length == 0) {
            this.metaAction.toast("error", "请选择您要删除的数据");
            return;
        }

        const ret = await this.metaAction.modal("confirm", {
            title: "删除进项发票",
            content: "确定删除所选进项发票？"
        });
        // console.log(ret)
        if (!ret) {
            return;
        }
        const { qyid } = this.component.props.appParams;
        let arr = [];
        selectedOption.forEach(item => {
            arr.push(item.kjxh);
        });
        let data = {
            qyId: qyid, // 企业ID
            kjxhList: arr //开机序列号列表
        };

        const res = await this.webapi.person.deleteBatch(data);

        if (res === null) {
            this.metaAction.toast("success", "删除成功");
            this.request();
        } else {
            return res;
        }
        this.injections.reduce("update", {
            path: "data.tableCheckbox",
            value: {
                checkboxValue: [],
                selectedOption: []
            }
        });
    };
    //  下载发票
    download = async () => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {};
        const currentUser = this.metaAction.context.get("currentUser") || {};
        /*  const ret = await this.metaAction.modal('show', {
            title: '下载月份',
            width: 350,
            wrapClassName: 'ttk-scm-app-authorized-invoice-list-download',
            children: <Download
              store={this.component.props.store}
              webapi={this.webapi}
              defaulDate= {moment().subtract(0, "months").format("YYYY-MM")}
              currentOrg = {currentOrg}
              currentUser = {currentUser}
              getInvoiceList = { this.request}
              lodingT = {this.lodingT}
              lodingF = {this.lodingF}
            />
          })*/
        let data = this.metaAction.gf("data.skssq");
        let date = moment(data)
            .subtract(-1, "months")
            .format("YYYYMM");

        date = date.substring(0, 6);
        const ret = await this.metaAction.modal("show", {
            title: "下载发票",
            className: "inv-app-batch-purchase-list-modal",
            width: 400,
            style: { top: "20%" },
            bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
            children: this.metaAction.loadApp("inv-app-pu-collect-card", {
                store: this.component.props.store,
                nsqj: date,
                fromModule: "InvoiceAuthentication"
                // callback:this.request
            })
        });
        if (ret && ret.listNeedLoad) {
            this.request();
        }
    };
    // 税款所属期
    renderSkssq = () => {
        let data = this.metaAction.gf("data.skssq");
        let date = moment(data)
            .subtract(0, "months")
            .format("YYYY-MM");
        return <span>{date}</span>;
    };
    // 页脚渲染
    renderFooterAmount = () => {
        let res = this.metaAction.gf("data.statistics");

        return (
            <div className="footer-div">
                <span>合计：</span>{" "}
                <span>
                    共 <span className="bold-text">{res.count}</span> 张发票
                </span>{" "}
                <span className="span-left">
                    金额：<span className="bold-text">{res.totalAmount}</span>
                    （元）
                </span>
                <span className="span-left">
                    税额：<span className="bold-text">{res.totalTax}</span>
                    （元）
                </span>
            </div>
        );
    };
    // loding
    lodingT = () => {
        this.metaAction.sf("data.loading", true);
    };
    lodingF = () => {
        this.metaAction.sf("data.loading", false);
    };

    btnClick = () => {
        this.injections.reduce("modifyContent");
    };
    // 下载海关模板
    DownloadTemplate = async () => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {},
            nsrsbh = currentOrg.vatTaxpayerNum;
        let a = {
            fplx: "jxfp",
            fpzlDm: "13",
            nsrsbh
        };
        await this.webapi.person.downloadTemplate(a);
    };
    //海关上传文件前的回调
    hgBeforeUpload = async file => {
        let isWin =
            navigator.platform == "Win32" ||
            navigator.platform == "Windows" ||
            (navigator.platform == "MacIntel" &&
                navigator.userAgent.toLowerCase().indexOf("chrome") < 0);
        if (!isWin) return;

        let type = file.type ? file.type : "application/vnd.ms-excel";
        let mode = file.name.substr(file.name.length - 4, 4);
        if (
            !(
                type == "application/vnd.ms-excel" ||
                type ==
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                mode.indexOf("xls") > -1
            )
        ) {
            if (LoadingMask) {
                LoadingMask.hide();
            }

            //this.metaAction.toast('error', '仅支持上传Excel格式的文件')
            this.metaAction.modal("error", {
                okText: "确定",
                content:
                    "支持导入EXCEL 2003格式，及2003以上版本，请检查文件格式。"
            });
            return false;
        }

        this.fileSizeJudge(file, "hg");
    };
    //校验文件大小
    fileSizeJudge = async (file, type) => {
        const isLt500KB = file.size / 1024 > 500;
        if (file.size && isLt500KB) {
            this.metaAction.sf(`data.${type}CanUpload`, false);
            await this.metaAction.modal("info", {
                title: "导入",
                okText: "确定",
                content: <div>导入文件过大，请分拆后再导入。</div>
            });
            return false;
        }
        this.metaAction.sf(`data.${type}CanUpload`, true);
    };
    //上传必须发送的token
    getAccessToken = () => {
        let token = fetch.getAccessToken();
        return {
            token
        };
    };
    //文件以选择好 继续导入
    readyImport = async type => {
        const file = this.metaAction.gf(`data.${type}file`);
        if (file !== "") {
            this.destroyAll("hg2");
            return await this.formalImport(type);
        } else {
            return this.metaAction.toast("warning", "请选择文件");
        }
    };
    //关闭Modal
    destroyAll = type => {
        let node = document.querySelector(
            `.inv-app-batch-purchase-list-import-modal-${type}`
        ).parentNode.parentNode;
        node.parentNode.removeChild(node);
    };
    //向后台发送上传请求 正式导入
    formalImport = async type => {
        let file = this.metaAction.gf(`data.${type}file`).toJS();
        if (file) {
            const currentOrg = this.metaAction.context.get("currentOrg") || {},
                nsrsbh = currentOrg.vatTaxpayerNum,
                skssq = this.metaAction.gf("data.skssq").format("YYYYMM");
            let date = moment(this.metaAction.gf("data.skssq"))
                .subtract(-1, "months")
                .format("YYYYMM");
            this.metaAction.sf("data.loading", true);
            let res = await this.webapi.person.bizInvoiceExcelImportJxfp({
                id: file.id, //文件流对象id
                fplx: "jxfp", //发票类型（jxfp：进项发票；xxfp：销项发票）
                skssq: date, //税款所属期（报税月份-1）
                nsrsbh, //纳税人识别号
                fileInfo: {
                    //文件详细信息
                    originalName: file.originalName,
                    type: file.type,
                    size: file.size,
                    suffix: file.suffix
                }
            });

            this.metaAction.sf("data.loading", false);
            if (res.error) {
                await this.metaAction.modal("warning", {
                    title: "提示",
                    className: "inv-app-batch-purchase-list-import-modal-error",
                    okText: "确定",
                    content: "上传失败，请重新上传"
                });
                return;
            } else if (res && !res.importData.sfcjcg) {
                await this.metaAction.modal("warning", {
                    title: "提示",
                    okText: "确定",
                    content: <div>{res.importData.msg}</div>
                });
                return;
            } else if (res && res.importData.sfcjcg) {
                const fp = {
                        zzszyfp: {},
                        jdcfp: {},
                        zzsptfp: {},
                        txffp: {},
                        escfp: {}
                    },
                    fpzl = {
                        "01": "zzszyfp",
                        "03": "jdcfp",
                        "04": "zzsptfp",
                        "07": "escfp",
                        "17": "txffp"
                    };
                let topContent, bottomContent, hgContnent;
                let swVatTaxpayer =
                    this.component.props.appParams.swVatTaxpayer ||
                    this.component.props.swVatTaxpayer;
                const dataList = res.importData.dataList;
                if (dataList.length > 0) {
                    dataList.forEach(val => {
                        fp[fpzl[val.fpzldm]] = val;
                    });

                    if (
                        fp.zzszyfp ||
                        fp.jdcfp ||
                        fp.zzsptfp ||
                        fp.txffp ||
                        fp.escfp
                    ) {
                        topContent = (
                            <div>
                                <div>其中：</div>
                                {fp.zzszyfp && fp.zzszyfp.fpzs_total ? (
                                    <div>
                                        增值税专用发票{fp.zzszyfp.fpzs_total}张
                                        {swVatTaxpayer === "0" && (
                                            <span>
                                                （已认证{fp.zzszyfp.fpzs_yrz}
                                                张，未认证{fp.zzszyfp.fpzs_wrz}
                                                张）
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    ""
                                )}
                                {fp.zzsptfp && fp.zzsptfp.fpzs_total ? (
                                    <div>
                                        增值税普通发票{fp.zzsptfp.fpzs_total}张
                                    </div>
                                ) : (
                                    ""
                                )}
                                {fp.jdcfp && fp.jdcfp.fpzs_total ? (
                                    <div>
                                        机动车销售发票{fp.jdcfp.fpzs_total}张
                                        {swVatTaxpayer === "0" && (
                                            <span>
                                                （已认证{fp.jdcfp.fpzs_yrz}
                                                张，未认证{fp.jdcfp.fpzs_wrz}
                                                张）
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    ""
                                )}
                                {fp.escfp && fp.escfp.fpzs_total ? (
                                    <div>二手车发票{fp.escfp.fpzs_total}张</div>
                                ) : (
                                    ""
                                )}
                                {fp.txffp && fp.txffp.fpzs_total ? (
                                    <div>
                                        通行费发票{fp.txffp.fpzs_total}张{" "}
                                        {swVatTaxpayer === "0" && (
                                            <span>
                                                （已认证{fp.txffp.fpzs_yrz}
                                                张，未认证{fp.txffp.fpzs_wrz}
                                                张）
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                        );
                    }

                    if (
                        res.importData.fpzs_sk > 0 ||
                        res.importData.fpzs_zf > 0 ||
                        res.importData.fpzs_yc > 0 ||
                        res.importData.fpzs_glzt_yc > 0
                    ) {
                        bottomContent = (
                            <div>
                                <div>另外：</div>
                                {res.importData.fpzs_sk > 0 ? (
                                    <div>
                                        发票状态-失控发票{" "}
                                        {res.importData.fpzs_sk} 张
                                    </div>
                                ) : (
                                    ""
                                )}
                                {res.importData.fpzs_zf > 0 ? (
                                    <div>
                                        发票状态-作废发票{" "}
                                        {res.importData.fpzs_zf} 张
                                    </div>
                                ) : (
                                    ""
                                )}
                                {res.importData.fpzs_yc > 0 ? (
                                    <div>
                                        发票状态-异常发票{" "}
                                        {res.importData.fpzs_yc} 张
                                    </div>
                                ) : (
                                    ""
                                )}
                                {res.importData.fpzs_glzt_yc > 0 ? (
                                    <div>
                                        发票状态-管理状态异常{" "}
                                        {res.importData.fpzs_glzt_yc} 张
                                    </div>
                                ) : (
                                    ""
                                )}
                            </div>
                        );
                    }
                    if (type === "hg") {
                        let fpzs_yrz, fpzs_wrz;
                        dataList.forEach(item => {
                            fpzs_yrz = item.fpzs_yrz;
                            fpzs_wrz = item.fpzs_wrz;
                        });
                        hgContnent = (
                            <div>
                                导入成功。共导入海关票
                                {res.importData.fpzs_total}张
                                {swVatTaxpayer === "0" && (
                                    <span>
                                        （已认证{fpzs_yrz ? fpzs_yrz : "0"}
                                        张，未认证{fpzs_wrz ? fpzs_wrz : "0"}
                                        张）
                                    </span>
                                )}
                            </div>
                        );
                    }
                }
                if (res) {
                    let r = await this.metaAction.modal("success", {
                        okText: "确定",
                        width: 500,
                        content: (
                            <div>
                                {type === "zzs" && (
                                    <div>
                                        导入进项发票成功：共导入发票
                                        {res.importData.fpzs_total}张。
                                    </div>
                                )}
                                {type === "zzs" && (
                                    <div>
                                        {topContent}
                                        {bottomContent}
                                    </div>
                                )}
                                {type === "hg" && hgContnent}
                            </div>
                        )
                    });
                    if (r) {
                        this.request();
                    }
                }
                return;
            }
        } else {
            this.metaAction.toast("warning", "请选择文件");
            return false;
        }
    };
    //海关文件改变触发的回调
    hgUploadChange = info => {
        const file = info.file;
        if (!file.status) return;
        if (!this.metaAction.gf("data.hgCanUpload")) return;
        if (file.status === "done") {
            this.metaAction.sf("data.loading", false);
            const response = file.response;
            if (response.error && response.error.message) {
                this.metaAction.toast("error", response.error.message);
            } else if (response.result && response.value) {
                this.metaAction.sf("data.hgfile", fromJS(response.value));
                this.metaAction.sf(
                    "data.hgOriginalName",
                    fromJS(response.value.originalName)
                );
                document.querySelectorAll(
                    ".inv-app-batch-purchase-list-import-modal-input-hg"
                )[0].value = response.value.originalName;
            }
        } else if (info.file.status === "error") {
            this.metaAction.toast("error", "上传失败");
        }
    };
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o };

    metaAction.config({ metaHandlers: ret });

    return ret;
}
