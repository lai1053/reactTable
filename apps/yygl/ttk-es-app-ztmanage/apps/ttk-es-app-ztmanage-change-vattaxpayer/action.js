import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'
import {consts} from 'edf-consts'
import {fetch} from 'edf-utils'
import {LoadingMask} from 'edf-component'

import {FormDecorator} from 'edf-component'
import {message} from "antd/lib/index";

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi

    }

    onInit = ({component, injections}) => {
        this.voucherAction.onInit({component, injections})
        this.component = component
        this.injections = injections

        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        injections.reduce('init', component.props.params);
        console.log(component.props.params.vattaxpayer)
        // if(component.props.params.vattaxpayer == '一般纳税人'){
        //     if(component.props.params.isTutorialDate == true){
        //         this.metaAction.sf('data.isEnable',true)
        //         this.metaAction.sf('data.vatTaxpayer',2000010001)
        //         this.metaAction.sf('data.fdq',1)
        //         this.metaAction.sf('data.fdqStartDate',component.props.params.form.tutorialBeginDate)
        //         // this.metaAction.sf('data.fdqEndDate',component.props.params.form.tutorialEndDate)
        //     }else {
        //         this.metaAction.sf('data.isEnable',false)
        //         this.metaAction.sf('data.vatTaxpayer',2000010002)
        //     }
        // }else {
        //     this.metaAction.sf('data.vatTaxpayer',2000010001)
        // }

        this.load();

    }



    load = async() => {
        let date=new Date;
        let year=date.getFullYear();
        let month=date.getMonth()+1;
            month =(month<10 ? "0"+month:month);
        let cdate =  (year.toString()+"-"+month.toString()+"-"+"01");

        //一般纳税人和小规模的有效期起时间为当前自然月1号
        this.injections.reduce('update',{path:'data.xgmDate',value:cdate});
        // this.metaAction.sf('data.ybnsrDate',cdate)

        let vattaxpayer = this.metaAction.gf('data.vattaxpayer')//进来前是什么身份
        let ret = await this.webapi.change.queryInfo({orgId:this.component.props.params.id})
        if(ret){
            this.metaAction.sfs({
                'data.isfirst':ret.isfirst,
                'data.form':ret
            })
            console.log( this.metaAction.gf('data.form'),'form')
            if(ret.isfirst == 1){//1表示是没有变更过
                this.injections.reduce('update',{path:'data.enabledDate',value:ret.yxqq});//没变更过取账套启用日期
                console.log(ret.yxqq,'我是账套启用日期')
            }else {
                console.log(this.getNextMonth(ret.yxqq),'我是有效期的次月')
                // this.metaAction.sf('data.ybnsrDate',ret.yxqq)
                // if(ret.isTutorialDate == 1){
                //     this.metaAction.sf('data.ybnsrDate',ret.yxqq)
                // }
                // this.metaAction.sf('data.xgmDate',ret.yxqq)
                this.injections.reduce('update',{path:'data.enabledDate',value:this.getNextMonth(ret.yxqq)});//变更过取上次有效期的次月
            }
            // if(ret.isTutorialDate == 1){
            //     this.metaAction.sf('data.ybnsrDatee',ret.yxqq)
            //     this.metaAction.sf('data.xgmDatee',ret.yxqq)
            // }

            this.metaAction.sfs({
                'data.ybnsrDatee':ret.yxqq,
                'data.xgmDatee':ret.yxqq
            })

            //一般纳税人和小规模身份变更
            if(vattaxpayer == '一般纳税人'){
                if(ret.isTutorialDate== 1){//是辅导期
                    this.metaAction.sfs({
                        'data.isEnablee':true,
                        'data.nsrsf':2000010001,
                        'data.nsrsf1':2000010001,
                        'data.fdq':1,
                        'data.fdqStartDate':ret.tutorialBeginDate,
                        'data.fdqEndDate':ret.tutorialEndDate,
                        'data.fdqE':ret.tutorialEndDate,
                        'data.ybnsrDate':this.getNextMonth(ret.tutorialEndDate)+'-01',
                    })
                }else {//不是辅导期
                    this.metaAction.sfs({
                        'data.isEnable':false,
                        'data.nsrsf':2000010002,
                        'data.nsrsf1':2000010002,
                        'data.ybnsrDate':cdate
                    })
                }
            }else {
                this.metaAction.sfs({
                    'data.nsrsf':2000010001,
                    'data.nsrsf1':2000010001,
                    'data.ybnsrDate':cdate
                })
            }

        }

        console.log(this.metaAction.gf('data.nsrsf',2000010001),'nsrsf')

    }

    onOk = async() => {
        console.log('ok')
        let date=new Date;
        let year=date.getFullYear();
        let month=date.getMonth()+1;
        month =(month<10 ? "0"+month:month);
        let cdate =  (year.toString()+"-"+month.toString()+"-"+"01");
        let nsrsf = this.metaAction.gf('data.nsrsf');
        let isEnable = this.metaAction.gf('data.isEnable');
        let fdqStart = this.metaAction.gf('data.fdqStartDate');
        let fdqEnd = this.metaAction.gf('data.fdqEndDate');
        let isfdq = ''
        let yxqq = ''
        let yxqq1 = ''
        let form = this.metaAction.gf('data.form')
        console.log(form,'formm')

        if(nsrsf == 2000010001){
            yxqq = this.metaAction.gf('data.ybnsrDate')
            yxqq1 = this.metaAction.gf('data.ybnsrDatee')
            if(isEnable){
                isfdq = 1;
                if (fdqEnd == ''){
                    message.warning('请选择辅导期有效期结束时间')
                    return false
                }
            }else {
                isfdq = 0;
            }
        }else {
            yxqq = this.metaAction.gf('data.xgmDate')
            yxqq1 = this.metaAction.gf('data.xgmDatee')
            isfdq = 0;
            fdqStart = '';
            fdqEnd = '';
        }

        if(isfdq == 0){
            fdqStart = ''
            fdqEnd = ''
        }
        let data = {};
        // if(isfdq != form.isTutorialDate || yxqq1 != form.yxqq || fdqStart != form.tutorialBeginDate || fdqEnd != form.tutorialEndDate ){
        let formDate = new Date(form.yxqq);//上次的变更日期
        let chooseDate = new Date(yxqq);//这次选择的日期
        console.log(chooseDate.getTime(),'choose')
        console.log(chooseDate,'choose1')
        console.log(formDate.getTime(),'form')
        console.log(formDate,'form1')
        console.log(new Date(cdate).getTime(),'cdate')
        if(formDate.getTime() >= new Date(cdate).getTime()){
            if(isfdq == 1){
                data.orgId = this.component.props.params.id;
                data.sffdq = isfdq;
                data.nsrsf = nsrsf;
                data.yxqq = yxqq;
                data.fdqq = fdqStart;
                data.fdqz = fdqEnd;
                console.log(data,'data')
                this.component.props.closeModal();
            }else {
                await this.metaAction.modal('warning', {
                    // title: '提示',
                    content:(
                        <div>
                            <p>"生效期起" 不能与上次变更时间相同，请修改！</p>
                        </div>
                    ),
                    okText: '确定',
                });
                return false
            }


        }
        if(form.isTutorialDate == 1){//变更前是辅导期
            if(formDate.getTime() <= chooseDate.getTime() ){
                data.orgId = this.component.props.params.id;
                data.sffdq = isfdq;
                data.nsrsf = nsrsf;
                data.yxqq = yxqq;
                data.fdqq = fdqStart;
                data.fdqz = fdqEnd;
                console.log(data,'data')
                this.component.props.closeModal();
            }else {
                // this.component.props.closeModal();
                await this.metaAction.modal('warning', {
                    // title: '提示',
                    content:(
                        <div>
                            <p>"生效期起" 不能与上次变更时间相同，请修改！</p>
                        </div>
                    ),
                    okText: '确定',
                });
                return false
            }
        }
        else {//变更前不是辅导期
            if(formDate.getTime() >= new Date(cdate).getTime()){
                // if(isfdq == 1){
                //     data.orgId = this.component.props.params.id;
                //     data.sffdq = isfdq;
                //     data.nsrsf = nsrsf;
                //     data.yxqq = yxqq;
                //     data.fdqq = fdqStart;
                //     data.fdqz = fdqEnd;
                //     console.log(data,'data')
                //     this.component.props.closeModal();
                // }else {
                    await this.metaAction.modal('warning', {
                        // title: '提示',
                        content:(
                            <div>
                                <p>"生效期起" 不能与上次变更时间相同，请修改！</p>
                            </div>
                        ),
                        okText: '确定',
                    });
                    return false
                // }


            }
            if(formDate.getTime() < chooseDate.getTime() ){
                data.orgId = this.component.props.params.id;
                data.sffdq = isfdq;
                data.nsrsf = nsrsf;
                data.yxqq = yxqq;
                data.fdqq = fdqStart;
                data.fdqz = fdqEnd;
                console.log(data,'data')
                this.component.props.closeModal();
            }else {
                // this.component.props.closeModal();
                await this.metaAction.modal('warning', {
                    // title: '提示',
                    content:(
                        <div>
                            <p>"生效期起" 不能与上次变更时间相同，请修改！</p>
                        </div>
                    ),
                    okText: '确定',
                });
                return false
            }
        }





        const ret = await this.metaAction.modal('show', {
            title: null,
            width:350,
            footer:null,
            className:'ttk-es-app-ztmanage-vattaxpayer-confirm-modal',
            children: this.metaAction.loadApp('ttk-es-app-ztmanage-vattaxpayer-confirm', {
                store: this.component.props.store,
                params:data,
                fun:this.component.props.fun,
            })
        })

    }

    onCancel = () => {
        console.log('cancel')
        this.component.props.closeModal();
    }

    //一般纳税人和小规模有效期时间选择：账套启用日期~当前自然月份
    disabledDate = (current) => {
        let time = this.metaAction.gf('data.enabledDate')
        let date=new Date;
        let year=date.getFullYear();
        let month=date.getMonth()+1;
        month =(month<10 ? "0"+month:month);
        let cdate =  (year.toString()+"-"+month.toString());
        // let cdate = this.metaAction.gf('data.ybnsrDate')
        return  current < moment(time) || current > moment(this.getNextMonth(cdate));
        // return current<moment(time).subtract(3,'month') || current>moment(time).add(3,'m')
    }

    //辅导期有效期开始时间：
    disabledDateFDQStart = (current) => {
        let fdq = this.metaAction.gf('data.fdq')
        let time = this.metaAction.gf('data.enabledDate')
        let date=new Date;
        let year=date.getFullYear();
        let month=date.getMonth()+1;
        month =(month<10 ? "0"+month:month);
        let cdate =  (year.toString()+"-"+month.toString());
        if(fdq == 0){
            return  current < moment(time) || current > moment(this.getNextMonth(cdate));
        }
    }

    //辅导期有效期结束时间：
    disabledDateFDQEnd = (current) => {
        let fdq = this.metaAction.gf('data.fdq')
        // let time = this.getNextMonth(this.metaAction.gf('data.fdqStartDate'))
        let time = this.metaAction.gf('data.fdqStartDate')
        // let timeEnd = this.getNextMonth(this.metaAction.gf('data.fdqE'))
        let timeEnd = this.metaAction.gf('data.fdqE')
        // console.log(time,5555)
        // console.log(timeEnd,6666)
        if(fdq == 0){
            return current > moment(time).add(6, 'month') || current < moment(time)
        }else {
            return current > moment(timeEnd).add(6, 'month') || current < moment(timeEnd)
        }

    }

    //获取下一个月
    getNextMonth = (date) => {
        let arr = date.split('-');
        let year = arr[0]; //获取当前日期的年份
        let month = arr[1]; //获取当前日期的月份
        // let day = arr[2]; //获取当前日期的日
        let days = new Date(year, month);
        days = days.getDate(); //获取当前日期中的月的天数
        let year2 = year;
        let month2 = parseInt(month) + 1;
        if (month2 == 13) {
            year2 = parseInt(year2) + 1;
            month2 = 1;
        }
        // let day2 = day;
        // let days2 = new Date(year2, month2, 0);
        // days2 = days2.getDate();
        // if (day2 > days2) {
        //     day2 = days2;
        // }
        if (month2 < 10) {
            month2 = '0' + month2;
        }

        // let t2 = year2 + '-' + month2+ '-' + day2;
        let t2 = year2 + '-' + month2;
        return t2;
    }

    //获取一个月份有多少天
    getMonthLength = (date) => {
        let arr = date.split('-');
        let year = arr[0]; //获取当前日期的年份
        let month = arr[1]; //获取当前日期的月份
        let days = new Date(year, month,0);
        days = days.getDate(); //获取当前日期中的月的天数
        return days
    }

    //小规模有效期起时间选择
    xgmDateChange = (e) => {
        console.log(e.format('YYYY-MM-DD'),'我是小规模有效期起')
        this.metaAction.sfs({
            'data.xgmDate':e.format('YYYY-MM-DD'),
            'data.xgmDatee':e.format('YYYY-MM-DD')
        })
    }

    //一般纳税人有效期起时间选择
    ybnsrDateChange = (e) => {
        console.log(e.format('YYYY-MM'),'我是一般纳税人有效期起')
        this.metaAction.sfs({
            'data.ybnsrDate':e.format('YYYY-MM-DD'),
            'data.ybnsrDatee':e.format('YYYY-MM-DD')
        })
    }

    //一般纳税人辅导期有效期开始时间选择
    fdqStartChange = (e) => {
        console.log(e.format('YYYY-MM-DD'),'我是辅导期有效期起')
        let date = e.format('YYYY-MM')+'-01'
        this.metaAction.sfs({
            'data.fdqStartDate':date,
            'data.fdqEndDate':'',
            'data.fdqE':''
        })
    }

    //一般纳税人辅导期有效期结束时间选择
    fdqEndChange = (e) => {
        console.log(e.format('YYYY-MM-DD'),'我是辅导期有效期止')
        let date = e.format('YYYY-MM')
        let days = this.getMonthLength(date)
        days =(days<10 ? "0"+days:days);
        console.log(days,'days')
        date = date + '-' + days
        //一般纳税人有效期起时间为 辅导期结束时间的次月
        this.metaAction.sfs({
            'data.fdqEndDate':date,
            'data.ybnsrDate':this.getNextMonth(e.format('YYYY-MM'))+'-01',
        })
    }

    checkboxChange = () => {//是否选择辅导期
        let checked = this.metaAction.gf('data.isEnable');
        let isfirst = this.metaAction.gf('data.isfirst');
        let date=new Date;
        let year=date.getFullYear();
        let month=date.getMonth()+1;
        month =(month<10 ? "0"+month:month);
        let cdate =  (year.toString()+"-"+month.toString()+"-"+"01");
        let fdq = this.metaAction.gf('data.fdq')//是否是辅导期的客户 0不是辅导期 1是辅导期
        if(!checked){
            if(fdq == 0){
                console.log(1)
                // if(isfirst == 1){
                    this.metaAction.sfs({
                        'data.fdqStartDate':cdate,
                        'data.fdqE':cdate,
                    })
                // }
            }else {
                console.log(2)
                // this.metaAction.sf('data.ybnsrDate',cdate)
            }
        }else {
            if(fdq == 1){
                console.log(3)
                this.metaAction.sfs({
                    'data.enabledDate':this.getNextMonth(this.metaAction.gf('data.fdqStartDate'))+'-01',
                    'data.ss':true,
                })
            }else {
                console.log(4)
                this.injections.reduce('update',{path:'data.ss',value:false});
            }

        }
        this.metaAction.sfs({
            'data.isEnable':!checked,
            'data.isEnablee':!checked,
        })
    }


    changeValue = (e) => {//切换纳税人身份
        let fdq = this.metaAction.gf('data.fdq')//是否是辅导期的客户 0不是辅导期 1是辅导期
        if(e.target.value == 2000010002){
            this.metaAction.sfs({
                'data.fdq':1,
                'data.xgmV':1,
            })
            if(fdq == 1){
                this.metaAction.sfs({
                    'data.enabledDate':this.metaAction.gf('data.fdqStartDate'),
                    'data.xgmDate':this.getNextMonth(this.metaAction.gf('data.fdqEndDate'))+'-01',
                })
            }
        }else {
            this.injections.reduce('update',{path:'data.xgmV',value:0});
        }
        this.injections.reduce('update',{path:'data.nsrsf',value:e.target.value});
        // this.metaAction.sf('data.nsrsf1',e.target.value)
    }

    getAccessToken = () => {
        let token = fetch.getAccessToken()
        return {token: token}
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({...option, metaAction}),
        o = new action({...option, metaAction, voucherAction}),
        ret = {...metaAction, ...voucherAction, ...o}

    metaAction.config({metaHandlers: ret})

    return ret
}
