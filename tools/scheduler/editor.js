(() => {
  'use strict';
  const C = window.ErankerCore;
  const $ = id => document.getElementById(id);
  const state = { tasks: [], template: null, selected: new Set(), history: [], filename: '', baseline: '', loaded: false };
  let noticeTimer, activeMenu, modalTask, modalTargets = [], scheduleStart;
  function el(tag, className, text) { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; }
  function signature() { return JSON.stringify(state.tasks.map(t => [t.id, t.name, t.listingId, t.keyword, t.proxy, t.schedule, t.archived])); }
  function isDirty() { return state.loaded && signature() !== state.baseline; }
  function checkpoint() {
    state.history.push({ tasks: state.tasks.map(t => ({ ...t, schedule: C.clone(t.schedule) })), selected: [...state.selected] });
    if (state.history.length > 40) state.history.shift();
  }
  function notify(message, error = false) { const node = $('notification'); clearTimeout(noticeTimer); node.textContent = message; node.className = 'notification' + (error ? ' error' : ''); node.hidden = false; noticeTimer = setTimeout(() => node.hidden = true, error ? 7000 : 3500); }
  function meta() {
    $('taskCount').textContent = state.tasks.length;
    $('dirtyDot').hidden = !isDirty();
    $('undoButton').hidden = !state.history.length;
    $('noTasks').hidden = state.tasks.length > 0;
    $('downloadButton').disabled = !state.tasks.length;
    const count = state.selected.size;
    $('selectionBar').hidden = count === 0;
    $('selectedCount').textContent = `${count} selected`;
    $('bulkStatusButton').textContent = state.tasks.some(task => state.selected.has(task.id) && !task.archived) ? 'Archive' : 'Activate';
    $('selectAll').checked = state.tasks.length > 0 && count === state.tasks.length;
    $('selectAll').indeterminate = count > 0 && count < state.tasks.length;
  }
  function undo() {
    const previous = state.history.pop(); if (!previous) return;
    state.tasks = previous.tasks; state.selected = new Set(previous.selected);
    render(); notify('Undone');
  }
  function field(task, key, placeholder, extra = '') {
    const input = el('input', `task-input ${extra}`); input.type = 'text'; input.value = task[key]; input.placeholder = placeholder;
    input.setAttribute('aria-label', `${key === 'listingId' ? 'Listing ID' : key === 'name' ? 'Task name' : 'Keyword'} for task ${state.tasks.indexOf(task) + 1}`);
    input.dataset.field = key; input.spellcheck = key === 'keyword';
    if (key === 'listingId') input.inputMode = 'numeric';
    if (key !== 'name' && !task.available.includes(key)) { input.disabled = true; input.placeholder = 'Not in this file'; }
    let committed = false;
    input.addEventListener('focus', () => committed = false);
    input.addEventListener('input', () => {
      if (!committed) { checkpoint(); committed = true; }
      task[key] = input.value;
      input.classList.remove('invalid'); input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby');
      input.parentElement.querySelector(`[data-error-for="${key}"]`)?.remove();
      meta();
    });
    return input;
  }
  function render() {
    closeMenu();
    const body = $('taskRows'); body.replaceChildren();
    state.tasks.forEach(task => {
      const tr = el('tr'); tr.dataset.id = task.id; if (state.selected.has(task.id)) tr.classList.add('selected'); if (task.archived) tr.classList.add('archived');
      const cells = Array.from({ length: 8 }, () => el('td')); cells.forEach(cell => tr.append(cell));
      const checkbox = el('input'); checkbox.type = 'checkbox'; checkbox.checked = state.selected.has(task.id); checkbox.setAttribute('aria-label', `Select ${task.name || 'task ' + (state.tasks.indexOf(task) + 1)}`);
      checkbox.addEventListener('change', () => { checkbox.checked ? state.selected.add(task.id) : state.selected.delete(task.id); tr.classList.toggle('selected', checkbox.checked); meta(); }); cells[0].append(checkbox);
      cells[1].append(field(task, 'name', 'Task name'));
      cells[2].append(field(task, 'listingId', 'Listing ID', 'listing'));
      cells[3].append(field(task, 'keyword', 'Keyword'));
      const proxy = el('button', 'proxy-button', task.proxy.trim() ? '••••••••  Edit' : 'Add proxy'); proxy.type = 'button'; proxy.setAttribute('aria-label', `Edit proxy for ${task.name || 'task ' + (state.tasks.indexOf(task) + 1)}`); proxy.disabled = !task.available.includes('proxy'); proxy.addEventListener('click', () => openProxy(task.id)); cells[4].append(proxy);
      const schedule = el('button', 'schedule-button'); schedule.type = 'button'; schedule.setAttribute('aria-label', `Edit schedule for ${task.name || 'task ' + (state.tasks.indexOf(task) + 1)}`);
      schedule.append(el('span', '', C.scheduleLabel(task.schedule)));
      const duration = C.durationLabel(task.schedule); if (duration) schedule.append(el('small', '', `${duration} max`));
      schedule.addEventListener('click', () => openSchedule([task.id])); cells[5].append(schedule);
      const status = el('select', 'status-select' + (task.archived ? ' archived' : '')); status.setAttribute('aria-label', `Status for ${task.name || 'task ' + (state.tasks.indexOf(task) + 1)}`);
      for (const [value, label] of [['active', 'Active'], ['archived', 'Archived']]) { const option = el('option', '', label); option.value = value; status.append(option); }
      status.value = task.archived ? 'archived' : 'active'; status.addEventListener('change', () => { checkpoint(); task.archived = status.value === 'archived'; status.classList.toggle('archived', task.archived); tr.classList.toggle('archived', task.archived); meta(); }); cells[6].append(status);
      const more = el('button', 'icon-button', '⋯'); more.type = 'button'; more.setAttribute('aria-label', `More actions for ${task.name || 'task ' + (state.tasks.indexOf(task) + 1)}`); more.setAttribute('aria-haspopup', 'menu'); more.addEventListener('click', event => { event.stopPropagation(); openMenu(task.id, more); }); cells[7].append(more);
      body.append(tr);
    });
    meta();
  }
  function closeMenu() { if (activeMenu) { activeMenu.anchor.setAttribute('aria-expanded', 'false'); activeMenu.node.remove(); activeMenu = null; } }
  function openMenu(id, anchor) {
    if (activeMenu?.anchor === anchor) { closeMenu(); return; }
    closeMenu(); const menu = el('div', 'row-menu'); menu.setAttribute('role', 'menu');
    const duplicate = el('button', '', 'Duplicate'); duplicate.setAttribute('role', 'menuitem'); duplicate.addEventListener('click', () => {
      const index = state.tasks.findIndex(t => t.id === id); checkpoint(); const task = C.duplicateTask(state.tasks[index]); state.tasks.splice(index + 1, 0, task); render(); focusTask(task.id);
    });
    const remove = el('button', '', 'Delete'); remove.setAttribute('role', 'menuitem'); remove.addEventListener('click', () => { checkpoint(); state.tasks = state.tasks.filter(t => t.id !== id); state.selected.delete(id); render(); notify('Task deleted. Undo to restore.'); });
    menu.append(duplicate, remove); document.body.append(menu); const box = anchor.getBoundingClientRect(); menu.style.left = Math.max(10, Math.min(box.right - 145, innerWidth - 160)) + 'px'; menu.style.top = Math.min(box.bottom + 5, innerHeight - menu.offsetHeight - 10) + 'px';
    anchor.setAttribute('aria-expanded', 'true'); activeMenu = { node: menu, anchor }; duplicate.focus();
    menu.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.stopPropagation(); anchor.focus(); closeMenu(); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); (document.activeElement === duplicate ? remove : duplicate).focus(); }
    });
  }
  function focusTask(id) { const row = document.querySelector(`tr[data-id="${id}"]`); row?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); row?.querySelector('[data-field="listingId"]')?.focus({ preventScroll: true }); }
  function addTask() {
    const selected = state.tasks.find(t => state.selected.has(t.id));
    const source = selected || state.tasks.at(-1) || state.template;
    if (!source) return;
    checkpoint(); const task = C.newTask(source); state.tasks.push(task); render(); focusTask(task.id);
  }
  function openProxy(id) { modalTask = id; const task = state.tasks.find(t => t.id === id); $('proxyInput').value = task.proxy; $('proxyDialog').showModal(); }
  $('proxyForm').addEventListener('submit', event => { event.preventDefault(); const task = state.tasks.find(t => t.id === modalTask); const value = $('proxyInput').value; if (value !== task.proxy) { checkpoint(); task.proxy = value; render(); } $('proxyDialog').close(); });

  function addTime(value = '12:00') {
    const list = $('timeList'); const row = el('div', 'form-row'); const input = el('input', 'form-input'); input.type = 'time'; input.required = true; input.value = value; input.setAttribute('aria-label', 'Daily start time');
    const remove = el('button', 'icon-button remove-time', '×'); remove.type = 'button'; remove.setAttribute('aria-label', 'Remove start time'); remove.addEventListener('click', () => { row.remove(); updateTimeButtons(); }); row.append(input, remove); list.append(row); updateTimeButtons();
  }
  function updateTimeButtons() { const rows = $('timeList').children; Array.from(rows).forEach(row => row.querySelector('button').disabled = rows.length === 1); }
  function openSchedule(ids) {
    modalTargets = ids; const tasks = ids.map(id => state.tasks.find(t => t.id === id)); const task = tasks[0]; if (!task) return;
    scheduleStart = C.clone(task.schedule); const body = $('scheduleBody'); body.replaceChildren(); $('scheduleError').hidden = true;
    $('scheduleTitle').textContent = ids.length > 1 ? `Schedule · ${ids.length} tasks` : 'Schedule';
    if (tasks.every(t => C.dailyEditable(t.schedule))) {
      const group = el('div', 'form-group'); group.append(el('div', 'form-label', 'Every day at')); const list = el('div'); list.id = 'timeList'; group.append(list); body.append(group);
      task.schedule.sections_day.forEach(slot => addTime(C.timeText(slot.start)));
      const add = el('button', 'text-button', '+ Add time'); add.type = 'button'; add.addEventListener('click', () => { addTime(); list.lastElementChild.querySelector('input').focus(); }); group.append(add);
    } else { body.append(el('p', 'form-group form-note', 'Custom schedule · kept as imported.')); }
    const seconds = task.schedule.max_running_time;
    if (Number.isInteger(seconds) && seconds >= 0) {
      const group = el('div', 'form-group'); group.append(el('div', 'form-label', 'Max run time')); const controls = el('div', 'duration-fields');
      for (const [id, value, unit, max] of [['runHours', Math.floor(seconds / 3600), 'h', 99999], ['runMinutes', Math.floor(seconds % 3600 / 60), 'm', 59], ...(seconds % 60 ? [['runSeconds', seconds % 60, 's', 59]] : [])]) {
        const input = el('input', 'form-input'); input.id = id; input.type = 'number'; input.min = '0'; input.max = String(max); input.step = '1'; input.required = true; input.value = value; input.setAttribute('aria-label', `Maximum runtime in ${unit === 'h' ? 'hours' : unit === 'm' ? 'minutes' : 'seconds'}`); controls.append(input, el('span', '', unit));
      }
      group.append(controls); body.append(group);
    }
    $('scheduleDialog').showModal();
  }
  $('scheduleForm').addEventListener('submit', event => {
    event.preventDefault();
    try {
      const times = $('timeList') ? Array.from($('timeList').querySelectorAll('input')).map(input => input.value) : null;
      const total = $('runHours') ? Number($('runHours').value) * 3600 + Number($('runMinutes').value) * 60 + Number($('runSeconds')?.value || 0) : null;
      const updates = new Map();
      for (const id of modalTargets) {
        const task = state.tasks.find(t => t.id === id); let schedule = C.clone(task.schedule);
        if (times) schedule = C.patchDaily(schedule, times);
        if (total !== null && (modalTargets.length > 1 || total !== scheduleStart.max_running_time)) schedule.max_running_time = total;
        updates.set(id, schedule);
      }
      if (state.tasks.some(task => updates.has(task.id) && JSON.stringify(updates.get(task.id)) !== JSON.stringify(task.schedule))) {
        checkpoint(); state.tasks.forEach(task => { if (updates.has(task.id)) task.schedule = updates.get(task.id); }); render();
      }
      $('scheduleDialog').close();
    } catch (error) { $('scheduleError').textContent = error.message; $('scheduleError').hidden = false; }
  });
  document.querySelectorAll('.close-dialog').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); }));
  async function allowReplace() {
    if (!isDirty()) return true;
    const dialog = $('confirmDialog'); dialog.returnValue = 'cancel'; dialog.showModal();
    return new Promise(resolve => dialog.addEventListener('close', () => resolve(dialog.returnValue === 'discard'), { once: true }));
  }
  let loading = false;
  async function loadFile(file) {
    if (!file || loading) return;
    if (!/\.json$/i.test(file.name)) { notify('Choose a scheduler JSON file.', true); return; }
    loading = true;
    try {
      const tasks = C.parseFile(await file.text());
      if (!await allowReplace()) return;
      state.tasks = tasks; state.template = tasks[0]; state.selected.clear(); state.history = []; state.filename = file.name; state.loaded = true; state.baseline = signature();
      $('filename').textContent = file.name; $('filename').title = file.name; $('emptyState').hidden = true; $('workspace').hidden = false; $('fileActions').hidden = false; render();
    } catch (error) { notify(error.message, true); }
    finally { loading = false; $('fileInput').value = ''; }
  }
  function download() {
    const issues = state.tasks.map(task => ({ task, errors: C.validateTask(task) })).filter(item => Object.keys(item.errors).length);
    if (issues.length) {
      render();
      for (const { task, errors } of issues) for (const [fieldName, message] of Object.entries(errors)) {
        const input = document.querySelector(`tr[data-id="${task.id}"] [data-field="${fieldName}"]`); if (!input) continue;
        input.classList.add('invalid'); input.setAttribute('aria-invalid', 'true'); const error = el('p', 'field-error', message); error.id = `error-${task.id}-${fieldName}`; error.dataset.errorFor = fieldName; input.setAttribute('aria-describedby', error.id); input.parentElement.append(error);
      }
      document.querySelector('.invalid')?.focus(); notify('Complete the highlighted fields first.', true); return;
    }
    try {
      const data = state.tasks.map(C.exportTask); const blob = new Blob(['\uFEFF' + JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
      const link = document.createElement('a'); const url = URL.createObjectURL(blob); link.href = url; link.download = state.filename.replace(/\.json$/i, '').replace(/-edited$/, '') + '-edited.json'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
      state.baseline = signature(); meta(); notify('Downloaded');
    } catch (error) { notify(error.message, true); }
  }
  $('chooseButton').addEventListener('click', () => $('fileInput').click());
  $('openButton').addEventListener('click', () => $('fileInput').click());
  $('fileInput').addEventListener('change', event => loadFile(event.target.files[0]));
  $('addButton').addEventListener('click', addTask); $('undoButton').addEventListener('click', undo); $('downloadButton').addEventListener('click', download);
  $('selectAll').addEventListener('change', event => { state.selected = new Set(event.target.checked ? state.tasks.map(t => t.id) : []); render(); });
  $('clearSelection').addEventListener('click', () => { state.selected.clear(); render(); });
  $('bulkScheduleButton').addEventListener('click', () => openSchedule([...state.selected]));
  $('bulkStatusButton').addEventListener('click', () => { checkpoint(); const tasks = state.tasks.filter(t => state.selected.has(t.id)); const archive = tasks.some(t => !t.archived); tasks.forEach(t => t.archived = archive); render(); });
  document.addEventListener('click', event => { if (activeMenu && !activeMenu.node.contains(event.target)) closeMenu(); });
  document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey && !document.querySelector('dialog[open]') && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) { event.preventDefault(); undo(); } });
  window.addEventListener('beforeunload', event => { if (isDirty()) { event.preventDefault(); event.returnValue = ''; } });
  for (const eventName of ['dragenter', 'dragover']) document.addEventListener(eventName, event => { if (event.dataTransfer?.types.includes('Files')) { event.preventDefault(); $('dropZone').classList.add('dragging'); } });
  document.addEventListener('dragleave', event => { if (!event.relatedTarget) $('dropZone').classList.remove('dragging'); });
  document.addEventListener('drop', event => { event.preventDefault(); $('dropZone').classList.remove('dragging'); loadFile(event.dataTransfer?.files[0]); });
})();
