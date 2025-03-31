import { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

const argTypes = ["address", "bool", "bytes", "string", "uint256"];

interface CallArg {
  name: string;
  type: string;
  value: string;
}

interface Call {
  to: string;
  value: number;
  functionName: string;
  args: CallArg[];
}

export default function Batching() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [sponsorMnemonic, setSponsorMnemonic] = useState<string>("");

  function setCall(index: number) {
    return (call: Call) => {
      const newCalls = [...calls];
      newCalls[index] = call;
      setCalls(newCalls);
    };
  }

  function removeCall(index: number) {
    return () => {
      const newCalls = [...calls];
      newCalls.splice(index, 1);
      setCalls(newCalls);
    };
  }

  function addCall() {
    setCalls([...calls, { to: "", value: 0, functionName: "", args: [] }]);
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Batch Calls and Sponsors</h2>
      <p>Insert some explanation about batch calls and sponsors here.</p>
      <h3 className="text-xl font-bold">Sponsor (Optional)</h3>
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Sponsor Mnemonic</legend>
        <input
          type="text"
          value={sponsorMnemonic}
          onChange={(e) => setSponsorMnemonic(e.target.value)}
          className="input"
          placeholder="Sponsor Mnemonic"
        />
      </fieldset>
      <div className="flex items-center gap-6">
        <h3 className="text-xl font-bold">Contract Calls</h3>
        <div className="tooltip tooltip-primary" data-tip="Add Call">
          <button
            className="btn btn-primary btn-circle btn-sm"
            onClick={addCall}
          >
            <FiPlus className="w-5 h-5" />
          </button>
        </div>
      </div>
      <ul className="list max-h-[35rem] overflow-y-auto overflow-x-hidden bg-base-200 rounded-xl shadow-lg">
        {calls.map((call, index) => (
          <CallForm
            key={index}
            call={call}
            setCall={setCall(index)}
            removeCall={removeCall(index)}
          />
        ))}
      </ul>
    </div>
  );
}

function CallForm({
  call,
  setCall,
  removeCall,
}: {
  call: Call;
  setCall: (call: Call) => void;
  removeCall: () => void;
}) {
  function addArg() {
    setCall({
      ...call,
      args: [...call.args, { name: "", type: "", value: "" }],
    });
  }

  function setArg(index: number) {
    return (arg: CallArg) => {
      const newArgs = [...call.args];
      newArgs[index] = arg;
      setCall({ ...call, args: newArgs });
    };
  }

  function removeArg(index: number) {
    return () => {
      const newArgs = [...call.args];
      newArgs.splice(index, 1);
      setCall({ ...call, args: newArgs });
    };
  }

  return (
    <li className="list-row">
      <div className="flex flex-col gap-2 list-col-grow">
        <div className="flex justify-between items-baseline">
          <div className="flex gap-4 items-baseline">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">To</legend>
              <input
                type="text"
                value={call.to}
                onChange={(e) => setCall({ ...call, to: e.target.value })}
                className="input"
                placeholder="To address"
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Value</legend>
              <input
                type="number"
                value={call.value}
                onChange={(e) =>
                  setCall({ ...call, value: parseInt(e.target.value) })
                }
                className="input"
                placeholder="Value"
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Function Name</legend>
              <input
                type="text"
                value={call.functionName}
                onChange={(e) =>
                  setCall({ ...call, functionName: e.target.value })
                }
                className="input"
                placeholder="Function Name"
              />
            </fieldset>
            <div className="tooltip tooltip-success" data-tip="Add Argument">
              <button
                className="btn btn-success btn-circle btn-sm"
                onClick={addArg}
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="tooltip tooltip-error" data-tip="Remove Call">
            <button className="btn btn-error btn-circle" onClick={removeCall}>
              <FiTrash2 />
            </button>
          </div>
        </div>
        {call.args.length > 0 && (
          <div className="flex flex-col pl-20">
            <h4 className="font-bold">Arguments</h4>
            <ul className="list">
              {call.args.map((arg, index) => (
                <ArgForm
                  key={index}
                  arg={arg}
                  setArg={setArg(index)}
                  removeArg={removeArg(index)}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
}

function ArgForm({
  arg,
  setArg,
  removeArg,
}: {
  arg: CallArg;
  setArg: (arg: CallArg) => void;
  removeArg: () => void;
}) {
  return (
    <li className="list-row items-baseline w-fit">
      <div className="list-col-grow flex gap-4 items-baseline">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Name</legend>
          <input
            type="text"
            value={arg.name}
            onChange={(e) => setArg({ ...arg, name: e.target.value })}
            className="input input-sm"
            placeholder="Name"
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Type</legend>
          <select
            value={arg.type}
            onChange={(e) => setArg({ ...arg, type: e.target.value })}
            className="input input-sm"
          >
            <option disabled selected value="">
              Arg Type
            </option>
            {argTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Value</legend>
          <input
            type="text"
            value={arg.value}
            onChange={(e) => setArg({ ...arg, value: e.target.value })}
            className="input input-sm"
            placeholder="Value"
          />
        </fieldset>
        <div className="tooltip tooltip-error" data-tip="Remove Argument">
          <button
            className="btn btn-error btn-circle btn-sm"
            onClick={removeArg}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </li>
  );
}
