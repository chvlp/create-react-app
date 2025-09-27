import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {Spinner} from "@/components/ui/shadcn-io/spinner"
import {IconBell} from "@tabler/icons-react";
import type {SectionDialogProps} from "@/components/delete-dialog.tsx";

export function ConfirmDialog({
                                 isOpen,
                                 isLoading = false,
                                 onClose,
                                 onClick,
                             }: SectionDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <AlertDialogContent className="sm:max-w-md rounded-2xl">
                <div className="mx-auto mt-2 mb-3 flex h-22 w-22 items-center justify-center rounded-full bg-muted">
                    <IconBell className="h-20 w-20 text-blue-400"/>
                </div>

                <AlertDialogHeader className="space-y-2 py-10">
                    <AlertDialogTitle className="text-center">
                        Are you sure you want to update this data?
                    </AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogFooter className="sm:justify-center gap-2 ">
                    <AlertDialogCancel disabled={isLoading}
                                       className={"text-red-500 hover:text-red-700 w-full md:w-10 lg:w-20 cursor-pointer"}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onClick}
                        disabled={isLoading}
                        className="bg-green-600  hover:bg-green-700 w-full md:w-20 lg:w-30 cursor-pointer"
                    >
                        {isLoading ? (
                            <div className={"flex flex-row gap-1"}>
                                <Spinner variant="ring" className="text-white" size={50}/>
                                <span>Updating</span>
                            </div>
                        ) : (
                            <span>Yes, I'm sure</span>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
