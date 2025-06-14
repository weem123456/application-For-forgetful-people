// Helper Functions
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function setUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}
function getCurrentUser() {
  return localStorage.getItem('currentUser');
}
function setCurrentUser(user) {
  if (user) localStorage.setItem('currentUser', user);
  else localStorage.removeItem('currentUser');
}

// REGISTER
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;
    const users = getUsers();

    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      document.getElementById('regMessage').textContent = 'ชื่อผู้ใช้ควรเป็น a-z, A-Z, 0-9, _ (3-20 ตัว)';
      return;
    }
    if (users.find(u => u.username === username)) {
      document.getElementById('regMessage').textContent = 'ชื่อผู้ใช้นี้มีอยู่แล้ว';
      return;
    }
    if (password.length < 4) {
      document.getElementById('regMessage').textContent = 'รหัสผ่านควรยาวอย่างน้อย 4 ตัวอักษร';
      return;
    }

    users.push({ username, password, reminders: [] });
    setUsers(users);
    document.getElementById('regMessage').style.color = '#0a7e39';
    document.getElementById('regMessage').textContent = 'สมัครสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...';
    setTimeout(() => window.location = 'login.html', 1200);
  }
}

// LOGIN
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      document.getElementById('loginMessage').style.color = '#ff5353';
      document.getElementById('loginMessage').textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
      return;
    }

    // เล่นเสียงกระดิ่ง
    const bell = document.getElementById('loginBellSound');
    if (bell) bell.play();

    setCurrentUser(username);
    setTimeout(() => { window.location = 'index.html'; }, 700); // รอเสียงกระดิ่ง
  }
}

// LOGOUT
if (document.getElementById('logoutBtn')) {
  document.getElementById('logoutBtn').onclick = function() {
    setCurrentUser(null);
    window.location = 'login.html';
  }
}

// REMINDER APP
if (document.getElementById('reminderForm')) {
  // Auth check
  if (!getCurrentUser()) {
    window.location = 'login.html';
  }

  function getReminders() {
    const users = getUsers();
    const user = users.find(u => u.username === getCurrentUser());
    return user ? user.reminders || [] : [];
  }
  function setReminders(reminders) {
    const users = getUsers();
    const idx = users.findIndex(u => u.username === getCurrentUser());
    if (idx !== -1) {
      users[idx].reminders = reminders;
      setUsers(users);
    }
  }
  function renderReminders() {
    const list = document.getElementById('reminderList');
    list.innerHTML = '';
    const reminders = getReminders();
    if (reminders.length === 0) {
      list.innerHTML = `<li style="justify-content:center;opacity:0.7;">ยังไม่มีรายการเตือน</li>`;
    } else {
      reminders.forEach((r, i) => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>
            ${escapeHTML(r.text)}
            <small><i class="fa-regular fa-clock"></i> ${new Date(r.time).toLocaleString()}</small>
          </span>
          <button onclick="deleteReminder(${i})"><i class="fa-solid fa-trash"></i> ลบ</button>
        `;
        list.appendChild(li);
      });
    }
  }
  window.deleteReminder = function(idx) {
    const reminders = getReminders();
    reminders.splice(idx, 1);
    setReminders(reminders);
    renderReminders();
  }

  document.getElementById('reminderForm').onsubmit = function(e) {
    e.preventDefault();
    const text = document.getElementById('reminderText').value;
    const time = document.getElementById('reminderTime').value;
    if (!text || !time) return;
    const reminders = getReminders();
    reminders.push({ text, time });
    setReminders(reminders);
    renderReminders();
    document.getElementById('reminderForm').reset();
  }

  // Notification
  function showNotification(msg) {
    const notif = document.getElementById('notification');
    notif.textContent = msg;
    notif.style.display = 'block';
    setTimeout(() => notif.style.display = 'none', 4000);
  }

  // Escape HTML
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(m) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m];
    });
  }

  // Check reminders every second
  setInterval(() => {
    const now = new Date();
    const reminders = getReminders();
    reminders.forEach((r, i) => {
      if (!r.notified && new Date(r.time) <= now) {
        showNotification("🔔 " + r.text);
        r.notified = true;
      }
    });
    setReminders(reminders);
  }, 1000);

  // Initial render
  renderReminders();
}