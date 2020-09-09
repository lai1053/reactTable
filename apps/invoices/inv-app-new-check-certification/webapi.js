/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils";

export default {
    iancc: {
        //发票管理工具连接状态查询
        queryClientConnectionState: option =>
            fetch.post(
                "v1/biz/invoice/gxrz20/queryClientConnectionState",
                option
            ),
        //税款所属期查询
        querySkssq: option =>
            fetch.post("v1/biz/invoice/gxrz20/querySkssq", option),
        // 抵扣勾选列表（已勾选、未勾选）（分页、统计、筛选、排序）、抵扣勾选列表全选
        queryGxPageList: option =>
            fetch.post("v1/biz/invoice/gxrz20/queryGxPageList", option),
        //勾选发票
        gxFp: option => fetch.post("v1/biz/invoice/gxrz20/gxFp", option),
        //取消勾选发票
        cancelGxFp: option =>
            fetch.post("v1/biz/invoice/gxrz20/cancelGxFp", option),
        // 抵扣勾选统计列表（已勾选、未勾选）（分页、统计、筛选、排序）、抵扣勾选统计列表全选
        queryGxSignInfoPageList: option =>
            fetch.post("v1/biz/invoice/gxrz20/queryGxSignInfoPageList", option),
        // 下载发票
        downInvoice: option =>
            fetch.post("v1/biz/invoice/fpxxCollection", option),
        //批量修改申报用途
        batchUpdateSbPurpose: option =>
            fetch.post("v1/biz/invoice/gxrz20/batchUpdateSbPurpose", option),
        //单户统计签名
        submitSignRequest: option =>
            fetch.post("v1/biz/invoice/gxrz20/submitSignRequest", option),
        //撤销统计（单户）
        cancelSignRequest: option =>
            fetch.post("v1/biz/invoice/gxrz20/cancelSignRequest", option),
        //异常信息查询（批量）
        batchQuerySignFailInfo: option =>
            fetch.post("v1/biz/invoice/gxrz20/batchQuerySignFailInfo", option),
        // 汇总签名状态（以及异常信息）查询
        queryTotalSignStateAndSignFailInfo: option =>
            fetch.post(
                "v1/biz/invoice/gxrz20/queryTotalSignStateAndSignFailInfo",
                option
            ),
        //单户预约签名
        submitBookedSignRequest: option =>
            fetch.post(
                "/v1/biz/invoice/gxrz20/submitBookedSignRequest",
                option
            ),
        // 单户取消预约签名
        cancelBookedSignRequest: option =>
            fetch.post(
                "/v1/biz/invoice/gxrz20/cancelBookedSignRequest",
                option
            ),
        // 导出勾选认证已认证发票数据
        exportGxrzYrzFpExcel: option =>
            fetch.formPost(
                "/v1/biz/invoice/gxrz20/exportGxrzYrzFpExcel",
                option
            )
    }
};
