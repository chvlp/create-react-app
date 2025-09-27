import {Spinner} from "@/components/ui/shadcn-io/spinner";
import {Label} from "@/components/ui/label.tsx";

export default function LoadingScreen() {
    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/5 backdrop-blur-xs  pointer-events-auto">
            <Spinner size={60} variant="ellipsis"/>
            <Label className="font-mono text-muted-foreground text-sm">Loading</Label>
        </div>
    );
}
