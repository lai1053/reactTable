import React from "react"
import { Collapse, Radio, Form, Input, Button, Spin } from "antd"
import { LoadingMask, Upload } from "edf-component"
import { fetch } from "edf-utils"

const { Panel } = Collapse

class NewImportInvoice extends React.Component {
    constructor(props) {
        super(props)
        this.metaAction = props.metaAction || {}
        this.webapi = props.webapi || {}
        this.state = {
            fplx: props.fplx,
            swVatTaxpayer: props.swVatTaxpayer, // 0一般纳税人 1 小规模
            skssq: props.skssq,
            nsrsbh: props.nsrsbh,
            loading: false,
            radioValue: "1",
            file1: "",
            file2: "",
        }
        if (props.setOkListener) {
            props.setOkListener(this.onOk)
        }
    }

    onOk = async () => {
        const { file1, file2, radioValue, fplx, swVatTaxpayer, nsrsbh, skssq } = this.state
        if (radioValue != 2) {
            if (file1 === "") {
                this.metaAction.toast("warning", "请选择文件")
                return false
            }
        } else {
            if (file1 === "" && file2 === "") {
                this.metaAction.toast("warning", "请选择文件")
                return false
            }
        }

        let data = {
            id: file1 != "" ? file1.id : undefined, //文件流对象id
            id2: file2 != "" ? file2.id : undefined,
            fplx, //发票类型（jxfp：进项发票；xxfp：销项发票）
            skssq, //税款所属期（报税月份-1）
            nsrsbh, //纳税人识别号
            fileInfo:
                radioValue === "2" && fplx === "jxfp"
                    ? {
                          //进项海关模板详情
                          originalName: file1.originalName,
                          type: file1.type,
                          size: file1.size,
                          suffix: file1.suffix,
                      }
                    : undefined,
        }
        let res, reset
        this.setState({ loading: true })
        //进销项发票请求
        if (fplx) {
            switch (radioValue) {
                case "1":
                    res = await this.webapi.invoice.bizInvoiceExcelImport2(data) // 进销项增值税平台
                    break
                case "2":
                    if (fplx === "jxfp") {
                        res = await this.webapi.invoice.bizInvoiceExcelImportJxfp(data) // 进项海关
                    } else {
                        res = await this.webapi.invoice.bizInvoiceExcelImport(data) // 销项开票系统
                    }
                    break
                case "3":
                    res = await this.webapi.invoice.bizInvoiceExcelImportNetwork(data) // 网络开票
                    break
                case "4":
                    res = await this.webapi.invoice.bizInvoiceExcelImportCustom(data) // 进销项通用模板
                    break
            }
        }
        this.setState({ loading: false })
        //处理结果
        if (res.error) {
            reset = await this.metaAction.modal("warning", {
                title: "提示",
                className: "inv-app-batch-purchase-list-import-modal-error",
                okText: "确定",
                content: "上传失败，请重新上传",
            })
            return
        } else if (res.invalidSeq) {
            // 上传失败 且有下载结果
            reset = await this.metaAction.modal("warning", {
                title: "发票导入失败",
                className: "inv-app-batch-purchase-list-import-modal-error",
                okText: "确定",
                content: (
                    <div>
                        <a
                            style={{ color: "#0066B3" }}
                            onClick={() => {
                                this.downloadError(res.invalidSeq)
                            }}>
                            下载失败结果
                        </a>
                    </div>
                ),
            })
            return true
        } else if (res && !res.importData.sfcjcg) {
            reset = await this.metaAction.modal("warning", {
                title: "提示",
                okText: "确定",
                content: <div>{res.importData.msg}</div>,
            })
            return
        } else if (res && res.importData.sfcjcg) {
            let title = `导入${this.state.fplx === "jxfp" ? "进项" : "销项"}发票成功：共导入${
                    res.importData.fpzs_total
                }张`,
                map = {},
                dest = [],
                modalOption = {
                    okText: "确认",
                }
            res.importData.dataList.forEach(item => {
                if (!map[item.fpzldm]) {
                    dest.push(item)
                    map[item.fpzldm] = item
                } else {
                    let index = dest.findIndex(f => f.fpzldm == item.fpzldm)
                    dest[index] = {
                        fpzldm: dest[index].fpzldm,
                        fpzlmc: dest[index].fpzlmc,
                        fpzs_yrz: dest[index].fpzs_yrz + item.fpzs_yrz,
                        fpzs_wrz: dest[index].fpzs_wrz + item.fpzs_wrz,
                        fpzs_total: dest[index].fpzs_total + item.fpzs_total,
                    }
                }
            })

            let innerContent, otherContent
            if (swVatTaxpayer === "0" && fplx === "jxfp") {
                innerContent = dest.map(item => {
                    if (item.fpzs_total > 0) {
                        if (
                            item.fpzldm === "01" ||
                            item.fpzldm === "03" ||
                            item.fpzldm === "17" ||
                            item.fpzldm === "18" ||
                            item.fpzldm === "13"
                        ) {
                            return (
                                <div>{`${item.fpzlmc} ${item.fpzs_total} 张  （已认证 ${item.fpzs_yrz} 张，未认证 ${item.fpzs_wrz} 张）`}</div>
                            )
                        } else {
                            return <div>{`${item.fpzlmc} ${item.fpzs_total} 张`}</div>
                        }
                    }
                })
            } else {
                innerContent = dest.map(item => {
                    if (item.fpzs_total > 0) {
                        return <div>{`${item.fpzlmc} ${item.fpzs_total} 张`}</div>
                    }
                })
            }
            if (
                res.importData.fpzs_sk > 0 ||
                res.importData.fpzs_zf > 0 ||
                res.importData.fpzs_yc > 0 ||
                res.importData.fpzs_glzt_yc > 0
            ) {
                otherContent = (
                    <div>
                        <div>另外：</div>
                        {res.importData.fpzs_yc ? (
                            <div>发票状态-异常发票 {res.importData.fpzs_yc} 张</div>
                        ) : (
                            ""
                        )}
                        {res.importData.fpzs_sk ? (
                            <div>发票状态-失控发票 {res.importData.fpzs_sk} 张</div>
                        ) : (
                            ""
                        )}
                        {res.importData.fpzs_zf ? (
                            <div>发票状态-作废发票 {res.importData.fpzs_zf} 张</div>
                        ) : (
                            ""
                        )}
                        {res.importData.fpzs_glzt_yc ? (
                            <div>管理状态-异常发票 {res.importData.fpzs_glzt_yc}张</div>
                        ) : (
                            ""
                        )}
                    </div>
                )
            }

            modalOption.content = (
                <div>
                    <div style={{ marginBottom: "10px" }}>
                        {innerContent}
                        {otherContent}
                    </div>
                </div>
            )
            reset = await this.metaAction.modal("success", {
                okText: "确定",
                afterClose: this.props.load(),
                width: 500,
                content: (
                    <div>
                        {title}
                        {modalOption.content}
                        {res.invalidSeq && (
                            <p>
                                部分发票导入失败{" "}
                                <a
                                    style={{ color: "#0066B3" }}
                                    onClick={this.downloadError.bind(this, res.invalidSeq)}>
                                    下载失败结果
                                </a>
                            </p>
                        )}
                    </div>
                ),
            })
            if (reset) {
                this.props.closeModal()
            }
        }
    }
    // 选择文件后的回调
    UploadChange = async (type, info) => {
        const file = info.file
        if (!file.status) return
        if (file.status === "done") {
            const response = file.response
            if (response.result != true) {
                this.metaAction.toast("error", "文件上传失败")
            } else if (response.result && response.value) {
                this.setState({
                    [type]: response.value,
                })
            }
        } else if (info.file.status === "error") {
            this.metaAction.toast("error", "上传失败")
        }
    }
    // 下载失败结果
    downloadError = async invalidSeq => {
        await this.props.webapi.invoice.downlodExportImportFailedExcel({ invalidSeq: invalidSeq })
    }
    // 下载模板
    DownloadTemplate = async (key, fpzlDm) => {
        let fplx = this.props.fplx
        let downloadMode = this.props.swVatTaxpayer === "0" ? "YBNSRZZS" : "XGMZZS"
        if (key === "YBNSRZZS" || key === "XGMZZS") {
            await this.props.webapi.invoice.downloadCustomTemplate({ fplx, downloadMode, fpzlDm })
        }
        if (key === "hg") {
            await this.webapi.invoice.downloadTemplate({
                fplx,
                fpzlDm: "13",
                nsrsbh: this.props.nsrsbh,
            })
        }
        if (key === "SHILI") {
            this.props.metaAction.modal("show", {
                title: "示例",
                width: 1260,
                footer: null,
                children: (
                    <div>
                        <div className="inv-app-batch-import-shili"></div>
                    </div>
                ),
            })
        }
    }
    denglu = async () => {
        const res = await this.webapi.invoice.getOrgAddressFromSj({
            orgId: this.props.qyId,
            linkCode: 1200515,
        })
        if (res) {
            window.open(res)
        } else {
            this.metaAction.toast("error", "发票综合服务平台打开失败，原因：未获取到有效的地址！")
        }
    }
    //上传必须发送的token
    getAccessToken() {
        let token = fetch.getAccessToken()
        return {
            token,
        }
    }

    render() {
        const { loading, radioValue, file1, file2 } = this.state
        return (
            <Spin spinning={loading} tip={`正在处理数据，请稍后…`} delay={0.01}>
                <div style={{ padding: "18px" }}>
                    <p>
                        <strong>文件来源：</strong>
                    </p>
                    <Radio.Group
                        onChange={e => {
                            this.setState({ radioValue: e.target.value, file1: "", file2: "" })
                        }}
                        value={radioValue}>
                        <Radio value={"1"}>发票综合平台</Radio>
                        <Radio value={"2"}>防伪开票系统</Radio>
                        <Radio value={"3"}>网络开票系统</Radio>
                        <Radio value={"4"}>通用模板</Radio>
                    </Radio.Group>
                    <p style={{ marginTop: "1em" }}>
                        <p className="inv-app-upload-form">
                            <label> {radioValue != 2 ? "导入文件：" : "发票信息文件："}</label>
                            <Input
                                readonly="readonly"
                                placeholder={radioValue != 2 ? "请选择文件" : "请选择发票信息文件"}
                                value={file1 ? file1.originalName : undefined}></Input>
                            <Upload
                                onChange={this.UploadChange.bind(this, "file1")}
                                accept=".xls, .xlsx"
                                action="/v1/edf/file/upload"
                                showUploadList={false}
                                headers={this.getAccessToken()}>
                                <Button type="primary">选择文件</Button>
                            </Upload>
                        </p>
                        {radioValue === "2" && (
                            <p className="inv-app-upload-form">
                                <label> 发票清单文件：</label>
                                <Input
                                    readonly="readonly"
                                    placeholder={
                                        radioValue != 2 ? "请选择文件" : "请选择发票清单文件"
                                    }
                                    value={file2 ? file2.originalName : undefined}></Input>
                                <Upload
                                    onChange={this.UploadChange.bind(this, "file2")}
                                    accept=".xls, .xlsx"
                                    action="/v1/edf/file/upload"
                                    showUploadList={false}
                                    headers={this.getAccessToken()}>
                                    <Button type="primary">选择文件</Button>
                                </Upload>
                            </p>
                        )}
                    </p>
                    <p style={{ color: "#f17712" }}>业务提示：</p>
                    {radioValue === "1" && (
                        <div>
                            <p>
                                1、登录{" "}
                                <a
                                    style={{ color: "#0066B3" }}
                                    onClick={() => {
                                        this.denglu()
                                    }}>
                                    “增值税发票综合服务平台”
                                </a>
                                导出文件，导出路径如下：
                            </p>
                            <p style={{ paddingLeft: "1.2rem" }}>
                                发票管理－发票下载－查询结果－下载；
                            </p>
                            <p>2、解压文件，选择解压后的文件导入</p>
                        </div>
                    )}
                    {radioValue === "2" && (
                        <div>
                            <p>1、登录“开票软件（航信/百望）”导出文件，导出路径如下：</p>
                            <p style={{ paddingLeft: "1.2rem" }}>
                                航信：汇总处理－发票数据导出－发票数据导出/清单发票数据导出；
                            </p>
                            <p style={{ paddingLeft: "1.2rem" }}>
                                百望：系统设置－系统参数设置－发票批量导出－查询－导出。
                            </p>
                            <p>2、选择文件导入</p>
                            <p style={{ paddingLeft: "1.2rem" }}>
                                如果有清单，请同时选择发票信息和清单文件。
                            </p>
                        </div>
                    )}
                    {this.state.radioValue === "3" && (
                        <div>
                            <p>
                                1、登录“国家税务局电子（网络）发票应用系统”导出文件，导出路径如下：
                            </p>
                            <p style={{ paddingLeft: "1.2rem" }}>
                                首页－发票查询－按开票项目查询－导出结果
                            </p>
                            <p>
                                2、补充“税率、货物类型”两列后，再选择文件导入。
                                <a
                                    onClick={() => {
                                        this.DownloadTemplate("SHILI")
                                    }}>
                                    示例
                                </a>
                            </p>
                        </div>
                    )}
                    {this.state.radioValue === "4" && (
                        <div>
                            <p>1、下载通用模板，支持的发票种类如下：</p>
                            <p style={{ paddingLeft: "1.2rem" }}>
                                <a
                                    style={{ color: "#0066B3" }}
                                    onClick={() => {
                                        this.DownloadTemplate("YBNSRZZS", "01")
                                    }}>
                                    模板1
                                </a>
                                ：支持增值税专票、普票、通用机打、未开具；
                            </p>
                            <p style={{ paddingLeft: "1.2rem" }}>
                                <a
                                    style={{ color: "#0066B3" }}
                                    onClick={() => {
                                        this.DownloadTemplate("YBNSRZZS", "03")
                                    }}>
                                    模板2
                                </a>
                                ：支持机动车、二手车销售发票。
                            </p>
                            <p>2、录入数据，选择文件导入</p>
                        </div>
                    )}
                </div>
            </Spin>
        )
    }
}

export default NewImportInvoice
