/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {
    fetch
} from 'edf-utils'

const mockData = fetch.mockData

function initMockData() {

}

export default {

    report: {
        //query: (option) => fetch.post('/v1/report/query', option)
        query: (option) => {
            return {
                result: true,
                value: {
                    style: "customerId:[0,1][2,2][3,3][4,6][7,7]",
                    auxType: ["customerId", "accountId"],
                    details: [
                        { voucherDate: '2017-09-30', docId: '0001', docCode: '记-01', status: 128, "accountId": 50006, "accountCode": "1122", "accountName": `应收账款${Math.random()}`, "customerId": 1671123628001280, "customerName": "3", "periodBeginAmountDr": "1.00", "periodBeginAmountCr": "", "amountDr": "1", "amountCr": "", "yearAmountDr": "1.00", "yearAmountCr": "", "periodEndAmountDr": "1.00", "periodEndAmountCr": "" },
                        { voucherDate: '2017-09-30', docId: '0001', docCode: '记-01', status: 0, "accountId": 50035, "accountCode": "2203", "accountName": `预收账款${Math.random()}`, "customerId": 1671123628001280, "customerName": "3", "periodBeginAmountDr": "", "periodBeginAmountCr": "16.00", "amountDr": "2", "amountCr": "100", "yearAmountDr": "", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "16.00" },
                        { voucherDate: '2017-09-31', docId: '0002', docCode: '记-02', status: 0, "accountId": 50034, "accountCode": "2202", "accountName": `应付账款${Math.random()}`, "customerId": 3736760350738432, "customerName": "4", "periodBeginAmountDr": "", "periodBeginAmountCr": "-10,000.00", "amountDr": "3", "amountCr": "800", "yearAmountDr": "10,000.00", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "-10,000.00" },
                        { voucherDate: '2017-09-31', docId: '0002', docCode: '记-02', status: 0, "accountId": 50035, "accountCode": "2203", "accountName": `预收账款${Math.random()}`, "customerId": 3736852183713792, "customerName": "5", "periodBeginAmountDr": "", "periodBeginAmountCr": "-988.00", "amountDr": "4", "amountCr": "", "yearAmountDr": "", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "-988.00" },
                        { voucherDate: '2017-09-31', docId: '0002', docCode: '记-02', status: 0, "accountId": 50035, "accountCode": "2203", "accountName": `预收账款${Math.random()}`, "customerId": 3736857394874368, "customerName": "6", "periodBeginAmountDr": "", "periodBeginAmountCr": "-43,433,343.00", "amountDr": "5", "amountCr": "", "yearAmountDr": "", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "-43,433,343.00" },
                        { voucherDate: '2017-10-30', docId: '0003', docCode: '记-03', status: 0, "accountId": 50036, "accountCode": "2211", "accountName": `应付职工薪酬${Math.random()}`, "customerId": 3736857394874368, "customerName": "6", "periodBeginAmountDr": "", "periodBeginAmountCr": "1,064.00", "amountDr": "6", "amountCr": "789", "yearAmountDr": "", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "1,064.00" },
                        { voucherDate: '2017-10-30', docId: '0003', docCode: '记-03', status: 0, "accountId": 50095, "accountCode": "221102", "accountName": `奖金、津贴和补贴${Math.random()}`, "customerId": 3736857394874368, "customerName": "6", "periodBeginAmountDr": "", "periodBeginAmountCr": "1,064.00", "amountDr": "7", "amountCr": "78", "yearAmountDr": "", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "1,064.00" },
                        { voucherDate: '2017-10-30', docId: '0003', docCode: '记-03', status: 128, "accountId": 50036, "accountCode": "2211", "accountName": "应付职工薪酬", "customerId": 3736857394874368, "customerName": "6", "periodBeginAmountDr": "", "periodBeginAmountCr": "1,064.00", "amountDr": "8", "amountCr": "789", "yearAmountDr": "", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "1,064.00" },
                        { voucherDate: '2017-10-30', docId: '0003', docCode: '记-03', status: 0, "accountId": 50095, "accountCode": "221102", "accountName": "奖金、津贴和补贴", "customerId": 3736857394874368, "customerName": "6", "periodBeginAmountDr": "", "periodBeginAmountCr": "1,064.00", "amountDr": "9", "amountCr": "78", "yearAmountDr": "", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "1,064.00" },
                        { voucherDate: '2017-10-30', docId: '0003', docCode: '记-03', status: 128, "accountName": "合计", "periodBeginAmountDr": "1.00", "periodBeginAmountCr": "-43,443,251.00", "amountDr": "", "amountCr": "", "yearAmountDr": "10,001.00", "yearAmountCr": "", "periodEndAmountDr": "1.00", "periodEndAmountCr": "-43,443,251.00" },
                        { voucherDate: '2017-12-30', docId: '0004', docCode: '记-04', status: 0, "accountId": 50095, "accountCode": "221102", "accountName": "奖金、津贴和补贴", "customerId": 3736857394874368, "customerName": "6", "periodBeginAmountDr": "", "periodBeginAmountCr": "1,064.00", "amountDr": "10", "amountCr": "78", "yearAmountDr": "", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "1,064.00" },
                        { voucherDate: '2017-12-30', docId: '0004', docCode: '记-04', status: 0, "accountId": 50036, "accountCode": "2211", "accountName": "应付职工薪酬", "customerId": 3736857394874368, "customerName": "6", "periodBeginAmountDr": "", "periodBeginAmountCr": "1,064.00", "amountDr": "11", "amountCr": "789", "yearAmountDr": "", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "1,064.00" },
                        { voucherDate: '2017-12-30', docId: '0004', docCode: '记-04', status: 0, "accountId": 50095, "accountCode": "221102", "accountName": "奖金、津贴和补贴", "customerId": 3736857394874368, "customerName": "6", "periodBeginAmountDr": "", "periodBeginAmountCr": "1,064.00", "amountDr": "12", "amountCr": "78", "yearAmountDr": "", "yearAmountCr": "", "periodEndAmountDr": "", "periodEndAmountCr": "1,064.00" },
                        { voucherDate: '2017-12-30', docId: '0004', docCode: '记-04', status: 0, "accountName": "合计", "periodBeginAmountDr": "1.00", "periodBeginAmountCr": "-43,443,251.00", "amountDr": "", "amountCr": "", "yearAmountDr": "10,001.00", "yearAmountCr": "", "periodEndAmountDr": "1.00", "periodEndAmountCr": "-43,443,251.00" }
                    ]
                }
            }
        }
    }
}