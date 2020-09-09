import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {Modal, Button, Select, DatePicker, Icon, Form, Input} from "antd";
import moment from 'moment'
import {LoadingMask, Upload} from "edf-component";
import {fromJS} from "immutable";
import {fetch} from "edf-utils";
class ChoseImportType extends React.Component {
    constructor(props) {
        super(props)
        this.metaAction = props.metaAction || {};
        this.webapi = props.webapi || {};
        this.state = {
            importType: '',
            file:"",
            canUpload:true, // 判断是都可以上传
            originalName:"",
        }
    }

    changeImportType(value) {
       /* this.props.changeImportType(val)*/
        this.setState({
            importType:value
        })
        if (value === "pt") {
        /*    this.metaAction.sf("data.zzsfile", "");*/
            this.ptImport();
        } else if (value === "xt") {
            /*this.metaAction.sf("data.hgfile", "");*/
            this.xtImport();
        }else if(value === 'ty'){
          /*  this.metaAction.sf("data.zzsfile", "");*/
            this.tyImport()
        }
    }
    //平台开票
    ptImport = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "导入",
            className: "inv-app-batch-purchase-list-import-modal-pt",
            style: { top: 100},
            width: 600,
            footer: false,
            bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
            children: (
                <div
                    style={{
                        padding: "10px 50px",
                        lineHeight: 2,
                        color: "#333",
                        fontSize: "12px",
                        height: '320px'
                    }}
                >
                    <div>
                        <strong>
                            {" "}
                            支持导入 增值税发票综合服务平台下载的发票。
                        </strong>
                    </div>
                    <div>
                        <strong> 导入步骤：</strong>
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        1、登录“增值税发票综合服务平台”
                        –“下载发票”，下载发票文件
                    </div>
                    <div style={{ fontSize: "12px" }}>2、解压下载文件</div>
                    <div style={{ fontSize: "12px" }}>
                        3、选择解压后 文件 进行导入
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        <span style={{ color: "#f17712" }}> 温馨提醒 ：</span>{" "}
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        1、
                        缺少发票类型或者发票代码、发票号码、开票日期的发票不能导入哦！
                    </div>
                    <div style={{ fontSize: "12px", color: "red" }}>
                        2、请不要修改下载文件的内容
                    </div>
                    <div>
                        <Form.Item>
                            <span style={{ color: "#333" }}>上传文件：</span>
                            <Input
                                className="inv-app-batch-purchase-list-import-modal-input"
                                placeholder="请选择文件"
                                //value = {this.metaAction.gf('data.originalName')}
                                value ={this.state.originalName}
                                style={{
                                    display: "inline-block",
                                    width: "210px",
                                    verticalAlign: "middle"
                                }}
                            />
                            <Upload
                                onChange={this.uploadChange}
                                accept=".xls, .xlsx"
                                action="/v1/edf/file/upload"
                                showUploadList={false}
                                beforeUpload={this.beforeUpload}
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
                            className="inv-app-batch-purchase-list-import-modal-hg-bottom-left"
                            onClick={() => {
                                this.destroyAll("pt");
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
                                    this.readyImport("pt");
                                }}
                            >
                                导入
                            </Button>
                            <Button
                                key="back"
                                onClick={() => {
                                    this.destroyAll("pt");
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
    // 系统开票
    xtImport = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "导入",
            className: "inv-app-batch-purchase-list-import-modal-pt",
            style: { top: 100 },
            width: 600,
            footer: false,
            bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
            children: (
                <div
                    style={{
                        padding: "10px 50px",
                        lineHeight: 2,
                        color: "#333",
                        fontSize: "12px",
                        height: '320px'
                    }}
                >
                    <div>
                        <strong>
                            {" "}
                            支持导入： 开票系统（航信、百旺）下载的发票。
                        </strong>
                    </div>
                    <div>
                        <strong> 导入步骤：</strong>
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        1、请先到开票系统下载发票
                    </div>
                    <div style={{ fontSize: "12px" }}>2、选择文件进行导入</div>
                    <div style={{ fontSize: "12px" }}>
                        <span style={{ color: "#f17712" }}> 温馨提醒 ：</span>{" "}
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        1、
                        缺少发票类型或者发票代码、发票号码、开票日期的发票不能导入哦！
                    </div>
                    <div style={{ fontSize: "12px", color: "red" }}>
                        2、请不要修改下载文件的内容
                    </div>
                    <div>
                        <Form.Item>
                            <span style={{ color: "#333" }}>上传文件：</span>
                            <Input
                                className="inv-app-batch-purchase-list-import-modal-input"
                                placeholder="请选择文件"
                                //value = {this.metaAction.gf('data.originalName')}
                                style={{
                                    display: "inline-block",
                                    width: "210px",
                                    verticalAlign: "middle"
                                }}
                            />
                            <Upload
                                onChange={this.uploadChange}
                                accept=".xls, .xlsx"
                                action="/v1/edf/file/upload"
                                showUploadList={false}
                                beforeUpload={this.beforeUpload}
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
                    <div style={{marginTop:"50px"}}>
                        <div
                            className="inv-app-batch-purchase-list-import-modal-hg-bottom-left"
                            onClick={() => {
                                this.destroyAll("pt");
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
                                    this.readyImport("pt");
                                }}
                            >
                                导入
                            </Button>
                            <Button
                                key="back"
                                onClick={() => {
                                    this.destroyAll("pt");
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
    //通用模板开票
    tyImport = async () => {
        const ret = await this.metaAction.modal("show", {
            title: "导入",
            className: "inv-app-batch-purchase-list-import-modal-ty",
            style: { top: 100 },
            width: 600,
            footer: false,
            bodyStyle: { padding: "0px", borderTop: "1px solid #e8e8e8" },
            children: (
                <div
                    style={{
                        padding: "10px 50px",
                        lineHeight: 2,
                        color: "#333",
                        fontSize: "12px",
                        height: '300px'
                    }}
                >
                    <div style={{
                        paddingTop: "20px",
                    }}>
                        <strong> 导入步骤：</strong>
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        1、下载 <a
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
                        </a>，并按模版格式整理数据
                    </div>
                    <div style={{ fontSize: "12px" }}>2、选择文件进行导入</div>
                    <div style={{ fontSize: "12px" }}>
                        <span style={{ color: "#f17712" }}> 温馨提醒 ：</span>
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        1、 缺少发票类型或者发票代码、发票号码、开票日期的发票不能导入哦！
                    </div>
                    <div style={{ fontSize: "12px"}}>
                        2、模版支持增值税专票、增值税普票。
                    </div>
                    <div>
                        <Form.Item>
                            <span style={{ color: "#333" }}>上传文件：</span>
                            <Input
                                className="inv-app-batch-purchase-list-import-modal-input"
                                placeholder="请选择文件"
                                //value = {this.metaAction.gf('data.originalName')}
                                style={{
                                    display: "inline-block",
                                    width: "210px",
                                    verticalAlign: "middle"
                                }}
                            />
                            <Upload
                                onChange={this.uploadChange}
                                accept=".xls, .xlsx"
                                action="/v1/edf/file/upload"
                                showUploadList={false}
                                beforeUpload={this.beforeUpload}
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
                            className="inv-app-batch-purchase-list-import-modal-hg-bottom-left"
                            onClick={() => {
                                this.destroyAll("ty");
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
                                    this.readyImport("ty");
                                }}
                            >
                                导入
                            </Button>
                            <Button
                                key="back"
                                onClick={() => {
                                    this.destroyAll("ty");
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
    DownloadGMTemplateS = async ()=>{
        let a = {
            fplx:"xxfp",
            downloadMode:'YBNSRZZS'
        }
        await this.props.webapi.invoice.downloadCustomTemplate(a);
    }
    DownloadGMTemplateM = async ()=>{
        let a = {
            fplx:"xxfp",
            downloadMode:'XGMZZS'
        }
        await this.props.webapi.invoice.downloadCustomTemplate(a);
    }
    //关闭第二个导入的Modal
    destroyAll = type => {
        this.setState({
            file:"",
            originalName:''
        })
        let node = document.querySelector(
            `.inv-app-batch-purchase-list-import-modal-${type}`
        ).parentNode.parentNode;
        node.parentNode.removeChild(node);
    };
    //关闭Modal
    destroyImportModal = () => {
        this.setState({
            file:"",
            originalName:''
        })
        let node = document.querySelector(
            ".inv-app-batch-purchase-list-import-modal"
        );
        let maskNodes = document.querySelectorAll(".ant-modal-mask")[0];
        maskNodes.parentNode.parentNode.removeChild(maskNodes.parentNode);
        node.parentNode.removeChild(node);
    };
    //文件以选择好 继续导入
    readyImport = async type => {
        let file = this.state.file
        if (file !== "") {
            if (this.props.invoiceVersion === 2) {
                this.destroyAll(type);
            }
            this.destroyImportModal();
            return await this.formalImport();
        } else {
            return this.props.metaAction.toast("warning", "请选择文件");
        }
    };
    //上传文件前的回调
    beforeUpload = async file => {
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
            
            this.metaAction.modal("error", {
                okText: "确定",
                content:
                    "支持导入EXCEL 2003格式，及2003以上版本，请检查文件格式。"
            });
            return false;
        }
        
        this.fileSizeJudge(file);
    };
    //校验文件大小
    fileSizeJudge = async file => {
        const isLt500KB = file.size / 1024 > 500;
        // console.log(file.size / 1024)
        if (file.size && isLt500KB) {
            /*this.metaAction.sf("data.canUpload", false);*/
            this.setState({
                canUpload:false
            })
            await this.metaAction.modal("info", {
                title: "导入",
                className: "inv-app-batch-purchase-list-import-modal",
                okText: "确定",
                content: <div>导入文件过大，请分拆后再导入。</div>
            });
            return false;
        }
        this.setState({
            canUpload:true
        })
    };
    //文件改变触发的回调
    uploadChange = info => {
        const file = info.file;
        if (!file.status) return;
        if (!this.state.canUpload) return;
        if (file.status === "done") {
            this.props.loadingSW(false)
            const response = file.response;
            if (response.error && response.error.message) {
                this.props.metaAction.toast("error", response.error.message);
            } else if (response.result && response.value) {
                this.setState({
                    file:response.value,
                    originalName: response.value.originalName
                })
                document.querySelectorAll(
                    ".inv-app-batch-purchase-list-import-modal-input"
                )[0].value = response.value.originalName;
            }
        } else if (info.file.status === "error") {
            this.props.metaAction.toast("error", "上传失败");
        }
    };
    //上传必须发送的token
    getAccessToken = () => {
        let token = fetch.getAccessToken();
        return {
            token
        };
    };
    //向后台发送上传请求 正式导入
    formalImport = async () => {
        const invoiceVersion  = this.props.invoiceVersion
        let file = this.state.file
        if (file) {
            const {skssq,nsrsbh} = this.props
            this.props.loadingSW(true)
            let type = this.state.importType
            let res;
            if (invoiceVersion === 2 && type === "pt") {
                res = await this.webapi.invoice.bizInvoiceExcelImport2({
                    id: file.id, //文件流对象id
                    fplx: "xxfp", //发票类型（jxfp：进项发票；xxfp：销项发票）
                    skssq, //税款所属期（报税月份-1）
                    nsrsbh //纳税人识别号
                });
            }else if(type === "ty"){
                res = await this.webapi.invoice.bizInvoiceExcelImportCustom({
                    id: file.id, //文件流对象id
                    fplx: "xxfp", //发票类型（jxfp：进项发票；xxfp：销项发票）
                    skssq, //税款所属期（报税月份-1）
                    nsrsbh //纳税人识别号
                });
            }else {
                res = await this.webapi.invoice.bizInvoiceExcelImport({
                    id: file.id, //文件流对象id
                    fplx: "xxfp", //发票类型（jxfp：进项发票；xxfp：销项发票）
                    skssq, //税款所属期（报税月份-1）
                    nsrsbh //纳税人识别号
                });
            }
            this.props.loadingSW(false)
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
                let topContent, bottomContent;
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
                                    <div>通行费发票{fp.txffp.fpzs_total}张</div>
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
                }
                await this.metaAction.modal("success", {
                    okText: "确定",
                    afterClose: this.props.load(),
                    width: 500,
                    content: (
                        <div>
                            <div>
                                导入销项发票成功：共导入发票
                                {res.importData.fpzs_total}张。
                            </div>
                            <div>
                                {topContent}
                                {bottomContent}
                            </div>
                        </div>
                    )
                });
                return;
            }
        } else {
            this.props.metaAction.toast("warning", "请选择文件");
            return false;
        }
    };
    render() {
        return (
            <div>
                {this.props.invoiceVersion ===2 &&  <div style={{ padding: "20px 50px" }}>
                    <div style={{paddingBottom: "20px"}}><strong>请选择您要导入的发票</strong></div>
                    {<div className= {`inv-app-batch-purchase-list-import-type-div`}
                          onClick={this.changeImportType.bind(this,"pt")}>
                        <div className= {`inv-app-batch-purchase-list-import-type1`}
                             style={{ display: "inline-block", verticalAlign: "middle" }}></div>
                        <span style={{ display: "inline-block", verticalAlign: "middle" }}>增值税发票综合服务平台下载的发票</span>
                        <Icon type="right" style={{ float: "right", lineHeight: "3"}}></Icon>
                    </div>}
                    <div className= {`inv-app-batch-purchase-list-import-type-div2`}
                         onClick={this.changeImportType.bind(this,"xt")}>
                        <div className= {`inv-app-batch-purchase-list-import-type2`}
                             style={{ display: "inline-block", verticalAlign: "middle" }}></div>
                        <span style={{ display: "inline-block", verticalAlign: "middle" }}>开票系统（航信、百旺）下载的发票</span>
                        <Icon type="right"  style={{ float: "right", lineHeight: "3" }}></Icon>
                    </div>
                    <div className= {`inv-app-batch-purchase-list-import-type-div`}
                         onClick={this.changeImportType.bind(this,"ty")}>
                        <div className= {`inv-app-batch-purchase-list-import-type1`}
                             style={{ display: "inline-block", verticalAlign: "middle" }}></div>
                        <span style={{ display: "inline-block", verticalAlign: "middle" }}>通用模板</span>
                        <Icon type="right" style={{ float: "right", lineHeight: "3"}}></Icon>
                    </div>
                </div>}
                {this.props.invoiceVersion === 1 && <div className={`inv-app-batch-purchase-list-import-modal`}>
                    <div
                        style={{
                            padding: "10px 50px",
                            lineHeight: 2,
                            color: "#333"
                        }}
                    >
                        <div>
                            <strong>
                                {" "}
                                支持导入 开票系统（航信、百旺）下载的发票。
                            </strong>
                        </div>
                        <div>
                            <strong> 导入步骤：</strong>
                        </div>
                        <div style={{ fontSize: "12px" }}>
                            1、请先到开票系统下载发票
                        </div>
                        <div style={{ fontSize: "12px" }}>2、选择文件进行导入</div>
                        <div style={{ fontSize: "12px" }}>
                            <span style={{ color: "#f17712" }}> 温馨提醒 ：</span>
                            1、
                            缺少发票类型或者发票代码、发票号码、开票日期的发票不能导入哦！{" "}
                        </div>
                        <div style={{ fontSize: "12px", marginLeft: "65px" }}>
                            {" "}
                            <strong>
                                2、请不要对导出的原始文件做任何修改！
                            </strong>{" "}
                        </div>
                        <div>
                            <Form.Item>
                                <span style={{ color: "#333" }}>上传文件：</span>
                                <Input
                                    className="inv-app-batch-purchase-list-import-modal-input"
                                    placeholder="请选择文件"
                                    //value = {this.metaAction.gf('data.originalName')}
                                    value={this.state.originalName}
                                    style={{
                                        display: "inline-block",
                                        width: "210px",
                                        verticalAlign: "middle"
                                    }}
                                />
                                <Upload
                                    onChange={this.uploadChange}
                                    accept=".xls, .xlsx"
                                    action="/v1/edf/file/upload"
                                    showUploadList={false}
                                    beforeUpload={this.beforeUpload}
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
                        <div className="inv-app-batch-purchase-list-import-modal-zzs-bottom-right">
                            <Button
                                key="submit"
                                type="primary"
                                style={{
                                    marginRight: "15px"
                                }}
                                onClick={() => {
                                    this.readyImport();
                                }}
                            >
                                导入
                            </Button>
                            <Button
                                key="back"
                                onClick={() => {
                                    this.destroyImportModal();
                                }}
                            >
                                取消
                            </Button>
                        </div>
                    </div>
                </div>}
            </div>
        )
    }
}

export default ChoseImportType