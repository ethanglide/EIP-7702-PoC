import { Link } from "react-router";

export default function Navbar() {
  return (
    <div className="navbar justify-between">
      <Link to="/" className="btn btn-ghost btn-xl">
        EIP-7702 PoC
      </Link>
    </div>
  );
}
