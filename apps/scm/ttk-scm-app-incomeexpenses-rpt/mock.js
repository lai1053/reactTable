/**
 * mock.js 提供应用截获ajax请求，为脱离后台测试使用
 * 模拟查询更改内存中mockData,并返回数据
 */

import { fetch } from 'edf-utils'

const mockData = fetch.mockData

fetch.mock('/v1/report/query', (option) => {

})
/**
 * @api {POST} biz/scm/bank/bankReconciliatio/queryPageListOfRADS 收支明细分页查询
 * @apiName queryPageListOfRADS
 * @apiGroup scm_bankReconciliatio
 * @apiVersion 1.0.0
 * @apiDescription 收支明细分页查询
 * @apiPermission anyone
 *
 * @apiParam {Object} json 此参数用于 web 接口测试，将示例中的 json 字符串传入此字段发送示例请求，验证返回结果
 * @apiParamExample {json} 请求示例
 *     {
 *       "entity": {
 *         "bankAccountId":,
 *         "beginDate",
 *         "endDate",
 *         "sourceVoucherType", // 来源单据类型: 1-收款，2-付款，3-转账，不是这三种类型就是所有
 *         "receiptPaymentType", // 收支类型：1-收入，2-支出，不是这两种类型就是所有
 *       }
 *       "page": {
 *         "currentPage": 1,
 *         "pageSize": 10
 *       }
 *     }
 * @apiParamExample {json} 详细说明
 *     {
 *       "entity": { -- 查询条件
 *         "bankAccountId":,
 *         "beginDate",
 *         "endDate",
 *         "sourceVoucherType", // 来源单据类型: 1-收款，2-付款，3-转账，不是这三种类型就是所有
 *         "receiptPaymentType", // 收支类型：1-收入，2-支出，不是这两种类型就是所有
 *       }
 *       "page": { -- 分页信息
 *         "currentPage": 1, -- 当前要查询的页码
 *         "pageSize": 10 -- 每页显示记录数量
 *       }
 *     }
 * @apiSuccess (Success) {Boolean} result 是否成功
 * @apiSuccess (Success) {Object} value 银行对账单
 * @apiSuccessExample {json} 成功返回数据示例
 *     {
 *       "result": true,
 *       "value": {
 *         "list": [{ -- 查询结果列表
 *           "id": 1,
 *           "ts": "2017-12-25 15:15:15"
 *         }],
 *         "page": { -- 查询结果分页信息
 *           "currentPage": 1,
 *           "pageSize": 10,
 *           "totalPage": 1, -- 总页数
 *           "totalCount": 2 -- 总记录数
 *         }
 *       }
 *     }
 * @apiError (Error) {Boolean} result 是否成功
 * @apiError (Error) {Object} error 错误信息
 * @apiErrorExample {json} 错误返回数据示例
 *     {
 *       "result": false,
 *       "error": {
 *         "code": "50005",
 *         "message": "xx 不允许为空"
 *       }
 *     }
 * 返回值全都封装到了，ReceiptAndDisbursementStatementDto这里面，
 * // 开始时间；
    private Date beginDate;
    // 结束时间
    private Date endDate;
    "sourceVoucherType": "提现",	// 来源单据类型
    "seq": "4",		// 序号
    "inMount": "0.000000000000",	// 收入
    "outMount": "3.000000000000",	// 支出
    "balance": 0,	// 余额
    "code": "ZH201805030001",	// 单据号
    "remark": "提现",			// 摘要
    "businessDate": "2018-05-03",	// 业务日期
    "docCode"		// 凭证号
 */