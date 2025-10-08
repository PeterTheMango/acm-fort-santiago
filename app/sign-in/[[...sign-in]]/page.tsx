import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-[60vh] grid place-items-center p-6">
      <SignIn />
    </div>
  );
}
