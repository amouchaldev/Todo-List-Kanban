const doc = document;
const addTodoBtn = doc.querySelector('#TODO button'),
addInProgressBtn = doc.querySelector('#IN_PROGRESS button'),
addTestingBtn = doc.querySelector('#TESTING button'),
addCompletedBtn = doc.querySelector('#COMPLETED button');
const TASKS_SECTION = doc.querySelectorAll('.tasks')
// const TASKS = doc.querySelectorAll('.tasks .task')
const [TODO, IN_PROGRESS, TESTING, COMPLETED] = ['TODO', 'IN_PROGRESS', 'TESTING', 'COMPLETED']
let draggedElement = null
let myTasks = {
    'TODO': [],
    'IN_PROGRESS': [],
    'TESTING': [],
    'COMPLETED': []
}
function dragTasks() {
    const TASKS = doc.querySelectorAll('.tasks .task')
    TASKS.forEach(task => {
        task.addEventListener('dragstart', function (e) { 
            // e.preventDefault()
            // console.log('section : ', this.parentElement.parentElement.getAttribute('id'))
            // const data = {
            //     section: 
            // }
            this.style.opacity = '.5'
            e.dataTransfer.setData('section', this.parentElement.parentElement.getAttribute('id'))
            draggedElement = this
            console.log('drag start : ', this)
            // e.dataTransfer.setData('draggedElement', JSON.stringify({elem: this}))
         })
         task.addEventListener('dragover', function(e) {
            if (draggedElement != this) {
                // height of element that we hover above it
                const ELEMENT_CLIENT_HEIGHT = getComputedStyle(this).getPropertyValue('height').slice(0, -2)
                // if we hover on the half top of element insert dragging element before it
               if (e.offsetY <= ELEMENT_CLIENT_HEIGHT / 2) {
                // console.log(this.parentElement)
                this.parentElement.insertBefore(draggedElement, this)
                   console.log('greater than')
               }
                // if we hover on the half bottom of element insert dragging element after it
               else {
                this.parentElement.insertBefore(draggedElement, this.nextElementSibling)
                   console.log('less than')
               }
            }
            // console.log('drag over', this, e)
         })
         task.addEventListener("dragend", function () {
            // console.log('drag end', this)
            this.style.opacity = '1'
            draggedElement = null
          });
    })
}


TASKS_SECTION.forEach((section, i) => {
    section.addEventListener('dragover', function (e) { 
        // console.log('loool')
        e.preventDefault()
        // console.log('drag over : ', this, i)
     })
     section.addEventListener('drop', function (e) { 
        e.preventDefault()
        const DRAGGED_FROM_SECTION = e.dataTransfer.getData('section')
        const CURRENT_SECTION = this.parentElement.getAttribute('id')
        if (DRAGGED_FROM_SECTION != CURRENT_SECTION) {
            console.log('current section : ', CURRENT_SECTION)
            console.log('section dropped : ', DRAGGED_FROM_SECTION)
            this.prepend(draggedElement)
            // add dropped task to this section
            myTasks[CURRENT_SECTION] = [myTasks[DRAGGED_FROM_SECTION].find(task => task.id == draggedElement.getAttribute('data-id')), ...myTasks[CURRENT_SECTION]]
            // remove dropped task from it's previous section
            myTasks[DRAGGED_FROM_SECTION] = [...myTasks[DRAGGED_FROM_SECTION].filter(task => task.id != draggedElement.getAttribute('data-id'))]
        }

        // console.log('dropped element: ', draggedElement)
        // console.log('drop above : ', this, i)
     })
})
// TASKS_ELEMENT.querySelectorAll('.task').forEach(task => {
//     task.addEventListener('mouseover', e => {
//         // console.log('x :', e.clientX)
//         console.log('y :', e.clientY)
//     })
// })
// add todo task
addTodoBtn.addEventListener('click', function() {
    addTask(TODO, this)
    dragTasks() 
    // console.log(tasks)
})
// add in progress task
addInProgressBtn.addEventListener('click', function () {
    addTask(IN_PROGRESS, this)
    dragTasks() 
    console.log('progress')
})

// add testing task
addTestingBtn.addEventListener('click', function () {
    addTask(TESTING, this)
    dragTasks() 
    console.log('testing')
})

// add completed task
addCompletedBtn.addEventListener('click', function () {
    addTask(COMPLETED, this)
    dragTasks() 
    console.log('completed')
})

dragTasks()
function taskCard(id) {
    return  `<div class="task" draggable="true" data-id="${id}">
    <div class="card-setting">
        <ul>
            <li style="background-image: linear-gradient(to top, #accbee 0%, #e7f0fd 100%);"></li>
            <li style="background-image: linear-gradient(to top, #c1dfc4 0%, #deecdd 100%);"></li>
            <li style="background-image: linear-gradient(to top, #feada6 0%, #f5efef 100%);"></li>
            <li style="background-image: linear-gradient(to top, #ff0844 0%, #ffb199 100%);"></li>
            <li style="background-image: linear-gradient(-225deg, #FFFEFF 0%, #D7FFFE 100%);"></li>
        </ul>
        <img src="./assets/images/icons8-empty-trash-30.png" alt="">
        <!-- <i class="fa-solid fa-trash"></i> -->
    </div>
    <p contenteditable="true">New Todo Task ..</p>
</div>`
}


// console.log(generateTaskId())

function addTask(status, target) {
    const TASK = {
        id: generateTaskId(status),
        content: 'New Todo Task',
        background: 'linear-gradient(to top, #accbee 0%, #e7f0fd 100%)',
    }
    myTasks[status].unshift(TASK)
    target.parentElement.nextElementSibling.innerHTML = taskCard(TASK.id) + target.parentElement.nextElementSibling.innerHTML
}

// this function generate new task id
function generateTaskId() {
    const CURRENT_DATE = new Date();
    return `${CURRENT_DATE.getDate()}${CURRENT_DATE.getMonth()}${CURRENT_DATE.getFullYear()}${CURRENT_DATE.getHours()}${CURRENT_DATE.getMinutes()}${CURRENT_DATE.getSeconds()}${Math.floor(Math.random() * (900 - 100)) + 100}`
}

