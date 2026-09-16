(function (root) {
  'use strict';
  const FIELDS = { listingId: 'Listing ID', keyword: 'Keyword', proxy: 'Proxy List' };
  const clone = value => JSON.parse(JSON.stringify(value));
  let nextId = 0;
  const escapeXml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

  function xmlDocument(xml) {
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('This file contains unreadable task settings.');
    return doc;
  }

  function readFields(xml) {
    const fields = {};
    const doc = xmlDocument(xml);
    for (const model of doc.querySelectorAll('Model')) {
      const children = Array.from(model.children);
      const get = name => children.find(node => node.tagName === name);
      if (get('Visible')?.textContent.trim() !== '1') continue;
      const name = get('Name')?.textContent;
      if (Object.values(FIELDS).includes(name) && !(name in fields)) {
        fields[name] = get('Value')?.textContent || '';
      }
    }
    return fields;
  }

  function replaceField(xml, name, value) {
    let changed = false;
    const result = xml.replace(/<Model\b[^>]*>[\s\S]*?<\/Model>/g, block => {
      if (changed) return block;
      const doc = xmlDocument(block);
      const children = Array.from(doc.documentElement.children);
      const get = key => children.find(node => node.tagName === key);
      if (get('Name')?.textContent !== name || get('Visible')?.textContent.trim() !== '1') return block;
      changed = true;
      const encoded = escapeXml(value);
      if (/<Value\b[^>]*\/>/.test(block)) return block.replace(/<Value\b[^>]*\/>/, () => `<Value>${encoded}</Value>`);
      if (/<Value\b[^>]*>/.test(block)) return block.replace(/(<Value\b[^>]*>)[\s\S]*?(<\/Value>)/, (_, start, end) => start + encoded + end);
      return block.replace('</Model>', () => `<Value>${encoded}</Value></Model>`);
    });
    if (!changed) throw new Error(`This task has no editable ${name.toLowerCase()} field.`);
    xmlDocument(result);
    return result;
  }

  function makeTask(raw, index = 0) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw) || typeof raw.settings !== 'string' || !raw.settings.trim() || !raw.schedule || typeof raw.schedule !== 'object' || Array.isArray(raw.schedule)) {
      throw new Error(`Task ${index + 1} is missing its settings or schedule.`);
    }
    const fields = readFields(raw.settings);
    return {
      id: ++nextId, raw: clone(raw), name: typeof raw.name === 'string' ? raw.name : '',
      listingId: fields[FIELDS.listingId] ?? '', keyword: fields[FIELDS.keyword] ?? '', proxy: fields[FIELDS.proxy] ?? '',
      available: Object.keys(FIELDS).filter(key => FIELDS[key] in fields),
      originalFields: fields, schedule: clone(raw.schedule), archived: raw.archived === true, isNew: false,
    };
  }

  function parseFile(text) {
    let data;
    try { data = JSON.parse(text.replace(/^\uFEFF/, '')); }
    catch (_) { throw new Error('This file could not be read. Choose a scheduler JSON file.'); }
    if (!Array.isArray(data) || !data.length) throw new Error('This file has no tasks. Choose a scheduler export with at least one task.');
    return data.map(makeTask);
  }

  function newTask(template) {
    const task = makeTask(template.raw);
    task.name = '';
    task.listingId = '';
    task.keyword = '';
    task.proxy = template.proxy;
    task.schedule = clone(template.schedule);
    task.archived = false;
    task.isNew = true;
    return task;
  }

  function duplicateTask(source) {
    const task = clone(source);
    task.id = ++nextId;
    task.name = source.name ? `${source.name} copy` : '';
    task.isNew = true;
    return task;
  }

  function validateTask(task) {
    const errors = {};
    for (const key of ['listingId', 'keyword']) {
      const changed = task.isNew || task[key] !== (task.originalFields[FIELDS[key]] ?? '');
      if (!changed) continue;
      if (!task.available.includes(key)) errors[key] = `This task is missing its ${key === 'listingId' ? 'listing ID' : 'keyword'} setting.`;
      else if (!task[key].trim()) errors[key] = key === 'listingId' ? 'Add a listing ID.' : 'Add a keyword.';
      else if (key === 'listingId' && !/^\d+$/.test(task[key].trim())) errors[key] = 'Use the listing number only.';
    }
    return errors;
  }

  function exportTask(task) {
    const out = clone(task.raw);
    if (task.name !== (typeof task.raw.name === 'string' ? task.raw.name : '') || task.isNew) {
      out.name = task.name || (task.isNew ? `${task.listingId} · ${task.keyword}` : '');
    }
    if (task.archived !== (task.raw.archived === true) || task.isNew) out.archived = task.archived;
    if (JSON.stringify(task.schedule) !== JSON.stringify(task.raw.schedule)) out.schedule = clone(task.schedule);
    for (const [key, name] of Object.entries(FIELDS)) {
      if (task.available.includes(key) && task[key] !== task.originalFields[name]) out.settings = replaceField(out.settings, name, task[key]);
    }
    return out;
  }

  const isTime = value => value && Number.isInteger(value.hour) && value.hour >= 0 && value.hour <= 23 && Number.isInteger(value.minute) && value.minute >= 0 && value.minute <= 59;
  const timeText = time => `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`;
  function dailyEditable(schedule) {
    return schedule.type === 'day' && Array.isArray(schedule.sections_day) && schedule.sections_day.length > 0 && schedule.sections_day.every(section =>
      isTime(section.start) && isTime(section.end) && section.start.hour === section.end.hour && section.start.minute === section.end.minute && (section.probability === undefined || section.probability === 100));
  }
  function scheduleLabel(schedule) {
    if (dailyEditable(schedule)) {
      const times = schedule.sections_day.map(slot => timeText(slot.start));
      return times.length > 2 ? `${times[0]} +${times.length - 1}` : times.join(', ');
    }
    return ({ day: 'Daily schedule', week: 'Weekly schedule', month: 'Monthly schedule', hour: 'Hourly schedule', interval: 'Repeat schedule', at: 'One-time schedule', now: 'Run once', list: 'Selected dates', event: 'Sequence' })[schedule.type] || 'Custom schedule';
  }
  function durationLabel(schedule) {
    const seconds = schedule.max_running_time;
    if (!Number.isFinite(seconds) || seconds < 0) return '';
    const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = seconds % 60;
    return [h ? `${h}h` : '', m ? `${m}m` : '', s ? `${s}s` : ''].filter(Boolean).join(' ') || '0m';
  }
  function patchDaily(schedule, times) {
    if (!dailyEditable(schedule)) throw new Error('This schedule is kept as imported.');
    const out = clone(schedule);
    out.sections_day = times.map((text, index) => {
      if (!/^\d{2}:\d{2}$/.test(text)) throw new Error('Choose a valid start time.');
      const [hour, minute] = text.split(':').map(Number);
      if (!isTime({ hour, minute })) throw new Error('Choose a valid start time.');
      const section = clone(schedule.sections_day[index] || { start: {}, end: {}, probability: 100 });
      section.start = { ...section.start, hour, minute };
      section.end = { ...section.end, hour, minute };
      return section;
    });
    return out;
  }
  root.ErankerCore = { FIELDS, clone, readFields, replaceField, makeTask, parseFile, newTask, duplicateTask, validateTask, exportTask, dailyEditable, scheduleLabel, durationLabel, patchDaily, timeText };
})(typeof window !== 'undefined' ? window : globalThis);
