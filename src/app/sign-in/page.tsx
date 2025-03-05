import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center self-center">
          <Image
            src="/sm-full-color.png"
            alt="T-cert logo"
            width={90}
            height={90}
          />
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
