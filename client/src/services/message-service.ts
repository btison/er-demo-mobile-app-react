export class MessageService {

    static success(msg: string): Toast {
        return this.showMessage(msg, 'success');
    }

    static error(msg: string): Toast {
        return this.showMessage(msg, 'danger');
    }

    static info(msg: string): Toast {
        return this.showMessage(msg);
    }

    static warning(msg: string): Toast {
        return this.showMessage(msg, 'warning');
    }

    static showMessage(msg: string, color = 'primary'): Toast {
        const toast = new Toast();
        toast.open = true;
        toast.message = msg;
        toast.position = 'top';
        toast.color = color;
        toast.duration = 3000;
        return toast;
    }
}

export class Toast {
    
    constructor() {
        this.open = false;
        this.position = 'top';
    }

    open: boolean;
    message: string;
    position: 'top' | 'bottom' | 'middle';
    duration: number;
    color: string;
}