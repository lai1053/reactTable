import React from "react"
import { Icon } from "antd"
// import { Input } from 'edf-component';
import { path } from "edf-utils"
import PackageAndOrder from "./PackageAndOrder"
export default class OrderList extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
        }
        this.metaAction = props.metaAction
        this.webapi = props.webapi
        this.bovmsCssId = "bovmsBlueThemeOrderBuy"
    }
    componentDidMount() {
        this.loadCss()
        this.initPage()
    }
    loadCss() {
        if (window.moduleManifest) {
            const fileName = `mergeBlueTheme.${window.moduleManifest.nowtime}.css`
            const links = document.querySelectorAll("link")
            let link
            for (let i = 0; i < links.length; i++) {
                if (links[i] && String(links[i].href).indexOf(fileName) > -1) {
                    link = links[i]
                    link.href = `${window.txtDomain}/mergeModule/${fileName}`
                    break
                }
            }
            if (!link && !document.getElementById(this.bovmsCssId)) {
                link = document.createElement("link")
                link.rel = "stylesheet"
                link.type = "text/css"
                link.href = `${window.txtDomain}/mergeModule/${fileName}`
                link.id = this.bovmsCssId
                document.head.appendChild(link)
            }
            // window.txtDomain + window.moduleManifest.bovms["bovmsBlueTheme.css"]
        }
    }
    async initPage() {
        this.setState({ loading: true })
        await this.webapi.portal.init()
        const portalRes = await this.webapi.portal.portal()
        // const orgRes = await this.webapi.portal.updateCurrentOrgDto({
        //     orgId: portalRes.org.id,
        //     internalCall: true,
        //     isReturnValue: true,
        // })
        if (portalRes) {
            this.setState({
                currentOrg: portalRes.org,
                currentUser: portalRes.user,
                // userId: orgRes && orgRes.value && orgRes.value.token && orgRes.value.token.userId,
                loading: false,
            })
        }
    }
    // 退出
    onLoginOut() {
        this.props.onLoginOut && this.props.onLoginOut()
    }
    render() {
        const { currentUser, currentOrg, loading } = this.state
        const { name, id, ucCusId } = currentOrg || {}
        const { imgAccessUrl, nickname, mobile, ucUserId, id: userId } = currentUser || {}
        const logo_jchl = appBasicInfo.assetUrl
                ? appBasicInfo.assetUrl + "/logo_login_jc.png"
                : "./vendor/img/transparent/logo_login.png",
            logo_jcdz = appBasicInfo.assetUrl
                ? appBasicInfo.assetUrl + "/logo_login_xdz.png"
                : "./vendor/img/transparent/logo_login.png",
            version = path.getVersion()
        const pgAndOrderProps = {
            ...this.props,
            orgId: id,
            ucCusId,
            userId,
            nickname,
            requestIsComplete: !loading,
        }
        return (
            <React.Fragment>
                <div className="bovms-app-order-list-header">
                    <div className="bovms-app-order-list-header-left">
                        <img src={logo_jchl} alt="金财互联" className="-logo" />
                        <div className="-split"></div>
                        <img src={logo_jcdz} alt="金财代账" className="-logo" />
                    </div>
                    <div className="bovms-app-order-list-header-right">
                        <span>{name}</span>
                        {imgAccessUrl ? (
                            <img src={imgAccessUrl} alt="头像" className="-avatar" />
                        ) : (
                            <span className="-default-avatar"></span>
                        )}
                        <span>{nickname}</span>
                        <span className="-btn" onClick={::this.onLoginOut}>
                            <Icon
                                type="tuichu"
                                fontFamily="edficon"
                                className="edficon edficon-tuichu"
                            />
                            退出
                        </span>
                    </div>
                </div>
                <div className="bovms-app-order-list-content">
                    {!loading && <PackageAndOrder {...pgAndOrderProps} />}
                </div>
                <div className="bovms-app-order-list-footer">
                    <span>{appBasicInfo.name}</span>
                    <span>{version}</span>
                    <span> 版权所有 © 2018 {appBasicInfo.companyName}</span>
                    <span>{appBasicInfo.copyright1}</span>
                    <a target="_blank" href={appBasicInfo.beianDomain}>
                        {appBasicInfo.copyright2}
                    </a>
                    <span>{appBasicInfo.copyright3}</span>
                </div>
            </React.Fragment>
        )
    }
}
