
export default function Upload() {
  return (
    <div className="overflow-hidden flex flex-col bg-softwhite dark:bg-crowblack text-crowblack dark:text-arcadewhite transition-colors duration-300">
      <div className="flex border border-gray-300 rounded-lg overflow-hidden min-h-[20rem]">
        
        {/* Left Section: Upload Resume */}
        <div className="w-1/2 p-6 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800">
          <label
            htmlFor="fileUpload"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Upload Resume
          </label>
          <input
            type="file"
            id="fileUpload"
            className="block w-full text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2 cursor-pointer"
          />
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-gray-300 dark:bg-gray-600" />

        {/* Right Section: Job Description */}
        <div className="w-1/2 p-6 bg-white dark:bg-gray-900">
          <label
            htmlFor="textInput"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Job Description
          </label>
          <textarea
            id="textInput"
            className="relative w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 resize-none"
            placeholder="Enter Job Description or Notes here..."
          />
        </div>
      </div>
    </div>
  );
}
