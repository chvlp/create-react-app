import type {FieldErrors} from "react-hook-form";

type FlatError = { field?: string; message?: string };

export function message_validate(
    errors?: FieldErrors<any> | FlatError[] | any | undefined
): string {
    if (!errors) return "";

    if (Array.isArray(errors)) {
        const lines = errors
            .map((e) => (e?.message ? `- ${e.message}` : ""))
            .filter(Boolean);
        return dedupe(lines).join("\n");
    }

    const lines: string[] = [];
    const walk = (node: any): void => {
        if (!node || typeof node !== "object") return;

        if (typeof node.message === "string") {
            lines.push(`- ${node.message}`);
        }

        if (Array.isArray(node)) {
            for (const child of node) walk(child);
        } else {
            for (const key of Object.keys(node)) {
                if (key === "message" || key === "type" || key === "ref") continue;
                walk(node[key]);
            }
        }
    };

    walk(errors);
    return dedupe(lines).join("\n");
}

function dedupe(arr: string[]): string[] {
    return arr.filter((v, i, a) => v && a.indexOf(v) === i);
}
