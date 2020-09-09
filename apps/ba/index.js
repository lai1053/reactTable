import app_archives_list from './app-archives-list'
import app_card_assets from './app-card-assets'
import app_card_bankaccount from './app-card-bankaccount'
import app_card_currency from './app-card-currency'
import app_card_customer from './app-card-customer'
import app_card_customer_category from './app-card-customer-category'
import app_card_customer_category_handle from './app-card-customer-category/apps/app-card-customer-category-handle'
import app_card_department from './app-card-department'
import app_card_import from './app-card-import'
import app_card_inventory from './app-card-inventory'
import app_card_person from './app-card-person'
import app_card_project from './app-card-project'
import app_card_revenueType from './app-card-revenueType'
import app_card_unit from './app-card-unit'
import app_card_userdefinecard from './app-card-userdefinecard'
import app_card_vendor from './app-card-vendor'
import app_list_account from './app-list-account'
import app_list_currency from './app-list-currency'
import app_list_customer from './app-list-customer'
import app_list_department_personnel from './app-list-department-personnel'
import app_list_inventory from './app-list-inventory'
import app_list_project from './app-list-project'
import app_list_supplier from './app-list-supplier'
import app_list_unit from './app-list-unit'
import app_list_userdefinecard from './app-list-userdefinecard'
import app_mail_share from './app-mail-share'
import app_setting from './app-setting'
import app_weixin_share from './app-weixin-share'
import app_card_inventory_batch_change from './app-card-inventory-batch-change'
import ttk_ba_app_basetting from './ttk-ba-app-basetting'
import ttk_ba_app_subjects_create_inventory from './ttk-ba-app-subjects-create-inventory'
import ttk_ba_app_subjects_create_customer from './ttk-ba-app-subjects-create-customer'
import ttk_ba_app_subjects_create_supplier from './ttk-ba-app-subjects-create-supplier'
import ttk_app_inventory_list from './ttk-app-inventory-list'
import ttk_app_inventory_type_setting from './ttk-app-inventory-list/util/ttk-app-inventory-type-setting'
import ttk_app_inventory_card from './ttk-app-inventory-card'
import ttk_app_unit_list from './ttk-app-unit-list'
import ttk_app_unit_card from './ttk-app-unit-card'
import ttk_app_inventory_import from './ttk-app-inventory-import'
import ttk_app_inventory_copy_subject from './ttk-app-inventory-copy-subject'
import ttk_app_inventoryAdd_card from './ttk-app-inventoryAdd-card'


const obj = {
    [app_archives_list.name]: app_archives_list,
    [app_card_assets.name]: app_card_assets,
    [app_card_bankaccount.name]: app_card_bankaccount,
    [app_card_currency.name]: app_card_currency,
    [app_card_customer.name]: app_card_customer,
    [app_card_customer_category.name]: app_card_customer_category,
    [app_card_customer_category_handle.name]: app_card_customer_category_handle,
    [app_card_department.name]: app_card_department,
    [app_card_import.name]: app_card_import,
    [app_card_inventory.name]: app_card_inventory,
    [app_card_person.name]: app_card_person,
    [app_card_project.name]: app_card_project,
    [app_card_revenueType.name]: app_card_revenueType,
    [app_card_unit.name]: app_card_unit,
    [app_card_userdefinecard.name]: app_card_userdefinecard,
    [app_card_vendor.name]: app_card_vendor,
    [app_list_account.name]: app_list_account,
    [app_list_currency.name]: app_list_currency,
    [app_list_customer.name]: app_list_customer,
    [app_list_department_personnel.name]: app_list_department_personnel,
    [app_list_inventory.name]: app_list_inventory,
    [app_list_project.name]: app_list_project,
    [app_list_supplier.name]: app_list_supplier,
    [app_list_unit.name]: app_list_unit,
    [app_list_userdefinecard.name]: app_list_userdefinecard,
    [app_mail_share.name]: app_mail_share,
    [app_setting.name]: app_setting,
    [app_weixin_share.name]: app_weixin_share,
    [app_card_inventory_batch_change.name]: app_card_inventory_batch_change,
    [ttk_ba_app_basetting.name]: ttk_ba_app_basetting,
    [ttk_ba_app_subjects_create_inventory.name]: ttk_ba_app_subjects_create_inventory,
    [ttk_ba_app_subjects_create_customer.name]: ttk_ba_app_subjects_create_customer,
    [ttk_ba_app_subjects_create_supplier.name]: ttk_ba_app_subjects_create_supplier,
    [ttk_app_inventory_list.name]: ttk_app_inventory_list,
    [ttk_app_inventory_type_setting.name]: ttk_app_inventory_type_setting,
    [ttk_app_inventory_card.name]: ttk_app_inventory_card,
    [ttk_app_unit_list.name]: ttk_app_unit_list,
    [ttk_app_unit_card.name]: ttk_app_unit_card,
    [ttk_app_inventory_import.name]: ttk_app_inventory_import,
    [ttk_app_inventory_copy_subject.name]: ttk_app_inventory_copy_subject,
    [ttk_app_inventoryAdd_card.name]: ttk_app_inventoryAdd_card
}
window.publicModule && window.publicModule.callback(obj, 'ba')

export default obj
