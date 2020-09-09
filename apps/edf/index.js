import edf_company_manage from "./edf-company-manage";
import edf_company_manage_add from "./edf-company-manage/apps/edf-company-manage-add";
import edf_company_manage_delete from "./edf-company-manage/apps/edf-company-manage-delete";
import edfx_app_forgot_password from "./edfx-app-forgot-password";
import edfx_app_home from "./edfx-app-home";
import edfx_app_login from "./edfx-app-login";
import edfx_app_my_setting from "./edfx-app-my-setting";
import edfx_app_my_setting_change_mobile from "./edfx-app-my-setting/apps/edfx-app-my-setting-change-mobile";
import edfx_app_my_setting_change_password from "./edfx-app-my-setting/apps/edfx-app-my-setting-change-password";
import edfx_app_org from "./edfx-app-org";
import edfx_app_org_reinit from "./edfx-app-org/apps/edfx-app-org-reinit";
import ttk_edf_app_modify_nature from "./edfx-app-org/apps/ttk-edf-app-modify-nature";
import edfx_app_portal from "./edfx-app-portal";
import edfx_app_register from "./edfx-app-register";
import edfx_app_agreement from "./edfx-app-register/apps/edfx-app-agreement";
import edfx_app_root from "./edfx-app-root";
import edfx_business_subject_manage from "./edfx-business-subject-manage";
import edfx_business_subject_card from "./edfx-business-subject-manage/apps/edfx-business-subject-card";
import edfx_inventory_subject_card from "./edfx-business-subject-manage/apps/edfx-inventory-subject-card";
import ttk_edf_app_article from "./ttk-edf-app-article";
import ttk_edf_app_beginner_guidance from "./ttk-edf-app-beginner-guidance";
import ttk_edf_app_column from "./ttk-edf-app-column";
import ttk_edf_app_column_detail from "./ttk-edf-app-column/apps/ttk-edf-app-column-detail";
import ttk_edf_app_column_setting from "./ttk-edf-app-column/apps/ttk-edf-app-column-setting";
import ttk_edf_app_column_type from "./ttk-edf-app-column/apps/ttk-edf-app-column-type";
import ttk_edf_app_desktop_init from "./ttk-edf-app-desktop-init";
import ttk_edf_app_devtools from "./ttk-edf-app-devtools";
import ttk_edf_app_enum from "./ttk-edf-app-enum";
import ttk_edf_app_tree_table_detail from "./ttk-edf-app-enum/apps/ttk-edf-app-tree-table-detail";
import ttk_edf_app_tree_table_type from "./ttk-edf-app-enum/apps/ttk-edf-app-tree-table-type";
import ttk_edf_app_history from "./ttk-edf-app-history";
import ttk_edf_app_html2json from "./ttk-edf-app-html2json";
import ttk_edf_app_iframe from "./ttk-edf-app-iframe";
import ttk_edf_app_im from "./ttk-edf-app-im";
import ttk_edf_app_message from "./ttk-edf-app-message";
import ttk_edf_app_operation from "./ttk-edf-app-operation";
import ttk_edf_app_portal_menu from "./ttk-edf-app-portal-menu";
import ttk_edf_app_portal_menu_detail from "./ttk-edf-app-portal-menu/apps/ttk-edf-app-portal-menu-detail";
import ttk_edf_app_role_auth from "./ttk-edf-app-role-auth";
import ttk_edf_app_role from "./ttk-edf-app-role-auth/apps/ttk-edf-app-role";
import ttk_edf_app_voucher from "./ttk-edf-app-voucher";
import ttk_edf_app_voucher_detail_setting from "./ttk-edf-app-voucher/apps/ttk-edf-app-voucher-detail-setting";
import ttk_edf_app_voucher_setting from "./ttk-edf-app-voucher/apps/ttk-edf-app-voucher-setting";
import ttk_edf_app_manage_import from "./ttk-edf-app-manage-import";
import ttk_edf_app_buy from "./ttk-edf-app-buy";
import ttk_edf_app_order_detail from "./edf-company-manage/apps/ttk-edf-app-order-detail";
import ttk_edf_app_org_activate from "./ttk-edf-app-org-activate";
import ttk_edf_app_help_center from "./ttk-edf-app-help-center";
import ttk_edf_app_org_verifyca from "./ttk-edf-app-org-verifyca";
import ttk_edf_app_dzgl_portal from "./ttk-edf-app-dzgl-portal";
import ttk_dzgl_app_register from "./ttk-dzgl-app-register";
import ttk_dzgl_app_register_organization from "./ttk-dzgl-app-register-organization";
import ttk_dzgl_app_register_choose from "./ttk-dzgl-app-register-choose";
import ttk_dzgl_app_agreement from "./ttk-dzgl-app-register/apps/ttk-dzgl-app-agreement";
import app_card_oldTaxNum from "./edfx-app-org/apps/app-card-oldTaxNum";
import edfx_app_my_setting_xdz from "./edfx-app-my-setting-xdz";
import ttk_dzgl_app_login from "./ttk-dzgl-app-login";
import ttk_dzgl_app_forget_password from "./ttk-dzgl-app-forget-password";
import ttk_dzgl_app_frame from "./ttk-dzgl-app-frame";
import ttk_dzgl_app_no_company from "./ttk-dzgl-app-login/apps/ttk-dzgl-app-no-company";
import ttk_edf_app_tax_type_change from "./ttk-edf-app-tax-type-change";
import ttk_edf_app_help from "./ttk-edf-app-help";

const obj = {
  [edf_company_manage.name]: edf_company_manage,
  [edf_company_manage_add.name]: edf_company_manage_add,
  [edf_company_manage_delete.name]: edf_company_manage_delete,
  [edfx_app_forgot_password.name]: edfx_app_forgot_password,
  [edfx_app_home.name]: edfx_app_home,
  [edfx_app_login.name]: edfx_app_login,
  [edfx_app_my_setting.name]: edfx_app_my_setting,
  [edfx_app_my_setting_change_mobile.name]: edfx_app_my_setting_change_mobile,
  [edfx_app_my_setting_change_password.name]: edfx_app_my_setting_change_password,
  [edfx_app_org.name]: edfx_app_org,
  [edfx_app_org_reinit.name]: edfx_app_org_reinit,
  [ttk_edf_app_modify_nature.name]: ttk_edf_app_modify_nature,
  [edfx_app_portal.name]: edfx_app_portal,
  [edfx_app_register.name]: edfx_app_register,
  [edfx_app_agreement.name]: edfx_app_agreement,
  [edfx_app_root.name]: edfx_app_root,
  [edfx_business_subject_manage.name]: edfx_business_subject_manage,
  [edfx_business_subject_card.name]: edfx_business_subject_card,
  [edfx_inventory_subject_card.name]: edfx_inventory_subject_card,
  [ttk_edf_app_article.name]: ttk_edf_app_article,
  [ttk_edf_app_beginner_guidance.name]: ttk_edf_app_beginner_guidance,
  [ttk_edf_app_column.name]: ttk_edf_app_column,
  [ttk_edf_app_column_detail.name]: ttk_edf_app_column_detail,
  [ttk_edf_app_column_setting.name]: ttk_edf_app_column_setting,
  [ttk_edf_app_column_type.name]: ttk_edf_app_column_type,
  [ttk_edf_app_desktop_init.name]: ttk_edf_app_desktop_init,
  [ttk_edf_app_devtools.name]: ttk_edf_app_devtools,
  [ttk_edf_app_enum.name]: ttk_edf_app_enum,
  [ttk_edf_app_tree_table_detail.name]: ttk_edf_app_tree_table_detail,
  [ttk_edf_app_tree_table_type.name]: ttk_edf_app_tree_table_type,
  [ttk_edf_app_history.name]: ttk_edf_app_history,
  [ttk_edf_app_html2json.name]: ttk_edf_app_html2json,
  [ttk_edf_app_iframe.name]: ttk_edf_app_iframe,
  [ttk_edf_app_im.name]: ttk_edf_app_im,
  [ttk_edf_app_message.name]: ttk_edf_app_message,
  [ttk_edf_app_operation.name]: ttk_edf_app_operation,
  [ttk_edf_app_portal_menu.name]: ttk_edf_app_portal_menu,
  [ttk_edf_app_portal_menu_detail.name]: ttk_edf_app_portal_menu_detail,
  [ttk_edf_app_role_auth.name]: ttk_edf_app_role_auth,
  [ttk_edf_app_role.name]: ttk_edf_app_role,
  [ttk_edf_app_voucher.name]: ttk_edf_app_voucher,
  [ttk_edf_app_voucher_detail_setting.name]: ttk_edf_app_voucher_detail_setting,
  [ttk_edf_app_voucher_setting.name]: ttk_edf_app_voucher_setting,
  [ttk_edf_app_manage_import.name]: ttk_edf_app_manage_import,
  [ttk_edf_app_buy.name]: ttk_edf_app_buy,
  [ttk_edf_app_order_detail.name]: ttk_edf_app_order_detail,
  [ttk_edf_app_org_activate.name]: ttk_edf_app_org_activate,
  [ttk_edf_app_help_center.name]: ttk_edf_app_help_center,
  [ttk_edf_app_org_verifyca.name]: ttk_edf_app_org_verifyca,
  [ttk_edf_app_dzgl_portal.name]: ttk_edf_app_dzgl_portal,
  [ttk_dzgl_app_register.name]: ttk_dzgl_app_register,
  [ttk_dzgl_app_agreement.name]: ttk_dzgl_app_agreement,
  [ttk_dzgl_app_register_organization.name]: ttk_dzgl_app_register_organization,
  [ttk_dzgl_app_register_choose.name]: ttk_dzgl_app_register_choose,
  [app_card_oldTaxNum.name]: app_card_oldTaxNum,
  [edfx_app_my_setting_xdz.name]: edfx_app_my_setting_xdz,
  [ttk_dzgl_app_login.name]: ttk_dzgl_app_login,
  [ttk_dzgl_app_forget_password.name]: ttk_dzgl_app_forget_password,
  [ttk_dzgl_app_frame.name]: ttk_dzgl_app_frame,
  [ttk_dzgl_app_no_company.name]: ttk_dzgl_app_no_company,
  [ttk_edf_app_tax_type_change.name]: ttk_edf_app_tax_type_change,
  [ttk_edf_app_help.name]: ttk_edf_app_help,
};
window.publicModule && window.publicModule.callback(obj, "edf");

export default obj;
