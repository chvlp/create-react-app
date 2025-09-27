"use client";

import * as React from "react";
import {toast} from "sonner";
import {IconAlertTriangle, IconCheck, IconInfoCircle, IconX,} from "@tabler/icons-react";

type Variant = "success" | "info" | "warning" | "error";

const styles: Record<
    Variant,
    { box: string; dot: string; icon: React.ReactNode; titleKey: string }
> = {
    success: {
        box: "border-green-300/60 bg-green-50 text-green-900 dark:bg-green-950/20 dark:text-green-100 dark:border-green-700/40",
        dot: "bg-green-600 text-white",
        icon: <IconCheck className="h-4 w-4"/>,
        titleKey: "toast.success", // e.g. "Congratulations!"
    },
    info: {
        box: "border-blue-300/60 bg-blue-50 text-blue-900 dark:bg-blue-950/20 dark:text-blue-100 dark:border-blue-700/40",
        dot: "bg-blue-600 text-white",
        icon: <IconInfoCircle className="h-4 w-4"/>,
        titleKey: "toast.info", // e.g. "Did you know?"
    },
    warning: {
        box: "border-amber-300/60 bg-amber-50 text-amber-900 dark:bg-amber-950/20 dark:text-amber-100 dark:border-amber-700/40",
        dot: "bg-amber-500 text-white",
        icon: <IconAlertTriangle className="h-4 w-4"/>,
        titleKey: "toast.warning", // e.g. "Warning!"
    },
    error: {
        box: "border-red-300/60 bg-red-50 text-red-900 dark:bg-red-950/20 dark:text-red-100 dark:border-red-700/40",
        dot: "bg-red-600 text-white",
        icon: <IconX className="h-4 w-4"/>,
        titleKey: "toast.error", // e.g. "Something went wrong!"
    },
};

type BaseOpts = {
    title?: string;                // translation key or plain text
    description?: React.ReactNode; // if string -> will be passed through t()
    action?: React.ReactNode;
    duration?: number;
};

// eslint-disable-next-line react-refresh/only-export-components
function ToastCard({
                       id,
                       variant,
                       opts,
                   }: {
    id: string | number;
    variant: Variant;
    opts: BaseOpts;
}) {
    const s = styles[variant];

    const resolvedTitle = opts.title
    const resolvedDescription =opts.description

    return (
        <div
            className={[
                "flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm",
                "backdrop-blur-sm",
                s.box,
            ].join(" ")}
        >
            {/* left colored circle */}
            <div className={`flex h-7 w-7 items-center justify-center rounded-full ${s.dot}`}>
                {s.icon}
            </div>

            {/* text */}
            <div className="min-w-0 flex-1">
                <p className="font-bold text-xs ">{resolvedTitle}</p>
                {resolvedDescription && (
                    <p className="mt-1 text-sm leading-5 text-foreground/70 dark:text-white/70 whitespace-pre-line">
                        {resolvedDescription}
                    </p>
                )}
                {opts.action && <div className="mt-1 text-sm">{opts.action}</div>}
            </div>

            {/* close (x) */}
            <button
                onClick={() => toast.dismiss(id)}
                className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-foreground/60 hover:bg-black/5 hover:text-foreground dark:hover:bg-white/10"
                aria-label="Close"
            >
                <IconX className="h-4 w-4"/>
            </button>
        </div>
    );
}

function baseToast(variant: Variant, opts: BaseOpts) {
    return toast.custom(
        (id) => <ToastCard id={id} variant={variant} opts={opts}/>,
        {duration: opts.duration ?? 6000}
    );
}

export const notify = {
    success: (description?: React.ReactNode, title?: string, duration?: number) =>
        baseToast("success", {description, title, duration}),
    info: (description?: React.ReactNode, title?: string, duration?: number) =>
        baseToast("info", {description, title, duration}),
    warning: (description?: React.ReactNode, title?: string, duration?: number) =>
        baseToast("warning", {description, title, duration}),
    error: (
        description?: React.ReactNode,
        title?: string,
        action?: React.ReactNode,
        duration?: number
    ) => baseToast("error", {description, title, action, duration}),
};
