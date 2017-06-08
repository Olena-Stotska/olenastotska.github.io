(function() {
  var tasks = localStorage.tasks ? JSON.parse(localStorage.tasks) : [];
  var container = document.getElementById('tasks');
  var template = document.getElementById('template-task');
  var form = document.querySelector('.form');
  var filter = document.querySelector('.filter');
  var projectsFilter = document.getElementById('project-name');

  function updateHtmlForTask(taskElement, task) {
    var placeholders = taskElement.querySelectorAll('[data-attr]');

    Array.from(placeholders).forEach(function(placeholder) {
      placeholder.textContent = task[placeholder.dataset.attr];
    })
  }

  function createHtmlForTask(task, template) {
    var fragment = document.importNode(template.content, true);

    fragment.firstElementChild.dataset.id = task.id;
    updateHtmlForTask(fragment, task);

    return fragment;
  }

  function findTaskIndexFor(taskElement) {
    var id = Number(taskElement.dataset.id);

    return tasks.findIndex(function(task) {
      return id === task.id;
    });
  }

  function updateTask(container, data) {
    var taskElement = container.querySelector('[data-id="' + data.id  + '"]');
    var taskIndex = findTaskIndexFor(taskElement);

    Object.assign(tasks[taskIndex], data);
    updateHtmlForTask(taskElement, tasks[taskIndex]);
  }

  function persist(tasks) {
    localStorage.tasks = JSON.stringify(tasks);
  }

  function removeTask(taskElement) {
    taskElement.parentNode.removeChild(taskElement);
    var index = findTaskIndexFor(taskElement)

    tasks.splice(index, 1);
    persist(tasks);
  }

  function toogleTaskDescription(taskElement, button) {
    var description = taskElement.querySelector('.description');

    if (description.classList.contains('hide')){
      description.classList.remove('hide');
      button.textContent = button.dataset.expanded;
    } else {
      description.classList.add('hide')
      button.textContent = button.dataset.collapsed;
    }
  }

  function showForm(task) {
    var form = document.querySelector('.form');

    if (task) {
      Array.from(form.elements).forEach(function(control) {
        var key = control.name;

        if (key) {
          control.value = task[key]
        }
      })
    }

    if (form.classList.contains('hide')) {
      form.classList.remove('hide');
    }
  }

  function fillInProjectsFilter() {
    var projects = {};

    tasks.forEach(function(task) {
      var project = task.project;

      if (!projects[project]) {
        var option = document.createElement('option');

        projects[project] = true;
        option.textContent = project;
        projectsFilter.appendChild(option);
      }
    });
  }

  function hideForm() {
    form.classList.add('hide');
    filter.classList.remove('hide');
  }

  function main() {
    fillInProjectsFilter();

    projectsFilter.addEventListener('change', function() {
      var chosenFilter = projectsFilter.value;

      Array.from(container.children).forEach(function(taskElement, index) {
        var toggle = tasks[index].project === chosenFilter || chosenFilter === 'all'
          ? 'remove'
          : 'add';

        taskElement.classList[toggle]('hide');
      })
    })
    form.addEventListener('reset', hideForm);

    form.addEventListener('submit', function(event) {
      event.preventDefault();
      var data = {};

      Array.from(form.elements).forEach(function(field) {
        if (!field.name) return;

        data[field.name] = field.value;
      });

      if (data.id) {
        updateTask(container, data)
      } else {
        var taskFragment = createHtmlForTask(data, template);
        container.appendChild(taskFragment);
        data.id = Date.now();
        tasks.push(data);
      }

      persist(tasks);
      hideForm();
    })

    container.addEventListener('click', function(event) {
      var button = event.target;

      if (!button.getAttribute('name') || button.tagName != 'BUTTON' ) {
        return;
      }

      var taskElement = button.closest('.task');

      switch(button.getAttribute('name')) {
        case 'edit':
          var index = findTaskIndexFor(taskElement);
          showForm(tasks[index]);
          filter.classList.add('hide');
        break;

        case 'close':
          removeTask(taskElement);
        break;

        case 'toggle':
          toogleTaskDescription(taskElement, button);
        break;

      }
    });

    filter.addEventListener('click', function(event) {
      var button = event.target;

      if (!button.getAttribute('name') || button.tagName != 'BUTTON') {
        return;
      }

      switch(button.getAttribute('name')) {
        case 'new-task':
          showForm();
          filter.classList.add('hide');
        break;
      }
    })

    var allTasksFragment = document.createDocumentFragment()

    tasks.forEach(function(task) {
      var taskFragment = createHtmlForTask(task, template);
      allTasksFragment.appendChild(taskFragment);
    });

    container.appendChild(allTasksFragment);
  }

  main();
})();
