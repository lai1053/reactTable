/**
 * 所有API的访问入口，统一对外访问
 */

//人员
import { person } from '../apps/ba/app-card-person/webapi'
//存货
import { inventory } from '../apps/ba/app-card-inventory/webapi'
//部门
import { department } from '../apps/ba/app-card-department/webapi'
//客户
import { customer } from '../apps/ba/app-card-customer/webapi'
//供应商
import { vendor as supplier } from '../apps/ba/app-card-vendor/webapi'
//项目
import { project } from '../apps/ba/app-card-project/webapi'
//计量单位
import * as unit from '../apps/ba/app-card-unit/webapi'
//银行账号
import { bankaccount } from '../apps/ba/app-card-bankaccount/webapi'
//币种
import * as currency from '../apps/ba/app-list-currency/webapi'
//科目
import * as account from '../apps/ba/app-list-account/webapi'

export default {
    'person': person,
    'inventory': inventory,
    'department': department,
    'customer': customer,
    'supplier': supplier,
    'project': project,
    'unit': unit,
    'bankaccount': bankaccount,
    'currency': currency,
    'account': account,
}