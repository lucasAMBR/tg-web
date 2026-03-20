import { toast } from "sonner"

export const CustomToaster = {
    infoToast: (message: string) => {
        toast.info(message, {
            style: {
                '--normal-bg': 'light-dark(var(--color-sky-600), var(--color-sky-400))',
                '--normal-text': 'var(--color-white)',
                '--normal-border': 'light-dark(var(--color-sky-600), var(--color-sky-400))'
            } as React.CSSProperties
        })
    },
    warningToast: (message: string) => {
        toast.warning(message, {
            style: {
                '--normal-bg': 'light-dark(var(--color-amber-600), var(--color-amber-400))',
                '--normal-text': 'var(--color-white)',
                '--normal-border': 'light-dark(var(--color-amber-600), var(--color-amber-400))'
            } as React.CSSProperties
        })   
    },
    errorToast: (message: string) => {
        toast.error(message, {
            style: {
                '--normal-bg':
                'light-dark(var(--destructive), color-mix(in oklab, var(--destructive) 60%, var(--background)))',
                '--normal-text': 'var(--color-white)',
                '--normal-border': 'transparent'
            } as React.CSSProperties
        })
    },

    successToast: (message: string) => {
        toast.success(message, {
            style: {
                '--normal-bg': 'light-dark(var(--color-green-600), var(--color-green-600))',
                '--normal-text': 'var(--color-white)',
                '--normal-border': 'light-dark(var(--color-green-600), var(--color-green-600))'
            } as React.CSSProperties
        })
    }
}