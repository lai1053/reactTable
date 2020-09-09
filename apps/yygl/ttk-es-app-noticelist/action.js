
import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import debounce from 'lodash.debounce'
import { fromJS } from 'immutable';
import config from './config';
import extend from './extend';
import { Tree } from 'edf-component';

class action {
    constructor(option) {
        this.metaAction = option.metaAction;
        this.extendAction = option.extendAction;
        this.config = config.current;
        this.webapi = this.config.webapi;
        this.search = debounce(this.search, 800);
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections });
        this.component = component;
        this.injections = injections;
        this.VatTaxpayer = Object.assign({},this.metaAction.context.get('currentOrg') || {});
        this.VatTaxpayer.id = 'genid';
        injections.reduce('init');
        let addEventListener = this.component.props.addEventListener;
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.load);
        }

        //获取appVersion
        let appVersion = this.component.props.appVersion
        if (!!appVersion) {
            this.metaAction.sf('data.appVersion', this.component.props.appVersion)
        }

        this.load(this.metaAction.gf('data.pagination')
            .toJS());
    };

    load = async (page, filter) => {
        let response,
            deptResponse,
            persResponse,
            isReloadTree = true,
            isCreater,
            roleResponse;
        this.metaAction.sf('data.other.loading', true);
        let currentOrg = this.metaAction.context.get("currentOrg");
        if (filter && !filter.id) return;
        if (filter) isReloadTree = filter.isReloadTree;
        roleResponse = await this.webapi.role.query();
        if (isReloadTree) deptResponse = await this.webapi.dept.query();
        if (!(page && page['currentPage'])) {
            page = this.metaAction.gf('data.pagination')
                .toJS();
        }
        let option = {
            page: {
                'currentPage': page.currentPage || page.current,
                'pageSize': page.pageSize
            },
            areaCode: currentOrg.areaCode
        };
        if (filter && filter.parentId) {
            option.entity = { hierarchyCode: filter.code };
        } else if (!filter || !filter.grade) {
            filter = {
                type: 0,
                isEndNode: false,
                parentId: this.VatTaxpayer.id,
                id: this.VatTaxpayer.id,
                grade: 0
            };
        }
        let entity = {
            fuzzyCondition:this.metaAction.gf('data.entity.fuzzyCondition')
        }
        if (filter.grade === 0) {
            let departCode = this.metaAction.gf('data.departCode')
            let departmentId = this.metaAction.gf('data.departId')
            let title = this.metaAction.gf('data.entity.fuzzyCondition')
            let isRead = this.metaAction.gf('data.isCreatedAccount')
            let optionPage ={}
            if(isRead =='999'){
                optionPage = {
                    entity:{
                        'title':title,
                        // 'isRead':isRead,
                        // "messageLevel":"1"
                    },
                    page: {
                        'currentPage': page.currentPage || page.current,
                        'pageSize': page.pageSize
                    },
                    // entity
                    areaCode: currentOrg.areaCode
                };
            }else{
                optionPage = {
                    entity:{
                        'title':title,
                        'isRead':isRead,
                        // "messageLevel":"1"
                    },
                    page: {
                        'currentPage': page.currentPage || page.current,
                        'pageSize': page.pageSize
                    },
                    // entity
                    areaCode: currentOrg.areaCode
                };

            }
            // if(departmentId && departmentId != 'genid') optionPage.entity.hierarchyCode = departCode
            persResponse = await this.webapi.person.queryList(optionPage)
            isCreater = true;
        } else {
            // option.fuzzyCondition = entity.fuzzyCondition
            persResponse = await this.webapi.person.queryList(option);
            isCreater = false;
        }
        let isDeptCreater = await this.webapi.dept.isCreater();
        let isDeptCreaterStatus = { status: isDeptCreater };
        let VatTaxpayer = this.VatTaxpayer;
        let user = this.metaAction.context.get('currentUser');
        response = {
            deptResponse,
            persResponse,
            filter,
            VatTaxpayer,
            isCreater,
            roleResponse,
            isDeptCreaterStatus,
            user
        };
        this.injections.reduce('load', response);
        this.metaAction.sf('data.other.loading', false);
    };
    ggDetail = async (id) => {
        let option = [{"messageId":id}]
        let response = await this.webapi.person.getGGrd(option)
        this.load()
        const ret = await this.metaAction.modal('show', {
            title: '公告详情',
            width: 800,
            footer:null,
            children: this.metaAction.loadApp('ttk-es-app-noticexx', {
                store: this.component.props.store,
                id:id
            })
        })

    }
    search = () => this.load()

    refresh = (isReloadTree, id, isEndNode) => {
        const pagination = this.metaAction.gf('data.pagination')
            .toJS();
        const filter = this.metaAction.gf('data.filter')
            .toJS();
        let option = filter;
        if (isReloadTree) option.isReloadTree = isReloadTree;
        if (isEndNode !== undefined) option.isEndNode = isEndNode;
        if (id) option = false;
        this.load(pagination, option);
    };
    handlePopoverVisibleChange = (visible) => {
        if (visible) {
            const { filterForm } = this.metaAction.gf('data').toJS()
            this.metaAction.sf('data.formContent', fromJS(filterForm))
        }
        this.metaAction.sf('data.showPopoverCard', visible)
    }
    resetval = () =>{
        this.metaAction.sf('dataentity.fuzzyCondition','')
        this.metaAction.sf('data.isCreatedAccount',999)
    }
    setKhflVal = (e) => {
        this.metaAction.sf('data.isCreatedAccount',e)
        // this.loadList();
    }
    heightCount = () => {
        let name = 'ttk-es-app-noticelist ttk-es-app-noticelistNoBorder';
        if (this.component.props.modelStatus && (this.component.props.modelStatus == 1)) {
            name = 'ttk-es-app-noticelist';
        }
        return name;
    };


    //选择部门
    selectType = (selectedKeys, info) => {
        // let parentId = selectedKeys[0] || 0,
        let key = info.selectedNodes[0] && info.selectedNodes[0].key || 'genid';
        this.metaAction.sfs({
            'data.treeSelectedKey': fromJS([key]),
            'data.departId': info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.id,
            'data.departCode': info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.code
        })
        if (info.selected == false) {
            return false;
        }
        let parentId = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.id,
            pid = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.pid,
            grade = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.grade,
            isEndNode = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.isEndNode,
            id = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.id,
            code = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.code,
            name = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.name,
            propertyName = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.propertyName,
            property = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.property,
            ts = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.ts;
        let pagination = this.metaAction.gf('data.pagination')
                .toJS(),
            filter = {
                parentId: Number(parentId),
                grade: grade || 0,
                isEndNode: isEndNode,
                isReloadTree: false,
                id: id,
                code: code,
                name: name,
                propertyName: propertyName,
                property: property,
                pid: pid,
                ts: ts
            };
        this.load(pagination, filter);
    };

    //分页修改
    pageChanged = (currentPage, pageSize) => {
        const filter = this.metaAction.gf('data.filter')
            .toJS();
        filter.isReloadTree = false;
        if (pageSize == null || pageSize == undefined) {
            pageSize = this.metaAction.gf('data.pagination')
                .toJS().pageSize;
        }
        this.load({ currentPage, pageSize }, filter);
    };

    getListRowsCount = () => {
        return this.metaAction.gf('data.list').size;
    };

    selectRow = (rowIndex) => (e) => {
        this.injections.reduce('selectRow', rowIndex, e.target.checked);
    };




    //新增人员
    addPerson = async (option) => {
        //埋点
        // _hmt && _hmt.push(['_trackEvent', '基础档案', '部门人员', '右上角新增']);
        // const filter = this.metaAction.gf('data.filter')
        //     .toJS();
        // if (filter.grade != 0) {
        //     if (filter.id == this.VatTaxpayer.id) {
        //         this.metaAction.toast('warning', '该部门不能新增人员');
        //         return;
        //     }
        //     if (!filter.isEndNode) {
        //         this.metaAction.toast('warning', '该部门不是末级部门，不能添加人员');
        //         return;
        //     }
        // }
        // const ret = await this.metaAction.modal('show', {
        //     title: '新增用户',
        //     width: 720,
        //     className: 'ttk-es-app-noticelist-personModal',
        //     height: 700,
        //     okText:'保存',
        //     children: this.metaAction.loadApp('ttk-es-app-card-person', {
        //         store: this.component.props.store,
        //         deptId: filter.parentId ? filter.parentId : '',
        //         deptName: filter.name ? filter.name : '',
        //         appVersion: this.component.props.appVersion
        //     })
        // });
        // if (ret) {
        //     this.refresh();
        // }
    };

    //删除人员
    personDelClick = (obj) => {
        this.del(obj);
    };

    //批量删除人员
    delBatch = () => {
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid');
        let selectedArr = [],
            user = this.metaAction.context.get('currentUser');
        if (!selectedArrInfo.length) {
            this.metaAction.toast('warning', '请至少选择一条');
            return;
        }
        selectedArrInfo.forEach((data) => {

            selectedArr.push({'messageId':data.id});
        });
        this.del(selectedArr);
    };

    del = async (list) => {
        // let user = this.metaAction.context.get('currentUser')
        // let req
        // if (list.userId && list.userId == user.id) {
        //     this.metaAction.toast('warning', '当前账号正在登录，禁止删除');
        //     return;
        // }
        // if (list && list.isOrgCreator == true) {
        //     this.metaAction.toast('warn', '创建者禁止删除');
        //     return;
        // }
        // if (list instanceof Array) {
        //     req = list;
        // } else {
        //     req = [list];
        // }
        //
        // let	appVersion = this.component.props.appVersion,
        //     message = ''
        // if((appVersion == 107 && sessionStorage["dzSource"] == 1)) {
        //     req = req.filter((item) => {
        //         if(item.mobile) {
        //             message = message + item.name + '、'
        //         }
        //         return !item.mobile
        //     })
        // }
        // if(!!message) {
        //     message = message.substring(0, message.length-1) + '是代账管理生成的员工档案，无法删除'
        // }
        // let ret = null
        // if((appVersion == 107 && sessionStorage["dzSource"] == 1 && !!message)) {
        //     ret = await this.metaAction.modal('confirm', {
        //         title: '删除',
        //         content: message,
        //         okText: "确定",
        //         className: 'personnelDelModal',
        //     });
        // }else {
        //     ret = await this.metaAction.modal('confirm', {
        //         title: '删除',
        //         content: '确认删除?'
        //     });
        // }
        // if (ret) {
            let response = await this.webapi.person.getGGrd(list);
            // if (response.length && response.length > 0) {//
            //     response.forEach((data) => {
            //         this.metaAction.toast('warn', data.message);
            //     });
            // } else {
            //     this.metaAction.toast('success', '删除成功');
            // }
        // if(response){
            this.metaAction.toast('success', '操作成功');
        // }
            this.refresh();
        // }
    };

    //编辑人员
    modifyDetail = (id) => (e) => {
        this.edit(id);
    };

    edit = async (id) => {
        const filter = this.metaAction.gf('data.filter')
            .toJS();
        if (!filter.parentId) {
            this.metaAction.toast('warning', '请选择部门');
            return;
        }
        const ret = await this.metaAction.modal('show', {
            title: '编辑用户',
            width: 720,
            className: 'ttk-es-app-noticelist-personModal',
            height: 550,
            children: this.metaAction.loadApp('ttk-es-app-card-person', {
                store: this.component.props.store,
                parentId: filter.parentId ? filter.parentId : '',
                personId: id,
                appVersion: this.component.props.appVersion
            })
        });
        if (ret) {
            this.refresh();
            if(ret.refreshMenu) {
                this.component.props.onPortalReload('noReloadTplus')
            }
        }
    };

    //人员的停用状态
    personStatusClick = (name, index) => {
        let status = this.metaAction.gf('data.status');
        this.setStatus(name, index);
    };

    setStatus = async (option, index) => {
        if (option.isEnable) {
            option.isEnable = false;
            let response = await this.webapi.person.update(option);
            if (response) {
                this.metaAction.toast('success', '停用人员成功');
                this.injections.reduce('enable', response, index);
            }
        } else {
            option.isEnable = true;
            let response = await this.webapi.person.update(option);
            if (response) {
                this.metaAction.toast('success', '启用人员成功');
                this.injections.reduce('enable', response, index);
            }
        }
    };

    //更多下拉按钮:移动部门
    moveDepartMent = async (e) => {
        if (e.key == 'moveDepart') {
            //this.webapi.person.temptDownload();
            console.log("部门移动");
            const ret = await this.metaAction.modal('show', {
                title: '部门移动',
                width: 720,
                className: 'ttk-es-app-noticelist-personModal',
                height: 550,
                children: {
                    name: 'tree',
                    component: 'Tree',
                    className: 'ttk-es-app-noticelist-tree',
                    /*defaultExpandedKeys: '{{["genid"]}}',
                     selectedKeys: '{{data.treeSelectedKey}}',
                     onSelect: '{{$selectType}}',
                     children: '{{$renderTreeNodes(data.other.tree)}}'*/
                }
            });
        }
    };



    roleShow = (data) => {
        let role = this.metaAction.gf('data.roles')
                .toJS(),
            str = '';
        if (data.roleDtoList && data.roleDtoList.length > 0) {
            data.roleDtoList.forEach((perData) => {
                return role.forEach((roleData) => {
                    if (perData.roleId == roleData.id) {
                        str += roleData.name + ',';
                    }
                });
            });
            str = str.slice(0, length - 1);
        }
        if (data.isOrgCreator && data.isOrgCreator == true) {
            str = '创建者兼系统管理员';
        }
        return str;
    };

    //停用行置灰
    isEnable = (isEnable) => !!isEnable ? '' : 'no-enable'

    clickCompent = (obj) => !!obj.isEnable ?  <a title={obj.name} onClick={this.modifyDetail(obj.id)}>{obj.name}</a> : <label className={'no-enable'}>{obj.name}</label>
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o };
    metaAction.config({ metaHandlers: ret });
    return ret;
}
