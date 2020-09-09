
//获取图片验证码MD5串
export function checkCaptchaCode(post,code,r){
	return post('/v1/web/pub/checkCaptchaCode',{'code':code,'r':r})
}

//发送验证码
export function sendConfirmCode(post,emailOrPhone,codeType,domain){
	// codeType:1-注册 2-找回密码 3-绑定手机或邮箱
	return post('/v1/web/pub/sendConfirmCode',{'account':emailOrPhone,'codeType':codeType,'domain':domain})
}

// 校验验证码是否正确
export function isRightConfirmCode(post,codeValue,ts,account,md5Code){
	return post('/v1/web/pub/isRightConfirmCode',{'confirmCode':codeValue,'ts':ts,'account':account,'md5Code':md5Code})
}

// 初始化数据
export function init(post){
	return post('/v1/web/myyj/init')
}
//客户账套创建
export function orginit(post,id){
	return post('/v1/web/acmorg/init',{'id':id})
}

//获取版本更新的列表数据
export function getVersionList(post){
    return post('/v1/web/portal/getVersionList')
}

// 设置最新的推送版本信息为已读
export function setVersion(post,obj){
    return post('/v1/web/portal/setVersion',obj)
}

//版本查询接口
export function versionQuery(post, list) {
	return post('/v1/version/query',list)
}

//版本新增接口
export function versionInsert(post, list) {
	return post('/v1/version/insert',list)
}

//版本修改接口
export function versionUpdate(post, list) {
	return post('/v1/version/update',list)
}

//版本删除接口
export function versionDelete(post, list) {
	return post('/v1/version/delete',list)
}

//更新初始化
export function queryById(post, list) {
	return post('/v1/version/queryById',list)
}