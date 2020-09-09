import React from 'react'
import StockAppDistributionCost from './StockAppDistributionCost'
import StockAppDistributionCostSales from './StockAppDistributionCostSales'
/*
    生产成本分配页面，这里根据计算生产成本的两种不同的方法，也分为两个页面
    （ 
        传统生产——StockAppDistributionCost、
        以销定产——StockAppDistributionCostSales
     ）
*/

export default class Distribution extends React.Component{
    constructor(props){
        super(props) 
        this.state = {
        }
        this.metaAction = props.metaAction
        this.component = props.component
        this.webapi = props.webapi
        this.params = props.params
    }

    componentDidMount = async() =>{
        if(this.props.storeState){  // 如果主页面保存货state的信息，那么将它直接赋值
            this.setState({
                ...this.props.storeState,
                loading: false
            })
            this.params = this.props.storeParams
        } 
    }

    /**
     * @description: 把当前页面的数据传递到主页面
     * @param {array} newList 生产成本分配表的数据（页面数据变化后的）
     * @param {number} bomBalance bom领料金额
     * @return 无
     */ 
    changeList=(newList, bomBalance)=>{
        this.props.distributionChange && this.props.distributionChange(newList, bomBalance)
    }

    render(){
        return (
            this.params.endCostType == 1 ?  
            
            <StockAppDistributionCost            // 传统生产方式
                metaAction = { this.metaAction }
                component = { this.component}
                webapi = { this.webapi }
                params = { this.params }
                xdzOrgIsStop={this.props.xdzOrgIsStop}
                store = {this.props.store}
                invSetInfo = {this.props.invSetInfo}
                changeList = {this.changeList}
            ></StockAppDistributionCost>
            : 
            <StockAppDistributionCostSales      // 以销定产方式
                metaAction = { this.metaAction }
                component = { this.component}
                webapi = { this.webapi }
                params = { this.params }
                store = {this.props.store}
                invSetInfo={this.props.invSetInfo}
                changeList = {this.changeList}
                xdzOrgIsStop={this.props.xdzOrgIsStop}
            ></StockAppDistributionCostSales>
        )
    }
}

