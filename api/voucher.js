/**
 * Created by shenxy on 16/10/18.
 */

/**
 * 返回传输的月份的最大凭证号
 * @param post
 * @param currentYear
 * @param currentPeriod
 * @returns {*}
 */
export function getNewCode(post, currentYear, currentPeriod){
    return post('/v1/journal/getNewCodeAndVoucherDate', {currentYear:currentYear, currentPeriod:currentPeriod})
}

/**
 * 返回凭证号和凭证日期
 * 返回凭证日期所在月份的最大凭证号及最后做的一张凭证的凭证日期
 * 与getNewCode调用同一个接口, 如果期间不传,则返回凭证号 + 日期; 如果传了日期,则只返回凭证号
 * @param post
 * @returns {*}
 */
export function getNewCodeAndVoucherDate(post){
    return post('/v1/journal/getNewCodeAndVoucherDate', {})
}

/**
 * 新增凭证
 * @param post
 * @param voucher 凭证数据
 * @returns {*}
 */
export function add(post, voucher) {
    return post('/v1/journal/create', voucher)
}

/**
 * 凭证查询
 * @param post
 * @param filters 过滤条件
 * @returns {*}
 */
export function query(post, filters) {
    return post('/v1/journal/query ', filters || {})
}

/**
 * 上一张凭证
 * @param post
 * @param code
 * @param currentYear
 * @param currentPeriod
 * @returns {*}
 */
export function previous(post, code, currentYear, currentPeriod, isCreate) {
    return post('/v1/journal/previousDoc', {code, currentYear, currentPeriod, isCreate})
}

/**
 * 下一张凭证
 * @param post
 * @param code
 * @param currentYear
 * @param currentPeriod
 * @returns {*}
 */
export function next(post, code, currentYear, currentPeriod, isCreate) {
    return post('/v1/journal/nextDoc', {code, currentYear, currentPeriod, isCreate})
}

/**
 * 用code + 期间 查询指定凭证
 * @param post
 * @param code
 * @param currentYear
 * @param currentPeriod
 * @returns {*}
 */
export function getByCode(post, code, currentYear, currentPeriod) {
    return post('/v1/journal/getByCode', {code, currentYear, currentPeriod})
}

/**
 * 用id 查询指定凭证
 * @param post
 * @param docId
 * @returns {*}
 */
export function getById(post, docId) {
    return post('/v1/journal/getById', {docId})
}

/**
 * 审核
 * @param post
 * @param docId
 * @param ts
 * @returns {*}
 */
export function audit(post, docId, ts) {
    return post('/v1/journal/audit', {docId, ts})
}

/**
 * 反审核
 * @param post
 * @param docId
 * @param ts
 * @returns {*}
 */
export function antiAudit(post, docId, ts) {
    return post('/v1/journal/unAudit', {docId, ts})
}

/**
 * 删除
 * @param post
 * @param docId
 * @param ts
 * @returns {*}
 */
export function del(post, docId, ts) {
    return post('/v1/journal/delete', {docId, ts})
}


/**
 * 更新凭证
 * @param post
 * @param voucher
 * @returns {*}
 */
export function update(post, voucher) {
    return post('/v1/journal/update', voucher)
}

/**
 * 查询科目余额
 * @param accountId
 */
export function getAccountBalance(post, accountId) {
    return post('/v1/journal/getAccountBalance', {accountId})
}

/**
 * 凭证模板--查询
 * @param post
 * @returns {*}
 */
export function templateQuery(post) {
    return post('/v1/docTemplate/query', {})
}

/**
 * 凭证模板--新增
 * @param post
 * @param template
 * @returns {*}
 */
export function templateCreate(post, template) {
    return post('/v1/docTemplate/create', template)
}

/**
 * 凭证模板--删除
 * @param post
 * @param docTemplateId
 * @returns {*}
 */
export function templateDelete(post, docTemplateId) {
    return post('/v1/docTemplate/delete', {docTemplateId})
}

/**
 * 凭证模板--单个查找
 * @param post
 * @param docTemplateId
 * @returns {*}
 */
export function templateGetById(post, docTemplateId) {
    return post('/v1/docTemplate/getById', {docTemplateId})
}

/**
 * 凭证模板--修改code和name
 * @param post
 * @param editTemplate
 * @returns {*}
 */
export function templateUpdate(post, editTemplate) {
    return post('/v1/docTemplate/update', editTemplate)
}

/**
* 获取新的常用凭证编码
* @returns {*}
*/
export function getDocTemplateNewCode(post) {
   return post('/v1/docTemplate/getNewCode')
}

/**
 * 批量审核
 * @param  {[type]} post [description]
 * @param  {[type]} obj  [description]
 * @return {[type]}      [description]
 */
export function auditBatch(post,obj){
    return post('/v1/journal/auditBatch',obj)
}

/**
 * 批量弃审
 * @param  {[type]} post [description]
 * @param  {[type]} obj  [description]
 * @return {[type]}      [description]
 */
export function unAuditBatch(post,obj){
    return post('/v1/journal/unAuditBatch',obj)
}


/**
 * 批量删除
 * @param  {[type]} post [description]
 * @param  {[type]} obj  [description]
 * @return {[type]}      [description]
 */
export function deleteBatch(post,obj){
    return post('/v1/journal/deleteBatch',obj)
}

/**
 * 整理凭证号
 * @param  {[type]} post [description]
 * @param  {[type]} obj  [description]
 * @return {[type]}      [description]
 */
export function reorganizeDocCode(post,obj){
    return post('/v1/journal/reorganizeDocCode',obj)
}

/**
 * 根据查询条件打印
 * @param  {[type]} post [description]
 * @param  {[type]} docIds   [description]
 * @param  {[type]} type   [description]
 * @param  {[type]} token  [description]
 */
export function printList(post, docIds, type){
	return post('/v1/journal/printList', { docIds, type})
}

/**
 * 根据查询条件或者指定的id打印
 * @param  {[type]} post [description]
 * @param  {[type]} filterParam   [description]
 */
export function printListAll(post, filterParam){
	return post('/v1/journal/printListAll', filterParam)
}

/**
 * 打印
 * @param  {[type]} formPost [description]
 * @param  {[type]} docIds   [description]
 * @param  {[type]} type   [description]
 * @param  {[type]} token  [description]
 */
export function print(formPost, params){
	return formPost('/v1/journal/print', params)
}

//凭证导出
//v1/journal/export
export function exportExcel(post, params){
	return post('/v1/journal/export', params)
}
/**
 * 凭证附件的新增，删除，更新
 * @param  {[type]} formPost [description]
 * @param  {[type]} docIds   [description]
 * @param  {[type]} type   [description]
 * @param  {[type]} token  [description]
 */
export function updateEnclosure(post, fileList){
	return post('/v1/journal/updateEnclosure', fileList)
}

/**
 * 新增凭证贷方查询
 * @param  {[type]} formPost [description]
 * @param  {[type]}
 * {
        "voucherDate":"2017-06-13", -- 凭证日期
        "docUsedIds":[1,2,3] -- 凭证使用的进项税ID列表
        "entryUsedId":1 --该分录使用的进项税ID
    }

 * @param  {[type]} token  [description]
 */
export function queryInPutTaxDeductData(post, fileList){
    return post('/v1/InputTaxDeduct/queryInPutTaxDeductData', fileList)
}


/**
 * 新增凭证科目范围新增查询
 * @param  {[type]} formPost [description]
 * @param  {[type]}
 * {
        "docId":2785790681352192,//凭证id
        "accountId":50053,//科目id
        "id":2785790682335232//分录id
    }

 * @param  {[type]} token  [description]
 */
export function getAccountRange(post, fileList){
    return post('/v1/journal/getAccountRange', fileList)
}
