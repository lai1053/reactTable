import React from 'react'
import {Button, Icon, Form, Input,Modal} from "antd";
import {LoadingMask, Upload} from "edf-component";
import {fetch} from "edf-utils";
class ChoseImportType extends React.Component {
    constructor(props) {
        super(props)
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
        this.state = {
            zzsfile: "",
            tysfile: "",
            zzsfile2:undefined,
            hgfile: "",
            zzsOriginalName:'',
            zzsOriginalName2:'',
            hgOriginalName:'',
            zzsCanUpload: true,
            hgCanUpload: true,
            importType: "",
            disabled:true,
            visibleZzsImport:false,
            visibleZzsImportSimple:false,
        }
    }
    changeImportType(value) {
        this.setState({
            importType: value
        })
        if (value === "zzs") {
            if (this.props.invoiceVersion === 1) {
                this.zzsImport(); //1.0版本导入
            } else {
                this.zzsImport2();
            }
        } else if (value === "hg") {
                this.hgImport();
        }else if(value === 'ty'){
                this.tyImport();
        }
        
    }
    zzsImport = async()=>{
        this.metaAction.modal("show", {
            title: "导入",
            className: "inv-app-batch-purchase-list-import-modal-zzs",
            footer: false,
            okText: "确定",
            cancelText: "取消",
            width: 600,
            children: (
                <div style={{ lineHeight: 2, fontSize: "12px" }}>
                    <div>
                        <strong style={{ fontSize: "15px", color: "#333" }}>
                            支持导入：增值税发票选择确认平台（勾选确认）
                            下载的发票
                        </strong>
                    </div>
                    <div>
                        <strong style={{ color: "#333" }}>导入步骤：</strong>
                    </div>
                    <div>
                        1、请先到 增值税发票选择确认平台（勾选确认）下载发票
                    </div>
                    <div>2、选择 文件进行导入</div>
                    <div style={{ color: "#f17712" }}>温馨提示：</div>
                    <div>
                        {" "}
                        1、缺少发票类型 或 发票代码、发票号码的发票不能导入哦！
                    </div>
                    <div>
                        {" "}
                        2、导入发票后，点击【一键读取发票】，系统会自动补全发票票体信息，商品明细信息。
                    </div>
                    <div>
                        <strong>3、请不要对导出的原始文件做任何修改！</strong>{" "}
                    </div>
                    <div>
                        <Form.Item>
                            <span style={{ color: "#333" }}>上传文件：</span>
                            <Input
                                className="inv-app-batch-purchase-list-import-modal-input-zzs"
                                placeholder="请选择文件"
                                value={this.state.zzsOriginalName}
                                style={{
                                    display: "inline-block",
                                    width: "330px",
                                    verticalAlign: "middle"
                                }}
                            />
                            <Upload
                                onChange={this.zzsUploadChange}
                                accept=".xls, .xlsx"
                                action="/v1/edf/file/upload"
                                showUploadList={false}
                                /*beforeUpload={this.zzxBeforeUpload}*/
                                headers={this.getAccessToken()}
                                style={{
                                    display: "inline-block",
                                    verticalAlign: "middle"
                                }}
                            >
                                <Button type="primary">选择文件</Button>
                            </Upload>
                        </Form.Item>
                    </div>
                    <div>
                        <div
                            className="inv-app-batch-purchase-list-import-modal-zzs-bottom-left"
                            onClick={() => {
                                this.destroyAll("zzs");
                            }}
                        >
                            返回选择
                        </div>
                        <div className="inv-app-batch-purchase-list-import-modal-zzs-bottom-right">
                            <Button
                                key="submit"
                                type="primary"
                                style={{
                                    marginRight: "15px"
                                }}
                                onClick={() => {
                                    this.readyImport("zzs");
                                }}
                            >
                                导入
                            </Button>
                            <Button
                                key="back"
                                onClick={() => {
                                    this.destroyAll("zzs");
                                    this.destroyImportModal();
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
    zzsImport2 = async() =>{
        const swVatTaxpayer = this.props.swVatTaxpayer
        if (swVatTaxpayer === "0") {
            this.setState({
                visibleZzsImport:true
            })
        } else {
            this.setState({
                visibleZzsImportSimple: true
            })
        }
    };
    hgImport = async() =>{
        await this.metaAction.modal("show", {
            title: "导入",
            className: "inv-app-batch-purchase-list-import-modal-hg",
            okText: "导入",
            footer: false,
            cancelText: "取消",
            width: 600,
            children: (
                <div style={{ lineHeight: 2, fontSize: "12px" }}>
                    <div style={{ fontSize: "15px", color: "#333" }}>
                        <strong>支持导入：海关进口增值税专用缴款书</strong>
                    </div>
                    {/*                  <div style={{textIndent: "-1.5em",marginLeft: "2em"}}> <span>1、支持“ 中国国际贸易单一窗口（<a href='https://www.singlewindow.cn/' target="view_window">https://www.singlewindow.cn/</a>）”下载海关进口增值税缴款书文件导入。</span> </div>
                    <div style={{textIndent: "-1.5em",marginLeft: "2em"}}>2、支持下载模板，并在模板中整理数据后，导入文件。</div>*/}
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
                        <strong>2、请不要修改“国贸”下载文件的内容</strong>
                    </div>
                    <Form.Item>
                        <span>上传文件：</span>
                        <Input
                            className="inv-app-batch-purchase-list-import-modal-input-hg"
                            placeholder="请选择文件"
                            /*value={this.metaAction.gf("data.hgOriginalNames")}*/
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
                        <div
                            className="inv-app-batch-purchase-list-import-modal-hg-bottom-left"
                            onClick={() => {
                                this.destroyAll("hg");
                            }}
                        >
                            返回选择
                        </div>
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
                                    this.destroyAll("hg");
                                    this.destroyImportModal();
                                }}
                            >
                                取消
                            </Button>
                        </div>
                    </div>
                </div>
            )
        });
    }
    tyImport = async() =>{
        this.metaAction.modal("show", {
            title: "导入",
            className: "inv-app-batch-purchase-list-import-modal-tys",
            footer: false,
            okText: "确定",
            cancelText: "取消",
            width: 600,
            children: (
                <div>
                    <div style = {{lineHeight: 2, color: "#333",fontSize: "12px" }}>
                        <div><strong> 导入步骤：</strong></div>
                        <div>
                            1、下载自定义模版，并按模版格式整理数据
                            <div style={{ fontSize: "12px" , marginLeft: "20px" }}>
                                <a
                                    style={{ color: "#0066B3" }}
                                    onClick={() => {
                                        this.DownloadGMTemplateS();
                                    }}
                                >
                                    通用模版（一般人）
                                </a>
                                /
                                <a
                                    style={{ color: "#0066B3",marginLeft: "15px"  }}
                                    onClick={() => {
                                        this.DownloadGMTemplateM();
                                    }}
                                >
                                    通用模版（小规模）
                                </a>
                            </div>
                            2、选择文件进行导入。
                        </div>
                        <div style = {{fontSize: "12px"}}><span style={{ color: "#f17712"}}> 温馨提醒 ：</span> </div>
                        <div style = {{fontSize: "12px"}}>1、 缺少发票类型或者发票代码、发票号码、开票日期的发票不能导入哦！</div>
                        <div style = {{fontSize: "12px"}}>2、模版支持增值税专票、增值税普票。</div>
                        <div style={{marginTop:"20px",}}>
                            <Form.Item>
                                <span style = {{color: "#333",marginLeft: "60px"  }}>上传文件：</span>
                                <Input
                                    className="inv-app-batch-purchase-list-import-modal-input-zzs"
                                    placeholder="请选择文件"
                                    value = {this.state.tysfile}
                                    style = {{ display: "inline-block",
                                        width: "210px",
                                        verticalAlign: "middle",
                                    }}
                                />
                                <Upload onChange = {this.zzsUploadChange}
                                        accept = '.xls, .xlsx'
                                        action = '/v1/edf/file/upload'
                                        showUploadList = {false}
                                        beforeUpload = {this.beforeUpload}
                                        headers = {this.getAccessToken()}
                                        style = {{ display: "inline-block",
                                            verticalAlign: "middle"
                                        }}
                                >
                                    <Button type="primary">选择文件</Button>
                                </Upload>
                            </Form.Item>
                        </div>
                        <div>
                            <div className="inv-app-batch-purchase-list-import-modal-hg-bottom-left"
                                 onClick={()=> { this.destroyAll("tys") }}
                            >
                                返回选择
                            </div>
                            <div className="inv-app-batch-purchase-list-import-modal-hg-bottom-right">
                                <Button key="submit"
                                        type="primary"
                                        style={{
                                            marginRight: "15px"
                                        }}
                                        onClick={()=>{
                                            this.readyImport("tys",false)
                                        }}>
                                    导入
                                </Button>
                                <Button key="back"
                                        onClick={()=>{
                                            this.destroyAll("tys")
                                            this.destroyImportModal()
                                        }}>
                                    取消
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )
        });
    }
    //增值税文件改变触发的回调
    zzsUploadChange = info => {
        const file = info.file;
        if (!file.status) return;
        if (!this.state.zzsCanUpload) return;
        if (file.status === "done") {
            // this.metaAction.sf("data.loading", false);
            const response = file.response;
            if (response.error && response.error.message) {
                this.metaAction.toast("error", response.error.message);
            } else if (response.result && response.value) {
                this.setState({
                    zzsfile:response.value,
                    tysfile:response.value,
                    zzsOriginalName:response.value.originalName,
                    disabled: false
                })
                document.querySelectorAll(
                    ".inv-app-batch-purchase-list-import-modal-input-zzs"
                )[0].value = response.value.originalName;
            }
            return true;
        } else if (info.file.status === "error") {
            this.metaAction.toast("error", "上传失败");
            return false;
        }
    };
    zzsUploadChange2 = info => {
        // console.log("uploadChange",info)
        const file = info.file;
        if (!file.status) return;
        if (!this.state.zzsCanUpload) return;
        if (file.status === "done") {
          /*  this.metaAction.sf("data.loading", false);*/
            const response = file.response;
            if (response.error && response.error.message) {
                this.metaAction.toast("error", response.error.message);
            } else if (response.result && response.value) {
                this.setState({
                    zzsfile2:response.value,
                    zzsOriginalName2:response.value.originalName
                })
                document.querySelectorAll(
                    ".inv-app-batch-purchase-list-import-modal-input-zzs2"
                )[0].value = response.value.originalName;
            }
        } else if (info.file.status === "error") {
            this.metaAction.toast("error", "上传失败");
        }
    };
    //海关文件改变触发的回调
    hgUploadChange = info => {
        const file = info.file;
        if (!file.status) return;
        if (!this.state.hgCanUpload) return;
        if (file.status === "done") {
           /* this.metaAction.sf("data.loading", false);*/
            const response = file.response;
            if (response.error && response.error.message) {
                this.metaAction.toast("error", response.error.message);
            } else if (response.result && response.value) {
                this.setState({
                    hgfile:response.value,
                    hgOriginalName:response.value.originalName
                })
                document.querySelectorAll(
                    ".inv-app-batch-purchase-list-import-modal-input-hg"
                )[0].value = response.value.originalName;
            }
        } else if (info.file.status === "error") {
            this.metaAction.toast("error", "上传失败");
        }
    };
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
            let a = `${type}CanUpload`
            this.setState({
                a:false
            })
            await this.metaAction.modal("info", {
                title: "导入",
                okText: "确定",
                content: <div>导入文件过大，请分拆后再导入。</div>
            });
            return false;
        }
           this.setState({
               a:true
           })
    };
    //上传必须发送的token
    getAccessToken = () => {
        let token = fetch.getAccessToken();
        return {
            token
        };
    };
    //关闭第二个导入的Modal
    destroyAll = type => {
        this.setState({
            zzsfile: "",
            tysfile: "",
            zzsfile2:undefined,
            hgfile: "",
            zzsOriginalName:'',
            zzsOriginalName2:'',
            hgOriginalName:'',
        })
        let node = document.querySelector(
            `.inv-app-batch-purchase-list-import-modal-${type}`
        ).parentNode.parentNode;
        node.parentNode.removeChild(node);
    };
    //关闭Modal
    destroyImportModal = () => {
        let node = document.querySelector(
            ".inv-app-batch-purchase-list-import-modal"
        );
        let maskNodes = document.querySelectorAll(".ant-modal-mask")[0];
        maskNodes.parentNode.parentNode.removeChild(maskNodes.parentNode);
        node.parentNode.removeChild(node);
    };
    //文件以选择好 继续导入
    readyImport = async (type, isInfo) => {
        let file
        if(type == 'zzs') file = this.state.zzsfile
        if(type == 'tys') file = this.state.tysfile
        if(type == 'hg') file = this.state.hgfile
        let file2 = this.state.zzsfile2
        if (isInfo && file !== "" && file2 === undefined) {
            return this.metaAction.modal("confirm", {
                width: 400,
                okText: "继续导入",
                cancelText: "返回选择",
                onOk: () => {
                    this.destroyAll(type);
                    this.destroyImportModal();
                    this.formalImport(type, this.state.zzsfile);
                },
                content: (
                    <span>
                        缺少发票清单，导入后会缺少认证、用途、管理等发票状态。您确定要继续导入吗？{" "}
                    </span>
                )
            });
        } else {
            if (file !== "") {
                this.destroyAll(type);
                this.destroyImportModal();
                return await this.formalImport(type,file);
            } else {
                return this.metaAction.toast("warning", "请选择文件");
            }
        }
    };
    //向后台发送上传请求 正式导入
    formalImport = async (type,file) => {
        let file2

        const  invoiceVersion = this.props.invoiceVersion
        if (this.state.zzsfile2 != undefined) {
            file2 = this.state.zzsfile2
        }
        if (file) {
            const currentOrg = this.metaAction.context.get("currentOrg") || {},
                nsrsbh = currentOrg.vatTaxpayerNum,
                skssq = this.metaAction.gf("data.skssq").format("YYYYMM");
            let res;
            this.metaAction.sf("data.loading", true);
            if (type === "zzs") {
                if (invoiceVersion === 1) {
                    res = await this.webapi.invoice.bizInvoiceExcelImport({
                        id: file.id, //文件流对象id
                        id2: file2 != undefined ? file2.id : undefined,
                        fplx: "jxfp", //发票类型（jxfp：进项发票；xxfp：销项发票）
                        skssq, //税款所属期（报税月份-1）
                        nsrsbh //纳税人识别号
                    });
                } else {
                    res = await this.webapi.invoice.bizInvoiceExcelImport2({
                        id: file.id, //文件流对象id
                        id2: file2 != undefined ? file2.id : undefined,
                        fplx: "jxfp", //发票类型（jxfp：进项发票；xxfp：销项发票）
                        skssq, //税款所属期（报税月份-1）
                        nsrsbh //纳税人识别号
                    });
                }
            }else if (type === "tys"){
                res = await this.webapi.invoice.bizInvoiceExcelImportCustom({
                    id: file.id, //文件流对象id
                    fplx: "jxfp", //发票类型（jxfp：进项发票；xxfp：销项发票）
                    skssq, //税款所属期（报税月份-1）
                    nsrsbh //纳税人识别号
                });
            }else {
                res = await this.webapi.invoice.bizInvoiceExcelImportJxfp({
                    id: file.id, //文件流对象id
                    fplx: "jxfp", //发票类型（jxfp：进项发票；xxfp：销项发票）
                    skssq, //税款所属期（报税月份-1）
                    nsrsbh, //纳税人识别号
                    fileInfo: {
                        //文件详细信息
                        originalName: file.originalName,
                        type: file.type,
                        size: file.size,
                        suffix: file.suffix
                    }
                });
            }
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
                let swVatTaxpayer = this.props.swVatTaxpayer;
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
                    console.log(res);
                    await this.metaAction.modal("success", {
                        okText: "确定",
                        afterClose: this.props.load(),
                        width: 500,
                        content: (
                            <div>
                                {(type === "zzs" || type === "tys") && (
                                    <div>
                                        导入进项发票成功：共导入发票
                                        {res.importData.fpzs_total}张。
                                    </div>
                                )}
                                {(type === "zzs" || type === "tys") && (
                                    <div>
                                        {topContent}
                                        {bottomContent}
                                    </div>
                                )}
                                {type === "hg" && hgContnent}
                            </div>
                        )
                    });
                }
                return;
            }
        } else {
            this.metaAction.toast("warning", "请选择文件");
            return false;
        }
    };
    // 下载海关票模板
    DownloadTemplate = async () => {
        const nsrsbh = this.props.nsrsbh
        let a = {
            fplx: "jxfp",
            fpzlDm: "13",
            nsrsbh
        };
        await this.webapi.invoice.downloadTemplate(a);
    };
    // 设置2.0增值税状态
    visibleZzsImport = ()=>{
        this.setState({
            visibleZzsImport:false,
            visibleZzsImportSimple:false
        })
    }
    // 下载一般与小规模模板
    DownloadGMTemplateS = async ()=>{
        let a = {
            fplx:"jxfp",
            downloadMode:'YBNSRZZS'
        }
        await this.props.webapi.invoice.downloadCustomTemplate(a);
    }
    DownloadGMTemplateM = async ()=>{
        let a = {
            fplx:"jxfp",
            downloadMode:'XGMZZS'
        }
        await this.props.webapi.invoice.downloadCustomTemplate(a);
    }
    render() {
    let swVatTaxpayer  = this.props.swVatTaxpayer
        let invoiceVersion = this.props.invoiceVersion
        return (
            <div>
                <div style={{ padding: "20px 50px" }}>
                    <div style={{paddingBottom: "20px"}}><strong>请选择您要导入的发票</strong></div>
                    { swVatTaxpayer === '0' && invoiceVersion===1&& <div className= {`inv-app-batch-purchase-list-import-type-div`}
                                                                       onClick={this.changeImportType.bind(this,"zzs")}>
                        <div className= {`inv-app-batch-purchase-list-import-type1`}
                             style={{ display: "inline-block", verticalAlign: "middle" }}></div>
                        <span style={{ display: "inline-block", verticalAlign: "middle" }}>{invoiceVersion === 1 && <span>增值税发票选择确认平台（勾选确认）下载的发票</span> }{invoiceVersion === 2 && <span>增值税发票综合服务平台下载的发票</span> }</span>
                        <Icon type="right" style={{ float: "right", lineHeight: "3"}}></Icon>
                    </div>}
                    {invoiceVersion===2&& <div className= {`inv-app-batch-purchase-list-import-type-div`}
                                               onClick={this.changeImportType.bind(this,"zzs")}>
                        <div className= {`inv-app-batch-purchase-list-import-type1`}
                             style={{ display: "inline-block", verticalAlign: "middle" }}></div>
                        <span style={{ display: "inline-block", verticalAlign: "middle" }}>{invoiceVersion === 2 && <span>增值税发票综合服务平台下载的发票</span> }</span>
                        <Icon type="right" style={{ float: "right", lineHeight: "3"}}></Icon>
                    </div>}
                    <div className= {`inv-app-batch-purchase-list-import-type-div2`}
                         onClick={this.changeImportType.bind(this,"hg")}>
                        <div className= {`inv-app-batch-purchase-list-import-type2`}
                             style={{ display: "inline-block", verticalAlign: "middle" }}></div>
                        <span style={{ display: "inline-block", verticalAlign: "middle" }}>海关进口增值税专用缴款书</span>
                        <Icon type="right"  style={{ float: "right", lineHeight: "3" }}></Icon>
                    </div>
                    <div className= {`inv-app-batch-purchase-list-import-type-div`}
                         onClick={this.changeImportType.bind(this,"ty")}>
                        <div className= {`inv-app-batch-purchase-list-import-type1`}
                             style={{ display: "inline-block", verticalAlign: "middle" }}></div>
                        <span style={{ display: "inline-block", verticalAlign: "middle" }}>通用模板</span>
                        <Icon type="right" style={{ float: "right", lineHeight: "3"}}></Icon>
                    </div>
                </div>
                <Modal
                    title={'导入'}
                    className={'inv-app-batch-purchase-list-import-modal-zzs'}
                    width={600}
                    visible={this.state.visibleZzsImport}
                    footer={null}
                >
                    <div style = {{ lineHeight: 2,fontSize:"12px" }}>
                        <div><strong style = {{ fontSize:"15px", color: "#333" }}>支持导入：增值税发票综合服务平台下载的发票</strong></div>
                        <div><strong style = {{ color: "#333" }}>导入步骤：</strong></div>
                        <div>1、请登录 增值税发票综合服务平台下载发票</div>
                        <div>（1）下载发票主表： 路径-“下载发票” </div>
                        <div>（2）下载发票清单：路径-“抵扣勾选-抵扣勾选统计”，下载“确认签名”后发票清单。 </div>
                        <div>2、解压下载文件   </div>
                        <div>3、选择解压后文件进行导入   </div>
                        <div style={{ color: "#f17712" }}>温馨提示：</div>
                        <div>1、缺少发票主表，不能导入。</div>
                        <div>2、缺少发票清单，导入后会缺少认证、用途、管理等发票状态。</div>
                        <div>3、缺少发票类型 或 发票代码、发票号码、开票日期的发票不能导入哦！</div>
                        <div style = {{ color: "red" }}>4、请不要修改下载文件的内容</div>
                        <div>
                            <Form.Item>
                                <span style = {{color: "#333" }}>上传文件：</span>
                                <Input
                                    className="inv-app-batch-purchase-list-import-modal-input-zzs"
                                    placeholder="请选择发票主表"
                                    //value = {this.metaAction.gf('data.zzxOriginalName')}
                                    style = {{ display: "inline-block",
                                        width: "330px",
                                        verticalAlign: "middle"
                                    }}
                                />
                                <Upload onChange = {this.zzsUploadChange}
                                        accept = '.xls, .xlsx'
                                        action = '/v1/edf/file/upload'
                                        showUploadList = {false}
                                        beforeUpload = {()=>{}}
                                        headers = {this.getAccessToken()}
                                        style = {{ display: "inline-block",
                                            verticalAlign: "middle"
                                        }}
                                >
                                    <Button type="primary" >选择文件</Button>
                                </Upload>
                            </Form.Item>
                        </div>
                        <div>
                            <Form.Item>
                                <span style = {{color: "#333" }}>上传文件：</span>
                                <Input
                                    className="inv-app-batch-purchase-list-import-modal-input-zzs2"
                                    placeholder="请选择发票清单"
                                    //value = {this.metaAction.gf('data.zzxOriginalName')}
                                    style = {{ display: "inline-block",
                                        width: "330px",
                                        verticalAlign: "middle"
                                    }}
                                />
                                <Upload onChange = {this.zzsUploadChange2}
                                        accept = '.xls, .xlsx'
                                        action = '/v1/edf/file/upload'
                                        showUploadList = {false}
                                    //beforeUpload = {this.zzxBeforeUpload}
                                        headers = {this.getAccessToken()}
                                        style = {{ display: "inline-block",
                                            verticalAlign: "middle"
                                        }}
                                >
                                    <Button type="primary" >选择文件</Button>
                                </Upload>
                            </Form.Item>
                        </div>
                        <div>
                            <div className="inv-app-batch-purchase-list-import-modal-zzs-bottom-left"
                                 onClick={()=> { this.visibleZzsImport() }}
                            >
                                返回选择
                            </div>
                            <div className="inv-app-batch-purchase-list-import-modal-zzs-bottom-right">
                                <Button key="submit"
                                        type={this.state.disabled === true? 'dashed' :"primary"}
                                        style={{
                                            marginRight: "15px"
                                        }}
                                        onClick={()=>{this.readyImport("zzs",true)}}
                                        className="inv-app-batch-purchase-list-import-modal-zzs-bottom-right-Button"
                                        disabled= {this.state.disabled}
                                >
                                    导入
                                </Button>
                                <Button key="back"
                                        onClick={()=>{
                                            this.destroyAll("zzs")
                                            this.destroyImportModal()
                                        }}>
                                    取消
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal
                    title={'导入'}
                    className={'inv-app-batch-purchase-list-import-modal-zzs'}
                    width={500}
                    style={{top: 15}}
                    visible={this.state.visibleZzsImportSimple}
                    footer={null}
                >
                    <div style = {{lineHeight: 2, color: "#333",fontSize: "12px" }}>
                        <div style={{fontSize: "15px" }}><strong> 支持导入 增值税发票综合服务平台下载的发票。</strong></div>
                        <div><strong> 导入步骤：</strong></div>
                        <div style = {{fontSize: "12px"}}>1、登录“增值税发票综合服务平台” –“下载发票”，下载发票文件</div>
                        <div style = {{fontSize: "12px"}}>2、解压下载文件</div>
                        <div style = {{fontSize: "12px"}}>3、选择解压后 文件 进行导入</div>
                        <div style = {{fontSize: "12px"}}><span style={{ color: "#f17712" }}> 温馨提醒 ：</span> </div>
                        <div style = {{fontSize: "12px"}}>1、 缺少发票类型或者发票代码、发票号码、开票日期的发票不能导入哦！</div>
                        <div style = {{fontSize: "12px",color:'red'}}>2、请不要修改下载文件的内容</div>
                        <div style={{marginTop:"20px"}}>
                            <Form.Item>
                                <span style = {{color: "#333" }}>上传文件：</span>
                                <Input
                                    className="inv-app-batch-purchase-list-import-modal-input-zzs"
                                    placeholder="请选择文件"
                                    //value = {this.metaAction.gf('data.originalName')}
                                    style = {{ display: "inline-block",
                                        width: "210px",
                                        verticalAlign: "middle",
                                    }}
                                />
                                <Upload onChange = {this.zzsUploadChange}
                                        accept = '.xls, .xlsx'
                                        action = '/v1/edf/file/upload'
                                        showUploadList = {false}
                                        beforeUpload = {this.beforeUpload}
                                        headers = {this.getAccessToken()}
                                        style = {{ display: "inline-block",
                                            verticalAlign: "middle"
                                        }}
                                >
                                    <Button type="primary">选择文件</Button>
                                </Upload>
                            </Form.Item>
                        </div>
                        <div style={{marginTop:"180px"}}>
                            <div className="inv-app-batch-purchase-list-import-modal-hg-bottom-left"
                                 onClick={()=> { this.visibleZzsImport() }}
                            >
                                返回选择
                            </div>
                            <div className="inv-app-batch-purchase-list-import-modal-hg-bottom-right">
                                <Button key="submit"
                                        type={this.state.disabled === true? 'dashed' :"primary"}
                                        style={{
                                            marginRight: "15px"
                                        }}
                                        disabled= {this.state.disabled}
                                        onClick={()=>{
                                            this.readyImport("zzs",false)
                                        }}>
                                    导入
                                </Button>
                                <Button key="back"
                                        onClick={()=>{
                                            this.destroyAll("zzs")
                                            this.destroyImportModal()
                                        }}>
                                    取消
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        
            
        )
    }
}

export default ChoseImportType