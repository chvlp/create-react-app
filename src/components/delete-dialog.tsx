import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {Trash2} from "lucide-react"
import {Spinner} from "@/components/ui/shadcn-io/spinner"

export interface SectionDialogProps {
    isOpen: boolean
    isLoading?: boolean
    onClose: () => void
    onClick: () => void
}

export function DeleteDialog({
                                 isOpen,
                                 isLoading = false,
                                 onClose,
                                 onClick,
                             }: SectionDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
            <AlertDialogContent className="sm:max-w-md rounded-2xl">
                <div className="mx-auto mt-2 mb-3 flex h-22 w-22 items-center justify-center rounded-full bg-muted">
                    <Trash2 className="h-12 w-12 text-red-500"/>
                </div>

                <AlertDialogHeader className="space-y-2">
                    <AlertDialogTitle className="text-center">
                        Are you sure you want to delete this data?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center">
                        This action is irreversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="sm:justify-center gap-2">
                    <AlertDialogCancel disabled={isLoading}
                                       className={" w-full md:w-10 lg:w-20 cursor-pointer"}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onClick}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 w-full md:w-20 lg:w-30 cursor-pointer"
                    >
                        {isLoading ? (
                            <div className={"flex flex-row gap-1"}>
                                <Spinner variant="ring" className="text-white" size={50}/>
                                <span>Deleting</span>
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
