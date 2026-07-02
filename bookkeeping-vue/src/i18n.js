import { reactive } from 'vue'

const KEY = 'bookkeeping-locale'

export const localeState = reactive({
  lang: localStorage.getItem(KEY) || 'en'
})

export const languages = [
  { key: 'en', label: 'EN' },
  { key: 'zh', label: '中文' }
]

const messages = {
  en: {
    'app.title': '💰 Bookkeeping', 'app.name': 'Daily Bookkeeping',
    'nav.records': 'Records', 'nav.add': 'Add', 'nav.stats': 'Stats', 'nav.more': 'More',
    'common.cancel': 'Cancel', 'common.save': 'Save', 'common.today': 'Today', 'common.delete': 'Delete',
    'common.expense': 'Expense', 'common.income': 'Income', 'common.balance': 'Balance',
    'common.all': 'All', 'common.day': 'Day', 'common.week': 'Week', 'common.month': 'Month',
    'common.note': 'Note', 'common.amount': 'Amount', 'common.category': 'Category', 'common.date': 'Date',

    'login.subLogin': 'Welcome back — sign in to continue.',
    'login.subRegister': 'Create an account to get started.',
    'login.username': 'Username', 'login.password': 'Password',
    'login.usernamePh': 'your name', 'login.login': 'Log in', 'login.register': 'Create account',
    'login.busy': 'Please wait…', 'login.noAccount': 'No account yet?', 'login.haveAccount': 'Already have an account?',
    'login.toRegister': 'Register', 'login.toLogin': 'Log in',
    'login.welcomeBack': 'Welcome back, {name}!', 'login.created': 'Account created — welcome, {name}!',
    'login.pwHint': 'At least 6 characters, with a letter and a number.',

    'rec.title': 'Records', 'rec.search': '🔍 Search note or category...',
    'rec.filterAmount': 'Amount filter', 'rec.min': 'Min', 'rec.max': 'Max', 'rec.clear': 'Clear',
    'rec.empty': 'No records for this period. Start logging above!',
    'rec.emptyFiltered': 'No records match your search/filters.',
    'rec.exportCsv': '⬇ CSV',

    'add.title': 'Add Record', 'add.hint': 'Tap a category to add a {type}.', 'add.recurring': '🔁 Recurring',

    'sheet.new': 'New Record', 'sheet.edit': 'Edit Record', 'sheet.optional': 'Optional...',
    'sheet.save': '✓ Save', 'sheet.update': '✓ Update',

    'stats.title': 'Statistics', 'stats.budgets': '🎯 Budgets',
    'chart.breakdown': 'Breakdown by Category', 'chart.total': 'Total {type}', 'chart.noData': 'No {type} data for this period.',
    'trend.title': '6-Month Trend',

    'budget.title': 'Budgets', 'budget.overall': 'Overall monthly budget', 'budget.remove': 'Remove',
    'budget.setLimit': 'Set a monthly limit', 'budget.byCategory': 'By category',
    'budget.none': 'No category budgets yet. Add one below.', 'budget.pick': 'Pick a category…',
    'budget.limit': 'Limit', 'budget.add': 'Add', 'budget.left': '{x} left', 'budget.over': '{x} over',
    'budget.alertOver': '{label} over budget by {over}', 'budget.overallLabel': 'Overall',

    'recur.title': 'Recurring', 'recur.runNow': 'Run now', 'recur.newRule': 'New rule', 'recur.editRule': 'Edit rule',
    'recur.frequency': 'Frequency', 'recur.daily': 'Daily', 'recur.weekly': 'Weekly', 'recur.monthly': 'Monthly',
    'recur.nextRun': 'Next run', 'recur.notePh': 'Note (optional)', 'recur.addBtn': '＋ Add recurring', 'recur.saveBtn': '✓ Save changes',
    'recur.none': 'No recurring rules yet. Add one above (e.g. monthly rent).',
    'recur.nextLabel': 'next {date}', 'recur.created': 'Created {n} record(s)', 'recur.nothingDue': 'Nothing due right now',

    'habit.title': 'Habits', 'habit.new': 'New habit', 'habit.editName': 'Edit habit name...', 'habit.newName': 'New habit name...',
    'habit.addBtn': '＋ Add Habit', 'habit.saveBtn': '✓ Save', 'habit.icon': 'Icon', 'habit.color': 'Color',
    'habit.none': 'No habits yet. Tap ＋ to create one and start your streak!',
    'habit.viewGrid': '▦ Grid', 'habit.viewRing': '◍ Ring', 'habit.viewWeek': '● Week', 'habit.viewMonth': '🗓 Month',
    'habit.best': 'best', 'habit.day': 'day', 'habit.days': 'days', 'habit.ringSub': '{n}/30 days', 'habit.doneFab': 'done!',
    'habit.confirmDelete': 'Delete habit "{name}" and all its check-ins?', 'habit.deleted': 'Habit deleted',

    'todo.title': 'Daily Checklist', 'todo.addPh': 'Add a task for this day...',
    'todo.done': '{done} / {total} done', 'todo.none': 'Nothing for this day yet. Add your first task above! ✨',
    'todo.byPriority': 'By priority', 'todo.byTime': 'By time', 'todo.priority': 'Priority',

    'timer.title': 'Timer', 'timer.stopwatch': 'Stopwatch', 'timer.modeTimer': '⏲️ Timer', 'timer.modeStopwatch': '⏱️ Stopwatch',
    'timer.remaining': 'Remaining', 'timer.paused': 'Paused', 'timer.timesUp': "Time's up!", 'timer.setHint': 'Outer = min · inner = sec',
    'timer.start': 'Start', 'timer.pause': 'Pause', 'timer.resume': 'Resume', 'timer.startAgain': 'Start again',
    'timer.reset': 'Reset', 'timer.lap': 'Lap', 'timer.stop': 'Stop', 'timer.running': 'Running', 'timer.stopped': 'Stopped',

    'more.title': 'More',
    'more.habits': 'Habits', 'more.habitsDesc': 'Track daily habits & streaks',
    'more.daily': 'Daily Checklist', 'more.dailyDesc': 'To-dos per day',
    'more.timer': 'Timer', 'more.timerDesc': 'Countdown & stopwatch',
    'more.budgets': 'Budgets', 'more.budgetsDesc': 'Monthly spending limits',
    'more.recurring': 'Recurring', 'more.recurringDesc': 'Auto-generated entries',
    'more.account': 'Account', 'more.accountDesc': 'Profile & log out',
    'more.history': 'All records', 'more.historyDesc': 'Search & browse full history',
    'history.title': 'All records', 'history.empty': 'No records found.',
    'history.pageOf': 'Page {c} / {p}', 'history.count': '{n} total', 'history.from': 'From', 'history.to': 'To',

    'acct.title': 'Account', 'acct.signedIn': 'Signed in', 'acct.currency': 'Currency symbol',
    'acct.theme': 'Theme', 'acct.chooseTheme': 'Choose theme', 'acct.chooseCurrency': 'Choose currency',
    'acct.language': 'Language',
    'acct.export': '⬇ Export backup', 'acct.import': '⬆ Import backup',
    'acct.clear': '🗑 Clear all my records', 'acct.logout': '⎋ Log out',
    'acct.tip': 'Your records, habits and checklist are private to this account.',
    'acct.base': 'Base', 'acct.light': 'Light', 'acct.dark': 'Dark', 'acct.primary': 'Primary',
    'acct.backupDownloaded': 'Backup downloaded', 'acct.notJson': 'That file is not valid JSON.',
    'acct.restored': 'Backup restored — reloading…', 'acct.loggedOut': 'Logged out',
    'acct.confirmClear': "Delete ALL of {name}'s records? This cannot be undone.",
    'acct.confirmImport': 'Importing will REPLACE all your current data with this backup. Continue?',
    'acct.deleteAll': 'Delete all', 'acct.importReplace': 'Import & replace',
    'acct.importChoose': 'How would you like to import this backup?',
    'acct.mergeBtn': 'Merge (keep current)', 'acct.replaceBtn': 'Replace all',

    'weather.setLocation': 'Set weather location', 'weather.useMyLocation': '📍 Use my location',
    'weather.searchPh': 'Search a city…', 'weather.myLocation': 'My location',
    'weather.unavailable': 'Weather unavailable', 'weather.chooseLocation': 'Weather location',
    'weather.clear': 'Clear', 'weather.mainlyClear': 'Mainly clear', 'weather.partlyCloudy': 'Partly cloudy',
    'weather.overcast': 'Overcast', 'weather.fog': 'Fog', 'weather.drizzle': 'Drizzle', 'weather.rain': 'Rain',
    'weather.showers': 'Showers', 'weather.snow': 'Snow', 'weather.thunder': 'Thunderstorm', 'weather.unknown': 'Weather',

    'toast.recordSaved': 'Record saved', 'toast.recordUpdated': 'Record updated', 'toast.recordDeleted': 'Record deleted',
    'toast.recordsCleared': 'All records cleared', 'toast.budgetSaved': 'Budget saved', 'toast.budgetRemoved': 'Budget removed',
    'toast.recurAdded': 'Recurring rule added', 'toast.recurDeleted': 'Recurring rule deleted',
    'err.network': 'Cannot reach the server. Is the Spring Boot backend running on port 8030?',
    'err.server': 'Server error. Please try again.', 'err.session': 'Session expired. Please log in again.',
    'err.generic': 'Request failed ({status}).',
    'err.invalidCreds': 'Invalid username or password', 'err.userTaken': 'Username already taken',
    'err.usernameRequired': 'Username is required',
    'err.weakPassword': 'Password must be at least 6 characters and include a letter and a number',
    'err.tooMany': 'Too many failed attempts. Try again in {n}s.',
    'err.typeInvalid': "Type must be income or expense", 'err.amountPositive': 'Amount must be greater than 0',
    'err.categoryRequired': 'Category is required', 'err.dateRequired': 'Date is required'
  },
  zh: {
    'app.title': '💰 记账', 'app.name': '每日记账',
    'nav.records': '记录', 'nav.add': '记账', 'nav.stats': '统计', 'nav.more': '更多',
    'common.cancel': '取消', 'common.save': '保存', 'common.today': '今天', 'common.delete': '删除',
    'common.expense': '支出', 'common.income': '收入', 'common.balance': '结余',
    'common.all': '全部', 'common.day': '日', 'common.week': '周', 'common.month': '月',
    'common.note': '备注', 'common.amount': '金额', 'common.category': '分类', 'common.date': '日期',

    'login.subLogin': '欢迎回来 —— 登录以继续。',
    'login.subRegister': '创建一个账号开始使用。',
    'login.username': '用户名', 'login.password': '密码',
    'login.usernamePh': '你的名字', 'login.login': '登录', 'login.register': '创建账号',
    'login.busy': '请稍候…', 'login.noAccount': '还没有账号？', 'login.haveAccount': '已经有账号了？',
    'login.toRegister': '注册', 'login.toLogin': '登录',
    'login.welcomeBack': '欢迎回来，{name}！', 'login.created': '账号已创建 —— 欢迎，{name}！',
    'login.pwHint': '至少 6 位，包含字母和数字。',

    'rec.title': '记录', 'rec.search': '🔍 搜索备注或分类...',
    'rec.filterAmount': '金额筛选', 'rec.min': '最小', 'rec.max': '最大', 'rec.clear': '清除',
    'rec.empty': '本期还没有记录,在上方开始记账吧!',
    'rec.emptyFiltered': '没有符合搜索/筛选条件的记录。',
    'rec.exportCsv': '⬇ 导出 CSV',

    'add.title': '记一笔', 'add.hint': '点一个分类来记{type}。', 'add.recurring': '🔁 周期',

    'sheet.new': '新增记录', 'sheet.edit': '编辑记录', 'sheet.optional': '选填...',
    'sheet.save': '✓ 保存', 'sheet.update': '✓ 更新',

    'stats.title': '统计', 'stats.budgets': '🎯 预算',
    'chart.breakdown': '分类占比', 'chart.total': '{type}合计', 'chart.noData': '本期没有{type}数据。',
    'trend.title': '近 6 个月趋势',

    'budget.title': '预算', 'budget.overall': '整体月度预算', 'budget.remove': '移除',
    'budget.setLimit': '设置月度限额', 'budget.byCategory': '按分类',
    'budget.none': '还没有分类预算,在下方添加一个。', 'budget.pick': '选择分类…',
    'budget.limit': '限额', 'budget.add': '添加', 'budget.left': '还剩 {x}', 'budget.over': '超支 {x}',
    'budget.alertOver': '{label} 已超支 {over}', 'budget.overallLabel': '整体',

    'recur.title': '周期交易', 'recur.runNow': '立即执行', 'recur.newRule': '新建规则', 'recur.editRule': '编辑规则',
    'recur.frequency': '频率', 'recur.daily': '每天', 'recur.weekly': '每周', 'recur.monthly': '每月',
    'recur.nextRun': '下次执行', 'recur.notePh': '备注(选填)', 'recur.addBtn': '＋ 添加周期', 'recur.saveBtn': '✓ 保存修改',
    'recur.none': '还没有周期规则,在上面添加一个(比如每月房租)。',
    'recur.nextLabel': '下次 {date}', 'recur.created': '生成了 {n} 条记录', 'recur.nothingDue': '当前没有到期的',

    'habit.title': '习惯', 'habit.new': '新建习惯', 'habit.editName': '编辑习惯名称...', 'habit.newName': '新习惯名称...',
    'habit.addBtn': '＋ 添加习惯', 'habit.saveBtn': '✓ 保存', 'habit.icon': '图标', 'habit.color': '颜色',
    'habit.none': '还没有习惯。点 ＋ 创建一个,开始你的连续打卡!',
    'habit.viewGrid': '▦ 网格', 'habit.viewRing': '◍ 圆环', 'habit.viewWeek': '● 本周', 'habit.viewMonth': '🗓 月历',
    'habit.best': '最佳', 'habit.day': '天', 'habit.days': '天', 'habit.ringSub': '{n}/30 天', 'habit.doneFab': '打卡!',
    'habit.confirmDelete': '删除习惯「{name}」及其全部打卡记录?', 'habit.deleted': '习惯已删除',

    'todo.title': '每日清单', 'todo.addPh': '添加今天的一项任务...',
    'todo.done': '{done} / {total} 已完成', 'todo.none': '今天还没有任务,在上方添加第一项吧! ✨',
    'todo.byPriority': '按优先级', 'todo.byTime': '按时间', 'todo.priority': '优先级',

    'timer.title': '计时器', 'timer.stopwatch': '秒表', 'timer.modeTimer': '⏲️ 计时器', 'timer.modeStopwatch': '⏱️ 秒表',
    'timer.remaining': '剩余', 'timer.paused': '已暂停', 'timer.timesUp': '时间到!', 'timer.setHint': '外环 = 分 · 内环 = 秒',
    'timer.start': '开始', 'timer.pause': '暂停', 'timer.resume': '继续', 'timer.startAgain': '重新开始',
    'timer.reset': '重置', 'timer.lap': '计圈', 'timer.stop': '停止', 'timer.running': '计时中', 'timer.stopped': '已停止',

    'more.title': '更多',
    'more.habits': '习惯', 'more.habitsDesc': '打卡习惯与连续天数',
    'more.daily': '每日清单', 'more.dailyDesc': '按天的待办',
    'more.timer': '计时器', 'more.timerDesc': '倒计时与秒表',
    'more.budgets': '预算', 'more.budgetsDesc': '每月支出限额',
    'more.recurring': '周期交易', 'more.recurringDesc': '自动生成的记录',
    'more.account': '账号', 'more.accountDesc': '资料与退出登录',
    'more.history': '全部记录', 'more.historyDesc': '搜索与浏览完整历史',
    'history.title': '全部记录', 'history.empty': '没有找到记录。',
    'history.pageOf': '第 {c} / {p} 页', 'history.count': '共 {n} 条', 'history.from': '起', 'history.to': '止',

    'acct.title': '账号', 'acct.signedIn': '已登录', 'acct.currency': '货币符号',
    'acct.theme': '主题', 'acct.chooseTheme': '选择主题', 'acct.chooseCurrency': '选择货币',
    'acct.language': '语言',
    'acct.export': '⬇ 导出备份', 'acct.import': '⬆ 导入备份',
    'acct.clear': '🗑 清空我的全部记录', 'acct.logout': '⎋ 退出登录',
    'acct.tip': '你的记录、习惯和清单仅属于此账号。',
    'acct.base': '基色', 'acct.light': '浅色', 'acct.dark': '深色', 'acct.primary': '主色',
    'acct.backupDownloaded': '备份已下载', 'acct.notJson': '该文件不是有效的 JSON。',
    'acct.restored': '备份已恢复 —— 正在重新加载…', 'acct.loggedOut': '已退出登录',
    'acct.confirmClear': '删除 {name} 的全部记录?此操作不可撤销。',
    'acct.confirmImport': '导入将用该备份替换你当前的全部数据,继续吗?',
    'acct.deleteAll': '全部删除', 'acct.importReplace': '导入并替换',
    'acct.importChoose': '要如何导入这份备份?',
    'acct.mergeBtn': '合并(保留现有)', 'acct.replaceBtn': '替换全部',

    'weather.setLocation': '设置天气位置', 'weather.useMyLocation': '📍 使用我的定位',
    'weather.searchPh': '搜索城市…', 'weather.myLocation': '我的位置',
    'weather.unavailable': '天气不可用', 'weather.chooseLocation': '天气位置',
    'weather.clear': '晴', 'weather.mainlyClear': '晴间多云', 'weather.partlyCloudy': '多云',
    'weather.overcast': '阴', 'weather.fog': '雾', 'weather.drizzle': '毛毛雨', 'weather.rain': '雨',
    'weather.showers': '阵雨', 'weather.snow': '雪', 'weather.thunder': '雷阵雨', 'weather.unknown': '天气',

    'toast.recordSaved': '记录已保存', 'toast.recordUpdated': '记录已更新', 'toast.recordDeleted': '记录已删除',
    'toast.recordsCleared': '已清空全部记录', 'toast.budgetSaved': '预算已保存', 'toast.budgetRemoved': '预算已移除',
    'toast.recurAdded': '周期规则已添加', 'toast.recurDeleted': '周期规则已删除',
    'err.network': '无法连接服务器。Spring Boot 后端是否在 8030 端口运行?',
    'err.server': '服务器错误,请重试。', 'err.session': '登录已过期,请重新登录。',
    'err.generic': '请求失败 ({status})。',
    'err.invalidCreds': '用户名或密码错误', 'err.userTaken': '用户名已被占用',
    'err.usernameRequired': '请输入用户名',
    'err.weakPassword': '密码至少 6 位,且需包含字母和数字',
    'err.tooMany': '登录尝试过多,请 {n} 秒后再试。',
    'err.typeInvalid': '类型必须是收入或支出', 'err.amountPositive': '金额必须大于 0',
    'err.categoryRequired': '请选择分类', 'err.dateRequired': '请填写日期'
  }
}

// Map known backend (English) error messages to a localized string; unknown -> return as-is.
const SERVER_MSG_MAP = [
  ['Invalid username or password', 'err.invalidCreds'],
  ['Username already taken', 'err.userTaken'],
  ['Username is required', 'err.usernameRequired'],
  ['Password must be', 'err.weakPassword'],
  ['Too many failed attempts', 'err.tooMany'],
  ['type must be', 'err.typeInvalid'],
  ['amount must be greater than 0', 'err.amountPositive'],
  ['category is required', 'err.categoryRequired'],
  ['date is required', 'err.dateRequired']
]

export function localizeServerMessage(msg) {
  if (!msg) return msg
  // Rate-limit message carries a seconds count — preserve it.
  if (msg.indexOf('Too many failed attempts') !== -1) {
    const m = msg.match(/(\d+)\s*s/)
    return t('err.tooMany', { n: m ? m[1] : '' })
  }
  for (const [frag, key] of SERVER_MSG_MAP) {
    if (msg.indexOf(frag) !== -1) return t(key)
  }
  return msg
}

// English category labels are the stored values; provide Chinese display labels.
const categoryZh = {
  Dining: '餐饮', Breakfast: '早餐', Drinks: '饮品', Transport: '交通', Fuel: '加油',
  Shopping: '购物', Clothing: '服饰', Housing: '住房', Utilities: '水电', 'Phone & Internet': '话费网费',
  Entertainment: '娱乐', Travel: '旅行', Medical: '医疗', Education: '教育', Beauty: '美容',
  Sports: '运动', Pets: '宠物', Gifts: '礼物', 'Taxes & Fees': '税费', Insurance: '保险',
  Family: '家庭', Other: '其他',
  Salary: '工资', Bonus: '奖金', 'Part-time': '兼职', Investment: '投资', Interest: '利息',
  Refund: '退款', 'Red Packet': '红包', Rent: '租金'
}

export function setLocale(lang) {
  localeState.lang = lang
  localStorage.setItem(KEY, lang)
}

/** Translate a key with optional {param} interpolation. Falls back zh -> en -> key. */
export function t(key, params) {
  const lang = localeState.lang
  let str = (messages[lang] && messages[lang][key]) || messages.en[key] || key
  if (params) {
    for (const p in params) str = str.replace('{' + p + '}', params[p])
  }
  return str
}

/** Format a date ('YYYY-MM-DD' string or Date) using the current locale. */
export function localeDate(dateOrStr, opts) {
  const d = typeof dateOrStr === 'string' ? new Date(dateOrStr + 'T00:00:00') : dateOrStr
  return d.toLocaleDateString(localeState.lang === 'zh' ? 'zh-CN' : 'en-US', opts)
}

/** Localized display label for a stored (English) category name. */
export function catLabel(name) {
  if (localeState.lang === 'zh') return categoryZh[name] || name
  return name
}

// Vue plugin: exposes $t and $catLabel in templates.
export const i18n = {
  install(app) {
    app.config.globalProperties.$t = t
    app.config.globalProperties.$catLabel = catLabel
  }
}
