/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    portal: {
        init: () => fetch.post("/v1/edf/dzgl/init"),
        portal: () => fetch.post("/v1/edf/dzgl/initPortal"),
        updateCurrentOrgDto: option => fetch.post("/v1/edf/org/updateCurrentOrgDto", option),
    },
    user: {
        logout: () => fetch.post("/v1/edf/user/logout"),
    },
    order: {
        //根据这个接口查询新代账在商务平台存在的产品
        findByEnumId: option => fetch.post("/v1/edf/enumDetail/findByEnumId", option),
        // 根据产品编码查询商务平台产品数据接口
        querySkuPriceListByGoods: option =>
            fetch.post("/v1/edf/ordercenter/querySkuPriceListByGoods", option),
        //查询订单接口
        queryNewOrderByCusAndGoods: option =>
            fetch.post("/v1/edf/ordercenter/queryNewOrderByCusAndGoods", option),
        //创建试用订单
        createXdzOrder: option => fetch.post("/v1/edf/org/createXdzOrder", option),
        // 创单支付接口
        xdzPcPayAndUpdateOrder: option =>
            fetch.post("/v1/edf/ordercenter/xdzPcPayAndUpdateOrder", option),
        // 取消订单接口
        cancelOrder: option => fetch.post("/v1/edf/ordercenter/cancelOrder", option),
    },
}
