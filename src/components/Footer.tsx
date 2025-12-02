import { GraduationCap, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">AlumniHub</span>
            </div>
            <p className="text-muted-foreground max-w-md mb-4">
              Connecting university communities worldwide. Build your network, grow your career, 
              and give back to your alma mater.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted hover:bg-primary transition-smooth flex items-center justify-center group"
              >
                <Linkedin className="w-5 h-5 text-muted-foreground group-hover:text-white transition-smooth" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted hover:bg-primary transition-smooth flex items-center justify-center group"
              >
                <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-white transition-smooth" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted hover:bg-primary transition-smooth flex items-center justify-center group"
              >
                <Facebook className="w-5 h-5 text-muted-foreground group-hover:text-white transition-smooth" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-lg bg-muted hover:bg-primary transition-smooth flex items-center justify-center group"
              >
                <Instagram className="w-5 h-5 text-muted-foreground group-hover:text-white transition-smooth" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Features</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Universities</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Events</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Groups</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-foreground mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">About</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Privacy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 AlumniHub. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Terms</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;