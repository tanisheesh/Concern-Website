import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Youtube } from 'lucide-react';
import { ConcernLogo } from './logo';

const XLogo = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-6 w-6"
      aria-label="X formerly Twitter"
    >
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.875 11.633Z" />
    </svg>
  );

export default function Footer() {
  return (
    <footer className="bg-secondary text-muted-foreground">
      <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          
          {/* Logo + Social - full width on mobile */}
          <div className="col-span-2 flex flex-col items-center md:col-span-1 md:items-start">
            <ConcernLogo className="mb-3 text-3xl"/>
            <p className="text-xs text-center md:text-left md:text-sm">
              A Non-Governmental Organisation (NGO) working in the field of addiction - rehabilitation.
            </p>
            <div className="mt-3 flex justify-center space-x-3 md:justify-start">
              <Link href="https://www.facebook.com/share/1CeEcv2GzZ/" target="_blank" rel="noopener noreferrer" aria-label="Facebook page for CONCERN" className="text-muted-foreground hover:text-[#1877F2] transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://x.com/ConcernRehab?t=ivclDgERWan4iWRvHqarwg&s=09" target="_blank" rel="noopener noreferrer" aria-label="X page for CONCERN" className="text-muted-foreground hover:text-black transition-colors">
                <XLogo />
              </Link>
              <Link href="https://www.instagram.com/concern.rehab" target="_blank" rel="noopener noreferrer" aria-label="Instagram page for CONCERN" className="text-muted-foreground hover:text-[#E4405F] transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://www.linkedin.com/company/concern-rehab" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn page for CONCERN" className="text-muted-foreground hover:text-[#0A66C2] transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="https://www.youtube.com/@whereyoudiscoverchange" target="_blank" rel="noopener noreferrer" aria-label="Youtube channel for CONCERN" className="text-muted-foreground hover:text-[#FF0000] transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Registered Office */}
          <div className="flex flex-col items-start">
            <h3 className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider md:text-sm">Registered Office</h3>
            <address className="not-italic text-xs md:text-sm">
              <p>CONCERN, Plot No 60, First Cross Street, Kanakadhara Nagar, Valasaravakkam, Chennai - 600 087.</p>
            </address>
          </div>

          {/* Rehab Centre */}
          <div className="flex flex-col items-start">
            <h3 className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider md:text-sm">Rehab Centre</h3>
            <address className="space-y-1 not-italic text-xs md:text-sm">
              <p>CONCERN, Zonta Resource Centre, No.5, 3rd Street, Manikam Nagar, Noothancheri, Madambakam, Chennai - 600 126.</p>
              <a href="tel:04446865176" className="flex items-center hover:text-primary transition-colors mt-1">
                <Phone className="mr-2 h-3 w-3 shrink-0 text-primary md:h-4 md:w-4" />
                <span>044 46865176</span>
              </a>
            </address>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-start">
            <h3 className="mb-2 text-xs font-semibold text-foreground uppercase tracking-wider md:text-sm">Contact</h3>
            <div className="space-y-1 text-xs md:text-sm">
              <a href="mailto:concernrehab@gmail.com" className="flex items-center hover:text-primary transition-colors">
                <Mail className="mr-2 h-3 w-3 shrink-0 text-primary md:h-4 md:w-4" />
                <span>concernrehab@gmail.com</span>
              </a>
              <a href="tel:+919840800816" className="flex items-center hover:text-primary transition-colors">
                <Phone className="mr-2 h-3 w-3 shrink-0 text-primary md:h-4 md:w-4" />
                <span>+91 9840800816</span>
              </a>
            </div>
          </div>

        </div>
        <div className="mt-6 border-t pt-4 text-center text-xs md:text-sm">
          <p>&copy; {new Date().getFullYear()} CONCERN. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
