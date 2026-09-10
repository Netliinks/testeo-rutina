import { Config } from "./Configs.js";

export const TaskManager = {
    addTask: (title, totalItems) => {
        const id = Date.now().toString();
        const task = {
            id,
            title,
            totalItems,
            currentItem: 0,
            progress: 0,
            message: "Iniciando...",
            status: "running", // running, finished, error, cancelled
            startTime: Date.now(),
            errors: [],
            warnings: [],
            logs: [] // Chronological log of all actions
        };
        Config.backgroundTasks.push(task);
        TaskManager._notify();
        return id;
    },

    updateProgress: (id, currentItem, message) => {
        const task = Config.backgroundTasks.find(t => t.id === id);
        if (task) {
            task.currentItem = currentItem;
            task.progress = Math.round((currentItem / task.totalItems) * 100);
            if (message) {
                task.message = message;
                // Add to log if it's a new item processing
                if (message.startsWith("Empresa:")) {
                    TaskManager.addLog(id, message, 'info');
                }
            }
            TaskManager._notify();
        }
    },

    addLog: (id, message, type = 'info') => {
        const task = Config.backgroundTasks.find(t => t.id === id);
        if (task) {
            task.logs.push({
                message,
                type, // info, success, warning, error
                timestamp: new Date().toLocaleTimeString()
            });
            TaskManager._notify();
        }
    },

    reportError: (id, error) => {
        const task = Config.backgroundTasks.find(t => t.id === id);
        if (task) {
            task.errors.push(error);
            TaskManager.addLog(id, error, 'error');
            TaskManager._notify();
        }
    },

    reportWarning: (id, warning) => {
        const task = Config.backgroundTasks.find(t => t.id === id);
        if (task) {
            task.warnings.push(warning);
            TaskManager.addLog(id, warning, 'warning');
            TaskManager._notify();
        }
    },

    finishTask: (id, message) => {
        const task = Config.backgroundTasks.find(t => t.id === id);
        if (task) {
            task.status = "finished";
            task.progress = 100;
            task.message = message || "Proceso finalizado";
            TaskManager._notify();
        }
    },

    cancelTask: (id) => {
        const task = Config.backgroundTasks.find(t => t.id === id);
        if (task) {
            task.status = "cancelled";
            task.message = "Proceso cancelado";
            TaskManager._notify();
        }
    },

    isCancelled: (id) => {
        const task = Config.backgroundTasks.find(t => t.id === id);
        return task ? task.status === "cancelled" : true;
    },

    removeTask: (id) => {
        Config.backgroundTasks = Config.backgroundTasks.filter(t => t.id !== id);
        TaskManager._notify();
    },

    _notify: () => {
        const event = new CustomEvent('taskUpdate', { detail: Config.backgroundTasks });
        window.dispatchEvent(event);
    }
};
