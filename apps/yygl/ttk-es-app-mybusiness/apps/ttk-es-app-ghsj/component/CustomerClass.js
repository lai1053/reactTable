import React from 'react'
import { Form, DatePicker, Radio, Button, Select, Input, Icon } from 'edf-component'
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import config from '../config';
import moment from 'moment'
// import Select from "antd/es/select/index.d";
const FormItem = Form.Item
const RadioGroup = Radio.Group;
const MonthPicker = DatePicker.MonthPicker

class CustomerClass extends React.Component {
    constructor(props){
        super(props)
        // this.gwval=  this.props.getrenderVal()
// console.log( this.gwval,'33333')
//         debugger

        this.state ={
            finishflag: [{value: 0, name: '已结账'},{value: 1, name: '已结转损益'}],
            customers: [{value: 0, name: '全部'},{value: 2000010001, name: '一般纳税人'},{value: 2000010002, name: '小规模'}],
            jzzt: [{value: 999, name: '全部'},{value: '000', name: '今天'},{value: '001', name: '昨天'},{value: '002', name: '本周'},{value: '003', name: '上周'},{value: '004', name: '本月'},{value: '005', name: '上月'}],
            jizzt: [{value: 999, name: '全部'},{value: 0, name: '无任务'},{value: 1, name: '未完成'},{value: 1, name: '已完成'}],
            ndoption: [{ name: '全部'},{name: '一般'},{ name: '紧急'},{ name: '次要'},{ name: '重要'}],
            gwoption: [],
            yfoption: [{value: 999, name: '全部'},{value: 1, name: 1},{value: 2,name: 2},{value: 3, name: 3},{value: 4, name: 4},{ value: 5,name: 5},{ value: 6,name: 6},{value: 7,name: 7},{value: 8, name: 8},{ value: 9,name: 9},{value: 10, name: 10},{ value: 11,name: 11},{value: 12, name: 12}],
            customerValue: 0,
            yfValue: 999,
            ndValue: 2019,
            jzztValue: 999,
            jizztValue: 999,
            finishValue: 0,
            isShow: false,
            iptval:'',
            personList: [],
            num:0,//控制删除选择人员
            date: moment(this.props.date).subtract(1, "month"),
        }
        this.config = config.current;
        this.webapi = this.config.webapi;
        // this.getFinishValue();
        // this.setState({
        //     gwoption:this.props.getrenderVal()
        // })
        // debugger
        // this.getgwValue();
        // this.metaAction = props.metaAction;
    }

    handleChangeRadio = (e) => {
        // console.log(e, 'eeee')
        this.setState({
            customerValue: e.target.value
        })
        this.props.setMea('data.customers',e.target.value);
    }



    // loadInvoiceTimeChange=(e)=>{
    //     debugger
    //     this.setState({
    //         date: moment(this.props.date).subtract(1, "month")e
    //     })
    //     console.log(this.state.date)
    // }
    jzztchange = (e) => {
        // console.log(e, 'eeee')
        this.setState({
            jzztValue: e
        })
        this.props.setMea('data.jzztValue',e);
    }
    jizztchange = (e) => {
        // console.log(e, 'eeee')
        this.setState({
            jizztValue: e
        })
        this.props.setMea('data.jizztValue',e);
    }
    gwchange = (e) => {
        // console.log(e, 'eeee')
        // this.setState({
        //     jizztValue: e
        // })
        this.props.setMea('data.gwVal',e);
    }

    ndchange = (e) => {
        // console.log(e, 'eeee')
        this.setState({
            ndValue: e
        })
        this.props.setMea('data.ndValue',e);
    }
    yfchange = (e) => {
        // console.log(e, 'eeee')
        this.setState({
            yfValue: e
        })
        this.props.setMea('data.yfValue',e);
    }


    handleSearch = (e) => {
        // console.log(e, 'e search')
        
    }

    handleShaixuan = () => {
        // console.log('hanleShaixuan')
        let {num,year,month} = this.state
        num++;
        this.props.setMea('data.num',num);

        let res = this.props.getrenderVal();
        let resP = this.props.getpersonVal();
        let {isShow} = this.state
        this.setState({
            personList:resP,
            gwoption: res,
            isShow: !isShow
        })
    }

    handleSearchBtn = () => {
        this.props.load();
        let {isShow} = this.state
        this.setState({
            isShow: !isShow
        })
    }

    iptChange = (e) =>{
        this.props.setMea('data.inputval',e.currentTarget.defaultValue);
        this.props.load();
    }

    handleCancel = () => {
        this.props.setMea('data.persioniL',[]);
        this.props.setMea('data.users',[]);
        this.props.setMea('data.finishmark','0');
        this.props.setMea('data.customers','0');
        this.props.setMea('data.jizztValue','999');
        this.props.setMea('data.gwVal','');
        this.props.setMea('data.ndValue','2019');
        this.props.setMea('data.yfValue','999');
        this.props.setMea('data.inputval','');
        let {isShow} = this.state
        this.setState({
            customerValue: 0,
            yfValue: 999,
            ndValue: 2019,
            jzztValue: 999,
            jizztValue: 999,
            finishValue: 0,
            iptval:'',
            personList: [],
            // isShow: !isShow
        })
    }

    handleSelectPerson = async() => {
        const res = await this.props.handleSelectPerson()
        // console.log(res, 'res')

        if (res) {
            let {personList} =this.state
            let userIds = [];
            personList = personList.concat(res)
            const ygid = 'ygid';
            const r = personList.reduce((all, next) => all.some((atom) => atom[ygid] == next[ygid]) ? all : [...all, next],[]);
            if(res != 0){
                res.forEach(item => {
                    userIds.push(item.sysUserId)
                })
            }
            this.props.setMea('data.persioniL',userIds);
            this.props.setMea('data.users',r);
            this.setState({
                personList: r
            })
        }
    }

    handledeletePerson = (index) => {
        let {personList} =this.state
        personList.splice(index,1)
        this.props.setMea('data.persioniL',personList);
        this.setState({
            personList: personList
        })
    }

    handleChangeFinishRadio = async(e) => {
        // console.log(e, 'eeee')
        let fins = e.target.value;
        let option = {
            "finishmark":fins
        }
        await this.webapi.createOrupdate(option)
        this.setState({
            finishValue: e.target.value
        })
        this.props.setMea('data.finishmark',e.target.value);
        this.props.load();
        // this.props.onEnvent && this.props.onEvent('loadList', { path: this.props.path })
    }

    // getFinishValue = async() =>{
    //    let res = await this.webapi.queryfinish()
    //
    //     this.setState({
    //         finishValue: res.finishmark
    //     })
    //     this.props.setMea('data.finishmark',res.finishmark);
    //     this.props.load();
    // }
    getgwValue = async() =>{
        let res = this.props.getrenderVal().toJs();
        // return res
        this.setState({
            gwoption: res
        })
        // this.props.setMea('data.finishmark',res.finishmark);
        // this.props.load();
    }

    render() {
        let {finishflag,customers, customerValue, finishValue,isShow, personList,iptval,jzzt,jzztValue,jizzt,jizztValue,ndoption,yfoption,yfValue,ndValue,gwoption} = this.state
        return <div className='wrap'>

            {/* <Input.Search
            prefix={
                <Icon fontFamily='edficon' type='XDZsousuo' className='XDZsousuo'/>
            } 
            enterButton= {
                <Icon fontFamily='edficon' type='XDZshaixuan' onChlick={() => this.hanleShaixuan()}/>
            }
            showSearch={true}
            placeholder="请输入客户名称或助记码" onSearch={(e) =>this.handleSearch(e)}/> */}
            <div className="searchwhere">
                <div className="searchleft">
                    <Input
                    prefix={
                        <Icon fontFamily='edficon' type='XDZsousuo' className='XDZsousuo'/>
                    } 
                    className='inputClass'
                    showSearch={false}
                    value={this.state.iptval}
                    onPressEnter={(e) => this.iptChange(e)}
                    placeholder="请输入客户名称或助记码" />
                    <Icon fontFamily='edficon' type='XDZshaixuan' onClick={() => this.handleShaixuan()}/>
                </div>
                {/*<Form className='finishflagrad'>*/}
                        {/*<FormItem label="完成标志">*/}
                        {/*<RadioGroup value={finishValue} onChange={(e) => this.handleChangeFinishRadio(e)}>*/}
                                {/*{*/}
                                    {/*finishflag&&finishflag.map(item => {*/}
                                        {/*return <Radio value={item.value}>{item.name}</Radio>*/}
                                    {/*})*/}
                                {/*}*/}
                            {/*</RadioGroup>*/}
                        {/*</FormItem>*/}
                {/*</Form>*/}
            </div>
            <div style={isShow ? {display: 'block'} : {display: 'none'}} className='fromDiv'>
                <Form className='Form'>
                    {/*<FormItem label="客户分类">*/}
                        {/*<RadioGroup value={customerValue} onChange={(e) => this.handleChangeRadio(e)}>*/}
                            {/*{*/}
                                {/*customers&&customers.map(item => {*/}
                                    {/*return <Radio value={item.value}>{item.name}</Radio>*/}
                                {/*})*/}
                            {/*}*/}
                        {/*</RadioGroup>*/}
                    {/*</FormItem>*/}
                    {/*<FormItem label="优先级">*/}
                        {/*<Select value={ndValue} onChange={(e) => this.ndchange(e)}>*/}
                            {/*{*/}
                                {/*ndoption&&ndoption.map(item => {*/}
                                    {/*return <Option value={item.name}>{item.name}</Option>*/}
                                {/*})*/}
                            {/*}*/}
                        {/*</Select>*/}
                    {/*</FormItem>*/}
                    <FormItem label="原负责人">
                        {/* <Select mode="multiple">

                         </Select>   */}
                        <div className='person'>
                            {
                                personList&&personList.map((item, index) => {
                                    return <div className='personName' key={index}>
                                        <span value={item.ygid}>{item.ygmc}</span>
                                        <Icon fontFamily='edficon' type='XDZguanbishanchu' onClick={() => this.handledeletePerson(index)}></Icon>
                                    </div>
                                })
                            }
                            <div className='aclass' onClick={() => this.handleSelectPerson()}><a href='javascript:;'>+选择人员</a></div>
                        </div>
                    </FormItem>
                    <FormItem label="创建日期">
                        <Select value={jzztValue} onChange={(e) => this.jzztchange(e)}>
                            {
                                jzzt&&jzzt.map(item => {
                                    return <Option value={item.value}>{item.name}</Option>
                                })
                            }
                            {/*defaultValue={jzztValue} */}
                            {/*<Option value="999">全部</Option>*/}
                            {/*<Option value="1">未建账</Option>*/}
                            {/*<Option value="0">已建账</Option>*/}
                        </Select>
                    </FormItem>
                    {/*<FormItem label="月份">*/}
                            {/*/!*<MonthPicker format="YYYY-MM" onChange={this.loadInvoiceTimeChange} placeholder="请选择月份" value={this.state.date}></MonthPicker>*!/*/}
                            {/*<Select value={yfValue} onChange={(e) => this.yfchange(e)}>*/}
                                {/*{*/}
                                    {/*yfoption&&yfoption.map(item => {*/}
                                        {/*return <Option value={item.value}>{item.name}</Option>*/}
                                    {/*})*/}
                                {/*}*/}
                            {/*</Select>*/}

                    {/*</FormItem>*/}
                    {/*<FormItem label="记账状态">*/}
                            {/*<Select value={jizztValue} onChange={(e) => this.jizztchange(e)}>*/}
                                {/*{*/}
                                    {/*jizzt&&jizzt.map(item => {*/}
                                        {/*return <Option value={item.value}>{item.name}</Option>*/}
                                    {/*})*/}
                                {/*}*/}
                                {/*/!*<Option value="999">全部</Option>*!/*/}
                                {/*/!*<Option value="0">无任务</Option>*!/*/}
                                {/*/!*<Option value="1">未完成</Option>*!/*/}
                                {/*/!*<Option value="1">已完成</Option>*!/*/}
                            {/*</Select>*/}
                    {/*</FormItem>*/}
                    {/*<FormItem label="岗位">*/}
                        {/*<Select onChange={(e) => this.gwchange(e)}>*/}
                            {/*/!*onChange={(e) => this.getgwValue(e)}*!/*/}
                            {/*{*/}
                                {/*gwoption&&gwoption.map(item => {*/}
                                    {/*return <Option value={item.id}>{item.postName}</Option>*/}
                                {/*})*/}
                            {/*}*/}
                        {/*</Select>*/}
                    {/*</FormItem>*/}
                </Form>
                <div className='btnDiv'>
                    <Button fontFamily='edficon' className='acxBtnjzjd' type='primary' onClick={() => this.handleSearchBtn()}>查询</Button>
                    <Button fontFamily='edficon' onClick={() => this.handleCancel()}>重置</Button>
                </div>
            </div>
        </div>
    }
}

export default CustomerClass