import Instructions from "./components/instructions";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] min-h-screen px-8 py-12 pb-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col">
        <h2 className="text-6xl font-bold mt-28 leading-[60px]">La forma mas fácil <br /> de llevar registro de tu negocio</h2>
        <div className="flex justify-center mt-36">
          <svg 
            className="w-12 h-12 animate-[bounce_2s_infinite] text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
        <div>
          <Instructions />
        </div>
        <form>
          <input aria-label="full name"></input>
          <input aria-label="email"></input>
          <input aria-label="type"></input>
        </form>
      </main>

    </div>
  );
}
