
document.addEventListener('DOMContentLoaded', () => {
    const taskTableBody = document.querySelector('.task-list');
    let tasks = [];
    let originalTasks = []; // To store the original tasks for sorting
  
    chrome.storage.sync.get(['tasks'], (result) => {
      originalTasks = tasks = result.tasks || [];
      updateTaskList();
    });
  
    const searchInput = document.getElementById('searchInput');
    
  
    // Add task to table
    function addTaskToTable(task, index) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="text" value="${task.name}" class="edit-task-name" data-index="${index}" maxlength="20"></td>
        <td><a id="url-name" href="${task.url}" target="_blank">${task.url.replace(/^(https?:\/\/)?(www\.)?/, '')}</a></td>
        <td>${task.createdAt}</td>
        <td><span class="${task.status === 'complete' ? 'complete-status' : ''}">${task.status}</span></td>
        <td>
          <button class="save-edit" data-index="${index}">Edit</button>
          <button class="delete-task" data-index="${index}">Delete</button>
        </td>
      `;
      taskTableBody.appendChild(row);
  
      // Event listener for the "Save" button
      row.querySelector('.save-edit').addEventListener('click', (e) => {
        const taskIndex = e.target.getAttribute('data-index');
        const newName = row.querySelector('.edit-task-name').value;
        editTaskName(taskIndex, newName);
      });
  
      // Event listener for the "Delete" button
      row.querySelector('.delete-task').addEventListener('click', (e) => {
        const taskIndex = e.target.getAttribute('data-index');
        deleteTask(taskIndex);
      });
    }
  
    // Update the task list in the table
    function updateTaskList() {
      taskTableBody.innerHTML = '';
      tasks.forEach((task, index) => addTaskToTable(task, index));
    }
  
  
    // Edit task name
    function editTaskName(index, newName) {
      tasks[index].name = newName;
      updateTaskList();
      chrome.storage.sync.set({ tasks });
    }
  
    // Delete task
    function deleteTask(index) {
      tasks.splice(index, 1);
      updateTaskList();
    }
  
    // Handle search input
    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value.toLowerCase();
      tasks = originalTasks.filter(task => {
        return task.name.toLowerCase().includes(searchTerm) || task.url.toLowerCase().includes(searchTerm);
      });
      updateTaskList();
    });
    
  });