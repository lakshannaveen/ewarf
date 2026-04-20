import { Settings } from "lucide-react";

const Navigationbar = () => {
  return (
    <div className="navbar flex justify-between items-center p-4 bg-gray-800 text-white">
      <div className="text-xl font-bold">My App</div>
      <div>
        <Settings className="w-6 h-6 cursor-pointer" />
      </div>
    </div>
  );
};

export default Navigationbar;
