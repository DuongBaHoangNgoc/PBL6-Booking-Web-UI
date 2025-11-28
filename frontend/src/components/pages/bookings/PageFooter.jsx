export function PageFooter() {
  return (
    <footer className="bg-card px-6 py-4 text-xs text-muted-foreground p-6">
      <div className="flex items-center justify-between">
        <p>&copy; 2025 Peterdraw</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground transition">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-foreground transition">
            Terms and conditions
          </a>
          <a href="#" className="hover:text-foreground transition">
            Contact
          </a>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-foreground transition">
            Help
          </a>
          <a href="#" className="hover:text-foreground transition">
            Twitter
          </a>
          <a href="#" className="hover:text-foreground transition">
            Instagram
          </a>
          <a href="#" className="hover:text-foreground transition">
            YouTube
          </a>
          <a href="#" className="hover:text-foreground transition">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
