import React from 'react'
import { Form, DatePicker, Popover, Button, Select, Input, Icon } from 'edf-component'
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import config from '../config';
import moment from 'moment';
import isEqual from 'lodash.isequal';
const FormItem = Form.Item;
const MonthPicker = DatePicker.MonthPicker;

class CustomerClass extends React.Component {
    constructor(props){
        super(props)
        this.state ={
            iptval:'',
            date: moment(this.props.date),
            enabledYearAndMonth: this.props.enabledYearAndMonth,
            dateLabelList:[
                {
                    id:1,
                    title:'会计期间：',
                },{
                    id:2,
                    title:'凭证生成期间：',
                },{
                    id:3,
                    title:'报税月份：',
                }
            ],
            dateLabel:'会计期间：',
            
        }
        this.config = config.current;
        this.webapi = this.config.webapi;
        this.metaAction = this.props.metaAction;
       
    }


    componentWillUpdate = (nextProps,nextState) => {
        if(!isEqual(nextProps.accountCode, this.props.accountCode)){
            const year = this.metaAction.gf("data.year"),
                  month = this.metaAction.gf("data.month"),
                  dateStr = year+'-'+month;
            this.setState({
                date: moment(dateStr)
            })
        }
        // console.log('finishmark',nextProps.finishmark)
    }

    iptChange = (e) =>{
        this.props.setMea('data.inputval',e.currentTarget.defaultValue);
        this.props.load();
    }
    iptChangeDown = (e) =>{
        this.props.setMea('data.inputval',e.currentTarget.defaultValue);
        // this.props.load();
    }

    dateChage = (e) => {//日期的选择日期的选择
        let bsyf = e.format('YYYY-MM')
        let kk = []
        kk = bsyf.split('-');
        this.props.setMea('data.year',kk[0]);
        this.props.setMea('data.month',kk[1]);
        this.setState({
            date: e
        })
        this.props.load()

    }

    disabledStartDate = (startValue) => {
        let enabledYearAndMonth = this.props.enabledYearAndMonth;
        if (enabledYearAndMonth) {
            return (
                startValue.valueOf() <
                new Date(
                    moment(enabledYearAndMonth)
                        .format("YYYY-MM-DD")
                        .substr(0, 7)
                ).valueOf() 
            );
        } else {
            return startValue.valueOf() > new Date().valueOf();
        }
    }

    fileExport = async () => {
        const accountCode = this.props.accountCode;
        let date=new Date;
        let years=date.getFullYear();
        let months=date.getMonth();
        if(accountCode == '3'){
            months = ((months+1)<10 ? "0"+(months+1):(months+1));
        }else{
            years = (months==0 ? years-1:years);
            months = (months==0 ? 12:(months<10 ? "0"+months:months));
        }
        years = (months==0 ? years-1:years);
        months = (months==0 ? 12:(months<10 ? "0"+months:months));
        const pagination = this.metaAction.gf('data.pagination').toJS()//分页数据
        const year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        const month = this.metaAction.gf('data.month') == ''? months.toString() : this.metaAction.gf('data.month')//申报月份
        let inputval= this.metaAction.gf('data.inputval'),//人员名称
            bmdm= this.metaAction.gf('data.bmdm'),
            list= this.metaAction.gf('data.list').toJS();

        if(accountCode == '2'){
            if(list.length>0){
                let option =  {
                    entity:{
                        year: year,    // 年份（必传）
                        bmdm:bmdm,    // 部门代码
                        month:month,  // 月份
                        name:inputval,
                    },
                    page:{
                        currentPage:1,
                        pageSize:9000
                    }
                  }
                await this.webapi.exportGztjList(option);
            }
        }else{
            if(list.length>0){
                let from = accountCode == 1 ? 'jzjd' : 'sbjd';
                let option =  {
                    entity:{
                        year: year,    // 年份（必传）
                        departmentCode:bmdm,    // 部门代码
                        month:month,  // 月份
                        personName:inputval,
                        from:from //来源（ jzjd ：记账进度  sbjd:申报进度）
                    },
                    page:{
                        currentPage:pagination.currentPage,
                        pageSize:pagination.pageSize
                    }
                  }
                await this.webapi.exportSbOrJzList(option);
            }
        }
    }

    renderPopover = () => {

    }

    getDateTitle = (accountCode) => {
        const { dateLabelList } = this.state;
        let dateLabel = dateLabelList.find(item => item.id==accountCode);
        return dateLabel.title;
    }

    render() {
        const {accountCode,finishmark} = this.props,
              monthFormat = 'YYYY-MM';
        let dateTitle = this.getDateTitle(accountCode),
            finishmarkStr = finishmark==0?'已结账':'已结转损益';
        

        return <div className='ttk-es-app-job-account-top'>
            <div className='topleft'>
                <div className='topleftInput'>
                    <div className='wrap'>
                        <div className="searchwhere">
                            <div className="searchleft">
                                <Input
                                    prefix={
                                        <Icon fontFamily='edficon' type='XDZsousuo' className='XDZsousuo'/>
                                    } 
                                    className='inputClass'
                                    showSearch={false}
                                    value={this.state.iptval}
                                    onKeyUp={(e) => this.iptChangeDown(e)}
                                    onPressEnter={(e) => this.iptChange(e)}
                                    placeholder="请输入人员" 
                                />
                            </div>
                            <Form className='finishflagrad'>
                                    <FormItem label={dateTitle}>
                                    <MonthPicker 
                                        value={this.state.date} 
                                        format={monthFormat} 
                                        disabledDate={this.disabledStartDate}
                                        onChange={(e) =>{this.dateChage(e)} }>
                                    </MonthPicker>
                                    </FormItem>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
                <div className='topright'>
                    {accountCode == 1 ? 
                        (<div style={{float:'left'}}>
                            <span>完成标识：</span><span style={{marginRight:'5px'}}>{finishmarkStr}</span>
                            <Popover 
                                placement='left'
                                overlayClassName='ttk-es-app-job-account-top-helpPopover'
                                content={
                                    <div className='popover'>
                                        <div>该模块状态完成标志与【记账进度】保持一致，如需调整，</div>
                                        <div>请到【记账进度】中进行调整。</div>
                                    </div>
                                }
                            >
                                <Icon type='primary' fontFamily='edficon' type='XDZtishi' className='helpIcon'/>
                            </Popover>
                        </div>) : null
                    }
                    <Button type='primary' onClick={this.fileExport}>导出</Button>
                </div>
        </div> 
    }
}

export default CustomerClass