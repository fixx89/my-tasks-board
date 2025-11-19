class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.currentFilters = {
            category: 'all',
            date: '',
            status: 'all'
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    bindEvents() {
        // Модальное окно
        document.getElementById('add-task-btn').addEventListener('click', () => this.openModal());
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('cancel-task').addEventListener('click', () => this.closeModal());
        document.getElementById('task-form').addEventListener('submit', (e) => this.createTask(e));

        // Фильтры
        document.getElementById('apply-filters').addEventListener('click', () => this.applyFilters());
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());

        // Закрытие модального окна при клике вне его
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('task-modal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    openModal() {
        document.getElementById('task-modal').style.display = 'block';
        document.getElementById('task-deadline').valueAsDate = new Date();
    }

    closeModal() {
        document.getElementById('task-modal').style.display = 'none';
        document.getElementById('task-form').reset();
    }

    createTask(e) {
        e.preventDefault();
        
        const taskText = document.getElementById('task-text').value;
        const taskDeadline = document.getElementById('task-deadline').value;
        const category = document.querySelector('input[name="category"]:checked').value;

        const task = {
            id: Date.now(),
            text: taskText,
            deadline: taskDeadline,
            category: category,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.closeModal();
    }

    deleteTask(taskId) {
        if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    applyFilters() {
        this.currentFilters.category = document.getElementById('category-filter').value;
        this.currentFilters.date = document.getElementById('date-filter').value;
        this.currentFilters.status = document.getElementById('status-filter').value;
        this.renderTasks();
    }

    resetFilters() {
        document.getElementById('category-filter').value = 'all';
        document.getElementById('date-filter').value = '';
        document.getElementById('status-filter').value = 'all';
        this.currentFilters = {
            category: 'all',
            date: '',
            status: 'all'
        };
        this.renderTasks();
    }

    filterTasks() {
        return this.tasks.filter(task => {
            // Фильтр по категории
            if (this.currentFilters.category !== 'all' && task.category !== this.currentFilters.category) {
                return false;
            }

            // Фильтр по дате
            if (this.currentFilters.date && task.deadline !== this.currentFilters.date) {
                return false;
            }

            // Фильтр по статусу
            if (this.currentFilters.status === 'active' && task.completed) {
                return false;
            }
            if (this.currentFilters.status === 'completed' && !task.completed) {
                return false;
            }

            return true;
        });
    }

    renderTasks() {
        const board = document.getElementById('task-board');
        const filteredTasks = this.filterTasks();

        if (filteredTasks.length === 0) {
            board.innerHTML = '<p class="no-tasks">Задачи не найдены</p>';
            return;
        }

        board.innerHTML = filteredTasks.map(task => `
            <div class="task-sticker ${task.category} ${task.completed ? 'completed' : ''}">
                <div class="task-actions">
                    <button onclick="taskManager.toggleTaskCompletion(${task.id})" title="${task.completed ? 'Вернуть в работу' : 'Отметить выполненной'}">
                        ${task.completed ? '↶' : '✓'}
                    </button>
                    <button onclick="taskManager.deleteTask(${task.id})" title="Удалить">×</button>
                </div>
                <div class="task-text">${task.text}</div>
                <div class="task-meta">
                    <span class="task-category">${task.category === 'school' ? '🎓 Школа' : '👤 Личное'}</span>
                    <span class="task-deadline">📅 ${this.formatDate(task.deadline)}</span>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const active = total - completed;

        document.getElementById('total-tasks').textContent = total;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('active-tasks').textContent = active;
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }
}

// Инициализация при загрузке страницы
const taskManager = new TaskManager();