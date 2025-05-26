const projectList = document.getElementById('projects');

// LOGIN FUNCTION
async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem('token', data.token);
      document.getElementById('login').style.display = 'none';
      document.getElementById('signup').style.display = 'none';
      document.getElementById('main').style.display = 'block';
      loadProjects();
    } else {
      alert(data.message || 'Invalid login credentials.');
    }
  } catch (err) {
    alert('Error during login. Please try again.');
    console.error(err);
  }
}

// SIGNUP FUNCTION
async function signup() {
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();

  if (!name || !email || !password) {
    alert("Please fill in all signup fields.");
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Signup successful! Please log in.');
      // Clear signup fields
      document.getElementById('signup-name').value = '';
      document.getElementById('signup-email').value = '';
      document.getElementById('signup-password').value = '';
      // Show login form, hide signup form
      document.getElementById('signup').style.display = 'none';
      document.getElementById('login').style.display = 'block';
    } else {
      alert(data.message || 'Signup failed.');
    }
  } catch (err) {
    alert('Error during signup.');
    console.error(err);
  }
}

// LOAD PROJECTS FUNCTION
async function loadProjects() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('User not authenticated.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/projects', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (res.ok && Array.isArray(data)) {
      displayProjects(data);
    } else {
      projectList.innerHTML = '<p>No projects found.</p>';
    }
  } catch (err) {
    console.error('Failed to load projects:', err);
    alert('Error loading projects.');
  }
}

// DISPLAY PROJECTS FUNCTION (your version)
function displayProjects(projects) {
  projectList.innerHTML = '';
  projects.forEach(p => {
    const projectDiv = document.createElement('div');
    projectDiv.textContent = `${p.project_name} - ${p.description}`;
    
    const viewTasksBtn = document.createElement('button');
    viewTasksBtn.textContent = 'View Tasks';
    viewTasksBtn.onclick = () => loadTasks(p.project_id);
    
    projectDiv.appendChild(viewTasksBtn);
    projectList.appendChild(projectDiv);
  });
}

// LOAD TASKS FUNCTION (your version)
function loadTasks(projectId) {
  fetch(`http://localhost:3000/api/projects/${projectId}/tasks`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  })
  .then(res => res.json())
  .then(data => {
    alert(`Tasks:\n${data.map(t => `${t.task_name} (${t.status})`).join('\n')}`);
  })
  .catch(err => {
    console.error('Failed to load tasks:', err);
    alert('Error loading tasks.');
  });
}

// CREATE PROJECT FUNCTION
async function createProject() {
  const pname = document.getElementById('pname').value.trim();
  const pdesc = document.getElementById('pdesc').value.trim();
  const pstart = document.getElementById('pstart').value.trim();
  const pend = document.getElementById('pend').value.trim();

  if (!pname || !pdesc || !pstart || !pend) {
    alert("Please fill in all fields.");
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('User not authenticated.');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        project_name: pname,
        description: pdesc,
        start_date: pstart,
        end_date: pend
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Project created!');
      loadProjects();
      // Clear form
      document.getElementById('pname').value = '';
      document.getElementById('pdesc').value = '';
      document.getElementById('pstart').value = '';
      document.getElementById('pend').value = '';
    } else {
      alert(data.message || 'Failed to create project.');
    }
  } catch (err) {
    console.error('Project creation error:', err);
    alert('Error creating project.');
  }
}

// LOGOUT FUNCTION (your version)
function logout() {
  localStorage.removeItem('token');
  document.getElementById('main').style.display = 'none';
  document.getElementById('login').style.display = 'block';
  document.getElementById('signup').style.display = 'none';
}
