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
            customers: [{value: 999, name: '全部'},{value: 2000010001, name: '一般纳税人'},{value: 2000010002, name: '小规模'}],
            customerValue: 999,
            gwoption: [],
            personList: [{name: '张三', id: 111},{name: '李四', id: 222}],
            bsyf:'',
            gwVal:'',
            year:'',//年份
            month:'',//月份
            iptval:'',
            nums:0,
            popVisible: false
        }
    }


    handleChangeRadio = (e) => {
        // console.log(e, 'eeee')
        this.props.setData('data.vatTaxpayer',e.target.value);
        this.setState({
            customerValue: e.target.value
        })
    }

    handleSearch = (e) => {
        // console.log(e, 'e search')

    }

    handleShaixuan = () => {
        // console.log('hanleShaixuan')
        let {nums,year,month} = this.state
        nums++;
        // let years = '';
        // let months = '';
        // let date=new Date;
        // let yearss=date.getFullYear();
        // let  monthss=date.getMonth()+1;
        // monthss =(monthss<10 ? "0"+monthss:monthss);
        // if(nums == 1){
            // debugger
            // years = yearss;
            // months = monthss;
        // }else {
            // debugger
            // years = year == '' ? yearss:year;
            // months = month == '' ?monthss : month;
        // }

        let res = this.props.getrenderVal();
        let resP = this.props.getpersonVal();
        let treeT = this.props.getTreeType();
        let roleI = this.props.getRoleId();
        this.setState({
            personList:resP,
            gwoption: res,
            gwVal:roleI,
            // bsyf:years + '-' + months,
            nums:nums,
            treeType:treeT
        })
    }

    handleSearchBtn = () => {
        this.props.load()
        this.hide();
    }

    handleCancel = () => {
        this.props.setData('data.vatTaxpayer',999);
        // this.props.setData('data.year','2019');
        // this.props.setData('data.month','999');
        this.props.setData('data.persioniL',[]);
        this.props.setData('data.persioniLs',[]);
        this.props.setData('data.iptval','');
        this.props.setData('data.gwVal','');
        this.setState({
            customerValue:999,
            // year:'',
            // month:'999',
            personList:[],
            gwVal:''
        })
    }


    dateChage = (e) => {//日期的选择
        let {bsyf} = this.state
        bsyf = e.format('YYYY-MM')
        this.setState({
            bsyf:bsyf
        })
        // console.log('rrrr',bsyf)
        let kk = []
        kk = bsyf.split('-');
        // console.log('\\\\\-',kk)
        this.props.setData('data.year',kk[0]);
        this.props.setData('data.month',kk[1]);
        const currentPage = 1;
        this.props.setData('data.pagination.currentPage',currentPage);
        this.props.load();

    }

    handleSelectPerson = async() => {
        this.hide();
        const res = await this.props.handleSelectPerson()
        // console.log(res, 'res')

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
            this.props.setData('data.persioniL',userIds);
            this.props.setData('data.persioniLs',r);
            this.setState({
                personList: r
            })
            this.show();
        }
    }

    handledeletePerson = (index) => {
        let {personList} =this.state
        personList.splice(index,1)
        // this.props.setData('data.persioniL',personList);
        this.setState({
            personList: personList
        })
        let userIds = [];
        if(personList.length != 0){
            personList.forEach(item => {
                userIds.push(item.sysUserId)
            })
        }else {
            this.props.setData('data.persioniL',[]);
        }
        this.props.setData('data.persioniL',userIds);
    }

    iptChange = (e) =>{
        this.props.setData('data.iptval',e.currentTarget.defaultValue);
        this.props.load();
    }
    iptChangeDown = (e) =>{
        this.props.setData('data.iptval',e.currentTarget.defaultValue);
        // this.props.load();
    }
    gwchange = (e) => {
        // console.log(e, 'eeee')
        this.setState({
            gwVal: e
        })
        this.props.setData('data.gwVal',e);
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
        let {customers, customerValue, personList,iptval,bsyf,gwoption,gwVal,treeType,popVisible} = this.state
        const  monthFormat = 'YYYY-MM';
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
        // console.log(dd,'yyy')
        return <div className='wrap'>
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
                    placeholder="请输入客户名称或助记码" />

                     <Popover  
                        overlayClassName='ttk-es-app-sbselist-top-fromDiv'
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
                                <FormItem label="岗位">
                                    <Select onChange={(e) => this.gwchange(e)} value={gwVal} getPopupContainer={trigger => trigger.parentNode}>
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
                                                <span value={item.sysUserId}>{item.ygmc}</span>
                                                <Icon fontFamily='edficon' type='XDZguanbishanchu' onClick={() => this.handledeletePerson(index)}></Icon>
                                            </div>
                                        })
                                    }
                                        <div className='aclass' onClick={() => this.handleSelectPerson()}><a href='javascript:;'>+选择人员</a></div>
                                    </div>
                                </FormItem>
                                <div className='btnDiv'>
                                    <Button fontFamily='edficon' className='acxBtnjzjd' type='primary' onClick={() => this.handleSearchBtn()}>查询</Button>
                                    <Button fontFamily='edficon' onClick={() => this.handleCancel()}>重置</Button>
                                </div>
                            </Form>
                        }
                        trigger='click'
                        visible={popVisible}
                        onVisibleChange={this.handlePopoverVisibleChange}
                    >
                        <Icon fontFamily='edficon' type='XDZshaixuan' onClick={() => this.handleShaixuan()}/>
                    </Popover>
                </div>
                <Form className='form-date'>
                    <FormItem label="报税月份">
                        <MonthPicker value={moment(bsyf == ''?bsyf1:bsyf,monthFormat)} format={monthFormat} onChange={(e) =>{this.dateChage(e)} }></MonthPicker>
                    </FormItem>
                </Form>
            </div>
        </div>
    }
}

export default CustomerClass
