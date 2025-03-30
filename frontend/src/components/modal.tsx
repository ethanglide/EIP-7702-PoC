import { ReactNode } from "react";
import { FiX } from "react-icons/fi";

export default function Modal({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <dialog id={id} className="modal">
      <form method="dialog" className="modal-backdrop">
        <button></button>
      </form>
      <div className="modal-box max-w-2xl">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            <FiX />
          </button>
        </form>
        {children}
      </div>
    </dialog>
  );
}
