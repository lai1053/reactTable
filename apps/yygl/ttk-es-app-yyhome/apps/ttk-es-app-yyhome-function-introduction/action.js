import React from 'react'
import config from './config'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {FormDecorator, Icon, Checkbox} from 'edf-component'
import { fromJS } from 'immutable'
import debounce from 'lodash.debounce'

class action{
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.nameChange = debounce(this.nameChange, 400);
    }

    timer = null

    onInit = ({component, injections}) => {
        this.component = component
        this.injections = injections

        console.info(this.component.props)

        if (this.component.props.setCancelLister) {
            // this.component.props.setCancelLister(this.onCancel)
        }

        injections.reduce('init', {
            isPop: this.component.props.isPop
        })

    }

    load = async ()=>{

    }

    renderIntroductionChildren = () =>{
        return (
            <div className="mainWrapper">
                <div className="banner">
                    <img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/banner.png" alt=""/>
                </div>
                <div className="cons">
                    <h2>1.【税务】功能新增及优化</h2>
                    <p>(1) 【新增】广东无盘认证上线</p>
                    <p>     其他省份将在3月初上线，敬请期待！！！</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p1.png" alt=""/></p>
                    <p>(2) 【勾选认证】发票认证取消360天有效期限制，发票可认证范围改为从2017年1月1日至今。</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p2.png" alt=""/></p>
                    <p>(3) 【勾选认证】增加手工调整列宽的效果，可随意拖动标题栏调整列宽</p>
                    <p>(4) 【个税】生产经营所得，支持征收方式为“代扣代缴”和“自行申报”的客户申报</p>
                    <p className="p2"><em></em>需要注意的是：如当期申报有税款，且未签订三方协议扣款（投资方本人与银行、税局签订的三方协议），请您移步至自然人系统申报。</p>
                    <p>(5) 【企业所得税A】单户申报，支持手工取数，支持从增值税报表取数和从财务报表取数</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p3.png" alt=""/></p>
                    <p>(6) 【增值税】减免明细表，增加疫情防控减免事项</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p4.png" alt=""/></p>
                    <p>(7) 【批量申报】企业所得和增值税小规模，增加导出功能，支持导出后导入。</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p5.png" alt=""/></p>
                    <p>(8) 【批量零申报】支持同时选择多个税种一起申报</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p6.png" alt=""/></p>
                    <h2>2.【发票采集】功能新增及优化</h2>
                    <p>(1) 【新增】支持一键读取增值税综合服务平台已认证海关票</p>
                    <p>(2) 【新增】小规模纳税人进项发票，增加失控、异常发票状态</p>
                    <p>(3) 【新增】无明细红字发票带入明细清单功能</p>
                    <p className="p2">读取的红冲发票，多数发票没有明细，仅在明细行注明“详见对应正数发票及清单”，系统增加带入原正数发票明细的功能。</p>
                    <p className="p2"><b>操作步骤：</b></p>
                    <p className="p2"><em></em>第一步，在红字发票界面点击【明细清单】按钮</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p7.png" alt=""/></p>
                    <p className="p2"><em></em>第二步，录入正确的原正数发票信息，点击【确定】，即可带入原正数发票明细清单。</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p8.png" alt=""/></p>
                    <p className="p2"><em></em>第三步，确认无误后，请点击发票界面的【保存】，保存红字发票明细。</p>
                    <p className="p2"><em></em>保存后，再次点击【明细清单】，可以查看或更新原正数发票信息。</p>
                    <p>(4) 【新增】无号票据系统自动编号，包括：销项- 普通机打发票、未开具发票，进项—纳税检查调整、旅客运输服务抵扣凭证、其他票据</p>
                    <p>(5) 【优化】票税宝上传发票图片查看</p>
                    <p className="p2"><em></em>点击<img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p9.png" alt="" style={{margin: "0 10px", position: "relative", top: "6px",verticalAlign: "text-bottom"}}/>就可打开发票原图查看了。</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p10.png" alt=""/></p>
                    <h2>3.【业务-进项、销项】功能新增及优化</h2>
                    <p>(1) 【新增】取票时不能入账的问题票功能，可查看不能入账的原因。</p>
                    <p>(2) 【新增】批设科目设置维度“单位”，可与其他维度组合使用</p>
                    <p>(3) 【新增】自动匹配功能，可手动触发进行匹配</p>
                    <p>(4) 【新增】未设置记录数的提示</p>
                    <h2>4.【存货】功能新增及优化</h2>
                    <p>(1) 【优化】暂估入库单入库日期</p>
                    <p className="p2"><em></em>新增暂估入库单时，若服务器时间不在当前所选会计期间内，入库日期由当前会计期间最后一日调整为当前会计期间第一日</p>
                    <p>(2) 【新增】四大存货报表：入库汇总表、出库汇总表、暂估汇总表、暂估明细表</p>
                    <p>(3) 【新增】存货档案批量修改存货类型</p>
                    <h2>5.【财务】功能新增及优化</h2>
                    <p>(1) 【凭证】新增凭证自动补断号生成</p>
                    <p className="p2"><em></em>操作：凭证页面→ 更多 → 凭证号规则设置→新增凭证（选择“断号自动插入”）
                        新增凭证时，凭证字号为自动补断号，凭证字号仍然可修改。</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p11.png" alt=""/></p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p12" alt=""/></p>
                    <p>(2) 【凭证】凭证列表—新增“按月份+凭证号排序”、“日期+凭证号”两种排序</p>
                    <p className="p2"><em></em>操作：凭证页面→ 更多 → 凭证号规则设置→凭证管理排序</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p13.png" alt=""/></p>
                    <p>(3) 【凭证】凭证打印设置，支持到10行</p>
                    <p className="p2"><em></em>操作：打印 → 下拉 → 打印设置：</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p14.png" alt=""/></p>
                    <p>(4) 【凭证】凭证打印设置——增加上、下边距</p>
                    <p className="p2"><em></em>调整范围：0~30毫米</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p15.png" alt=""/></p>
                    <p>(5) 【凭证】凭证列表增加时间轴</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p16.png" alt=""/></p>
                    <p>(6) 【账簿】账簿打印——封皮打印优化</p>
                    <p className="p2"><em></em>操作：打印设置→勾选封皮</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p17.png" alt=""/></p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p18.png" alt=""/></p>
                    <p>(7) 【账簿】辅助账簿新增打印设置</p>
                    <p className="p2"><em></em>辅助总账、辅助明细账、辅助余额表，增加打印设置：</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p19.png" alt=""/></p>
                    <p>(8) 【账簿】辅助明细账筛选条件来回切换时，余额正常显示</p>
                    <p>(9) 【科目管理】支持“本年利润”、“进项税额转出”新增下级科目</p>
                    <p>(10) 辅助明细表和归档的下载优化</p>
                    <p className="p2"><em></em>辅助明细表下载：点击右上角下载按钮即可下载：</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p20.png" alt=""/></p>
                    <p className="p2"><em></em>归档下载：基础设置 → 归档管理 → 勾选月份 → 下载：</p>
                    <p className="p1"><img src="https://cloud-manager.oss-cn-beijing.aliyuncs.com/xdz/fun/02/p21.png" alt=""/></p>
                    <h2>6.【其他】功能新增及优化</h2>
                    <p>(1) 【客户分配】新增导入分配功能，可导出模板填入分配数据后导入完成分配</p>
                    <p>(2) 【账套管理】新增账套备份和账套恢复功能</p>
                    <p>(3) 【统计】新增工作统计功能</p>
                    <p>(4) 【统计-申报进度】补充获取清册信息结果提醒</p>
                    <p>(5) 【统计-申报台账】税额支持穿透查询相应申报表</p>
                </div>
            </div>
        )
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({...option, metaAction}),
        ret = {...metaAction, ...o}
    metaAction.config({metaHandlers: ret})
    return ret
}