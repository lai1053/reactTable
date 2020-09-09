class scrollFactory {
    constructor() {
        this.scrollTables = {}
    }
    getScrollTable = table => this.scrollTables[table]
    getScrollTop = table => {
        const tb = this.scrollTables[table]
        if (tb) return tb.scrollTop
        return 0
    }
    setScrollTop = (table, scrollTop) => {
        const tb = this.scrollTables[table] || {}
        this.scrollTables[table] = { ...tb, scrollTop }
    }
    getScrollLeft = table => {
        const tb = this.scrollTables[table]
        if (tb) return tb.scrollLeft
        return 0
    }
    getScrollLeft = (table, scrollLeft) => {
        const tb = this.scrollTables[table] || {}
        this.scrollTables[table] = { ...tb, scrollLeft }
    }
    setScrollTable = (table, scroll) => {
        this.scrollTables[table] = scroll
    }
}

const scrollFactoryInstance = new scrollFactory()

export default scrollFactoryInstance
