export function Footer() {
  return (
    <footer className="border-t bg-gradient-to-r from-gray-50/30 to-maroon-50/30 dark:from-gray-950/20 dark:to-maroon-950/20 flex-shrink-0">
      <div className="flex h-14 items-center justify-center px-4 min-w-0">
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-semibold bg-gradient-to-r from-black to-maroon-700 dark:from-white dark:to-maroon-200 bg-clip-text text-transparent">
            SX Tools
          </span>
          {" "}© {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}

