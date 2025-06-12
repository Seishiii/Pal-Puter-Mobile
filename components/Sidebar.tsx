import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import HeadingItem from "@/components/HeadingItem";
import Image from "next/image";
import Link from "next/link";

const Sidebar = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <Menu className="text-white hover:cursor-pointer" />
      </SheetTrigger>
      <SheetContent className="p-0 z-[100]" side="left">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col flex h-full">
          <Link href="/">
            <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
              <Image
                src="/mascot.PNG"
                height={40}
                width={40}
                alt="Pal-Puter Mascot"
                className="shrink-0"
              />
              <h1 className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-purple-500 to-sky-500 bg-clip-text text-transparent">
                Pal-Puter
              </h1>
            </div>
          </Link>

          {/* Navigation - Better spacing */}
          <div className="flex flex-col gap-y-2 flex-1">
            <HeadingItem
              label="Performance"
              href="/performance"
              iconSrc="/performance.svg"
            />
            <HeadingItem
              label="Certificates"
              href="/certificates"
              iconSrc="/certificates.svg"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;
