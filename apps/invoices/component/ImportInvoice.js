import React from "react"
import { Radio, Form, Input, Button, Spin } from "antd"
import { Upload } from "edf-component"
import { fetch } from "edf-utils"

class ImportInvoice extends React.Component {
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
            fileSource: 1,
            file1: "",
            file2: "",
        }
    }
    handleFileSourceChange(e) {
        this.setState({
            fileSource: e.target.value,
            file1: "",
            file2: "",
        })
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

    //上传必须发送的token
    getAccessToken() {
        let token = fetch.getAccessToken()
        return {
            token,
        }
    }

    // 导入校验
    importFile = async () => {
        const { file1, file2, fileSource, swVatTaxpayer } = this.state
        let condition = true
        switch (fileSource) {
            case 1:
            case 4:
                if (
                    (swVatTaxpayer == "0" && !file1 && !file2) ||
                    (swVatTaxpayer == "1" && !file1)
                ) {
                    condition = false
                }
                break
            case 2:
            case 3:
                if (!file1) {
                    condition = false
                }
                break
        }
        if (!condition) {
            return this.metaAction.toast("warning", "请选择文件")
        }
        return await this.formalImport()
    }
    //开始导入
    formalImport = async () => {
        // return this.metaAction.toast("info", "开发中，敬请期待")
        const { file1, file2, fileSource, fplx, swVatTaxpayer, nsrsbh, skssq } = this.state
        let data = {
            id: file1 != "" ? file1.id : undefined, //文件流对象id
            id2: file2 != "" ? file2.id : undefined,
            fplx, //发票类型（jxfp：进项发票；xxfp：销项发票）
            skssq, //税款所属期（报税月份-1）
            nsrsbh, //纳税人识别号
        }
        if (fileSource === 2 && fplx === "jxfp") {
            data.fileInfo = {
                //进项海关模板详情
                originalName: file1.originalName,
                type: file1.type,
                size: file1.size,
                suffix: file1.suffix,
            }
        }
        let apiFn = ""
        this.setState({ loading: true })
        switch (fileSource) {
            case 1:
                apiFn = "bizInvoiceExcelImport2" // 进销项增值税平台
                break
            case 2:
                apiFn = fplx === "jxfp" ? "bizInvoiceExcelImportJxfp" : "bizInvoiceExcelImport"
                // 进项海关
                // 销项开票系统
                break
            case 3:
                apiFn = "bizInvoiceExcelImportCustom" // 进销项通用模板
                break
            case 4:
                apiFn = "bizInvoiceExcelImport10" // 进销项农产品
                break
        }
        const res = await this.webapi.invoice[apiFn](data)
        this.setState({ loading: false })
        //处理结果
        if (res.error) {
            await this.metaAction.modal("warning", {
                title: "提示",
                className: "inv-app-batch-purchase-list-import-modal-error",
                okText: "确定",
                content: "上传失败，请重新上传",
            })
            return false
        } else if (
            res.importData &&
            !res.importData.sfcjcg &&
            !res.importData.fpzs_total &&
            !res.invalidSeq
        ) {
            await this.metaAction.modal("warning", {
                title: "提示",
                okText: "确定",
                content: res.importData.msg,
            })
            return false
        } else {
            const successImportCounts = (
                <strong>{(res.importData && res.importData.fpzs_total) || 0}</strong>
            )
            const reset = await this.metaAction.modal("success", {
                title: "导入结果",
                okText: "确定",
                afterClose: this.props.load(),
                width: 500,
                content: (
                    <React.Fragment>
                        {!res.invalidSeq ? <p>已成功导入 {successImportCounts} 张！</p> : null}
                        {res.invalidSeq ? (
                            <p>
                                已成功导入 {successImportCounts} 张，但存在未导入记录，请下载查看！
                            </p>
                        ) : null}
                        {res.invalidSeq ? (
                            <p>
                                <a onClick={this.downloadError(res.invalidSeq)}>下载未导入结果</a>
                            </p>
                        ) : null}
                    </React.Fragment>
                ),
            })
            reset && this.props.closeModal()
        }
    }
    // 下载失败结果
    downloadError = invalidSeq => async e => {
        await this.props.webapi.invoice.downlodExportImportFailedExcel({ invalidSeq: invalidSeq })
    }
    // 下载模板
    downloadTemplate = fpzlDm => async e => {
        // return this.metaAction.toast("info", "开发中，敬请期待")
        // 01:进项-通用模板1；03：进项-通用模板2; 13:进项-通用模板3；18：进项-通用模板4)
        await this.props.webapi.invoice.downloadCustomTemplate({
            fplx: this.props.fplx,
            fpzlDm,
        })
    }
    renderUploadFile(lable, placeholder, fileValue, uploadType = "file1") {
        const _filevalue = (fileValue && fileValue.originalName) || undefined
        return (
            <p className="inv-app-upload-form">
                <lable> {lable}：</lable>
                <Input placeholder={placeholder} value={_filevalue} readonly="readonly"></Input>
                <Upload
                    onChange={this.UploadChange.bind(this, uploadType)}
                    accept=".xls, .xlsx"
                    action="/v1/edf/file/upload"
                    showUploadList={false}
                    headers={this.getAccessToken()}>
                    <Button type="primary">选择文件</Button>
                </Upload>
            </p>
        )
    }
    renderBusinessTips(fileSource, swVatTaxpayer) {
        const title = <p style={{ color: "#f17712" }}>业务提示：</p>
        const arrow = <i className="inv-app-icon-arrow-right" />
        switch (fileSource) {
            case 1:
                // 发票综合平台
                return (
                    <React.Fragment>
                        {title}
                        <p>
                            1、登录“<a onClick={this.gotoTaxPlatform}>增值税发票综合服务平台</a>
                            ”导出文件，导出路径如下：
                        </p>
                        <p style={{ textIndent: "20px" }}>
                            发票信息：发票管理{arrow}发票下载{arrow}查询结果{arrow}下载；
                        </p>
                        {swVatTaxpayer == "0" && (
                            <p style={{ textIndent: "20px" }}>
                                认证清单1：抵扣勾选{arrow}抵扣勾选统计{arrow}发票清单{arrow}
                                查询明细下载；
                            </p>
                        )}
                        {swVatTaxpayer == "0" && (
                            <p style={{ textIndent: "20px" }}>
                                认证清单2：退税勾选{arrow}退税勾选统计{arrow}退税发票清单{arrow}
                                查询明细下载；
                            </p>
                        )}
                        <p>2、解压文件，选择解压后的文件导入</p>
                        {swVatTaxpayer == "0" && (
                            <p style={{ textIndent: "20px" }}>
                                未认证发票，仅导入发票信息文件即可；
                            </p>
                        )}
                        {swVatTaxpayer == "0" && (
                            <p style={{ textIndent: "20px" }}>
                                已认证发票，请导入发票信息和认证清单文件。
                            </p>
                        )}
                    </React.Fragment>
                )
            case 2:
                // 海关国贸窗口
                return (
                    <React.Fragment>
                        {title}
                        <p>
                            1、登录“
                            <a target="_blank" href="https://www.singlewindow.cn/">
                                中国国际贸易单－窗口
                            </a>
                            ”导出文件，导出路径如下：
                        </p>
                        <p style={{ textIndent: "20px" }}>
                            标准版应用{arrow}货物申报{arrow}数据查询／统计
                        </p>
                        <p>2、选择文件导入</p>
                    </React.Fragment>
                )
            case 3:
                // 通用模版
                return (
                    <React.Fragment>
                        {title}
                        <p>1、下载通用模版，支持的发票种类如下：</p>
                        <p style={{ textIndent: "20px" }}>
                            <a onClick={this.downloadTemplate("01")}>模版1：</a>
                            支持增值税专票、普票、通行费、农产品发票、其他票据；
                        </p>
                        <p style={{ textIndent: "20px" }}>
                            <a onClick={this.downloadTemplate("03")}>模版2：</a>
                            支持机动车、二手车销售发票；
                        </p>
                        <p style={{ textIndent: "20px" }}>
                            <a onClick={this.downloadTemplate("13")}>模版3：</a>
                            支持海关缴款书、代扣代缴缴款书；
                        </p>
                        {swVatTaxpayer == "0" && (
                            <p style={{ textIndent: "20px" }}>
                                <a onClick={this.downloadTemplate("18")}>模版4：</a>
                                支持旅客运输票；
                            </p>
                        )}
                        <p>2、录入数据，选择文件导入</p>
                    </React.Fragment>
                )
            case 4:
                // 开票系统（农产品）
                return (
                    <React.Fragment>
                        {title}
                        <p>1、登录“开票软件（航信／百望）”导出文件，导出路径如下：</p>
                        <p style={{ textIndent: "20px" }}>
                            航信：汇总处理－发票数据导出－发票数据导出／清单发票数据导出；
                        </p>
                        <p style={{ textIndent: "20px" }}>
                            百望：系统设置－系统参数设置－发票批量导出－查询－导出
                        </p>
                        <p>2、请选择“农产品收购发票”文件导入</p>
                        <p style={{ textIndent: "20px" }}>
                            如果有清单，请同时选择发票信息和清单文件；
                        </p>
                        {swVatTaxpayer == "0" && (
                            <p>
                                3、数据自动归集到上述发票属期（如实际数据的开票月份比它大，则归集到开票月份）
                            </p>
                        )}
                        {swVatTaxpayer == "0" && (
                            <p>4、认证状态默认已认证，且抵扣月份默认等于发票属期。</p>
                        )}
                    </React.Fragment>
                )
        }
    }
    renderOperationContent(fileSource, swVatTaxpayer, file1, file2) {
        const tips = this.renderBusinessTips(fileSource, swVatTaxpayer)
        switch (fileSource) {
            case 1:
                return (
                    <React.Fragment>
                        {this.renderUploadFile("发票信息文件", "请选择发票信息文件", file1)}
                        {swVatTaxpayer == "0" &&
                            this.renderUploadFile(
                                "认证清单文件",
                                "请选择认证清单文件",
                                file2,
                                "file2"
                            )}
                        {tips}
                    </React.Fragment>
                )
            case 2:
                return (
                    <React.Fragment>
                        {this.renderUploadFile("发票信息文件", "请选择发票信息文件", file1)}
                        {tips}
                    </React.Fragment>
                )
            case 3:
                return (
                    <React.Fragment>
                        {this.renderUploadFile("导入文件", "请选择文件", file1)}
                        {tips}
                    </React.Fragment>
                )
            case 4:
                return (
                    <React.Fragment>
                        {this.renderUploadFile("发票信息文件", "请选择发票信息文件", file1)}
                        {swVatTaxpayer == "0" &&
                            this.renderUploadFile(
                                "发票清单文件",
                                "请选择发票清单文件",
                                file2,
                                "file2"
                            )}
                        {tips}
                    </React.Fragment>
                )
        }
    }
    gotoTaxPlatform = async () => {
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
    render() {
        const { loading, fileSource, file1, file2, swVatTaxpayer, skssq } = this.state
        return (
            <Spin spinning={loading} tip={`正在处理数据，请稍后…`} delay={0.01}>
                <div style={{ background: "white", borderRadius: "4px" }}>
                    <div style={{ padding: "20px 30px" }}>
                        <p>
                            <strong>文件来源：</strong>
                        </p>
                        <p>
                            <Radio.Group
                                onChange={::this.handleFileSourceChange}
                                value={fileSource}>
                                <Radio value={1}>发票综合平台</Radio>
                                <Radio value={2}>海关国贸窗口</Radio>
                                <Radio value={4}>开票系统（农产品）</Radio>
                                <Radio value={3}>通用模版</Radio>
                            </Radio.Group>
                        </p>
                        {fileSource === 4 && swVatTaxpayer == "0" && <p>发票属期：{skssq}</p>}
                        {this.renderOperationContent(fileSource, swVatTaxpayer, file1, file2)}
                    </div>
                    <div
                        style={{
                            padding: "0px 12px",
                            height: 55,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            borderTop: "1px solid #e8e8e8",
                        }}>
                        <Button
                            key="submit"
                            type="primary"
                            style={{
                                marginRight: "8px",
                            }}
                            onClick={this.importFile}>
                            导入
                        </Button>
                        <Button
                            key="back"
                            onClick={() => {
                                this.props.closeModal()
                            }}>
                            取消
                        </Button>
                    </div>
                </div>
            </Spin>
        )
    }
}

export default ImportInvoice

/*
build config.js 加入返回 即可测试
if (url && url.indexOf("import/bizInvoiceExcelImportCustom") > -1) {
    return {
        invalidSeq: 257991031349248, //导入失败下载失败原因流水号
        importData: {
            sfcjcg: true,
            sfcjz: true,
            fpzs_total: 10,
        },
    }
}
 */
