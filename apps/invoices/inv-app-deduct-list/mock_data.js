
const deductList = [
    {id: 1, fpzlDm: '增值税专用发票', fphm:'12309863', kprq:'2019-01-18', hjje:'10,220,972.50', hjse:'234.98', xfmc:' 佛山市哈哈家政科技有限公司'},
    {id: 2 ,fpzlDm:'增值税专用发票', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 江门市塑料有限公司'},
    {id: 3 ,fpzlDm:'增值税专用发票', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 广州市怪兽科技有限公司'},
    {id: 4 ,fpzlDm:'增值税专用发票', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 汕头市食品有限公司'},
    {id: 5 ,fpzlDm:'增值税专用发票', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 汕尾市回收有限公司'},
    {id: 6 ,fpzlDm:'增值税专用发票', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 北京市影视有限公司'},
    {id: 7 ,fpzlDm:'增值税专用发票', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 北京市影视有限公司'},
    {id: 8 ,fpzlDm:'增值税专用发票', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 天津市煎饼果子有限公司'},
    {id: 9 ,fpzlDm:'增值税专用发票', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 中山市怪兽有限公司'},
    {id: 10 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 哆蕾咪有限公司'},
    {id: 11 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 佛山市哈哈家政科技有限公司'},
    {id: 12 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 江门市塑料有限公司'},
    {id: 13 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 广州市怪兽科技有限公司'},
    {id: 14 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 汕头市食品有限公司'},
    {id: 15 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 汕尾市回收有限公司'},
    {id: 16 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 北京市影视有限公司'},
    {id: 17 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 北京市影视有限公司'},
    {id: 18 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 天津市煎饼果子有限公司'},
    {id: 19 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 中山市怪兽有限公司'},
    {id: 20 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 哆蕾咪有限公司'},
    {id: 21 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 佛山市哈哈家政科技有限公司'},
    {id: 22 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 江门市塑料有限公司'},
    {id: 23 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 广州市怪兽科技有限公司'},
    {id: 24 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 汕头市食品有限公司'},
    {id: 25 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 汕尾市回收有限公司'},
    {id: 26 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 北京市影视有限公司'},
    {id: 27 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 北京市影视有限公司'},
    {id: 28 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 天津市煎饼果子有限公司'},
    {id: 29 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 中山市怪兽有限公司'},
    {id: 30 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 哆蕾咪有限公司'},
    {id: 31 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 佛山市哈哈家政科技有限公司'},
    {id: 32 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 江门市塑料有限公司'},
    {id: 33 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 广州市怪兽科技有限公司'},
    {id: 34 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 汕头市食品有限公司'},
    {id: 35 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 汕尾市回收有限公司'},
    {id: 36 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 北京市影视有限公司'},
    {id: 37 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 天津市煎饼果子有限公司'},
    {id: 38 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 天津市煎饼果子有限公司'},
    {id: 39 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 中山市怪兽有限公司'},
    {id: 40 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 哆蕾咪有限公司'},
    {id: 41 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 佛山市哈哈家政科技有限公司'},
    {id: 42 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 江门市塑料有限公司'},
    {id: 43 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 广州市怪兽科技有限公司'},
    {id: 44 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 汕头市食品有限公司'},
    {id: 45 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 汕尾市回收有限公司'},
    {id: 46 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 北京市影视有限公司'},
    {id: 47 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 北京市影视有限公司'},
    {id: 48 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 天津市煎饼果子有限公司'},
    {id: 49 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 中山市怪兽有限公司'},
    {id: 50 ,fpzlDm:'海关专用缴款书', fphm:'12309863',kprq:'2019-01-18',hjje:'10,220,972.50',hjse:'234.98',xfmc:' 哆蕾咪有限公司'}
] 
 
export default{ 
    deductList 
} 

/*[*/