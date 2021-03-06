import React from 'react';
import {action as MetaAction, AppLoader} from 'edf-meta-engine';
import {Menu, Checkbox, DataGrid, Icon, FormDecorator} from 'edf-component';
import {fromJS} from 'immutable';
import extend from './extend';
import config from './config';

class action {
    constructor(option) {
        this.metaAction = option.metaAction;
        this.extendAction = option.extendAction;
        this.voucherAction = option.voucherAction;
        this.config = config.current;
        this.webapi = this.config.webapi;
    }

    onInit = ({component, injections}) => {
        this.extendAction.gridAction.onInit({component, injections});
        this.component = component;
        this.injections = injections;
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        injections.reduce('init');
        this.load();
    };


    load = async () => {
        this.metaAction.sf('data.other.loading', true);

        let gl1 = this.webapi.gl({"codeGrade1": 1403}),
            gl2 = this.webapi.gl({"codeGrade1": 1405}),
            gl3 = this.webapi.gl({"codeGrade1": 1411}),
            list = this.webapi.findEnumList(),
            glArr = []
        if((await gl1).glAccounts.length > 1){
            glArr = [ ...glArr, ...(await gl1).glAccounts]
        }
        if((await gl2).glAccounts.length > 1){
            glArr = [ ...glArr, ...(await gl2).glAccounts]
        }
        if((await gl3).glAccounts.length > 1){
            glArr = [ ...glArr, ...(await gl3).glAccounts]
        }
        let option = {
                glArr,
                gradeSetting: (await gl1).gradeSetting,
                unitList: await list && (await list).unitList,
                dataList: await list && (await list).dataList
            }
        this.injections.reduce('load', option);
        this.metaAction.sf('data.other.loading', false);
        let listMap = {}, listSonMap = {}, gradeSettingArr = Object.values(option.gradeSetting)
        glArr.forEach((data) => {
            listMap[data.code] = data;
            listSonMap[data.code] = 0;
        })
        glArr.forEach((data) => {
            let slicelength = 0
            for (let i = 0; i < data.grade; i++) {
                slicelength += gradeSettingArr[i]
            }
            if (data.code.length > gradeSettingArr[0]) {
                listSonMap[data.code.slice(0, slicelength - gradeSettingArr[data.grade - 1])] = listSonMap[data.code.slice(0, slicelength - gradeSettingArr[data.grade - 1])] + 1
            }
            if (data.grade == 1) {
                data.subject2name = data.name
                data.subject3name = data.name
            } else if (data.grade == 2) {
                data.subject2name = listMap[data.code.slice(0, gradeSettingArr[0])].name
                data.subject3name = listMap[data.code.slice(0, gradeSettingArr[0])].name
            } else if (data.grade > 2) {
                data.subject2name = listMap[data.code.slice(0, slicelength - gradeSettingArr[data.grade - 1])].name
                data.subject3name = listMap[data.code.slice(0, slicelength - gradeSettingArr[data.grade - 2] - gradeSettingArr[data.grade - 1])].name
            }
            data.selected = true
        })
        this.metaAction.sfs({
            'data.listMap': fromJS(listMap),
            'data.listSonMap': fromJS(listSonMap),
            'data.list': fromJS(glArr),
        })
        if(glArr.length > 0) this.selectSon()
    };


    fieldChange = (path, value) => {
        this.voucherAction.fieldChange(path, value, this.check);
    };

    onOk = async () => {
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid'),
            data = this.metaAction.gf('data').toJS(),
            subject = data.form.subject,
            unitStatus = false
        if (!selectedArrInfo.length) {
            this.metaAction.toast('warning', '请选择科目');
            return false;
        }
        let endArr = selectedArrInfo.filter((data) => data.isEndNode == true)
        if (!subject.length) {
            this.metaAction.toast('warning', '存货名称自动取值规则不允许为空');
            return false;
        }
        endArr.forEach((endInfo) => {
            if(!endInfo.unitId){
                this.metaAction.toast('warning', '勾选的末级科目必须录入计量单位，才可以生成档案，请修改');
                unitStatus = true
                return false;
            }
        })
        if(unitStatus) return false
        let no = selectedArrInfo.filter(function (selectedInfo) {
            return !!selectedInfo.unitId
        })
        let sendArr = [],
            id_1403 = data.other.dataList.filter((data) => data.name == '原材料')[0].id,
            id_1405 = data.other.dataList.filter((data) => data.name == '商品')[0].id,
            id_1411 = data.other.dataList.filter((data) => data.name == '周转材料')[0].id

        endArr.forEach(function (endNode) {
            let obj = {
                propertyId: id_1403,
                unitId: endNode.unitId,
                inventoryRelatedAccountId: endNode.id,
                accountCode: endNode.code
            }
            let name = '';
            if(subject.length == 3){
                name = endNode.subject3name + endNode.subject2name + endNode.name
            } else if(subject.length == 2){
                if(subject.includes('subject1') && subject.includes('subject2')){
                    name = endNode.subject2name + endNode.name
                }else if(subject.includes('subject2') && subject.includes('subject3')){
                    name = endNode.subject3name + endNode.subject2name
                }else {
                    name = endNode.subject3name + endNode.name
                }
            } else{
                if(subject.includes('subject1')){
                    name = endNode.name
                }else if(subject.includes('subject2')){
                    name = endNode.subject2name
                }else {
                    name = endNode.subject3name
                }
            }
            obj.name = name
            if (data.form.specification.length > 0) {
                obj.specification = obj.name
            }
            if (endNode.code.indexOf('1405') > -1) {
                obj.propertyId = id_1405
            } else if (endNode.code.indexOf('1411') > -1) {
                obj.propertyId = id_1411
            }
            sendArr.push(obj)
        });
        let res = await this.webapi.inventoryCreate(sendArr)
        if(res){
            if(res.length == 0){
                 await this.metaAction.modal('success', {
                    title:  `您选择的末级科目一共${sendArr.length}条：生成档案成功${sendArr.length}条，生成失败0条` ,
                    width: 600,
                    wrapClassName: 'littlePadding_createba',
                    okText: '确定'
                })
            }else {
                let str = '';
                res.forEach((failData) => str += `${failData.accountCode}-${failData.name} `)
                await this.metaAction.modal('success', {
                    title:  `您选择的末级科目一共${sendArr.length}条：生成档案成功${sendArr.length - res.length}条，生成失败${res.length}条` ,
                    width: 600,
                    wrapClassName: 'littlePadding_createba',
                    content: <div>
                        <div>失败原因：</div>
                        <div>存在名称相同的存货档案，{str}无法生成存货档案，请修改后重新生成</div>
                    </div>,
                    okText: '确定'
                })
            }
        }else {
            return false
        }
    }

    //Todo
    // 选择生产档案的科目校验

    selectRow = (rowIndex) => (e) => {
        const data = this.metaAction.gf('data').toJS()
        let list = data.list,
            gradeSetting = Object.values(data.other.gradeSetting),
            gradeLevel = 0,
            gradeData = 0,
            item = list[rowIndex],
            indexArr = [];
        gradeSetting.forEach(function (data, i) {
            gradeData += Number(gradeSetting[i])
            if (item.code.length == gradeData) {
                return gradeLevel = i
            }
        })
        if (e.target.checked == true) {
            list.forEach(function (data, index) {
                for (var level = 0; level < gradeLevel; level++) {
                    let seliceLength = gradeSetting[0];
                    for (var sLength = level; sLength > 0; sLength--) {
                        seliceLength += gradeSetting[level]
                    }
                    if (data.code == (item.code.slice(0, seliceLength))) {
                        return indexArr.push(index)
                    }
                }
                if (data.code.indexOf(item.code) > -1) {
                    return indexArr.push(index)
                }
            })
        } else {
            let selectListSonMap = data.selectListSonMap,faArr = []
            if(item.grade > 1){
                for(let gradeIndex = item.grade; gradeIndex > 1; gradeIndex--){

                    let slicelength = 0
                    for (let i = 0; i < gradeIndex; i++) {
                        slicelength += gradeSetting[i]
                    }
                    if(selectListSonMap[item.code.slice(0, slicelength - gradeSetting[gradeIndex - 1])] == 1){
                        faArr.push(item.code.slice(0, slicelength - gradeSetting[gradeIndex - 1]))
                    }else {
                        break
                    }
                }
            }
            list.forEach(function (data, index) {
                faArr.forEach(function (faData) {
                    if(faData == data.code){
                        return indexArr.push(index)
                    }
                })
                if (data.code.indexOf(item.code) > -1) {
                    return indexArr.push(index)
                }
            })
        }
        this.injections.reduce('selectRow', indexArr, e.target.checked);
        this.selectSon()
    };

    selectSon = () => {
        let gradeSetting = this.metaAction.gf('data.other.gradeSetting').toJS(),
            selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid'),
            selectListSonMap = {},
            gradeSettingArr = Object.values(gradeSetting)
        selectedArrInfo.forEach((data) => {
            selectListSonMap[data.code] = 0
        })
        selectedArrInfo.forEach((data) => {
            let slicelength = 0
            for (let i = 0; i < data.grade; i++) {
                slicelength += gradeSettingArr[i]
            }
            if (data.code.length > gradeSettingArr[0]) {
                selectListSonMap[data.code.slice(0, slicelength - gradeSettingArr[data.grade - 1])] = selectListSonMap[data.code.slice(0, slicelength - gradeSettingArr[data.grade - 1])] + 1
            }
        })
        this.metaAction.sfs({
            'data.selectListSonMap': fromJS(selectListSonMap),
        })
    }

    indentCalculate = (code) => {
        if (code.length > 4) {
            let size = (code.length - 4) / 2 * 12
            return {paddingLeft: size + 'px'}
        }
    }

    unitChange = (id, rowIndex) => {
        const data = this.metaAction.gf('data').toJS()
        let list = data.list,
            item = list[rowIndex],
            indexArr = [];
        this.metaAction.sfs({
            [`data.list.${rowIndex}.unitReadonly`]: true,
            [`data.list.${rowIndex}.unitId`]: id,

        })
        list.forEach(function (data, index) {
            if (data.code.indexOf(item.code) > -1 && !data.unitReadonly) {
                return indexArr.push(index)
            }
        })
        this.injections.reduce('unitChange', indexArr, id);
    }

    example = () => {
        const data = this.metaAction.gf('data').toJS();
        let subject = data.form.subject,name = '';
        if(subject.length == 3){
            name = '手机华为荣耀8（红）'
        } else if(subject.length == 2){
            if(subject.includes('subject1') && subject.includes('subject2')){
                name = '华为荣耀8（红）'
            }else if(subject.includes('subject2') && subject.includes('subject3')){
                name = '手机华为'
            }else {
                name = '手机荣耀8（红）'
            }
        } else{
            if(subject.includes('subject1')){
                name = '荣耀8（红）'
            }else if(subject.includes('subject2')){
                name = '华为'
            }else {
                name = '手机'
            }
        }
        let str = `科目140501 手机； 14050102 华为； 1405010203 荣耀8（红）； 生成的档案名称----${name}`
        return str
    }

    toastNull = (arr) => {
        if(arr.length == 0)  this.metaAction.toast('error', '存货名称自动取值规则不允许为空')
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({...option, metaAction}),
        voucherAction = FormDecorator.actionCreator({...option, metaAction}),
        o = new action({...option, metaAction, voucherAction, extendAction}),
        ret = {...metaAction, ...voucherAction, ...extendAction.gridAction, ...o};
    metaAction.config({metaHandlers: ret});
    return ret;
}

