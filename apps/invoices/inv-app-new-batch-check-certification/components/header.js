import React, { useEffect } from "react"
import { Radio, Divider } from "antd"
import { Button, Icon } from "edf-component"
import videoImg from "../img/video.png"
import { fromJS } from "immutable"
import { addEvent, removeEvent } from "../../utils/index"
import FilterForm from "./filter"
const videoId = "inv-batch-check-certification-video-object"

const openHelp = async props => {
    const ret = await props.metaAction.modal("show", {
        title: "",
        className: "ttk-edf-app-help-modal-content",
        wrapClassName: "ttk-edf-app-help-modal",
        footer: null,
        width: 840, //静态页面宽度840小于会有横向滚动条
        children: props.metaAction.loadApp("ttk-edf-app-help", {
            store: props.store,
            code: "inv-app-check-certification-list-3" // 查询页面对应参数
        })
    })
}

const isFullscreenEnabled = () => {
    var requestFullscreen =
        document.body.requestFullscreen ||
        document.body.webkitRequestFullscreen ||
        document.body.mozRequestFullScreen ||
        document.body.msRequestFullscreen
    var fullscreenEnabled =
        document.fullscreenEnabled ||
        document.mozFullScreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.msFullscreenEnabled
    return !!(requestFullscreen && fullscreenEnabled)
}

const openFullscreen = () => {
    const element = document.getElementById(videoId)
    if (!element) return
    if (element.requestFullscreen) {
        element.requestFullscreen()
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen()
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen()
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullScreen()
    }
}
const toVideo = async props => {
    const ret = await props.metaAction.modal("show", {
        title: (
            <div>
                操作视频
                {isFullscreenEnabled() ? (
                    <a style={{ marginLeft: "20px" }} onClick={openFullscreen}>
                        全屏播放
                    </a>
                ) : null}
            </div>
        ),
        style: { top: 5 },
        bodyStyle: { padding: "0" },
        footer: null,
        width: 1024,
        children: (
            <object>
                <embed
                    id={videoId}
                    className="inv-batch-check-certification-video-embed"
                    allowFullScreen
                    webkitAllowFullScreen={true}
                    width="100%"
                    height="600px"
                    src="//player.polyv.net/videos/player.swf?vid=52245012735a8893e6837c2e7be69a0d_5"
                    controls="controls"
                ></embed>
            </object>
        )
    })
}
const onFullScreenChange = () => {
    const fullscreenElement =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullscreenElement ||
        document.msFullscreenElement
    if (fullscreenElement) {
        fullscreenElement.width = window.screen.availWidth
        fullscreenElement.height = window.screen.availHeight
    } else {
        const element = document.getElementById(videoId)
        element.width = "100%"
        element.height = "600px"
    }
}
const getFullScreenChangeName = () => {
    let name = "fullscreenchange"
    if (document.body.webkitRequestFullscreen) name = "webkit" + name
    if (document.body.mozRequestFullScreen) name = "moz" + name
    if (document.body.msRequestFullscreen) name = "ms" + name
    return name
}
export default function InvBatchCheckCertificationHeadeer(props) {
    const {
        params,
        defaultParams,
        checked,
        batchSubmit,
        initPage,
        metaAction
    } = props
    const onCheckedChange = async e => {
        let val = {
            checked: e.target.value,
            params: {
                ...defaultParams
            }
        }
        // 不是全部，连接状态默认不传
        if (e.target.value !== null) {
            val.params.clientState = 4
            val.params.totalSignState = null
        }
        await metaAction.sfs({
            "data.checked": val.checked,
            "data.params": fromJS(val.params)
        })
        initPage && initPage()
    }
    // 条件搜索
    const onSearch = async values => {
        await metaAction.sfs({
            "data.params": fromJS(values)
        })
        initPage && initPage()
    }
    useEffect(() => {
        addEvent(document.body, getFullScreenChangeName(), onFullScreenChange)
        return () => {
            removeEvent(
                document.body,
                getFullScreenChangeName(),
                onFullScreenChange
            )
        }
    }, [])
    return (
        <div className="inv-app-new-batch-check-certification-header">
            <div className="inv-app-new-batch-check-certification-header-left">
                <FilterForm
                    key={"filter-form-" + (checked || 3)}
                    {...props}
                ></FilterForm>

                <Radio.Group
                    onChange={onCheckedChange}
                    value={checked}
                    style={{
                        paddingLeft: "24px",
                        paddingRight: "8px",
                        verticalAlign: "middle"
                    }}
                >
                    <Radio value={null}>全部</Radio>
                    <Radio value={1}>可签名</Radio>
                </Radio.Group>
            </div>
            <div className="inv-app-new-batch-check-certification-header-right">
                {checked === null ? (
                    <React.Fragment>
                        <Icon
                            type="question-circle"
                            theme="filled"
                            style={{
                                color: "#fe9400",
                                fontSize: "16px",
                                cursor: "pointer"
                            }}
                            onClick={openHelp.bind(this, props)}
                        />
                        <Divider type="vertical" />
                        <a onClick={toVideo.bind(this, props)}>
                            <img
                                src={videoImg}
                                style={{
                                    marginRight: "4px"
                                }}
                            />
                            操作视频
                        </a>
                        <Divider type="vertical" />
                        <a
                            href="http://download.etaxcn.com/ycs/plugin/XdzInvoAuthSetup.exe"
                            download="发票管理工具.exe"
                            target="_blank"
                        >
                            下载发票管理工具
                        </a>
                    </React.Fragment>
                ) : (
                    ""
                )}

                {Number(checked) ? (
                    <React.Fragment>
                        <Button
                            type="primary"
                            onClick={batchSubmit.bind(this, "batchBooked")}
                        >
                            批量预约签名
                        </Button>
                        <Divider type="vertical" />
                        <Button
                            type="primary"
                            onClick={batchSubmit.bind(this, "batchStatistics")}
                        >
                            批量签名
                        </Button>
                    </React.Fragment>
                ) : (
                    ""
                )}
            </div>
        </div>
    )
}
