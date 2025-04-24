export default function Footer() {
    return (
        <footer className="w-full border-t border-foreground/10 mt-auto">
            <div className="container mx-auto px-4 py-4 flex justify-center">
                <a 
                    href="https://github.com/oleksiy-korniychuk/dm-intelligence" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                    About
                </a>
            </div>
        </footer>
    );
}