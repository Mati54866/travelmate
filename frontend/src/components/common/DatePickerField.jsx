import DatePicker from "react-datepicker";

const DatePickerField = ({ selected, onChange, includeDates = [], minDate = new Date() }) => (
  <DatePicker
    selected={selected}
    onChange={onChange}
    includeDates={includeDates.map((value) => new Date(value))}
    minDate={minDate}
    onChangeRaw={(event) => event.preventDefault()}
    readOnly
    placeholderText="Select a date"
    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-500"
  />
);

export default DatePickerField;
