import React from 'react'
import { Form, DatePicker, Radio, Button, Select, Input, Icon, Popover } from 'edf-component'
import moment from 'moment'
const FormItem = Form.Item
const RadioGroup = Radio.Group;
const MonthPicker = DatePicker.MonthPicker

class CustomerClass extends React.Component {
    constructor(props){
        super(props)
        this.state ={
            customers: [
                {value: '0', name: '全部'},
                {value: '2000010001', name: '一般纳税人'},
                {value: '2000010002', name: '小规模'}
                ],
            customerValue: '0',//纳税人性质
            shuifei:[
                {value: '', name: '全部'},
                {value: 'hzzt', name: '汇总状态'},
                {value: 'zzs', name: '增值税'},
                {value: 'cswhjsf', name: '城建税'},
                {value: 'jyffj', name: '教育附加'},
                {value: 'dfjyffj', name: '地方附加'},
                {value: 'yhs', name: '印花税'},
                {value: 'whsyjsfyl', name: '文化建设费'},
                {value: 'qysds', name: '企业所得税'},
                {value: 'kjgrsds', name: '个税'},
                {value: 'xfs', name: '消费税'},
                {value: 'cwbb', name: '财务报表'},
                {value: 'cbj', name: '残保金'},
                {value: 'sljj', name: '水利基金'},
                {value: 'ghjf', name: '工会经费'},
            ],
            shuifeiValue:'',//税费种
            shenbaoStates:{
                singleStatus:[
                    {value: '', name: '全部'},
                    {value: '310', name: '已完成'},
                    {value: '210', name: '已申报'},
                    {value: '100', name: '未申报'},
                    {value: '000', name: '无任务'},
    
                ],
                huizongStatus:[
                    {value: '', name: '全部'},
                    {value: '310', name: '已完成'},
                    {value: '100', name: '未完成'},
                    {value: '000', name: '无任务'},
                ]
            },
            shenbaoState:[
                {value: '', name: '全部'},
                {value: '310', name: '已完成'},
                {value: '210', name: '已申报'},
                {value: '100', name: '未申报'},
                {value: '000', name: '无任务'},
            ],
            shenbaoValue:'',
            personList: [
                // {name: '张三', id: 111},{name: '李四', id: 222}
                ],//选择的人员
            year:'',//年份
            month:'',//月份
            bsyf:'',
            inputValue:'',//文本框
            gwoption: [],
            gwValue:'',//岗位
            num:0,//控制删除选择人员
            nums:0,//控制时间控件
            treeType:'',//左侧树权限
            popVisible: false,
            isStatus:true //状态下拉框是否可点击
        }
    }



    handleChangeRadio = (e) => {//纳税人性质
        // console.log(e, 'eeee')
        this.setState({
            customerValue: e.target.value
        })
        this.props.setData('data.vatTaxpayer',e.target.value);
    }
    handleChangeShuifei = (e) => {//税费种
        // console.log(e, 'eeee')
        let isStatus = true,
            {shenbaoState,shenbaoStates,shenbaoValue,shuifeiValue} = this.state;

        if(e!=shuifeiValue && ((e=='' || e=='hzzt') || (shuifeiValue=='' || shuifeiValue=='hzzt'))){
            shenbaoValue = '';
        }
        if(e!=''){
            isStatus = false;
            if(e=='hzzt'){
                shenbaoState = shenbaoStates.huizongStatus;
            }else{
                shenbaoState = shenbaoStates.singleStatus;
            }
        }
        this.setState({
            shuifeiValue: e,
            isStatus: isStatus,
            shenbaoState: shenbaoState,
            shenbaoValue: shenbaoValue
        })
        this.props.setData('data.shuifei',e);
        this.props.setData('data.shenbaoState',shenbaoValue);
    }
    handleChangeShenbao = (e) => {//申报状态
        // console.log(e, 'eeee')
        this.setState({
            shenbaoValue: e
        })
        this.props.setData('data.shenbaoState',e);
    }
    handleChangeGW = (e) => {//岗位Id
        // console.log(e, 'eeee')
        this.setState({
            gwValue: e
        })
        this.props.setData('data.roleId',e);
    }

    handleSearch = (e) => {
        // console.log(e, 'e search')
        
    }

    handleShaixuan = () => {//显示高级筛选框
        // console.log('hanleShaixuan')
        let {num,nums,year,month} = this.state
        num++;
        // nums++;
        // let years = '';
        // let months = '';
        // let date=new Date;
        // let yearss=date.getFullYear();
       // let  monthss=date.getMonth()+1;
       //  monthss =(monthss<10 ? "0"+monthss:monthss);
       //  if(nums == 1){
            // debugger
            // years = yearss;
            // months = monthss;
        // }else {
            // debugger
            // years = year == '' ? yearss:year;
            // months = month == '' ?monthss : month;
        // }
        // this.props.setData('data.num',num);
        let res = this.props.getrenderVal();
        let resP = this.props.getpersonVal();
        let treeT = this.props.getTreeType();
        let roleI = this.props.getRoleId();
        this.setState({
            personList:resP,
            gwoption: res,
            gwValue:roleI,
            num:num,
            // bsyf:years + '-' + months,
            // nums:nums,
            treeType:treeT
        })
    }

    handleSearchBtn = () => {//点击查询操作
        this.props.setData('data.isTypesAll',false);
        this.props.load();
        this.hide();
    }

    handleCancel = () => {//重置操作
        // let {num,nums,year,month} = this.state
        // let date=new Date;
        // let years=date.getFullYear();
        // let  months=date.getMonth()+1;
        // months =(months<10 ? "0"+months:months);
        this.setState({
            customerValue:'0',
            inputValue:'',
            gwValue:'',
            shuifeiValue:'',
            shenbaoValue:'',
            isStatus: true,
            // bsyf:years + '-' + months,
            personList:[],
            nums:0,
        })
        this.props.setData('data.inputValue','');
        // this.props.setData('data.year','');
        // this.props.setData('data.month','');
        this.props.setData('data.vatTaxpayer','0');
        this.props.setData('data.userIds',[]);
        this.props.setData('data.roleId','');
        this.props.setData('data.shuifei','');
        this.props.setData('data.shenbaoState','');
        // this.props.setData('data.gwoption',[]);
        this.props.setData('data.users',[]);
        // this.props.load()
    }

    handledeletePerson = (e,index) => {//删除选择的人员
        let {personList} =this.state
        // console.log(e, 'index')
        // console.log('我是删除前的人员显示',personList)
        personList.splice(e,1)
        // console.log('我是删除后的人员显示',personList)
        this.setState({
            personList: personList
        })

        let userIds = [];
        if(personList.length != 0){
            personList.forEach(item => {
                userIds.push(item.sysUserId)
            })
        }else {
            this.props.setData('data.userIds',[]);
        }
        this.props.setData('data.userIds',userIds);

    }

    handleSelectPerson = async() => {//选择人员
        this.hide();
        const res = await this.props.handleSelectPerson()
        // console.log(res, '2222res')

        if (res) {
            let {personList} =this.state
            let userIds = [];
            personList = personList.concat(res)
            const sysUserId = 'sysUserId';
            const r = personList.reduce((all, next) => all.some((atom) => atom[sysUserId] == next[sysUserId]) ? all : [...all, next],[]);
            if(r != 0){
                r.forEach(item => {
                    userIds.push(item.sysUserId)
                })
            }
            this.props.setData('data.userIds',userIds);
            this.props.setData('data.users',r);
            this.setState({
                personList: r
            })
            this.show();
            // console.log(userIds, '333res')
        }
    }

    handleValue1 = (e) =>{
        let {inputValue} = this.state
        this.setState({
            inputValue:e.target.value
        })
        this.props.setData('data.inputValue',e.target.value);
        this.props.setData('data.isTypesAll',false);
    }
    handleValue = (e) =>{
        this.props.setData('data.inputValue',e.currentTarget.defaultValue);
        this.props.setData('data.isTypesAll',false);
        this.props.load();
    }


    dateChage = (e) => {//日期的选择
        // console.log('eeee',e.format('YYYY-MM'))
        let {bsyf} = this.state
        bsyf = e.format('YYYY-MM')
        // console.log('rrrr',bsyf)
        let kk = []
        kk = bsyf.split('-');
        // console.log('\\\\\-',kk)
        this.props.setData('data.year',kk[0]);
        this.props.setData('data.month',kk[1]);
        this.setState({
            bsyf:bsyf,
            year: kk[0],
            month: kk[1]
        })
        const currentPage = 1;
        this.props.setData('data.pagination.currentPage',currentPage);
        this.props.setData('data.isTypesAll',false);
        this.props.load()

    }

    handlePopoverVisibleChange = (visible) => {
        this.setState({
            popVisible: visible,
        })
    }
    hide = () => {
        this.setState({
            popVisible: false,
        });
    }

    show = () => {
        this.setState({
            popVisible: true,
        });
    }

    render() {
        // debugger
        let {customers, 
            customerValue, 
            personList,
            bsyf,
            shuifei,
            shenbaoState ,
            shuifeiValue,
            shenbaoValue,
            gwoption,
            gwValue,
            treeType,
            popVisible,
            isStatus} = this.state;
        let date=new Date;
        let year=date.getFullYear();
        let  month=date.getMonth()+1;
        let bsyf1 = year + '-' + month
        let years = this.props.getYear();
        let months = this.props.getMonths();
        let dd = ''
        if(years == '' && months == ''){
            dd = ''
        }else {
            dd = years +'-'+ months
        }
        bsyf = dd;
        const  monthFormat = 'YYYY-MM';
        return <div className='wrap'>
            <Input
            prefix={
                <Icon fontFamily='edficon' type='XDZsousuo' className='XDZsousuo'/>
            } 
            className='inputClass'
            showSearch={false}
            placeholder="请输入客户名称或助记码"
            value={this.state.inputValue}
            onChange = {(e) =>{this.handleValue1(e)}}
            onPressEnter={(e) => this.handleValue(e)}
            />

            <Popover  
                overlayClassName='ttk-es-app-taxdeclaration-top-fromDiv'
                placement='bottom' 
                title=''
                content={
                    <Form className='Form'>
                        <FormItem label="客户分类">
                            <RadioGroup value={customerValue} onChange={(e) => this.handleChangeRadio(e)}>
                                {
                                    customers&&customers.map(item => {
                                        return <Radio value={item.value}>{item.name}</Radio>
                                    })
                                }
                            </RadioGroup>
                        </FormItem>
                        <FormItem label="税费种">
                            <Select value={shuifeiValue} onChange={(e) => this.handleChangeShuifei(e)} getPopupContainer={trigger => trigger.parentNode}>
                                {
                                    shuifei&&shuifei.map(item => {
                                        return <Option value={item.value}>{item.name}</Option>
                                    })
                               }
                            </Select>
                        </FormItem>
                        <FormItem label="状态">
                                <Select disabled={isStatus} value={shenbaoValue} onChange={(e) => this.handleChangeShenbao(e)} getPopupContainer={trigger => trigger.parentNode}>
                                    {
                                        shenbaoState&&shenbaoState.map(item => {
                                            return <Option value={item.value}>{item.name}</Option>
                                        })
                                    }
                                </Select>
                        </FormItem>
                        {/*<FormItem label="报税月份">*/}
                                {/*<MonthPicker value={moment(bsyf,monthFormat)} format={monthFormat} onChange={(e) =>{this.dateChage(e)} }></MonthPicker>*/}
                        {/*</FormItem>*/}
                        <FormItem  label="岗位">
                            <Select value={gwValue} onChange={(e) => {this.handleChangeGW(e)}} getPopupContainer={trigger => trigger.parentNode}>
                                {
                                    gwoption&&gwoption.map(item => {
                                        return <Option value={item.id}>{item.postName}</Option>
                                    })
                                }
                            </Select>
                        </FormItem>
                        <FormItem style={treeType=='self'?{display:'none'}:{display:'flex'}} className='personClass' label="人员">
                            <div className='person'>
                            {
                                personList&&personList.map((item, index) => {
                                    return <div className='personName' key={index}>
                                        <span>{item.ygmc}</span>
                                        <Icon fontFamily='edficon' type='XDZguanbishanchu' onClick={() => this.handledeletePerson(index)}></Icon>
                                    </div>
                                })
                            }
                                <div className='aclass' onClick={() => this.handleSelectPerson()}><a href='javascript:;'>+选择人员</a></div>
                                {/* <div style={{clear:'both'}}></div> */}
                            </div>
                        </FormItem>
            
                        <div className='btnDiv'>
                            <Button fontFamily='edficon' type='primary' onClick={() => this.handleSearchBtn()}>查询</Button>
                            <Button style={{marginLeft:'5px'}} fontFamily='edficon' onClick={() => this.handleCancel()}>重置</Button>
                        </div>
                    </Form>}
                trigger='click'
                visible={popVisible}
                onVisibleChange={this.handlePopoverVisibleChange}
            >
                <Icon fontFamily='edficon' type='XDZshaixuan' onClick={() => this.handleShaixuan()}/>
            </Popover>

            <Form className='form-date'>
                <FormItem label="报税月份">
                    <MonthPicker value={moment(bsyf == ''?bsyf1:bsyf,monthFormat)} format={monthFormat} onChange={(e) =>{this.dateChage(e)} }></MonthPicker>
                </FormItem>
            </Form>
        </div>
    }
}

export default CustomerClass