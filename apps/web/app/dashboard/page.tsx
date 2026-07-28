import { redirect } from "next/navigation";

export default function Page() {
  //the dashboard home is the forms list
  redirect("/dashboard/forms");
}
