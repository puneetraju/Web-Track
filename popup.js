document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const addTaskButton = document.getElementById('add-task');
    const taskList = document.getElementById('task-list');
  
    // Load tasks on popup open
    chrome.storage.sync.get(['tasks'], (result) => {
      const tasks = result.tasks || [];
      tasks.forEach(task => addTaskToList(task));
    });
  
    // Adding a task
    addTaskButton.addEventListener('click', async () => {
      const taskName = taskInput.value.trim();
  
      let url;
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        url = tab.url;
      } catch (e) {
        console.error(e);
      }
  
      const createdAt = new Date().toLocaleString();
      const task = {
        name: taskName || new URL(url).hostname,  // Use URL as the task name if no input
        url: url || '',
        createdAt,
        status: 'pending'
      };
  
      chrome.storage.sync.get(['tasks'], (result) => {
        const tasks = result.tasks || [];
        tasks.push(task);
        chrome.storage.sync.set({ tasks });
        addTaskToList(task);
      });
  
      taskInput.value = '';  // Clear input after adding
    });
  
    // Add task to the list in the popup
    function addTaskToList(task) {
      const li = document.createElement('li');
      li.className = task.status === 'complete' ? 'complete' : '';
      
      li.innerHTML = `
        <div class="task-header">
          <span class="task-name">${task.name}</span>
          <button class="toggle-details">▼</button>
        </div>
        <div class="details">
          <p>URL: <a href="${task.url}" target="_blank">${task.url}</a></p>
          <p>Created at: ${task.createdAt}</p>
        </div>
        <div class="task-actions">
          <button class="mark-complete">Complete</button>
          <button class="edit-task">Edit</button>
          <button class="delete-task">Delete</button>
        </div>
      `;
  
      taskList.appendChild(li);
  
      // Toggle details visibility
      li.querySelector('.toggle-details').addEventListener('click', (e) => {
        const details = li.querySelector('.details');
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
        e.target.textContent = details.style.display === 'none' ? '▼' : '▲';
      });
  
      // Mark task as complete
      li.querySelector('.mark-complete').addEventListener('click', () => {
        task.status = 'complete';
        li.classList.add('complete');
        chrome.storage.sync.get(['tasks'], (result) => {
          const tasks = result.tasks || [];
          const taskIndex = tasks.findIndex(t => t.name === task.name && t.url === task.url);
          if (taskIndex > -1) {
            tasks[taskIndex].status = 'complete';
            chrome.storage.sync.set({ tasks });
          }
        });
      });
  
      // Edit task (redirect to options page)
      li.querySelector('.edit-task').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();  // Redirect to options page
      });
  
      // Delete task
      li.querySelector('.delete-task').addEventListener('click', () => {
        chrome.storage.sync.get(['tasks'], (result) => {
          const tasks = result.tasks || [];
          const updatedTasks = tasks.filter(t => t.name !== task.name || t.url !== task.url);
          chrome.storage.sync.set({ tasks: updatedTasks });
          taskList.removeChild(li);
        });
      });
    }
  });
//
