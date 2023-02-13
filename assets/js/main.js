const doc = document;
// SELECT BUTTON THAT ADD TASK
const ADD_TODO_BTN = doc.querySelector("#TODO button"),
  ADD_IN_PROGRESS_BTN = doc.querySelector("#IN_PROGRESS button"),
  ADD_TESTING_BTN = doc.querySelector("#TESTING button"),
  ADD_COMPLETED_BTN = doc.querySelector("#COMPLETED button");
// SELECT TASKS CONTAINERS (sections)
const TODO_TASKS = doc.querySelector("#TODO .tasks"),
  IN_PROGRESS_TASKS = doc.querySelector("#IN_PROGRESS .tasks"),
  TESTING_TASKS = doc.querySelector("#TESTING .tasks"),
  COMPLETED_TASKS = doc.querySelector("#COMPLETED .tasks");
// select all tasks containers (sections)
const TASKS_SECTION = doc.querySelectorAll(".tasks");
// declare status task as constants
const [TODO, IN_PROGRESS, TESTING, COMPLETED] = [
  "TODO",
  "IN_PROGRESS",
  "TESTING",
  "COMPLETED",
];
let draggedElement = null;
let draggedElementSection = null;
// get all my tasks from localStorage if it's null create it
let myTasks = JSON.parse(localStorage.getItem("myTasks")) ?? {
  TODO: [],
  IN_PROGRESS: [],
  TESTING: [],
  COMPLETED: [],
};

// get my tasks to document
for (const property in myTasks) {
  myTasks[property].forEach((task) => {
    switch (property) {
      case TODO:
        TODO_TASKS.innerHTML =
          TODO_TASKS.innerHTML +
          taskCard(task.id, task.content, task.background);
        break;
      case IN_PROGRESS:
        IN_PROGRESS_TASKS.innerHTML =
          IN_PROGRESS_TASKS.innerHTML +
          taskCard(task.id, task.content, task.background);

        break;
      case TESTING:
        TESTING_TASKS.innerHTML =
          TESTING_TASKS.innerHTML +
          taskCard(task.id, task.content, task.background);

        break;
      case COMPLETED:
        COMPLETED_TASKS.innerHTML =
          COMPLETED_TASKS.innerHTML +
          taskCard(task.id, task.content, task.background);
        break;
      default:
        console.error("SOMETHING WRONG !");
    }
  });
}
// function add multiple events to each task
function dragTask() {
  const TASKS = doc.querySelectorAll(".tasks .task");
  // this list sort tasks when hovering above task (when sorting elements in dom)
  let newOrderedTasksList = null;
  let currentSection = null;
  TASKS.forEach((task) => {
    task.addEventListener("dragstart", function (e) {
      draggedElement = this;
      this.style.opacity = ".5";
      e.dataTransfer.setData(
        "section",
        this.parentElement.parentElement.getAttribute("id")
      );
      console.log("start: ", draggedElement.parentElement.parentElement.id);
      draggedElementSection = draggedElement.parentElement.parentElement.id;
    });
    task.addEventListener("dragover", function (e) {
      currentSection = this.parentElement.parentElement.id;
      //  execute this block of code only if we hover elements in each other from some section
      // it mean's that if we drag task from another section above tasks in this section this condition will not be achieved
      if (draggedElement != this && currentSection == draggedElementSection) {
        console.log("hovering");
        const TASKS_CONTAINER = this.parentElement;
        const DRAGGED_ELEMENT_INDEX = myTasks[currentSection].findIndex(
          (task) => task.id == draggedElement.getAttribute("data-id")
        );
        const HOVERED_ELEMENT_INDEX = myTasks[currentSection].findIndex(
          (task) => task.id == this.getAttribute("data-id")
        );
        newOrderedTasksList = [...myTasks[currentSection]];
        // height of element that we hover above it
        const ELEMENT_CLIENT_HEIGHT = getComputedStyle(this)
          .getPropertyValue("height")
          .slice(0, -2);
        // if we hover on the half top of element insert dragging element before it
        if (e.offsetY <= ELEMENT_CLIENT_HEIGHT / 2) {
          // if dragged element index less than hovered element index
          if (DRAGGED_ELEMENT_INDEX < HOVERED_ELEMENT_INDEX) {
            TASKS_CONTAINER.insertBefore(draggedElement, this);
            changeElementPosition(
              newOrderedTasksList,
              DRAGGED_ELEMENT_INDEX,
              HOVERED_ELEMENT_INDEX - 1
            );
          } else {
            TASKS_CONTAINER.insertBefore(draggedElement, this);
            changeElementPosition(
              newOrderedTasksList,
              DRAGGED_ELEMENT_INDEX,
              HOVERED_ELEMENT_INDEX
            );
          }
        }
        // if we hover on the half bottom of element insert dragging element after it
        else {
          if (DRAGGED_ELEMENT_INDEX < HOVERED_ELEMENT_INDEX) {
            TASKS_CONTAINER.insertBefore(
              draggedElement,
              this.nextElementSibling
            );
            changeElementPosition(
              newOrderedTasksList,
              DRAGGED_ELEMENT_INDEX,
              HOVERED_ELEMENT_INDEX
            );
          } else {
            TASKS_CONTAINER.insertBefore(
              draggedElement,
              this.nextElementSibling
            );
            changeElementPosition(
              newOrderedTasksList,
              DRAGGED_ELEMENT_INDEX,
              HOVERED_ELEMENT_INDEX + 1
            );
          }
        }
      }
    });
    task.addEventListener("dragend", function () {
      this.style.opacity = "1";
      // newOrderedTasksList is null until we drag task above task
      if (!!newOrderedTasksList) {
        // check if the order of tasks changed or not if it change update list
        if (
          JSON.stringify(newOrderedTasksList) !=
          JSON.stringify(myTasks[currentSection])
        ) {
          myTasks[currentSection] = [...newOrderedTasksList];
          localStorage.setItem("myTasks", JSON.stringify(myTasks));
          newOrderedTasksList = null;
        } else newOrderedTasksList = null;
      }
      draggedElement = null;
    });
    // add event change background color to each task
    task.addEventListener("click", changeTaskBg);
    // add delete task function to each task
    task.addEventListener("click", deleteTask);
    // add update task content function to each task
    task.querySelector("p").addEventListener("blur", updateTaskContent);
  });
}

TASKS_SECTION.forEach((section) => {
  section.addEventListener("dragover", function (e) {
    e.preventDefault();
  });
  section.addEventListener("drop", function (e) {
    e.preventDefault();
    const DRAGGED_FROM_SECTION = e.dataTransfer.getData("section");
    const CURRENT_SECTION = this.parentElement.getAttribute("id");
    if (DRAGGED_FROM_SECTION != CURRENT_SECTION) {
      this.prepend(draggedElement);
      // add dropped task to this section
      myTasks[CURRENT_SECTION] = [
        myTasks[DRAGGED_FROM_SECTION].find(
          (task) => task.id == draggedElement.getAttribute("data-id")
        ),
        ...myTasks[CURRENT_SECTION],
      ];
      // remove dropped task from it's previous section
      myTasks[DRAGGED_FROM_SECTION] = [
        ...myTasks[DRAGGED_FROM_SECTION].filter(
          (task) => task.id != draggedElement.getAttribute("data-id")
        ),
      ];
      localStorage.setItem("myTasks", JSON.stringify(myTasks));
    }
  });
});

// add todo task
ADD_TODO_BTN.addEventListener("click", function () {
  addTask(TODO, this);
  localStorage.setItem("myTasks", JSON.stringify(myTasks));
  dragTask();
});
// add in progress task
ADD_IN_PROGRESS_BTN.addEventListener("click", function () {
  addTask(IN_PROGRESS, this);
  localStorage.setItem("myTasks", JSON.stringify(myTasks));
  dragTask();
});

// add testing task
ADD_TESTING_BTN.addEventListener("click", function () {
  addTask(TESTING, this);
  localStorage.setItem("myTasks", JSON.stringify(myTasks));
  dragTask();
});

// add completed task
ADD_COMPLETED_BTN.addEventListener("click", function () {
  addTask(COMPLETED, this);
  localStorage.setItem("myTasks", JSON.stringify(myTasks));
  dragTask();
});

function taskCard(id, content, bg) {
  return `<div class="task" draggable="true" data-id="${id}" ${
    bg ? `style="background-image:${bg};"` : ""
  }>  
    <div class="card-setting">
        <ul>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ul>
        <img src='./assets/img/trash-icon.svg' alt='trash icon'/>
    </div>
    <p contenteditable="true">${content}</p>
</div>`;
}

function addTask(status, target) {
  const TASK = {
    id: generateTaskId(),
    content: "New Todo Task",
    background: localStorage.getItem("taskBgByDefault") || null, // background by default from css
  };
  myTasks[status].unshift(TASK);
  target.parentElement.nextElementSibling.innerHTML =
    taskCard(TASK.id, TASK.content, TASK.background) +
    target.parentElement.nextElementSibling.innerHTML;
}

// this function generate new task id
function generateTaskId() {
  return Date.now().toString(36)
}

// function change element position in list

function changeElementPosition(arr, fromIndex, toIndex) {
  const element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

// function change background of task
function changeTaskBg(e) {
  if (e.target.tagName != "LI") return;
  const bg = getComputedStyle(e.target).getPropertyValue("background-image");
  const clickedTask = e.target.parentElement.parentElement.parentElement;
  const currentSection = clickedTask.parentElement.parentElement.id;
  if (
    bg != getComputedStyle(clickedTask).getPropertyValue("background-image")
  ) {
    clickedTask.style.backgroundImage = bg;
    myTasks[currentSection] = myTasks[currentSection].map((task) =>
      task.id == clickedTask.getAttribute("data-id")
        ? { ...task, background: bg }
        : task
    );
    localStorage.setItem("myTasks", JSON.stringify(myTasks));
  }
}
// function delete task function
function deleteTask(e) {
  if (e.target.tagName != "IMG") return;
  const clickedTask = e.target.parentElement.parentElement;
  const currentSection = clickedTask.parentElement.parentElement.id;
  myTasks[currentSection] = myTasks[currentSection].filter(
    (task) => task.id != clickedTask.getAttribute("data-id")
  );
  clickedTask.remove();
  localStorage.setItem("myTasks", JSON.stringify(myTasks));
}

// function update task content function
function updateTaskContent(e) {
  if (e.target.tagName != "P") return;
  const clickedTask = e.target.parentElement;
  const currentSection = clickedTask.parentElement.parentElement.id;
  const currentContent = clickedTask.querySelector("p").innerHTML;
  const oldContent = myTasks[currentSection].find(
    (task) => task.id == clickedTask.getAttribute("data-id")
  ).content;
  if (currentContent.innerHTML == oldContent) return;
  myTasks[currentSection] = myTasks[currentSection].map((task) =>
    task.id == clickedTask.getAttribute("data-id")
      ? { ...task, content: currentContent }
      : task
  );
  localStorage.setItem("myTasks", JSON.stringify(myTasks));
}

// function that set default styles that stored in localStorage
function setDefaultStyles() {
  if(!!localStorage.getItem("defaultBodyBg")) {
    (document.body.style.backgroundImage =
      localStorage.getItem("defaultBodyBg"))
  }
  if(localStorage.getItem("defaultBodyBg") ==
  "linear-gradient(to right, rgb(67, 67, 67) 0%, rgb(0, 0, 0) 100%)") {
    TASKS_SECTION.forEach(
      (section) => (section.style.backgroundColor = "transparent")
    )
  }
  if(!!localStorage.getItem("defaultFontFamily")) {
    (document.body.style.fontFamily =
      localStorage.getItem("defaultFontFamily"))
  }
}

// ############ START SIDEBAR
const SIDE_BAR = doc.getElementById("sidebar");
// show / hide sidebar
SIDE_BAR.querySelector(".setting-btn").addEventListener("click", function () {
  this.parentElement.classList.toggle("show");
  if(this.parentElement.classList.contains("show")) this.querySelector("img").classList.add("fa-spin")
  else this.querySelector("img").classList.remove("fa-spin");
});
// change default body background color
SIDE_BAR.querySelectorAll("#default-bg li").forEach((bg) => {
  bg.addEventListener("click", function () {
    // console.log()
    const BACKGROUND =
      getComputedStyle(this).getPropertyValue("background-image");
    if(BACKGROUND == "linear-gradient(to right, rgb(67, 67, 67) 0%, rgb(0, 0, 0) 100%)") {
      TASKS_SECTION.forEach(
        (section) => (section.style.backgroundColor = "transparent")
      )
    }
    else {
      TASKS_SECTION.forEach(
        (section) => (section.style.backgroundColor = "#fff")
      );
    }
    document.body.style.backgroundImage = BACKGROUND;
    localStorage.setItem("defaultBodyBg", BACKGROUND);
  });
});
// change default task background color
SIDE_BAR.querySelectorAll("#default-task-bg li").forEach((bg) => {
  bg.addEventListener("click", function () {
    const BACKGROUND =
      getComputedStyle(this).getPropertyValue("background-image");
    localStorage.setItem("taskBgByDefault", BACKGROUND);
  });
});

// change default font family
SIDE_BAR.querySelectorAll("#default-font li").forEach((font) => {
  font.addEventListener("click", function () {
    const FONT = getComputedStyle(this).getPropertyValue("font-family");
    document.body.style.fontFamily = FONT;
    localStorage.setItem("defaultFontFamily", FONT);
  });
});
window.addEventListener('click', function (e) {
  // hide sidebar whenever click outside of it
  if (!SIDE_BAR.contains(e.target)) {
    SIDE_BAR.classList.remove('show')
    SIDE_BAR.querySelector('.fa-spin').classList.remove('fa-spin')
  }
})
// ############ END SIDEBAR

// call function that set dafault styles from localStorge
setDefaultStyles();
// call dragTaskFunction
dragTask();