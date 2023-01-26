const doc = document;
const addTodoBtn = doc.querySelector('#TODO button'),
addInProgressBtn = doc.querySelector('#IN_PROGRESS button'),
addTestingBtn = doc.querySelector('#TESTING button'),
addCompletedBtn = doc.querySelector('#COMPLETED button');
let colorHasClicked = false
const TODO_TASKS = doc.querySelector('#TODO .tasks'),
IN_PROGRESS_TASKS = doc.querySelector('#IN_PROGRESS .tasks'),
TESTING_TASKS = doc.querySelector('#TESTING .tasks'),
COMPLETED_TASKS = doc.querySelector('#COMPLETED .tasks');
// select tasks containers (sections)
const TASKS_SECTION = doc.querySelectorAll('.tasks')

const [TODO, IN_PROGRESS, TESTING, COMPLETED] = ['TODO', 'IN_PROGRESS', 'TESTING', 'COMPLETED']
let draggedElement = null
let draggedElementSection = null
let myTasks = JSON.parse(localStorage.getItem('myTasks')) || {
    'TODO': [],
    'IN_PROGRESS': [],
    'TESTING': [],
    'COMPLETED': []
}
// get my tasks to document 
for (const property in myTasks) {
    myTasks[property].forEach(task => {
        switch(property) {
            case TODO:
                // console.log(section)
                TODO_TASKS.innerHTML = TODO_TASKS.innerHTML + taskCard(task.id, task.content, task.background)
            break;
            case IN_PROGRESS:
                // console.log('in progress')
                IN_PROGRESS_TASKS.innerHTML = IN_PROGRESS_TASKS.innerHTML + taskCard(task.id, task.content, task.background)

            break;
            case TESTING:
                // console.log('testing')
               TESTING_TASKS.innerHTML =TESTING_TASKS.innerHTML + taskCard(task.id, task.content, task.background)

            break;
            case COMPLETED:
                // console.log('completed')
                COMPLETED_TASKS.innerHTML = COMPLETED_TASKS.innerHTML + taskCard(task.id, task.content, task.background)
            break;
            default:
                console.error('SOMETHING WRONG !')
        }
    });
}
// dragTask()

function dragTask() {
    const TASKS = doc.querySelectorAll('.tasks .task')    
    // this list sort tasks when hovering above task (when sorting elements in dom)
    let newOrderedTasksList = null
    let currentSection = null
    TASKS.forEach(task => {
        task.addEventListener('dragstart', function (e) { 
            draggedElement = this
            this.style.opacity = '.5'
            e.dataTransfer.setData('section', this.parentElement.parentElement.getAttribute('id'))
            console.log('start: ', draggedElement.parentElement.parentElement.id)
            draggedElementSection = draggedElement.parentElement.parentElement.id
         })
         task.addEventListener('dragover', function(e) {
             currentSection = this.parentElement.parentElement.id
            //  execute this block of code only if we hover elements in each other from some section
            // it mean's that if we drag task from another section above tasks in this section this condition will not be achieved
             if ((draggedElement != this) && currentSection == draggedElementSection) {
                console.log('hovering')
                const TASKS_CONTAINER = this.parentElement
                const DRAGGED_ELEMENT_INDEX = myTasks[currentSection].findIndex(task => task.id == draggedElement.getAttribute('data-id'))
                const HOVERED_ELEMENT_INDEX = myTasks[currentSection].findIndex(task => task.id == this.getAttribute('data-id'))
                // console.log('HOVERED_ELEMENT_INDEX : ', HOVERED_ELEMENT_INDEX)
                newOrderedTasksList = [...myTasks[currentSection]]
                // height of element that we hover above it
                const ELEMENT_CLIENT_HEIGHT = getComputedStyle(this).getPropertyValue('height').slice(0, -2)
                // if we hover on the half top of element insert dragging element before it
               if (e.offsetY <= ELEMENT_CLIENT_HEIGHT / 2) {
                // if dragged element index less than hovered element index
                if (DRAGGED_ELEMENT_INDEX < HOVERED_ELEMENT_INDEX) {
                    TASKS_CONTAINER.insertBefore(draggedElement, this)
                    changeElementPosition(newOrderedTasksList, DRAGGED_ELEMENT_INDEX, HOVERED_ELEMENT_INDEX - 1)
                }
                else {
                    TASKS_CONTAINER.insertBefore(draggedElement, this)
                    changeElementPosition(newOrderedTasksList, DRAGGED_ELEMENT_INDEX, HOVERED_ELEMENT_INDEX)
                }
               }
                // if we hover on the half bottom of element insert dragging element after it
               else{
                if (DRAGGED_ELEMENT_INDEX < HOVERED_ELEMENT_INDEX) {
                    TASKS_CONTAINER.insertBefore(draggedElement, this.nextElementSibling)
                    changeElementPosition(newOrderedTasksList, DRAGGED_ELEMENT_INDEX, HOVERED_ELEMENT_INDEX)
                }
                else {
                    TASKS_CONTAINER.insertBefore(draggedElement, this.nextElementSibling)
                    changeElementPosition(newOrderedTasksList, DRAGGED_ELEMENT_INDEX, HOVERED_ELEMENT_INDEX + 1)
                }
               }
            }
            // console.log('drag over', this, e)
         })
         task.addEventListener("dragend", function () {
            // console.log('drag end', this)
            this.style.opacity = '1'
            // newOrderedTasksList is null until we drag task above task
            if (!!newOrderedTasksList) {
                // check if the order of tasks changed or not if it change update list
                if (JSON.stringify(newOrderedTasksList) != JSON.stringify(myTasks[currentSection])) {
                    myTasks[currentSection] = [...newOrderedTasksList]
                    // console.log('list changed')
                    // console.log('myTasks[currentSection] : ', myTasks[currentSection])
                    // console.log('newOrderedTasksList : ', newOrderedTasksList)
                console.log('result : ', newOrderedTasksList)
                localStorage.setItem('myTasks', JSON.stringify(myTasks))

                    newOrderedTasksList = null
                }
                else {
                    // console.log('not changed')
                    newOrderedTasksList = null
                }
            }
            draggedElement = null
          });
            // add event change background color to each task
          task.addEventListener('click', changeTaskBg)
           // add delete task function to each task
           task.addEventListener('click', deleteTask)
            // add update task content function to each task
            task.querySelector('p').addEventListener('blur', updateTaskContent)
        })
}


TASKS_SECTION.forEach((section, i) => {
    section.addEventListener('dragover', function (e) { 
        // console.log('loool')
        e.preventDefault()
            // draggedElementSection = draggedElement.parentElement.parentElement.id

        // console.log('drag over : ', this, i)
     })
     section.addEventListener('drop', function (e) { 
        e.preventDefault()
        const DRAGGED_FROM_SECTION = e.dataTransfer.getData('section')
        const CURRENT_SECTION = this.parentElement.getAttribute('id')
        if (DRAGGED_FROM_SECTION != CURRENT_SECTION) {
            // console.log('current section : ', CURRENT_SECTION)
            // console.log('section dropped : ', DRAGGED_FROM_SECTION)
            this.prepend(draggedElement)
            // add dropped task to this section
            myTasks[CURRENT_SECTION] = [myTasks[DRAGGED_FROM_SECTION].find(task => task.id == draggedElement.getAttribute('data-id')), ...myTasks[CURRENT_SECTION]]
            // remove dropped task from it's previous section
            myTasks[DRAGGED_FROM_SECTION] = [...myTasks[DRAGGED_FROM_SECTION].filter(task => task.id != draggedElement.getAttribute('data-id'))]
            localStorage.setItem('myTasks', JSON.stringify(myTasks))
        }
     })
})

// add todo task
addTodoBtn.addEventListener('click', function() {
    addTask(TODO, this)
    localStorage.setItem('myTasks', JSON.stringify(myTasks))
    // changeTaskBg()
    dragTask() 
    // console.log(tasks)
})
// add in progress task
addInProgressBtn.addEventListener('click', function () {
    addTask(IN_PROGRESS, this)
    localStorage.setItem('myTasks', JSON.stringify(myTasks))
    dragTask() 
    // changeTaskBg()
    // console.log('progress')
})

// add testing task
addTestingBtn.addEventListener('click', function () {
    addTask(TESTING, this)
    localStorage.setItem('myTasks', JSON.stringify(myTasks))
    dragTask() 
    // changeTaskBg()
    // console.log('testing')
})

// add completed task
addCompletedBtn.addEventListener('click', function () {
    addTask(COMPLETED, this)
    localStorage.setItem('myTasks', JSON.stringify(myTasks))
    dragTask() 
    // changeTaskBg()
    // console.log('completed')
})

dragTask()

function taskCard(id, content, bg) {
    return  `<div class="task" draggable="true" data-id="${id}" ${ bg ? `style="background-image:${bg};"` : '' }>  
    <div class="card-setting">
        <ul>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
        </ul>
        <img src="./assets/images/icons8-empty-trash-30.png" alt="">
        <!-- <i class="fa-solid fa-trash"></i> -->
    </div>
    <p contenteditable="true">${content}</p>
</div>`
}

// console.log(generateTaskId())

function addTask(status, target) {
    const TASK = {
        id: generateTaskId(status),
        content: 'New Todo Task',
        background: localStorage.getItem('taskBgByDefault') || null // background by default from css
    }
    myTasks[status].unshift(TASK)
    target.parentElement.nextElementSibling.innerHTML = taskCard(TASK.id, TASK.content, TASK.background) + target.parentElement.nextElementSibling.innerHTML
}

// this function generate new task id
function generateTaskId() {
    const CURRENT_DATE = new Date();
    return `${CURRENT_DATE.getDate()}${CURRENT_DATE.getMonth()}${CURRENT_DATE.getFullYear()}${CURRENT_DATE.getHours()}${CURRENT_DATE.getMinutes()}${CURRENT_DATE.getSeconds()}${Math.floor(Math.random() * (900 - 100)) + 100}`
}

// function change element position in list

function changeElementPosition(arr, fromIndex, toIndex) {
    const element = arr[fromIndex]
    arr.splice(fromIndex, 1)
    arr.splice(toIndex, 0, element)
}


// change background of task
function changeTaskBg(e) {
   if (e.target.tagName != 'LI') return
    const bg = getComputedStyle(e.target).getPropertyValue('background-image')
    const clickedTask = e.target.parentElement.parentElement.parentElement
    const currentSection = clickedTask.parentElement.parentElement.id
    if (bg != getComputedStyle(clickedTask).getPropertyValue('background-image')) {
        clickedTask.style.backgroundImage = bg
        myTasks[currentSection] = myTasks[currentSection].map(task => 
            task.id == clickedTask.getAttribute('data-id') ? {...task, background: bg} : task
    )
        localStorage.setItem('myTasks', JSON.stringify(myTasks))
    }
}
// delete task function 
function deleteTask(e) {
    if (!['IMG', 'I'].includes(e.target.tagName)) return 
    const clickedTask = e.target.parentElement.parentElement
    const currentSection = clickedTask.parentElement.parentElement.id
    // console.log('c: ', clickedTask)
    // console.log('current: ', currentSection)
        myTasks[currentSection] = myTasks[currentSection].filter(task => 
            task.id != clickedTask.getAttribute('data-id')
    )
    clickedTask.remove()
    localStorage.setItem('myTasks', JSON.stringify(myTasks))
}

// update task content function
function updateTaskContent(e) {
    if (e.target.tagName != 'P') return 
    const clickedTask = e.target.parentElement
    const currentSection = clickedTask.parentElement.parentElement.id
    const currentContent = clickedTask.querySelector('p').innerHTML
    const oldContent = myTasks[currentSection].find(task => task.id == clickedTask.getAttribute('data-id')).content
    if (currentContent.innerHTML == oldContent) return
    myTasks[currentSection] = myTasks[currentSection].map(task => 
        task.id == clickedTask.getAttribute('data-id') ? {...task, content: currentContent} : task    
    )
    localStorage.setItem('myTasks', JSON.stringify(myTasks))
}