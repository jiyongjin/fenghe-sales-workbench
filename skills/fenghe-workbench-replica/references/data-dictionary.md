# 完整CSV字段字典（从代码导出）

权威机器格式为 data-dictionary.json。默认日期是提取时样例，不是未来创建记录的固定日期。数值仍以字符串保存在CSV。

## notes.csv · 灵感手记

表头：

```text
id,user_id,title,body,kind,date,tags,status,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| title | 标题 | text | 是 |  |
| body | 灵感 / 心得 / 速记 | textarea | 是 |  |
| kind | 类型 | select | 否 | 灵感 / 心得 / 速记 / 教练建议 |
| date | 记录日期 | date | 是 |  |
| tags | 标签（用逗号分隔） | text | 否 |  |
| status | 状态 | select | 否 | 收集 / 已转行动 / 归档 |

## reviews.csv · 复盘总结

表头：

```text
id,user_id,title,period,area,date,body,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| title | 复盘标题 | text | 是 |  |
| period | 复盘周期 | select | 否 | 日报 / 周报 / 月报 |
| area | 复盘板块 | select | 否 | 主业工作 / 个人生活 / 创作成长 |
| date | 复盘日期 | date | 是 |  |
| body | 复盘正文（Markdown） | textarea | 是 |  |

## profiles.csv · 个人资料

表头：

```text
id,name,birthday,role,side_enabled,side_name,theme,mode,text_size,density,background,background_image,overlay,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| name | 姓名 | text | 是 |  |
| birthday | 出生日期 | date | 否 |  |
| role | 主业身份 | text | 否 |  |
| side_enabled | 开启创作成长 | select | 否 | 开启 / 关闭 |
| side_name | 第三板块名称 | text | 否 |  |
| theme | 视觉风格 | select | 否 | 云境 / 曜金 / 潮汐 |
| mode | 明暗模式 | select | 否 | 白天 / 夜间 |
| text_size | 阅读字号 | select | 否 | 标准 / 舒适 / 大字 |
| density | 布局密度 | select | 否 | 专注 / 舒展 |
| background | 背景方案 | select | 否 | 流光 / 纯净 / 自定义 |
| background_image | 背景图片（上传后自动填写） | text | 否 |  |
| overlay | 背景遮罩浓度（0–90） | number | 否 | min=0; max=90 |

## tasks.csv · 待办事项

表头：

```text
id,user_id,title,area,category,importance,urgency,due,status,customer_id,project_id,notes,completed_at,note_id,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| title | 事项 | text | 是 |  |
| area | 所属板块 | select | 否 | 主业工作 / 个人生活 / 创作成长 |
| category | 分类 | text | 否 |  |
| importance | 重要程度 | select | 否 | 重要 / 一般 |
| urgency | 紧急程度 | select | 否 | 紧急 / 不紧急 |
| due | 截止日期 | date | 否 |  |
| status | 状态 | select | 否 | 待办 / 进行中 / 已完成 |
| customer_id | 关联客户 | relation | 否 | → customers |
| project_id | 关联项目 | relation | 否 | → projects |
| notes | 备注 / 完成标准 | textarea | 否 |  |
| completed_at | 完成日期 | date | 否 |  |
| note_id | 来源灵感手记 | relation | 否 | → notes |

## goals.csv · 量化目标

表头：

```text
id,user_id,name,area,period,year,period_index,unit,target,actual,source,notes,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| name | 指标名称 | text | 是 |  |
| area | 所属板块 | select | 否 | 主业工作 / 个人生活 / 创作成长 |
| period | 目标周期 | select | 否 | 年度 / 季度 / 月度 |
| year | 年份 | number | 是 | min=2000; max=2100 |
| period_index | 季度 1–4 / 月份 1–12（年度填 1） | number | 否 | min=1; max=12 |
| unit | 单位（个 / 万元 / 元 / 次 / 小时…） | text | 是 |  |
| target | 目标值 | number | 是 | min=0.0001 |
| actual | 已达成值（手动指标） | number | 否 | min=0 |
| source | 达成值来源 | select | 否 | 手动填写 / 完成待办数 / 发布内容数 / 收入合计 / 运动分钟数 / 学习分钟数 |
| notes | 指标口径 / 备注 | textarea | 否 |  |

## customers.csv · 客户资产

表头：

```text
id,user_id,name,tier,industry,contact,contact_role,phone,anniversary,hobby,next_action,notes,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| name | 客户名称 | text | 是 |  |
| tier | 分级 | select | 否 | S / A / B / C |
| industry | 行业 | text | 否 |  |
| contact | 关键联系人 | text | 否 |  |
| contact_role | 联系人职务 | text | 否 |  |
| phone | 电话（仅本地保存） | text | 否 |  |
| anniversary | 纪念日 | date | 否 |  |
| hobby | 个人偏好（敏感字段） | text | 否 |  |
| next_action | 下一行动 | text | 否 |  |
| notes | 备注 | textarea | 否 |  |

## projects.csv · 销售项目

表头：

```text
id,user_id,name,customer_id,kind,stage,source,amount,probability,deadline,next_action,payment_due,payment_received,notes,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| name | 项目 / 线索名称 | text | 是 |  |
| customer_id | 关联客户 | relation | 否 | → customers |
| kind | 类型 | select | 否 | 线索 / 商机 / 交付 |
| stage | 阶段 | select | 否 | 待甄别 / 需求确认 / 方案共创 / 决策确认 / 商务合同 / 合同交付 / 已结项 / 已失单 |
| source | 线索来源 | text | 否 |  |
| amount | 项目金额（万元） | number | 否 | min=0 |
| probability | 赢单概率（%） | number | 否 | min=0; max=100 |
| deadline | 关键节点日期 | date | 否 |  |
| next_action | 下一行动 | text | 否 |  |
| payment_due | 到期应收（万元） | number | 否 | min=0 |
| payment_received | 已收款（万元） | number | 否 | min=0 |
| notes | 风险 / 交付备注 | textarea | 否 |  |

## activities.csv · 拜访与营销

表头：

```text
id,user_id,title,kind,customer_id,project_id,date,objective,outcome,next_action,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| title | 活动名称 | text | 是 |  |
| kind | 活动类型 | select | 否 | 客户拜访 / 高层对接 / 营销活动 / 复盘记录 |
| customer_id | 关联客户 | relation | 否 | → customers |
| project_id | 关联项目 | relation | 否 | → projects |
| date | 日期 | date | 是 |  |
| objective | 本次目标 | textarea | 否 |  |
| outcome | 事实 / 结果 | textarea | 否 |  |
| next_action | 下次行动 | text | 否 |  |

## finance.csv · 财务管理

表头：

```text
id,user_id,title,kind,category,amount,date,account,notes,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| title | 收支事项 | text | 是 |  |
| kind | 类型 | select | 否 | 收入 / 支出 / 期初余额 |
| category | 分类 | text | 否 |  |
| amount | 金额（元） | number | 是 | min=0 |
| date | 日期 | date | 是 |  |
| account | 账户 | text | 否 |  |
| notes | 备注 | textarea | 否 |  |

## health.csv · 健康管理

表头：

```text
id,user_id,date,steps,sleep,weight,exercise,water,notes,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| date | 记录日期 | date | 是 |  |
| steps | 步数 | number | 否 | min=0 |
| sleep | 睡眠时长（小时） | number | 否 | min=0; max=24 |
| weight | 体重（kg，可留空） | number | 否 | min=0 |
| exercise | 运动时长（分钟） | number | 否 | min=0 |
| water | 饮水（ml） | number | 否 | min=0 |
| notes | 状态 / 备注 | textarea | 否 |  |

## learning.csv · 学习管理

表头：

```text
id,user_id,title,category,planned,completed,date,deadline,status,notes,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| title | 课程 / 学习计划 | text | 是 |  |
| category | 领域 | text | 否 |  |
| planned | 计划时长（分钟） | number | 否 | min=0 |
| completed | 已学时长（分钟） | number | 否 | min=0 |
| date | 学习日期 | date | 否 |  |
| deadline | 计划完成日期 | date | 否 |  |
| status | 状态 | select | 否 | 进行中 / 未开始 / 已完成 |
| notes | 笔记 / 应用计划 | textarea | 否 |  |

## family.csv · 家庭生活

表头：

```text
id,user_id,title,date,repeat,status,notes,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| title | 家庭事项 | text | 是 |  |
| date | 日期 | date | 是 |  |
| repeat | 重复方式 | select | 否 | 不重复 / 每年 / 每月 |
| status | 状态 | select | 否 | 待办 / 已完成 |
| notes | 备注 | textarea | 否 |  |

## content.csv · 自媒体运营

表头：

```text
id,user_id,title,platform,format,stage,publish_date,views,likes,revenue,notes,note_id,updated_at
```

| 字段 | 标签 | 类型 | 必填 | 规则 |
| --- | --- | --- | --- | --- |
| title | 选题 / 内容名称 | text | 是 |  |
| platform | 平台 | select | 否 | 公众号 / 视频号 / 小红书 / 抖音 / B站 / 其他 |
| format | 形式 | select | 否 | 图文 / 短视频 / 长视频 / 直播 |
| stage | 制作状态 | select | 否 | 选题池 / 撰稿中 / 制作中 / 待发布 / 已发布 / 已复盘 |
| publish_date | 计划 / 实际发布日期 | date | 否 |  |
| views | 阅读 / 播放（次） | number | 否 | min=0 |
| likes | 点赞（个） | number | 否 | min=0 |
| revenue | 内容收入（元） | number | 否 | min=0 |
| notes | 受众价值 / 脚本 / 复盘 | textarea | 否 |  |
| note_id | 来源灵感手记 | relation | 否 | → notes |
