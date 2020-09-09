import React from "react"
import { Icon, Button, Spin, Checkbox, Select } from "antd"
import moment from "moment"
import { number } from "edf-utils"
// import { Input } from 'edf-component';
const payStatusMap = {
    0: "无需付款",
    1: "待付款",
    2: "付款中",
    3: "部分付款",
    4: "已付款",
    5: "代付款",
    6: "付款失败",
}
// 订单状态
const orderStatusMap = {
    0: "待付款",
    1: "待处理",
    2: "服务中",
    3: "已完成",
    4: "已取消",
    5: "已终止",
    6: "已中止",
}
const serviceStatusMap = {
    0: "未启动",
    1: "待服务",
    2: "服务中",
    3: "已完成",
    4: "已终止",
    5: "已取消",
    6: "已中止",
}
export default class OrderDetails extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            goods: {},
            goodsSkuId: undefined,
            agreement: false,
            orderItem: {},
        }
        this.metaAction = props.metaAction
        this.webapi = props.webapi
    }
    componentDidMount() {
        this.props.requestType === "buy" ? this.initPage() : this.initState()
    }
    initState() {
        const { goodsItem, skuItem, orderItem } = this.props
        const goodsSkuList = this.analysisSkuPriceList([{ ...skuItem }])
        this.setState({
            goods: {
                ...goodsItem,
                goodsSkuList,
            },
            goodsSkuId: skuItem.goodsSkuId,
            orderItem,
            loading: false,
        })
    }
    onAgreementChange(e) {
        this.setState({ agreement: e.target.checked })
    }
    handlePay() {
        this.createOrderOrPay(true)
    }
    handleSubmitOrder() {
        if (!this.state.agreement) {
            this.metaAction.toast("error", "请阅读使用协议，并勾选")
            return
        }
        this.createOrderOrPay()
    }
    async createOrderOrPay(toPay) {
        const { goodsSkuId, goods, orderItem } = this.state,
            { orgId, userId } = this.props,
            retUrl = location.origin + "/vendor/xdzPay.html",
            payNotifyUrl = location.origin + "/v1/edf/ordercenter/paynotifyurl",
            item = goods.goodsSkuList.find(f => f.goodsSkuId == goodsSkuId),
            isTrial = this.getPackageType(goods.goodsName) === "trial", //试用套餐
            apiFn = isTrial ? "createXdzOrder" : "xdzPcPayAndUpdateOrder",
            options = {
                id: (isTrial && orgId) || undefined,
                amount: item && item.price,
                skuId: goodsSkuId,
                goodsSkuId, // 试用版要传
                orgId: (!isTrial && orgId) || undefined,
                userId: (!isTrial && userId) || undefined,
                goodsQuantity: (!isTrial && 1) || undefined,
                payRetUrl: (!isTrial && retUrl) || undefined,
                payNotifyUrl: (!isTrial && payNotifyUrl) || undefined,
                needUrlSuffix: (!isTrial && 1) || undefined,
                businessOrderNo:
                    (orderItem && orderItem.payStatus === 1 && orderItem.businessOrderNo) ||
                    undefined,
            }
        this.setState({ loading: true })
        const res = await this.webapi.order[apiFn](options)
        this.setState({ loading: false })
        if (res) {
            if (toPay && !isTrial && String(res).indexOf("http") > -1) {
                this.props.closeModal()
                this.metaAction.sfs({
                    "data.isPay": true,
                    "data.payUrl": res,
                })
                // window.location.href = res
            } else {
                this.props.closeModal && this.props.closeModal({ reload: true })
            }
        }
    }
    handleCancel() {
        this.props.closeModal && this.props.closeModal()
    }
    async initPage() {
        const { item } = this.props
        this.setState({ loading: true })
        const res = await this.webapi.order.querySkuPriceListByGoods({ goodsCode: item.code })
        if (res) {
            let goodsSkuList = this.analysisSkuPriceList(JSON.parse(res.goodsSkuList || "[]"))
            let filterGoods = goodsSkuList.filter(el => el.households == '100户')
            filterGoods.length && (goodsSkuList = filterGoods)
            this.setState({
                goods: res
                    ? {
                          ...res,
                          goodsSkuList,
                      }
                    : {},
                loading: false,
                goodsSkuId: goodsSkuList && goodsSkuList[0].goodsSkuId,
            })
        }
    }
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
    getPackageType(name) {
        if (!name) return "other"
        // 后台接口未能返回产品类型，暂时先用名称进行区分
        if (name.indexOf("标准版") > -1) {
            return "standard"
        } else if (name.indexOf("专业版") > -1) {
            return "professional"
        } else if (name.indexOf("试用版") > -1) {
            return "trial"
        }
        return "other"
    }
    getHouseholds() {
        const { goods } = this.state
        return (
            (goods &&
                goods.goodsSkuList &&
                goods.goodsSkuList[0] &&
                goods.goodsSkuList[0].households) ||
            ""
        )
    }
    getPeriod(type) {
        let time = moment()
        if (type === "trial") {
            time = time.add(60, "d")
        } else {
            time = time.add(1, "y")
        }
        return time.format("YYYY-MM-DD")
    }
    getGoodsPrice(id, list) {
        if (!id || !Array.isArray(list)) return "0.00"
        const item = list.find(f => f.goodsSkuId == id)
        return item ? number.addThousPos(item.price, true, true) : "0.00"
    }
    handleSelect(v) {
        this.setState({
            goodsSkuId: v,
        })
    }
    render() {
        const { loading, agreement, goods, goodsSkuId, orderItem } = this.state
        const { requestType, nickname, item } = this.props
        const goodsType = this.getPackageType(goods.goodsName),
            period = this.getPeriod(goodsType),
            goodsPrice = this.getGoodsPrice(goodsSkuId, goods.goodsSkuList)

        return (
            <div className="-bovms-app-order-details">
                {requestType !== "buy" && (
                    <div className="-order-item">
                        <div className="-title">
                            订单状态：
                            <span className={orderItem.orderStatus > 1 ? "" : "warning"}>
                                {orderStatusMap[orderItem.orderStatus]}
                            </span>
                        </div>
                        <div className="-context">
                            <span>订单号：{orderItem.orderCode}</span>
                            <span>订单人：{nickname}</span>
                            <span className="-ashing">
                                下单时间：
                                {moment(Number(orderItem.orderTime)).format("YYYY-MM-DD HH:mm:ss")}
                            </span>
                        </div>
                    </div>
                )}
                <div className="-order-item">
                    <div className="-title">商品信息</div>
                    <table>
                        <colgroup>
                            <col />
                            <col style={{ width: 100 }} />
                            <col style={{ width: 100 }} />
                            <col style={{ width: 100 }} />
                        </colgroup>
                        <tr className="th">
                            <th>商品名称</th>
                            <th>使用期限</th>
                            <th>户数限制</th>
                            <th>小计（元）</th>
                        </tr>
                        <tr className="tr">
                            <td>
                                <div className="-card">
                                    <div className={"-left " + goodsType}></div>
                                    <div className="-right">
                                        <div className="-name">{goods.goodsName}</div>
                                        <div className="-ashing">
                                            {moment().format("YYYY-MM-DD")} 至 {period}
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td>{goodsType === "trial" ? "60天" : "1年"}</td>
                            <td>
                                {requestType === "buy" ? (
                                    <Select
                                        value={goodsSkuId}
                                        onChange={::this.handleSelect}
                                        style={{ width: "100%" }}>
                                        {(goods.goodsSkuList || []).map(item => (
                                            <Select.Option
                                                key={item.goodsSkuId}
                                                value={item.goodsSkuId}>
                                                {item.households}
                                            </Select.Option>
                                        ))}
                                    </Select>
                                ) : (
                                    this.getHouseholds()
                                )}
                            </td>
                            <td>{goodsPrice}</td>
                        </tr>
                    </table>
                </div>
                {requestType !== "buy" && orderItem.payStatus !== 1 && (
                    <div className="-order-item">
                        <div className="-title">支付信息</div>
                        <div className="-context">
                            <span>付款单号：{orderItem.businessOrderNo}</span>
                            <span className="-ashing">
                                付款日期：{moment(orderItem.serviceStartDate).format("YYYY-MM-DD")}
                            </span>
                        </div>
                    </div>
                )}
                {requestType !== "buy" && orderItem.payStatus !== 1 && (
                    <div className="-order-item">
                        <div className="-title">
                            服务信息：<span>{serviceStatusMap[orderItem.serviceStatus]}</span>
                        </div>
                        <div className="-context">
                            <span>服务状态：{serviceStatusMap[orderItem.serviceStatus]}</span>
                            <span>
                                开始服务时间：
                                {moment(orderItem.serviceStartDate).format("YYYY-MM-DD HH:mm:ss")}
                            </span>
                            <span>
                                结束服务时间：
                                {moment(orderItem.serviceEndDate).format("YYYY-MM-DD HH:mm:ss")}
                            </span>
                        </div>
                    </div>
                )}
                {   requestType === "buy" && item && !item.name.includes('试用') && 
                    <div className="-tip">
                        温馨提示：如需购买更多户数，请与销售人员联系
                    </div>
                }
                <div className="-total">
                    合计金额：<span>¥</span>
                    {/* <span className="-lg">{goodsPrice.replace(".00", "")}</span> */}
                    <span className="-lg">{goodsPrice.split('.')[0]}</span>
                    <span>.{goodsPrice.substr(-2)}</span>
                </div>
                <div className="-modal-footer">
                    <div className="-left">
                        {requestType === "buy" && (
                            <Checkbox checked={agreement} onChange={::this.onAgreementChange}>
                                我已阅读并同意《
                                <a
                                    target="_blank"
                                    href="https://ttk-prod-jcdz-static.oss-cn-beijing.aliyuncs.com/xdz-help/%E9%87%91%E8%B4%A2%E4%BB%A3%E8%B4%A6%E4%BD%BF%E7%94%A8%E5%8D%8F%E8%AE%AE20200824.pdf">
                                    金财代账用户使用协议
                                </a>
                                》
                            </Checkbox>
                        )}
                    </div>

                    <div className="-right">
                        {requestType === "buy" && (
                            <Button
                                type="primary"
                                loading={loading}
                                onClick={::this.handleSubmitOrder}>
                                提交订单
                            </Button>
                        )}
                        {requestType !== "buy" && orderItem.payStatus == 1 && (
                            <Button type="primary" loading={loading} onClick={::this.handlePay}>
                                立即支付
                            </Button>
                        )}
                        <Button onClick={::this.handleCancel}>
                            {requestType === "buy" ||
                            (requestType !== "buy" && orderItem.payStatus == 1)
                                ? "取消"
                                : "关闭"}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}
