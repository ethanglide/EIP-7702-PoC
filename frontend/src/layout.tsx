import { Outlet } from "react-router";
import Navbar from "./navbar";

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="flex justify-center pt-3">
        <div className="lg:w-3/4 w-full">{children || <Outlet />}</div>
      </div>
    </div>
  );
}
