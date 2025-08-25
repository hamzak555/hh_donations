import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-primary/20 group-[.toaster]:shadow-lg [&>[data-icon]]:text-primary",
          error:
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-destructive/20 group-[.toaster]:shadow-lg [&>[data-icon]]:text-destructive",
          info:
            "group-[.toaster]:bg-card group-[.toaster]:text-card-foreground group-[.toaster]:border-primary/20 group-[.toaster]:shadow-lg [&>[data-icon]]:text-primary",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }