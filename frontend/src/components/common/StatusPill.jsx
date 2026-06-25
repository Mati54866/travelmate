import { getStatusClasses } from "../../utils/format";

const StatusPill = ({ value }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(value)}`}>
    {value}
  </span>
);

export default StatusPill;
