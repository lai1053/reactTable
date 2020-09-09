import React from "react"
import { Icon, Button, Spin } from "antd"
// import { Input } from 'edf-component';
import VirtualTable from "../../../invoices/components/VirtualTable"
import OrderDetails from "./OrderDetails"
import CountDown from "./CountDown"
import { number } from "edf-utils"
import moment from "moment"

const payStatusMap = {
    0: "无需付款",
    1: "待付款",
    2: "付款中",
    3: "部分付款",
    4: "已付款",
    5: "代付款",
    6: "付款失败",
}

export default class PackageAndOrder extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            tabIndex: 1,
            packageList: [],
            orderList: [],
            canGotoPortal: false,
            loading: true,
        }
        this.metaAction = props.metaAction
        this.webapi = props.webapi
    }
    componentDidMount() {
        this.props.requestIsComplete && this.initPage()
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.requestIsComplete) {
            this.initPage()
        }
    }
    initPage() {
        // 根据路由是否有 payWay 和 signKey 参数来判断，是支付完进入，还是其他方式
        let tabIndex = 1
        if (location.href && location.href.indexOf("from=pay") > -1) {
            tabIndex = 2
        }
        this.loadTabData(tabIndex)
    }
    handleTabClick = index => e => this.loadTabData(index)
    analysisSkuPriceList(list) {
        if (Array.isArray(list)) {
            return list.map(m => ({
                ...m,

                households: Array.isArray(m.pricingAttributeGroup)
                    ? m.pricingAttributeGroup[1].attributeValueName
                    : "0",
            }))
        }
        return []
    }
    async loadTabData(tabIndex) {
        this.setState({ loading: true })
        let resEnum = await this.webapi.order.findByEnumId({ enumId: 200049 })
        // 临时屏蔽 金财代账专业版(慧用车2020)产品
        resEnum = Array.isArray(resEnum) ? resEnum.filter(f => f.id != 2000490004) : []
        let goodsList = [],
            goodsListRes = [],
            resOrder,
            orderList,
            canGotoPortal
        if (tabIndex === 2 && Array.isArray(resEnum)) {
            // 获取订单信息，暂时后台未提供批量查询商品信息接口，只能多次请求
            resEnum.forEach(item => {
                goodsListRes.push(
                    this.webapi.order.querySkuPriceListByGoods({
                        goodsCode: item.code,
                    })
                )
            })
            ;(await Promise.all(goodsListRes)).forEach(res => {
                if (res) {
                    goodsList.push({ ...res, goodsSkuList: JSON.parse(res.goodsSkuList || "[]") })
                }
            })
            resOrder = await this.webapi.order.queryNewOrderByCusAndGoods({
                customerId: this.props.ucCusId,
                serviceStatus: -1,
            })
        }
        if (resOrder) {
            const nowTime = moment().valueOf()
            orderList = (resOrder && JSON.parse(resOrder.orderCenterOrders || "[]")) || []
            orderList = orderList.filter(
                f =>
                    (f.serviceStatus < 3 && f.orderStatus < 3 && f.payStatus !== 1) ||
                    (f.payStatus === 1 &&
                        moment(Number(f.orderTime)).add(1, "days").valueOf() > nowTime)
            )
            canGotoPortal = orderList.some(s => s.serviceStatus == 2)
        }
        this.setState({
            packageList: resEnum || [],
            orderList,
            tabIndex,
            goodsList,
            canGotoPortal,
            loading: false,
        })
    }
    openDetails = async (title, data = {}) => {
        const orderDetailsProps = {
            ...this.props,
            ...data,
        }
        console.log(orderDetailsProps)
        const ret = await this.metaAction.modal("show", {
            title,
            wrapClassName: "bovms-app-order-modal-wrap",
            width: 700,
            height: 450,
            footer: null,
            style: { top: 25 },
            bodyStyle: { padding: "20px 30px" },
            children: <OrderDetails {...orderDetailsProps} />,
        })
        if (ret && ret.reload) {
            this.loadTabData(2)
        }
    }
    handlePay = (goodsItem, skuItem, record) => async e => {
        const { orgId, userId } = this.props,
            retUrl = location.origin + "/vendor/xdzPay.html",
            payNotifyUrl = location.origin + "/v1/edf/ordercenter/paynotifyurl",
            isTrial =
                this.getPackageType({
                    name: goodsItem.goodsName || "",
                }) === "trial", //试用套餐
            apiFn = isTrial ? "createXdzOrder" : "xdzPcPayAndUpdateOrder",
            options = {
                id: (isTrial && orgId) || undefined,
                amount: skuItem && skuItem.price,
                orgId: (!isTrial && orgId) || undefined,
                skuId: skuItem && skuItem.goodsSkuId,
                userId: (!isTrial && userId) || undefined,
                goodsQuantity: (!isTrial && 1) || undefined,
                payRetUrl: (!isTrial && retUrl) || undefined,
                payNotifyUrl: (!isTrial && payNotifyUrl) || undefined,
                needUrlSuffix: (!isTrial && 1) || undefined,
                businessOrderNo:
                    (record && record.payStatus === 1 && record.businessOrderNo) || undefined,
            }
        this.setState({ loading: true })
        const res = await this.webapi.order[apiFn](options)
        this.setState({ loading: false })
        if (res) {
            if (!isTrial && String(res).indexOf("http") > -1) {
                this.metaAction.sfs({
                    "data.isPay": true,
                    "data.payUrl": res,
                })
                // window.location.href = res
            } else {
                this.loadTabData(2)
            }
        }
    }
    cancelOrder = order => async e => {
        let confirm = await this.metaAction.modal('confirm', {
            content: '确定要取消订单吗?'
        })
        if(!confirm) { return }
        this.setState({ loading: true })
        const res = await this.webapi.order.cancelOrder({
            businessOrderNo: order.businessOrderNo,
            channel: order.channel,
            userId: this.props.userId,
        })
        this.setState({ loading: false })
        if (res) {
            this.loadTabData(2)
        }
    }
    toBuy = item => e => {
        this.openDetails("订购套餐", { item, requestType: "buy" })
    }
    lookDetails = (goodsItem, skuItem, orderItem) => e => {
        this.openDetails("查看订单详情", { goodsItem, skuItem, orderItem, requestType: "look" })
    }
    getPackageType(item) {
        // 后台接口未能返回产品类型，暂时先用名称进行区分
        if (item.name.indexOf("标准版") > -1) {
            return "standard"
        } else if (item.name.indexOf("专业版") > -1) {
            return "professional"
        } else if (item.name.indexOf("试用版") > -1) {
            return "trial"
        }
        return "other"
    }
    renderList() {
        const { packageList, orderList, tabIndex, goodsList } = this.state
        if (tabIndex === 1 && Array.isArray(packageList) && packageList[0] && packageList[0].code) {
            return packageList
                .sort((a, b) => a.code.substring(2) - b.code.substring(2))
                .map((item, index) => {
                    const type = this.getPackageType(item)
                    return (
                        <div className={"-package-list " + type} key={index}>
                            <div className="-title">{item.name}</div>
                            <div className="-line"></div>
                            <div className="-price">
                                {type === "standard" && (
                                    <React.Fragment>
                                        <strong>4,000.00</strong>元起／年
                                    </React.Fragment>
                                )}
                                {type === "professional" && (
                                    <React.Fragment>
                                        <strong>9,000.00</strong>元起／年
                                    </React.Fragment>
                                )}
                                {type === "trial" && (
                                    <React.Fragment>
                                        免费试用<strong>60天</strong>
                                    </React.Fragment>
                                )}
                            </div>
                            <div className="-specifications">
                                {type === "standard" && (
                                    <React.Fragment>
                                        <div>业财税一体，自动记账报税</div>
                                        <div>智能、批量采集发票，智能解析对账单</div>
                                        <div>智能、完整的账表功能</div>
                                        <div>强大、稳定的账表功能</div>
                                        <div>稳定快速的申报通道，批量申报，智能风控报告</div>
                                    </React.Fragment>
                                )}
                                {type === "professional" && (
                                    <React.Fragment>
                                        <div>标准版全部功能</div>
                                        <div>多维度运营管理、业务管控</div>
                                        <div>360度全景客户服务</div>
                                    </React.Fragment>
                                )}
                                {type === "trial" && (
                                    <React.Fragment>
                                        <div>功能不受限，与专业版相同</div>
                                        <div>可随时升级为正式版本</div>
                                        <div>数据保留，升级正式版本后可立即使用</div>
                                    </React.Fragment>
                                )}
                            </div>
                            <Button className="-btn" shape="round" onClick={this.toBuy(item)}>
                                {type === "trial" ? "立即试用" : "立即订购"}
                            </Button>
                        </div>
                    )
                })
        } else if (tabIndex === 2 && Array.isArray(orderList)) {
            if (orderList.length) return <div>{this.renderOrderTable()}</div>
            return (
                <div className="no-data">
                    <div className="img"></div>
                    <div className="ashing">暂无订单记录</div>
                </div>
            )
        }
        return null
    }
    renderOrderTable() {
        const { orderList, goodsList } = this.state

        return orderList.map(record => {
            const { skuId, goodsId, orderTime, payStatus, payAmount, orderId } = record
            const goodsItem = goodsList.find(f => f.goodsId == goodsId) || {},
                goodsType = this.getPackageType({
                    ...goodsItem,
                    name: goodsItem.goodsName || "",
                }),
                skuItem =
                    (goodsItem &&
                        goodsItem.goodsSkuList &&
                        goodsItem.goodsSkuList.find(ff => ff.goodsSkuId == skuId)) ||
                    {}
            let className =
                "-order-list " +
                (payStatus === 0 || payStatus === 4 ? "success " : "error ") +
                (payStatus === 1 ? "lock-size" : "")
            return (
                <div className={className} data-status={payStatusMap[payStatus]} key={orderId}>
                    <div className="-goods">
                        <div className="-card">
                            <div className={"-left " + goodsType}></div>
                            <div className="-right">
                                <div className="-name">{goodsItem.goodsName}</div>
                                <div className="-ashing">
                                    {moment(Number(orderTime)).format("YYYY-MM-DD HH:mm:ss")}
                                </div>
                            </div>
                        </div>
                        <div className="-sku">
                            {skuItem.pricingAttributeGroup &&
                                skuItem.pricingAttributeGroup[0].attributeValueName +
                                    "／" +
                                    skuItem.pricingAttributeGroup[1].attributeValueName}
                        </div>
                    </div>
                    <div className="-price">¥{number.addThousPos(payAmount, true, true)}</div>
                    <div className="-action">
                        {payStatus === 1 && (
                            <Button
                                type="primary"
                                onClick={this.handlePay(goodsItem, skuItem, record)}>
                                立即支付
                            </Button>
                        )}
                        {payStatus === 1 && (
                            <CountDown startTime={orderTime} reload={() => this.loadTabData(2)} />
                        )}
                        <a onClick={this.lookDetails(goodsItem, skuItem, record)}>订单详情</a>
                        {payStatus !== 0 && payStatus !== 4 && (
                            <a onClick={this.cancelOrder(record)}>取消订单</a>
                        )}
                    </div>
                </div>
            )
        })
    }
    // 立即使用
    onGotoPortal() {
        this.props.onGotoPortal && this.props.onGotoPortal()
    }
    render() {
        const { canGotoPortal, tabIndex, loading } = this.state
        return (
            <Spin spinning={loading} wrapperClassName="-bovms-app-order-spin">
                <div className="-tab-container">
                    <span
                        className={tabIndex === 1 ? "active" : ""}
                        onClick={this.handleTabClick(1)}>
                        订购套餐
                    </span>
                    <span
                        className={tabIndex === 2 ? "active" : ""}
                        onClick={this.handleTabClick(2)}>
                        我的订单
                    </span>
                </div>
                {tabIndex === 1 && <div className="-tab-tips">请选择您需要订购的套餐</div>}
                <div className="-list">{this.renderList()}</div>
                {canGotoPortal && (
                    <Button
                        type="primary"
                        className="-fixed-bottom"
                        size="large"
                        onClick={::this.onGotoPortal}>
                        立即使用
                    </Button>
                )}
            </Spin>
        )
    }
}
