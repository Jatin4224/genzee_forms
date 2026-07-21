import { GalleryVerticalEnd } from "lucide-react";

import { SignupForm } from "~/components/signup-form";
import { SpotlightImage } from "~/components/spotlight-image";

export default function SignupPage() {
  // `dark` scopes the dark theme tokens to this page and `auth-scope` pushes the
  // surface to true black, so the form side matches the image side.
  return (
    <div className="dark auth-scope grid min-h-svh bg-background text-foreground lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            zenkaiForm
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs ">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-background lg:block">
        <SpotlightImage
          src="https://plus.unsplash.com/premium_photo-1750058547530-698e55c9a96d?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Image"
          className="brightness-[0.44]"
        />
      </div>
    </div>
  );
}
