export const SCHEMAS = {
  notes: { title: '灵感手记', area: 'all', fields: [
    { key: 'title', label: '标题', required: true }, { key: 'body', label: '灵感 / 心得 / 速记', type: 'textarea', required: true },
    { key: 'kind', label: '类型', type: 'select', options: ['灵感', '心得', '速记', '教练建议'] },
    { key: 'date', label: '记录日期', type: 'date', required: true }, { key: 'tags', label: '标签（用逗号分隔）' },
    { key: 'status', label: '状态', type: 'select', options: ['收集', '已转行动', '归档'] },
  ] },
  reviews: { title: '复盘总结', area: 'all', fields: [
    { key: 'title', label: '复盘标题', required: true }, { key: 'period', label: '复盘周期', type: 'select', options: ['日报', '周报', '月报'] },
    { key: 'area', label: '复盘板块', type: 'select', options: ['主业工作', '个人生活', '创作成长'] },
    { key: 'date', label: '复盘日期', type: 'date', required: true }, { key: 'body', label: '复盘正文（Markdown）', type: 'textarea', required: true },
  ] },
  profiles: { title: '个人资料', area: 'settings', fields: [
    { key: 'name', label: '姓名', required: true }, { key: 'birthday', label: '出生日期', type: 'date' }, { key: 'role', label: '主业身份' },
    { key: 'side_enabled', label: '开启创作成长', type: 'select', options: ['开启', '关闭'] }, { key: 'side_name', label: '第三板块名称' },
    { key: 'theme', label: '视觉风格', type: 'select', options: ['云境', '曜金', '潮汐'] }, { key: 'mode', label: '明暗模式', type: 'select', options: ['白天', '夜间'] },
    { key: 'text_size', label: '阅读字号', type: 'select', options: ['标准', '舒适', '大字'] },
    { key: 'density', label: '布局密度', type: 'select', options: ['专注', '舒展'] },
    { key: 'background', label: '背景方案', type: 'select', options: ['流光', '纯净', '自定义'] }, { key: 'background_image', label: '背景图片（上传后自动填写）' },
    { key: 'overlay', label: '背景遮罩浓度（0–90）', type: 'number', min: 0, max: 90 },
  ] },
  tasks: { title: '待办事项', area: 'all', fields: [
    { key: 'title', label: '事项', required: true }, { key: 'area', label: '所属板块', type: 'select', options: ['主业工作', '个人生活', '创作成长'] },
    { key: 'category', label: '分类' }, { key: 'importance', label: '重要程度', type: 'select', options: ['重要', '一般'] }, { key: 'urgency', label: '紧急程度', type: 'select', options: ['紧急', '不紧急'] },
    { key: 'due', label: '截止日期', type: 'date' }, { key: 'status', label: '状态', type: 'select', options: ['待办', '进行中', '已完成'] },
    { key: 'customer_id', label: '关联客户', type: 'relation', table: 'customers' }, { key: 'project_id', label: '关联项目', type: 'relation', table: 'projects' },
    { key: 'notes', label: '备注 / 完成标准', type: 'textarea' }, { key: 'completed_at', label: '完成日期', type: 'date' },
    { key: 'note_id', label: '来源灵感手记', type: 'relation', table: 'notes' },
  ] },
  goals: { title: '量化目标', area: 'all', fields: [
    { key: 'name', label: '指标名称', required: true }, { key: 'area', label: '所属板块', type: 'select', options: ['主业工作', '个人生活', '创作成长'] },
    { key: 'period', label: '目标周期', type: 'select', options: ['年度', '季度', '月度'] }, { key: 'year', label: '年份', type: 'number', min: 2000, max: 2100, required: true },
    { key: 'period_index', label: '季度 1–4 / 月份 1–12（年度填 1）', type: 'number', min: 1, max: 12 },
    { key: 'unit', label: '单位（个 / 万元 / 元 / 次 / 小时…）', required: true }, { key: 'target', label: '目标值', type: 'number', min: 0.0001, required: true },
    { key: 'actual', label: '已达成值（手动指标）', type: 'number', min: 0 },
    { key: 'source', label: '达成值来源', type: 'select', options: ['手动填写', '完成待办数', '发布内容数', '收入合计', '运动分钟数', '学习分钟数'] },
    { key: 'notes', label: '指标口径 / 备注', type: 'textarea' },
  ] },
  customers: { title: '客户资产', area: 'work', fields: [
    { key: 'name', label: '客户名称', required: true }, { key: 'tier', label: '分级', type: 'select', options: ['S', 'A', 'B', 'C'] }, { key: 'industry', label: '行业' },
    { key: 'contact', label: '关键联系人' }, { key: 'contact_role', label: '联系人职务' }, { key: 'phone', label: '电话（仅本地保存）' },
    { key: 'anniversary', label: '纪念日', type: 'date' }, { key: 'hobby', label: '个人偏好（敏感字段）' }, { key: 'next_action', label: '下一行动' }, { key: 'notes', label: '备注', type: 'textarea' },
  ] },
  projects: { title: '销售项目', area: 'work', fields: [
    { key: 'name', label: '项目 / 线索名称', required: true }, { key: 'customer_id', label: '关联客户', type: 'relation', table: 'customers' },
    { key: 'kind', label: '类型', type: 'select', options: ['线索', '商机', '交付'] }, { key: 'stage', label: '阶段', type: 'select', options: ['待甄别', '需求确认', '方案共创', '决策确认', '商务合同', '合同交付', '已结项', '已失单'] },
    { key: 'source', label: '线索来源' }, { key: 'amount', label: '项目金额（万元）', type: 'number', min: 0 }, { key: 'probability', label: '赢单概率（%）', type: 'number', min: 0, max: 100 },
    { key: 'deadline', label: '关键节点日期', type: 'date' }, { key: 'next_action', label: '下一行动' }, { key: 'payment_due', label: '到期应收（万元）', type: 'number', min: 0 },
    { key: 'payment_received', label: '已收款（万元）', type: 'number', min: 0 }, { key: 'notes', label: '风险 / 交付备注', type: 'textarea' },
  ] },
  activities: { title: '拜访与营销', area: 'work', fields: [
    { key: 'title', label: '活动名称', required: true }, { key: 'kind', label: '活动类型', type: 'select', options: ['客户拜访', '高层对接', '营销活动', '复盘记录'] },
    { key: 'customer_id', label: '关联客户', type: 'relation', table: 'customers' }, { key: 'project_id', label: '关联项目', type: 'relation', table: 'projects' },
    { key: 'date', label: '日期', type: 'date', required: true }, { key: 'objective', label: '本次目标', type: 'textarea' }, { key: 'outcome', label: '事实 / 结果', type: 'textarea' }, { key: 'next_action', label: '下次行动' },
  ] },
  finance: { title: '财务管理', area: 'life', fields: [
    { key: 'title', label: '收支事项', required: true }, { key: 'kind', label: '类型', type: 'select', options: ['收入', '支出', '期初余额'] }, { key: 'category', label: '分类' },
    { key: 'amount', label: '金额（元）', type: 'number', min: 0, required: true }, { key: 'date', label: '日期', type: 'date', required: true }, { key: 'account', label: '账户' }, { key: 'notes', label: '备注', type: 'textarea' },
  ] },
  health: { title: '健康管理', area: 'life', fields: [
    { key: 'date', label: '记录日期', type: 'date', required: true }, { key: 'steps', label: '步数', type: 'number', min: 0 }, { key: 'sleep', label: '睡眠时长（小时）', type: 'number', min: 0, max: 24 },
    { key: 'weight', label: '体重（kg，可留空）', type: 'number', min: 0 }, { key: 'exercise', label: '运动时长（分钟）', type: 'number', min: 0 }, { key: 'water', label: '饮水（ml）', type: 'number', min: 0 }, { key: 'notes', label: '状态 / 备注', type: 'textarea' },
  ] },
  learning: { title: '学习管理', area: 'life', fields: [
    { key: 'title', label: '课程 / 学习计划', required: true }, { key: 'category', label: '领域' }, { key: 'planned', label: '计划时长（分钟）', type: 'number', min: 0 }, { key: 'completed', label: '已学时长（分钟）', type: 'number', min: 0 },
    { key: 'date', label: '学习日期', type: 'date' }, { key: 'deadline', label: '计划完成日期', type: 'date' }, { key: 'status', label: '状态', type: 'select', options: ['进行中', '未开始', '已完成'] }, { key: 'notes', label: '笔记 / 应用计划', type: 'textarea' },
  ] },
  family: { title: '家庭生活', area: 'life', fields: [
    { key: 'title', label: '家庭事项', required: true }, { key: 'date', label: '日期', type: 'date', required: true }, { key: 'repeat', label: '重复方式', type: 'select', options: ['不重复', '每年', '每月'] },
    { key: 'status', label: '状态', type: 'select', options: ['待办', '已完成'] }, { key: 'notes', label: '备注', type: 'textarea' },
  ] },
  content: { title: '自媒体运营', area: 'creator', fields: [
    { key: 'title', label: '选题 / 内容名称', required: true }, { key: 'platform', label: '平台', type: 'select', options: ['公众号', '视频号', '小红书', '抖音', 'B站', '其他'] },
    { key: 'format', label: '形式', type: 'select', options: ['图文', '短视频', '长视频', '直播'] }, { key: 'stage', label: '制作状态', type: 'select', options: ['选题池', '撰稿中', '制作中', '待发布', '已发布', '已复盘'] },
    { key: 'publish_date', label: '计划 / 实际发布日期', type: 'date' }, { key: 'views', label: '阅读 / 播放（次）', type: 'number', min: 0 }, { key: 'likes', label: '点赞（个）', type: 'number', min: 0 },
    { key: 'revenue', label: '内容收入（元）', type: 'number', min: 0 }, { key: 'notes', label: '受众价值 / 脚本 / 复盘', type: 'textarea' },
    { key: 'note_id', label: '来源灵感手记', type: 'relation', table: 'notes' },
  ] },
};

export const TABLE_NAMES = Object.keys(SCHEMAS);
export const APPEARANCE_THEMES = [
  { name: '云境', english: 'CLOUD', line: '澄澈钴蓝 · 轻盈有序' },
  { name: '曜金', english: 'AUREUM', line: '琥珀暖金 · 沉着有度' },
  { name: '潮汐', english: 'TIDE', line: '青碧海岸 · 从容向前' },
];
export function normalizeProfilePreferences(row) {
  const legacyThemes = { '简约': '云境', '热情': '曜金', '冷静': '潮汐' };
  return { ...row, theme: legacyThemes[row.theme] || row.theme || '云境', text_size: row.text_size || '舒适', density: row.density || '专注' };
}
export const columnsFor = (table) => ['id', ...(table === 'profiles' ? [] : ['user_id']), ...SCHEMAS[table].fields.map((f) => f.key), 'updated_at'];
export const todayISO = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export function defaultsFor(table, userId) {
  const row = { id: '', ...(table === 'profiles' ? {} : { user_id: userId }) };
  for (const field of SCHEMAS[table].fields) row[field.key] = field.type === 'select' ? field.options[0] : field.type === 'number' ? '0' : '';
  if (table === 'profiles') Object.assign(row, { side_name: '创作成长', overlay: '35', side_enabled: '开启', theme: '云境', mode: '白天', background: '流光', text_size: '舒适', density: '专注' });
  if (table === 'tasks') Object.assign(row, { importance: '重要', urgency: '不紧急', due: todayISO() });
  if (table === 'goals') Object.assign(row, { year: todayISO().slice(0, 4), period_index: '1', target: '1', unit: '个' });
  if (['activities', 'finance', 'health', 'learning', 'family', 'notes', 'reviews'].includes(table)) row.date = todayISO();
  return row;
}

export function validateRow(table, row) {
  if (!SCHEMAS[table]) throw new Error('未知数据表');
  for (const f of SCHEMAS[table].fields) {
    const value = String(row[f.key] ?? '').trim();
    if (f.required && !value) throw new Error(`${f.label}不能为空`);
    if (f.type === 'number' && value !== '') {
      const n = Number(value);
      if (!Number.isFinite(n) || (f.min !== undefined && n < f.min) || (f.max !== undefined && n > f.max)) throw new Error(`${f.label}超出允许范围`);
    }
    const legacyPreference = table === 'profiles' && (f.key === 'theme' && ['简约', '热情', '冷静'].includes(value) || ['text_size', 'density'].includes(f.key) && !value);
    if (f.type === 'select' && !f.options.includes(value) && !legacyPreference) throw new Error(`${f.label}选项无效`);
    if (f.type === 'date' && value) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) !== value) throw new Error(`${f.label}日期无效`);
    }
  }
  if (table === 'goals') {
    const index = Number(row.period_index);
    if (!Number.isInteger(index) || index < 1 || index > (row.period === '季度' ? 4 : row.period === '月度' ? 12 : 1)) throw new Error('目标周期序号无效');
    if (!Number.isInteger(Number(row.year))) throw new Error('年份必须为整数');
    const supportedUnits = { '完成待办数': ['个', '项', '次'], '发布内容数': ['个', '篇', '条'], '收入合计': ['元', '万元'], '运动分钟数': ['分钟', '小时'], '学习分钟数': ['分钟', '小时'] };
    if (supportedUnits[row.source] && !supportedUnits[row.source].includes(row.unit)) throw new Error('自动汇总来源与单位不匹配，请使用匹配的单位或选择手动填写');
  }
  if (table === 'profiles' && row.birthday && row.birthday > todayISO()) throw new Error('出生日期不能晚于今天');
  return row;
}

export function createDemoData() {
  const tables = Object.fromEntries(TABLE_NAMES.map((table) => [table, []]));
  const today = todayISO(); const year = today.slice(0, 4); const month = Number(today.slice(5, 7));
  const day = (offset) => { const d = new Date(`${today}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + offset); return d.toISOString().slice(0, 10); };
  let seq = 0;
  const add = (table, values, userId = 'person-yongjin') => { const row = { ...defaultsFor(table, userId), id: `${table}-${++seq}`, ...values, updated_at: new Date().toISOString() }; tables[table].push(row); return row; };
  add('profiles', { id: 'person-yongjin', name: '永进', birthday: '1988-06-18', role: 'ToB 大客户销售', side_name: '创作成长' });
  add('profiles', { id: 'person-lin', name: '林致远', birthday: '1994-09-12', role: '独立顾问', theme: '潮汐', side_enabled: '关闭' });
  add('notes', { title: '客户不是要更多功能，而是更少的不确定性', body: '今天拜访时想到：先把决策人最担心的风险讲清楚，再讨论功能清单。可以写成一个销售案例。', kind: '心得', date: today, tags: '销售,内容选题' });
  add('notes', { title: '工作台视频开场', body: '不要先展示功能。先问：你每天打开电脑，能不能在十秒内知道最该做的事？再展示四象限和灵感入口。', kind: '灵感', date: day(-1), tags: '视频,WorkBuddy' });
  const c1 = add('customers', { name: '华东智造集团', tier: 'S', industry: '高端制造', contact: '周岚', contact_role: '数字化平台主管', anniversary: day(8), hobby: '马拉松、咖啡', next_action: '邀请财务负责人参加试点会', notes: '虚构演示客户' });
  const c2 = add('customers', { name: '远海智慧物流', tier: 'A', industry: '物流', contact: '陈致远', contact_role: 'COO', next_action: '确认联合工作坊目标', notes: '虚构演示客户' });
  const p1 = add('projects', { name: '智能工厂协同平台一期', customer_id: c1.id, kind: '商机', stage: '决策确认', amount: '320', probability: '70', deadline: day(2), next_action: '确认财务决策人', source: '老客户转介绍', notes: '决策链待补齐' });
  add('projects', { name: '智慧供应链联合方案', customer_id: c2.id, kind: '线索', stage: '需求确认', amount: '180', probability: '30', deadline: day(6), next_action: '共创价值假设', source: '行业闭门会' });
  add('projects', { name: '能源运营数字化交付', kind: '交付', stage: '合同交付', amount: '186', probability: '100', deadline: day(-2), payment_due: '68', payment_received: '40', next_action: '确认验收与回款日期' });
  const task = (title, area, offset, values = {}) => add('tasks', { title, area, due: day(offset), ...values });
  task('确认华东智造试点决策会名单', '主业工作', 0, { urgency: '紧急', customer_id: c1.id, project_id: p1.id, category: '商机', notes: '让财务决策人参与，明确投资回报证据。' });
  task('跟进能源项目尾款', '主业工作', -1, { urgency: '紧急', category: '回款' });
  task('准备远海物流高层拜访', '主业工作', 1, { customer_id: c2.id, category: '拜访' });
  task('预约年度体检', '个人生活', 1, { category: '健康' });
  task('安排周末家庭聚餐', '个人生活', 3, { category: '家庭' });
  task('复盘个人本月支出', '个人生活', 0, { importance: '一般', urgency: '紧急', category: '财务' });
  task('录制 WorkBuddy 实战讲解', '创作成长', 0, { urgency: '紧急', category: '视频' });
  task('整理下周公众号选题', '创作成长', 4, { category: '选题' });
  task('清理过期资料', '主业工作', 5, { importance: '一般', category: '整理' });
  add('goals', { name: '年度签约', area: '主业工作', period: '年度', year, target: '1860', actual: '1268', unit: '万元' });
  add('goals', { name: '季度高层拜访', area: '主业工作', period: '季度', year, period_index: String(Math.ceil(month / 3)), target: '12', actual: '7', unit: '次' });
  add('goals', { name: '月度发布内容', area: '创作成长', period: '月度', year, period_index: String(month), target: '8', unit: '篇', source: '发布内容数' });
  add('goals', { name: '月度运动', area: '个人生活', period: '月度', year, period_index: String(month), target: '600', unit: '分钟', source: '运动分钟数' });
  add('activities', { title: '远海物流 COO 拜访', kind: '高层对接', customer_id: c2.id, date: day(1), objective: '确认业务指标、联合方案发起人和决策路径', next_action: '发送纪要并预约联合工作坊' });
  add('finance', { title: '期初账户余额', kind: '期初余额', amount: '42000', date: `${year}-01-01`, account: '主账户' });
  add('finance', { title: '工资收入', kind: '收入', category: '工资', amount: '28000', date: day(-4), account: '主账户' });
  add('finance', { title: '家庭采购', kind: '支出', category: '家庭', amount: '680', date: day(-1), account: '主账户' });
  add('finance', { title: '课程订阅', kind: '支出', category: '学习', amount: '299', date: today, account: '主账户' });
  for (let i = 0; i < 5; i++) add('health', { date: day(-i), steps: String(6500 + i * 650), sleep: String(7.2 + i * 0.1), weight: '72.5', exercise: String(25 + i * 5), water: '1800' });
  add('learning', { title: '顾问式提问训练', category: '销售', planned: '240', completed: '120', date: today, deadline: day(10), notes: '在下次高层拜访中实践' });
  add('learning', { title: '短视频剪辑', category: '自媒体', planned: '360', completed: '80', date: day(-2), deadline: day(14) });
  add('family', { title: '爸妈结婚纪念日', date: day(5), repeat: '每年', notes: '提前订好餐厅' });
  add('family', { title: '周日家庭日', date: day(4), notes: '保留不工作时间' });
  add('content', { title: '用 WorkBuddy 搭建个人工作台', platform: '视频号', format: '长视频', stage: '制作中', publish_date: day(2), notes: '实战录屏，展示本地 CSV 保存' });
  add('content', { title: '销售如何找到下一最佳行动', platform: '公众号', stage: '已发布', publish_date: day(-3), views: '3280', likes: '126' });
  add('content', { title: '客户关系不是通讯录', platform: '小红书', stage: '撰稿中', publish_date: day(5) });
  add('tasks', { title: '完成本周方案交付', area: '主业工作', due: day(1), category: '顾问项目' }, 'person-lin');
  add('goals', { name: '月度咨询收入', area: '主业工作', period: '月度', year, period_index: String(month), target: '50000', actual: '22000', unit: '元' }, 'person-lin');
  return tables;
}
