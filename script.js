// TaskMate To-Do List - JavaScript
// Human-style code and comments

// === GLOBALS & UTILS ===
let currentPage = 'home';
let currentUser = null;
let currentListIdx = 0;
let users = JSON.parse(localStorage.getItem('neon-users') || '{}');
let lastUser = localStorage.getItem('neon-last-user');
let undoTimeout = null, lastDeleted = null;

// Save users to localStorage
function saveUsers() {
  localStorage.setItem('neon-users', JSON.stringify(users));
}

// Get user object and make sure lists exist
function getUser(name) {
  let user = users[name];
  if (!user) return null;
  if (!user.lists) user.lists = [[]];
  if (!user.listNames) user.listNames = ['My List'];
  return user;
}

// Overwrite a user's data and save
function setUser(name, data) {
  users[name] = data;
  saveUsers();
}

// === CLEAR AUTH FORMS ===
// Helper to clear all input fields in both forms
function clearAuthForms() {
  // Login form
  document.getElementById('signin-username').value = '';
  document.getElementById('signin-password').value = '';
  document.getElementById('signin-msg').textContent = '';

  // Register form
  document.getElementById('register-username').value = '';
  document.getElementById('register-password').value = '';
  document.getElementById('register-hint').value = '';
  document.getElementById('register-msg').textContent = '';
}

// === SIGN IN, SIGN OUT, NAVIGATION ===
function signIn(name) {
  currentUser = name;
  localStorage.setItem('neon-last-user', name);
  showUser();
  navTo('home');
}

function signOut() {
  currentUser = null;
  localStorage.removeItem('neon-last-user');
  showUser();
  navTo('account');
  clearAuthForms();
}

// Show/hide forms and user info based on sign-in
function showUser() {
  document.getElementById('user-name').textContent = currentUser || '...';
  if (currentUser) {
    document.getElementById('signed-in-as').style.display = '';
    document.getElementById('signed-in-user').textContent = currentUser;
    document.getElementById('sign-in-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.querySelector('.auth-divider').style.display = 'none';
  } else {
    document.getElementById('signed-in-as').style.display = 'none';
    document.getElementById('sign-in-form').style.display = '';
    document.getElementById('register-form').style.display = '';
    document.querySelector('.auth-divider').style.display = '';
    clearAuthForms(); // <-- always clear auth forms when showing account page
  }
  showFloatingAddListBtn();
}

// Only show Add List button if on home and signed in
function showFloatingAddListBtn() {
  const fab = document.getElementById('floating-add-list-btn');
  if (fab) fab.style.display = (currentUser && currentPage === 'home') ? "flex" : "none";
}

// === NAV BUTTON EVENTS ===
document.getElementById('nav-home').onclick = () => navTo('home');
document.getElementById('nav-about').onclick = () => navTo('about');
document.getElementById('nav-settings').onclick = () => navTo('settings');
document.getElementById('nav-help').onclick = () => navTo('help');
document.getElementById('nav-contact').onclick = () => navTo('contact');
document.getElementById('nav-account').onclick = () => navTo('account');

// === NAVIGATION & PAGES ===
function navTo(page) {
  currentPage = page;
  // Hide all pages, show only the one we want
  document.querySelectorAll('.page').forEach(sec => sec.style.display = 'none');
  document.getElementById('page-' + page).style.display = 'block';
  updateNav();
  if (page === 'home') renderHome();
  if (page === 'settings') updateSettings();
  if (page === 'account') clearAuthForms(); // <-- make sure fields are always cleared when going to account page
  showFloatingAddListBtn();
}

// Change nav text: "Account" or "Sign In"
function updateNav() {
  document.getElementById('nav-account').textContent = currentUser ? 'Account' : 'Sign In';
}

// === MOTIVATION QUOTE ===
const motivationalQuotes = [
  "Your future is created by what you do today, not tomorrow.",
  "Small steps every day lead to big achievements.",
  "Stay focused. Stay organized. You’ve got this!",
  "Every accomplishment starts with the decision to try.",
  "Your goals are as important as your dreams. Make them happen!",
  "Great things are done by a series of small things brought together.",
  "Don't watch the clock; do what it does. Keep going.",
  "Progress, not perfection."
];
function showMotivation(id) {
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  document.getElementById(id).textContent = quote;
}
window.addEventListener('DOMContentLoaded', () => {
  showMotivation('motivation-quote');
});

// === AUTH FORMS (LOGIN & REGISTER) ===
function setupAuthForms() {
  // Login submit
  document.getElementById('sign-in-form').onsubmit = function(e) {
    e.preventDefault();
    const uname = document.getElementById('signin-username').value.trim();
    const pwd = document.getElementById('signin-password').value.trim();
    const msgDiv = document.getElementById('signin-msg');
    msgDiv.style.color = '#ed4245';
    if (!uname || !pwd) {
      msgDiv.textContent = "Please fill in both fields!";
      return;
    }
    const user = users[uname];
    if (!user) {
      msgDiv.textContent = "No such user. Please register.";
      return;
    }
    if (pwd !== user.password) {
      msgDiv.textContent = "Wrong password!";
      return;
    }
    msgDiv.textContent = '';
    currentUser = uname;
    signIn(uname);
  };

  // Register submit
  document.getElementById('register-form').onsubmit = function(e) {
    e.preventDefault();
    const uname = document.getElementById('register-username').value.trim();
    const pwd = document.getElementById('register-password').value.trim();
    const hint = document.getElementById('register-hint').value.trim();
    const msgDiv = document.getElementById('register-msg');
    msgDiv.style.color = '#ed4245';
    if (!uname || !pwd || !hint) {
      msgDiv.textContent = "Please fill in all fields!";
      return;
    }
    if (users[uname]) {
      msgDiv.textContent = "Username already taken!";
      return;
    }
    if (uname.length < 2) {
      msgDiv.textContent = "Username must be at least 2 characters!";
      return;
    }
    if (pwd.length < 4) {
      msgDiv.textContent = "Password must be at least 4 characters!";
      return;
    }
    users[uname] = {
      password: pwd,
      hint: hint,
      lists: [[]],
      listNames: ['My List']
    };
    saveUsers();
    msgDiv.style.color = "#2ed573";
    msgDiv.textContent = "Registered! You are now signed in.";
    currentUser = uname;
    signIn(uname);
  };
}
setupAuthForms();

// === SIGN OUT BUTTON ===
document.getElementById('sign-out-btn').onclick = signOut;

// === THEME TOGGLE ===
const themeBtn = document.getElementById('toggle-theme');
const themeSettingsBtn = document.getElementById('theme-toggle-btn');
function setTheme(isLight) {
  if(isLight) {
    document.body.classList.add('light');
    themeBtn.textContent = '☀️';
    document.getElementById('current-theme').textContent = 'Light';
  } else {
    document.body.classList.remove('light');
    themeBtn.textContent = '🌙';
    document.getElementById('current-theme').textContent = 'Dark';
  }
  localStorage.setItem('neon-theme', isLight ? 'light' : 'dark');
}
themeBtn.onclick = () => setTheme(!document.body.classList.contains('light'));
if (localStorage.getItem('neon-theme') === 'light' ||
    (!localStorage.getItem('neon-theme') && window.matchMedia('(prefers-color-scheme: light)').matches)) {
  setTheme(true);
}
if(themeSettingsBtn){
  themeSettingsBtn.onclick = () => setTheme(!document.body.classList.contains('light'));
}

// === SETTINGS PAGE EVENTS ===
function updateSettings() {
  document.getElementById('current-theme').textContent = document.body.classList.contains('light') ? 'Light' : 'Dark';
  document.getElementById('set-pin-btn').style.display = currentUser ? "" : "none";
  document.getElementById('lock-btn').style.display = currentUser ? "" : "none";
  document.getElementById('forgot-pin-btn').style.display = currentUser ? "" : "none";
}
document.getElementById('clear-account-btn').onclick = function() {
  if(currentUser && confirm('Delete all lists and data for your account?')) {
    delete users[currentUser];
    saveUsers();
    signOut();
  }
};
document.getElementById('clear-all-btn').onclick = function() {
  if(confirm('Delete ALL accounts and data on this device?')) {
    users = {};
    saveUsers();
    signOut();
  }
};

// === PASSWORD/LOCK ===
document.getElementById('set-pin-btn').onclick = function() {
  if (!currentUser) { alert("Sign in to set/change password."); return; }
  let pin = prompt("Set or change your password (at least 4 characters):","");
  if (pin && pin.length >= 4) {
    let hint = prompt("Set a password hint (to help you recover it):", users[currentUser].hint || "");
    users[currentUser].password = pin;
    if (hint) users[currentUser].hint = hint;
    saveUsers();
    alert('Password set!');
  } else if (pin) {
    alert('Password must be at least 4 characters');
  }
};
document.getElementById('lock-btn').onclick = function() {
  if (!currentUser) { alert("Sign in to lock."); return; }
  document.getElementById('lock-screen').style.display = 'flex';
  document.getElementById('unlock-pin').value = '';
  document.getElementById('lock-msg').style.display = 'none';
};
document.getElementById('unlock-form').onsubmit = function(e){
  e.preventDefault();
  let user = users[currentUser];
  if (!user || !user.password) {
    alert('No password set. Please set a password in Settings.');
    return;
  }
  if (document.getElementById('unlock-pin').value === user.password) {
    document.getElementById('lock-screen').style.display = 'none';
    document.getElementById('lock-msg').style.display = 'none';
  } else {
    document.getElementById('lock-msg').style.display = 'block';
  }
};

// === FORGOT PASSWORD MODAL ===
document.getElementById('forgot-pin-btn').onclick = function() {
  if (!currentUser) return;
  document.getElementById('forgot-pin-modal').style.display = 'flex';
  document.getElementById('forgot-msg').style.display = 'none';
  document.getElementById('forgot-user').value = currentUser;
  document.getElementById('forgot-hint').value = '';
  document.getElementById('forgot-new-pin').value = '';
};
document.getElementById('forgot-cancel-btn').onclick = function() {
  document.getElementById('forgot-pin-modal').style.display = 'none';
  document.getElementById('forgot-msg').style.display = 'none';
};
document.getElementById('forgot-pin-form').onsubmit = function(e){
  e.preventDefault();
  let user = document.getElementById('forgot-user').value.trim();
  let hint = document.getElementById('forgot-hint').value.trim();
  let newPin = document.getElementById('forgot-new-pin').value.trim();
  let msgDiv = document.getElementById('forgot-msg');
  if (!users[user]) {
    msgDiv.innerText = "No such user found!";
    msgDiv.style.display = 'block';
    return;
  }
  if (hint !== users[user].hint) {
    msgDiv.innerText = "Incorrect password hint!";
    msgDiv.style.display = 'block';
    return;
  }
  if (newPin.length < 4) {
    msgDiv.innerText = "Password must be at least 4 characters!";
    msgDiv.style.display = 'block';
    return;
  }
  users[user].password = newPin;
  saveUsers();
  msgDiv.style.color = "#2ed573";
  msgDiv.innerText = "Password reset! You may now sign in.";
  msgDiv.style.display = 'block';
  setTimeout(()=> {
    document.getElementById('forgot-pin-modal').style.display = 'none';
    msgDiv.style.display = 'none';
    msgDiv.style.color = "#ed4245";
  }, 1800);
};

// === HOME/TODO LIST RENDER ===
function renderHome() {
  if (!currentUser) {
    navTo('account');
    return;
  }
  const user = getUser(currentUser);

  // List tabs
  let tabsHtml = "";
  for (let i = 0; i < user.lists.length; ++i) {
    tabsHtml += `
      <span class="todo-list-tab${i === currentListIdx ? ' active' : ''}" data-idx="${i}">
        <span class="tab-name" style="pointer-events:auto;">${user.listNames[i]}</span>
        ${user.lists.length > 1 ? `<button class="delete-list-btn" data-del-list="${i}" style="font-size:0.9em;color:#ed4245;background:none;border:none;cursor:pointer;margin-left:5px;" title="Delete this list">&times;</button>` : ""}
      </span>
    `;
  }
  document.getElementById('list-tabs').innerHTML = tabsHtml;

  // Tab switching
  document.querySelectorAll('.todo-list-tab').forEach(tab =>
    tab.onclick = function(e) {
      if (e.target.classList.contains('delete-list-btn')) return;
      currentListIdx = +tab.dataset.idx;
      renderHome();
    }
  );

  // Add List button (floating)
  const fab = document.getElementById('floating-add-list-btn');
  if (fab) fab.onclick = function () {
    addNewListPrompt();
  };

  // Delete List button
  document.querySelectorAll('.delete-list-btn').forEach(btn =>
    btn.onclick = function(e) {
      e.stopPropagation();
      const delIdx = +btn.dataset.delList;
      if (user.lists.length === 1) return;
      if (!confirm(`Delete list "${user.listNames[delIdx]}" and all its tasks?`)) return;
      user.lists.splice(delIdx, 1);
      user.listNames.splice(delIdx, 1);
      if (currentListIdx >= user.lists.length) currentListIdx = user.lists.length - 1;
      setUser(currentUser, user);
      renderHome();
    }
  );

  // Rename list (double click)
  document.querySelectorAll('.todo-list-tab .tab-name').forEach(tabNameEl => {
    tabNameEl.ondblclick = function(e) {
      e.stopPropagation();
      const tab = tabNameEl.closest('.todo-list-tab');
      const idx = +tab.dataset.idx;
      const oldName = user.listNames[idx];
      const input = document.createElement('input');
      input.value = oldName;
      input.style.width = "90px";
      input.style.fontFamily = "inherit";
      input.onblur = input.onkeydown = function(ev) {
        if (ev.type === 'blur' || (ev.type === 'keydown' && ev.key === 'Enter')) {
          const newName = input.value.trim() || oldName;
          user.listNames[idx] = newName.slice(0,20);
          setUser(currentUser, user);
          renderHome();
        }
      };
      tabNameEl.replaceWith(input);
      input.focus();
      input.select();
    };
  });

  // To-Do List & Add Task Form
  const section = document.getElementById('todo-section');
  section.innerHTML = `
    <form id="todo-form">
      <input id="todo-input" placeholder="What needs to be done?" maxlength="50" autocomplete="off">
      <input type="date" id="todo-due-input">
      <button>Add</button>
    </form>
    <ul class="todo-list-ul"></ul>
  `;

  const ul = section.querySelector('.todo-list-ul');
  const todos = user.lists[currentListIdx];
  todos.forEach((todo, idx) => {
    let li = document.createElement('li');
    li.className = 'todo-item' + (todo.completed ? ' completed' : '');
    li.innerHTML = `
      <input type="checkbox" ${todo.completed?'checked':''} data-idx="${idx}">
      <span class="todo-text" data-idx="${idx}" title="Click to edit">${todo.text}</span>
      <span class="todo-due">
        ${todo.due ? `📅 ${todo.due}` : ""}
      </span>
      <span class="todo-actions">
        <button title="Edit" data-edit="${idx}">✏️</button>
        <button title="Delete" data-del="${idx}">🗑️</button>
      </span>
    `;
    ul.appendChild(li);
  });

  // Task events
  // Add new task
  section.querySelector('#todo-form').onsubmit = function(e) {
    e.preventDefault();
    const text = section.querySelector('#todo-input').value.trim();
    const due = section.querySelector('#todo-due-input').value;
    if (!text) return;
    todos.unshift({text, due, completed: false});
    setUser(currentUser, user);
    renderHome();
  };
  // Toggle completed
  ul.querySelectorAll('input[type=checkbox]').forEach(cb =>
    cb.onchange = function() {
      todos[this.dataset.idx].completed = this.checked;
      setUser(currentUser, user);
      renderHome();
    }
  );
  // Edit task
  ul.querySelectorAll('button[data-edit]').forEach(btn =>
    btn.onclick = function() {
      const idx = this.dataset.edit;
      const span = ul.querySelector('.todo-text[data-idx="'+idx+'"]');
      const oldText = todos[idx].text;
      const input = document.createElement('input');
      input.value = oldText;
      input.className = 'todo-text';
      input.onblur = input.onkeydown = function(e) {
        if (e.type === 'blur' || (e.type === 'keydown' && e.key === 'Enter')) {
          const newText = input.value.trim();
          if (newText) todos[idx].text = newText;
          setUser(currentUser, user);
          renderHome();
        }
      };
      span.replaceWith(input);
      input.focus();
      input.select();
    }
  );
  // Delete task (with undo)
  ul.querySelectorAll('button[data-del]').forEach(btn =>
    btn.onclick = function() {
      const idx = +this.dataset.del;
      const deleted = todos.splice(idx, 1)[0];
      setUser(currentUser, user);
      renderHome();
      lastDeleted = { idx, deleted, todos, user, currentUser, currentListIdx };
      const popup = document.getElementById('undo-popup');
      popup.style.display = 'block';
      clearTimeout(undoTimeout);
      undoTimeout = setTimeout(() => { popup.style.display = 'none'; lastDeleted = null; }, 4000);
    }
  );
  // Undo delete
  document.getElementById('undo-btn').onclick = function() {
    if (lastDeleted && lastDeleted.todos) {
      lastDeleted.todos.splice(lastDeleted.idx, 0, lastDeleted.deleted);
      setUser(lastDeleted.currentUser, lastDeleted.user);
      renderHome();
      document.getElementById('undo-popup').style.display = 'none';
      lastDeleted = null;
      clearTimeout(undoTimeout);
    }
  };
  // Quick edit on task text click
  ul.querySelectorAll('.todo-text').forEach(span =>
    span.onclick = function() {
      const idx = this.dataset.idx;
      const editBtn = ul.querySelector('button[data-edit="'+idx+'"]');
      editBtn.click();
    }
  );
}

// === KEYBOARD SHORTCUTS ===
function addNewListPrompt() {
  const user = getUser(currentUser);
  let name = prompt("Enter a name for your new list (max 20 chars):");
  if (!name) return;
  name = name.trim().slice(0, 20);
  if (!name) return;
  user.listNames.push(name);
  user.lists.push([]);
  currentListIdx = user.lists.length - 1;
  setUser(currentUser, user);
  renderHome();
}

window.addEventListener('keydown', function(e) {
  if (!currentUser || currentPage !== 'home') return;
  if (
    document.getElementById('lock-screen').style.display === 'flex' ||
    document.getElementById('forgot-pin-modal').style.display === 'flex'
  ) return;
  const active = document.activeElement;
  if (
    active &&
    (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') &&
    active.id !== 'todo-input'
  ) return;
  if (e.altKey && (e.key === 'n' || e.key === 'N')) {
    e.preventDefault();
    const todoInput = document.getElementById('todo-input');
    if (todoInput) {
      todoInput.focus();
      todoInput.select();
    }
    return;
  }
  if (e.altKey && (e.key === 'l' || e.key === 'L')) {
    e.preventDefault();
    addNewListPrompt();
    return;
  }
  if (e.altKey && /^[1-9]$/.test(e.key)) {
    e.preventDefault();
    const user = getUser(currentUser);
    const idx = parseInt(e.key, 10) - 1;
    if (user.lists[idx]) {
      currentListIdx = idx;
      renderHome();
    }
    return;
  }
});

// === INITIALIZE ===
showUser();
if(lastUser && users[lastUser]) {
  signIn(lastUser);
} else {
  navTo('account');
}