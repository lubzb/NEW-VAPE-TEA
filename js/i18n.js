// ═══════════════════════════════════════════════════════
//  I18N — English / Khmer translations
// ═══════════════════════════════════════════════════════

const i18n = {
    en: {
        app_name: 'Vape & Tea House',
        dashboard: 'Dashboard', pos: 'Point of Sale', products: 'Products', categories: 'Categories',
        customers: 'Customers', users: 'Users', reports: 'Reports', settings: 'Settings', logout: 'Logout',
        total_sales: 'Total Sales', orders: 'Orders', products_count: 'Products', stock: 'Stock',
        daily: 'Daily', monthly: 'Monthly', yearly: 'Yearly', export_pdf: 'Export PDF', export_excel: 'Export Excel',
        send_report: 'Send Report', add_product: 'Add Product', edit_product: 'Edit Product', delete_product: 'Delete Product',
        name: 'Name', description: 'Description', category: 'Category', price_usd: 'Price (USD)', price_khr: 'Price (KHR)',
        stock_qty: 'Stock Qty', barcode: 'Barcode', image: 'Image', save: 'Save', cancel: 'Cancel', confirm: 'Confirm',
        delete: 'Delete', edit: 'Edit', add: 'Add', search: 'Search...', no_data: 'No data found',
        select_category: 'Select Category', select_user: 'Select User', role: 'Role', username: 'Username',
        password: 'Password', full_name: 'Full Name', total: 'Total', subtotal: 'Subtotal', tax: 'Tax',
        discount: 'Discount', payment: 'Payment', cash: 'Cash', card: 'Card', bank: 'Bank Transfer',
        debt: 'On Credit (Debt)', complete: 'Complete', clear_cart: 'Clear Cart', qty: 'Qty', remove: 'Remove',
        add_to_cart: 'Add to Cart', scan_barcode: 'Scan Barcode', telegram_config: 'Telegram Config',
        bot_token: 'Bot Token', chat_id: 'Chat ID', auto_send: 'Auto Send Daily Report', enabled: 'Enabled',
        disabled: 'Disabled', send_now: 'Send Now', report_sent: 'Report sent successfully!', error: 'Error',
        success: 'Success', warning: 'Warning', info: 'Info', confirm_delete: 'Are you sure you want to delete this?',
        daily_report: 'Daily Report', monthly_report: 'Monthly Report', yearly_report: 'Yearly Report',
        sales_summary: 'Sales Summary', top_products: 'Top Products', payment_methods: 'Payment Methods',
        date: 'Date', total_orders: 'Total Orders', revenue: 'Revenue', profit: 'Profit', export: 'Export',
        telegram: 'Telegram', dark_mode: 'Dark Mode', light_mode: 'Light Mode', language: 'Language',
        currency: 'Currency', khmer: 'Khmer', english: 'English', usd: 'USD', khr: 'KHR',
        stock_alert: 'Low Stock Alert', out_of_stock: 'Out of Stock', in_stock: 'In Stock', phone: 'Phone',
        email: 'Email', address: 'Address', debt_balance: 'Debt Balance', select_customer: 'Select Customer',
        walkin: 'Walk-in Customer', add_customer: 'Add Customer', edit_customer: 'Edit Customer',
        payment_method: 'Payment Method', record_payment: 'Record Payment', amount_paid: 'Amount Paid',
        outstanding: 'Outstanding', reset_reports: 'Reset Reports',
        reset_confirm: 'This will delete ALL sales data. Are you sure?', both_currency: 'USD / KHR',
        change_password: 'Change Password', current_password: 'Current Password', new_password: 'New Password',
        confirm_password: 'Confirm Password', password_changed: 'Password changed successfully!',
        total_both: 'Total (USD / KHR)', cart_empty: 'Cart is empty', actions: 'Actions', user: 'User',
        method: 'Method', count: 'Count', generated: 'Generated', all: 'All', cart: 'Cart',
        recent_orders: 'Recent Orders', login_title: 'Sign in to your account', sign_in: 'Sign In',
        invalid_login: 'Invalid username or password', loading: 'Loading...'
    },
    kh: {
        app_name: 'ហាង Vape & Tea',
        dashboard: 'ផ្ទាំងគ្រប់គ្រង', pos: 'ចំណុចលក់', products: 'ផលិតផល', categories: 'ប្រភេទ',
        customers: 'អតិថិជន', users: 'អ្នកប្រើប្រាស់', reports: 'របាយការណ៍', settings: 'ការកំណត់', logout: 'ចាកចេញ',
        total_sales: 'ប្រាក់ចំណូលសរុប', orders: 'ការបញ្ជាទិញ', products_count: 'ផលិតផល', stock: 'ស្តុក',
        daily: 'ប្រចាំថ្ងៃ', monthly: 'ប្រចាំខែ', yearly: 'ប្រចាំឆ្នាំ', export_pdf: 'នាំចេញ PDF', export_excel: 'នាំចេញ Excel',
        send_report: 'ផ្ញើរបាយការណ៍', add_product: 'បន្ថែមផលិតផល', edit_product: 'កែសម្រួលផលិតផល', delete_product: 'លុបផលិតផល',
        name: 'ឈ្មោះ', description: 'ការពិពណ៌នា', category: 'ប្រភេទ', price_usd: 'តម្លៃ (USD)', price_khr: 'តម្លៃ (KHR)',
        stock_qty: 'បរិមាណស្តុក', barcode: 'បាកូដ', image: 'រូបភាព', save: 'រក្សាទុក', cancel: 'បោះបង់', confirm: 'បញ្ជាក់',
        delete: 'លុប', edit: 'កែ', add: 'បន្ថែម', search: 'ស្វែងរក...', no_data: 'រកមិនឃើញទិន្នន័យ',
        select_category: 'ជ្រើសរើសប្រភេទ', select_user: 'ជ្រើសរើសអ្នកប្រើ', role: 'តួនាទី', username: 'ឈ្មោះអ្នកប្រើ',
        password: 'ពាក្យសម្ងាត់', full_name: 'ឈ្មោះពេញ', total: 'សរុប', subtotal: 'សរុបរង', tax: 'ពន្ធ',
        discount: 'បញ្ចុះតម្លៃ', payment: 'ការទូទាត់', cash: 'សាច់ប្រាក់', card: 'កាត', bank: 'ផ្ទេរតាមធនាគារ',
        debt: 'ជំពាក់ (ទុន)', complete: 'បញ្ចប់', clear_cart: 'សម្អាតកន្ត្រក', qty: 'បរិមាណ', remove: 'ដកចេញ',
        add_to_cart: 'បន្ថែមទៅកន្ត្រក', scan_barcode: 'ស្កេនបាកូដ', telegram_config: 'ការកំណត់ Telegram',
        bot_token: 'Bot Token', chat_id: 'Chat ID', auto_send: 'ផ្ញើរបាយការណ៍ប្រចាំថ្ងៃដោយស្វ័យប្រវត្តិ', enabled: 'បើក',
        disabled: 'បិទ', send_now: 'ផ្ញើឥឡូវនេះ', report_sent: 'របាយការណ៍ត្រូវបានផ្ញើដោយជោគជ័យ!', error: 'កំហុស',
        success: 'ជោគជ័យ', warning: 'ការព្រមាន', info: 'ព័ត៌មាន', confirm_delete: 'តើអ្នកប្រាកដថាចង់លុបវាទេ?',
        daily_report: 'របាយការណ៍ប្រចាំថ្ងៃ', monthly_report: 'របាយការណ៍ប្រចាំខែ', yearly_report: 'របាយការណ៍ប្រចាំឆ្នាំ',
        sales_summary: 'សង្ខេបការលក់', top_products: 'ផលិតផលកំពូល', payment_methods: 'វិធីសាស្ត្រទូទាត់',
        date: 'កាលបរិច្ឆេទ', total_orders: 'ចំនួនការបញ្ជាទិញ', revenue: 'ចំណូល', profit: 'ប្រាក់ចំណេញ', export: 'នាំចេញ',
        telegram: 'Telegram', dark_mode: 'របៀបងងឹត', light_mode: 'របៀបភ្លឺ', language: 'ភាសា',
        currency: 'រូបិយប័ណ្ណ', khmer: 'ខ្មែរ', english: 'អង់គ្លេស', usd: 'USD', khr: 'KHR',
        stock_alert: 'ការជូនដំណឹងស្តុកទាប', out_of_stock: 'អស់ស្តុក', in_stock: 'មានស្តុក', phone: 'ទូរស័ព្ទ',
        email: 'អ៊ីមែល', address: 'អាសយដ្ឋាន', debt_balance: 'សមតុល្យជំពាក់', select_customer: 'ជ្រើសរើសអតិថិជន',
        walkin: 'អតិថិជនទូទៅ', add_customer: 'បន្ថែមអតិថិជន', edit_customer: 'កែសម្រួលអតិថិជន',
        payment_method: 'វិធីទូទាត់', record_payment: 'កត់ត្រាការទូទាត់', amount_paid: 'ចំនួនទឹកប្រាក់',
        outstanding: 'សល់ជំពាក់', reset_reports: 'កំណត់របាយការណ៍ឡើងវិញ',
        reset_confirm: 'តើអ្នកប្រាកដថាចង់លុបទិន្នន័យលក់ទាំងអស់?', both_currency: 'USD / KHR',
        change_password: 'ប្តូរពាក្យសម្ងាត់', current_password: 'ពាក្យសម្ងាត់បច្ចុប្បន្ន', new_password: 'ពាក្យសម្ងាត់ថ្មី',
        confirm_password: 'បញ្ជាក់ពាក្យសម្ងាត់', password_changed: 'ពាក្យសម្ងាត់ត្រូវបានផ្លាស់ប្តូរដោយជោគជ័យ!',
        total_both: 'សរុប (USD / KHR)', cart_empty: 'កន្ត្រកទទេ', actions: 'សកម្មភាព', user: 'អ្នកប្រើប្រាស់',
        method: 'វិធីសាស្ត្រ', count: 'ចំនួន', generated: 'បង្កើតនៅ', all: 'ទាំងអស់', cart: 'កន្ត្រក',
        recent_orders: 'ការបញ្ជាទិញថ្មីៗ', login_title: 'ចូលទៅគណនីរបស់អ្នក', sign_in: 'ចូល',
        invalid_login: 'ឈ្មោះអ្នកប្រើ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ', loading: 'កំពុងផ្ទុក...'
    }
};

function t(key) {
    const s = getSettingsCache();
    const lang = (s && s.language) || 'en';
    return i18n[lang]?.[key] || i18n['en'][key] || key;
}
