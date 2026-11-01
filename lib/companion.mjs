/*!
 * Copyright (c) 2026 风禾永进 (https://yongjin.tech)
 * SPDX-License-Identifier: MIT
 */
// Offline assistance is deliberately deterministic. No network or model calls occur here.
export function periodStart(period, today) {
  if (period === '月报') return `${today.slice(0,7)}-01`;
  if (period === '周报') { const date = new Date(`${today}T12:00:00Z`); date.setUTCDate(date.getUTCDate()-6); return date.toISOString().slice(0,10); }
  return today;
}
export function localCoachReply(prompt, facts, energy = '专注') {
  const input = String(prompt).trim();
  const urgent = facts.pending.filter(t=>t.priority===0);
  const ideaIntent = /灵感|选题|展开|创作/.test(input);
  if (!ideaIntent && /复盘|总结|完成|晚间/.test(input)) return `## 看见今天的进展\n\n今天已经完成 **${facts.completedToday} 项行动**，还有 ${facts.pending.length} 项待办。${urgent.length ? `其中 ${urgent.length} 项重要且紧急，值得先确认下一步。` : '当前没有重要且紧急的行动。'}\n\n## 给自己三个好问题\n\n1. 今天哪件事真正推动了结果？\n2. 哪个阻碍需要帮助，而不是继续硬扛？\n3. 明天只做一件重要的事，你会选什么？\n\n> 点击“保存为手记”可以继续补上自己的答案。本地教练只依据记录，不判断你的心情或表现。`;
  if (!ideaIntent && /拜访|客户|提问|销售/.test(input)) {
    const visit = facts.pending.find(t=>/拜访|客户|决策/.test(t.title));
    return `## 先明确这次见面的价值\n\n${visit ? `你有一项相关行动：**${visit.title}**。` : '先在主业工作中确定要拜访的客户与本次目标。'}\n\n## 一份可直接带走的提问清单\n\n1. 这件事目前造成什么业务影响？\n2. 成功以后，你希望哪个指标发生变化？\n3. 谁还需要参与判断与决策？\n4. 不改变现状，最担心的风险是什么？\n5. 会后双方各自承诺的下一步是什么？\n\n## 完成标准\n\n会后记录事实、未确认的问题、负责人和下一次日期。不要把“客户表示有兴趣”当作已经立项的证据。`;
  }
  if (/灵感|选题|展开|创作/.test(input)) {
    const seed = facts.note || input.replace(/^(展开|灵感|选题)[：:：\s]*/, '');
    return `## 把想法变成一个小作品\n\n**原始种子**：${seed.slice(0,500) || '先写下一句话，描述你想分享的观察。'}\n\n## 用四步把它讲清楚\n\n1. 读者是谁？他正遇到什么具体困扰？\n2. 选一个你亲身经历、能核实的场景。\n3. 只保留一个核心观点，不追求面面俱到。\n4. 给出一个读者今天就能尝试的小动作。\n\n## 现在就能做的事\n\n花 10 分钟写出“问题—场景—观察—行动”四行提纲。点击“转内容选题”，把它送入选题池。\n\n> 这是离线结构化展开模板，不是大模型自动创作。`;
  }
  if (/今日|安排|优先|下一步|疲惫|专注/.test(input)) {
    const selected = [...facts.pending].sort((a,b)=>a.priority-b.priority || (a.due||'9999').localeCompare(b.due||'9999')).slice(0,energy==='疲惫'?1:3);
    return `## ${energy==='疲惫'?'今天，先做好一小步':'把注意力放在最值得的行动上'}\n\n${selected.length ? selected.map((t,i)=>`${i+1}. **${t.title}** — ${t.priority===0?'重要且紧急，优先确认推进条件':'重要事项，先预留一段不被打断的时间'}${t.due?`；截止 ${t.due}`:''}。`).join('\n') : '今天没有未完成事项，可以记录一个想法，或者留出真正的休息时间。'}\n\n## 一个轻量的开始\n\n${energy==='疲惫'?'把第一步缩小到 10 分钟。完成一个明确的小动作，比责备自己更有帮助。':'先明确第一项的完成标准，再安排 25 分钟专注时间。不要同时启动所有事情。'}\n\n> 排序来自重要性、紧急性与日期规则；建议由本地教练生成，没有调用外部模型。`;
  }
  return `## 我能陪你处理这些具体问题\n\n你刚才写下：“${input.slice(0,300)}”。\n\n目前是**离线规则教练**，还不能像大模型一样理解和回答所有自由问题。可以试试：\n\n- 帮我安排今日优先级。\n- 帮我准备一次客户拜访。\n- 展开一个灵感，形成内容提纲。\n- 帮我做晚间复盘。\n\n也可以先把这段问题保存成灵感手记，等接入模型后继续展开。`;
}
