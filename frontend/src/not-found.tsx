import { Link } from "react-router";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-5 items-center">
      <h2 className="text-2xl font-bold">Not Found</h2>
      <p>Sorry, we could not find this page</p>
      <Link className="btn btn-primary shadow text-sm" to="/">
        Return Home
      </Link>
    </div>
  );
}
