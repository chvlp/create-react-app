import {notify} from "@/components/notify.tsx";

export const toast_err = (msg: string) =>
    notify.error(msg, "toast_error");
export const toast_warn = (msg: string) =>
    notify.warning(msg, "toast_warning");
export const toast_info = (msg: string) =>
    notify.info(msg, "toast_info");
export const toast_done = (msg: string) =>
    notify.success(msg, "toast_success");