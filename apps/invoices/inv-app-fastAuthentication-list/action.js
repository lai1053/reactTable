import React from 'react'
import { action as MetaAction} from 'edf-meta-engine'
import config from './config'
import utils, { environment } from "edf-utils";
import { fromJS } from "immutable";
import Confirmsend from './components/Confirmsend'
import Download from './components/Download'
import Suaxin from './components/Suaxin'
import moment from "moment";

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
    }


    onInit = ({ component, injections }) => {
        this.component = component
        this.injections = injections
        this.webapi = this.config.webapi
        injections.reduce('init')
        this.getInvoiceList()
       
    }

    componentDidMount = () => {
        
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
        
        
    }

    componentWillUnmount = () => {

        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
        } else if (win.detachEvent) {
            window.detachEvent('onresize', this.onResize)
        } else {
            window.onresize = undefined
        }
    }
    // 控制表格大小
    onResize = (e) => {
      let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        },200)
    }
    // 获取滚动条高度
    getTableScroll = (e) => {

        try {

            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let appDom = document.getElementsByClassName('inv-app-fastAuthentication-list')[0]; //以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0]; //table wrapper包含整个table,table的高度基于这个dom
            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
               
                if (num < 0) {

                    this.injections.reduce('tableOption', {
                        ...tableOption,
                        x: width - 11,
                        y: height - theadDom.offsetHeight - 1,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce('tableOption', {
                      ...tableOption,
                      x: width
                      
                    })
                }
            }
        } catch (err) {}
    }
    //文字提示
    renderTooltips = (text,rowData,rowIndex) =>{
      let texts,tex2
      if (rowData.fpztDm === '2') tex2 = '作废票'
      if (rowData.fpztDm === '3') tex2 = '异常票'
      if (rowData.fpztDm === '4') tex2 = '失控票'
      text==='认证失败'?texts= '此发票为'+tex2+'不允许认证': texts= ''
      return {
      children:<div style={{}} title={texts}>
        <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis',color: text==='认证失败'? 'red':'' }}>{text}</span>
      </div>
    }
  }
    
    // 获取发票列表
    getInvoiceList = async (payload = {}) =>{
      this.metaAction.sf('data.loading', true)
    /*  console.log(this.component.props.store);*/
      /*     const {vatTaxpayerNum} = this.metaAction.context.get("currentOrg")*/
      // 请求参数
      let pagination = this.metaAction.gf('data.pagination'),
        req = {
          entity: {
            xfmc: "", // 销方名称 非必填
            fpzlDm: "01", // -- 发票种类代码 01 增值税专用发票,03 机动车销售发票,10 税局代开增税发票,17 通行费发票 非必填
            fphm:'', //发票号码
            fpdm:''  , // -- 发票代码 非必填
            rzzt: '', // 认证状态 默认未0 必填
            kprqq: '', // 开票日期起 非必填
            kprqz: '', //-开票日期止 非必填
            xfsbh:''//销方识别号
          },
          page: {
            currentPage: 1,
            pageSize: 20
          }
        }
      if (payload) {
          if(payload.page)req.page.currentPage = payload.page.currentPage
          if(payload.page)req.page.pageSize = payload.page.pageSize
          if(payload.inv_code)req.entity.xfmc = payload.inv_code // 销方名称
          if(payload.inv_code2)req.entity.fphm = payload.inv_code2 // 发票号码
          if(payload.fpdm)req.entity.fpdm = payload.fpdm // 发票代码
          if(payload.recognize_retult)req.entity.rzzt = payload.recognize_retult // 认证状态
          if(payload.bill_date_start)req.entity.kprqq = payload.bill_date_start // 开票日期起
          if(payload.bill_date_end)req.entity.kprqz = payload.bill_date_end // 开票日期止
          if(payload.xfsbh)req.entity.xfsbh = payload.xfsbh// 销方识别号
      }
      const response = await this.webapi.person.getInvoiceList(req)
      this.dealWith (response.pageResultDto)
      
     
      
      
    }
    
    //列表数据处理
    dealWith = (pageResultDto)=>{
      let list = pageResultDto.list
      let arr = []
        list.forEach((item,index)=>{
          item.id = item.fphm
          item.kprq2 = item.kprq.substring(0,10)
          item.hjje = item.hjje.toFixed(2)
          item.hjse = item.hjse.toFixed(2)
         if(item.fsrq)item.fsrq2 = item.fsrq.substring(0,10)
         if(item.rzzt === '0')item.zts='未认证'
         if(item.rzzt === '1')item.zts='已认证'
         if(item.rzzt === '2')item.zts='认证中'
         if(item.rzzt === '3')item.zts='认证失败'
        })
      this.metaAction.sf('data.loading', false)
      this. onResize() // 页面数据加载完成后计算滚动条高度
      this.metaAction.sf('data.list',list)
      this.metaAction.sf('data.pagination', pageResultDto.page )
      if(pageResultDto.list.length !== 0){
        let statistics ={
          count:pageResultDto.fpzs,
          totalAmount:pageResultDto.ljje,
          totalTax:pageResultDto.ljse
        }
        this.metaAction.sf('data.statistics', statistics)
      }else {
        let statistics ={
          count:0,
          totalAmount:0,
          totalTax:0
        }
        this.metaAction.sf('data.statistics', statistics)
      }
     
      
    }

    // 双击某张发票
    doubleClick = (record)=>{
      return {
        onDoubleClick: e  => {
          const {kjxh} = record
          const {periodDate} = this.metaAction.context.get("currentOrg")
          this.component.props.nsqj = periodDate
          let obj = {
            title: '修改增值税专用发票',
            appName: 'inv-app-pu-vats-invoice-card'
          }
          let ret = this.metaAction.modal('show',{
            title: obj.title,
            wrapClassName: `${obj.appName}-wrap`,
            width:'80%',
            style:{top:5},
            okText:'保存',
            bodyStyle:{ padding:'0px 0 12px 0'},
            children: this.metaAction.loadApp(obj.appName,{
              store: this.component.props.store,
              nsqj: this.component.props.nsqj,
              kjxh
            })
          })
          if (ret){
            this.getInvoiceList()
          }
          
        }
      }
    }
    
    //计算
    calculate = (option, list) => {
        const { periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期
        let { add, sub, mul, div } = utils.calculate;//加减乘除
        if (!option) {
          option = this.metaAction.gf('data.cal').toJS();
        }
        let { a, b, c, d, authenticatedTax } = option;
        //console.log(a, b, c, d);
        a = Number(`${a}`.replace(/,/g, '')) || 0;
        b = Number(`${b}`.replace(/,/g, '')) || 0;
        c = Number(`${c}`.replace(/,/g, '')) || 0;
        d = Number(`${d}`.replace(/,/g, '')) || 0;
        authenticatedTax = Number(`${authenticatedTax}`.replace(/,/g, '')) || 0;
        //计算公式：r=a-b*c/100-d
        var e = mul(b, c);
        var f = div(e, 100);
        var g = sub(a, f);
        var r = sub(g, d);
        var h = sub(r, authenticatedTax);//减去已认证
        
        if (!list) {
          list = this.metaAction.gf('data.list').toJS();
        }
        
        let value = Number(utils.number.format(h, 2).replace(/,/g, ''));
        list.forEach((o, index) => {
          if (value > 0) {
            if (!o.authenticated && o.invoiceDate && o.id && moment(o.invoiceDate).format('YYYY-MM') <= periodDate) {
              value = sub(value, o.totalTax);
              o.suggest = '建议认证'
            } else {
              o.suggest = null
            }
          } else {
            o.suggest = null
          }
        });
        this.metaAction.sf('data.list', fromJS(list));
        r = utils.number.format(r, 2);//格式化为两位
        
        //console.log(`${a} - ${b}*${c}/100-${d}=${r}`, '计算公式')
        this.metaAction.sfs({
          'data.cal.r': r,
          'data.list': fromJS(list),
          'data.listAll': fromJS(list),
        })
      }
      
    //搜索查询
    handerFilter = (form) => {
      if (form) {
            this.injections.reduce('initInvoiceInfo', 'data.filter.form', form)
        }
        this.getInvoiceList(form)
    }

    // 菜单点击更多
    moreActionOpeate = (e) => {
        this[e.key] && this[e.key]()
    }
    
    //分页发生变化
    pageChanged = (current, pageSize) => {
      let page = this.metaAction.gf('data.pagination')
      page = {
        ...page,
        'currentPage': current,
        'pageSize': pageSize ? pageSize : page.pageSize
      }
      this.metaAction.sf('data.pagination', fromJS(page))
        this.getInvoiceList({ page })
    }
    
    // 切换分页
    tabChange = (activeKey) => {
        this.metaAction.sf('data.tabFilter.trans_catagory', activeKey)
    }
    
     //勾选框逻辑
    rowSelection=()=>{
        return {
          // 不可勾选的判断
          getCheckboxProps: row =>{
            return({
              disabled: row.zts === '认证失败',
              name:row.name
            })
          },
          //选择数据改变
          onChange:(arr, itemArr) => {
            let {add} = utils.calculate; //加减乘除
            itemArr = itemArr.filter(o => o);
            let totalAmount = 0;
            let totalTax = 0;
            let newArr = itemArr.map(item => {
              totalAmount = add(totalAmount, item.hjje)
              totalTax = add(totalTax, item.hjse)
              return item.id
            })
            let onlyShowSelected = this.metaAction.gf('data.other.onlyShowSelected');
    
            let obj = {
          /*    'data.statistics': fromJS({
                count: itemArr.length,
                totalAmount: utils.number.format(totalAmount, 2),
                totalTax: utils.number.format(totalTax, 2),
              }),*/
              'data.tableCheckbox': fromJS({
                checkboxValue: newArr,
                selectedOption: itemArr
              })
            }
            if (onlyShowSelected) {
              let listAll = this.metaAction.gf('data.list').toJS();
              if (itemArr.length === listAll.length) return;
              //为了保证顺序
              let list = listAll.map(o => {
                return itemArr.find(item => item.id === o.id);
              }).filter(a => a)
              obj['data.list'] = fromJS(list);
            }else{
            
            }
            
            this.metaAction.sfs(obj)
            if (onlyShowSelected) {
              /*  this.onResize()*/
            }
          }
        }
    }
    
    // 发送认证
    sendAtt = async () => {
        let { beginInvoiceDate, endInvoiceDate } = this.metaAction.gf('data.searchValue').toJS();
        let { add, sub, mul, div } = utils.calculate; //加减乘除
        // 判断选择框内是否有数据
        let selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS();
    
   
       if (!selectedOption.length) {
            return this.metaAction.toast('error', '请选择需要发送认证的数据');
       }
        // 判断数据的合法性
       let totalAmount = 0;
       let totalTax = 0;
       let count = 0;
       let selectedArr = [];
       let arrivalList = [];
       let flag = true;
       selectedOption.forEach(item => {
         if (!item.authenticated) {
                totalAmount = add(totalAmount, item.hjje)
                totalTax = add(totalTax, item.hjse)
                count++;
              let { id, fpdm, fphm, gfsbh, xfsbh, kprq, hjje, hjse, fpMw, jqbh, xfmc, gfmc } = item;
                let arr = {
                    id,
                    dm: fpdm,
                    hm: fphm,
                    gf: gfsbh,
                    xf: xfsbh,
                    kr: kprq,
                    je: hjje,
                    se: hjse,
                    mw: fpMw,
                    jqbh: jqbh,
                    xfmc: xfmc,
                    gfmc: gfmc
                }
           Object.keys(arr).forEach(key => {
                  if (!arr[key]) {
                        this.metaAction.toast('error', '数据不完整');
                        flag = false;
                    }
                })
             
              selectedArr.push(arr);
                arrivalList.push({
                  fpdm,
                  fphm
                })
            }
            if(item.rzzt !== '0'){
              flag = false
              this.metaAction.toast('error', '请选择未认证的数据');
              return
            }
        })
       let statistics = {
            count,
            totalAmount: utils.number.format(totalAmount, 2),
            totalTax: utils.number.format(totalTax, 2),
       }
       if (flag === false) {
       
       }
       if (!flag) {
            return;
        }
       const ret = await this.metaAction.modal('show', {
            title: '',
            width: 458,
            okText: '发送认证',
            wrapClassName: 'inv-app-fastAuthentication-list-confirm-send',
            closeModal: this.close,
            closeBack: (back) => { this.closeTip = back },
          children: <Confirmsend
          store={this.component.props.store}
          webapi={this.webapi}
          statistics={statistics}
          selectedArr={selectedOption}
          toast={this.metaAction.toast}
           />
       })
        if (ret === 'true') {
            const ret1 = await this.metaAction.modal('success', {
                title: '数据提交发送认证成功！',
                okText: '关闭',
                width: 600,
                bodyStyle: { height: '300px', overflow: 'auto' },
                content: <div style={{ fontSize: 12, textIndent: '25px', lineHeight: 2 }}>温馨提示：发送认证成功后，系统会自动刷新，认证状态会自动更新到发票上</div>
            })
            //更新
            
            let refres = await this.webapi.refreshResult({
              "sssq": beginInvoiceDate.format('YYYYMM')
              /*  "beginInvoiceDate": beginInvoiceDate.format('YYYY-MM-DD'),
                "endInvoiceDate": endInvoiceDate.format('YYYY-MM-DD'),
                isSendSuccess: true,
                arrivalList*/
            })
            if (refres) {
                await this.getInvoiceList(); //刷新列表
            }
        }


    }
  
    //刷新认证结果
    refreshResult = async () => {
        // 选择一个刷新区间
      this.metaAction.modal('show', {
        title: '刷新认证结果',
        width: 350,
        wrapClassName: 'ttk-scm-app-authorized-invoice-list-download',
        children: <Suaxin
          store={this.component.props.store}
          webapi={this.webapi}
          defaulDate= {moment().subtract(1, "months").format("YYYY-MM")}
          getInvoiceList ={this.getInvoiceList}
        />
      })
      
    }
    
    /*   *****************************************************更多菜单里面的功能*/
    // 导出数据
    exports = async () => {
        let selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS();
        if (!selectedOption.length) {
                return this.metaAction.toast('error', '请选择要导出的数据');
            }
        let params = []
      
       selectedOption.forEach((itme)=>{
         let { id, fpdm, fphm, gfsbh, xfsbh, kpr, hjje, hjse, fpMw, jqbh, xfmc, gfmc } = itme;
           let arr = {
              id:id, // 后台让我自己编
              dm:fpdm, //发票代码
              hm:fphm, //发票号码
              gf:gfsbh, // 购方税号
              xf:xfsbh, //销方税号
              kr:kpr, //开票人
              je:hjje, //合计金额
              se:hjse, //合计税额
              mw:fpMw, // 发票密文
              jqbh:jqbh,//设备编号
              xfmc:xfmc ,//销方名称
              gfmc:gfmc // 购方名称
             
           }
           /* Object.keys(arr).forEach(key => {
               if (!arr[key]) {
               this.metaAction.toast('error', '数据不完整');
            }
         })*/
            params.push(arr)
       })
            let a = {
              fprzData: selectedOption
            }
           let res =  await this.webapi.person.checkDownLoadDatFile(a)
       if(res !== undefined){
          await this.webapi.person.export(a)
       }
        // this.metaAction.toast('success', '导出成功')
    }

    //下载发票
    downloadPdf4Rz = async () => {
      const currentOrg = this.metaAction.context.get("currentOrg") || {}
      const currentUser = this.metaAction.context.get("currentUser") || {}
        const ret = await this.metaAction.modal('show', {
            title: '下载月份',
            width: 350,
            wrapClassName: 'ttk-scm-app-authorized-invoice-list-download',
            children: <Download
          store={this.component.props.store}
          webapi={this.webapi}
          defaulDate= {moment().subtract(1, "months").format("YYYY-MM")}
          currentOrg = {currentOrg}
          currentUser = {currentUser}
          getInvoiceList = { this.getInvoiceList}
          lodingT = {this.lodingT}
          lodingF = {this.lodingF}
        />
        })
       /* if (typeof ret === 'object') {
            if (environment.isClientMode()) {
                window.open(res, "_self")
            } else {
                var iframeObject = document.getElementById('downloadPdf4Rz')
                if (iframeObject) {
                    iframeObject.src = ret.url
                } else {
                    var iframe = document.createElement('iframe')
                    iframe.id = 'downloadPdf4Rz'
                    iframe.frameborder = "0"
                    iframe.style.width = "0px"
                    iframe.style.height = "0px"
                    iframe.src = ret.url
                    document.body.appendChild(iframe)
                }
            }
        }*/


    }

    // 新增
    newIncreased = async () => {
      const {periodDate} = this.metaAction.context.get("currentOrg")
      this.component.props.nsqj = periodDate
     
      const res = await this.metaAction.modal('show',{
          title:'新增增值税专用发票',
          width: '80%',
          okText:'保存',
          cancelText:'关闭',
          bodyStyle:{padding: '0px 0 12px 0'},
          children:this.metaAction.loadApp('inv-app-pu-vats-invoice-card',{
            store:this.component.props.store,
            nsqj: this.component.props.nsqj
          })
        })
      if(res.listNeedLoad === true){
        this.getInvoiceList()
      }else {
        return
      }
    }

    // 更新秘钥
    importKey = async () => {
        const { ret, file } = await this.metaAction.modal('show', {
            title: '更新密钥',
            width: 560,
            okText: '保存',
           className: 'inv-app-fast-fastAuthenticatiom-key-modal',
            children: this.metaAction.loadApp('inv-app-fastAuthentication-list-import-key', {
                store: this.component.props.store,
                upList: this.getInvoiceList
            }),
        })
        if (file) {
            this.metaAction.sf('data.file', fromJS(file));
        }

        if (ret) {

        }
    }
  
    //删除发票
    deleteBatchClick = async () => {
    const selectedOption = this.metaAction.gf('data.tableCheckbox.selectedOption').toJS() //选中的
    if (selectedOption.length == 0) {
      this.metaAction.toast('error', '请选择您要删除的数据')
      return
    }
    let arr = []
    let flag = true
    selectedOption.forEach((item)=>{
        arr.push(item.kjxh)
        if(item.rzzt !== '0'){
         flag = false
        }
    })
      if(flag === false){
        return this.metaAction.toast('error', '只能删除未认证数据'); // 其他状态下的数据不允许被删除
      }else {
        const ret = await this.metaAction.modal('confirm', {
          title: '删除进项发票',
          content: '确定删除所选进项发票？'
        })
      }
    
   /* if (!ret) {
      return
    }*/
    const {qyid} = this.component.props.appParams
    
    let data = {
      qyId:qyid,  // 企业ID
      kjxhList:arr  //开机序列号列表
    }
    
    const res = await this.webapi.person.deleteBatch(data)
    if (res === null) {
      this.metaAction.toast('success', '删除成功')
      this.getInvoiceList ()
    }else {
      return res
    }
  /*  this.injections.reduce('update', {
      path: 'data.tableCheckbox',
      value: {
        checkboxValue: [],
        selectedOption: []
      }
    })*/
    
    
  }
    
    btnClick = () => {
        this.injections.reduce('modifyContent')
    }
    // loding
    lodingT = () =>{
      this.metaAction.sf('data.loading', true)
    }
    lodingF = () =>{
    this.metaAction.sf('data.loading', false)
  }
  
}


export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}