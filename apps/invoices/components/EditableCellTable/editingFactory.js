class editingFactory {
    constructor() {
        this.editingTables = {}
    }
    getEditingTable = name => this.editingTables[name]
    setEditingTable = (current, editing) => {
        this.editingTables[current] = editing
    }
}

const editingFactoryInstance = new editingFactory()

export default editingFactoryInstance
