/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    /*
    person: {
        query: (option) => fetch.post('/v1/person/query', option)
    }*/
    ianbcc: {
        //税款所属期查询
        querySkssq: option =>
            fetch.post("v1/biz/invoice/gxrz20/querySkssq", option),
        // 抵扣勾选列表（已勾选、未勾选）（分页、统计、筛选、排序）、抵扣勾选列表全选
        queryBatchGxrzPageList: option =>
            fetch.post("v1/biz/invoice/gxrz20/queryBatchGxrzPageList", option),
        //批量统计签名
        batchSubmitSignRequest: option =>
            fetch.post("v1/biz/invoice/gxrz20/batchSubmitSignRequest", option),
        // 批量预约签名
        batchSubmitBookedSignRequest: option =>
            fetch.post(
                "v1/biz/invoice/gxrz20/batchSubmitBookedSignRequest",
                option
            ),
        // 取消预约签名
        cancelBookedSignRequestFromBatch: option =>
            fetch.post(
                "v1/biz/invoice/gxrz20/cancelBookedSignRequestFromBatch",
                option
            ),
        getOrgAddressFromSj: option =>
            fetch.post("v1/tax/sb/getOrgAddressFromSj", option)
    }
}
