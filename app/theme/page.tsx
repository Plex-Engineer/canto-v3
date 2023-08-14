import Toggle from "@/components/toggle";

export default function Theme() {
  // has a checkbox to toggle between light and dark mode
  return (
    <div className="flex flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold text-center">Welcome to Canto-v3</h1>
      <div className="flex flex-row items-center justify-between">
        <label className="flex items-center justify-between">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-gray-600"
          />
          <span className="ml-2 text-gray-700">Dark Mode</span>
        </label>
        <Toggle />
      </div>
    </div>
  );
}
