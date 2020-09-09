import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import female from './img/female.png'
import male from './img/male.png'
import imgOther from './img/other.png'
import editIcon from './img/editIcon.png'
import defaultImg from './img/defaultImg.png'
import { fetch } from 'edf-utils'
import { Upload, Icon, Switch } from 'edf-component'
import { fromJS } from 'immutable'
import md5 from 'md5'
import { Base64 } from 'edf-utils'
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi

        // if (this.component.props.addEventListener) {
        //     this.component.props.setCancelLister(this.onCancel)
        // }
    }

    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce('init')
        if (this.component.props.setCancelLister) {
			this.component.props.setCancelLister(this.onCancel);
		}
        //获取appVersion
        let appVersion = this.component.props.appVersion
        if (!!appVersion) {
            this.metaAction.sf('data.appVersion', this.component.props.appVersion)
        }

        this.load()
    }

    load = async () => {
        // const currentUser = this.metaAction.context.get('currentUser')
        // const response = await this.webapi.mySetting.init(currentUser && currentUser.id)
        // this.injections.reduce('load', response)
        let activeTabKey = this.metaAction.gf('data.other.activeTabKey')
        if( activeTabKey == 1 ) {
            this.loadTab1(activeTabKey)
        } else if( activeTabKey == 2 ) {
            this.loadTab2(activeTabKey)
        } else if( activeTabKey == 3 ) {
            this.loadTab3(activeTabKey)
        } else if( activeTabKey == 4 ) {
            this.loadTab4(activeTabKey)
        }
    }

    saveBaseInfo = async () => {
        const form = this.metaAction.gf('data.form').toJS()

        const ok = await this.check([{
            path: 'data.form.nickname', value: form.nickname
        }])

        if (!ok) return

        let basicInfo = await this.webapi.user.update({
            mobile: form.mobile,
            sex: form.sex,
            nickname: form.nickname,
            birthday: form.birthday
        })

        if (basicInfo) {
            this.component.props.onPortalReload && this.component.props.onPortalReload()
            this.metaAction.toast('success', '保存个人资料成功')
        }
    }

    upload = () => {
        // this.metaAction.toast('error', '纯静态网站，上传目前不可用')
    }

    getPhoto = (sex) => {
        if (sex == 1) {
            return male
        } else if (sex == 2) {
            return female
        } else {
            return imgOther
        }
    }

    getPasswordStrength = () => {
        const level = this.metaAction.gf('data.form.passwordStrength')
        if (level == 1)
            return '弱'
        else if (level == 2)
            return '中'
        else if (level == 3)
            return '高'
    }

    getColor = () => {
        const level = this.metaAction.gf('data.form.passwordStrength')
        if (level == 1)
            return 'orangeBg'
        else if (level == 2)
            return 'yellowBg'
        else if (level == 3)
            return 'greenBg'
    }

    fieldChange = async (fieldPath, value) => {
        await this.check([{ path: fieldPath, value }])
    }

    check = async (fieldPathAndValues) => {
        if (!fieldPathAndValues)
            return

        var checkResults = []

        for (var o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == 'data.form.nickname') {
                Object.assign(r, await this.checkNickname(o.value))
            }
            checkResults.push(r)
        }

        var json = {}
        var hasError = true
        checkResults.forEach(o => {
            json[o.path] = o.value
            json[o.errorPath] = o.message
            if (o.message)
                hasError = false
        })

        this.metaAction.sfs(json)
        return hasError
    }

    checkNickname = async (nickname) => {
        var message

        if (!nickname)
            message = '请录入操作员'
        else if (nickname.length > 50)
            message = '操作员不能超过50个字'
        return { errorPath: 'data.other.error.nickname', message }
    }

    getAccessTokenJson = () => {
        return { token: fetch.getAccessToken() }
    }
    //修改密码
    changePassword = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '修改登录密码',
            width: 500,
            height: 251,
            children: this.metaAction.loadApp('edfx-app-my-setting-xdz-change-password', {
                store: this.component.props.store,
            })
        })
        ret.passwordStrength && this.metaAction.sf('data.form.passwordStrength', ret.passwordStrength)
    }
    //修改绑定手机
    changeMobile = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '修改手机号',
            width: 500,
            height: 251,
            children: this.metaAction.loadApp('edfx-app-my-setting-change-mobile', {
                store: this.component.props.store,
                mobile: this.metaAction.gf('data.formData.mobile')
            })
        })
        ret.newMobile && this.metaAction.sf('data.formData.mobile', ret.newMobile)
        this.metaAction.sf('data.other.showChangeMobile',false)
    }

    /////////xdz start
    handleTabChange = ( activeKey ) => {
        let currentKey = this.metaAction.gf('data.other.activeTabKey'),
            isEdited = this.metaAction.gf(`data.other.tab${currentKey}IsEdited`)
        if( currentKey == 2 ) {
            let form = this.metaAction.gf('data.tab2Form')?this.metaAction.gf('data.tab2Form').toJS(): undefined
            if( !form || (!form.oldPassword && !form.password && !form.rePassword)  ) {
                isEdited = false
            } else {
                isEdited = true
            }
        }
        if( ( currentKey == 1 || currentKey == 2 ) && isEdited ) {
            this.openSaveMessage( currentKey )
            return
        }
        if( activeKey == 1 ) {
            this.loadTab1( activeKey )
        } else if( activeKey == 2 ) {
            this.loadTab2( activeKey )
        } else if( activeKey == 3 ) {
            this.loadTab3(activeKey)
        } else if( activeKey == 4 ) {
            this.loadTab4( activeKey )
        }
    }

    loadTab1 = async ( activeKey ) => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        let currentUser = this.metaAction.context.get('currentUser')
        let res2 = await this.webapi.user.init({})
        // let res3 = await this.webapi.user.getDepartMentList({orgId: currentOrg.id, userId: currentUser.id })
        let res3 = await this.webapi.user.getUserDetail({})
        if( res2 || res3 ) {
            let formData = Object.assign( {}, res2.user ),
                department = '',
                positions = []
            if( res3 && res3.person && res3.person.bmmc ) {
                department = res3.person.bmmc
            }
            if( res3 && res3.role && res3.role.length ) {
                positions = res3.role.map( item => {return item.name})
            }
            this.metaAction.sfs( {
                'data.other.activeTabKey': activeKey,
                'data.other.tab1IsEdited': false, 
                'data.other.editState': false, 
                'data.other.department': department,
                'data.other.positions': positions, 
                'data.formData': fromJS( formData ), 
            })
        }

    }

    loadTab2 = async ( activeKey ) => {
        this.metaAction.sfs( {
            'data.other.activeTabKey': activeKey,
            'data.other.tab2IsEdited': false, 
            'data.tab2Form': fromJS({})
        })
    }

    loadTab3 = async ( activeKey ) => {
        let currentUser = this.metaAction.context.get('currentUser')
        
        let res = await this.webapi.user.queryList({ userId: currentUser.id })
        if( res ) {
            this.metaAction.sfs( {
                'data.other.activeTabKey': activeKey,
                'data.tab3list': fromJS(res),
            })
        }
    }

    loadTab4 = async ( activeKey ) => {
        let res2 = await this.webapi.user.queryOrgListForDz({"orgType":1})
        if( res2 ) {
            let checkIndex
            res2.map( (item, index) => {
                if( item.isDefaultOrg ) {
                    checkIndex = index
                }
                return item 
            })
            this.metaAction.sfs( {
                'data.other.activeTabKey': activeKey,
                'data.other.tab1IsEdited': false, 
                'data.tab4list': fromJS( res2 ), 
                'data.other.checkIndex': checkIndex, 
            })
        }
    }

    openSaveMessage = async ( currentKey ) => {
        let ret = await this.metaAction.modal('confirm', {
            title: '提示',
            content: '您已进行修改，请确认是否保存！'
        })
        if( ret ) {
            if( currentKey == 1 ) {
                this.handleTab1Save()
            } else {
                this.handleTab2Save()
            }
        } else {
            if( currentKey == 1 ) {
                this.loadTab1(currentKey)
            } else {
                this.loadTab2(currentKey)
            }
        }
    }

    renderUploadImg = () => {
        // let imageUrl = defaultImg
        let imageUrl = this.metaAction.gf('data.formData.imgAccessUrl'),
            editState = this.metaAction.gf('data.other.editState'),
            preUrl = this.metaAction.gf('data.other.headSculptureUrl')

        if(preUrl) {
            imageUrl = preUrl
        }
        // console.log(imageUrl)
        return (<div>
            {imageUrl ? <img src={imageUrl} alt="avatar" className="tximg" /> : <img src={defaultImg} alt="avatar" className="tximg" />}
            <Upload
                accept={'.jpg, .jpeg, .png'}
                beforeUpload={this.beforeLoad}
                onChange={this.uploadChange}
                showUploadList={false}
                headers={this.getAccessToken()}
                action={'/v1/edf/user/uploadImg'}
                style={{display:!!editState?'block':'none'}}
            >
                
                <img 
                    src={editIcon} 
                    className={"edficon edficon-bianji cell-icon"}
                    style={{width: '22px',height: '22px',fontSize:'22px',cursor: 'pointer'}}
                />
            </Upload>
        </div>)        
    }

    beforeLoad = (file) => {
        // console.log(file)
        const reader = new FileReader();
        
        reader.readAsDataURL(file);
        // console.log( reader, 'reader.result')
        // let ysUrl = this.changeFile(file)
        // console.log(ysUrl, 'ysUrl')
        // setTimeout(() => {
        //     this.metaAction.sfs({
        //         'data.other.headSculptureUrl':reader.result,
        //         'data.other.imgKey': Math.random()
        //     })
        // },200)

        // console.log('data.formData.headSculptureUrl',reader.result)
        const isJPG =(file.type === 'image/jpeg'||file.type === 'image/png');
        if (!isJPG) {
			this.metaAction.toast('warning', '仅支持上传.jpg, .jpeg, .png格式的文件')
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
			this.metaAction.toast('warning', '文件大小不能超过5M')
        }
        return isJPG && isLt5M;
    }

    uploadChange = (info) => {
        if (!info.file.status) {
			this.metaAction.toast('error', '仅支持上传.jpg, .jpeg, .png格式的文件')
			return
		}
		LoadingMask.show()
		if (info.file.status === 'done') {
			LoadingMask.hide()
			if (info.file.response.error && info.file.response.error.message) {
				this.metaAction.toast('error', info.file.response.error.message)
			} else if (info.file.response.result && info.file.response.value) {
                // this.injections.reduce('upload', info.file.response.value)
                this.metaAction.sfs({
                    'data.formData.imgAccessUrl':info.file.response.value,
                    'data.other.imgKey': Math.random()
                })
				this.metaAction.toast('success', '上传成功')                
			}
		} else if (info.file.status === 'error') {
			LoadingMask.hide()
			this.metaAction.toast('error', '上传失败')
		}
    }

    getAccessToken = () => {
        let token = fetch.getAccessToken()
		return {token}
    }

    changeFile =  (event) => {
        var _this = this;

        // 选择的文件对象(file里只包含图片的体积，不包含图片的尺寸)
        // var file = event.target.files[0];
        let file = event;
        console.log(file)
        let ysUrl

        // 选择的文件是图片
        if(file.type.indexOf("image") === 0) {
            // 压缩图片需要的一些元素和对象
            var reader = new FileReader(),
                //创建一个img对象
                img = new Image();

            reader.readAsDataURL(file);
            // 文件base64化，以便获知图片原始尺寸
            reader.onload = function(e) {
                img.src = e.target.result;
            };

            // base64地址图片加载完毕后执行
            img.onload = function () {
                // 缩放图片需要的canvas（也可以在DOM中直接定义canvas标签，这样就能把压缩完的图片不转base64也能直接显示出来）
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');

                // 图片原始尺寸
                var originWidth = this.width;
                var originHeight = this.height;

                // 最大尺寸限制，可通过设置宽高来实现图片压缩程度
                var maxWidth = 300,
                    maxHeight = 300;
                // 目标尺寸
                var targetWidth = originWidth,
                    targetHeight = originHeight;
                // 图片尺寸超过300x300的限制
                if(originWidth > maxWidth || originHeight > maxHeight) {
                    if(originWidth / originHeight > maxWidth / maxHeight) {
                        // 更宽，按照宽度限定尺寸
                        targetWidth = maxWidth;
                        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
                    } else {
                        targetHeight = maxHeight;
                        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
                    }
                }
                // canvas对图片进行缩放
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                // 清除画布
                context.clearRect(0, 0, targetWidth, targetHeight);
                // 图片压缩
                context.drawImage(img, 0, 0, targetWidth, targetHeight);
                /*第一个参数是创建的img对象；第二三个参数是左上角坐标，后面两个是画布区域宽高*/

                //压缩后的图片转base64 url
                /*canvas.toDataURL(mimeType, qualityArgument),mimeType 默认值是'image/png';
                 * qualityArgument表示导出的图片质量，只有导出为jpeg和webp格式的时候此参数才有效，默认值是0.92*/
                var newUrl = canvas.toDataURL('image/jpeg', 0.92);//base64 格式

                // _this.setState({
                //     url: newUrl
                // })
                newUrl = newUrl
                return newUrl

                //也可以把压缩后的图片转blob格式用于上传
                // canvas.toBlob((blob)=>{
                //     console.log(blob)
                //     //把blob作为参数传给后端
                // }, 'image/jpeg', 0.92)
            };
        } else {
            alert('请上传图片格式');
        }
        return ysUrl
    }
    
    renderPositions = ( positions, editState ) => {
        let className = 'positionItem'
        if( editState ) {
            className += ' disabledItem'
        }
        return <div className="positionContent">
            { positions.map( item => (<div className={className}>{item}</div>) ) }
        </div>
    }

    handleTab1Edit = () => {
        this.metaAction.sf('data.other.editState', true)
    }

    handleTab1Save = async () => {
        let res = await this.checkFormItems(),
            message = this.metaAction.gf('data.other.message').toJS(),
            form = this.metaAction.gf('data.formData').toJS(),
            newMessage = {}
        
        this.metaAction.sf('data.other.message', fromJS( Object.assign( message, res.message ) ))
        if( res.result ) {
            return 
        }
        let res2 = await this.webapi.user.updateDz(form)
        if( res2 ) {
            this.metaAction.toast('success', '保存成功')
            this.metaAction.sfs({
                'data.other.editState': false,
                'data.other.tab1IsEdited': false,
            })
        }
    }

    handleTab2Save = async () => {
        let res = this.checkTab2(),
            message = this.metaAction.gf('data.other.message').toJS(),
            tab2Form =  this.metaAction.gf('data.tab2Form').toJS()
        if( res.result ) {
            if( res.message ) this.metaAction.toast('warning', res.message )
            return 
        }

        const currentUser = this.metaAction.context.get('currentUser')
        var id = currentUser && currentUser.id
        let backupOldPwd = tab2Form.oldPassword
        let backupPwd = tab2Form.password
        let password = tab2Form.password

        tab2Form.oldPassword =  md5(tab2Form.oldPassword+'*the3Kingdom*')
        tab2Form.password =  md5(tab2Form.password+'*the3Kingdom*')

        const response = await this.webapi.user.modifyPassword({
            id,
            oldPassword: tab2Form.oldPassword,
            password: tab2Form.password,
            passwordStrength: this.pwdLevel(password),
            clearText: Base64.encode(backupOldPwd) + "," + Base64.encode(backupPwd)
        })
        if(response) {
            this.metaAction.toast('success', `修改密码成功`)
            sessionStorage['password'] = tab2Form.password
        }else {
            return false
        }

        this.metaAction.sfs({
            // 'data.other.editState': false,
            'data.tab2Form.oldPassword': undefined,
            'data.tab2Form.password': undefined,
            'data.tab2Form.rePassword': undefined,
            'data.other.tab2IsEdited': false,
        })
    }

    pwdLevel = (pwd) => {
        let level = 0;
        let regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
        if((/[0-9]/).test(pwd)) {
            level++
        }
        if((/[a-zA-Z]/).test(pwd)) {
            level++
        }
        if (/[`~!@#$%^&*()_\-=+<>?:"{},.\/;'[\] ]/.test(pwd) || regCn.test(pwd)) {
            level++
        }
        return level
    }

    onOk = async () => {
        const form = this.metaAction.gf('data.form').toJS();
        const info = await this.check([{
            path: 'data.form.oldPassword', value: form.oldPassword
        }, {
            path: 'data.form.password', value: form.password
        }, {
            path: 'data.form.rePassword', value: form.rePassword
        }])
        
        if (!info) return false

        const currentUser = this.metaAction.context.get('currentUser')
        var id = currentUser && currentUser.id
        let backupOldPwd = form.oldPassword
        let backupPwd = form.password
        let password = form.password

        form.oldPassword =  md5(form.oldPassword+'*the3Kingdom*')
        form.password =  md5(form.password+'*the3Kingdom*')

        const response = await this.webapi.user.modifyPassword({
            id,
            oldPassword: form.oldPassword,
            password: form.password,
            passwordStrength: this.pwdLevel(password),
            clearText: Base64.encode(backupOldPwd) + "," + Base64.encode(backupPwd)
        })
        if(response) {
            this.metaAction.toast('success', `修改密码成功`)
            sessionStorage['password'] = form.password
            let level = this.pwdLevel(password)
            return {passwordStrength: level}
        }else {
            return false
        }
    }

    // close = (value) => {
    //     this.closeTip()
    //     if (value) {
    //         this.sortParmas()
    //     }
    // }

    handleCancel = () => {
        let currentKey = this.metaAction.gf('data.other.activeTabKey'),
            isEdited = this.metaAction.gf(`data.other.tab${currentKey}IsEdited`)
        if( currentKey == 2 ) {
            let form = this.metaAction.gf('data.tab2Form')?this.metaAction.gf('data.tab2Form').toJS(): undefined
            if( !form || (!form.oldPassword && !form.password && !form.rePassword)  ) {
                isEdited = false
            } else {
                isEdited = true
            }
        }
        if( ( currentKey == 1 || currentKey == 2 ) && isEdited ) {
            this.openSaveMessage( currentKey )
            return
        }
        this.changeCurrentOrg()
        this.component.props.closeModal()
    }

    onCancel = () => {
        let currentKey = this.metaAction.gf('data.other.activeTabKey'),
            isEdited = this.metaAction.gf(`data.other.tab${currentKey}IsEdited`)
        if( currentKey == 2 ) {
            let form = this.metaAction.gf('data.tab2Form')?this.metaAction.gf('data.tab2Form').toJS(): undefined
            if( !form || (!form.oldPassword && !form.password && !form.rePassword)  ) {
                isEdited = false
            } else {
                isEdited = true
            }
        }
        if( ( currentKey == 1 || currentKey == 2 ) && isEdited ) {
            this.openSaveMessage( currentKey )
            return false
        }
        this.changeCurrentOrg()
        return true
    }

    changeCurrentOrg = () => {
        let changeCurrentOrgState = this.metaAction.gf('data.other.changeCurrentOrgState'),
            checkIndex = this.metaAction.gf('data.other.checkIndex')

        if(changeCurrentOrgState) {
            this.component.props.dljgOrgSelect &&
                    this.component.props.dljgOrgSelect({key: this.metaAction.gf(`data.tab4list.${checkIndex}.id`) })
        }
    }

    // mobileReg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
    // 		emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
    // !(emailReg.test(option.value))
    checkFormItems = async () => {
        let formData = this.metaAction.gf('data.formData').toJS(),
            mobileReg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
            emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
            message = {},
            result = false

        if( formData.nickname === undefined || formData.nickname === '' ) {
            message.nickname = '请输入用户名称！'
            result = true
        } else {
            message.nickname = undefined
        }
        if( formData.email === undefined ) {
            message.email = '请输入邮箱！'
            result = true
        } else if( !(emailReg.test(formData.email)) ) {
            message.email = '请输入正确的邮箱！'
            result = true
        } else {
            message.email = undefined
        }
        // //姓名、手机、邮箱在机构范围内不可重复，如重复，则提示用户：姓名/部门/手机/邮箱重复！
        // //姓名
        // if( !( formData.nickname===undefined || formData.nickname==='' ) ) {
        //     message.nickname = '请输入用户名称！'
        //     // message.nickname = ['请输入邮箱！']
        //     result = true
        // } else if( false ) {//姓名/部门/手机/邮箱重复！
        //     message.mobile = '姓名重复！'
        //     result = true
        // } else {
        //     message.nickname = ''
        // }
        // //手机号
        // if( !( formData.mobile===undefined || formData.mobile==='' ) ) {
        //     message.mobile = '请输入手机号码！'
        //     // message.mobile = ['请输入邮箱！']
        //     result = true
        // } else if( !(mobileReg.test(formData.mobile)) ) {
        //     // message.mobile = ['请输入正确的手机号码！']
        //     message.mobile = '请输入正确的手机号码！'
        //     result = true
        // } else if( false ) {//手机在本系统内不可重复！如重复，则提示用户：手机号码重复！
        //     message.mobile = '手机号码重复！'
        //     result = true
        // } else if( false ) {//姓名/部门/手机/邮箱重复！
        //     message.mobile = '手机重复！'
        //     result = true
        // } else {
        //     message.mobile = ''
        // }
        //邮箱
        // if( !( formData.email===undefined || formData.email==='' ) ) {
        //     message.email = '请输入邮箱！'
        //     // message.email = ['请输入邮箱！']
        //     result = true
        // } else if( !(emailReg.test(formData.email)) ) {
        //     // message.email = ['请输入正确的手机号码！']
        //     message.email = '请输入正确的邮箱！'
        //     result = true
        // } else if( false ) {//姓名/部门/手机/邮箱重复！
        //     message.email = '邮箱重复！'
        //     result = true
        // } else {
        //     message.email = ''
        // }
        return {
            result,
            message
        }
    }

    checkTab2 = () => {
        let password =  this.metaAction.gf('data.tab2Form.password') || '',
            rePassword =  this.metaAction.gf('data.tab2Form.rePassword') || '',
            result = false,
            message
        if( !/^.{6,32}$/.test(password) ) {
            result = true
        }
        if( !/^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$)^.{1,}$/.test(password) ) {
            result = true
        }
        if( result ) {
            message = '新密码输入格式不正确，请检查后重新输入'
        }
        if( password !== rePassword && !message ) {
            result = true
            message = '两次输入的新密码不一致，请检查后重新输入'
        }

        return {
            result,
            message
        }
    }

    getPasswordMassage = () => {
        let password =  this.metaAction.gf('data.tab2Form.password') || '',
            message1Class = 'normal-message',
            message2Class = 'normal-message'
        if( !/^.{6,32}$/.test(password) ) {
            message1Class = 'red-message'
        }
        if( !/^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)])+$)^.{1,}$/.test(password) ) {
            message2Class = 'red-message'
        }
        return (<div>
            <span className='red-message'>
                *
            </span>
            <span className={message1Class}>
                长度6至32字符，
            </span>
            <span className={message2Class}>
                至少包含大小写字母、数字和标点符号中的两种
            </span>
        </div>)
    }

    componentDidMount = () => {   
        if (addEventListener) {
            addEventListener('click', ::this.onClickEle)
        } else if (window.detachEvent) {
            detachEvent('click', ::this.onClickEle)
        }
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            removeEventListener('click', ::this.onClickEle)         
        } else if (window.attachEvent) {
            attachEvent('onclick', ::this.onClickEle)
        }
    }

    onClickEle(event) {
        if( event.path && event.path.length >= 2 && event.path[1].className.indexOf('formItemInputTel') != -1 ) {
            let showChangeMobile = this.metaAction.gf('data.other.showChangeMobile')
            if( !showChangeMobile ) {
                this.metaAction.sf('data.other.showChangeMobile',true)
                this.changeMobile()
            }
        }
    }

    renderTab3Columns = () => {
        let taxStateType = this.metaAction.gf('data.other.taxStateType'),
            columns = [//日期 时间 IP地址 城市 登录产品
                
                {
                    title: '日期',
                    dataIndex: 'loginDate',
                    align: 'left',
                    width: '20%',
                    key: 'loginDate',
                    className: 'loginDate'
                },
                {
                    title: '时间',
                    dataIndex: 'loginTime',
                    align: 'left',
                    width: '20%',
                    key: 'loginTime',
                    className: 'loginTime'
                },
                {
                    title: 'IP地址',
                    dataIndex: 'ip',
                    align: 'left',
                    width: '20%',
                    key: 'ip',
                    className: 'ip'
                },
                {
                    title: '城市',
                    dataIndex: 'city',
                    align: 'left',
                    width: '20%',
                    key: 'city',
                    className: 'city'
                },
                {
                    title: '登录产品',
                    dataIndex: 'product',
                    align: 'left',
                    width: '20%',
                    key: 'product',
                    className: 'product'
                }
            ]
        return columns
    }

    renderColumns = () => {
        let taxStateType = this.metaAction.gf('data.other.taxStateType'),
            columns = [
                
                {
                    title: '中介名称',
                    dataIndex: 'name',
                    align: 'left',
                    width: '75%',
                    key: 'name',
                    className: 'name',
                    // fixed: taxStateType && taxStateType == 10 ? 'left' : '',
                    // render: (text, record, index) => this.renderDeclareItem(text, record, index, 'name')
                },
                {
                    title: '设为默认',
                    dataIndex: 'isDefaultOrg',
                    align: 'center',
                    width: '25%',
                    key: 'isDefaultOrg',
                    render: (text, record, index) => this.renderSetDefault(text, record, index)
                }
            ]
        return columns
    }

    renderSetDefault = (text, record, index) => {
        //是否零申报updateCurrentOrg
        // defaultChecked={record.isDefaultOrg} 
        return (
            <div><Switch checkedChildren="" checked={text ? text : false} unCheckedChildren="" onChange={(checked) => this.isZeroApplyonChange(checked, text, record, index)} /></div>
        )
    }

    isZeroApplyonChange = async ( checked, text, record, index ) => {
        let list = this.metaAction.gf( 'data.tab4list' ).toJS(),
            checkIndex = this.metaAction.gf( 'data.other.checkIndex' )
        if(index == checkIndex) return 
        let res = await this.webapi.user.updateCurrentOrg({"orgId":record.id})
        if( res ) {
            this.metaAction.toast('success', '修改成功')
            list[index].isDefaultOrg = 1
            if(checkIndex !== undefined) list[checkIndex].isDefaultOrg = 0
            this.metaAction.sfs({
                'data.other.checkIndex': index,
                'data.tab4list': fromJS(list),
                'data.other.changeCurrentOrgState': true
            } )
        }


    }

    setFormItem = ( path, value ) => {
        let data = {
        },
        activeTabKey = this.metaAction.gf('data.other.activeTabKey' )
        data[path] = value
        data[ `data.other.tab${activeTabKey}IsEdited` ] = true
        this.metaAction.sfs( data )
    }

    getTabScroll = (tab) => {
        let tablist = this.metaAction.gf(`data.tab${tab}list` )? this.metaAction.gf(`data.tab${tab}list` ).toJS(): undefined
        if( tablist && tablist.length ) {
            if( tablist.length * 37 > 378 ) {
                return {
                    y: 378
                }
            } else {
                return false
            }
        } else {
            return false
        }
        return 
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}